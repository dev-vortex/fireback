import * as firebaseAdmin from 'firebase-admin'
import { FireBackInterface } from '~/types'
import exportFunctions, {
    callableFunction,
    cronFunction,
    restFunction,
} from '../functions'

let firebaseConfig: firebaseAdmin.AppOptions

export const init = (
    firebaseServiceConfig: firebaseAdmin.AppOptions,
): FireBackInterface | false => {
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
            restFunction,
        }
    } catch (e) {
        return false
    }
}
