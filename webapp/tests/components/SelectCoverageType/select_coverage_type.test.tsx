import '@testing-library/jest-dom';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import SelectCoverageType from '../../../src/components/SelectCoverageType/select_coverage_type';
import { SIGNUP_STEP_CHECKOUT, SIGNUP_STEP_COVERAGE_TYPE, SIGNUP_STEP_PREMIUM_AMOUNT } from '../../../src/utils/step_constants';
import { CoverageType } from '../../../src/types/coverage_type';
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

describe('SelectCoverageType', () => {
    it('renders back button and moves process one step back if clicked', () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <SelectCoverageType />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_COVERAGE_TYPE,
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

        expect(store.getState().signup.step).toBe(SIGNUP_STEP_COVERAGE_TYPE);
        act(() => {
            screen.getByText('action.back').click();
        });
        expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_PREMIUM_AMOUNT });
    })

    it('renders offer data entered up to this point', () => {
        const endDate = dayjs().add(1, 'y').unix();

        renderWithProvidersAndDispatchMock(
            <SelectCoverageType />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_COVERAGE_TYPE,
                        availableTypes: [
                            {
                                type: CoverageType.FragileShield,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                premium: 104,
                                ratio: 5,
                                sumInsured: 520,
                                payoutScheme: [
                                    { mmiLevel: 5, payout: 12500, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 6, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 7, payout: 50000, payoutPercentage: 1 } 
                                ],
                            },
                            {
                                type: CoverageType.HomeGuard,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                premium: 101,
                                ratio: 50,
                                sumInsured: 5050,
                                payoutScheme: [
                                    { mmiLevel: 6, payout: 10000, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 7, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 8, payout: 500000, payoutPercentage: 1 } 
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
                        sumInsured: 23000,
                        premium: 83,
                        endDate: endDate,
                    }
                },
            }
        );

        expect(screen.getByTestId('offer-values')).toHaveTextContent('Zurich, Switzerland');
        expect(screen.getByTestId('offer-values')).toHaveTextContent(dayjs().add(1, 'y').format('DD MMM YYYY'));
        expect(screen.getByTestId('offer-values')).toHaveTextContent('USDC 83');

        expect(screen.getByTestId('coverage-type-FragileShield')).toHaveTextContent('MMI 5+');
        expect(screen.getByTestId('coverage-type-FragileShield')).toHaveTextContent('MMI 6+');
        expect(screen.getByTestId('coverage-type-FragileShield')).toHaveTextContent('MMI 7+');
        expect(screen.getByTestId('coverage-type-FragileShield')).toHaveTextContent('USDC 12500');
        expect(screen.getByTestId('coverage-type-FragileShield')).toHaveTextContent('USDC 25000');
        expect(screen.getByTestId('coverage-type-FragileShield')).toHaveTextContent('USDC 50000');

        expect(screen.getByTestId('coverage-type-HomeGuard')).toHaveTextContent('MMI 6+');
        expect(screen.getByTestId('coverage-type-HomeGuard')).toHaveTextContent('MMI 7+');
        expect(screen.getByTestId('coverage-type-HomeGuard')).toHaveTextContent('MMI 8+');
        expect(screen.getByTestId('coverage-type-HomeGuard')).toHaveTextContent('USDC 25000');
        expect(screen.getByTestId('coverage-type-HomeGuard')).toHaveTextContent('USDC 50000');
        expect(screen.getByTestId('coverage-type-HomeGuard')).toHaveTextContent('USDC 10000');
    })

    it('renders card with radio buttons and a continue button and moves process one step forward if radio button is selected and continue clicked', async () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <SelectCoverageType />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_COVERAGE_TYPE,
                        availableTypes: [
                            {
                                type: CoverageType.FragileShield,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                premium: 101,
                                ratio: 5,
                                sumInsured: 505,
                                payoutScheme:  [ 
                                    { mmiLevel: 5, payout: 12500, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 6, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 7, payout: 50000, payoutPercentage: 1 } 
                                ],
                            },
                            {
                                type: CoverageType.HomeGuard,
                                premium: 101,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                ratio: 50,
                                sumInsured: 5050,
                                payoutScheme: [
                                    { mmiLevel: 6, payout: 12500, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 7, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 8, payout: 500000, payoutPercentage: 1 } 
                                ],
                            },
                        ],
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

        const radio = screen.getByTestId("radio-type-FragileShield").querySelector('input');
        const continueButton = screen.getByText('action.continue');
        
        act(() => {
            fireEvent.click(radio);
        });
        
        expect(store.getState().signup.step).toBe(SIGNUP_STEP_COVERAGE_TYPE);
        act(() => {
            continueButton.click();
        });

        await waitFor(async () => {
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'application/setType', payload: { type: CoverageType.FragileShield, sumInsured: 505, triggerMmi: 5 } });
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_CHECKOUT });
        });
    })

    it('renders coverage type as card which responds to clicks', async () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <SelectCoverageType />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_COVERAGE_TYPE,
                        availableTypes: [
                            {
                                type: CoverageType.FragileShield,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                premium: 101,
                                ratio: 5,
                                sumInsured: 505,
                                payoutScheme:  [ 
                                    { mmiLevel: 5, payout: 12500, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 6, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 7, payout: 50000, payoutPercentage: 1 } 
                                ],
                            },
                            {
                                type: CoverageType.HomeGuard,
                                premium: 101,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                ratio: 50,
                                sumInsured: 5050,
                                payoutScheme: [
                                    { mmiLevel: 6, payout: 12500, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 7, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 8, payout: 500000, payoutPercentage: 1 } 
                                ],
                            },
                        ],
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

        const card = screen.getByTestId("radio-type-HomeGuard");
        
        act(() => {
            fireEvent.click(card);
        });
        
        expect(store.getState().signup.step).toBe(SIGNUP_STEP_COVERAGE_TYPE);
        const continueButton = screen.getByText('action.continue');
        act(() => {
            continueButton.click();
        });

        await waitFor(async () => {
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'application/setType', payload: { type: CoverageType.HomeGuard, sumInsured: 5050, triggerMmi: 6 } });
            expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_CHECKOUT });
        });
    })

    it('shows an error if no type is selected', async () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <SelectCoverageType />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_COVERAGE_TYPE,
                        availableTypes: [
                            {
                                type: CoverageType.FragileShield,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                premium: 83,
                                ratio: 5,
                                sumInsured: 23000,
                                payoutScheme: [ 
                                    { mmiLevel: 5, payout: 12500, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 6, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 7, payout: 50000, payoutPercentage: 1 } 
                                ],
                            },
                            {
                                type: CoverageType.HomeGuard,
                                minimumPremium: 0,
                                maximumPremium: 10000,
                                premium: 43,
                                ratio: 50,
                                sumInsured: 50000,
                                payoutScheme: [
                                    { mmiLevel: 6, payout: 12500, payoutPercentage: 0.25 }, 
                                    { mmiLevel: 7, payout: 25000, payoutPercentage: 0.5 }, 
                                    { mmiLevel: 8, payout: 500000, payoutPercentage: 1 } 
                                ],
                            },
                        ],
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

        const continueButton = screen.getByText('action.continue');
        
        expect(store.getState().signup.step).toBe(SIGNUP_STEP_COVERAGE_TYPE);
        act(() => {
            continueButton.click();
        });

        await waitFor(async () => {
            expect(screen.getByTestId('error-no-type-selected')).toBeInTheDocument();
        });
    })
})
