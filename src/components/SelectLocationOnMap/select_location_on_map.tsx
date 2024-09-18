'use client';

import { faLocationCrosshairs } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Box, Fab, Snackbar, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { DURATION_SNACKBAR_ERROR, HEIGHT_BOTTOM_NAV, ZINDEX_SIGNUP_MAP_ACTIONS, ZINDEX_SNACKBAR } from '../../config/theme';
import { LocationIQResult } from '../../hooks/api/use_location_iq_autocomplete';
import { EVENT_SIGNUP_GEOLOCATE_BROWSER, EVENT_SIGNUP_GEOLOCATE_BROWSER_NOT_SUPPORTED, EVENT_SIGNUP_LOCATION_SELECTION_HINT_DISPLAYED, useAnalytics } from '../../hooks/use_analytics';
import { setLocation } from '../../redux/slices/application';
import { setStep } from '../../redux/slices/signup';
import { AppDispatch, RootState } from '../../redux/store';
import { findClosestCites } from '../../redux/thunks/signup';
import { QApiCity } from '../../types/qapi/city';
import { SIGNUP_STEP_CONFIRM_LOCATION } from '../../utils/step_constants';
import ConfirmationDialog from './confirmationDialog';
import { LocationSearchBoxOverlay } from './location_search_box_overlay';
import Map from './map';
import Trans from '../Trans/trans';
import Button from '../Button/button';

export default function SelectLocationOnMap({ clientLatitude, clientLongitude, locationSearchEnabled } : { clientLatitude: number | null , clientLongitude: number | null, locationSearchEnabled?: boolean }) {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { trackEvent } = useAnalytics();

    const [snackbarQueryLocationOpen, setSnackbarQueryLocationOpen] = React.useState(false);

    // coordinates to fly to, can be from geolocation or location search
    const [ flyToCoordinates , setFlyToCoordinates ] = React.useState({ lat: null, lon: null });
    const cities = useSelector((state: RootState) => (state.signup.citiesOnMap));

    const step = useSelector((state: RootState) => (state.signup.step));
    const cityFetchError = useSelector((state: RootState) => (state.signup.cityFetchFailedReason));
    
    const [snackBarErrorMsg, setSnackBarErrorMsg] = React.useState(null);

    useEffect(() => {
        if (cityFetchError) {
            if (cityFetchError === '103') {
                setSnackBarErrorMsg(t('error.fetching_cities_failed_req_exhausted'));
            } else {
                setSnackBarErrorMsg(t('error.fetching_cities_failed'));
            }
            
        }
    }, [cityFetchError, t]);
    
    async function handleToCurrentLocation() {
        if (navigator.geolocation) {
            setSnackbarQueryLocationOpen(true);
            navigator.geolocation.getCurrentPosition(
                (position) => { 
                    setSnackbarQueryLocationOpen(false);
                    const { latitude, longitude } = position.coords;
                    console.log(latitude, longitude);
                    setFlyToCoordinates({ lat: latitude, lon: longitude });
                },
                () => {
                    setSnackbarQueryLocationOpen(false);
                    setSnackBarErrorMsg(t('error.geolocation_failed'));
                });
            trackEvent(EVENT_SIGNUP_GEOLOCATE_BROWSER);
        } else {
            setSnackBarErrorMsg(t('error.geolocation_not_supported'));
            trackEvent(EVENT_SIGNUP_GEOLOCATE_BROWSER_NOT_SUPPORTED);
        }
    }

    async function markerPositonChanged(lat: number, lng: number, zoom: number) {
        console.log('marker position changed: ', lat, lng, 'fetching closest cities');
        dispatch(findClosestCites({ lat, lng, zoom }));
    }

    function citySelected(city: QApiCity) {
        console.log('selected city: ', city);
        dispatch(setLocation({ id: city.id, coords: { lat: city.lat, lng: city.lon }, name: city.name.local }));
        dispatch(setStep(SIGNUP_STEP_CONFIRM_LOCATION));
    }

    function searchLocationSelected(location: LocationIQResult) {
        setFlyToCoordinates({ lat: location.lat, lon: location.lon });
    }

    let confirmDialog = null;
    if (step == SIGNUP_STEP_CONFIRM_LOCATION) {
        confirmDialog = <ConfirmationDialog />;
    }

    return (<Box sx={{ height: '100%' }}>
                { locationSearchEnabled && confirmDialog === null && 
                    <LocationSearchBoxOverlay onLocationSelected={searchLocationSelected} /> 
                }
                <Map 
                    clientLongitude={clientLongitude}
                    clientLatitude={clientLatitude}
                    flyToCoordinates={flyToCoordinates} 
                    cities={cities}
                    onMapMovedTo={markerPositonChanged}
                    onCitySelected={citySelected}  />
                <Actions 
                    onToCurrentLocation={handleToCurrentLocation} 
                    />
                {confirmDialog}
                <Snackbar open={snackbarQueryLocationOpen} sx={{ zIndex: ZINDEX_SNACKBAR }}>
                    <Alert severity="info" variant='filled'>
                        <Trans k="query_location" />
                    </Alert>
                </Snackbar>
                <Snackbar 
                    open={snackBarErrorMsg !== null} 
                    onClose={() => setSnackBarErrorMsg(null)}
                    autoHideDuration={DURATION_SNACKBAR_ERROR} 
                    sx={{ zIndex: ZINDEX_SNACKBAR }}>
                    <Alert severity="error" variant='filled' onClose={() => setSnackBarErrorMsg(null)}>
                        {snackBarErrorMsg}
                    </Alert>
                </Snackbar>
            </Box>)
}

function Actions({
    onToCurrentLocation,
}: {
    onToCurrentLocation: () => void,
}) {
    const { trackEvent } = useAnalytics();
    const [noticeOpen, setNoticeOpen] = React.useState(false);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
    
        setNoticeOpen(false);
    };

    return (<>
        <Box sx={{ 
            position: 'absolute', 
            bottom: HEIGHT_BOTTOM_NAV, 
            paddingBottom: 4,
            width: '100%',
            maxWidth: 'sm',
            display: 'grid', 
            gridAutoColumns: '1fr',
        }}>
            {/* bottom left of screen */}
            <Box sx={{ gridRow: 1, gridColumn: 'span 1' }}>&nbsp;</Box>
            
            {/* bottom center of screen */}
            <Box sx={{ gridRow: 1, gridColumn: 'span 3', zIndex: ZINDEX_SIGNUP_MAP_ACTIONS }}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', pt: 1.5 }}>
                    <Button onClick={() => {
                        setNoticeOpen(true);
                        trackEvent(EVENT_SIGNUP_LOCATION_SELECTION_HINT_DISPLAYED);
                    }}><Trans k='select_location.select_location_button' /></Button>
                </Box>
            </Box>
        
            {/* bottom right of screen */}
            <Box sx={{ gridRow: 1, gridColumn: 'span 1', zIndex: ZINDEX_SIGNUP_MAP_ACTIONS }}>
                {/* floating action button (fab) to move map to current location */}
                <Fab color="secondary" onClick={onToCurrentLocation}>
                    <Typography fontSize={24} sx={{ pt: 0.5 }}>
                        <FontAwesomeIcon icon={faLocationCrosshairs} />
                    </Typography>
                </Fab>
            </Box>
        </Box>
        <Snackbar open={noticeOpen} autoHideDuration={3000} onClose={handleClose}>
            <Alert onClose={handleClose} variant='filled' severity="info" sx={{ width: '100%' }}>
                <Trans k="select_location.selection_hint" />
            </Alert>
        </Snackbar>
    </>);
}
