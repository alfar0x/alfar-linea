import { Item } from "../../../utils/other/getObjectAsPathList";

const processPaths = (paths: Item[]): Item[] => {
  const modifiedPaths: Item[] = [];

  const map = new Map<string, { min?: string; max?: string }>();

  paths.forEach(({ key: path, value }) => {
    const splitPath = path.split(".");
    const lastKey = splitPath[splitPath.length - 1];
    const newPath = splitPath.slice(0, -1).join(".");

    if (lastKey === "min" || lastKey === "max") {
      const existing = map.get(newPath) || {};
      existing[lastKey as keyof typeof existing] = value;
      map.set(newPath, existing);
    } else {
      modifiedPaths.push({ key: path, value });
    }
  });

  map.forEach((value, key) => {
    if (value.min && value.max) {
      modifiedPaths.push({ key: key, value: `${value.min} - ${value.max}` });
    } else {
      if (value.min)
        modifiedPaths.push({ key: `${key}.min`, value: value.min });
      if (value.max)
        modifiedPaths.push({ key: `${key}.max`, value: value.max });
    }
  });

  modifiedPaths.sort((a, b) => a.key.localeCompare(b.key));

  return modifiedPaths;
};

export default processPaths;
