import AddResource from "@/components/dashboard/Admin/resources/AddResource";

const addResourcePage = () => {
    return (
        <div>
            <AddResource />
        </div>
    );
};

export default addResourcePage;


export async function generateMetadata() {
    try {
      let metadata = {
        title: `Add Resource`,
        description: "All resources.",
        keywords: ["Dashboard, sukunlife,"],
      };
      return metadata;
    } catch (error) {
      console.log("error occured")
    }
  }