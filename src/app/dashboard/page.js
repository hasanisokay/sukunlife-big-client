import AdminDashboard from "@/components/dashboard/Admin/AdminDashboard";
import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import UserDashboard from "@/components/dashboard/UserDashboard";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const dashboardPage = async () => {
  const user = await getUserDataFromToken();
  //   return <AdminDashboard />
  if (user?.role === "admin") return <AdminDashboard />;
  else if (user?.role === "user") return <UserDashboard />;
  else return null;
};

export default dashboardPage;
