import { Alert, Box, Container, LinearProgress, Typography } from "@mui/material";
import { blue, green, grey, red } from "@mui/material/colors";
import { DataGrid, gridClasses, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { FlightPlan } from "../../types/flight_plan";
import { PolicyData } from "../../types/policy_data";
import { RiskData } from "../../types/risk_data";
import { dayjs } from "../../utils/date";
import { useTranslation } from "react-i18next";
import Trans from "../Trans/trans";


export default function PoliciesList() {
    const { t } = useTranslation();
    const isConnected = useSelector((state: RootState) => state.wallet.address !== null);
    const loading = useSelector((state: RootState) => state.policies.loading);
    const policies = useSelector((state: RootState) => state.policies.policies);
    const risks = useSelector((state: RootState) => state.policies.risks);
    
    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

    
    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    function formatState(flightData: FlightPlan) {
        let text;
        let color = grey[900] as string;
        const state = flightData.status;
        const delay = flightData.delay;
        const nowUtc = dayjs.utc().unix();
        
        switch (state) {
            case 'S': // scheduled
                if (flightData.departureTimeUtc !== null && flightData.departureTimeUtc < nowUtc) {
                    text = t('flight_state.en_route');
                } else {
                    text = t('flight_state.scheduled');
                }
                break;
            case 'A': // active
                text = t('flight_state.en_route');
                color = blue[600];
                break;
            case 'L': // landed
                if (delay !== null && delay > 0) {
                    text = <>{t('flight_state.delayed')} {delay} <Trans k="minutes" /></> ;
                    color = red[500];
                } else {
                    text = t('flight_state.punctual');
                    color = green[600];
                }
                break;
            case 'C': // cancelled
                text = t('flight_state.cancelled');
                color = red[500];
                break;
            case 'D': // diverted
                text = t('flight_state.diverted');
                color = red[500];
                break;
        }
        return <Typography color={color} variant="body2">
            {text}
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
            sortComparator: (v1, v2) => {
                if (v1 === null || v1.carrier === null) {
                    return -1;
                }
                if (v2 === null || v2.carrier === null) {
                    return 1;
                }
                return v1.carrier.localeCompare(v2.carrier);
            },
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
            sortComparator: (v1, v2) => {
                if (v1 === null || v1.flightNumber === null) {
                    return -1;
                }
                if (v2 === null || v2.flightNumber === null) {
                    return 1;
                }
                return v1.flightNumber.localeCompare(v2.flightNumber);
            },
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
            sortComparator: (v1, v2) => {
                if (v1 === null || v1.departureDate === null) {
                    return -1;
                }
                if (v2 === null || v2.departureDate === null) {
                    return 1;
                }
                return v1.departureDate.localeCompare(v2.departureDate);
            },
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
            sortable: false,
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
            sortable: false,
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
                    <Trans k="error.no_wallet_connected" />
                </Alert>
            </Container>);
        }
        // TODO: don't show while loading
        return (<Container maxWidth={false} sx={{ height: 1, display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                <Alert variant="standard" severity="info">
                    <Trans k="error.no_policies" />
                </Alert>
            </Container>);
    }

    function FlightData({ value }: { value: FlightPlan }) {
        const departue = dayjs.tz(value.departureTimeLocal, value.departureTimeLocalTimezone!);
        const arrival = dayjs.tz(value.arrivalTimeLocal, value.arrivalTimeLocalTimezone!);
        let day = <></>;
        if (departue.date() !== arrival.date()) {
            day = <>(+1 <Trans k="day" />)</>;
        }

        return <Box>
            {value.departureAirportFsCode} - {value.arrivalAirportFsCode} <br />
            {departue.format('HH:mm')} - {arrival.format('HH:mm')} {day}
        </Box>;
    }

    return (<>
        {loadingIndicator}

        <DataGrid 
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
