import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BackButton from '../../../../src/components/(basic_widgets)/BackButton/back_button';
import { tMock } from '../../../test-helper/i18n';

jest.mock('react-i18next', () => ({
    Trans: ({ i18nKey, values }) => tMock(i18nKey, values),
    useTranslation: () => {
        return {
            t: tMock
        };
    },
}));

describe('BackButton', () => {
    it('renders back text and can be clicked', () => {
        const mockOnClick = jest.fn();
        render(
            <BackButton onClick={mockOnClick} />
        );

        expect(mockOnClick).toHaveBeenCalledTimes(0);
        screen.getByText('action.back').click();
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    })
})
