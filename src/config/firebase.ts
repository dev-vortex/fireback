// const firebaseAdmin = require('firebase-admin')
import firebaseAdmin from 'firebase-admin'
import { resolve } from 'path'

export default require(resolve(__dirname, 'config', 'firebase.ts')) || {
    credential: firebaseAdmin.credential.applicationDefault(),
}
