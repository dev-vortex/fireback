export interface BusboyFile {
    fieldName: string
    buffer: NodeJS.ReadableStream | Buffer | undefined
    filename?: string
    originalName?: string
    fileExtension?: string
    destination?: string
    encoding?: string
    mimeType?: string
    size: number
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user: Record<string, unknown>
            files: BusboyFile[]
            rawBody: any
        }
    }
}
