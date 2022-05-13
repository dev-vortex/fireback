// Following https://firebase.google.com/docs/functions/unit-testing
import * as firebaseAdmin from 'firebase-admin'
import { expect } from 'chai'
require('firebase-functions-test')()

import { initApp, cronFunction } from '../src/index'
import { EventContext } from 'firebase-functions'

const serviceMethodMocked = (context: EventContext) => {
    console.log('Mocked CRON Service', context)
}

describe('fireback - CRON', () => {
    before(() => {
        initApp({
            credential: firebaseAdmin.credential.applicationDefault(),
        })
    })

    describe('cronFunction', () => {
        it('should provide an api when called without config', () => {
            const toTest = cronFunction('5 11 * * *', serviceMethodMocked)
            expect(toTest).to.have.property('__requiredAPIs')
            expect(toTest).to.have.property('run')
            expect(Array.isArray(toTest.__requiredAPIs)).to.be.true
        })
        it('should provide an api when called with config', () => {
            const useRegion = 'us-central1'
            const toTest = cronFunction('5 11 * * *', serviceMethodMocked, {
                functionRegion: useRegion,
            })
            expect(toTest).to.have.property('__requiredAPIs')
            expect(toTest).to.have.property('run')
            expect(Array.isArray(toTest.__requiredAPIs)).to.be.true
        })
        it('should provide an api when called with full config', () => {
            const useRegion = 'us-central1'
            const toTest = cronFunction('5 11 * * *', serviceMethodMocked, {
                functionRegion: useRegion,
                functionTimeZone: 'America/New_York',
            })
            expect(toTest).to.have.property('__requiredAPIs')
            expect(toTest).to.have.property('run')
            expect(Array.isArray(toTest.__requiredAPIs)).to.be.true
        })
    })
})
