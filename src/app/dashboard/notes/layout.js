import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const adminNotesLayout = async({children}) => {
    try {
        const user = await getUserDataFromToken();
        if (user?.role === "admin") {
          return children;
        } else return null;
      } catch {
        return null
      }
};

export default adminNotesLayout;