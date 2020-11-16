export const round = (decimals = 0) => (value: number) => (
  typeof value === 'number'
    ? Number(value.toFixed(decimals))
    : value
);

export const $ = (decimals = 0) => (value: number) => (
  typeof value === 'number'
    ? `$ ${round(decimals)(value)}`
    : value
);

export const percent = (decimals = 0) => (value: number) => (
  typeof value === 'number'
    ? `${round(decimals)(value * 100)} %`
    : value
);

export const fallback = (
  fallbackText = '-',
  condition = (v: any) => v.toString,
) => (value: number) => (
  condition(value)
    ? value.toString()
    : fallbackText
);
