import prompts from "prompts";

const getPassword = async (filename?: string) => {
  const filenameMessage = filename ? ` for ${filename}` : "";
  const res = await prompts({
    type: "password",
    name: "password",
    message: `Enter password${filenameMessage}`,
    initial: true,
  });

  return res.password;
};

export default getPassword;
