import * as firebaseFunctions from 'firebase-functions'
import { PathParams, IRoute } from 'express-serve-static-core'

type ExportFunctionOptions = {
    basePath?: string
    functionGroupPath?: string
}

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
    infer ElementType
>
    ? ElementType
    : never

type RegionsType = ElementType<typeof firebaseFunctions.SUPPORTED_REGIONS>
type FunctionOptionsRegionType = {
    functionRegion: RegionsType
}
type FunctionOptionsTimeZone = {
    functionTimeZone: string
}

type FunctionOptionsType = FunctionOptionsRegionType & FunctionOptionsTimeZone

type ProvidedOptionsType = {
    cors?: boolean
    allowedOrigins?: Array<string>
    security?: boolean
    mysql?: boolean
}

type RestServiceProvider = (
    req: firebaseFunctions.https.Request,
    resp: firebaseFunctions.Response<any>,
) => void | Promise<void>

interface RestFunctionInterface {
    route: (prefix: PathParams) => IRoute
    getFunctionExport: () => firebaseFunctions.HttpsFunction
}

interface FireBackInterface {
    admin: firebaseAdmin.app.App
    exportFunctions: (
        base?: string,
        folder?: string,
        extension?: string,
        options?: ExportFunctionOptions | undefined,
    ) => Record<string, any>
    callableFunction: (
        providedOptions?: FunctionOptionsType | Record<string, unknown>,
    ) => FunctionBuilder
    cronFunction: (
        timer: string,
        serviceMethod: (context: EventContext) => any,
        providedOptions?: Record<string, any>,
    ) => CloudFunction<unknown>
    restFunction: (
        path?: string,
        providedOptions?: Record<string, unknown> | FunctionOptionsType,
        initAppOptions?: ProvidedOptionsType,
    ) => RestFunctionInterface
}
