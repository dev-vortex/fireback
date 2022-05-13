'use strict'
/**
 * Inspiration from: https://codeburst.io/organizing-your-firebase-cloud-functions-67dc17b3b0da
 * ATTENTION: Node 10 environment requires since we are using `process.env.FUNCTION_TARGET`
 */
import * as firebaseAdmin from 'firebase-admin'
import { resolve } from 'path'
import glob from 'glob'
import camelCase from 'camelcase'
import getCallerFile from 'get-caller-file'
import { initApp } from './init'
import { ExportFunctionOptions } from '../types'

const normalizeName = (name: string): string => {
    const preparedName = name.replace(/[\|\.]/g, '#')
    return camelCase(preparedName).replace(/\#/g, '_')
}

// const getGroupStructure = (startFolder: string) => {
//     const structure = startFolder.split('/')
//     return structure[0] === '.' || structure[0] === ''
//         ? structure.splice(1)
//         : structure
// }

// const getGroupName = (startFolder: string): string => {
//     return getGroupStructure(startFolder).join('.')
// }

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

// const getFunctionNameOld = (file: string, extension: string): string => {
//     const extensionSize = -1 * extension.length
//     const preparedFileName = file
//         .slice(0, extensionSize) // Strip off extension
//         .split('/')
//         .join('_')
//     return camelCase(preparedFileName).replace(/\|/g, '_')
// }

const getFunctionName = (file: string, extension: string): string => {
    const extensionSize = -1 * extension.length
    const preparedFileName = file
        .slice(0, extensionSize) // Strip off extension
        .split('/')
        .slice(-1)
        .join('_')
    return normalizeName(preparedFileName)
}

// const getGroupPointer_old = (
//     currentExport: Record<string, any>,
//     startFolder: string,
//     options?: Record<string, any>,
// ): Record<string, any> => {
//     let groupPointer = currentExport
//     const groupStructure = getGroupStructure(
//         startFolder.replace(options?.basePath ? options?.basePath : '', ''),
//     )

//     groupStructure.forEach(groupName => {
//         if (!groupPointer[groupName as string]) {
//             groupPointer[groupName] = {}
//         }
//         groupPointer = groupPointer[groupName]
//     })
//     return groupPointer
// }

const getGroupPointer = (
    currentExport: Record<string, any>,
    file: string,
    options?: Record<string, any>,
): Record<string, any> => {
    // console.log('getGroupPointer file', file)
    let groupPointer = currentExport
    const groupStructure = getGroupStructureFromFile(
        `${options?.functionGroupPath || ''}/${file}`,
    )
    // console.log('groupStructure', groupStructure)
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

interface IExportFunctionsPrefs {
    base?: string
    folder?: string
    extensions?: string[]
    options?: ExportFunctionOptions
    firebaseServiceConfig?: firebaseAdmin.AppOptions
}

type ExportFunctionsMethod = (
    preferences?: IExportFunctionsPrefs,
) => Record<string, any>
/**
 * Exports all files that matches an extension
 *
 * @param base Folder base
 * @param folder Source folder for search
 * @param extension Extension to target
 * @param ooptions Exports objects
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
        // console.log('file', file)
        const extension = findFileExtension(file, composedExtensions)
        // console.log('extension', extension)
        const callingGroupName = `${getGroupNameFromFile(file)}.`
        // const callingGroupNameOld = `${getGroupName(folder)}.`
        // console.log('callingGroupName', callingGroupName)
        // console.log('callingGroupNameOld', callingGroupNameOld)

        if (extension) {
            // const functionNameOld = getFunctionNameOld(file, extension)
            const functionName = getFunctionName(file, extension)
            // console.log('functionNameNew', functionNameNew)
            // console.log('functionName', functionName)
            // console.log(
            //     'fullCallingFunctionNew',
            //     `${callingGroupName}${functionNameNew}`,
            // )
            // console.log(
            //     'fullCallingFunction',
            //     `${callingGroupNameOld}${functionName}`,
            // )
            if (
                !process.env.FUNCTION_TARGET ||
                process.env.FUNCTION_TARGET === functionName ||
                // process.env.FUNCTION_TARGET ===
                //     `${callingGroupNameOld}${functionNameOld}`
                process.env.FUNCTION_TARGET ===
                    `${callingGroupName}${functionName}`
            ) {
                const mod = require(resolve(basePath, folder, file))
                // const asExp = getGroupPointer_old(
                //     toExport,
                //     options?.functionGroupPath || '',
                // )
                // asExp[functionNameOld] = mod.default || mod
                const asExp = getGroupPointer(toExport, file, options || {})
                asExp[functionName] = mod.default || mod
            }
        }
    })
    return toExport
}

const getCallerPath = (callerFile: string) =>
    callerFile.split('/').slice(0, -1).join('/')
