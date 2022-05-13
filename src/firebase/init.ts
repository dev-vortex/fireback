import * as firebaseAdmin from 'firebase-admin'

let firebaseConfig: firebaseAdmin.AppOptions

export const initApp = (
    firebaseServiceConfig?: firebaseAdmin.AppOptions,
): firebaseAdmin.app.App | boolean => {
    if (firebaseServiceConfig) {
        if (!firebaseConfig && firebaseServiceConfig) {
            firebaseConfig = firebaseServiceConfig
        }
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
