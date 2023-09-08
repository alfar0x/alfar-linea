import prompts from "prompts";

const confirmRun = async () => {
  const res = await prompts({
    type: "confirm",
    name: "value",
    message: "Can you confirm?",
    initial: true,
  });

  if (!res.value) {
    throw new Error(`run was not confirmed`);
  }
};

export default confirmRun;
