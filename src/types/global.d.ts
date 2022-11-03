// Type definitions for @dev-vortex/fireback
// Project: Firebase backend service
// Definitions by: Joao Correia https://joao.correia.pw
declare global {
    // eslint-disable-next-line no-var
    var firebackGlobalCache: Record<
        'modules' | 'values',
        Record<string, unknown>
    >
}

export {}
