"use server"

import { SERVER } from "@/constants/urls.mjs";

const getTopCourses = async () => {
try {
    const res = await fetch(`${SERVER}/api/public/top-courses?limit=3`,
    
    );
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
};

export default getTopCourses;
