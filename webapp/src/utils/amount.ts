import { formatUnits } from "ethers";

/**
 * Format ERC20 amount to string with decimals. Default units is 6 (USDC) and decimals is 2.
 */
export function formatAmount(amount: bigint | null, units = 6, decimals = 2): string {
    if (amount === null) {
        return "";
    }
    const amt = formatUnits(amount, units);
    const num = parseFloat(amt);
    return num.toFixed(decimals);
}

/**
 * Format ERC20 amount to string with decimals. Default units is 6 (USDC) and decimals is 2.
 */
export function formatAmountNum(amount: number, decimals = 2): string {
    if (amount === null) {
        return "";
    }
    // double parse to remove trailing zeros
    return amount.toFixed(decimals);
}
