import '@testing-library/jest-dom';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import ReferralCodeForm from '../../../src/components/Checkout/referral_code_form';
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

describe('ReferralCodeForm', () => {
    it('validates input', async () => {
        const applyMock = jest.fn();

        renderWithProviders(
            <ReferralCodeForm 
                referralCode={null}
                onApplyReferralCode={applyMock}
                />,
        );

        const applyButton = screen.getByText('checkout.apply_referral_code');
        expect(applyMock).toHaveBeenCalledTimes(0);

        act(() => {
            applyButton.click();
        });

        expect(applyMock).toHaveBeenCalledTimes(0);

        await waitFor(async () => {
            const input = await screen.findByTestId("referralCode");
            return expect(input.querySelector("p.MuiFormHelperText-root")).toHaveTextContent("error.field.required");
        });

        act(() => {
            fireEvent.change(screen.getByTestId("referralCode").querySelector("input"), { target: { value: "abc" } });
            applyButton.click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("referralCode");
            return expect(input.querySelector("p.MuiFormHelperText-root")).not.toBeInTheDocument();
        });

        expect(applyMock).toHaveBeenCalledTimes(1);
    })

    it('shows preloaded referral code', async () => {
        const applyMock = jest.fn();

        renderWithProviders(
            <ReferralCodeForm 
                referralCode="MYCODE"
                onApplyReferralCode={applyMock}
                />,
        );

        const input = (await screen.findByTestId("referralCode")).querySelector("input");
        expect(input).toHaveValue("MYCODE");
    })

})
