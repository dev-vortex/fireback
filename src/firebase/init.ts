import * as firebaseAdmin from 'firebase-admin'

let firebaseConfig: firebaseAdmin.AppOptions

const prepareConfig = (firebaseServiceConfig?: firebaseAdmin.AppOptions) => {
    firebaseConfig = firebaseConfig || firebaseServiceConfig
    if (!firebaseConfig) {
        return false
    }
    return true
}

export const initApp = (
    firebaseServiceConfig?: firebaseAdmin.AppOptions,
): firebaseAdmin.app.App | boolean => {
    if (prepareConfig(firebaseServiceConfig)) {
        try {
            return firebaseAdmin.initializeApp(firebaseConfig)
        } catch (error) {
            if (
                (error as firebaseAdmin.FirebaseError).code ===
                'app/duplicate-app'
            ) {
                return true
            } else {
                throw error
            }
        }
    }
    return false
}
