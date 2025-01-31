import AllAppointment from "@/components/dashboard/Admin/appointments/AllAppointment";
import NotFound from "@/components/not-found/NotFound";
import SearchBar from "@/components/search/SearchBar";
import SortAppointments from "@/components/ui/sort/SortAppointments";
import getAllAppointment from "@/utils/getAllAppointments.mjs";

const allAppoitnmentPage = async ({ searchParams }) => {
  const s = await searchParams;
  const page = s?.page || 1;
  const limit = s?.limit || 5;
  const filter = s?.filter || "all";
  const sort = s?.sort || "newest";
  const keyword = s?.keyword || "";
  const skip = s?.skip || 0;
  const appointments = await getAllAppointment(
    page,
    limit,
    filter,
    sort,
    keyword,
    skip
  );
  
  if (appointments?.status !== 200) return <NotFound />;
  return (
    <section className="w-full">
      <SortAppointments filter={filter} sort={sort} limit={limit} />
      <div className="bg-gray-100 dark:bg-gray-900">
        <SearchBar placeholder={"Search with name, trxId, number, problem"} />
      </div>
      <AllAppointment a={appointments} page={page} limit={limit} />
    </section>
  );
};

export default allAppoitnmentPage;
