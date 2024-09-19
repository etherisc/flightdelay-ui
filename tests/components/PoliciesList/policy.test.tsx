import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import Policy from '../../../src/components/PoliciesList/policy_short';
import { CoverageType } from '../../../src/types/coverage_type';
import { PolicyData } from '../../../src/types/policy_data';
import { tMock } from '../../test-helper/i18n';
import { renderWithProviders } from '../../test-helper/render_with_providers';
import { AppRouterContextProviderMock } from '../../test-helper/app-router-context-provider-mock';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

describe('Policy', () => {
    it('renders policy data for overview', () => {
        const policy = {
            nftId: '103133705n',
            type: CoverageType.FragileShield,
            sumInsured: '50120000n',
            state: 0, // PolicyState.APPLIED
            locationName: 'London, UK',
        } as PolicyData;
        renderWithProviders(
            <AppRouterContextProviderMock router={{}}>
                <Policy policy={policy} symbol='USDC' />
            </AppRouterContextProviderMock>
        );

        expect(screen.getByText('protection_type_names.FragileShield')).toBeInTheDocument();
        expect(screen.getByText('policy_state.APPLIED')).toBeInTheDocument();
        expect(screen.getByText('103133705')).toBeInTheDocument();
        expect(screen.getByText('London, UK')).toBeInTheDocument();
        expect(screen.getByText('USDC 50.12')).toBeInTheDocument();
        // expect(screen.queryByTestId('policy-103133705n').querySelector('[data-icon="wine-glass-crack"]')).toBeInTheDocument();
    })

    // TODO test header for different states
})
