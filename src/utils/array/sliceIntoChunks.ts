const sliceIntoChunks = <T>(arr: T[], maxChunkSize: number) => {
  const res = [];

  const chunks = Math.ceil(arr.length / maxChunkSize);
  const chunkSize = Math.ceil(arr.length / chunks);

  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

export default sliceIntoChunks;
