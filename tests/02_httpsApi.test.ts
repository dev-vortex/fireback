// Following https://firebase.google.com/docs/functions/unit-testing
import * as firebaseAdmin from 'firebase-admin'
import { expect } from 'chai'
require('firebase-functions-test')()

import { defaultRegion } from '../src/firebase/functions'
import { init, httpsFunction } from '../src/index'
import { FireBackInterface } from '../src/types'

const serviceMocked = (req: Record<string, any>, res: Record<string, any>) => {
    console.log('Mocked HTTPS Service', req, res)
}

describe('fireback - HTTPS', () => {
    let fireback: FireBackInterface | false
    before(() => {
        fireback = init({
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
                const result = fireback.exportFunctions()
                expect(result).to.key('api')
                expect(result.api).to.key('httpMockFunc_v1')
            }
        })
        it('should return exported functions respecting base location only', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = fireback.exportFunctions(__dirname)
                expect(result).to.key('api')
                expect(result.api).to.key('httpMockFunc_v1')
            }
        })
        it('should return exported functions respecting base location only and folder name', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = fireback.exportFunctions(__dirname, './api')
                expect(result).to.key('api')
                expect(result.api).to.key('httpMockFunc_v1')
            }
        })
        it('should return exported functions respecting base location only, folder name and extensions (slow)', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = fireback.exportFunctions(__dirname, './api', [
                    '.f',
                ])
                expect(result).to.key('api')
                expect(result.api).to.key('httpMockExtra_v1')
            }
        })
        it('should return exported functions respecting base location only, folder name and full extensions', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = fireback.exportFunctions(__dirname, './api', [
                    '.f.ts',
                ])
                expect(result).to.key('api')
                expect(result.api).to.key('httpMockExtra_v1')
            }
        })
        it('should return exported functions respecting folder names', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = fireback.exportFunctions(
                    __dirname,
                    './api',
                    undefined,
                    {},
                )
                expect(result).to.key('api')
                expect(result.api).to.key('httpMockFunc_v1')
            }
        })
        it('should return exported functions grouped by functionGroupPath option', () => {
            expect(fireback).not.to.be.false
            if (fireback) {
                const result = fireback.exportFunctions(
                    __dirname,
                    './api',
                    undefined,
                    {
                        functionGroupPath: './apiMock',
                    },
                )
                expect(result).to.key('apiMock')
                expect(result.apiMock).to.key('httpMockFunc_v1')
            }
        })
    })
})
