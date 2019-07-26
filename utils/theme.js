import { createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo'

// Create a theme instance.
const theme = createMuiTheme({
    typography: {
        useNextVariants: true
    },
    palette: {
        primary: indigo,
    }
})

export default theme;