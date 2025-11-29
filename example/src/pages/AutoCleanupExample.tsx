import React, { useState, memo } from "react";
import { useGlobalFormaState } from "../../../index";

interface UserData {
    name: string;
    email: string;
    age: number;
}

interface FilterStatus {
    isActive: boolean;
    category: string;
}

// Component that uses autoCleanup: true
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
            <h3>🔵 Component 1 (autoCleanup: true, stateId: user-data)</h3>
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

// Component that uses autoCleanup: false (should persist forever)
const PersistentFilter = memo<{ addLog: (message: string) => void }>(
    ({ addLog }) => {
        const state = useGlobalFormaState<FilterStatus>({
            stateId: "persist_status",
            initialValues: {
                isActive: false,
                category: "all",
            },
            autoCleanup: false, // This store should NEVER be deleted
        });

        const isActive = state.useValue("isActive");
        const category = state.useValue("category");

        return (
            <div
                style={{
                    border: "2px solid green",
                    padding: "16px",
                    margin: "8px",
                }}
            >
                <h3>
                    🟢 Persistent Filter (autoCleanup: false, stateId:
                    persist_status)
                </h3>
                <p>
                    <strong>Is Active:</strong> {isActive ? "Yes" : "No"}
                </p>
                <p>
                    <strong>Category:</strong> {category}
                </p>
                <button
                    onClick={() => {
                        state.setValue("isActive", !isActive);
                        addLog(`Filter: Changed isActive to ${!isActive}`);
                    }}
                >
                    Toggle Active
                </button>
                <button
                    onClick={() => {
                        const cats = ["all", "sports", "news", "tech"];
                        const idx = cats.indexOf(category);
                        const newCat = cats[(idx + 1) % cats.length];
                        state.setValue("category", newCat);
                        addLog(`Filter: Changed category to ${newCat}`);
                    }}
                    style={{ marginLeft: "8px" }}
                >
                    Change Category
                </button>
            </div>
        );
    }
);

// Another component that also uses user-data with autoCleanup: true
const Component2 = memo<{ addLog: (message: string) => void }>(({ addLog }) => {
    const state = useGlobalFormaState<UserData>({
        stateId: "user-data",
        initialValues: {
            name: "John Doe",
            email: "john@example.com",
            age: 30,
        },
        autoCleanup: true,
    });

    const name = state.useValue("name");
    const email = state.useValue("email");
    const age = state.useValue("age");

    return (
        <div
            style={{
                border: "2px solid orange",
                padding: "16px",
                margin: "8px",
            }}
        >
            <h3>🟠 Component 2 (autoCleanup: true, stateId: user-data)</h3>
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
    const [showFilter, setShowFilter] = useState(true);
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

            <div
                style={{
                    backgroundColor: "#fffbcc",
                    padding: "16px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                }}
            >
                <h3>🧪 테스트 시나리오 (Bug Fix Test)</h3>
                <ol>
                    <li>Filter의 값을 변경 (Toggle Active, Change Category)</li>
                    <li>Filter를 Hide</li>
                    <li>
                        Component 1을 Hide (user-data store cleanup trigger)
                    </li>
                    <li>Filter를 다시 Show</li>
                    <li>
                        <strong>버그 수정 전:</strong> Filter 값이 초기화됨 ❌
                    </li>
                    <li>
                        <strong>버그 수정 후:</strong> Filter 값이 유지됨 ✅
                    </li>
                </ol>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={() => setShowComponent1(!showComponent1)}
                    style={{ marginRight: "8px" }}
                >
                    {showComponent1 ? "Hide" : "Show"} Component 1
                </button>
                <button
                    onClick={() => setShowComponent2(!showComponent2)}
                    style={{ marginRight: "8px" }}
                >
                    {showComponent2 ? "Hide" : "Show"} Component 2
                </button>
                <button
                    onClick={() => setShowFilter(!showFilter)}
                    style={{
                        backgroundColor: showFilter ? "#90EE90" : "#FFB6C1",
                    }}
                >
                    {showFilter ? "Hide" : "Show"} Persistent Filter
                </button>
            </div>
            <div>
                {showComponent1 && <Component1 addLog={addLog} />}
                {showComponent2 && <Component2 addLog={addLog} />}
                {showFilter && <PersistentFilter addLog={addLog} />}
            </div>
            {manualCleanupLog.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                    <h2>📝 Activity Log</h2>
                    <button
                        onClick={() => setManualCleanupLog([])}
                        style={{ marginBottom: "8px" }}
                    >
                        Clear Log
                    </button>
                    <div
                        style={{
                            backgroundColor: "#f8f9fa",
                            padding: "16px",
                            maxHeight: "200px",
                            overflow: "auto",
                        }}
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
