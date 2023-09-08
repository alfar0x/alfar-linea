import { RawToken } from "../../types";

const rawTokens: RawToken[] = [
  {
    name: "ETH",
    address: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
    geskoId: "ethereum",
    readableDecimals: 5,
    isNative: true,
  },
  {
    name: "WETH",
    address: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
    geskoId: "wrapped-ether-linea",
    readableDecimals: 5,
    isWrappedNative: true,
  },
  {
    name: "USDT",
    address: "0xa219439258ca9da29e9cc4ce5596924745e12b93",
    geskoId: "bridged-tether-linea",
    readableDecimals: 3,
  },
  {
    name: "USDC",
    address: "0x176211869ca2b568f2a7d4ee941e073a821ee1ff",
    geskoId: "bridged-usd-coin-linea",
    readableDecimals: 3,
  },
  {
    name: "DAI",
    address: "0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5",
    geskoId: "bridged-dai-stablecoin-linea",
    readableDecimals: 3,
  },
  {
    name: "WBTC",
    address: "0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4",
    geskoId: "wrapped-bitcoin",
    readableDecimals: 7,
  },
  {
    name: "ceBUSD",
    address: "0x7d43AABC515C356145049227CeE54B608342c0ad",
    geskoId: "binance-usd-linea",
    readableDecimals: 3,
  },
];

export default rawTokens;
