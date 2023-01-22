'use strict'
/**
 * Inspiration from: https://codeburst.io/organizing-your-firebase-cloud-functions-67dc17b3b0da
 * ATTENTION: Node 10 environment requires since we are using `process.env.FUNCTION_TARGET`
 */
import { resolve } from 'path'
import glob from 'glob'
import camelCase from 'camelcase'
import getCallerFile from 'get-caller-file'
import { initApp } from './init'
import type { ExportFunctionsMethod } from '../types'

const normalizeName = (name: string): string => {
    const preparedName = name.replace(/[\|\.]/g, '#')
    return camelCase(preparedName).replace(/\#/g, '_')
}

const getGroupStructureFromFile = (file: string) => {
    const structure = file.split('/')
    return (
        structure[0] === '.' || structure[0] === ''
            ? structure.slice(1, -1)
            : structure.slice(0, -1)
    ).map(normalizeName)
}

const getGroupNameFromFile = (file: string): string => {
    return getGroupStructureFromFile(file).join('.')
}

const getFunctionName = (file: string, extension: string): string => {
    const extensionSize = -1 * extension.length
    const preparedFileName = file
        .slice(0, extensionSize) // Strip off extension
        .split('/')
        .slice(-1)
        .join('_')
    return normalizeName(preparedFileName)
}

const getGroupPointer = (
    currentExport: Record<string, any>,
    file: string,
    options?: Record<string, any>,
): Record<string, any> => {
    let groupPointer = currentExport
    const groupStructure = getGroupStructureFromFile(
        `${options?.functionGroupPath || ''}/${file}`,
    )
    groupStructure.forEach(groupName => {
        if (!groupPointer[groupName as string]) {
            groupPointer[groupName] = {}
        }
        groupPointer = groupPointer[groupName]
    })
    return groupPointer
}
const findFileExtension = (
    filename: string,
    extensions: string[],
): string | undefined => {
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

const getComposedExtensions = (extensions: string[]): string[] => {
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

const getFiles = (
    extension: string[],
    basePath: string,
    folder: string,
): string[] => {
    const pattern = `**/*${extension.join(',**/*')}`
    const finalPattern = extension.length > 1 ? `{${pattern}}` : pattern
    const cwd = resolve(basePath, folder)
    return glob.sync(finalPattern, {
        cwd,
        ignore: ['./node_modules/**'],
    })
}

const getFunctionDeploymentNumber = () => {
    return process.env.K_REVISION || 0
}

const cleanFunctionCacheIfNewVersion = (functionNameWithGroup: string) => {
    const deploymentNr = getFunctionDeploymentNumber()
    const cachedVersion = firebackGlobalCache.modules[
        functionNameWithGroup
    ] as Record<string, unknown>
    if (cachedVersion && !cachedVersion[deploymentNr]) {
        delete firebackGlobalCache.modules[functionNameWithGroup]
    }
}

const getCachedFunctionByName = (
    functionNameWithGroup: string,
    path: string,
): any => {
    const deploymentNr = getFunctionDeploymentNumber()
    const cachedVersion = firebackGlobalCache.modules[
        functionNameWithGroup
    ] as Record<string, unknown>
    if (cachedVersion && cachedVersion[deploymentNr]) {
        return cachedVersion[deploymentNr]
    } else {
        return (firebackGlobalCache.modules[functionNameWithGroup] = {
            [deploymentNr]: require(path),
        })[deploymentNr]
    }
}

/**
 * Exports all files that matches an extension
 *
 * @param base Folder base
 * @param folder Source folder for search
 * @param extension Extension to target
 * @param options Exports objects
 */
export const exportFunctions: ExportFunctionsMethod = (preferences = {}) => {
    const {
        base,
        folder = './api',
        extensions = [`.func`],
        options,
        firebaseServiceConfig,
    } = preferences
    initApp(firebaseServiceConfig)
    const composedExtensions = getComposedExtensions(extensions)
    const basePath = base || getCallerPath(getCallerFile())
    const files = getFiles(composedExtensions, basePath, folder)
    const toExport: Record<string, any> = {}
    files.forEach(file => {
        const extension = findFileExtension(file, composedExtensions)
        const callingGroupName = `${getGroupNameFromFile(file)}.`
        if (extension) {
            const functionName = getFunctionName(file, extension)
            const functionNameWithGroup = `${callingGroupName}${functionName}`
            if (
                !process.env.FUNCTION_TARGET ||
                process.env.FUNCTION_TARGET === functionName ||
                process.env.FUNCTION_TARGET === functionNameWithGroup
            ) {
                cleanFunctionCacheIfNewVersion(functionNameWithGroup)
                const mod = getCachedFunctionByName(
                    functionNameWithGroup,
                    resolve(basePath, folder, file),
                )
                const asExp = getGroupPointer(toExport, file, options || {})
                asExp[functionName] = mod.default || mod
            }
        }
    })
    return toExport
}

const getCallerPath = (callerFile: string) =>
    callerFile.split('/').slice(0, -1).join('/')
