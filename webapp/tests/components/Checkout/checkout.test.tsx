import '@testing-library/jest-dom';
import { act, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import Checkout from '../../../src/components/Checkout/checkout';
import { setAddress } from '../../../src/redux/slices/wallet';
import { CoverageType } from '../../../src/types/coverage_type';
import { SIGNUP_STEP_CHECKOUT, SIGNUP_STEP_COVERAGE_TYPE } from '../../../src/utils/step_constants';
import { tMock } from '../../test-helper/i18n';
import { mockEmptyApplication } from '../../test-helper/mocks/redux/slices/application';
import { MYADDRESS, mockWallet } from '../../test-helper/mocks/redux/slices/common';
import { mockSignupBasic } from '../../test-helper/mocks/redux/slices/signup';
import { UNDEFINED_ROOT_STATE, renderWithProviders, renderWithProvidersAndDispatchMock } from '../../test-helper/render_with_providers';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

let storeForMock;

jest.mock('../../../src/hooks/onchain/use_wallet', () => ({
    useWallet: () => ({
        connectWallet: () => {
            storeForMock.dispatch(setAddress(MYADDRESS));
        }
    })
}));

jest.mock('../../../src/hooks/use_checkout', () => ({
    useCheckout: () => ({
        createNewApplication: () => {
            return Promise.resolve();
        }
    })
}));

// const useWallet = require('../../../../src/app/_hooks/onchain/use_wallet');

describe('Checkout', () => {
    it('renders back button and moves process one step back if clicked', () => {
        const { store } = renderWithProvidersAndDispatchMock(
            <Checkout />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_CHECKOUT,
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
                        finalPremium: 83,
                        endDate: dayjs().add(1, 'y').unix(),
                        type: CoverageType.FragileShield,
                    }
                },
            }
        );

        expect(store.getState().signup.step).toBe(SIGNUP_STEP_CHECKOUT);
        act(() => {
            screen.getByText('action.back').click();
        });
        expect(store.dispatch).toHaveBeenCalledWith({ type: 'signup/setStep', payload: SIGNUP_STEP_COVERAGE_TYPE });
    })

    it('renders offer data entered', () => {
        renderWithProviders(
            <Checkout />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_CHECKOUT,
                    },
                    application: {
                        ... mockEmptyApplication(),
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
                    }
                },
            }
        );

        expect(screen.getByTestId('offer-values')).toHaveTextContent('Zurich, Switzerland');
        expect(screen.getByTestId('offer-values')).toHaveTextContent(dayjs().add(1, 'y').format('DD MMM YYYY'));
        expect(screen.getByTestId('offer-values')).toHaveTextContent('USDC 23000');
        expect(screen.getByTestId('offer-values')).toHaveTextContent('protection_type_names.FragileShield');

        expect(screen.getByText('action.connect_wallet')).toBeInTheDocument();
    })

    it('render connect button that connects wallet when clicked', async () => {
        const { store } = renderWithProviders(
            <Checkout />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    wallet: {
                        ...mockWallet(),
                        address: null,
                    },
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_CHECKOUT,
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
                        finalPremium: 83,
                        referralCode: null,
                        endDate: dayjs().add(1, 'y').unix(),
                        type: CoverageType.FragileShield,
                    }
                },
            }
        );
        storeForMock = store;

        const connectButton = screen.getByText('action.connect_wallet');
        
        act(() => {
            connectButton.click();
        });

        await waitFor(async () => {
            expect(screen.getByTestId('wallet-details')).toHaveTextContent("your_wallet");
        });

    })

    it('render buy button when wallet is already connected', async () => {
        const { store } = renderWithProviders(
            <Checkout />,
            {
                preloadedState: {
                    ...UNDEFINED_ROOT_STATE,
                    wallet: mockWallet(),
                    signup: {
                        ...mockSignupBasic(),
                        step: SIGNUP_STEP_CHECKOUT,
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
                        finalPremium: 83,
                        referralCode: null,
                        endDate: dayjs().add(1, 'y').unix(),
                        type: CoverageType.FragileShield,
                    }
                },
            }
        );
        storeForMock = store;

        expect(screen.getByText('action.buy_protection {"amount":"USDC 83.00"}')).toBeInTheDocument();
    })

})
