type OpenOceanSwapQuoteError = {
  code: 500;
  error: string;
  errorMsg: string;
};

type OpenOceanSwapQuoteSuccess = {
  code: 200;
  data: {
    value: string;
    data: string;
    to: string;
    estimatedGas: number;
    minOutAmount: string;
  };
};

export type OpenOceanSwapQuote =
  | OpenOceanSwapQuoteError
  | OpenOceanSwapQuoteSuccess;
