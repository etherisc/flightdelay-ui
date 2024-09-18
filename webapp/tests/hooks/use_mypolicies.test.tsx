import '@testing-library/jest-dom';
import { act, renderHook } from '@testing-library/react';
import { Signer } from 'ethers';
import { useMyPolicies } from '../../src/hooks/use_mypolicies';
import { CoverageType } from '../../src/types/coverage_type';
import { PolicyData } from '../../src/types/policy_data';
import { QApiCity } from '../../src/types/qapi/city';
import { stringifyBigInt } from '../../src/utils/bigint';
import { withRouterAndEnvProviderWrapper } from '../test-helper/render_with_providers';

jest.mock('../../src/hooks/onchain/use_wallet', () => ({
    useWallet: () => ({
        connectWallet: jest.fn(),
        getSigner: jest.fn(),
    })
}));

const fetchPolicyDataMock = jest.fn().mockImplementation(async (nftIds: bigint[], signer: Signer,
    onPolicyFetched: (policy: PolicyData) => Promise<void>,
    ) => {
        nftIds.forEach(async (nftId) => {
            await onPolicyFetched({
                nftId: stringifyBigInt(nftId),
                type: CoverageType.FragileShield,
                sumInsured: '50120000n',
                state: 0, // PolicyState.APPLIED
                locationName: 'London, UK',
            } as PolicyData);
        });
        return Promise.resolve();
});
jest.mock('../../src/hooks/onchain/use_product_contract', () => ({
    useProductContract: () => ({
        fetchPolicyData: fetchPolicyDataMock
    })
}));

const transferNftIdMock = jest.fn();
jest.mock('../../src/hooks/onchain/use_erc721_contract', () => ({
    useERC721Contract: () => ({
        getNftIds: () => {
            return Promise.resolve([BigInt('103133705'), BigInt('113133705')]);
        },
        transferNft: transferNftIdMock
    })
}));

jest.mock('../../src/hooks/api/use_qapi_cities', () => ({
    useQApiCities: () => ({
        getCity: (locationId: number) => {
            return Promise.resolve( {
                id: locationId,
                name: {
                    local: 'London, UK'
                }
            } as QApiCity);
        },
    })
}));

const dispatchMock = jest.fn();
jest.mock('react-redux', () => ({
    useDispatch: () => dispatchMock,
    useSelector: () => jest.fn()
}));

describe('useMyPolicies', () => {
    beforeAll(() => {
        process.env.SUPPRESS_BACKEND_LOGS = 'true';
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        delete process.env.SUPPRESS_BACKEND_LOGS;
    });

    it('fetches nftIds for owned Nfts and their correspondis policy data from product contract as well as static location data from qapi', async () => {
        const { result } = renderHook(() => useMyPolicies('0x1234'), withRouterAndEnvProviderWrapper({}));

        await act(async () => {
            await result.current.fetchPolicies();
        });

        expect(dispatchMock).toHaveBeenCalledTimes(3);
        expect(dispatchMock).toHaveBeenCalledWith({"type": "myPolicies/resetPolicies"});
        expect(dispatchMock).toHaveBeenCalledWith({"payload": {
            "locationName": "London, UK",
            "nftId": "103133705n",
            "state": 0,
            "sumInsured": "50120000n",
            "type": "FragileShield",
        }, "type": "myPolicies/addOrUpdatePolicy"});
        expect(dispatchMock).toHaveBeenCalledWith({"payload": {
            "locationName": "London, UK",
            "nftId": "113133705n",
            "state": 0,
            "sumInsured": "50120000n",
            "type": "FragileShield",
        }, "type": "myPolicies/addOrUpdatePolicy"});
        
    })

    it('fetches a single policy', async () => {
        const { result } = renderHook(() => useMyPolicies('0x1234'), withRouterAndEnvProviderWrapper({}));

        await act(async () => {
            await result.current.fetchPolicy(BigInt('103133705'));
        });

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({"payload": {
            "locationName": "London, UK",
            "nftId": "103133705n",
            "state": 0,
            "sumInsured": "50120000n",
            "type": "FragileShield",
        }, "type": "myPolicies/addOrUpdatePolicy"});
        
    })

    it('handles errors during fetchPolicies', async () => {
        const { result } = renderHook(() => useMyPolicies('0x1234'), withRouterAndEnvProviderWrapper({}));

        fetchPolicyDataMock.mockImplementationOnce(async () => {
                throw new Error('fetchPolicyDataMock error');
            });

        await act(async () => {
            await result.current.fetchPolicies();
        });

        expect(result.current.error).toEqual(new Error('fetchPolicyDataMock error'));
    })

    it('handles errors during fetchPolicy', async () => {
        const { result } = renderHook(() => useMyPolicies('0x1234'), withRouterAndEnvProviderWrapper({}));

        fetchPolicyDataMock.mockImplementationOnce(async () => {
                throw new Error('fetchPolicyDataMock error');
            });

        await act(async () => {
            await result.current.fetchPolicy(BigInt('103133705'));
        });

        expect(result.current.error).toEqual(new Error('fetchPolicyDataMock error'));
    })

    it('transfers a policy', async () => {
        const { result } = renderHook(() => useMyPolicies('0x1234'), withRouterAndEnvProviderWrapper({}));

        await act(async () => {
            await result.current.transferPolicy(BigInt('103133705'), '0x1234');
        });

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith({"type": "myPolicies/resetPolicies"});
        expect(transferNftIdMock).toHaveBeenCalledTimes(1);
        expect(transferNftIdMock).toHaveBeenCalledWith(BigInt('103133705'), '0x1234', undefined);
    })
})
