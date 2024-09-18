import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import EnterPremiumAmount from '../../../src/components/EnterPremiumAmount/enter_premium_amount';
import { SIGNUP_STEP_CONFIRM_LOCATION, SIGNUP_STEP_COVERAGE_TYPE, SIGNUP_STEP_PREMIUM_AMOUNT } from '../../../src/utils/step_constants';
import { CoverageType } from '../../../src/types/coverage_type';
import { tMock } from '../../test-helper/i18n';
import { UNDEFINED_ROOT_STATE, renderWithProviders, renderWithProvidersAndDispatchMock } from '../../test-helper/render_with_providers';
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

describe('EnterPremiumAmount', () => {
    it('renders back button and moves process one step back if clicked', () => {
        const { store } = renderWithProviders(
            <EnterPremiumAmount />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_PREMIUM_AMOUNT,
                    },
                    application: {
                        ...mockEmptyApplication(),
                        locationCoordinates: {
                            // zurich
                            lat: 47.36667,
                            lng: 8.55,
                        },
                        locationName: 'Zurich, Switzerland',
                        endDate: dayjs().add(1, 'y').unix(),
                    }
                },
            }
        );

        expect(store.getState().signup.step).toBe(SIGNUP_STEP_PREMIUM_AMOUNT);
        act(() => {
            screen.getByText('action.back').click();
        });
        expect(store.getState().signup.step).toBe(SIGNUP_STEP_CONFIRM_LOCATION);
    })

    it('renders continue button and moves process one step forward if clicked', async () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <EnterPremiumAmount />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_PREMIUM_AMOUNT,
                        availableTypes: [
                            {
                                type: CoverageType.FragileShield,
                                sumInsured: 10000,
                                premium: 100,
                                minimumPremium: 10,
                                maximumPremium: 2000,
                                ratio: 5,
                                payoutScheme: [
                                    { mmiLevel: 5, payout: null, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 6, payout: null, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 7, payout: null, payoutPercentage: 1 } 
                                ],
                            },
                            {
                                type: CoverageType.HomeGuard,
                                sumInsured: 50000,
                                premium: 100,
                                minimumPremium: 100,
                                maximumPremium: 10000,
                                ratio: 50,
                                payoutScheme: [
                                    { mmiLevel: 6, payout: null, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 7, payout: null, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 8, payout: null, payoutPercentage: 1 } 
                                ],
                            },
                        ]
                    },
                    application: {
                        ...mockEmptyApplication(),
                        locationCoordinates: {
                            // zurich
                            lat: 47.36667,
                            lng: 8.55,
                        },
                        locationName: 'Zurich, Switzerland',
                        endDate: dayjs().add(1, 'y').unix(),
                    },
                },
            }
        );

        const premiumInput = screen.getByTestId('amount').querySelector('input');
        
        act(() => {
            fireEvent.change(premiumInput, { target: { value: '50' } });
        });

        act(() => {
            screen.getByText('action.continue').click();
        });

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'application/setPremium', payload: 50 });
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setSumInsured', payload: { type: CoverageType.FragileShield, sumInsured: 250 } });
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setSumInsured', payload: { type: CoverageType.HomeGuard, sumInsured: 2500 } });
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_COVERAGE_TYPE });
        });
    })

    it('validates premium amount input', async () => {
        renderWithProviders(
            <EnterPremiumAmount />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_PREMIUM_AMOUNT,
                        availableTypes: [
                            {
                                type: CoverageType.FragileShield,
                                sumInsured: 10000,
                                premium: 100,
                                minimumPremium: 12,
                                maximumPremium: 2000,
                                ratio: 5,
                                payoutScheme: [
                                    { mmiLevel: 5, payout: null, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 6, payout: null, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 7, payout: null, payoutPercentage: 1 } 
                                ],
                            },
                            {
                                type: CoverageType.HomeGuard,
                                sumInsured: 50000,
                                premium: 100,
                                minimumPremium: 100,
                                maximumPremium: 11000,
                                ratio: 50,
                                payoutScheme: [
                                    { mmiLevel: 6, payout: null, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 7, payout: null, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 8, payout: null, payoutPercentage: 1 } 
                                ],
                            },
                        ]
                    },
                    application: {
                        ...mockEmptyApplication(),
                        locationCoordinates: {
                            // zurich
                            lat: 47.36667,
                            lng: 8.55,
                        },
                        locationName: 'Zurich, Switzerland',
                        endDate: dayjs().add(1, 'y').unix(),
                    }
                },
            }
        );

        const premiumInput = screen.getByTestId('amount').querySelector('input');
        
        act(() => {
            fireEvent.change(premiumInput, { target: { value: '' } });
            screen.getByText('action.continue').click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("amount");
            return expect(input.querySelector("p.MuiFormHelperText-root").innerHTML).toContain("error.field.required");
        });

        act(() => {
            fireEvent.change(premiumInput, { target: { value: '5' } });
            screen.getByText('action.continue').click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("amount");
            return expect(input.querySelector("p.MuiFormHelperText-root").innerHTML).toContain("error.field.min");
        });

        act(() => {
            fireEvent.change(premiumInput, { target: { value: '111111' } });
            screen.getByText('action.continue').click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("amount");
            return expect(input.querySelector("p.MuiFormHelperText-root").innerHTML).toContain("error.field.max");
        });

        act(() => {
            fireEvent.change(premiumInput, { target: { value: '1000' } });
            screen.getByText('action.continue').click();
        });

        await waitFor(async () => {
            const input = await screen.findByTestId("amount");
            return expect(input.querySelector("p.MuiFormHelperText-root")).toBeNull();
        });
    })

    it('recalculatest the maximum sumInsured when premium is entered', async () => {
        renderWithProviders(
            <EnterPremiumAmount />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_PREMIUM_AMOUNT,
                        availableTypes: [
                            {
                                type: CoverageType.FragileShield,
                                sumInsured: 10000,
                                premium: 100,
                                minimumPremium: 12,
                                maximumPremium: 2000,
                                ratio: 5,
                                payoutScheme: [
                                    { mmiLevel: 5, payout: null, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 6, payout: null, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 7, payout: null, payoutPercentage: 1 } 
                                ],
                            },
                            {
                                type: CoverageType.HomeGuard,
                                sumInsured: 50000,
                                premium: 100,
                                minimumPremium: 100,
                                maximumPremium: 11000,
                                ratio: 50,
                                payoutScheme: [
                                    { mmiLevel: 6, payout: null, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 7, payout: null, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 8, payout: null, payoutPercentage: 1 } 
                                ],
                            },
                        ]
                    },
                    application: {
                        ...mockEmptyApplication(),
                        locationCoordinates: {
                            // zurich
                            lat: 47.36667,
                            lng: 8.55,
                        },
                        locationName: 'Zurich, Switzerland',
                        endDate: dayjs().add(1, 'y').unix(),
                    }
                },
            }
        );

        const sumInsuredFragileShield = await screen.findByTestId("sum-insured-FragileShield");
        // console.log("sumInsuredFragileShield", sumInsuredFragileShield.innerHTML)
        expect(sumInsuredFragileShield.innerHTML).toContain("USDC 60");
        const sumInsuredHomeGuard = await screen.findByTestId("sum-insured-HomeGuard");
        expect(sumInsuredHomeGuard.innerHTML).toContain("USDC 600");

        const premiumInput = screen.getByTestId('amount').querySelector('input');
        
        act(() => {
            fireEvent.change(premiumInput, { target: { value: '100' } });
            screen.getByText('action.continue').click();
        });

        await waitFor(async () => {
            const sumInsuredFragileShield = await screen.findByTestId("sum-insured-FragileShield");
            expect(sumInsuredFragileShield.innerHTML).toContain("USDC 500");
            const sumInsuredHomeGuard = await screen.findByTestId("sum-insured-HomeGuard");
            expect(sumInsuredHomeGuard.innerHTML).toContain("USDC 5000");
        });
    })
})
