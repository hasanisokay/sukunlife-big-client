'use client'
import React, { useState, useMemo, useEffect } from "react";
import SearchBar from "../search/SearchBar";
import PaginationDefault from "../paginations/PaginationDefault";
import { Flip, toast, ToastContainer } from "react-toastify";
import SortOrders from "./SortOrders";
import formatDate from "@/utils/formatDate.mjs";
import approveOrder from "@/server-functions/approveOrder.mjs";
import deleteBulkOrders from "@/server-functions/deleteBulkOrders.mjs";

// ── Payment Details Panel (inside modal) ────────────────────────────────────
const PaymentPanel = ({ pd }) => {
  if (!pd) return <p className="text-sm text-gray-400">No payment data.</p>;
  const raw = pd.raw_response?.data;
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">{pd.payment_method ?? "—"}</span>
        {pd.fulfilled ? (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Fulfilled
          </span>
        ) : (
          <span className="text-xs text-gray-400">Not fulfilled</span>
        )}
      </div>
      {pd.trx_id && (
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Transaction ID</p>
          <p className="font-mono text-sm font-medium text-green-600 dark:text-green-400">{pd.trx_id}</p>
        </div>
      )}
      <Row label="Amount paid" value={`৳${pd.amount?.toLocaleString() ?? "—"}`} />
      {raw?.payer_mobile_no && <Row label="Payer mobile" value={raw.payer_mobile_no} />}
      {raw?.payment_amount && <Row label="Gateway amount" value={`৳${parseFloat(raw.payment_amount).toFixed(2)}`} />}
      <Row label="Paid at" value={pd.paidAt ? formatDate(pd.paidAt) : "—"} />
      {raw?.order_date_time && <Row label="Order time" value={raw.order_date_time} />}
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between items-baseline gap-2 text-sm">
    <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
    <span className="text-right break-all">{value}</span>
  </div>
);

