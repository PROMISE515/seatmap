# AMap API Cost Notes

Last updated: 2026-06-03

## Official Cost Basis

SeatMap currently uses AMap Web Service APIs:

- Place Around Search (`/v3/place/around`)
- Reverse Geocoding (`/v3/geocode/regeo`)

AMap's public pricing page lists both search and base LBS service pricing from **RMB 30 / 10,000 calls**, or about **RMB 0.003 / call**.

Reference:

- https://lbs.amap.com/pages/base_service_price
- https://lbs.amap.com/api/webservice/guide/api/search/

## Current SeatMap Call Pattern

For one uncached nearby search, SeatMap currently makes approximately:

- 1 reverse-geocode call, to determine the current region/city.
- 5 place-around search calls:
  - public toilet type
  - reliable mall/commerce venue search
  - hotel search
  - coffee/chain venue search
  - transit venue search

Estimated uncached cost:

```text
6 calls/search * RMB 0.003/call = RMB 0.018/search
```

So one fully uncached search is roughly **RMB 0.018**, or about **1.8 fen**.

## Cache Behavior

Search results are cached in Supabase table `toilet_search_cache` for 24 hours.

The cache key currently includes:

- search strategy version
- rounded GCJ-02 latitude
- rounded GCJ-02 longitude
- radius

Current coordinate rounding is `toFixed(3)`, roughly a 100-meter grid. Searches from the same small area within 24 hours should reuse cached AMap IDs and avoid repeated AMap search calls.

## Risk After Unlimited Search Button

The search button is now allowed to be clicked repeatedly. That is good UX, but it creates cost and quota risk if not protected.

Main risks:

- repeated user taps
- location jitter creating nearby but different cache keys
- bots or scripts repeatedly calling the server function
- 20 km searches increasing result volume and database writes

## Rough Daily Cost Examples

Assuming all searches are uncached:

```text
1,000 searches/day  ~= RMB 18/day
10,000 searches/day ~= RMB 180/day
50,000 searches/day ~= RMB 900/day
```

With a 70% cache hit rate:

```text
1,000 searches/day  ~= RMB 5.4/day
10,000 searches/day ~= RMB 54/day
50,000 searches/day ~= RMB 270/day
```

## Recommended Guardrails

Recommended near-term protections:

1. Add front-end cooldown so a user cannot fire repeated searches while one is already running.
2. Add server-side anonymous rate limiting.
   Suggested starting point:
   - 3 searches/minute per visitor/IP
   - 50 searches/day per visitor/IP
3. Coarsen cache grid from roughly 100 m to 300-500 m for better hit rate.
4. Store result snapshots and enriched toilet metadata in Supabase so detail pages and reviews do not depend on repeated AMap fetches.
5. Monitor AMap usage daily after launch and alert if calls spike.

## Product Implication

AMap API cost is manageable for early MVP traffic, but unrestricted server calls should not be exposed without rate limiting.

The paid pass should unlock result details, not act as the only cost-control mechanism. Cost control should happen at the API layer through cache and rate limits.
