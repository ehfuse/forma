/**
 * WatchParentPathTest.tsx
 *
 * 부모 경로를 watch 할 때 자식 필드 변경 감지 테스트
 * 예: filters를 watch하면 filters.interval 변경 시 알림을 받는가?
 * 와일드카드 watch 테스트 포함
 */

import { useGlobalForm } from "@ehfuse/forma";

interface FilterState {
    interval: string;
    state: string;
    startDate: string;
}

interface TodoItem {
    id: number;
    title: string;
    completed: boolean;
}

interface FormData {
    filters: FilterState;
    todos: TodoItem[];
    otherField: string;
}

const initialValues: FormData = {
    filters: {
        interval: "1h",
        state: "active",
        startDate: "2025-01-01",
    },
    todos: [
        { id: 1, title: "Task 1", completed: false },
        { id: 2, title: "Task 2", completed: false },
    ],
    otherField: "test",
};

const Actions = {
    changeInterval: (context: any) => {
        console.log("\n📝 changeInterval: filters.interval을 '5m'으로 변경");
        context.setValue("filters.interval", "5m");
    },

    changeState: (context: any) => {
        console.log("\n📝 changeState: filters.state을 'inactive'로 변경");
        context.setValue("filters.state", "inactive");
    },

    changeEntireFilters: (context: any) => {
        console.log("\n📝 changeEntireFilters: filters 전체를 새 객체로 변경");
        context.setValue("filters", {
            interval: "1d",
            state: "paused",
            startDate: "2025-12-31",
        });
    },

    toggleFirstTodo: (context: any) => {
        console.log("\n📝 toggleFirstTodo: todos.0.completed 토글");
        const current = context.getValue("todos.0.completed");
        context.setValue("todos.0.completed", !current);
    },

    toggleSecondTodo: (context: any) => {
        console.log("\n📝 toggleSecondTodo: todos.1.completed 토글");
        const current = context.getValue("todos.1.completed");
        context.setValue("todos.1.completed", !current);
    },
};

function useTestForm() {
    return useGlobalForm({
        formId: "watch-parent-path-test",
        initialValues,
        actions: Actions,
        watch: {
            // 테스트 1: filters 전체를 watch (부모 경로)
            filters: (_context, value, prevValue) => {
                console.log("🔔 [WATCH filters] 트리거됨!");
                console.log("  - 이전 값:", prevValue);
                console.log("  - 새 값:", value);
            },

            // 테스트 2: filters.interval을 watch
            "filters.interval": (_context, value, prevValue) => {
                console.log("🔔 [WATCH filters.interval] 트리거됨!");
                console.log("  - 이전 값:", prevValue);
                console.log("  - 새 값:", value);
            },

            // 테스트 3: filters.state를 watch
            "filters.state": (_context, value, prevValue) => {
                console.log("🔔 [WATCH filters.state] 트리거됨!");
                console.log("  - 이전 값:", prevValue);
                console.log("  - 새 값:", value);
            },

            // 테스트 4: todos 배열 전체를 watch
            todos: (_context, value, prevValue) => {
                console.log("🔔 [WATCH todos] 트리거됨!");
                console.log("  - 이전 값:", prevValue);
                console.log("  - 새 값:", value);
            },

            // 테스트 5: 와일드카드 - 모든 todo의 completed를 watch
            "todos.*.completed": (_context, value, prevValue) => {
                console.log(
                    "🔔 [WATCH todos.*.completed] 트리거됨! (와일드카드)"
                );
                console.log("  - 이전 값:", prevValue);
                console.log("  - 새 값:", value);
            },
        },
    });
}

