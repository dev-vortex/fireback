import * as firebaseAdmin from 'firebase-admin'
import * as firebaseFunctions from 'firebase-functions'

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

type RestServiceProvider = (
    req: firebaseFunctions.https.Request,
    resp: firebaseFunctions.Response<any>,
) => void | Promise<void>

interface FireBackInterface {
    admin?: firebaseAdmin.app.App
    exportFunctions: (
        base?: string,
        folder?: string,
        extension?: string[],
        options?: ExportFunctionOptions | undefined,
    ) => Record<string, any>
    callableFunction: (
        providedOptions?: FunctionOptionsType | Record<string, unknown>,
    ) => firebaseFunctions.FunctionBuilder
    cronFunction: (
        timer: string,
        serviceMethod: (context: firebaseFunctions.EventContext) => any,
        providedOptions?: Record<string, any>,
    ) => firebaseFunctions.CloudFunction<unknown>
    httpsFunction: (
        service: RestServiceProvider,
        providedOptions?: FunctionOptionsType | Record<string, unknown>,
    ) => firebaseFunctions.HttpsFunction
}
