import * as firebaseAdmin from 'firebase-admin'

import firebaseConfig from '../../config/firebase'

// Since admin SDK can only be initialized once.
try {
    // firebaseAdmin.initializeApp(firebaseFunctions.config().firebase)
    firebaseAdmin.initializeApp(firebaseConfig)
    // eslint-disable-next-line no-empty
} catch (e) {}

export const admin = firebaseAdmin
