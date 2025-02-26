import SettingsPage from "@/components/dashboard/user/SettingsPage";
import hostname from "@/constants/hostname.mjs";

const page = () => {
  return (
    <div>
      <SettingsPage />
    </div>
  );
};

export default page;

export async function generateMetadata() {
  try {
    const host = await hostname();
    let metadata = {
      title: `Settings`,
      description: "Settings.",
      keywords: ["Dashboard, sukunlife, settings"],
      url: `${host}/dashboard/settings`,
      canonical: `${host}/dashboard/settings`,
    };
    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}