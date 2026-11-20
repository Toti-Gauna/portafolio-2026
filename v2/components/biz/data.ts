/**
 * «Negocio» of /v2 (lote 6.2): the structure of the page. Everything here is data taken from the projects' repos
 * (fact sheet: the session scratchpad, n62/hechos.md, 20/11/2026); the words live in messages/v2/biz/<locale>.json.
 * Nothing is a measured result: the numbers are the demos' own sample scenarios, and the page says so.
 */
import type { StatusKey } from '../ui/Status';

export type BizProject = 'eclipse' | 'volta' | 'velmar' | 'dentalos' | 'lucero';

/** Each project's colour (the one its case uses), status and where it lives on the site. */
export const BIZ_PROJECTS: Record<BizProject, { color: string; status: StatusKey; href: string }> = {
  eclipse: { color: '#ffc247', status: 'desarrollo', href: 'work/eclipse/' },
  volta: { color: '#b6f36a', status: 'demo', href: 'work/volta/' },
  velmar: { color: '#ffa04a', status: 'demo', href: 'work/velmar/' },
  dentalos: { color: '#3fe0b0', status: 'demo', href: 'work/dentalos/' },
  lucero: { color: '#ff8fc0', status: 'demo', href: 'work/' },
};

export const BIZ_SECTIONS = ['model', 'pricing', 'unit', 'funnel', 'loop', 'sale', 'first'] as const;
export type BizSection = (typeof BIZ_SECTIONS)[number];

/** Who pays whom (money) and what comes back (value), between neighbouring nodes. Words: model.items.<p>. */
export const MODEL: Record<BizProject, { nodes: string[]; links: { from: number; to: number; kind: 'money' | 'value'; key: string }[] }> = {
  eclipse: { nodes: ['client', 'eclipse'], links: [{ from: 0, to: 1, kind: 'money', key: 'plan' }, { from: 1, to: 0, kind: 'value', key: 'product' }] },
  lucero: {
    nodes: ['diner', 'venue', 'eclipse'],
    links: [
      { from: 0, to: 1, kind: 'money', key: 'bill' }, { from: 1, to: 2, kind: 'money', key: 'sub' },
      { from: 1, to: 0, kind: 'value', key: 'menu' }, { from: 2, to: 1, kind: 'value', key: 'system' },
    ],
  },
  volta: {
    nodes: ['supplier', 'store', 'customer'],
    links: [
      { from: 1, to: 0, kind: 'money', key: 'cost' }, { from: 2, to: 1, kind: 'money', key: 'price' },
      { from: 0, to: 1, kind: 'value', key: 'goods' }, { from: 1, to: 2, kind: 'value', key: 'order' },
    ],
  },
  velmar: { nodes: ['customer', 'workshop'], links: [{ from: 0, to: 1, kind: 'money', key: 'price' }, { from: 1, to: 0, kind: 'value', key: 'made' }] },
  dentalos: { nodes: ['patient', 'clinic'], links: [{ from: 0, to: 1, kind: 'money', key: 'care' }, { from: 1, to: 0, kind: 'value', key: 'follow' }] },
};
export const MODEL_ORDER: BizProject[] = ['eclipse', 'lucero', 'volta', 'velmar', 'dentalos'];

/** Pricing: Eclipse's six monthly levels (each includes the one before), Lucero's three cumulative plans, Volta's
 *  order of discounts in the cart. Names and contents are in the copy; here, only how many and in what order. */
export const PRICING = { eclipseLevels: 6, luceroPlans: 3, voltaOrder: ['subtotal', 'packOrStack', 'coupon', 'transfer', 'shipping', 'giftcard'] } as const;

/** The three simulators, with each demo's own sample values (fixtures and tests of the repos). */
export const UNIT = {
  /** Velmar · fixtures/workshop.ts: hour of machine 1.500, by hand 4.500, target margin 50 %; recipes :161-177. */
  velmar: {
    machineHour: 1500, handHour: 4500, margin: 50,
    presets: { plate: { materials: 2975, machineMin: 80, handMin: 15 }, collar: { materials: 2515, machineMin: 90, handMin: 40 } },
  },
  /** Volta · fixtures/workshop.ts: target margin 35 %; Ionic Whey: supplier 26.400 + packaging 650 + 90 + 40 + 14. */
  volta: { supplier: 26400, packaging: [650, 90, 40, 14], margin: 35 },
  /** DentalOS · campaigns.test.ts (S88), in pesos: list 12.000, service 7.000, others 500, fixed 1.000, one call × 300,
   *  assumed response 50 %. */
  dentalos: { listPrice: 12000, discount: 0, serviceCost: 7000, otherVariable: 500, fixedCost: 1000, audience: 1, costPerContact: 300, responsePct: 50 },
};

/** Funnels: the stages of each journey and the module that builds each one (code, not copy). Eclipse's first three
 *  stages are signals and the last four are records written in the CRM (lote 2.5 of its repo). */
export const FUNNEL: Record<BizProject, { modules: string[]; signals?: number }> = {
  eclipse: { modules: ['selector_chosen', 'demo_opened', 'whatsapp_opened', 'Lead.stage', 'proposal_sent', 'won', 'Payment.collected'], signals: 3 },
  volta: { modules: ['app/(shop)', 'engine/stack-builder.ts', 'engine/pricing.ts', 'features/checkout', 'PaymentInstructions', 'engine/lots.ts', 'engine/repurchase.ts', 'engine/gifts.ts'] },
  velmar: { modules: ['/', 'engine/collar.ts', '/carrito/', 'engine/wheel.ts', '/checkout/', 'Cola de producción', '/pedido/', '/club/'] },
  dentalos: { modules: ['#/', '#/reservar', '#/admin/bandeja', 'commands.ts', '#/admin', '#/admin/ortodoncia', '#/admin/presupuestos', '#/admin/espera', '#/admin/informes'] },
  lucero: { modules: ['academy.json', 'games/Ruleta.tsx', 'carta/*', 'games/*', 'store.tsx', 'store.tsx · bill', 'crm/Crm.tsx', 'crm/Academy.tsx'] },
};
export const FUNNEL_ORDER: BizProject[] = ['eclipse', 'volta', 'velmar', 'dentalos', 'lucero'];

/** Loops: how many steps each one has (words in loop.items.<p>.steps). */
export const LOOP: Partial<Record<BizProject, number>> = { volta: 6, lucero: 5, dentalos: 5, eclipse: 6 };
export const LOOP_ORDER: BizProject[] = ['volta', 'lucero', 'dentalos', 'eclipse'];
/** Seconds each step of «Recorrer» stays. */
export const LOOP_STEP_MS = 1600;

/** The ten-minute demo meeting (Volta · docs/guion-demo.md:20-31): the minute each beat starts. */
export const SALE_BEATS = [0, 60, 120, 180, 270, 315, 345, 390, 540];
export const SALE_LENGTH = 600;

/** The first number each product's panel shows. */
export const FIRST: BizProject[] = ['volta', 'velmar', 'dentalos', 'lucero', 'eclipse'];
