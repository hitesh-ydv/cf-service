import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SMSLogs from "./pages/SMSLogs";
import CallLogs from "./pages/CallLogs";
import UserDetails from "./pages/UserDetails";
import "./App.css";

import { NotificationProvider } from "./context/NotificationContext";
import GlobalSocketListener from "./components/GlobalSocketListener";

ReactDOM.createRoot(document.getElementById("root")).render(
    <NotificationProvider>
        <GlobalSocketListener>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/user/:userId" element={<UserDetails />} />
                    <Route path="/sms/:userId" element={<SMSLogs />} />
                    <Route path="/call-logs/:userId" element={<CallLogs />} />
                </Routes>
            </BrowserRouter>
        </GlobalSocketListener>
    </NotificationProvider>
);
