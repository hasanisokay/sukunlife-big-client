// import { headers } from "next/headers";

const hostname = async () => {
  return 'https://sukunlife.com'
  // const headerList = headers();
  // const host = (await headerList).get("host") || 'localhost:3000';
  const env = process.env.NODE_ENV;
  if (env === "development") {
    return "http://localhost:3000";
  } else if (env === "production") {
    return `https://sukunlife.com`;
  }
};
export default hostname;
