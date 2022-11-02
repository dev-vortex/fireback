import { GlobalCacheManager } from '~/types'

global.firebackGlobalCache = {
    modules: {} as Record<string, unknown>,
    values: {} as Record<string, unknown>,
}

const setGlobalChacheValue = (name: string, value: unknown): void => {
    firebackGlobalCache.values[name] = value
}

const removeGlobalChache = (name: string): boolean => {
    if (firebackGlobalCache.values[name]) {
        firebackGlobalCache.values[name] = undefined
        delete firebackGlobalCache.values[name]
        return true
    }
    return false
}

const getGlobalCache = (name: string): unknown => {
    return firebackGlobalCache.values[name] || undefined
}

/**
 * Provides functionality to manage firebase global cache variables
 * ATT: Please use it wisely since it can exhaust instance resources (costs may incurr)
 * @see https://firebase.google.com/docs/functions/tips#use_global_variables_to_reuse_objects_in_future_invocations
 */
export const getGlobalCacheManager = (): GlobalCacheManager => ({
    setGlobalChacheValue,
    removeGlobalChache,
    getGlobalCache,
})