function DisplayComponent() {
    const form = useTestForm();

    const filters = form.useFormValue("filters");
    const interval = form.useFormValue("filters.interval");
    const state = form.useFormValue("filters.state");
    const todos = form.useFormValue("todos");

    return (
        <div
            style={{
                padding: "15px",
                background: "#f5f5f5",
                margin: "10px 0",
                borderRadius: "8px",
            }}
        >
            <h4>📊 Current Values</h4>
            <div style={{ fontFamily: "monospace", fontSize: "13px" }}>
                <p>
                    <strong>filters (전체):</strong> {JSON.stringify(filters)}
                </p>
                <p>
                    <strong>filters.interval:</strong> {interval}
                </p>
                <p>
                    <strong>filters.state:</strong> {state}
                </p>
                <div style={{ marginTop: "10px" }}>
                    <strong>todos:</strong>
                    <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
                        {todos?.map((todo: any, index: number) => (
                            <li key={index}>
                                {todo.title} -{" "}
                                {todo.completed ? "✅ 완료" : "⬜ 미완료"}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function ControlPanel() {
    const { actions } = useTestForm();

    return (
        <div
            style={{
                padding: "15px",
                background: "#e3f2fd",
                margin: "10px 0",
                borderRadius: "8px",
            }}
        >
            <h4>🎮 Controls - Filters</h4>
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "15px",
                }}
            >
                <button
                    onClick={actions.changeInterval}
                    style={{
                        padding: "10px 20px",
                        background: "#2196f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🔄 Change filters.interval
                </button>

                <button
                    onClick={actions.changeState}
                    style={{
                        padding: "10px 20px",
                        background: "#ff9800",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🔄 Change filters.state
                </button>

                <button
                    onClick={actions.changeEntireFilters}
                    style={{
                        padding: "10px 20px",
                        background: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🔄 Change entire filters
                </button>
            </div>

            <h4>🎮 Controls - Todos (와일드카드 테스트)</h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                    onClick={actions.toggleFirstTodo}
                    style={{
                        padding: "10px 20px",
                        background: "#9c27b0",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    ✓ Toggle First Todo
                </button>

                <button
                    onClick={actions.toggleSecondTodo}
                    style={{
                        padding: "10px 20px",
                        background: "#673ab7",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    ✓ Toggle Second Todo
                </button>
            </div>
        </div>
    );
}

export default function WatchParentPathTest() {
    return (
        <div style={{ padding: "20px" }}>
            <h2>🧪 Watch Parent Path & Wildcard Test</h2>
            <p>
                <strong>테스트 목적:</strong> 부모 경로를 watch 할 때 자식 필드
                변경 감지 및 와일드카드 패턴 테스트
            </p>

            <div
                style={{
                    background: "#fff3e0",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>📋 Watch 설정</h3>
                <h4>1️⃣ 일반 경로 Watch:</h4>
                <ul>
                    <li>
                        <code>filters</code> - 전체 filters 객체 watch (부모
                        경로)
                    </li>
                    <li>
                        <code>filters.interval</code> - interval 필드 watch
                    </li>
                    <li>
                        <code>filters.state</code> - state 필드 watch
                    </li>
                    <li>
                        <code>todos</code> - 전체 todos 배열 watch (부모 경로)
                    </li>
                </ul>
                <h4>2️⃣ 와일드카드 Watch:</h4>
                <ul>
                    <li>
                        <code>todos.*.completed</code> - 모든 todo의 completed
                        필드 watch
                    </li>
                </ul>
            </div>

            <DisplayComponent />
            <ControlPanel />

            <div
                style={{
                    background: "#e8f5e9",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>✅ 예상 동작</h3>

                <h4>📁 Filters 테스트:</h4>
                <h5>1. Change filters.interval 클릭 시:</h5>
                <ul>
                    <li>
                        ✅ <code>filters.interval</code> watcher 트리거
                    </li>
                    <li>
                        ✅ <code>filters</code> watcher 트리거 (부모 경로)
                    </li>
                </ul>

                <h5>2. Change filters.state 클릭 시:</h5>
                <ul>
                    <li>
                        ✅ <code>filters.state</code> watcher 트리거
                    </li>
                    <li>
                        ✅ <code>filters</code> watcher 트리거 (부모 경로)
                    </li>
                </ul>

                <h5>3. Change entire filters 클릭 시:</h5>
                <ul>
                    <li>
                        ✅ <code>filters</code> watcher 트리거
                    </li>
                    <li>
                        ✅ <code>filters.interval</code> watcher 트리거 (값
                        변경됨)
                    </li>
                    <li>
                        ✅ <code>filters.state</code> watcher 트리거 (값 변경됨)
                    </li>
                </ul>

                <h4>📋 Todos 와일드카드 테스트:</h4>
                <h5>4. Toggle First Todo 클릭 시:</h5>
                <ul>
                    <li>
                        ✅ <code>todos.*.completed</code> watcher 트리거
                        (와일드카드 매칭)
                    </li>
                    <li>
                        ✅ <code>todos</code> watcher 트리거 (부모 배열)
                    </li>
                </ul>

                <h5>5. Toggle Second Todo 클릭 시:</h5>
                <ul>
                    <li>
                        ✅ <code>todos.*.completed</code> watcher 트리거
                        (와일드카드 매칭)
                    </li>
                    <li>
                        ✅ <code>todos</code> watcher 트리거 (부모 배열)
                    </li>
                </ul>
            </div>

            <div
                style={{
                    background: "#e1f5fe",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>🎯 구현된 기능</h3>
                <ul>
                    <li>
                        <strong>부모 경로 Watch:</strong> 부모 경로를 watch하면
                        자식 필드 변경도 감지
                    </li>
                    <li>
                        <strong>정확한 이전 값:</strong> 부모 경로의 이전 값과
                        새 값을 정확하게 전달
                    </li>
                    <li>
                        <strong>와일드카드 패턴:</strong>{" "}
                        <code>todos.*.completed</code> 같은 패턴으로 동적 경로
                        매칭
                    </li>
                    <li>
                        <strong>중첩 경로:</strong> 깊이에 관계없이 모든 부모
                        경로에 알림
                    </li>
                </ul>
            </div>
        </div>
    );
}
