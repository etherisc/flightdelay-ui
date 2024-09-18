import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { ContractTransactionResponse, Signer } from 'ethers';
import { act } from 'react-dom/test-utils';
import { useCheckout } from '../../src/hooks/use_checkout';
import { Coordinates } from '../../src/types/coordinates';
import { CoverageType } from '../../src/types/coverage_type';
import { BaseError } from '../../src/utils/error';
import { withRouterAndEnvProviderWrapper } from '../test-helper/render_with_providers';
import { PATH_SIGNUP_SUCCESS } from '../../src/utils/paths';

jest.mock('../../src/hooks/onchain/use_wallet', () => ({
    useWallet: () => ({
        connectWallet: jest.fn(),
        getSigner: jest.fn(),
    })
}));

const createApplicationMock = jest.fn().mockImplementation(async (signer: Signer,
    locationId: number,
    locationCoordinates: Coordinates,
    referralCode: string,
    triggerMmi: number,
    coverageType: CoverageType,
    sumInsuredAmountInWei: bigint,
    premiumAmountInWei: bigint,
    onTransactionCreated?: (tx: ContractTransactionResponse) => Promise<void>,) => {
        await onTransactionCreated({ hash: "0x1234" } as ContractTransactionResponse);
        return Promise.resolve({ nftId: 42 });
});
const TOKENHANDLER_ADDRESS = "0x1234123412341234123412341234123412341234";
jest.mock('../../src/hooks/onchain/use_product_contract', () => ({
    useProductContract: () => ({
        createApplication: createApplicationMock,
        getTokenHandlerAddress: async () => { return Promise.resolve(TOKENHANDLER_ADDRESS) },
    })
}));

let discountPercentage = 0.1;
let referralStatus = 10;
const calculateDiscountPercentageMock = jest.fn().mockImplementation(() => {
    return Promise.resolve({
        discountPercentage,
        referralStatus,
    });
});

jest.mock('../../src/hooks/onchain/use_distribution_contract', () => ({
    useDistributionContract: () => ({
        calculateDiscountPercentage: calculateDiscountPercentageMock
    })
}));

const createApprovalMock = jest.fn().mockImplementation(() => {
    return Promise.resolve();
});

let hasBalanceResponse = true;
jest.mock('../../src/hooks/onchain/use_erc20_contract', () => ({
    useERC20Contract: () => ({
        createApproval: createApprovalMock,
        convertAmountToWei: (amt: number) => {
            return Promise.resolve(amt * 1000000);
        },
        hasBalance: () => {
            return Promise.resolve(hasBalanceResponse);
        },
    })
}));


jest.mock('../../src/hooks/api/use_qapi_application', () => ({
    useQApiApplication: () => ({
        submitTransaction: () => {
            return Promise.resolve();
        },
    })
}));

const dispatchMock = jest.fn();
jest.mock('react-redux', () => ({
    useDispatch: () => dispatchMock,
    useSelector: () => jest.fn()
}));

