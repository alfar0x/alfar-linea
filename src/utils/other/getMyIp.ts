import axios from "axios";

type Response = {
  data?: { ip?: string };
};

const ipCheckerUrl = "https://api.ipify.org?format=json";

const getMyIp = async () => {
  try {
    const response = await axios.get<unknown, Response>(ipCheckerUrl);

    return response?.data?.ip || null;
  } catch (error) {
    return null;
  }
};

export default getMyIp;
