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
