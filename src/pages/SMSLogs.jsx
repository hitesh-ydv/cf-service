import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";

export default function SMSLogs() {
  const { userId } = useParams();
  const [smsList, setSmsList] = useState([]);
  const fetchedOnce = useRef(false);

  // Fetch initial SMS
  const fetchSMS = async () => {
    try {
      const res = await axios.get(
        `https://call-forward.onrender.com/sms?userId=${userId}`
      );
      setSmsList(res.data.data || []);
    } catch (err) {
      console.error("❌ Fetch SMS error:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    if (!fetchedOnce.current) {
      fetchSMS();
      fetchedOnce.current = true;
    }

    if (!socket.connected) socket.connect();

    const onConnect = () => {
      socket.emit("join-user", userId);
    };
    socket.on("connect", onConnect);

    const handleNewSMS = (sms) => {
      if (sms.userId !== userId) return;

      setSmsList((prev) => {
        if (prev.some((m) => m._id === sms._id)) return prev;
        return [sms, ...prev];
      });
    };

    socket.off("new_sms");
    socket.on("new_sms", handleNewSMS);

    return () => {
      socket.off("connect", onConnect);
      socket.off("new_sms", handleNewSMS);
    };
  }, [userId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [smsList]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-gray-100 pb-4 pt-1 z-10">
        <Link
          to="/"
          className="inline-block mb-4 text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          SMS Logs for <span className="text-blue-600">{userId}</span>
        </h1>
      </div>

      {/* Empty state */}
      {smsList.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">No SMS messages found.</p>
      ) : (
        <div className="mt-4 space-y-4 max-w-3xl mx-auto">
          {smsList.map((sms) => (
            <div
              key={sms._id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
            >
              {/* Top Info Row */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 mb-2">
                <p className="font-semibold text-gray-700 text-sm md:text-base break-all">
                  📩 {" "}
                  <span className="text-gray-900">{sms.sender}</span>
                </p>

                <p className="text-gray-400 text-xs md:text-sm">
                  {new Date(sms.receivedAt || sms.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Message Body */}
              <p className="text-gray-900 whitespace-pre-wrap text-sm md:text-base leading-relaxed">
                {sms.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
