import UserAppointmentPage from "@/components/dashboard/user/UserAppointmentPage";
import NotFound from "@/components/not-found/NotFound";
import hostname from "@/constants/hostname.mjs";
import getUserOrders from "@/utils/getUserOrders.mjs";

const page = async () => {
  try {
    let orders;
    orders = await getUserOrders(true);
    if (orders?.status === 200) {
      return (
        <>
          <UserAppointmentPage initialOrders={orders?.appointments} />
        </>
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
    const host = await hostname();
    let metadata = {
      title: `Appointments`,
      description: "All appointments by user.",
      keywords: ["Dashboard, sukunlife, appointments"],
      url: `${host}/dashboard/o`,
      canonical: `${host}/dashboard/a`,
    };
    return metadata;
  } catch (error) {
    console.log("error occured")
  }
}
