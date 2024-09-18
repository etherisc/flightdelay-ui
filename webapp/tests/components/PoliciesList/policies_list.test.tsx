import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import PoliciesList from '../../../src/components/PoliciesList/policies_list';
import { CoverageType } from '../../../src/types/coverage_type';
import { PolicyData } from '../../../src/types/policy_data';
import { AppRouterContextProviderMock } from '../../test-helper/app-router-context-provider-mock';
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

describe('PoliciesList', () => {
    it('renders policies', () => {
        const policies = [
            {
                nftId: '103133705n',
                type: CoverageType.FragileShield,
                sumInsured: '50120000n',
                state: 0, // PolicyState.APPLIED
                locationName: 'London, UK',
            } as PolicyData,
            {
                nftId: '113133705n',
                type: CoverageType.FragileShield,
                sumInsured: '50320000n',
                state: 0, // PolicyState.APPLIED
                locationName: 'London, UK',
            } as PolicyData,
        ];
        renderWithProviders(
            <AppRouterContextProviderMock router={{}}>
                <PoliciesList policies={policies} loading={false}/>
            </AppRouterContextProviderMock>,
        );

        expect(screen.getByText('103133705')).toBeInTheDocument();
        expect(screen.getByText('113133705')).toBeInTheDocument();

        expect(screen.getByTestId('policies').querySelectorAll('[data-testid^="policy-"]')).toHaveLength(2);
    })
})
