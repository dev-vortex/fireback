export {
    initApp,
    exportFunctions,
    callableFunction,
    cronFunction,
    httpsFunction,
} from './firebase'

// Initializing global cache variable
global.firebackGlobalCache = {
    modules: {} as Record<string, unknown>,
    values: {} as Record<string, unknown>,
}
