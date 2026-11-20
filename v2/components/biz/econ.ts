/**
 * The unit economics of the projects, as their code computes it (lote 6.2). Each function is the repo's own,
 * rewritten here line for line; the comment above it names the file it comes from. The unit test checks them
 * against the numbers in the repos (Velmar's NFC plate, Volta's Ionic Whey, DentalOS's campaign tests).
 * Amounts are whole pesos (DentalOS keeps them in minor units in its repo; here they are pesos).
 */

/** Velmar · src/demo/admin/workshop/costs.ts (recipeCost): materials + machine minutes + hand minutes. */
export function recipeCost(r: { materials: number; machineMin: number; machineHour: number; handMin: number; handHour: number }) {
  const machine = Math.round((r.machineMin / 60) * r.machineHour);
  const hand = Math.round((r.handMin / 60) * r.handHour);
  return { materials: r.materials, machine, hand, total: r.materials + machine + hand };
}

/** Velmar and Volta · workshop/costs.ts: the price that leaves `marginPct` of the SALE price, rounded up to $100. */
export function suggestedPrice(cost: number, marginPct: number): number {
  const pct = Math.min(Math.max(Math.round(marginPct), 0), 90);
  return Math.ceil((cost * 100) / (100 - pct) / 100) * 100;
}

/** Velmar and Volta · workshop/costs.ts: margin on the sale price (not a markup on cost). */
export function marginPct(price: number, cost: number): number | null {
  return price > 0 ? Math.round(((price - cost) / price) * 100) : null;
}

export type MarginState = 'loss' | 'low' | 'ok';
/** workshop/costs.ts (marginState): «Pierde plata» · «Margen bajo» · «Buen margen». */
export const marginState = (pct: number, target: number): MarginState => (pct < 0 ? 'loss' : pct < target ? 'low' : 'ok');

/** Volta · supplier-list/round.ts: price for a margin (1–90 %), then the next commercial price. */
export function priceForMargin(cost: number, margin: number): number {
  const pct = Math.min(90, Math.max(1, margin));
  return Math.ceil((cost * 100) / (100 - pct));
}
export type PriceEnding = '900' | '500' | '100';
export function commercialPrice(raw: number, ending: PriceEnding = '900'): number {
  const amount = Math.max(0, Math.ceil(raw));
  if (ending === '100') return Math.ceil(amount / 100) * 100;
  if (ending === '500') return Math.ceil(amount / 500) * 500;
  if (amount < 1000) return Math.max(50, Math.ceil(amount / 50) * 50);
  return Math.ceil((amount + 100) / 1000) * 1000 - 100;
}
export const proposedPrice = (cost: number, margin: number, ending: PriceEnding = '900') => commercialPrice(priceForMargin(cost, margin), ending);

/** Volta · supplier-list/costs.ts (landedCost): what the supplier is paid + the packaging the product travels in. */
export const landedCost = (supplier: number, packaging: number) => supplier + packaging;

/** DentalOS · src/domain/campaigns.ts (unitEconomics): contribution = net revenue − service cost − other variables. */
export function unitEconomics(listPrice: number, discount: number, serviceCost: number, otherVariable: number) {
  const netRevenue = listPrice - discount;
  const contribution = netRevenue - serviceCost - otherVariable;
  return { netRevenue, contribution, contributionPct: netRevenue > 0 ? contribution / netRevenue : null };
}

/** DentalOS · campaigns.ts (breakeven): attentions that cover the campaign, only with a positive contribution. */
export function breakeven(campaignCost: number, contribution: number): number | null {
  if (contribution <= 0) return null;
  return Math.ceil(campaignCost / contribution);
}

/** DentalOS · campaigns.ts (campaignEconomics), steps 3–8: communication, campaign cost, unit, break-even, projection. */
export function campaignEconomics(c: {
  listPrice: number; discount: number; serviceCost: number; otherVariable: number; fixedCost: number;
  audience: number; costPerContact: number; responsePct: number;
}) {
  const commCost = c.audience * c.costPerContact;
  const campaignCost = commCost + c.fixedCost;
  const unit = unitEconomics(c.listPrice, c.discount, c.serviceCost, c.otherVariable);
  const breakevenAttentions = breakeven(campaignCost, unit.contribution);
  const projectedAttentions = Math.ceil((c.audience * c.responsePct) / 100);
  return { commCost, campaignCost, unit, breakevenAttentions, projectedAttentions, projectedResult: unit.contribution * projectedAttentions - campaignCost };
}
