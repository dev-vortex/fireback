import * as firebaseFunctions from 'firebase-functions'
import { FunctionOptionsType, RegionsType, RestServiceProvider } from '../types'

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

export const httpsFunction = (
    service: RestServiceProvider,
    providedOptions?: FunctionOptionsType | Record<string, unknown>,
): firebaseFunctions.HttpsFunction => {
    return callableFunction(providedOptions).https.onRequest(service)
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

export const pubSubFunction = (
    topicName: string,
    serviceMethod: (
        message: firebaseFunctions.pubsub.Message,
        context: firebaseFunctions.EventContext,
    ) => any,
    providedOptions = {},
): firebaseFunctions.CloudFunction<firebaseFunctions.pubsub.Message> =>
    callableFunction(providedOptions)
        .pubsub.topic(topicName)
        .onPublish(serviceMethod)
