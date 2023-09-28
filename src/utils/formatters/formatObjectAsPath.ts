import getObjectAsPathList from "../other/getObjectAsPathList";

const formatObjectAsPath = (obj: object): string => {
  const paths = getObjectAsPathList(obj);

  const maxLength = Math.max(...paths.map((p) => p.path.length));

  const padSize = maxLength + 2;

  const result: string[] = paths.map(({ path, value }) => {
    return `${path.padEnd(padSize)} : ${value}`;
  });

  return result.join("\n");
};

export default formatObjectAsPath;
