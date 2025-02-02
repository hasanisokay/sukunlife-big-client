import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import NotFound from "@/components/not-found/NotFound";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const dashboardLayout = async ({ children }) => {
  try {
    const user = await getUserDataFromToken();
    if (user?.role === "admin") {
      return (
        <div className="flex">
          <AdminSidebar />
          {children}
        </div>
      );
    }
    return children;
  } catch {
    return <NotFound />;
  }
};

export default dashboardLayout;
