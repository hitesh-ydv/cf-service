import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UpdateNumber() {
    const [currentNumber, setCurrentNumber] = useState("");
    const [newNumber, setNewNumber] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch current number
    const fetchNumber = async () => {
        try {
            setLoading(true);
            const res = await axios.get("https://call-forward.onrender.com/get-number", { withCredentials: true });
            setCurrentNumber(res.data.phone || "Not set");
            setNewNumber(res.data.phone || "");
        } catch (err) {
            console.error(err);
            setMessage("Failed to fetch number");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNumber();
    }, []);

    // Update number handler
    const updateNumber = async () => {
        if (!newNumber.trim()) {
            return setMessage("Please enter a valid number");
        }

        try {
            setSaving(true);
            const res = await axios.post(
                "https://call-forward.onrender.com/get-number",
                { phone: newNumber },{ withCredentials: true }
            );

            setMessage("Number updated successfully!");
            setCurrentNumber(newNumber);
        } catch (err) {
            console.error(err);
            setMessage("Failed to update number.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Update Call Forwarding Number</h2>

                {loading ? (
                    <p className="text-gray-500">Loading current number...</p>
                ) : (
                    <>
                        <p className="text-gray-600 mb-2">
                            <strong>Current Number:</strong> {currentNumber}
                        </p>

                        <input
                            type="text"
                            placeholder="Enter new forwarding number"
                            className="w-full border p-2 rounded-md mb-4"
                            value={newNumber}
                            onChange={(e) => setNewNumber(e.target.value)}
                        />

                        <button
                            onClick={updateNumber}
                            disabled={saving}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md"
                        >
                            {saving ? "Updating..." : "Update Number"}
                        </button>

                        {message && (
                            <p className="mt-4 text-center text-sm text-gray-700">
                                {message}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
