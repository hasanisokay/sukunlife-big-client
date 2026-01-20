"use client";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function PaymentSuccess() {
  const user = useSelector((state) => state.user.userData);
  
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("pendingAppointment"));
    if (!data) return;
    let dataToSave = data;
    if (user?._id) {
      dataToSave.loggedInUser = { _id: user?._id, name: user?.name };
    }
    fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/public/book-appointment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        advancePayment: true,
        reviewed: false,
      }),
    });

    localStorage.removeItem("pendingAppointment");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <h1>✅ Payment Successful — Appointment Confirmed</h1>;
}
