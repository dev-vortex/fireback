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

interface GlobalCacheManager {
    setGlobalChacheValue: (name: string, value: unknown) => void
    removeGlobalChache: (name: string) => boolean
    getGlobalCache: (name: string) => unknown
}
