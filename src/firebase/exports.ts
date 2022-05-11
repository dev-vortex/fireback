'use strict'
/**
 * Inspiration from: https://codeburst.io/organizing-your-firebase-cloud-functions-67dc17b3b0da
 * ATTENTION: Node 10 environment requires since we are using `process.env.FUNCTION_TARGET`
 */
import { ExportFunctionOptions } from '../types'
import { resolve } from 'path'
import glob from 'glob'
import camelCase from 'camelcase'
import getCallerFile from 'get-caller-file'

const getGroupStructure = (startFolder: string) => {
    const structure = startFolder.split('/')
    return structure[0] === '.' || structure[0] === ''
        ? structure.splice(1)
        : structure
}

const getGroupName = (startFolder: string) => {
    return getGroupStructure(startFolder).join('.')
}

const getFunctionName = (file: string, extension: string) => {
    const extensionSize = -1 * extension.length
    const preparedFileName = file
        .slice(0, extensionSize) // Strip off extension
        .split('/')
        .join('_')
    return camelCase(preparedFileName).replace('|', '_')
}

const getGroupPointer = (
    currentExport: Record<string, any>,
    startFolder: string,
    options?: Record<string, any>,
) => {
    let groupPointer = currentExport
    const groupStructure = getGroupStructure(
        startFolder.replace(options?.basePath ? options?.basePath : '', ''),
    )

    groupStructure.forEach(groupName => {
        if (!groupPointer[groupName as string]) {
            groupPointer[groupName] = {}
        }
        groupPointer = groupPointer[groupName]
    })
    return groupPointer
}

const findFileExtension = (filename: string, extensions: string[]) => {
    return extensions.find(extension => {
        return filename.indexOf(extension) >= 0
    })
}

const hasAppendExtension = (extension: string, lastExtensions: string[]) => {
    return !!lastExtensions.find(
        lastExtension =>
            extension.slice(-1 * lastExtension.length) === lastExtension,
    )
}

const getComposedExtensions = (extensions: string[]) => {
    const appendExtension = [`.ts`, `.js`]
    return extensions.reduce((finalList, extension) => {
        if (hasAppendExtension(extension, appendExtension)) {
            return [...finalList, extension]
        }
        const composedExtension = appendExtension.map(extAppend => {
            return `${extension}${extAppend}`
        })
        return [...finalList, ...composedExtension]
    }, [] as string[])
}

const getFiles = (extension: string[], basePath: string, folder: string) => {
    const pattern = `**/*${extension.join(',**/*')}`
    const finalPattern = extension.length > 1 ? `{${pattern}}` : pattern
    const cwd = resolve(basePath, folder)
    return glob.sync(finalPattern, {
        cwd,
        ignore: ['./node_modules/**'],
    })
}

/**
 * Exports all files that matches an extension
 *
 * @param base Folder base
 * @param folder Source folder for search
 * @param extension Extension to target
 * @param ooptions Exports objects
 */
const exportFunctions = (
    base?: string,
    folder = './api',
    extensions = [`.func`],
    options?: ExportFunctionOptions,
): Record<string, any> => {
    const composedExtensions = getComposedExtensions(extensions)
    const basePath = base || getCallerPath(getCallerFile())
    const toExport: Record<string, any> = {}
    const files = getFiles(composedExtensions, basePath, folder)

    files.forEach(file => {
        const extension = findFileExtension(file, composedExtensions)
        const groupName = getGroupName(folder)
        const groupNamePrefix = `${groupName}.`

        if (extension) {
            const functionName = getFunctionName(file, extension)
            if (
                !process.env.FUNCTION_TARGET ||
                process.env.FUNCTION_TARGET === functionName ||
                process.env.FUNCTION_TARGET ===
                    `${groupNamePrefix}${functionName}`
            ) {
                const mod = require(resolve(basePath, folder, file))
                const asExp = getGroupPointer(
                    toExport,
                    options?.functionGroupPath || folder,
                )
                asExp[functionName] = mod.default || mod
            }
        }
    })
    return toExport
}

const getCallerPath = (callerFile: string) =>
    callerFile.split('/').slice(0, -1).join('/')

export default exportFunctions
