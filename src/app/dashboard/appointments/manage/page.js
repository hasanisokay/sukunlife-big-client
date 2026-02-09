import AppointmentSlotsManager from "@/components/dashboard/Admin/appointments/Appointmentslotsmanager";
import NotFound from "@/components/not-found/NotFound";
import getAppointmentSlots from "@/utils/getAppointmentSlots.mjs";

const page = async ({ searchParams }) => {
  const s = await searchParams;
  const consultant = s?.consultant || "";
  const date = s?.date || "";
  const startDate = s?.startDate || "";
  const endDate = s?.endDate || "";
  try {
    const d = await getAppointmentSlots(date, consultant, startDate, endDate);
    return <AppointmentSlotsManager initialSlots={d?.slots} />;
  } catch {
    return <NotFound />;
  }
};

export default page;
