# Flightdelay UI Web Application


## Webapp

### Configuration

The webapp is configured via environment variables. The following variables are available:

- `NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL`: The symbol for the premium token
- `NEXT_PUBLIC_DEPARTURE_DATE_MIN_DAYS`: The minimum number of days in the future for the departure date
- `NEXT_PUBLIC_DEPARTURE_DATE_MAX_DAYS`: The maximum number of days in the future for the departure date
- `NEXT_PUBLIC_DEPARTURE_AIRPORTS_WHITELIST`: A comma-separated list of airport codes of whitelisted departure airports
- `NEXT_PUBLIC_ARRIVAL_AIRPORTS_WHITELIST`: A comma-separated list of airport codes of whitelisted arrival airports
- `PREMIUM`: Set the premium in wei
- `ORACLE_ARRIVAL_CHECK_DELAY_SECONDS`: The delay in seconds for the oracle to check the arrival status after the exected arrival time
- `NEXT_PUBLIC_PREMIUM_TOKEN_SYMBOL`: The symbol of the premium token
- `NEXT_PUBLIC_PREMIUM_TOKEN_DECIMALS`: The number of decimals of the premium token

- `NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS`: The address of the product contract 
- `NEXT_PUBLIC_ORACLE_CONTRACT_ADDRESS`: The address of the flight oracle contract
- `GAS_LIMIT`: The gas limit for oracle responses (defaults to `5000000`)
- `FLIGHTSTATS_BASE_URL`: The base URL for the Flightstats API
- `FLIGHTSTATS_APP_ID`: The Flightstats API application ID
- `FLIGHTSTATS_APP_KEY`: The Flightstats API application key

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

