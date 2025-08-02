'use client';

import DatePicker from '@/components/ui/datepicker/Datepicker';
import { SERVER } from '@/constants/urls.mjs';
import addNewVoucher from '@/server-functions/addNewVoucher.mjs';
import deleteVoucher from '@/server-functions/deleteVoucher.mjs';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';

const VouchersPage = ({ vouchers: initialVouchers = [] }) => {
    const [vouchers, setVouchers] = useState(initialVouchers);
    const [newVoucher, setNewVoucher] = useState({
        code: '',
        type: 'percentage', // 'percentage' or 'amount'
        value: '',
        maxLimit: '',
        minOrderLimit: '',
        category: '',
        expiryDate: new Date(),
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewVoucher((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddVoucher = async (e) => {
        e.preventDefault();
        if (!newVoucher.code || !newVoucher.value) return;
        try {
            const d = await addNewVoucher(newVoucher)
            if (d.status === 200) {
                toast.success(d.message);
                setVouchers((prev) => [...prev, newVoucher]);
                setNewVoucher({
                    code: '',
                    type: 'percentage',
                    value: '',
                    maxLimit: '',
                    minOrderLimit: '',
                    category: '',
                    expiryDate: new Date(),
                });
            } else {
                toast.error(d.message)
            }
        } catch (e) {
            toast.error(e.message)
        }


    };

    const handleDeleteVoucher = async (code) => {
        try {
            const d = await deleteVoucher(code);
            if (d.status === 200) {
                toast.success(d.message);
                setVouchers((prev) => prev.filter((voucher) => voucher.code !== code));
            } else {
                toast.error(d.message || "ERROR")
            }
        } catch {

        }

    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 w-full">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Vouchers</h1>

            <div className='flex justify-around gap-4 flex-wrap  items-start max-w-6xl min-w-[300px] mx-auto '>
                {/* Add Voucher Form */}
                <form onSubmit={handleAddVoucher} className="bg-gray-300 min-w-96 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Voucher</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                        {['code', 'value', 'maxLimit', 'minOrderLimit', 'category'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {field === 'value'
                                        ? newVoucher.type === 'percentage'
                                            ? 'Percentage (%)'
                                            : 'Amount (BDT)'
                                        : field.charAt(0).toUpperCase() + field.slice(1)}
                                </label>
                                <input
                                    type={field === 'value' || field === 'maxLimit' ? 'number' : 'text'}
                                    name={field}
                                    value={newVoucher[field]}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    required={['code', 'value'].includes(field)}
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select
                                name="type"
                                value={newVoucher.type}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="amount">Amount</option>
                            </select>
                        </div>

                        <div>
                            <DatePicker label={"Expiry Date"} defaultDate={new Date()} onChangeHanlder={(d) => setNewVoucher((prev) => ({ ...prev, expiryDate: d }))} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="mt-4 w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add Voucher
                    </button>
                </form>

                {/* Display Vouchers */}
                <div className="bg-white min-w-[300px] dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Existing Vouchers</h2>
                    {vouchers.length === 0 ? (
                        <p className="text-gray-600 dark:text-gray-400">No vouchers added yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {vouchers.map((voucher, index) => (
                                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div>
                                        <p className="text-lg font-medium text-gray-900 dark:text-white">{voucher.code}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {voucher.type === 'percentage' ? `${voucher.value}% off` : `$${voucher.value} off`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Max Limit: &#2547; {voucher.maxLimit || 'No limit'}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Category: {voucher.category}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteVoucher(voucher.code)}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default VouchersPage;