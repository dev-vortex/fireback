import { GlobalCacheManager } from '~/types'

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
    return firebackGlobalCache.values[name]
}

/**
 * Provides functionality to manage firebase global cache variables
 * ATT: Please use it wisely since it can exhaust instance resources (costs may incurr)
 * @see https://firebase.google.com/docs/functions/tips#use_global_variables_to_reuse_objects_in_future_invocations
 */
export const getGlobalCacheManager = (): GlobalCacheManager => ({
    set: setGlobalChacheValue,
    remove: removeGlobalChache,
    get: getGlobalCache,
})
