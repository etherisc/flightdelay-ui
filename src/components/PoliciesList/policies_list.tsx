import { Alert, Box, Container, LinearProgress, Link, Typography } from "@mui/material";
import { blue, green, grey, red } from "@mui/material/colors";
import { DataGrid, gridClasses, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { FlightStatus } from "../../types/flightstats/flightStatus";
import { FlightState, PolicyData } from "../../types/policy_data";

export default function PoliciesList({ policies, loading }: { policies: PolicyData[], loading: boolean }) {
    const { t } = useTranslation();
    const isConnected = useSelector((state: RootState) => state.wallet.address !== null);
    
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

    
    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    function formatState(policy: PolicyData) {
        let text;
        let color = grey[900] as string;
        let additional = undefined;
        const state = policy.flightState;
        switch (state) {
            case FlightState.SCHEDULED:
                text = t('flight_state.scheduled');
                break;
            case FlightState.EN_ROUTE:
                text = t('flight_state.en_route');
                color = blue[600];
                break;
            case FlightState.PUNCTUAL:
                text = t('flight_state.punctual');
                color = green[600];
                additional = <>{t('actual_arrival')}: {dayjs(policy.flightData?.actualArrivalTime).format('HH:mm')}</>;
                break;
            case FlightState.DELAYED:
                text = t('flight_state.delayed');
                additional = <>{t('actual_arrival')}: {dayjs(policy.flightData?.actualArrivalTime).format('HH:mm')}</>;
                color = red[500];
                break;
            case FlightState.CANCELLED:
                text = t('flight_state.cancelled');
                break;
            case FlightState.DIVERTED:
                text = t('flight_state.diverted');
                break;
        }
        return <Typography color={color} variant="body2">
            {text}
            {additional !== undefined ? <><br/>{additional}</> : null}
        </Typography>;
    }

    const columns: GridColDef[] = [
        { 
            field: 'nftId', 
            headerName: t('table.header.nftId'), 
            flex: 0.4,
        },
        {
            field: 'carrier',
            headerName: t('table.header.carrier'),
            flex: 0.4,
        },
        {
            field: 'flightNumber',
            headerName: t('table.header.flightNumber'),
            flex: 0.4,
        },
        {
            field: 'departureDate',
            headerName: t('table.header.departureDate'),
            flex: 0.7,
            valueGetter: (_value, row) => row.departureDate,
            renderCell: (params) => 
                dayjs.unix(params.value).format('YYYY-MM-DD'),
            
        },
        {
            field: 'flightData',
            headerName: t('table.header.flightData'),
            flex: 1,
            valueGetter: (_value, row) => row.flightData,
            renderCell: (params) => <FlightData value={params.value as FlightStatus} />
        },
        {
            field: 'flightState',
            headerName: t('table.header.flightState'),
            flex: 1,
            valueGetter: (_value, row) => row.flightState,
            renderCell: (params) => 
                formatState(params.row as PolicyData)
        }
    ];

    function NoRowsOverlay() {
        if (! isConnected) {
            return (<Container maxWidth={false} sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                <Alert variant="standard" severity="info">
                    <Trans i18nKey="alert.no_wallet_connected" t={t} />
                </Alert>
            </Container>);
        }
        return (<Container maxWidth={false} sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                <Trans i18nKey="no_policies" t={t}>
                    <Link href="/">click here</Link>
                </Trans>
            </Container>);
    }

    function FlightData({ value }: { value: FlightStatus }) {
        if (value.delay > 15) {
            return <Box>
                {value.departureAirportFsCode} - {value.arrivalAirportFsCode} <br />
                {dayjs(value.publishedDepartureTime).format('HH:mm')} - {dayjs(value.publishedArrivalTime).format('HH:mm')}
            </Box>;
        }
        return <Box>
            {value.departureAirportFsCode} - {value.arrivalAirportFsCode} <br />
            {dayjs(value.publishedDepartureTime).format('HH:mm')} - {dayjs(value.publishedArrivalTime).format('HH:mm')}
        </Box>;
    }

    return (<>
        {loadingIndicator}

        <DataGrid 
            autoHeight
            rows={policies} 
            columns={columns} 
            getRowId={(row: PolicyData) => row.nftId}
            getRowHeight={() => 'auto'}
            slots={{
                noRowsOverlay: NoRowsOverlay,
            }}
            initialState={{
                sorting: {
                    sortModel: [{ field: 'departureDate', sort: 'asc' }],
                },
            }}
            sortingOrder={['desc', 'asc']}
            paginationModel={paginationModel}
            pageSizeOptions={[5, 10, 20, 50]}
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick={true}
            disableColumnMenu={true}
            sx={{
                [`& .${gridClasses.cell}`]: {
                    py: 1,
                },
            }}
            />
    </>);
}
