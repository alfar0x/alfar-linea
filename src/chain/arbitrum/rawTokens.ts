import { RawToken } from "../../types";

const rawTokens: RawToken[] = [
  {
    name: "ETH",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    geskoId: "ethereum",
    readableDecimals: 5,
    type: "NATIVE",
  },
  {
    name: "WETH",
    address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    geskoId: "weth",
    readableDecimals: 5,
    type: "WRAPPED_NATIVE",
  },
];

export default rawTokens;
