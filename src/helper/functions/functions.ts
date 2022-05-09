import { getApp, initRoute } from '../express'
import * as firebaseFunctions from 'firebase-functions'
import {
    FunctionOptionsType,
    ProvidedOptionsType,
    RegionsType,
    RestFunctionInterface,
    RestServiceProvider,
} from '../../types'
export { admin } from '../firebase/init'

export const defaultRegion: Readonly<RegionsType> = 'europe-west3' // TODO: allow config for default and specif by providing options
export const defaultTimeZone: Readonly<string> = 'America/New_York' // TODO: allow config for default and specif by providing options

const firebaseDefaultOptions: FunctionOptionsType = {
    functionRegion: defaultRegion,
    functionTimeZone: defaultTimeZone,
}

const prepareOptions = (
    providedOptions: FunctionOptionsType | Record<string, unknown>,
) => Object.assign(firebaseDefaultOptions, providedOptions)

export const callableFunction = (
    providedOptions: FunctionOptionsType | Record<string, unknown> = {},
): firebaseFunctions.FunctionBuilder =>
    firebaseFunctions.region(prepareOptions(providedOptions).functionRegion)

export const restFunction = (
    path = '',
    providedOptions: FunctionOptionsType | Record<string, unknown> = {},
    initAppOptions: ProvidedOptionsType = {},
): RestFunctionInterface => {
    const router = initRoute(path, providedOptions, initAppOptions)
    return {
        route: router.route,
        getFunctionExport: () => {
            const currentApp = getApp() as RestServiceProvider | undefined
            if (currentApp) {
                return callableFunction(providedOptions).https.onRequest(
                    currentApp,
                )
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return ((req, resp) => {
                return
            }) as firebaseFunctions.HttpsFunction
        },
    }
}

export const cronFunction = (
    timer: string,
    serviceMethod: (context: firebaseFunctions.EventContext) => any,
    providedOptions = {},
): firebaseFunctions.CloudFunction<unknown> =>
    callableFunction(providedOptions)
        .pubsub.schedule(timer)
        .timeZone(prepareOptions(providedOptions).functionTimeZone)
        .onRun(serviceMethod)
