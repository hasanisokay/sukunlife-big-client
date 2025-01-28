import BookAppointment from "@/components/appointment/BookAppointment";
import getAllScheduleDates from "@/utils/getAllScheduleDates.mjs";

const page = async () => {
  const dates = await getAllScheduleDates();

  return <BookAppointment dates={dates.dates} status={dates.status} />;
};

export default page;
