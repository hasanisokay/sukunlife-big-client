import { SERVER } from "@/constants/urls.mjs";

const getAllScheduleDates = async () => {
  try {
    const res = await fetch(`${SERVER}/api/public/available-appointment-dates`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default getAllScheduleDates;
