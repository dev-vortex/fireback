import * as functions from 'firebase-functions'
import admin from 'firebase-admin'
import { Request, Response, NextFunction } from 'express'

function log(level: string, ...args: any[]) {
    const preventLogWhenIn = ['test', 'prod', 'production']
    const toPass = Array.from(args).slice(1)
    if (
        process.env.NODE_ENV &&
        preventLogWhenIn.indexOf(process.env.NODE_ENV) < 0
    ) {
        switch (level) {
            case 'log':
                console.log(...toPass)
                break

            case 'error':
                console.error(...toPass)
                break
        }
    }
}

/**
 * Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
 * The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
 * `Authorization: Bearer <Firebase ID Token>`.
 * when decoded successfully, the ID Token content will be added as `req.user`.
 * @see {@link https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js}
 * @memberof Helper.Security
 *
 * @param {Object} req
 *        Request object from express
 * @param {Object} res
 *        Response object from express
 * @param {Function} next
 *        Callback for calling the next middleware
 *
 */
export const securityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    log('log', 'Check if request is authorized with Firebase ID token')

    // TODO: This should not exist in production for safety
    if (
        process.env.FUNCTIONS_EMULATOR &&
        !req.headers.authorization &&
        !(req.cookies && req.cookies.__session)
    ) {
        req.user = functions.config().authUser
        log('log', 'EMULATOR MODE DETECTED: User Mocked To', req.user)
        next()
        return
    }

    if (
        (!req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer ')) &&
        !(req.cookies && req.cookies.__session)
    ) {
        log(
            'error',
            'No Firebase ID token was passed as a Bearer token in the Authorization header.',
            'Make sure you authorize your request by providing the following HTTP header:',
            'Authorization: Bearer <Firebase ID Token>',
            'or by passing a "__session" cookie.',
        )
        res.status(401).send('Unauthorized')
        return
    }

    let idToken
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        log('log', 'Found "Authorization" header')
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else if (req.cookies) {
        log('log', 'Found "__session" cookie')
        // Read the ID Token from cookie.
        idToken = req.cookies.__session
    } else {
        // No cookie
        res.status(401).send('Unauthorized')
        return
    }

    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken)
        log('log', 'ID Token correctly decoded', decodedIdToken)
        req.user = decodedIdToken
        next()
        return
    } catch (error) {
        log('error', 'Error while verifying Firebase ID token:', error)
        res.status(401).send('Unauthorized')
        return
    }
}

/**
 * Middleware for checking if the user is present and react to it
 * @memberof Helper.Security
 *
 * @param {Object} req
 *        Request object from express
 * @param {Object} res
 *        Response object from express
 * @param {Function} next
 *        Callback for calling the next middleware
 */
export const checkForUserMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (!req.user) {
        res.status(400).send('Invalid username supplied')
        return
    }
    next()
}
