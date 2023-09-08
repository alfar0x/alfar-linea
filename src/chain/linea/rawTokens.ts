import { RawToken } from "../../types";

const rawTokens: RawToken[] = [
  {
    name: "ETH",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
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
  {
    name: "IUSD",
    address: "0x0A3BB08b3a15A19b4De82F8AcFc862606FB69A2D",
    geskoId: "izumi-bond-usd",
    readableDecimals: 3,
  },
  {
    name: "IZI",
    address: "0x60D01EC2D5E98Ac51C8B4cF84DfCCE98D527c747",
    geskoId: "izumi-finance",
    readableDecimals: 5,
  },
  {
    name: "wAVAX",
    address: "0x5471ea8f739dd37E9B81Be9c5c77754D8AA953E4",
    geskoId: "wrapped-avax",
    readableDecimals: 5,
  },
  {
    name: "wMATIC",
    address: "0x265B25e22bcd7f10a5bD6E6410F10537Cc7567e8",
    geskoId: "wmatic",
    readableDecimals: 3,
  },
  {
    name: "wBNB",
    address: "0xf5C6825015280CdfD0b56903F9F8B5A2233476F5",
    geskoId: "wbnb",
    readableDecimals: 6,
  },
];

export default rawTokens;
