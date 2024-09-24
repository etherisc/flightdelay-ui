import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { PolicyData } from '../../types/policy_data';
import dayjs from 'dayjs';

export interface PoliciesState {
    loading: boolean;
    policies: PolicyData[]
}

const initialState: PoliciesState = {
    loading: false,
    policies: [
        {
            nftId: '123456',
            createdAt: dayjs().subtract(1, 'w').unix(),
            carrier: 'LX',
            flightNumber: '123',
            departureDate: dayjs().add(1, 'd').unix(),
            flightState: 0,
            flightData: {
                status: 'S',
                departureAirportFsCode: 'ZRH',
                arrivalAirportFsCode: 'JFK',
                publishedDepartureTime: '2021-10-10T10:00:00Z',
                publishedArrivalTime: '2021-10-10T14:00:00Z',
                actualArrivalTime: null,
                delay: 0,
            },
        },
        {
            nftId: '123457',
            createdAt: dayjs().subtract(1, 'w').unix(),
            carrier: 'LX',
            flightNumber: '124',
            departureDate: dayjs().add(1, 'd').unix(),
            flightState: 1,
            flightData: {
                status: 'A',
                departureAirportFsCode: 'ZRH',
                arrivalAirportFsCode: 'JFK',
                publishedDepartureTime: '2021-10-10T10:00:00Z',
                publishedArrivalTime: '2021-10-10T14:00:00Z',
                actualArrivalTime: null,
                delay: 0,
            },
        },
        {
            nftId: '123458',
            createdAt: dayjs().subtract(1, 'w').unix(),
            carrier: 'LX',
            flightNumber: '125',
            departureDate: dayjs().add(1, 'd').unix(),
            flightState: 2,
            flightData: {
                status: 'L',
                departureAirportFsCode: 'ZRH',
                arrivalAirportFsCode: 'JFK',
                publishedDepartureTime: '2021-10-10T10:00:00Z',
                publishedArrivalTime: '2021-10-10T14:00:00Z',
                actualArrivalTime: '2021-10-10T14:01:00Z',
                delay: 1,
            },
        },
        {
            nftId: '123410',
            createdAt: dayjs().subtract(1, 'w').unix(),
            carrier: 'LX',
            flightNumber: '126',
            departureDate: dayjs().add(1, 'd').unix(),
            flightState: 3,
            flightData: {
                status: 'L',
                departureAirportFsCode: 'ZRH',
                arrivalAirportFsCode: 'JFK',
                publishedDepartureTime: '2021-10-10T10:00:00Z',
                publishedArrivalTime: '2021-10-10T14:00:00Z',
                actualArrivalTime: '2021-10-10T16:01:00Z',
                delay: 121,
            },
        }
    ]
}

export const policiesSlice = createSlice({
    name: 'policies',
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        addOrUpdatePolicy(state, action: PayloadAction<PolicyData>) {
            const index = state.policies.findIndex(policy => policy.nftId === action.payload.nftId);
            if (index >= 0) {
                state.policies[index] = action.payload;
                return;
            }
            state.policies.push(action.payload);
        },
        resetPolicies(state) {
            Object.assign(state, initialState);
        },
    },
});

// Action creators are generated for each case reducer function
export const { 
    setLoading,
    addOrUpdatePolicy,
    resetPolicies,
} = policiesSlice.actions;

export default policiesSlice.reducer;
