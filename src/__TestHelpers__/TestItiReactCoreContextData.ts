import {
    ItiReactCoreContextData,
    defaultItiReactCoreContextData,
} from '../ItiReactCoreContext'

export const testItiReactCoreContextData: ItiReactCoreContextData = {
    onError: (e) => {
        throw e
    },
    useSimpleAutoRefreshQuery: {
        ...defaultItiReactCoreContextData.useSimpleAutoRefreshQuery,
        isConnectionError: () => {
            throw new Error('not implemented')
        },
    },
}
