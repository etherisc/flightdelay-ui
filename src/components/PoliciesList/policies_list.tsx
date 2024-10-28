import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Box, LinearProgress, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { DataGrid, GridActionsCellItem, gridClasses, GridColDef } from "@mui/x-data-grid";
import { useEnvContext } from "next-runtime-env";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FlightPlan } from "../../types/flight_plan";
import { PolicyData } from "../../types/policy_data";
import { formatAmount } from "../../utils/amount";
import { dayjs } from "../../utils/date";
import { getFlightStateText } from "../../utils/flightstate";
import Trans from "../Trans/trans";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useRouter } from "next/navigation";


export default function PoliciesList({ policies, loading }: { policies: PolicyData[], loading: boolean }) {
    const { t } = useTranslation();
    const { NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL } = useEnvContext();
    const router = useRouter();
    const isConnected = useSelector((state: RootState) => state.wallet.isConnected);

    const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

    
    let loadingIndicator = undefined;
    if (loading) {
        loadingIndicator = <LinearProgress />;
    }

    function formatState(flightData: FlightPlan) {
        const state = flightData.status;
        const delay = flightData.delay;
        const { text, color } = getFlightStateText(state, flightData.departureTimeUtc!, delay, t);
        
        return <Typography color={color} variant="body2">
            {text}
        </Typography>;
    }

    function formatPayoutAmount(payoutAmount: string, status: string): JSX.Element {
        if (status == 'S') {
            return <></>;
        }
        const amount = BigInt(payoutAmount);
        if (amount > 0) {
            return <><b>{NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL} {formatAmount(amount, 6)}</b> <Trans k="payout" /></>;
        } else {
            return <Typography color={grey[500]} variant="body2"><Trans k="no_payout" /></Typography>;
        }
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
            sortComparator: (v1, v2) => {
                if (v1 === null || v1.carrier === null) {
                    return -1;
                }
                if (v2 === null || v2.carrier === null) {
                    return 1;
                }
                return v1.carrier.localeCompare(v2.carrier);
            },
            // renderCell: (params) => {
            //     return params.value.carrier;
            // }
        },
        {
            field: 'flightNumber',
            headerName: t('table.header.flightNumber'),
            flex: 0.4,
            sortComparator: (v1, v2) => {
                if (v1 === null || v1.flightNumber === null) {
                    return -1;
                }
                if (v2 === null || v2.flightNumber === null) {
                    return 1;
                }
                return v1.flightNumber.localeCompare(v2.flightNumber);
            },
            // renderCell: (params) => {
            //     return params.value.flightNumber;
            // }
        },
        {
            field: 'departureDate',
            headerName: t('table.header.departureDate'),
            flex: 0.7,
            sortComparator: (v1, v2) => {
                if (v1 === null || v1 === null) {
                    return -1;
                }
                if (v2 === null || v2 === null) {
                    return 1;
                }
                return v1.localeCompare(v2);
            },
            renderCell: (params) => {
                const d = params.value;
                return `${d.substr(0, 4)}-${d.substr(4, 2)}-${d.substr(6, 2)}`;
            }
        },
        {
            field: 'flightPlan',
            headerName: t('table.header.flightData'),
            flex: 1,
            sortable: false,
            renderCell: (params) => {
                return <FlightData value={params.value} />
            }
        },
        {
            field: 'flightState',
            headerName: t('table.header.flightState'),
            flex: 0.9,
            sortable: false,
            valueGetter: (_value, row: PolicyData) => row,
            renderCell: (params) => {
                return <>
                    {formatState(params.value.flightPlan as FlightPlan)}
                    {formatPayoutAmount(params.value.payoutAmount, params.value.flightPlan?.status || 'S')}
                </>;
            }
        },
        {
            field: 'actions',
            type: 'actions',
            flex: 0.1,
            sortable: false,
            valueGetter: (_value, row: PolicyData) => row,
            getActions: (params) => {
                return [
                    <GridActionsCellItem 
                        key={params.row.nftId}  
                        icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                        label="Show details" 
                        onClick={() => router.push(`/policies/${params.row.nftId}`)}
                        showInMenu 
                        />,
                ];
            }
        }
    ];

    function NoRowsOverlay() {
        if (! isConnected) {
            return (<Stack>
                <Alert variant="standard" severity="info">
                    <Trans k="error.no_wallet_connected" />
                </Alert>
            </Stack>);
        }
        return (<Stack>
                <Alert variant="standard" severity="info">
                    <Trans k="error.no_policies" />
                </Alert>
            </Stack>);
    }

    function FlightData({ value }: { value: FlightPlan }) {
        // console.log("FlightData", value);
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
            loading={loadingIndicator !== undefined || false} 
            rows={policies} 
            columns={columns} 
            getRowId={(row: PolicyData) => row.nftId}
            getRowHeight={() => 'auto'}
            slots={{
                noRowsOverlay: NoRowsOverlay,
            }}
            slotProps={{
                loadingOverlay: {
                    // variant: 'skeleton',
                    noRowsVariant: 'skeleton',
                },
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
