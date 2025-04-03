# Price Feed API

High-level API for obtaining pricing information from Lit Network validators.

## Features

- **Caching**: Automatically caches price information to reduce contract calls
- **Auto-refresh**: Refreshes stale data after configurable time period
- **Price Sorting**: Returns validators sorted by price (cheapest first)
- **Simplified Interface**: Easy-to-use API compared to raw contract calls

## Usage

```typescript
import { getPriceFeedInfo, getNodePrices } from './priceFeedApi';
import { networkContext } from '../../../_config';

// Get complete price feed information
const priceInfo = await getPriceFeedInfo({
  realmId: 1,
  networkCtx: networkContext,
});

// Get just the node prices sorted by cheapest first
const prices = await getNodePrices({
  realmId: 1,
  networkCtx: networkContext,
});
```

## API Reference

### getPriceFeedInfo

```typescript
async function getPriceFeedInfo(
  params: GetPriceFeedInfoParams
): Promise<PriceFeedInfo>;
```

Gets complete price feed information with caching to reduce blockchain calls.

**Parameters:**

- `params.realmId`: (Optional) The realm ID (defaults to 1)
- `params.networkCtx`: Network context for contract interactions
- `params.productIds`: (Optional) Array of product IDs to get prices for

**Returns:**

- `PriceFeedInfo` object containing:
  - `epochId`: Current epoch ID
  - `minNodeCount`: Minimum required node count
  - `networkPrices`: Array of node prices sorted by cheapest first

### getNodePrices

```typescript
async function getNodePrices(
  params: GetPriceFeedInfoParams
): Promise<PriceFeedInfo['networkPrices']>;
```

Gets just the node prices sorted by cheapest first.

**Parameters:**

- Same as `getPriceFeedInfo`

**Returns:**

- Array of network prices sorted by cheapest first

## Types

### PriceFeedInfo

```typescript
interface PriceFeedInfo {
  epochId: any;
  minNodeCount: any;
  networkPrices: {
    url: string;
    prices: bigint[];
  }[];
}
```

### GetPriceFeedInfoParams

```typescript
interface GetPriceFeedInfoParams {
  realmId?: number;
  networkCtx: NagaContext;
  productIds?: bigint[];
}
```

## Configuration

The API uses the following configuration constants:

- `STALE_PRICES_SECONDS`: Time in milliseconds before prices are considered stale (default: 3000ms)
- `PRODUCT_IDS_ARRAY`: Default product IDs to query if none specified
