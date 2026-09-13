# QarQuest Data Connector v1

## Purpose
Feed authenticated QarQuest market records into VVOS Acquisition Intelligence without storing credentials in source code, Firestore, logs or the browser bundle.

## Current state
The connector is implemented but deliberately disabled from autonomous crawling until the exact network request used by the logged-in QarQuest application is verified.

## Capture the endpoint
1. Log into QarQuest normally in your own browser.
2. Open Developer Tools > Network > Fetch/XHR.
3. Open a vehicle search/result page in QarQuest.
4. Identify the request returning the vehicle/search data as JSON.
5. Record only the request URL, HTTP method, query/body field names and a REDACTED sample response.
6. Never commit cookies, passwords, bearer tokens, CSRF tokens or full request headers.

## Runtime secrets
Session material must be injected server-side from the deployment secret store. Do not expose it through `NEXT_PUBLIC_*` environment variables.

## Guardrails
- HTTPS and QarQuest hosts only.
- Minimum 4 seconds between connector requests per running instance.
- No CAPTCHA bypass, anti-bot bypass or authentication circumvention.
- No redirect following to unknown hosts.
- Authentication failures stop ingestion.
- Raw credentials are never included in audit records.

## Normalized output
`MarketVehicle` contains source identity, make/model/variant, year, mileage, asking price, expected retail, expected gross margin, expected days-to-sell, comparable count, country, fetch timestamp and confidence.

## Next activation step
Once the verified JSON request shape is known, add a server-only route/job that calls `fetchQarQuestJson`, persists normalized market snapshots and feeds those snapshots into the Acquisition Intelligence scoring model.
