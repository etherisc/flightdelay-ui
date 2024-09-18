import '@testing-library/jest-dom';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import dayjs from "dayjs";
import { PolicyTransfer } from "../../../src/components/PolicyTransfer/policy_transfer";
import { PolicyData } from "../../../src/types/policy_data";
import { tMock } from "../../test-helper/i18n";
import { renderWithProviders } from "../../test-helper/render_with_providers";
import { parseUnits } from 'ethers';
import { stringifyBigInt } from '../../../src/utils/bigint';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

describe('PolicyTransfer', () => {
    it('show a TextField to enter the recipient address and a continue button and validates the input', async () => {
        const createdTs = dayjs().add(-1, 'd');
        const policy = {
            nftId: '133133705n',
            state: 0,
            type: 'FragileShield',
            premium: '10000000n',
            sumInsured: '50000000n',
            locationId: 217,
            locationName: 'Zuerich (Mock)',
            locationCoordinates: {
                lat: 47.153,
                lng: 9.8219
            },
            claimedAmount: '13000000n',
            createdAt: createdTs.unix(),
            expirationAt: createdTs.add(1, 'year').add(-1, 'd').unix(),
            payoutScale: [
                { mmiLevel: stringifyBigInt(BigInt(5)), payoutAmount: stringifyBigInt(parseUnits("12.5", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(6)), payoutAmount: stringifyBigInt(parseUnits("25", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(7)), payoutAmount: stringifyBigInt(parseUnits("50", 6)) },
            ]
        } as PolicyData;

        renderWithProviders(
            <PolicyTransfer policy={policy} onTransfer={jest.fn()}/>,
            {}
        );

        const recipientAddressField = screen.getByTestId("recipient").querySelector("input");
        expect(recipientAddressField).toBeInTheDocument();
        expect(recipientAddressField).toHaveValue("");

        expect(screen.getByText("action.transfer")).toBeInTheDocument();
        expect(screen.getByText('mypolicies.transfer.instructions {"nftId":"133133705"}')).toBeInTheDocument();
        expect(screen.getByText("mypolicies.transfer.warning")).toBeInTheDocument();

        act(() => {
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.getByText("error.field.required")).toBeInTheDocument();
        })

        act(() => {
            fireEvent.change(recipientAddressField, { target: { value: 'abd' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.getByText("error.field.walletType")).toBeInTheDocument();
        })

        // reset error to required
        act(() => {
            fireEvent.change(recipientAddressField, { target: { value: '' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.getByText("error.field.required")).toBeInTheDocument();
        })

        act(() => {
            fireEvent.change(recipientAddressField, { target: { value: '0x' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.getByText("error.field.walletType")).toBeInTheDocument();
        })

        // reset error to required
        act(() => {
            fireEvent.change(recipientAddressField, { target: { value: '' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.getByText("error.field.required")).toBeInTheDocument();
        })

        act(() => {
            // wallet address
            fireEvent.change(recipientAddressField, { target: { value: '0x1234567890123456789012345678901234567890' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.queryByText('mypolicies.transfer.confirmation {"nftId":"133133705"}')).toBeInTheDocument();
        })
    })

    it('shows confirmation dialog when recipient address is valid and continue button is clicked', async () => {
        const createdTs = dayjs().add(-1, 'd');
        const policy = {
            nftId: '133133705n',
            state: 0,
            type: 'FragileShield',
            premium: '10000000n',
            sumInsured: '50000000n',
            locationId: 217,
            locationName: 'Zuerich (Mock)',
            locationCoordinates: {
                lat: 47.153,
                lng: 9.8219
            },
            claimedAmount: '13000000n',
            createdAt: createdTs.unix(),
            expirationAt: createdTs.add(1, 'year').add(-1, 'd').unix(),
            payoutScale: [
                { mmiLevel: stringifyBigInt(BigInt(5)), payoutAmount: stringifyBigInt(parseUnits("12.5", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(6)), payoutAmount: stringifyBigInt(parseUnits("25", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(7)), payoutAmount: stringifyBigInt(parseUnits("50", 6)) },
            ]
        } as PolicyData;

        const onTransfer = jest.fn();

        renderWithProviders(
            <PolicyTransfer policy={policy} onTransfer={onTransfer}/>,
            {}
        );

        const recipientAddressField = screen.getByTestId("recipient").querySelector("input");
        
        act(() => {
            fireEvent.change(recipientAddressField, { target: { value: '0x1234567890123456789012345678901234567890' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.queryByText('mypolicies.transfer.confirmation {"nftId":"133133705"}')).toBeInTheDocument();
        })

        expect(screen.getByText('action.abort')).toBeInTheDocument();
        expect(screen.getByText('action.continue')).toBeInTheDocument();
        expect(recipientAddressField).toBeDisabled();
    })

    it('calls onTransfer when continue button is clicked on confirmation screeen', async () => {
        const createdTs = dayjs().add(-1, 'd');
        const policy = {
            nftId: '133133705n',
            state: 0,
            type: 'FragileShield',
            premium: '10000000n',
            sumInsured: '50000000n',
            locationId: 217,
            locationName: 'Zuerich (Mock)',
            locationCoordinates: {
                lat: 47.153,
                lng: 9.8219
            },
            claimedAmount: '13000000n',
            createdAt: createdTs.unix(),
            expirationAt: createdTs.add(1, 'year').add(-1, 'd').unix(),
            payoutScale: [
                { mmiLevel: stringifyBigInt(BigInt(5)), payoutAmount: stringifyBigInt(parseUnits("12.5", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(6)), payoutAmount: stringifyBigInt(parseUnits("25", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(7)), payoutAmount: stringifyBigInt(parseUnits("50", 6)) },
            ]
        } as PolicyData;

        const onTransfer = jest.fn();

        renderWithProviders(
            <PolicyTransfer policy={policy} onTransfer={onTransfer}/>,
            {}
        );

        const recipientAddressField = screen.getByTestId("recipient").querySelector("input");
        
        act(() => {
            fireEvent.change(recipientAddressField, { target: { value: '0x1234567890123456789012345678901234567890' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.queryByText('mypolicies.transfer.confirmation {"nftId":"133133705"}')).toBeInTheDocument();
        })

        act(() => {
            screen.getByText('action.continue').click();
        })

        await waitFor(() => {
            expect(onTransfer).toHaveBeenCalledTimes(1);
            expect(onTransfer).toHaveBeenCalledWith(BigInt(133133705), '0x1234567890123456789012345678901234567890');
        })
    })

    it('hides confirmation dialog when abort button is clicked', async () => {
        const createdTs = dayjs().add(-1, 'd');
        const policy = {
            nftId: '133133705n',
            state: 0,
            type: 'FragileShield',
            premium: '10000000n',
            sumInsured: '50000000n',
            locationId: 217,
            locationName: 'Zuerich (Mock)',
            locationCoordinates: {
                lat: 47.153,
                lng: 9.8219
            },
            claimedAmount: '13000000n',
            createdAt: createdTs.unix(),
            expirationAt: createdTs.add(1, 'year').add(-1, 'd').unix(),
            payoutScale: [
                { mmiLevel: stringifyBigInt(BigInt(5)), payoutAmount: stringifyBigInt(parseUnits("12.5", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(6)), payoutAmount: stringifyBigInt(parseUnits("25", 6)) },
                { mmiLevel: stringifyBigInt(BigInt(7)), payoutAmount: stringifyBigInt(parseUnits("50", 6)) },
            ]
        } as PolicyData;

        const onTransfer = jest.fn();

        renderWithProviders(
            <PolicyTransfer policy={policy} onTransfer={onTransfer}/>,
            {}
        );

        const recipientAddressField = screen.getByTestId("recipient").querySelector("input");
        
        act(() => {
            fireEvent.change(recipientAddressField, { target: { value: '0x1234567890123456789012345678901234567890' } });
            screen.getByText("action.transfer").click();
        })

        await waitFor(() => {
            expect(screen.queryByText('mypolicies.transfer.confirmation {"nftId":"133133705"}')).toBeInTheDocument();
        })

        act(() => {
            screen.getByText('action.abort').click();
        })

        await waitFor(() => {
            expect(screen.queryByText('mypolicies.transfer.confirmation {"nftId":"133133705"}')).not.toBeInTheDocument();
            expect(recipientAddressField).toBeEnabled();
        })
    })
})