import { SERVER } from "@/constants/urls.mjs";

const logOut = async () => {
  const res = await fetch(`${SERVER}/api/auth/logout`, {
    credentials: "include",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data;
};

export default logOut;
