import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { tMock } from '../../test-helper/i18n';
import { UNDEFINED_ROOT_STATE, renderWithProviders } from '../../test-helper/render_with_providers';
import { mockWallet } from '../../test-helper/mocks/redux/slices/common';
import Wallet from '../../../src/components/TopBar/wallet';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

jest.mock('../../../src/components/(basic_widgets)/Jazzicon/jazzicon_avatar', () => {
    return {
        JazziconAvatar: () => <div>MockJazzicon</div>
    }
});

const disconnectWalletMock = jest.fn();
const refreshBalanceMock = jest.fn();
jest.mock('../../../src/hooks/onchain/use_wallet', () => ({
    useWallet: () => ({
        connectWallet: jest.fn(),
        disconnectWallet: disconnectWalletMock,
        refreshBalance: refreshBalanceMock,
    })
}));

describe('Wallet', () => {
    it('renders wallet data', () => {
        renderWithProviders(
            <Wallet />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    wallet: {
                        ...mockWallet(),
                        balanceEth: '12345670000000000000000',
                        balanceUsdc: '72578000',
                    }
                },
            }
        );

        expect(screen.getByText('MockJazzicon')).toBeInTheDocument();
        expect(screen.getByText('0x2CeC…4729')).toBeInTheDocument();
        expect(screen.getByText('MATIC 12345.67')).toBeInTheDocument();
        expect(screen.getByText('USDC 72.58')).toBeInTheDocument();
    })

    it('disconnects wallet', () => {
        renderWithProviders(
            <Wallet />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    wallet: mockWallet(),
                },
            }
        );

        screen.getByTestId('disconnect-button').click();

        expect(disconnectWalletMock).toHaveBeenCalledTimes(1);
    })

    it('refreshes balance', () => {
        renderWithProviders(
            <Wallet />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    wallet: mockWallet(),
                },
            }
        );

        screen.getByText('action.refresh').click();

        expect(refreshBalanceMock).toHaveBeenCalledTimes(1);
    })
})
