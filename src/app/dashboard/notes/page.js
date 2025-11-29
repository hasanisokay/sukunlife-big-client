import KeepNotes from "@/components/dashboard/Admin/notes/AdminNotesPage";
import NotFound from "@/components/not-found/NotFound";
import { websiteName } from "@/constants/names.mjs";
import React from "react";

const adminNotesPage = async ({ searchParams }) => {
  try {
    const s = await searchParams;
    const page = s?.page || 1;
    const limit = s?.limit || 200;
    return (
      <React.Suspense>
        <KeepNotes
          page={page}
          limit={limit}
        />
      </React.Suspense>
    );
  } catch {
    return <NotFound />;
  }
};
export default adminNotesPage;

export async function generateMetadata() {
  try {
    let metadata = {
      title: `Notes - ${websiteName}`,
      description: "All notes.",
    };
    return metadata;
  } catch (error) {
    console.log("error occured");
  }
}
