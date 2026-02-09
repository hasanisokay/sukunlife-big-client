import { SERVER } from "@/constants/urls.mjs";

const getAppointmentSlots = async (date='', consultant='', startDate='', endDate='') => {
  try {
    const res = await fetch(
      `${SERVER}/api/public/available-appointment-slots?date=${date}&&consultant=${consultant}&&startDate=${startDate}&&endDate=${endDate}`,
    );
    const data = await res.json();
    return data;
  } catch (e){
    console.error(e)
    return null;
  }
};

export default getAppointmentSlots;
