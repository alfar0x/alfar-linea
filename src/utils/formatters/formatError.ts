import PrettyError from "pretty-error";

const getPrettifyError = () => {
  const prettifyError = new PrettyError();

  prettifyError.withoutColors();

  return prettifyError;
};

const prettifyError = getPrettifyError();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatError = (error: any) => {
  return prettifyError.render(error as Error);
};

export default formatError;
