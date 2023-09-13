import prompts from "prompts";

const getPassword = async (filename?: string) => {
  const res = await prompts({
    type: "password",
    name: "password",
    message: "Enter password" + (filename ? ` for ${filename}` : ""),
    initial: true,
  });

  return res.password;
};

export default getPassword;
