'use client';
import React, { useState, useEffect, useMemo, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/* ===============================
   STRICT DATE FORMATTERS
   dd/mm/yyyy
================================ */

const formatDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

const formatDateTime = (date) => {
  if (!date) return "-";
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/* ===============================
   MAIN COMPONENT
================================ */

const PaymentsPage = ({ data }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [paymentsData, setPaymentsData] = useState(data);
  const [selected, setSelected] = useState(null);

  /* Sync props */
  useEffect(() => {
    setPaymentsData(data);
  }, [data]);

  /* Memoized derived values */
  const payments = useMemo(
    () => paymentsData?.data?.payments || [],
    [paymentsData]
  );

  const stats = useMemo(
    () => paymentsData?.data?.stats || {},
    [paymentsData]
  );

  const pagination = useMemo(
    () => paymentsData?.data?.pagination || {},
    [paymentsData]
  );

  /* Filter handler */
  const handleFilter = (e) => {
    e.preventDefault();
    const form = e.target;
    const params = new URLSearchParams();

    if (form.keyword.value) params.set("keyword", form.keyword.value);
    if (form.startDate.value) params.set("startDate", form.startDate.value);
    if (form.endDate.value) params.set("endDate", form.endDate.value);

    router.push(`?${params.toString()}`);
  };

  const badge = (status) => {
    const base = "px-3 py-1 text-xs rounded-full font-medium border";
    if (status === "paid")
      return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20`;
    if (status === "pending")
      return `${base} bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20`;
    return `${base} bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-white p-6 lg:p-10">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Payments</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-2">
            Revenue & transaction overview
          </p>
        </div>

        {/* FILTER */}
        <form
          onSubmit={handleFilter}
          className="w-full lg:w-auto bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-4 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            <div className="flex flex-col">
              <label className="text-xs mb-1 text-gray-500 dark:text-slate-400">Search</label>
              <input
                name="keyword"
                defaultValue={searchParams.get("keyword") || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs mb-1 text-gray-500 dark:text-slate-400">From</label>
              <input
                type="date"
                name="startDate"
                defaultValue={searchParams.get("startDate") || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs mb-1 text-gray-500 dark:text-slate-400">To</label>
              <input
                type="date"
                name="endDate"
                defaultValue={searchParams.get("endDate") || ""}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition active:scale-[0.98]"
            >
              Apply
            </button>

          </div>
        </form>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard title="Total Revenue" value={`৳ ${stats.totalRevenue || 0}`} />
        <StatCard title="Paid Transactions" value={stats.totalPaid || 0} />
        <StatCard title="Total Records" value={pagination.total || 0} />
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400">
            <tr>
              <th className="px-6 py-4 text-left">Invoice</th>
              <th className="px-6 py-4 text-left">Customer</th>
              <th className="px-6 py-4 text-left">Amount</th>
              <th className="px-6 py-4 text-left">Source</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p._id}
                onClick={() => setSelected(p)}
                className="border-t border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition"
              >
                <td className="px-6 py-4 font-medium">{p.invoice}</td>
                <td className="px-6 py-4">
                  <div>
                    <div>{p.customer?.name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {p.customer?.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold">৳ {p.amount}</td>
                <td className="px-6 py-4 capitalize">{p.source}</td>
                <td className="px-6 py-4">
                  <span className={badge(p.status)}>{p.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                  {formatDate(p.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <PaymentModal payment={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ===============================
   STAT CARD
================================ */

const StatCard = memo(({ title, value }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-6 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm"
  >
    <p className="text-gray-500 dark:text-slate-400 text-sm">{title}</p>
    <h2 className="text-3xl font-semibold mt-3">{value}</h2>
  </motion.div>
));

/* ===============================
   MODAL
================================ */

const PaymentModal = ({ payment, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f172a] rounded-2xl p-8 shadow-2xl"
      >
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">{payment.invoice}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500">✕</button>
        </div>

        <Section title="Payment Info">
          <Info label="Amount" value={`৳ ${payment.amount}`} />
          <Info label="Status" value={payment.status} />
          <Info label="Source" value={payment.source} />
          <Info label="Created" value={formatDateTime(payment.createdAt)} />
          <Info label="Paid At" value={formatDateTime(payment.paidAt)} />
          <Info label="Transaction ID" value={payment.trx_id || "-"} />
          <Info label="Payment Method" value={payment.payment_method || "-"} />
        </Section>

        <Section title="Customer">
          <Info label="Name" value={payment.customer?.name} />
          <Info label="Email" value={payment.customer?.email} />
          <Info label="Mobile" value={payment.customer?.mobile} />
          <Info label="Address" value={payment.customer?.address} />
        </Section>
      </motion.div>
    </motion.div>
  );
};

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h3 className="font-semibold mb-4">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
      {children}
    </div>
  </div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
    <p className="font-medium break-words">{value || "-"}</p>
  </div>
);

export default memo(PaymentsPage);
