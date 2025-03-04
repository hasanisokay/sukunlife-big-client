import EditResourcePage from "@/components/dashboard/Admin/resources/EditResourcePage";
import NotFound from "@/components/not-found/NotFound";
import { SERVER } from "@/constants/urls.mjs";

const editResourcePage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const id = s.id;
    const res = await fetch(`${SERVER}/api/public/resource/${id}`);
    const data = await res.json();
    console.log(data)
    if (data?.status === 200) {
        return <EditResourcePage resource={data?.resource}/>
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default editResourcePage;
