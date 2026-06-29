export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
export const DEMO_TABLE_LIMIT = 10;
export const DEMO_QUERY_LIMIT = 24;

export function sampleRows<T>(rows: T[], limit = DEMO_QUERY_LIMIT) {
  return DEMO_MODE ? rows.slice(0, limit) : rows;
}

export function demoCount(realCount: number) {
  return DEMO_MODE ? Math.min(realCount, DEMO_QUERY_LIMIT) : realCount;
}
