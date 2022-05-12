import * as firebaseAdmin from 'firebase-admin'
import { FireBackInterface } from '~/types'
import { exportFunctions } from './index'
import { callableFunction, cronFunction, httpsFunction } from './index'

let firebaseConfig: firebaseAdmin.AppOptions

export const init = (
    firebaseServiceConfig: firebaseAdmin.AppOptions,
): FireBackInterface => {
    if (!firebaseConfig && firebaseServiceConfig) {
        firebaseConfig = firebaseServiceConfig
    }
    // Since admin SDK can only be initialized once.
    try {
        const admin = firebaseAdmin.initializeApp(firebaseConfig)
        return {
            admin,
            exportFunctions,
            callableFunction,
            cronFunction,
            httpsFunction,
        }
    } catch (e) {
        return {
            exportFunctions,
            callableFunction,
            cronFunction,
            httpsFunction,
        }
    }
}
