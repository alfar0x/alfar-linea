import formatObject from "../formatters/formatObject";

/* eslint-disable @typescript-eslint/no-explicit-any */
type GenericObject = { [key: string]: any };

export type PathValue = { path: string; value: string };

const getType = (value: any): string => {
  if (Array.isArray(value)) return "array";
  if (typeof value === "object" && value !== null) return "object";
  return "primitive";
};

const formatValue = (value: any): string => {
  const type = getType(value);
  switch (type) {
    case "array":
      return value.join(", ");
    case "object":
      return formatObject(value);
    default:
      return String(value);
  }
};

const collectPaths = (obj: any, prefix = ""): PathValue[] => {
  const paths: PathValue[] = [];

  for (const key in obj) {
    if (getType(obj[key]) === "object") {
      paths.push(...collectPaths(obj[key], `${prefix}${key}.`));
    } else {
      const value = formatValue(obj[key]);
      paths.push({ path: `${prefix}${key}`, value });
    }
  }

  return paths;
};

const getObjectAsPathList = (obj: GenericObject) => collectPaths(obj);

export default getObjectAsPathList;
