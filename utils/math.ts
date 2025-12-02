
/**
 * Standard Normal Probability Density Function
 */
export const normalPDF = (x: number): number => {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x);
};

/**
 * Standard Normal Cumulative Distribution Function
 */
export const normalCDF = (x: number): number => {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014337 * Math.exp((-x * x) / 2);
  const p =
    d *
    t *
    (0.31938153 +
      t *
      (-0.356563782 +
        t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));

  if (x > 0) {
    return 1 - p;
  }
  return p;
};

export interface BSInputs {
  S: number; // Spot Price
  K: number; // Strike Price
  T: number; // Time to maturity (years)
  v: number; // Volatility (sigma)
  r: number; // Risk-free rate
}

export interface OptionMetrics {
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
  probITM: number;
}

export type HeatmapMetric = keyof OptionMetrics;

export interface BSResult {
  call: OptionMetrics;
  put: OptionMetrics;
  d1: number;
  d2: number;
}

/**
 * Computes European Call and Put prices and Greeks using Black-Scholes Formula
 */
export const calculateBlackScholes = ({
  S,
  K,
  T,
  v,
  r,
}: BSInputs): BSResult => {
  // Handle edge cases
  if (T <= 0) {
    const callPrice = Math.max(0, S - K);
    const putPrice = Math.max(0, K - S);
    return {
      call: { price: callPrice, delta: callPrice > 0 ? 1 : 0, gamma: 0, vega: 0, theta: 0, rho: 0, probITM: callPrice > 0 ? 1 : 0 },
      put: { price: putPrice, delta: putPrice > 0 ? -1 : 0, gamma: 0, vega: 0, theta: 0, rho: 0, probITM: putPrice > 0 ? 1 : 0 },
      d1: 0,
      d2: 0,
    };
  }

  // Avoid division by zero for volatility
  const sigma = Math.max(v, 0.0001);

  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const Nd1 = normalCDF(d1);
  const Nd2 = normalCDF(d2);
  const N_d1 = normalCDF(-d1);
  const N_d2 = normalCDF(-d2);
  const nd1 = normalPDF(d1); // Standard normal density function

  const e_rt = Math.exp(-r * T);

  // Prices
  const callPrice = S * Nd1 - K * e_rt * Nd2;
  const putPrice = K * e_rt * N_d2 - S * N_d1;

  // Greeks (Common)
  const gamma = nd1 / (S * sigma * Math.sqrt(T));
  const vega = S * Math.sqrt(T) * nd1 * 0.01; // Scaled by 0.01 to represent 1% change in vol

  // Call Greeks
  const callDelta = Nd1;
  const callTheta = (- (S * nd1 * sigma) / (2 * Math.sqrt(T)) - r * K * e_rt * Nd2) / 365;
  const callRho = K * T * e_rt * Nd2 * 0.01;
  const callProbITM = Nd2; // Risk-neutral probability of finishing ITM

  // Put Greeks
  const putDelta = Nd1 - 1;
  const putTheta = (- (S * nd1 * sigma) / (2 * Math.sqrt(T)) + r * K * e_rt * N_d2) / 365;
  const putRho = -K * T * e_rt * N_d2 * 0.01;
  const putProbITM = N_d2;

  return {
    call: {
      price: callPrice,
      delta: callDelta,
      gamma: gamma,
      vega: vega,
      theta: callTheta,
      rho: callRho,
      probITM: callProbITM
    },
    put: {
      price: putPrice,
      delta: putDelta,
      gamma: gamma,
      vega: vega,
      theta: putTheta,
      rho: putRho,
      probITM: putProbITM
    },
    d1,
    d2
  };
};

/**
 * Generates a color on a gradient from color1 to color2
 */
export const interpolateColor = (
  color1: [number, number, number],
  color2: [number, number, number],
  factor: number
): string => {
  const f = Math.max(0, Math.min(1, factor));
  const result = color1.slice().map((c, i) => {
    return Math.round(c + f * (color2[i] - c));
  });
  return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
};

export const formatNumber = (val: number, decimals: number = 4) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);
};
