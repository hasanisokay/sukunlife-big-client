import AdminSidebar from "@/components/dashboard/Admin/AdminSidebar";
import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const dashboardLayout = async({children}) => {
    const user = await getUserDataFromToken();
    if(user?.role==='admin'){
        return <div className="flex">
            <AdminSidebar />
            {children}
        </div>
    }
    return children;
};

export default dashboardLayout;