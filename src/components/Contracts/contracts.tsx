import { Badge, Box, Card, CardContent, CardHeader, Link } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useEnvContext } from "next-runtime-env";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import Trans from "../Trans/trans";

export default function Contracts() {
    const { t } = useTranslation();
    const { 
        NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS,
        NEXT_PUBLIC_PRODUCT_TOKENHANDLER_CONTRACT_ADDRESS,
        NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS,
        NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
        NEXT_PUBLIC_FLIGHT_NFT_CONTRACT_ADDRESS,
        NEXT_PUBLIC_EXPECTED_CHAIN_BLOCK_EXPLORER_URL,
        NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS,
        NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL,
        NEXT_PUBLIC_CONTRACTS_BADGE_TEXT
    } = useEnvContext();

    const etherscanBaseUrl = (NEXT_PUBLIC_EXPECTED_CHAIN_BLOCK_EXPLORER_URL ? NEXT_PUBLIC_EXPECTED_CHAIN_BLOCK_EXPLORER_URL : "https://basescan.org/") + "address/";
    
    return (<>
        <Card>
            <CardHeader
                avatar={
                    <Image src="/assets/images/etherisc_logo_bird_blue.svg" alt="Etherisc Logo" height={64} width={64} />
                    }
                title={t('contracts.title')}
                />
            <CardContent>
                <Box sx={{ px: 2, pb: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={12} sx={{ mb: 4 }}>
                            <b>
                                <Trans k="contracts.stay_safe" />
                            </b>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Trans k="contracts.product_contract" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }} sx={{ wordWrap: 'break-word' }}>
                            <BadgeWrapper badgeContent={NEXT_PUBLIC_CONTRACTS_BADGE_TEXT}>
                                <Link href={`${etherscanBaseUrl}${NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS}`} className="link" target="_blank" rel="noopener noreferrer">
                                    {NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS}
                                </Link>
                            </BadgeWrapper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Trans k="contracts.tokenhandler_contract" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }} sx={{ wordWrap: 'break-word' }}>
                            <BadgeWrapper badgeContent={NEXT_PUBLIC_CONTRACTS_BADGE_TEXT}>
                                <Link href={`${etherscanBaseUrl}${NEXT_PUBLIC_PRODUCT_TOKENHANDLER_CONTRACT_ADDRESS}`} className="link" target="_blank" rel="noopener noreferrer">
                                    {NEXT_PUBLIC_PRODUCT_TOKENHANDLER_CONTRACT_ADDRESS}
                                </Link>
                            </BadgeWrapper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Trans k="contracts.oracle_contract" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }} sx={{ wordWrap: 'break-word' }}>
                            <BadgeWrapper badgeContent={NEXT_PUBLIC_CONTRACTS_BADGE_TEXT}>
                                <Link href={`${etherscanBaseUrl}${NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS}`} className="link" target="_blank" rel="noopener noreferrer">
                                    {NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS}
                                </Link>
                            </BadgeWrapper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Trans k="contracts.nft_contract" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }} sx={{ wordWrap: 'break-word' }}>
                            <BadgeWrapper badgeContent={NEXT_PUBLIC_CONTRACTS_BADGE_TEXT}>
                                <Link href={`${etherscanBaseUrl}${NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}`} className="link" target="_blank" rel="noopener noreferrer">
                                    {NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}
                                </Link>
                            </BadgeWrapper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Trans k="contracts.flight_nft_contract" />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }} sx={{ wordWrap: 'break-word' }}>
                            <BadgeWrapper badgeContent={NEXT_PUBLIC_CONTRACTS_BADGE_TEXT}>
                                <Link href={`${etherscanBaseUrl}${NEXT_PUBLIC_FLIGHT_NFT_CONTRACT_ADDRESS}`} className="link" target="_blank" rel="noopener noreferrer">
                                    {NEXT_PUBLIC_FLIGHT_NFT_CONTRACT_ADDRESS}
                                </Link>
                            </BadgeWrapper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Trans k="contracts.token_contract" values={{ token: NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }} sx={{ wordWrap: 'break-word' }}>
                            <BadgeWrapper badgeContent={NEXT_PUBLIC_CONTRACTS_BADGE_TEXT}>
                                <Link href={`${etherscanBaseUrl}${NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS}`} className="link" target="_blank" rel="noopener noreferrer">
                                    {NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS}
                                </Link>
                            </BadgeWrapper>
                        </Grid>
                    </Grid>
                </Box>
            </CardContent>
        </Card>
    </>);
}

function BadgeWrapper({ children, badgeContent }: { children: React.ReactNode, badgeContent: string | undefined }) {
    if (!badgeContent) {
        return <>{children}</>;
    }

    return (
        <Badge badgeContent={badgeContent} color="secondary" anchorOrigin={{ horizontal: 'left' }}>
            {children}
        </Badge>
    );
}