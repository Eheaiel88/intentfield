// Public identifiers for the single shared Whop catalog. Prices are USD,
// one-time and additive. These IDs are configuration, never proof of access.
export const whopCatalog = {
  accountId: "biz_xeSK2pOhE9Sxuk",
  appId: "app_hA6Q15wmNvxibS",
  apiVersionDate: "2026-09-24",
  products: {
    book: {
      productId: "prod_1Fjx6emesjwl5",
      planId: "plan_55mR1Gb7ydVaR",
      price: 19,
    },
    course: {
      productId: "prod_PQjYan54CWXvv",
      planId: "plan_VBYHNxWOs9KQG",
      price: 79,
    },
    audio: {
      productId: "prod_9CR6SscWISttH",
      planId: "plan_vjX3WRljDFF4B",
      price: 29,
    },
  },
} as const;

// Published access term for one-time digital purchases: 12 months online.
export const PURCHASE_ACCESS_DAYS = 365;

// A verified payment's plan decides which product it unlocks. Unknown plans
// are recorded and ignored, never guessed.
export function skuForPlan(
  planId: string,
): keyof typeof whopCatalog.products | null {
  for (const [sku, product] of Object.entries(whopCatalog.products))
    if (product.planId === planId)
      return sku as keyof typeof whopCatalog.products;
  return null;
}
