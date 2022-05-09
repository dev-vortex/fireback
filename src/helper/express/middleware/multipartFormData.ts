import { Request, Response, NextFunction } from 'express'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { BusboyFile } from './types'

// Node.js doesn't have a built-in multipart/form-data parsing library.
// Instead, we can use the 'busboy' library from NPM to parse these requests.
// NOTE: Do not try Multer library Cloud Functions introduced a breaking middleware for Multer
// const Busboy = require('busboy')
import Busboy from 'busboy'

/**
 * Parses a `multipart/form-data` upload request
 *
 * `req.body` will contain all text fields
 *
 * `req.files` will contain an array of file objects
 * ```
 * {
 *     fieldName: 'image',  // String - name of the field used in the form
 *     originalName,        // String - original filename of the uploaded image
 *     encoding,            // String - encoding of the image (e.g. "7bit")
 *     mimeType,            // String - MIME type of the file (e.g. "image/jpeg")
 *     buffer,              // Buffer - buffer containing binary data
 *     size,                // Number - size of buffer in bytes
 * }
 * ```
 * @param req Request object from express
 * @param res Response object from express
 * @param next Callback for calling the next middleware
 */
export const multipartFormDataMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (
        ['POST', 'PUT'].indexOf(req.method) < 0 ||
        !req.is('multipart/form-data')
    ) {
        // eslint-disable-next-line callback-return
        next()
        return
    }

    // See https://cloud.google.com/functions/docs/writing/http#multipart_data
    const busboy = Busboy({
        headers: req.headers,
        limits: {
            // Cloud functions impose this restriction anyway
            fileSize: 10 * 1024 * 1024,
        },
    })

    const fields: Record<string, unknown> = {}
    const files: BusboyFile[] = []
    const fileWrites: Promise<unknown>[] = []
    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    const tmpdir = os.tmpdir()

    busboy.on('field', (key, value) => {
        // You could do additional deserialization logic here, values will just be
        // strings
        fields[key] = value
    })

    // busboy.on('file', (fieldName, file, filename, encoding, mimetype) => {
    busboy.on('file', (fieldName, file, info) => {
        const { filename, encoding, mimeType } = info
        const filepath = path.join(tmpdir, filename)
        const fileParts = filename.split('.')
        const fileExt = fileParts[fileParts.length - 1]

        const writeStream = fs.createWriteStream(filepath)
        file.pipe(writeStream)

        fileWrites.push(
            new Promise((resolve, reject) => {
                file.on('end', () => writeStream.end())
                writeStream.on('finish', () => {
                    // eslint-disable-next-line consistent-return
                    fs.readFile(filepath, (err, buffer) => {
                        const size = Buffer.byteLength(buffer)
                        if (err) {
                            return reject(err)
                        }
                        files.push({
                            fieldName,
                            originalName: filename,
                            fileExtension: fileExt,
                            encoding,
                            mimeType: mimeType,
                            buffer,
                            size,
                        } as BusboyFile)

                        try {
                            fs.unlinkSync(filepath)
                        } catch (error) {
                            return reject(error)
                        }

                        resolve(undefined)
                    })
                })
                writeStream.on('error', reject)
            }),
        )
    })

    // busboy.on('finish', () => {
    busboy.on('close', () => {
        Promise.all(fileWrites)
            .then(() => {
                req.body = fields
                req.files = files
                next()
            })
            .catch(next)
    })

    busboy.end(req.rawBody)
}
