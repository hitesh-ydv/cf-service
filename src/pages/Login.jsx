import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    async function handleLogin(e) {
        e.preventDefault();

        try {
            await axios.post(
                "https://call-forward.onrender.com/api/login",
                { username, password },
                {
                    withCredentials: true // ✅ VERY IMPORTANT
                }
            );

            navigate("/"); // login success
        } catch (err) {
            setError("Invalid username or password");
        }
    }


    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100">
            <div className="bg-white shadow-xl rounded-lg p-8 w-full max-w-sm border">
                <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">
                    Admin Login
                </h2>

                {error && (
                    <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded mb-3">
                        {error}
                    </p>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-medium">
                            Username
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-600 mb-1 text-sm font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
