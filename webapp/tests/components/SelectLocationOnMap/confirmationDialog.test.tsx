import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import ConfirmationDialog from '../../../src/components/SelectLocationOnMap/confirmationDialog';
import { SIGNUP_STEP_CONFIRM_LOCATION, SIGNUP_STEP_PREMIUM_AMOUNT, SIGNUP_STEP_SELECT_LOCATION } from '../../../src/utils/step_constants';
import { tMock } from '../../test-helper/i18n';
import { UNDEFINED_ROOT_STATE, renderWithProvidersAndDispatchMock } from '../../test-helper/render_with_providers';
import { mockEmptyApplication } from '../../test-helper/mocks/redux/slices/application';
import { mockSignupBasic } from '../../test-helper/mocks/redux/slices/signup';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

jest.mock('../../../src/components/SelectLocationOnMap/confirmation_dialog_map', () => {
    return {
        ConfirmationDialogMap: () => {
            return (
                <div data-testid="confirmation-dialog-map" />
            );
        },
    };
});

describe('ConfirmationDialog', () => {
    it('renders back button and moves process one step back if clicked', () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <ConfirmationDialog />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_CONFIRM_LOCATION,
                    },
                    application: {
                        ...mockEmptyApplication(),
                        locationCoordinates: {
                            // zurich
                            lat: 47.36667,
                            lng: 8.55,
                        },
                        locationName: 'Zurich, Switzerland',
                    }
                },
            }
        );

        expect(store.getState().signup.step).toBe(SIGNUP_STEP_CONFIRM_LOCATION);
        act(() => {
            screen.getByText('action.back').click();
        });
        expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_SELECT_LOCATION });
    })

    it('renders continue button and moves process one step forward if clicked', async () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <ConfirmationDialog />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_CONFIRM_LOCATION,
                    },
                    application: {
                        ...mockEmptyApplication(),
                        locationCoordinates: {
                            // zurich
                            lat: 47.36667,
                            lng: 8.55,
                        },
                        locationName: 'Zurich, Switzerland',
                    }
                },
            }
        );

        expect(store.getState().signup.step).toBe(SIGNUP_STEP_CONFIRM_LOCATION);
        act(() => {
            screen.getByText('action.continue').click();
        });
        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_PREMIUM_AMOUNT });
        });
    })

    it('renders location name and location coordinates', () => {
        renderWithProvidersAndDispatchMock(
            <ConfirmationDialog />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_CONFIRM_LOCATION,
                    },
                    application: {
                        ...mockEmptyApplication(),
                        locationCoordinates: {
                            // zurich
                            lat: 47.3666734657,
                            lng: 8.554567456,
                        },
                        locationName: 'Zurich, Switzerland',
                    }
                },
            }
        );

        expect(screen.getByTestId('policy-calculation-hint')).toHaveTextContent('Zurich, Switzerland');
        expect(screen.getByTestId('confirmation-values')).toHaveTextContent('Zurich, Switzerland');
        expect(screen.getByTestId('confirmation-values')).toHaveTextContent('47.3667°N');
        expect(screen.getByTestId('confirmation-values')).toHaveTextContent('8.5546°E');
    })
})
