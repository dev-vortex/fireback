import { httpsFunction } from '../../../../../src'

// Express App Mocked
const serviceMocked = (req: Record<string, any>, res: Record<string, any>) => {
    console.log('Mocked HTTPS Service', req, res)
}

export default httpsFunction(serviceMocked)
