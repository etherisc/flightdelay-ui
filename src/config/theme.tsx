import { createTheme } from '@mui/material/styles';

export const PRIMARY_BLUE = '#5180F3';
// TODO: remove when no longer needed
export const BLUE_LIGHT = PRIMARY_BLUE; 
export const INPUT_VARIANT = 'outlined';

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
        // secondary: {
        //     main: SECONDARY_YELLOW,
        //     contrastText: SECONDARY_CONTRAST_TEXT 
        // },
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
                    // color: lightBlue['900'],
                    // backgroundColor: grey['400'],
                    // border: '2px solid #ffffff',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '1.5rem',
                    padding: 4,
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                title: {
                    fontSize: '1.5rem',
                    fontWeight: 600,
                },
            },
        },
    },
    typography: {
        fontFamily: 'Poppins, Arial,sans-serif',
        fontSize: 18,
        // h1: {
        //     fontSize: '24px',
        //     fontWeight: 600,
        // },
        h2: {
            fontSize: '1.2rem',
            fontWeight: 500,
            color: PRIMARY_BLUE,
        },
        // h3: {
        //     fontSize: '15px',
        //     fontWeight: 500,
        // },
        // h4: {
        //     fontSize: '16px',
        //     fontWeight: 500,
        // },
        // h5: {
        //     fontSize: '14px',
        //     fontWeight: 600,
        // },
        // h6: {
        //     fontSize: '20px',
        //     fontWeight: 600,
        // },
        // body1: {
        //     fontSize: '14px',
        //     fontWeight: 400,
        // },
        // body2: {
        //     fontSize: '13px',
        //     fontWeight: 400,
        // },
        button: {
            textTransform: 'none',
            fontSize: '1.2rem',
        },
    },
});

