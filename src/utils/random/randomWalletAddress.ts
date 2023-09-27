const randomWalletAddress = () => {
  const addressLength = 40;

  const symbols = "abcdef0123456789";

  const randomWalletAddress = Array.from({ length: addressLength }, () => {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols.charAt(randomIndex);
  });

  return randomWalletAddress.join("");
};

export default randomWalletAddress;
