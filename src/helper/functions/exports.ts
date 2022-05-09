'use strict'
/**
 * Inspiration from: https://codeburst.io/organizing-your-firebase-cloud-functions-67dc17b3b0da
 * ATTENTION: Node 10 environment requires since we are using `process.env.FUNCTION_TARGET`
 */
import { ExportFunctionOptions } from '../../types'
import { resolve } from 'path'
import glob from 'glob'
import camelCase from 'camelcase'

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

/**
 * Exports all files that matches an extension
 *
 * @param base Folder base
 * @param folder Source folder for search
 * @param extension Extension to target
 * @param ooptions Exports objects
 */
const exportFunctions = (
    base: string = __dirname,
    folder = './api',
    extension = '.func.js',
    options?: ExportFunctionOptions,
): Record<string, any> => {
    const toExport: Record<string, any> = {}
    const files = glob.sync(`./**/*${extension}`, {
        cwd: resolve(base, folder),
        ignore: './node_modules/**',
    })

    files.forEach(file => {
        const groupName = getGroupName(folder)
        const groupNamePrefix = `${groupName}.`
        const functionName = getFunctionName(file, extension)

        if (
            !process.env.FUNCTION_TARGET ||
            process.env.FUNCTION_TARGET === functionName ||
            process.env.FUNCTION_TARGET === `${groupNamePrefix}${functionName}`
        ) {
            const mod = require(resolve(base, folder, file))
            const asExp = getGroupPointer(
                toExport,
                options?.functionGroupPath || folder,
            )
            asExp[functionName] = mod.default || mod
        }
    })
    return toExport
}

export default exportFunctions
