/*
 * @see http://datagenetics.com/blog/november22017/index.html
 */

export const incrementalMean = (
  value: number,
  size: number,
  previousMean: number,
) => (
  (previousMean * (size - 1) + value) / size
);

export const incrementalStd = (
  value: number,
  size: number,
  previousMean: number,
  currentMean: number,
  previousStd: number,
) => Math.sqrt(
  ((previousStd ** 2) * (size - 1) + (value - previousMean) * (value - currentMean)) / size,
);
