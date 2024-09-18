import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import Address from '../../../src/components/TopBar/address';
import { tMock } from '../../test-helper/i18n';
import { UNDEFINED_ROOT_STATE, renderWithProviders } from '../../test-helper/render_with_providers';
import { mockWallet } from '../../test-helper/mocks/redux/slices/common';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));  

describe('Address', () => {
    it('renders shortened wallet address', () => {
        renderWithProviders(
            <Address />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    wallet: mockWallet(),
                },
            }
        );

        expect(screen.getByText('0x2CeC…4729')).toBeInTheDocument();
    })
})
