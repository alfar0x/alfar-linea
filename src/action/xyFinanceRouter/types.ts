type XyFinanceError = {
  success: false;
  errorMsg: string;
  errorCode: number;
};

type XyFinanceQuoteSuccessRoute = {
  contractAddress: string;
  srcSwapDescription: {
    provider: string;
  };
};

type XyFinanceQuoteSuccess = {
  success: true;
  routes: XyFinanceQuoteSuccessRoute[];
};

export type XyFinanceQuote = XyFinanceQuoteSuccess | XyFinanceError;

type XyFinanceBuildTxSuccess = {
  success: true;
  route: {
    minReceiveAmount: string;
    estimatedGas: string;
  };
  tx: {
    to: string;
    data: string;
    value: string;
  };
};

export type XyFinanceBuildTx = XyFinanceBuildTxSuccess | XyFinanceError;
