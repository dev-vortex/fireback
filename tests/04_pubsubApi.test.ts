// Following https://firebase.google.com/docs/functions/unit-testing
import * as firebaseFunctions from 'firebase-functions'
import * as firebaseAdmin from 'firebase-admin'
import { expect } from 'chai'
require('firebase-functions-test')()

import { initApp, pubSubFunction } from '../src/index'
import { EventContext } from 'firebase-functions'

const serviceMethodMocked = (
    message: firebaseFunctions.pubsub.Message,
    context: EventContext,
) => {
    console.log('Mocked PUBSUB Service', context)
}

describe('fireback - PUBSUB', () => {
    before(() => {
        initApp({
            credential: firebaseAdmin.credential.applicationDefault(),
        })
    })

    describe('pubSubFunction', () => {
        it('should provide an api when called without config', () => {
            const toTest = pubSubFunction('MOCK-TOPIC', serviceMethodMocked)
            expect(toTest).to.have.property('run')
        })
    })
})
