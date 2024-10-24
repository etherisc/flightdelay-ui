# Flightdelay UI Web Application


## Webapp

### Configuration

The webapp is configured via environment variables. The following variables are available:

- `NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS`: The minimum number of days in the future for the departure date
- `NEXT_PUBLIC_DEPARTURE_DATE_MAX_DAYS`: The maximum number of days in the future for the departure date
- `NEXT_PUBLIC_AIRPORTS_WHITELIST`: A comma-separated list of airport codes of whitelisted airports. At least the departure or the arrival airport must be in this list.
- `NEXT_PUBLIC_AIRPORTS_BLACKLIST`: A comma-separated list of airport codes of blacklisted airports. If the departure or the arrival airport is in this list, no policy can be created.
- `PREMIUM`: Set the premium in wei
- `NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS`: The address of the ERC20 token contract to pay the premium with
- `NEXT_PUBLIC_ERC20_TOKEN_VERSION`: Token version, default is "1", needs to be set to "2" for USDC on Base
- `NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL`: The symbol of the premium token
- `NEXT_PUBLIC_PREMIUM_TOKEN_DECIMALS`: The number of decimals of the premium token

- `NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS`: The address of the product contract 
- `NEXT_PUBLIC_POOL_CONTRACT_ADDRESS`: The address of the flight pool contract
- `NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS`: The address of the flight oracle contract
- `NEXT_PUBLIC_FLIGHT_NFT_CONTRACT_ADDRESS`: The address of the flight NFT contract
- `RISKPOOL_MIN_CAPACITY`: The minimum capacity of the risk pool in wei. If the capacity is below this value, the policy creation will not be possible.
- `STATISTICS_PROVIDER_MIN_BALANCE`: The minimum balance of the statistics provider. If the balance is below this value, the provider will not be able to create new policies and the readiness check will fail.
- `STATISTICS_PROVIDER_MNEMONIC`: The mnemonic of the statistics provider. This account is used to create the policies. 
- `STATUS_PROVIDER_MIN_BALANCE`: The minimum balance of the status provider. If the balance is below this value, the provider will not be able to send oracle responses and the readiness check will fail.
- `STATUS_PROVIDER_MNEMONIC`: The mnemonic of the status provider. This account is used to send the oracle response transactions. 

- `ORACLE_ARRIVAL_CHECK_DELAY_SECONDS`: The delay in seconds for the oracle to check the arrival status after the exected arrival time
- `GAS_LIMIT`: The gas limit for oracle responses (defaults to `5000000`)

- `FLIGHTSTATS_BASE_URL`: The base URL for the Flightstats API
- `FLIGHTSTATS_APP_ID`: The Flightstats API application ID
- `FLIGHTSTATS_APP_KEY`: The Flightstats API application key

- `NEXT_PUBLIC_APP_BASE_URL`: The base URL where the webapp is deployed (without trailing slash). Defaults to `https://flightdelay.app`
- `NEXT_PUBLIC_EXPECTED_CHAIN_ID`: The expected chain ID
- `NEXT_PUBLIC_EXPECTED_CHAIN_NAME`: The expected chain name (optional, required for automatic chain adding)
- `NEXT_PUBLIC_EXPECTED_CHAIN_RPC_NODE_URL`: The expected chain RPC node URL (optional, required for automatic chain adding)
- `NEXT_PUBLIC_EXPECTED_CHAIN_BLOCK_EXPLORER_URL`: The expected chain block explorer URL (optional, required for automatic chain adding)
- `NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_NAME`: The expected chain native token name (optional, required for automatic chain adding)
- `NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_SYMBOL`: The expected chain native token symbol (optional, required for automatic chain adding)
- `NEXT_PUBLIC_EXPECTED_CHAIN_TOKEN_DECIMALS`: The expected chain native token decimals (optional, required for automatic chain adding)

- `LOG_API_PROXY`: set the `true` to log proxy requests on the backend
- `LOG_LEVEL`: The log level for the backend api (debug, info, warn, error)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: The Google Analytics measurement ID. No tracking is done if this value is not set
- `NEXT_PUBLIC_GA_ENVIRONMENT_ID`: The Google Analytics environment identifier 
- `CSP_ENABLED`: Set to `true` to enable the Content Security Policy


### Start

```bash
npm run dev
```

**Important**: This project requires a fontawesome pro license. Please set your auth token in the `FONTAWESOME_NPM_AUTH_TOKEN` environment variable.

### Trigger oracle via curl

```
curl -X POST http://localhost:3000/api/oracle -H "Content-Type: application/json" -d {} -w " %{http_code}\n"
```

### Test

```bash
npm run test
(or)
npm run testLoop
```

### Deployment 

Via container created by executing 

```bash
docker build -t flightdelay-ui-webapp .
```
**Important**: This project requires a fontawesome pro license. Please set your auth token in the `FONTAWESOME_NPM_AUTH_TOKEN` environment variable.
