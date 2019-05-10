import { SheetsRegistry } from 'jss'
import {
    createMuiTheme,
    createGenerateClassName
} from '@material-ui/core/styles'

import indigo from '@material-ui/core/colors/indigo'

const theme = createMuiTheme({
    typography: {
        useNextVariants: true
    },
    palette: {
        primary: indigo,
    }
})

const createPageContext = () => {
    return {
        theme,
        sheetsManager: new Map(),
        sheetsRegistry: new SheetsRegistry(),
        generateClassName: createGenerateClassName()
    }
}

let pageContext

const getPageContext = () => {
    if (!process.browser) {
        return createPageContext()
    }

    if (!pageContext) {
        pageContext = createPageContext()
    }

    return pageContext
}

export default getPageContext