
const allAppoitnmentPage = async ({ searchParams }) => {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 100;
    const keyword = s?.keyword || "";
    const sort = s?.sort || "newest";
    const filter = s?.filter || "all";
};

export default allAppoitnmentPage;
