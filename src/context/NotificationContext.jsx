import { createContext, useContext, useState, useRef } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [message, setMessage] = useState(null);
    const audioRef = useRef(null);

    const triggerNotification = (text) => {
        setMessage(text);

        if (audioRef.current) {
            audioRef.current.play();
        }

        setTimeout(() => setMessage(null), 5000);
    };

    return (
        <NotificationContext.Provider value={{ triggerNotification }}>
            <audio ref={audioRef} src="/notify.mp3" preload="auto" />
            {message && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
                    {message}
                </div>
            )}

            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
