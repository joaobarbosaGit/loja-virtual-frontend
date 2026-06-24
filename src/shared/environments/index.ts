export const environments = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3333',
  storeSlug: import.meta.env.VITE_STORE_SLUG ?? 'minha-loja',
  paymentProvider: import.meta.env.VITE_PAYMENT_PROVIDER ?? 'manual',
};