// ── Order Detail Modal ───────────────────────────────────────────────────────
const OrderModal = ({ order, onClose, onApprove }) => {
  if (!order) return null;

  const statusStyle = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <p className="font-mono text-xs text-gray-400 mb-1">{order.invoice}</p>
            <h2 className="text-base font-semibold">{order.customer?.name}</h2>
            <span className={`mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle[order.status] ?? "bg-gray-100 text-gray-600"}`}>
              {order.status}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-1">×</button>
        </div>

        {/* Customer */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-1.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Customer</p>
          <Row label="Mobile" value={order.customer?.mobile} />
          <Row label="Email" value={order.customer?.email} />
          <Row label="Address" value={order.customer?.address} />
        </div>

        {/* Items */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Order items</p>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.unit} · {item.itemType}</p>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <p className="text-sm font-medium">৳{(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">৳{item.price} × {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-1.5">
            <Row label="Subtotal" value={`৳${order.subtotal?.toLocaleString()}`} />
            <Row label="Delivery" value={`৳${order.deliveryCharge?.toLocaleString()}`} />
            {order.voucher && <Row label="Voucher" value={order.voucher} />}
            <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 dark:border-gray-700">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-base">৳{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Payment details</p>
          <PaymentPanel pd={order.paymentDetails} />
        </div>

        {/* Timestamps */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 space-y-1.5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Timestamps</p>
          <Row label="Ordered at" value={formatDate(order.orderedAt)} />
          <Row label="Created at" value={formatDate(order.createdAt)} />
        </div>

        {/* Approve */}
        {order.status === "pending" && (
          <div className="p-5">
            <button
              onClick={() => { onApprove(order._id); onClose(); }}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
            >
              Approve this order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    approved: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const OrdersPage = ({ orders: initialOrders, page, limit, filter }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [orders, setOrders] = useState(initialOrders?.orders ?? []);
  const [activeOrder, setActiveOrder] = useState(null);

  const totalCount = initialOrders?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  useEffect(() => { setOrders(initialOrders?.orders ?? []); }, [initialOrders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    paid: orders.filter(o => o.status === "paid").length,
    pending: orders.filter(o => o.status === "pending").length,
    revenue: orders.reduce((a, o) => a + (o.totalAmount ?? 0), 0),
  }), [orders]);

  const handleApproveOrder = async (orderId) => {
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) { toast.error("Order not found"); return; }
      const courseIds = order.items
        .filter(item => item.itemType === "course")
        .map(item => ({ courseId: item.productId, title: item.title }));
      const body = {};
      if (courseIds.length > 0) body.courseIds = courseIds;
      const resData = await approveOrder(orderId, body);
      if (resData?.status === 200) {
        toast.success(resData.message);
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: "approved" } : o));
      } else {
        toast.error(resData?.message);
      }
    } catch {
      toast.error("An error occurred while approving the order");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const resData = await deleteBulkOrders(selectedOrders);
      if (resData.status === 200) {
        setOrders(prev => prev.filter(o => !selectedOrders.includes(o._id)));
        setSelectedOrders([]);
        toast.success(resData.message);
      } else {
        toast.error(resData.message);
      }
    } catch {
      toast.error("An error occurred while deleting orders");
    }
  };

  const toggleSelect = (id) =>
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = (checked) =>
    setSelectedOrders(checked ? filteredOrders.map(o => o._id) : []);

  const statusFilters = ["all", "paid", "pending", "approved", "cancelled"];

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total orders", value: stats.total },
          { label: "Paid", value: stats.paid, color: "text-green-600 dark:text-green-400" },
          { label: "Pending", value: stats.pending, color: "text-yellow-600 dark:text-yellow-400" },
          { label: "Revenue", value: `৳${stats.revenue.toLocaleString()}` },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${color ?? ""}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
        <SearchBar placeholder="Search order" />
        <SortOrders filter={filter} />
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {statusFilters.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
              statusFilter === f
                ? "bg-blue-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <span className="text-sm">{selectedOrders.length} selected</span>
          <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600">
            Delete selected
          </button>
          <button onClick={() => setSelectedOrders([])} className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-3">Showing {filteredOrders.length} order(s)</p>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <tr>
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={e => toggleAll(e.target.checked)}
                  />
                </th>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Items</th>
                <th className="p-3 text-left">Total</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={9} className="py-10 text-center text-gray-400">No orders found.</td></tr>
              ) : filteredOrders.map(order => {
                const initials = order.customer?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                    <td className="p-3">
                      <input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => toggleSelect(order._id)} />
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-400 max-w-[160px] truncate">{order.invoice}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-medium shrink-0">{initials}</div>
                        <div>
                          <p className="font-medium">{order.customer?.name}</p>
                          <p className="text-xs text-gray-400">{order.customer?.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">{order.items?.length} item{order.items?.length > 1 ? "s" : ""}</td>
                    <td className="p-3 font-semibold">৳{order.totalAmount?.toLocaleString()}</td>
                    <td className="p-3 text-gray-500 text-xs">{order.paymentDetails?.payment_method ?? "—"}</td>
                    <td className="p-3 text-xs text-gray-400 whitespace-nowrap">{formatDate(order.orderedAt)}</td>
                    <td className="p-3"><StatusBadge status={order.status} /></td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => setActiveOrder(order)} className="px-2.5 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                          View
                        </button>
                        {order.status === "pending" && (
                          <button onClick={() => handleApproveOrder(order._id)} className="px-2.5 py-1 text-xs border border-green-300 text-green-700 rounded-md hover:bg-green-50 dark:hover:bg-green-900/30">
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationDefault p={page} totalPages={totalPages} />

      <OrderModal order={activeOrder} onClose={() => setActiveOrder(null)} onApprove={handleApproveOrder} />
      <ToastContainer transition={Flip} />
    </div>
  );
};

export default OrdersPage;