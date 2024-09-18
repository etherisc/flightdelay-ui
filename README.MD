# Flightdelay UI Web Application

## Structure

- `/component-lib`: contains the shared React components
- `/webapp`: contains the Next.js webapp
- `/mockoon`: contains the mockoon configuration for the API

## Webapp

### Configuration

The webapp is configured via environment variables. The following variables are available:

- `IP_GEOLOCATION_API_KEY`: The API key for the geolocation API (https://ipgeolocation.io/) - client geolocation is disabled if not set
- `LOCATION_IQ_API_KEY`: The API key for the location IQ API (https://locationiq.com/) - location search is disabled if not set
- `NEXT_PUBLIC_ERC20_TOKEN_CONTRACT_ADDRESS`: The address of the ERC20 token contract used to pay the premium
- `NEXT_PUBLIC_EXPECTED_CHAIN_ID`: The expected chain ID of the blockchain network
- `NEXT_PUBLIC_EXPECTED_CHAIN_NAME`: The expected chain name of the blockchain network
- `NEXT_PUBLIC_PRODUCT_CONTRACT_ADDRESS`: The address of the Product contract
- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`: The address of the NFT
- `LOG_API_PROXY`: set the `true` to log proxy requests on the backend
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: The Google Analytics measurement ID. No tracking is done if this value is not set
- `NEXT_PUBLIC_GA_ENVIRONMENT_ID`: The Google Analytics environment identifier 
- `CSP_ENABLED`: Set to `true` to enable the Content Security Policy



### Start

```bash
cd webapp
npm run dev
```

**Important**: This project requires a fontawesome pro license. Please set your auth token in the `FONTAWESOME_NPM_AUTH_TOKEN` environment variable.

### Test

```bash
cd webapp
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

## Mockoon

For details on Mockoon usage see https://mockoon.com/. Configuration for the API mock is in `/mockoon/api.json`. 
