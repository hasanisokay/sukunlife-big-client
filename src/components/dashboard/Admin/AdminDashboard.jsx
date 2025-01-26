const AdminDashboard = () => {

    return (
        <div className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Main Content */}
            <main className="w-full p-6">
                <h2 className="text-xl font-bold mb-4">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <h3 className="text-lg font-semibold">Total Users</h3>
                        <p className="text-2xl font-bold">1,024</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <h3 className="text-lg font-semibold">Active Courses</h3>
                        <p className="text-2xl font-bold">12</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
                        <p className="text-2xl font-bold">8</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <p className="text-gray-600 dark:text-gray-400">No recent activity to display.</p>
                    </div>
                </div>
            </main>
            <h1 className="h-[1000000px]">h</h1>
        </div>
    );
};

export default AdminDashboard;
