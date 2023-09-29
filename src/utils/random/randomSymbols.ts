const randomSymbols = (length: number) => {
  const symbols =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const randomStringArray = Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    return symbols.charAt(randomIndex);
  });

  return randomStringArray.join("");
};

export default randomSymbols;
