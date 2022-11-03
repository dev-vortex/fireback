import { expect } from 'chai'
import { getGlobalCacheManager } from '../src/firebase'

describe('fireback', () => {
    describe('getGlobalCacheManager', () => {
        it('should return a management interface', () => {
            const result = getGlobalCacheManager()

            expect(result).to.have.property('get')
            expect(result).to.have.property('set')
            expect(result).to.have.property('remove')
        })

        it('should set a global variable when set is called', () => {
            const manager = getGlobalCacheManager()
            manager.set('TEST', 'TEST_VALUE')
            expect(global.firebackGlobalCache.values['TEST']).to.equal(
                'TEST_VALUE',
            )
        })

        it('should replace a global variable when set is called for the same variable', () => {
            const manager = getGlobalCacheManager()
            manager.set('TEST', 'TEST_VALUE_2')
            expect(global.firebackGlobalCache.values['TEST']).to.not.equal(
                'TEST_VALUE',
            )
            expect(global.firebackGlobalCache.values['TEST']).to.equal(
                'TEST_VALUE_2',
            )
        })

        it('should get a global variable when set is called', () => {
            const manager = getGlobalCacheManager()
            const gotValue = manager.get('TEST')
            expect(gotValue).to.equal('TEST_VALUE_2')
        })

        it('should unset a global variable when remove the variable', () => {
            const manager = getGlobalCacheManager()
            const removed = manager.remove('TEST')

            expect(global.firebackGlobalCache.values['TEST']).to.not.exist
            expect(removed).to.be.true
        })

        it('should return false when requested to remove an unexisting variable', () => {
            const manager = getGlobalCacheManager()
            const removed = manager.remove('TEST')

            expect(removed).to.be.false
        })
    })
})
