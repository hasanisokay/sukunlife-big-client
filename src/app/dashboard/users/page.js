import UserManagementPageAdmin from "@/components/dashboard/Admin/UserManagementPageAdmin";
import { websiteName } from "@/constants/names.mjs";
import getAllUsers from "@/utils/getAllUsers?.mjs";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const usersPageAdmin = async ({ searchParams }) => {
  const s = await searchParams;
  const page = s?.page || 1;
  const limit = s?.limit || 100;
  const keyword = s?.keyword || "";
  const sort = s?.sort || "newest";
  const filter = s?.filter || "all";
  const user = await getUserDataFromToken();
  if (user?.role === "admin") {
    const users = await getAllUsers(page, limit, keyword, sort, filter);
    return <UserManagementPageAdmin u={users} />;
  } else return null;
};

export default usersPageAdmin;


export async function generateMetadata() {
  try {
    let metadata = {
      title: `Users - ${websiteName}`,
      description: "Users page.",
      keywords: ["Dashboard, sukunlife,"],
    };
    return metadata;
  } catch (error) {
    console.error("Error fetching blog metadata:", error);
  }
}
