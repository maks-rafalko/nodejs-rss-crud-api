const DEFAULT_RADIX = 10;

const parseIntRadix10 = (value: string): number => parseInt(value, DEFAULT_RADIX);

export { parseIntRadix10 as parseInt };
