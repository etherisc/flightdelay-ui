import { Alert, Box, Container, LinearProgress, Typography } from "@mui/material";
import { blue, green, grey } from "@mui/material/colors";
import { DataGrid, gridClasses, GridColDef } from "@mui/x-data-grid";
import dayjs from "dayjs";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { PolicyData } from "../../types/policy_data";
import { RiskData } from "../../types/risk_data";
import { FlightPlan } from "../../types/flight_plan";

export default function PoliciesList({ policies, risks, loading }: { policies: PolicyData[], risks: RiskData[], loading: boolean }) {
    const { t } = useTranslation();
    const isConnected = useSelector((state: RootState) => state.wallet.address !== null);
    
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

    
    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    function formatState(flightData: FlightPlan) {
        let text;
        let color = grey[900] as string;
        const additional = undefined;
        const state = flightData.status;
        switch (state) {
            case 'S': // scheduled
                text = t('flight_state.scheduled');
                break;
            case 'A': // active
                text = t('flight_state.en_route');
                color = blue[600];
                break;
            case 'L': // landed
                text = t('flight_state.punctual');
                color = green[600];
                // TODO: fixme
                // additional = <>{t('actual_arrival')}: {dayjs(flightData?.actualArrivalTime).format('HH:mm')}</>;
                break;
            // TODO: implement by reading delay
            // case 'L':
            //     text = t('flight_state.delayed');
            //     additional = <>{t('actual_arrival')}: {dayjs(flightData?.actualArrivalTime).format('HH:mm')}</>;
            //     color = red[500];
            //     break;
            case 'C': // cancelled
                text = t('flight_state.cancelled');
                break;
            case 'D': // diverted
                text = t('flight_state.diverted');
                break;
        }
        return <Typography color={color} variant="body2">
            {text}
            {additional !== undefined ? <><br/>{additional}</> : null}
        </Typography>;
    }

    function findRisk(riskId: string): RiskData | null {
        return risks.find(risk => risk.riskId === riskId) || null;
    }

    const columns: GridColDef[] = [
        { 
            field: 'nftId', 
            headerName: t('table.header.nftId'), 
            flex: 0.5,
        },
        {
            field: 'carrier',
            headerName: t('table.header.carrier'),
            flex: 0.4,
            valueGetter: (_value, row: PolicyData) => findRisk(row.riskId),
            renderCell: (params) => {
                if (params.value === null) {
                    return '';
                }
                
                return params.value.carrier;
            }
        },
        {
            field: 'flightNumber',
            headerName: t('table.header.flightNumber'),
            flex: 0.4,
            valueGetter: (_value, row: PolicyData) => findRisk(row.riskId),
            renderCell: (params) => {
                if (params.value === null) {
                    return '';
                }
                
                return params.value.flightNumber;
            }
        },
        {
            field: 'departureDate',
            headerName: t('table.header.departureDate'),
            flex: 0.7,
            valueGetter: (_value, row: PolicyData) => findRisk(row.riskId),
            renderCell: (params) => {
                if (params.value === null) {
                    return '';
                }
                const d = params.value.departureDate;
                return `${d.substr(0, 4)}-${d.substr(4, 2)}-${d.substr(6, 2)}`;
            }
        },
        {
            field: 'flightData',
            headerName: t('table.header.flightData'),
            flex: 1,
            valueGetter: (_value, row: PolicyData) => findRisk(row.riskId),
            renderCell: (params) => {
                if (params.value === null) {
                    return '';
                }
                return <FlightData value={params.value.flightPlan as FlightPlan} />
            }
        },
        {
            field: 'flightState',
            headerName: t('table.header.flightState'),
            flex: 0.9,
            valueGetter: (_value, row: PolicyData) => findRisk(row.riskId),
            renderCell: (params) => {
                if (params.value === null) {
                    return '';
                }
                return formatState(params.value.flightPlan as FlightPlan)
            }
        }
    ];

    function NoRowsOverlay() {
        if (! isConnected) {
            return (<Container maxWidth={false} sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                <Alert variant="standard" severity="info">
                    <Trans i18nKey="error.no_wallet_connected" t={t} />
                </Alert>
            </Container>);
        }
        return (<Container maxWidth={false} sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                <Alert variant="standard" severity="info">
                    <Trans i18nKey="error.no_policies" t={t} />
                </Alert>
            </Container>);
    }

    function FlightData({ value }: { value: FlightPlan }) {
        if (value.delay > 15) {
            return <Box>
                {value.departureAirportFsCode} - {value.arrivalAirportFsCode} <br />
                {dayjs(value.departureTimeUtc).format('HH:mm')} - {dayjs(value.arrivalTimeUtc).format('HH:mm')}
            </Box>;
        }
        return <Box>
            {value.departureAirportFsCode} - {value.arrivalAirportFsCode} <br />
            {dayjs(value.departureTimeUtc).format('HH:mm')} - {dayjs(value.arrivalTimeUtc).format('HH:mm')}
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
