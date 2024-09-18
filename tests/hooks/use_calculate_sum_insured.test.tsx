import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import useCalculateSumInsured from '../../src/hooks/use_calculate_sum_insured';

describe('useCalculateSumInsured', () => {
    it('calculates the initial sum insured and updates when value is changed', async () => {
        let premium = "10";
        const ratioFragileShield = 5;
        const ratioHomeGuard = 50;
        const { result, rerender } = renderHook(() => useCalculateSumInsured(premium, ratioFragileShield, ratioHomeGuard), 
                                                        { initialProps: { premium, ratioFragileShield, ratioHomeGuard } });

        expect(result.current.sumInsuredFragileShield).toBe(50);
        expect(result.current.sumInsuredHomeGuard).toBe(500);

        premium = "20";
        rerender({ premium, ratioFragileShield, ratioHomeGuard });

        expect(result.current.sumInsuredFragileShield).toBe(100);
        expect(result.current.sumInsuredHomeGuard).toBe(1000);
    })

    it('sets sum insured to 0 when premium is NaN', async () => {
        let premium = "10";
        const ratioFragileShield = 5;
        const ratioHomeGuard = 50;
        const { result, rerender } = renderHook(() => useCalculateSumInsured(premium, ratioFragileShield, ratioHomeGuard), 
                                                        { initialProps: { premium, ratioFragileShield, ratioHomeGuard } });

        expect(result.current.sumInsuredFragileShield).toBe(50);
        expect(result.current.sumInsuredHomeGuard).toBe(500);

        premium = "";
        rerender({ premium, ratioFragileShield, ratioHomeGuard });

        expect(result.current.sumInsuredFragileShield).toBe(0);
        expect(result.current.sumInsuredHomeGuard).toBe(0);

        premium = "a";
        rerender({ premium, ratioFragileShield, ratioHomeGuard });

        expect(result.current.sumInsuredFragileShield).toBe(0);
        expect(result.current.sumInsuredHomeGuard).toBe(0);
    })

    it('sets sum insured to 0 when premium is 0', async () => {
        let premium = "10";
        const ratioFragileShield = 5;
        const ratioHomeGuard = 50;
        const { result, rerender } = renderHook(() => useCalculateSumInsured(premium, ratioFragileShield, ratioHomeGuard), 
                                                        { initialProps: { premium, ratioFragileShield, ratioHomeGuard } });

        expect(result.current.sumInsuredFragileShield).toBe(50);
        expect(result.current.sumInsuredHomeGuard).toBe(500);

        premium = "0";
        rerender({ premium, ratioFragileShield, ratioHomeGuard });

        expect(result.current.sumInsuredFragileShield).toBe(0);
        expect(result.current.sumInsuredHomeGuard).toBe(0);
    })
})
