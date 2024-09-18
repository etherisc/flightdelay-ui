import { blue, grey } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

export const PRIMARY_BLUE = '#405FFF';
export const SECONDARY_YELLOW = '#FFD747';
export const SECONDARY_CONTRAST_TEXT = '#000';

// background color for boxes
export const BLUE_LIGHT = '#EFF3FB';
export const BLUE_LIGHT2 = '#D4E0F6';

export const BLUE_BACKGROUND = '#E9EFFA';

export const WHITE = '#FFFFFF';

export const GREY_LIGHT = grey[100];

export const INPUT_VARIANT = 'outlined';

export const HEIGHT_BOTTOM_NAV = 56;

export const ZINDEX_SIGNUP_MAP_ACTIONS = 1100;
export const ZINDEX_SIGNUP_LOCATION_SEARCH_OVERLAY = 1800;
export const ZINDEX_SIGNUP_CONFIRMATION_DIALOG = 2000;
export const ZINDEX_BOTTOM_NAV = 2100;
export const ZINDEX_WALLET = 2900;
export const ZINDEX_PROGRESS_MODAL = 3000;
export const ZINDEX_SNACKBAR = 9999;

export const DURATION_SNACKBAR_ERROR = 5000;

export const customTheme = createTheme({
    palette: {
        primary: {
            main: PRIMARY_BLUE,
        },
        secondary: {
            main: SECONDARY_YELLOW,
            contrastText: SECONDARY_CONTRAST_TEXT 
        },
    },
    components: {
        MuiIcon: {
            styleOverrides: {
                root: {
                    // Match 24px = 3 * 2 + 1.125 * 16
                    boxSizing: 'content-box',
                    padding: 3,
                    fontSize: '1.125rem',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    color: blue[300],
                    backgroundColor: grey[200],
                },
            },
        },
    },
    typography: {
        fontFamily: 'Poppins, Arial,sans-serif',
        fontSize: 14,
        h1: {
            fontSize: '16px',
            fontWeight: 600,
        },
        h2: {
            fontSize: '18px',
            fontWeight: 700,
        },
        h3: {
            fontSize: '15px',
            fontWeight: 500,
        },
        h4: {
            fontSize: '16px',
            fontWeight: 500,
        },
        h5: {
            fontSize: '14px',
            fontWeight: 600,
        },
        h6: {
            fontSize: '20px',
            fontWeight: 600,
        },
        body1: {
            fontSize: '14px',
            fontWeight: 400,
        },
        body2: {
            fontSize: '13px',
            fontWeight: 400,
        },
        button: {
            textTransform: 'none',
        },
    },
});

