import ResourcesAdmin from "@/components/dashboard/Admin/resources/ResourcesAdmin";
import NotFound from "@/components/not-found/NotFound";
import PaginationDefault from "@/components/paginations/PaginationDefault";
import getResources from "@/utils/getResources.mjs";

const page = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 100;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const resources = await getResources(page, limit, keyword, sort);

    if (resources?.status === 200) {
      return (
        <div className="overflow-hidden">
          <ResourcesAdmin resources={resources?.resources} />
          <PaginationDefault p={page} totalPages={resources?.totalPages} />
        </div>
      );
    } else {
      return <NotFound />;
    }
  } catch {
    return <NotFound />;
  }
};

export default page;

export async function generateMetadata() {
  try {
    let metadata = {
      title: `Resources`,
      description: "All resources.",
      keywords: ["Dashboard, sukunlife,"],
    };
    return metadata;
  } catch (error) {
    console.log("error occured");
  }
}
