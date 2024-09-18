import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import WalletConnected from '../../../src/components/Checkout/wallet_connected';
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

const MYADDRESS = "0x2CeC4C063Fef1074B0CD53022C3306A6FADb4729";

describe('WalletConnected', () => {
    it('renders address, balance, premium and connect button', () => {
        renderWithProviders(
            <WalletConnected 
                premium={42} 
                finalPremium={42}
                referralCode={null}
                referralCodeDiscount={null}
                symbol="USDC" 
                address={MYADDRESS} 
                balance={BigInt(12340000)} 
                onApplyReferralCode={async () => {}}
                onBuy={async () => {}}
                />,
        );

        expect(screen.getByText('0x2CeC…4729')).toBeInTheDocument();
        expect(screen.getByText('USDC 12.34')).toBeInTheDocument();
        expect(screen.getByText('USDC 42.00')).toBeInTheDocument();
        expect(screen.getByText('action.buy_protection {"amount":"USDC 42.00"}')).toBeInTheDocument(); 
    })

    it('renders original and final balance when referral code is set', () => {
        renderWithProviders(
            <WalletConnected 
                premium={42.31} 
                finalPremium={37.12}
                referralCode={"REFERRED"}
                referralCodeDiscount={0.1}
                symbol="USDC" 
                address={MYADDRESS} 
                balance={BigInt(12340000)} 
                onApplyReferralCode={async () => {}}
                onBuy={async () => {}}
                />,
        );

        expect(screen.getByText('0x2CeC…4729')).toBeInTheDocument();
        expect(screen.getByText('USDC 12.34')).toBeInTheDocument();
        expect(screen.getByText('42.31')).toBeInTheDocument();
        expect(screen.getByText('37.12')).toBeInTheDocument();
        expect(screen.getByText('action.buy_protection {"amount":"USDC 37.12"}')).toBeInTheDocument(); 
        expect(screen.getByText('checkout.referral_code_applied {"pct":10}')).toBeInTheDocument(); 
    })
})
