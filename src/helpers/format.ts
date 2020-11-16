export const round = (value: number, decimals = 0) => (
  typeof value === 'number'
    ? Number(value.toFixed(decimals))
    : value
);

export const $ = (value: number, decimals = 0) => (
  typeof value === 'number'
    ? `$ ${round(value, decimals)}`
    : value
);

export const percent = (value: number, decimals = 0) => (
  typeof value === 'number'
    ? `${round(value * 100, decimals)} %`
    : value
);

export const fallback = (value: number, fallbackText = '-', condition = (v: unknown) => v.toString) => (
  condition(value)
    ? value.toString()
    : fallbackText
);
