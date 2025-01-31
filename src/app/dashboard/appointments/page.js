import AllAppointment from "@/components/dashboard/Admin/appointments/AllAppointment";
import NotFound from "@/components/not-found/NotFound";
import SortAppointments from "@/components/ui/sort/SortAppointments";
import getAllAppointment from "@/utils/getAllAppointments.mjs";

const allAppoitnmentPage = async ({ searchParams }) => {
  const s = await searchParams;
  const page = s?.page || 1;
  const limit = s?.limit || 5;
  const filter = s?.filter || "all";
  const sort = s?.sort || "newest";
  const keyword = s?.keyword || "";
  const appointments = await getAllAppointment(
    page,
    limit,
    filter,
    sort,
    keyword
  );
  if (appointments.status !== 200) return <NotFound />;
  return (
    <section className="w-full">
      <SortAppointments filter={filter} page={page} sort={sort} limit={limit} />
      <AllAppointment a={appointments?.appointments || []} />
    </section>
  );
};

export default allAppoitnmentPage;
