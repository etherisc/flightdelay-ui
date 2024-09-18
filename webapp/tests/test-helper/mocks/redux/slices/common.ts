import { WalletState } from "../../../../../src/redux/slices/wallet";
import { stringifyBigInt } from "../../../../../src/utils/bigint";

export const MYADDRESS = "0x2CeC4C063Fef1074B0CD53022C3306A6FADb4729";

export function mockWallet() {
    return {
        isAccountSwitchListenerConnected: false,
        isExpectedChain: true,
        connecting: false,
        address: MYADDRESS,
        balanceUsdc: stringifyBigInt(BigInt(10000)),
        balanceEth: stringifyBigInt(BigInt(10)),
    } as WalletState;
}
