import AdminDashboard from "@/components/dashboard/Admin/AdminDashboard";
import UserDashboard from "@/components/dashboard/UserDashboard";
import NotFound from "@/components/not-found/NotFound";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const dashboardPage = async () => {
  try {
    const user = await getUserDataFromToken();
    if (user?.role === "admin") return <AdminDashboard />;
    else if (user?.role === "user") return <UserDashboard />;
    else return null;
  } catch {
    return <NotFound />;
  }
};

export default dashboardPage;
