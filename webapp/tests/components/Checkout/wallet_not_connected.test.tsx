import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { PublicEnvProvider } from 'next-runtime-env';
import WalletNotConnected from '../../../src/components/Checkout/wallet_not_connected';
import { tMock } from '../../test-helper/i18n';
import { renderWithProviders } from '../../test-helper/render_with_providers';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

describe('WalletNotConnected', () => {
    it('renders premium and connect button', () => {
        renderWithProviders(
            <PublicEnvProvider>
                <WalletNotConnected premium={42} symbol="USDC" />,
            </PublicEnvProvider>
        );

        expect(screen.getByText('USDC 42')).toBeInTheDocument();
        expect(screen.getByText('action.connect_wallet')).toBeInTheDocument();
    })
})
