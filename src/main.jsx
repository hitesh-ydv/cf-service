// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SMSLogs from "./pages/SMSLogs";
import CallLogs from "./pages/CallLogs";
import "./App.css";
import UserDetails from "./pages/UserDetails";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/user/:userId" element={<UserDetails />} />
      <Route path="/sms/:userId" element={<SMSLogs />} />
      <Route path="/call-logs/:userId" element={<CallLogs />} />
    </Routes>
  </BrowserRouter>
);
