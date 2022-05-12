// Following https://firebase.google.com/docs/functions/unit-testing
import * as firebaseAdmin from 'firebase-admin'
import { expect } from 'chai'
require('firebase-functions-test')()

import { init } from '../src/index'

describe('fireback', () => {
    describe('init', () => {
        it('should return a valid interface', () => {
            const toTest = init({
                credential: firebaseAdmin.credential.applicationDefault(),
            })
            expect(toTest).not.to.be.false
            expect(toTest?.admin).to.exist
        })
        it('should return false when we try to initialiize for the second time', () => {
            const toTest = init({
                credential: firebaseAdmin.credential.applicationDefault(),
                storageBucket: 'leia-746dd.appspot.com',
            })
            expect(toTest?.admin).to.undefined
        })
    })
})
