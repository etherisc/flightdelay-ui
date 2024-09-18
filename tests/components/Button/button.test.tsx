import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from "react";
import Button from '../../../src/components/Button/button';

describe('AddressButton', () => {
    it('renders connect text when wallet address not set', () => {
        render(
            <Button>XyZ</Button>
        );

        expect(screen.getByText('XyZ')).toBeInTheDocument();
    })

    it('onClick function is called when button is clicked', () => {
        const mockOnClick = jest.fn();
        render(
            <Button onClick={mockOnClick}>XyZ</Button>
        );

        expect(mockOnClick).toHaveBeenCalledTimes(0);
        screen.getByText('XyZ').click();
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    })
})
