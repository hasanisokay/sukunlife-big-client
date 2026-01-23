import { SERVER } from "@/constants/urls.mjs";

const startPaystationPayment = async (formData) => {
  const res = await fetch(`${SERVER}/api/paystation/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...formData,
    }),
  });

  const data = await res.json();
  console.log(data)
  if (data?.payment_url) {
    window.location.assign(data.payment_url);
  } else {
    toast.error("Payment initialization failed");
  }
};
export default startPaystationPayment;