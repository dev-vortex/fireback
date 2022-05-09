import express, { Express, Router } from 'express'
import { ProvidedOptionsType } from '../../types'

const defaultOptions: ProvidedOptionsType = {
    cors: true,
    security: true,
    mysql: false,
}
let expressService: Express | undefined

const prepareOptions = (providedOptions: ProvidedOptionsType) =>
    Object.assign(defaultOptions, providedOptions)

const originValidator =
    (origins: Array<string>) =>
    (
        origin: string,
        callback: (error: Error | null, options?: any) => void,
    ) => {
        console.log('CORS: Requesting Origin', origin) // undefined
        console.log('CORS: Allower', origins)
        if (origins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            const err = new Error('Not allowed by CORS')
            err.stack = ''
            callback(err)
        }
    }

const initMiddleware = (
    service: Express | Router,
    options: ProvidedOptionsType = {},
) => {
    if (service) {
        const corsMiddleware = require('cors')
        const cookieParserMiddleware = require('cookie-parser')
        const bodyParserMiddleware = require('body-parser')
        const {
            multipartFormDataMiddleware,
        } = require('./middleware/multipartFormData')
        const {
            securityMiddleware,
            checkForUserMiddleware,
        } = require('./middleware/security')

        // PREPARE
        // ==============================================
        const { cors, security, allowedOrigins } = prepareOptions(options)

        // INSTALL MIDDLEWARE
        // ==============================================
        if (cors) {
            if (allowedOrigins) {
                service.use(
                    corsMiddleware({ origin: originValidator(allowedOrigins) }),
                )
            } else {
                service.use(corsMiddleware({ origin: true }))
            }
        }

        service.use(cookieParserMiddleware())
        service.use(multipartFormDataMiddleware)
        service.use(bodyParserMiddleware.json())

        if (security) {
            service.use(securityMiddleware)
            service.use(checkForUserMiddleware)
        }

        // if (mysql) {
        //     service.use(mysqlMiddleware)
        // }
    }

    return service
}

export const initApp = (options: ProvidedOptionsType = {}): Express => {
    if (!expressService) {
        // INIT SERVICE
        // ==============================================
        expressService = express()
        expressService = initMiddleware(expressService, options) as Express
    }

    return expressService
}

export const getApp = (): Express | undefined => expressService

const use = (path = '/', feature: Router) => {
    if (expressService) {
        expressService.use(path, feature)
    }
}

export const initRoute = (
    path = '/',
    options = {},
    initAppOptions: ProvidedOptionsType = {},
): Router => {
    initApp(initAppOptions)
    let featureRouter = express.Router({ mergeParams: true })
    featureRouter = initMiddleware(featureRouter, options) as Router
    use(path, featureRouter)
    return featureRouter
}
