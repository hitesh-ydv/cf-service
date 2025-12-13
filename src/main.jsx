import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SMSLogs from "./pages/SMSLogs";
import CallLogs from "./pages/CallLogs";
import UserDetails from "./pages/UserDetails";
import UpdateNumber from "./pages/UpdateNumber";
import "./App.css";

import { NotificationProvider } from "./context/NotificationContext";
import GlobalSocketListener from "./components/GlobalSocketListener";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";


ReactDOM.createRoot(document.getElementById("root")).render(
    <NotificationProvider>
        <GlobalSocketListener>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <PrivateRoute><Dashboard /></PrivateRoute>
                    }/>

                    <Route path="/user/:userId" element={
                        <PrivateRoute><UserDetails /></PrivateRoute>
                    }/>

                    <Route path="/sms/:userId" element={
                        <PrivateRoute><SMSLogs /></PrivateRoute>
                    }/>

                    <Route path="/call-logs/:userId" element={
                        <PrivateRoute><CallLogs /></PrivateRoute>
                    }/>

                    <Route path="/update-number" element={
                        <PrivateRoute><UpdateNumber /></PrivateRoute>
                    }/>
                </Routes>
            </BrowserRouter>
        </GlobalSocketListener>
    </NotificationProvider>
);
