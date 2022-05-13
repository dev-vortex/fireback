// Following https://firebase.google.com/docs/functions/unit-testing
import * as firebaseAdmin from 'firebase-admin'
import { expect } from 'chai'
require('firebase-functions-test')()

import { defaultRegion } from '../src/firebase/functions'
import { initApp, exportFunctions, httpsFunction } from '../src/index'

const serviceMocked = (req: Record<string, any>, res: Record<string, any>) => {
    console.log('Mocked HTTPS Service', req, res)
}

describe('fireback - HTTPS', () => {
    let fireback: firebaseAdmin.app.App | boolean
    before(() => {
        fireback = initApp({
            credential: firebaseAdmin.credential.applicationDefault(),
        })
    })

    describe('restFunction', () => {
        it('should provide an api when called without confiig', () => {
            const toTest = httpsFunction(serviceMocked)

            expect(toTest).to.have.property('__trigger')
            expect(toTest).to.have.property('__endpoint')
            expect(toTest.__trigger).to.have.property('regions')
            expect(toTest.__trigger.regions).to.include(defaultRegion)
        })
        it('should provide an api when called only with endpoint config', () => {
            const useRegion = 'us-central1'
            const toTest = httpsFunction(serviceMocked, {
                functionRegion: useRegion,
            })

            expect(toTest).to.have.property('__trigger')
            expect(toTest).to.have.property('__endpoint')
            expect(toTest.__trigger).to.have.property('regions')
            expect(toTest.__trigger.regions).to.include(useRegion)
        })
        //     it('should provide an api when called only with feature config', () => {
        //         const toTest = restFunction(undefined, undefined, {
        //             cors: true,
        //             security: true,
        //         })
        //         expect(toTest.feature).to.be.exist
        //         expect(toTest.getFunctionExport).to.be.exist
        //     })
        //     it('should provide an api when called with all parameters', () => {
        //         const toTest = restFunction('', {}, { cors: true, security: true })
        //         expect(toTest.feature).to.be.exist
        //     })

        //     it('returned route should be able to add endpoints (express)', () => {
        //         const { feature, getFunctionExport } = restFunction(
        //             '',
        //             {},
        //             { cors: true, security: true },
        //         )
        //         feature.route('/').get(() => {
        //             return
        //         })
        //         expect(feature).not.to.be.undefined
        //         expect(getFunctionExport).not.to.be.undefined

        //         const toExport = getFunctionExport()
        //         expect(toExport).not.to.be.undefined
        //     })

        it('should return exported functions respecting defaults (very slow!!!)', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = exportFunctions()
                expect(result).to.key('http')
                expect(result.http).to.have.property('mockFunc_v1')
                expect(result.http).to.have.property('user')
            }
        })
        it('should return exported functions respecting base location only', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = exportFunctions({ base: __dirname })
                expect(result).to.key('http')
                expect(result.http).to.have.property('mockFunc_v1')
                expect(result.http).to.have.property('user')
                expect(result.http.user).to.have.property('1_0')
                expect(result.http.user['1_0']).to.have.property('adminPrivate')
                expect(result.http.user['1_0']).to.have.property('clientOpen')
                expect(result.http.user['1_0']).to.have.property(
                    'partnerA_secure',
                )
                expect(result.http.user['1_0']).to.have.property(
                    'partnerB_secure',
                )
            }
        })
        it('should return exported functions respecting base location only and folder name', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = exportFunctions({
                    base: __dirname,
                    folder: './api',
                })
                expect(result).to.key('http')
                expect(result.http).to.have.property('mockFunc_v1')
                expect(result.http).to.have.property('user')
                expect(result.http.user).to.have.property('1_0')
                expect(result.http.user['1_0']).to.have.property('adminPrivate')
                expect(result.http.user['1_0']).to.have.property('clientOpen')
                expect(result.http.user['1_0']).to.have.property(
                    'partnerA_secure',
                )
                expect(result.http.user['1_0']).to.have.property(
                    'partnerB_secure',
                )
            }
        })
        it('should return exported functions respecting base location only, folder name and extensions (slow)', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = exportFunctions({
                    base: __dirname,
                    folder: './api',
                    extensions: ['.f'],
                })
                expect(result).to.key('http')
                expect(result.http).to.have.property('mockExtra_v1')
            }
        })
        it('should return exported functions respecting base location only, folder name and full extensions', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = exportFunctions({
                    base: __dirname,
                    folder: './api',
                    extensions: ['.f.ts'],
                })
                expect(result).to.key('http')
                expect(result.http).to.have.property('mockExtra_v1')
            }
        })
        it('should return exported functions respecting folder names', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = exportFunctions({
                    base: __dirname,
                    folder: './api',
                    options: {},
                })
                expect(result).to.key('http')
                expect(result.http).to.have.property('mockFunc_v1')
                expect(result.http).to.have.property('user')
                expect(result.http.user).to.have.property('1_0')
                expect(result.http.user['1_0']).to.have.property('adminPrivate')
                expect(result.http.user['1_0']).to.have.property('clientOpen')
                expect(result.http.user['1_0']).to.have.property(
                    'partnerA_secure',
                )
                expect(result.http.user['1_0']).to.have.property(
                    'partnerB_secure',
                )
            }
        })
        it('should return exported functions grouped by functionGroupPath option', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = exportFunctions({
                    base: __dirname,
                    folder: './api',
                    options: {
                        functionGroupPath: './apiMock',
                    },
                })
                expect(result).to.have.property('apiMock')
                expect(result.apiMock).to.have.property('http')
                expect(result.apiMock.http).to.have.property('mockFunc_v1')
                expect(result.apiMock.http).to.have.property('user')
                expect(result.apiMock.http.user).to.have.property('1_0')
                expect(result.apiMock.http.user['1_0']).to.have.property(
                    'adminPrivate',
                )
                expect(result.apiMock.http.user['1_0']).to.have.property(
                    'clientOpen',
                )
                expect(result.apiMock.http.user['1_0']).to.have.property(
                    'partnerA_secure',
                )
                expect(result.apiMock.http.user['1_0']).to.have.property(
                    'partnerB_secure',
                )
            }
        })
    })
})
