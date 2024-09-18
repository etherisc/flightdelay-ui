import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import ConnectButton from '../../../src/components/TopBar/connect_button';
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

// mock useWalet
const connectWalletMock = jest.fn();
jest.mock('../../../src/hooks/onchain/use_wallet', () => ({
    useWallet: () => ({
        connectWallet: connectWalletMock,
    }),
}));

describe('ConnectButton', () => {
    it('renders connect text', async () => {
        renderWithProviders(
            <ConnectButton />
        );

        expect(screen.getByText('action.connect')).toBeInTheDocument();
    });

    it('connects wallet on click', async () => {
        renderWithProviders(
            <ConnectButton />
        );

        act(() => {
            fireEvent.click(screen.getByText('action.connect'));
        });

        await waitFor(() => {
            expect(connectWalletMock).toHaveBeenCalledTimes(1);
        });
    })
})
