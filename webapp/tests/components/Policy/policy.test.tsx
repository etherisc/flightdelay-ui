import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { parseUnits } from 'ethers';
import Policy from '../../../src/components/Policy/policy';
import { PolicyData, PolicyState } from '../../../src/types/policy_data';
import { tMock } from '../../test-helper/i18n';
import { renderWithProviders } from '../../test-helper/render_with_providers';
import { stringifyBigInt } from '../../../src/utils/bigint';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));  

jest.mock('../../../src/components/Policy/embedded_map', () => {
    return {
        EmbeddedMap: () => {
            return (
                <div data-testid="embedded-map" />
            );
        },
    };
});

describe('Policy', () => {
    // TODO applied and rejected policies
    it('renders policy in state active', () => {
        const createdTs = dayjs.unix(1699861967);
        const policy = {
            nftId: '133133705n',
            state: PolicyState.ACTIVE,
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
            <Policy policy={policy} symbol="USDC" />
        );

        expect(screen.queryByText('action.renew')).not.toBeInTheDocument();
        // reactivate when above is fixed -> expect(screen.getByText('action.renew')).toBeDisabled();
        expect(screen.getByText('action.transfer')).toBeInTheDocument();
        expect(screen.getByText('action.transfer')).toBeEnabled();
        expect(screen.getByText('action.claim')).toBeInTheDocument();
        expect(screen.getByText('action.claim')).toBeDisabled();

        expect(screen.getByTestId('state')).toHaveTextContent('mypolicies.expires 12 Nov 2024');
        expect(screen.getByTestId('nftid')).toHaveTextContent('133133705');
        expect(screen.getByTestId('sum-insured')).toHaveTextContent('USDC 50.00');
        expect(screen.getByTestId('claimed')).toHaveTextContent('USDC 13.00');
        expect(screen.getByTestId('premium')).toHaveTextContent('USDC 10.00');
        expect(screen.getByTestId('created')).toHaveTextContent('13 Nov 2023');
        expect(screen.getByTestId('expires')).toHaveTextContent('12 Nov 2024');

        expect(screen.getByTestId('embedded-map')).toBeInTheDocument();
        expect(screen.getByTestId('location-name')).toHaveTextContent('Zuerich (Mock)');
        expect(screen.getByTestId('location-coordinates')).toHaveTextContent('47.1530°N, 9.8219°E');

        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 5+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 6+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 7+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 12.50');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 25.00');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 50.00');
    })

    it('renders policy in state applied', () => {
        const createdTs = dayjs.unix(1699861967);
        const policy = {
            nftId: '133133705n',
            state: PolicyState.APPLIED,
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
            <Policy policy={policy} symbol="USDC" />
        );

        expect(screen.queryByText('action.renew')).not.toBeInTheDocument();
        // reactivate when above is fixed -> expect(screen.getByText('action.renew')).toBeDisabled();
        expect(screen.queryByText('action.transfer')).not.toBeInTheDocument();
        expect(screen.getByText('action.claim')).toBeInTheDocument();
        expect(screen.getByText('action.claim')).toBeDisabled();

        expect(screen.getByTestId('state')).toHaveTextContent('state.APPLIED');
        expect(screen.getByTestId('nftid')).toHaveTextContent('133133705');
        expect(screen.getByTestId('sum-insured')).toHaveTextContent('USDC 50.00');
        expect(screen.getByTestId('claimed')).toHaveTextContent('USDC 13.00');
        expect(screen.getByTestId('premium')).toHaveTextContent('USDC 10.00');
        expect(screen.getByTestId('created')).toHaveTextContent('13 Nov 2023');
        expect(screen.getByTestId('expires')).toHaveTextContent('12 Nov 2024');

        expect(screen.getByTestId('embedded-map')).toBeInTheDocument();
        expect(screen.getByTestId('location-name')).toHaveTextContent('Zuerich (Mock)');
        expect(screen.getByTestId('location-coordinates')).toHaveTextContent('47.1530°N, 9.8219°E');

        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 5+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 6+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 7+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 12.50');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 25.00');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 50.00');
    })

    it('renders policy in state rejected', () => {
        const createdTs = dayjs.unix(1699861967);
        const policy = {
            nftId: '133133705n',
            state: PolicyState.DECLINED,
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
            <Policy policy={policy} symbol="USDC" />
        );

        expect(screen.queryByText('action.renew')).not.toBeInTheDocument();
        // reactivate when above is fixed -> expect(screen.getByText('action.renew')).toBeDisabled();
        expect(screen.queryByText('action.transfer')).not.toBeInTheDocument();
        expect(screen.getByText('action.claim')).toBeInTheDocument();
        expect(screen.getByText('action.claim')).toBeDisabled();

        expect(screen.getByTestId('state')).toHaveTextContent('state.DECLINED');
        expect(screen.getByTestId('nftid')).toHaveTextContent('133133705');
        expect(screen.getByTestId('sum-insured')).toHaveTextContent('USDC 50.00');
        expect(screen.getByTestId('claimed')).toHaveTextContent('USDC 13.00');
        expect(screen.getByTestId('premium')).toHaveTextContent('USDC 10.00');
        expect(screen.getByTestId('created')).toHaveTextContent('13 Nov 2023');
        expect(screen.getByTestId('expires')).toHaveTextContent('12 Nov 2024');

        expect(screen.getByTestId('embedded-map')).toBeInTheDocument();
        expect(screen.getByTestId('location-name')).toHaveTextContent('Zuerich (Mock)');
        expect(screen.getByTestId('location-coordinates')).toHaveTextContent('47.1530°N, 9.8219°E');

        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 5+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 6+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('MMI 7+');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 12.50');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 25.00');
        expect(screen.getByTestId('payout-scale')).toHaveTextContent('USDC 50.00');
    })
})
