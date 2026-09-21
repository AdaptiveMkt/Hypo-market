# Long Term Care Asset Utilization Modeling

Educational long-term care planning tool (not an insurance illustration).

## This save includes

- Asset lines default to **$0**
- **Excludable assets** (* Spouse Excluded Assets.) — not in the countable pool
- Optional homestead exclusion
- Traditional LTC and asset-based single-premium hybrid
- Target premium at 2.5% of countable assets per individual
- Insurance pays the claim first; leftover cost comes from assets
- **Save** (this device + JSON file) and **Download PDF**
- Graph: remaining assets turn red when funds are depleted

## New Vercel project

1. Unzip. You should see one folder: `asset-utilization-modeling`.
2. Create a **new empty GitHub repository**.
3. Upload **everything inside that folder** (must include `package.json` and `vercel.json`).
4. On [vercel.com](https://vercel.com) → **Add New…** → **Project** → import the repo.
5. Leave build settings. No environment variables. Deploy.

Build command: `npm run build`
