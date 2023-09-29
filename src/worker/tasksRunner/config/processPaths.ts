import { PathValue } from "../../../utils/other/getObjectAsPathList";

const processPaths = (paths: PathValue[]): PathValue[] => {
  const modifiedPaths: PathValue[] = [];

  const map = new Map<string, { min?: string; max?: string }>();

  paths.forEach(({ path, value }) => {
    const splitPath = path.split(".");
    const lastKey = splitPath[splitPath.length - 1];
    const newPath = splitPath.slice(0, -1).join(".");

    if (lastKey === "min" || lastKey === "max") {
      const existing = map.get(newPath) || {};
      existing[lastKey as keyof typeof existing] = value;
      map.set(newPath, existing);
    } else {
      modifiedPaths.push({ path, value });
    }
  });

  map.forEach((value, key) => {
    if (value.min && value.max) {
      modifiedPaths.push({ path: key, value: `${value.min} / ${value.max}` });
    } else {
      if (value.min)
        modifiedPaths.push({ path: `${key}.min`, value: value.min });
      if (value.max)
        modifiedPaths.push({ path: `${key}.max`, value: value.max });
    }
  });

  modifiedPaths.sort((a, b) => a.path.localeCompare(b.path));

  return modifiedPaths;
};

export default processPaths;
