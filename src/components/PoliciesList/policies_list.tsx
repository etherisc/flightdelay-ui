import { Alert, Container, LinearProgress, Link } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { FlightState, PolicyData } from "../../types/policy_data";

export default function PoliciesList({ policies, loading }: { policies: PolicyData[], loading: boolean }) {
    const { t } = useTranslation();
    const isConnected = useSelector((state: RootState) => state.wallet.address !== null);
    
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

    
    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    function formatState(state: FlightState) {
        switch (state) {
            case FlightState.EXPECTED:
                return t('flight_state.expected');
            case FlightState.EN_ROUTE:
                return t('flight_state.en_route');
            case FlightState.PUNCTUAL:
                return t('flight_state.punctual');
            case FlightState.DELAYED:
                return t('flight_state.delayed');
            case FlightState.CANCELLED:
                return t('flight_state.cancelled');
            case FlightState.DIVERTED:
                return t('flight_state.diverted');
        }
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
            flex: 0.5,
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
            field: 'flightState',
            headerName: t('table.header.flightState'),
            flex: 1,
            valueGetter: (_value, row) => row.flightState,
            renderCell: (params) => 
                formatState(params.value as FlightState)
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

    return (<>
        {loadingIndicator}

        <DataGrid 
            autoHeight
            rows={policies} 
            columns={columns} 
            getRowId={(row: PolicyData) => row.nftId}
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
            />
    </>);
}
