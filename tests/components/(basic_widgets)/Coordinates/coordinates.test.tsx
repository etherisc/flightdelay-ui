import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { tMock } from '../../../test-helper/i18n';
import Coordinates from '../../../../src/components/(basic_widgets)/Coordinates/coordinates';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

describe('Coordinates', () => {
    it('renders N and E coordinates correctly', () => {
        render(
            // coordinates zurich
            <Coordinates lat={47.23423} lng={9.21345}/>
        );

        expect(screen.findByDisplayValue('47.2342°N, 9.2135°E')).toBeTruthy();
    })

    it('renders S and W coordinates correctly', () => {
        render(
            // coordinates zurich
            <Coordinates lat={-47.23423} lng={-9.21345}/>
        );

        expect(screen.findByDisplayValue('47.2342°S, 9.2135°W')).toBeTruthy();
    })

    it('renders 0 coordinates correctly', () => {
        render(
            // coordinates zurich
            <Coordinates lat={0} lng={0}/>
        );

        expect(screen.findByDisplayValue('0.0000°N, 0.0000°E')).toBeTruthy();
    })
})
