import React, { useEffect, useRef } from 'react';

const TestingConsole = ({ logs }) => {
    const logRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom of the console when new logs are added
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg h-60 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Testing Console</h3>
            <div ref={logRef} className="text-sm">
                {logs.map((log, index) => (
                    <pre key={index}>{log}</pre>
                ))}
            </div>
        </div>
    );
};

export default TestingConsole;
