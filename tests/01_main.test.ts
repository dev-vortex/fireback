// Following https://firebase.google.com/docs/functions/unit-testing
import * as firebaseAdmin from 'firebase-admin'
import { expect } from 'chai'
require('firebase-functions-test')()

import { initApp } from '../src/index'

describe('fireback', () => {
    describe('init', () => {
        it('should return a valid interface', () => {
            const toTest = initApp({
                credential: firebaseAdmin.credential.applicationDefault(),
            })
            expect(toTest).not.to.be.false
        })
        it('should return false when we try to initialiize for the second time', () => {
            const toTest = initApp({
                credential: firebaseAdmin.credential.applicationDefault(),
                storageBucket: 'leia-746dd.appspot.com',
            })
            expect(toTest).not.to.be.false
        })
    })
})
