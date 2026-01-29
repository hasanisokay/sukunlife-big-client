import NotFound from "@/components/not-found/NotFound";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const moduleIdPage = async ({ children }) => {
  try {
    const user = await getUserDataFromToken();
    if (user?.role === "user" || user?.role === "admin") {
      return children;
    } else return <NotFound />;
  } catch {
    return <NotFound />;
  }
};
export default moduleIdPage;