import '@testing-library/jest-dom';
import { waitFor } from '@testing-library/react';
import { SIGNUP_STEP_SELECT_LOCATION } from '../../../../src/utils/step_constants';
import CheckoutSuccessPage from '../../../../src/app/apply/success/page';
import { tMock } from '../../../test-helper/i18n';
import { renderWithProvidersAndDispatchMock } from '../../../test-helper/render_with_providers';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

jest.mock('../../../../src/components/CheckoutSuccess/checkout_success', () => {
    return {
        CheckoutSuccess: () => {
            return (
                <div data-testid="checkout-success" />
            );
        },
    };
});

describe('CheckoutSuccessPage', () => {
    it('renders and resets redux signup state after loading', async () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <CheckoutSuccessPage />
        );

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'application/resetApplication' });
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_SELECT_LOCATION });
        });
    })
})
