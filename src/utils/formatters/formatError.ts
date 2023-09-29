import PrettyError from "pretty-error";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatError = (error: any) => {
  return new PrettyError().withoutColors().render(error as Error);
};

export default formatError;
