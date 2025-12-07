import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useNotification } from "../context/NotificationContext";

export default function GlobalSocketListener({ children }) {
    const { triggerNotification } = useNotification();
    const [lastNewUser, setLastNewUser] = useState(null);

    useSocket("new_user", (user) => {
        triggerNotification(`New user added: ${user.name}`);

        setLastNewUser(user.userId);
        setTimeout(() => setLastNewUser(null), 6000);
    });

    return children;
}
