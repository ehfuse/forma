import React, { useState, memo } from "react";
import { useGlobalFormaState } from "../../../index";

interface UserData {
    name: string;
    email: string;
    age: number;
}

const Component1 = memo<{ addLog: (message: string) => void }>(({ addLog }) => {
    const state = useGlobalFormaState<UserData>({
        stateId: "user-data",
        initialValues: {
            name: "John Doe",
            email: "john@example.com",
            age: 25,
        },
        autoCleanup: true,
    });

    const name = state.useValue("name");
    const email = state.useValue("email");
    const age = state.useValue("age");

    return (
        <div
            style={{ border: "2px solid blue", padding: "16px", margin: "8px" }}
        >
            <h3>🔵 Component 1 (autoCleanup: true)</h3>
            <p>
                <strong>Name:</strong> {name || "N/A"}
            </p>
            <p>
                <strong>Email:</strong> {email || "N/A"}
            </p>
            <p>
                <strong>Age:</strong> {age || "N/A"}
            </p>
            <button
                onClick={() => {
                    const currentAge = age || 0;
                    const newAge = currentAge + 1;
                    state.setValue("age", newAge);
                    addLog(
                        `Component 1: Increased age from ${currentAge} to ${newAge}`
                    );
                }}
            >
                Increase Age
            </button>
        </div>
    );
});

const Component2 = memo<{ addLog: (message: string) => void }>(({ addLog }) => {
    const state = useGlobalFormaState<UserData>({
        stateId: "user-data",
        initialValues: {
            name: "John Doe",
            email: "john@example.com",
            age: 30,
        },
        autoCleanup: false,
    });

    const name = state.useValue("name");
    const email = state.useValue("email");
    const age = state.useValue("age");

    return (
        <div
            style={{
                border: "2px solid green",
                padding: "16px",
                margin: "8px",
            }}
        >
            <h3>🟢 Component 2 (autoCleanup: false)</h3>
            <p>
                <strong>Name:</strong> {name || "N/A"}
            </p>
            <p>
                <strong>Email:</strong> {email || "N/A"}
            </p>
            <p>
                <strong>Age:</strong> {age || "N/A"}
            </p>
            <button
                onClick={() => {
                    const currentAge = age || 0;
                    const newAge = currentAge + 1;
                    state.setValue("age", newAge);
                    addLog(
                        `Component 2: Increased age from ${currentAge} to ${newAge}`
                    );
                }}
            >
                Increase Age
            </button>
        </div>
    );
});

const AutoCleanupExample: React.FC = () => {
    const [showComponent1, setShowComponent1] = useState(true);
    const [showComponent2, setShowComponent2] = useState(false);
    const [manualCleanupLog, setManualCleanupLog] = useState<string[]>([]);

    const addLog = React.useCallback((message: string) => {
        setManualCleanupLog((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()}: ${message}`,
        ]);
    }, []);

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
            <h1>🧹 AutoCleanup Test Example</h1>
            <div style={{ marginBottom: "20px" }}>
                <button onClick={() => setShowComponent1(!showComponent1)}>
                    {showComponent1 ? "Hide" : "Show"} Component 1
                </button>
                <button onClick={() => setShowComponent2(!showComponent2)}>
                    {showComponent2 ? "Hide" : "Show"} Component 2
                </button>
            </div>
            <div>
                {showComponent1 && <Component1 addLog={addLog} />}
                {showComponent2 && <Component2 addLog={addLog} />}
            </div>
            {manualCleanupLog.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>📝 Activity Log</h2>
                    <div
                        style={{ backgroundColor: "#f8f9fa", padding: "16px" }}
                    >
                        {manualCleanupLog.map((log, index) => (
                            <div key={index}>{log}</div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoCleanupExample;
