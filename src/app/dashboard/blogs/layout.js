import getUserDataFromToken from "@/utils/getUserDataFromToken.mjs";

const adminBlogsLayout = async({children}) => {
    const user = await getUserDataFromToken();
    if(user?.role==='admin'){
        return children;
    }else{
        return null
    }
};

export default adminBlogsLayout;