describe('useCheckout', () => {
    beforeAll(() => {
        process.env.SUPPRESS_BACKEND_LOGS = 'true';
        process.env.SUPPRESS_BACKEND_LOGS = 'true';
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        delete process.env.SUPPRESS_BACKEND_LOGS;
    });

    it('creates an application successfully', async () => {
        const pushMock = jest.fn();
        const { result } = renderHook(() => useCheckout(), withRouterAndEnvProviderWrapper({ push: pushMock }));

        await act(async () => {
            await result.current.createNewApplication(
                10,
                10,
                50,
                4711,
                { lat: 1, lng: 2 },
                null,
                5,
                CoverageType.FragileShield
            );
        });

        expect(createApprovalMock).toHaveBeenCalledTimes(1);
        expect(createApprovalMock).toHaveBeenCalledWith(10 * 1000000, TOKENHANDLER_ADDRESS, undefined);

        expect(createApplicationMock).toHaveBeenCalledTimes(1);
        expect(createApplicationMock).toHaveBeenCalledWith(
            undefined,
            4711,
            { lat: 1, lng: 2 },
            "",
            5,
            CoverageType.FragileShield,
            50 * 1000000,
            10 * 1000000,
            expect.anything(),
        );

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({"payload": "42n", "type": "application/setNftId"});
        expect(pushMock).toHaveBeenCalledTimes(1);
        expect(pushMock).toHaveBeenCalledWith(PATH_SIGNUP_SUCCESS);
    })

    it('creates an application with discount successfully', async () => {
        const pushMock = jest.fn();
        const { result } = renderHook(() => useCheckout(), withRouterAndEnvProviderWrapper({ push: pushMock }));

        await act(async () => {
            await result.current.createNewApplication(
                10,
                9,
                50,
                4711,
                { lat: 1, lng: 2 },
                'SAVE',
                5,
                CoverageType.FragileShield
            );
        });

        expect(createApprovalMock).toHaveBeenCalledTimes(1);
        expect(createApprovalMock).toHaveBeenCalledWith(9 * 1000000, TOKENHANDLER_ADDRESS, undefined);

        expect(createApplicationMock).toHaveBeenCalledTimes(1);
        expect(createApplicationMock).toHaveBeenCalledWith(
            undefined,
            4711,
            { lat: 1, lng: 2 },
            "SAVE",
            5,
            CoverageType.FragileShield,
            50 * 1000000,
            10 * 1000000,
            expect.anything(),
        );

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({"payload": "42n", "type": "application/setNftId"});
        expect(pushMock).toHaveBeenCalledTimes(1);
        expect(pushMock).toHaveBeenCalledWith(PATH_SIGNUP_SUCCESS);
    })

    it('sets error PRO-001:INSUFFICIENT_BALANCE when balance is too low during application creation', async () => {
        const { result } = renderHook(() => useCheckout(), withRouterAndEnvProviderWrapper({}));

        hasBalanceResponse = false;
        await act(async () => {
            await result.current.createNewApplication(
                10,
                9,
                50,
                4711,
                { lat: 1, lng: 2 },
                null,
                5,
                CoverageType.FragileShield
            );
        });

        expect(createApprovalMock).toHaveBeenCalledTimes(0);
        
        expect(createApplicationMock).toHaveBeenCalledTimes(0);
        
        expect(result.current.error).not.toBeNull();
        expect((result.current.error as BaseError).code).toBe("CHE-001:INSUFFICIENT_BALANCE");
    })

    it('calculates the referral code discount successfully', async () => {
        const { result } = renderHook(() => useCheckout(), withRouterAndEnvProviderWrapper({}));

        await act(async () => {
            await result.current.calculateReferralCodeDiscount(
                "SAVE",
                10,
            );
        });

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({
            "payload": {"code": "SAVE", "finalPremium": 9, "referralDiscount": 0.1}, 
            "type": "application/setReferralCode"
        });
    })

    it('sets error CHE-030:REFERRAL_CODE_INVALID when referral code is unknown', async () => {
        const { result } = renderHook(() => useCheckout(), withRouterAndEnvProviderWrapper({}));

        discountPercentage = 0;
        referralStatus = 100;
        await act(async () => {
            await result.current.calculateReferralCodeDiscount(
                "UNKNOWN",
                10,
            );
        });

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({
            "payload": {"code": "UNKNOWN", "finalPremium": 10, "referralDiscount": 0}, 
            "type": "application/setReferralCode"
        });
        expect(result.current.error).not.toBeNull();
        expect((result.current.error as BaseError).code).toBe("CHE-030:REFERRAL_CODE_INVALID");
        expect((result.current.error as BaseError).context).toBe(100);
    })

    it('sets empty referral code successfully', async () => {
        const { result } = renderHook(() => useCheckout(), withRouterAndEnvProviderWrapper({}));

        await act(async () => {
            await result.current.calculateReferralCodeDiscount(
                "",
                10,
            );
        });

        expect(result.current.error).toBeUndefined();
        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({
            "payload": {"code": null, "finalPremium": 10, "referralDiscount": 0}, 
            "type": "application/setReferralCode"
        });
    })
})