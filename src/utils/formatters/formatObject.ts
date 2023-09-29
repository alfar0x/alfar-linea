const formatObject = (obj: object) => {
  return JSON.stringify(
    obj,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    2,
  );
};

export default formatObject;
