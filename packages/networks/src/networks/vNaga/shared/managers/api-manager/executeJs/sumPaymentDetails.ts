import type { LitActionPaymentDetail } from '@lit-protocol/types';
import type { ExecuteJsValueResponse } from '../types';

/**
 * Sum payment details across multiple node responses.
 * Aggregates by component, summing quantity and price.
 */
export const _sumPaymentDetails = (
  responses: ExecuteJsValueResponse[]
): LitActionPaymentDetail[] | undefined => {
  const totals = new Map<string, LitActionPaymentDetail>();

  for (const resp of responses) {
    const details = resp.paymentDetail;
    if (!details || details.length === 0) continue;

    for (const detail of details) {
      if (!detail || typeof detail.component !== 'string') continue;

      const component = detail.component;
      const quantity = Number(detail.quantity ?? 0);
      const price =
        typeof detail.price === 'bigint'
          ? detail.price
          : BigInt(detail.price ?? 0);

      const existing =
        totals.get(component) ??
        ({ component, quantity: 0, price: 0n } as LitActionPaymentDetail);

      existing.quantity += quantity;
      existing.price += price;

      totals.set(component, existing);
    }
  }

  if (totals.size === 0) return undefined;

  return Array.from(totals.values()).sort((a, b) =>
    a.component.localeCompare(b.component)
  );
};
