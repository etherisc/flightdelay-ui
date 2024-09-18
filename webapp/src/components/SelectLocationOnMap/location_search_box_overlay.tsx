import { faMagnifyingGlassLocation } from "@fortawesome/pro-regular-svg-icons";
import { faCircleXmark } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Container, Input, InputAdornment, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useDebounce } from "@react-hooks-hub/use-debounce";
import { Trans } from "component-lib";
import React from "react";
import Card from "../(basic_widgets)/Card/card";
import { GREY_LIGHT, ZINDEX_SIGNUP_LOCATION_SEARCH_OVERLAY } from "../../config/theme";
import { useLocationIQAutocomplete, LocationIQResult } from "../../hooks/api/use_location_iq_autocomplete";

export function LocationSearchBoxOverlay({ onLocationSelected } : { onLocationSelected: (location: LocationIQResult) => void}) {
    const [ searchText, setSearchText ] = React.useState('');
    const [ queryText, setQueryText ] = React.useState('' as string);

    const { data: searchResults } = useLocationIQAutocomplete(queryText);

    async function sendLocationQuery(text: string) {
        setQueryText(text);
    }

    const debounceSendLocationQuery = useDebounce(sendLocationQuery, 200);

    async function updateQuery(text: string) {
        setSearchText(text);
        debounceSendLocationQuery(text);
    }

    function locationClicked(location: LocationIQResult) {
        onLocationSelected(location);
        setQueryText('');
        setSearchText(location.display_name);
    }

    function resetSearch() {
        setQueryText('');
        setSearchText('');
    }

    return (
        <Container 
            maxWidth="sm" 
            sx={{ 
                position: 'absolute', 
                zIndex: ZINDEX_SIGNUP_LOCATION_SEARCH_OVERLAY, 
                top: 52, 
                left: 0,
                right: 0,
                pt: 2, 
                width: '100%',
            }}
            >
            <Card
                sxContent={{ 
                    p: 2,
                }}
                // special workaround to make the card more compact
                classNameContent="margin-bottom-2"
                >
                <Typography variant="h2" sx={{ mb: 1 }} align="center" color="primary">
                    <Trans k="select_location.search_location" />
                </Typography>
                <Input
                    fullWidth
                    disableUnderline
                    id="query"
                    value={searchText}
                    onChange={(e) => updateQuery(e.target.value)}
                    startAdornment={
                        <InputAdornment position="start">
                            <Typography color="primary" sx={{ pl: 1 }} fontSize="1.4rem"><FontAwesomeIcon icon={faMagnifyingGlassLocation} /></Typography>
                        </InputAdornment>
                    }
                    endAdornment={searchText.length > 0 &&
                        <InputAdornment position="end">
                            <Typography color={grey[400]} sx={{ pr: 1 }} fontSize="1.1rem" onClick={resetSearch} data-testid="clear-icon">
                                <FontAwesomeIcon icon={faCircleXmark}/>
                            </Typography>
                        </InputAdornment>
                    }
                    sx={{
                        backgroundColor: GREY_LIGHT,
                        padding: 0.5,
                        borderRadius: 8,
                    }}
                    data-testid="search-input"
                    />
                { searchResults.length > 0 &&
                    <Box sx={{ p: 2 }} data-testid="search-results">
                        {searchResults.map((location: LocationIQResult) => (
                            <Box key={location.place_id} sx={{ p: 0.5 }} data-testid={`result-${location.place_id}`}>
                                <Typography component="span" variant="h5" onClick={() => locationClicked(location) }>{location.display_place}</Typography><br/>
                                <Typography variant="body2" component="span" onClick={() => locationClicked(location) }>{location.display_address}</Typography>
                            </Box>
                        ))}
                    </Box>
                }
            </Card>
        </Container>);
}
