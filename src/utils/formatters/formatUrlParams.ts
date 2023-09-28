import getObjectKeys from "../other/getObjectKeys";

const formatUrlParams = (searchParams: Record<string, string | number>) => {
  const stringSearchParams: Record<string, string> = getObjectKeys(
    searchParams,
  ).reduce<Record<string, string>>(
    (acc, key) => ({ ...acc, [key]: String(searchParams[key]) }),
    {},
  );

  return new URLSearchParams(stringSearchParams).toString();
};

export default formatUrlParams;
