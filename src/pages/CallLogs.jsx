// src/pages/CallLogs.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";

export default function CallLogs() {
  const { userId } = useParams();
  const [callLogs, setCallLogs] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [isForwardingOn, setIsForwardingOn] = useState(false);
  const [filter, setFilter] = useState("ALL"); // NEW filter

  const fetchCalls = async () => {
    try {
      const res = await axios.get(
        `https://call-forward.onrender.com/call-logs?userId=${userId}`
      );
      setCallLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCalls();
    socket.emit("join-user", userId);

    socket.on("new_call_log", (log) => {
      if (log.userId === userId) {
        setCallLogs((prev) => [log, ...prev]);
      }
    });

    socket.on("forwarding_status", (data) => {
      if (data.userId === userId) {
        setStatusMsg(data.message);

        if (data.message.includes("SUCCESS")) {
          if (data.message.includes("##21#")) setIsForwardingOn(false);
          else if (data.message.includes("*21*")) setIsForwardingOn(true);
        }
      }
    });

    return () => {
      socket.off("new_call_log");
      socket.off("forwarding_status");
    };
  }, [userId]);

  const toggleForwarding = () => {
    const action = !isForwardingOn ? "ENABLE" : "DISABLE";

    socket.emit("forwarding_control", {
      userId,
      action,
      number: "+911234567890",
    });

    setIsForwardingOn(!isForwardingOn);
  };

  const typeColors = {
    INCOMING: "bg-green-100 text-green-700",
    OUTGOING: "bg-blue-100 text-blue-700",
    MISSED: "bg-red-100 text-red-700",
  };

  const typeIcons = {
    INCOMING: "📥",
    OUTGOING: "📤",
    MISSED: "⛔",
  };

  // FILTER LOGIC
  const filteredLogs =
    filter === "ALL"
      ? callLogs
      : callLogs.filter((c) => c.type === filter);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">

      {/* Sticky Header */}
      <div className="sticky top-0 bg-gray-100 pb-4 pt-1 z-20 shadow-sm">

        <Link
          to={`/user/${userId}`}
          className="inline-block mb-4 text-blue-600 font-medium hover:underline"
        >
          ← Back to User Details
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            📞 Call Logs  
            <span className="text-blue-600">({userId})</span>
          </h1>

          {/* Call Forwarding Toggle */}
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
            <span className="text-gray-700 font-semibold">Forwarding:</span>

            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isForwardingOn}
                  onChange={toggleForwarding}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full transition-all duration-300 ${
                    isForwardingOn ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <div
                  className={`absolute w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${
                    isForwardingOn ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </div>
            </label>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {["ALL", "INCOMING", "OUTGOING", "MISSED"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm transition ${
                filter === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Status Banner */}
      {statusMsg && (
        <p className="mt-3 mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-600 text-yellow-800 rounded shadow-sm">
          {statusMsg}
        </p>
      )}

      {/* Empty State */}
      {filteredLogs.length === 0 ? (
        <div className="text-center mt-14 text-gray-500">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-lg font-medium">No call logs found</p>
          <p className="text-sm text-gray-400">Try changing your filter above.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4 max-w-3xl mx-auto">

          {filteredLogs
            .sort((a, b) => b.date - a.date)
            .map((call, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-all"
              >
                {/* Top Row */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcons[call.type]}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[call.type]}`}
                    >
                      {call.type}
                    </span>
                  </div>

                  <p className="text-gray-400 text-xs md:text-sm">
                    {new Date(call.date).toLocaleString()}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-500 font-semibold text-sm">Device Phone:</p>
                    <p className="text-gray-900 text-sm md:text-base">
                      {call.phone || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-semibold text-sm">Number:</p>
                    <p className="text-gray-900 text-sm md:text-base">
                      {call.number}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-semibold text-sm">Duration:</p>
                    <p className="text-gray-900 text-sm md:text-base">
                      {call.duration || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
