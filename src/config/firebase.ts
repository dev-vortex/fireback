// const firebaseAdmin = require('firebase-admin')
import firebaseAdmin from 'firebase-admin'

// TODO: Need way to load json config file from running module path
export default {
    // apiKey: '<your-api-key>',
    // authDomain: '<your-auth-domain>',
    // databaseURL: '<your-database-url>',
    // credential: firebaseAdmin.credential.cert(serviceAccount),
    credential: firebaseAdmin.credential.applicationDefault(),
    storageBucket: 'leia-746dd.appspot.com',
}
