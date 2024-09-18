import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { CheckoutSuccess } from '../../../src/components/CheckoutSuccess/checkout_success';
import { CoverageType } from '../../../src/types/coverage_type';
import { tMock } from '../../test-helper/i18n';
import { mockEmptyApplication } from '../../test-helper/mocks/redux/slices/application';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

const submitNotificationDetailsMock = jest.fn();
jest.mock('../../../src/hooks/api/use_qapi_application', () => ({
    useQApiApplication: () => ({
        submitNotificationDetails: submitNotificationDetailsMock,
    })
}));

describe('CheckoutSuccess', () => {
    it('shows success alert and renders offer data entered', () => {
        const appData = {
            ...mockEmptyApplication(),
            locationCoordinates: {
                // zurich
                lat: 47.36667,
                lng: 8.55,
            },
            locationName: 'Zurich, Switzerland',
            sumInsured: 23000,
            premium: 87,
            finalPremium: 83,
            endDate: dayjs().add(1, 'y').unix(),
            type: CoverageType.FragileShield,
            nftId: "233133705n",
        };
        render(
            <CheckoutSuccess symbol="USDC" applicationData={appData} />
        );

        expect(screen.getByTestId('alert-success')).toHaveTextContent('USDC 83');

        expect(screen.getByTestId('offer-values')).toHaveTextContent('Zurich, Switzerland');
        expect(screen.getByTestId('offer-values')).toHaveTextContent(dayjs().add(1, 'y').format('DD MMM YYYY'));
        expect(screen.getByTestId('offer-values')).toHaveTextContent('USDC 23000');
        expect(screen.getByTestId('offer-values')).toHaveTextContent('protection_type_names.FragileShield');
        expect(screen.getByTestId('offer-values')).toHaveTextContent('policy_state.APPLIED');
    })

    it('check the validity of the input in the email field when clicking the submit button', async () => {
        const appData = {
            ...mockEmptyApplication(),
            locationCoordinates: {
                // zurich
                lat: 47.36667,
                lng: 8.55,
            },
            locationName: 'Zurich, Switzerland',
            sumInsured: 23000,
            premium: 83,
            finalPremium: 83,
            endDate: dayjs().add(1, 'y').unix(),
            type: CoverageType.FragileShield,
            nftId: "233133705n",
        };
        render(
            <CheckoutSuccess symbol="USDC" applicationData={appData}/>
        );

        const emailAddressField = screen.getByTestId("form-notifyme").querySelector("input");
        const notifyMeButton = screen.getByText('checkout_success.notify_me');
        
        act(() => {
            notifyMeButton.click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("form-notifyme");
            return expect(input.querySelector("p.MuiFormHelperText-root")).toHaveTextContent("error.field.required");
        });

        act(() => {
            fireEvent.change(emailAddressField!, { target: { value: "so" } });
        });
        
        act(() => {
            notifyMeButton.click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("form-notifyme");
            return expect(input.querySelector("p.MuiFormHelperText-root")).toHaveTextContent("error.field.emailType");
        });

        act(() => {
            fireEvent.change(emailAddressField!, { target: { value: "someone@gmail.com" } });
        });
        
        expect(submitNotificationDetailsMock).not.toHaveBeenCalled();
        act(() => {
            notifyMeButton.click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("form-notifyme");
            return expect(input.querySelector("p.MuiFormHelperText-root")).not.toBeInTheDocument();
        });
        expect(submitNotificationDetailsMock).toHaveBeenCalledTimes(1);
        expect(submitNotificationDetailsMock).toHaveBeenCalledWith(BigInt(233133705), "someone@gmail.com");
    })

})
