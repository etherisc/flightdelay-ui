import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LocationSearchBoxOverlay } from '../../../src/components/SelectLocationOnMap/location_search_box_overlay';
import { LocationIQResult } from '../../../src/hooks/api/use_location_iq_autocomplete';
import { tMock } from '../../test-helper/i18n';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

let searchLocationResult = [] as Array<LocationIQResult>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useLocationIQAutocompleteMock = jest.fn().mockImplementation((query: string) => {
    return {
        data: searchLocationResult,
        error: null,
        isLoading: false,
    };
});
jest.mock('../../../src/hooks/api/use_location_iq_autocomplete', () => ({
    useLocationIQAutocomplete: (query: string) => useLocationIQAutocompleteMock(query),
}));

describe('LocationSearchBoxOverlay', () => {
    // before each
    beforeEach(() => {
        searchLocationResult = [];
        useLocationIQAutocompleteMock.mockClear();
    });

    it('renders empty input field and not results', () => {
        render(
            <LocationSearchBoxOverlay onLocationSelected={() => {}} />,
        );

        expect(screen.queryByTestId('search-input')).toBeInTheDocument();
        
        const searchInput = screen.getByTestId('search-input').querySelector('input');
        expect(searchInput).toHaveValue('');

        expect(screen.queryByTestId('results')).not.toBeInTheDocument();
    })

    it('submits search query and shows results when input field is filled', async () => {
        const locationSelectedMock = jest.fn();
        render(
            <LocationSearchBoxOverlay onLocationSelected={locationSelectedMock} />,
        );

        const searchInput = screen.getByTestId('search-input').querySelector('input');
        
        searchLocationResult = [
            { place_id: "1", lat: 47.36667, lon: 8.55, display_name: 'ZurichN', display_place: 'ZurichP', display_address: 'ZurichA' },
            { place_id: "42", lat: 46.94809, lon: 7.44744, display_name: 'BernN', display_place: 'BernP', display_address: 'BernA' },
        ];
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'Zurich' } });
        });

        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenCalledWith('Zurich');
        
            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichP'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichA'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('BernP');
            expect(screen.queryByTestId('search-results')).toContainHTML('BernA');
        });

        act(() => {
            screen.queryByText("BernP").click();
        });

        expect(locationSelectedMock).toHaveBeenCalledWith({ place_id: "42", lat: 46.94809, lon: 7.44744, display_name: 'BernN', display_place: 'BernP', display_address: 'BernA' });
    })

    it('updates results when more text is input', async () => {
        const locationSelectedMock = jest.fn();
        render(
            <LocationSearchBoxOverlay onLocationSelected={locationSelectedMock} />,
        );

        const searchInput = screen.getByTestId('search-input').querySelector('input');
        
        searchLocationResult = [
            { place_id: "1", lat: 47.36667, lon: 8.55, display_name: 'ZurichN', display_place: 'ZurichP', display_address: 'ZurichA' },
        ];
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'search1' } });
        });

        
        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenCalledWith('search1');

            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichP'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichA'); 
            expect(screen.queryByTestId('search-results')).not.toContainHTML('BernP');
            expect(screen.queryByTestId('search-results')).not.toContainHTML('BernA');
        });

        searchLocationResult = [
            { place_id: "1", lat: 47.36667, lon: 8.55, display_name: 'ZurichN', display_place: 'ZurichP', display_address: 'ZurichA' },
            { place_id: "42", lat: 46.94809, lon: 7.44744, display_name: 'BernN', display_place: 'BernP', display_address: 'BernA' },
        ];
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'search2' } });
        });
        
        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenCalledWith('search2');

            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichP'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichA'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('BernP');
            expect(screen.queryByTestId('search-results')).toContainHTML('BernA');
        });
    })

    it('shows results and does not update them when next result is null (rate limit exceeded)', async () => {
        const locationSelectedMock = jest.fn();
        render(
            <LocationSearchBoxOverlay onLocationSelected={locationSelectedMock} />,
        );

        const searchInput = screen.getByTestId('search-input').querySelector('input');
        
        searchLocationResult = [
            { place_id: "1", lat: 47.36667, lon: 8.55, display_name: 'ZurichN', display_place: 'ZurichP', display_address: 'ZurichA' },
            { place_id: "42", lat: 46.94809, lon: 7.44744, display_name: 'BernN', display_place: 'BernP', display_address: 'BernA' },
        ];
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'Zurich' } });
        });

        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenCalledWith('Zurich');

            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichP'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichA'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('BernP');
            expect(screen.queryByTestId('search-results')).toContainHTML('BernA');
        });

        act(() => {
            fireEvent.change(searchInput, { target: { value: 'Zurich2' } });
        });

        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenCalledWith('Zurich2');

            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichP'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('ZurichA'); 
            expect(screen.queryByTestId('search-results')).toContainHTML('BernP');
            expect(screen.queryByTestId('search-results')).toContainHTML('BernA');
        });
    })

    it('shows on result box when search result is empty list', async () => {
        const locationSelectedMock = jest.fn();
        render(
            <LocationSearchBoxOverlay onLocationSelected={locationSelectedMock} />,
        );

        const searchInput = screen.getByTestId('search-input').querySelector('input');
        
        searchLocationResult = [];
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'no hit for this search' } });
        });

        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenCalledWith('no hit for this search');

            expect(screen.queryByTestId('search-results')).toBeNull();
        });
    })

    it('triggers onLocationSelected when result is clicked', async () => {
        const locationSelectedMock = jest.fn();
        render(
            <LocationSearchBoxOverlay onLocationSelected={locationSelectedMock} />,
        );

        const searchInput = screen.getByTestId('search-input').querySelector('input');
        
        searchLocationResult = [
            { place_id: "1", lat: 47.36667, lon: 8.55, display_name: 'ZurichN', display_place: 'ZurichP', display_address: 'ZurichA' },
            { place_id: "42", lat: 46.94809, lon: 7.44744, display_name: 'BernN', display_place: 'BernP', display_address: 'BernA' },
        ]
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'Zurich' } });
        });

        await waitFor(() => {
            expect(screen.queryByTestId('search-results')).toContainHTML('BernP');
            expect(screen.queryByTestId('search-results')).toContainHTML('BernA');
        });

        act(() => {
            screen.queryByText("BernP").click();
        });

        expect(locationSelectedMock).toHaveBeenCalledWith({ place_id: "42", lat: 46.94809, lon: 7.44744, display_name: 'BernN', display_place: 'BernP', display_address: 'BernA' });
    })

    it('clear search results when clear icon is clicked', async () => {
        const locationSelectedMock = jest.fn();
        render(
            <LocationSearchBoxOverlay onLocationSelected={locationSelectedMock} />,
        );

        const searchInput = screen.getByTestId('search-input').querySelector('input');
        
        searchLocationResult = [
            { place_id: "1", lat: 47.36667, lon: 8.55, display_name: 'ZurichN', display_place: 'ZurichP', display_address: 'ZurichA' },
            { place_id: "42", lat: 46.94809, lon: 7.44744, display_name: 'BernN', display_place: 'BernP', display_address: 'BernA' },
        ];
        act(() => {
            fireEvent.change(searchInput, { target: { value: 'Zurich' } });
        });

        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenLastCalledWith('Zurich');

            expect(screen.queryByTestId('search-results')).toContainHTML('BernP');
            expect(screen.queryByTestId('search-results')).toContainHTML('BernA');
        });

        act(() => {
            screen.queryByTestId("clear-icon").click();
        });

        await waitFor(() => {
            expect(useLocationIQAutocompleteMock).toHaveBeenLastCalledWith('');
        });
    })
})
