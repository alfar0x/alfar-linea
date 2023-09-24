import PrettyError from "pretty-error";

const getPrettifyError = () => {
  const prettifyError = new PrettyError();

  prettifyError.withoutColors();

  return prettifyError;
};

const prettifyError = getPrettifyError();

export default prettifyError;
