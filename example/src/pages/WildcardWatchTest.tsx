import { useEffect } from "react";
import { useForm } from "@ehfuse/forma";
import { Box, Button, Typography, Paper, Chip } from "@mui/material";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

interface TodoState {
    todos: Todo[];
    completedCount: number;
    lastCompletedId: number | null;
    watchLog: string[];
}

// TodoItem 컴포넌트 - 개별 구독으로 성능 최적화
function TodoItem({
    useFormValue,
    index,
    onToggle,
}: {
    useFormValue: (path: string) => any;
    index: number;
    onToggle: (index: number) => void;
}) {
    console.log(`🟡 TodoItem ${index} mounting/rendering`);

    // 개별 항목만 구독
    const todo = useFormValue(`todos.${index}`) as Todo;

    console.log(`🔵 TodoItem ${index} render:`, {
        todo,
        completed: todo?.completed,
    });

    if (!todo) return null;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                borderBottom: "1px solid #eee",
            }}
        >
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(index)}
            />
            <Typography
                sx={{
                    textDecoration: todo.completed ? "line-through" : "none",
                    color: todo.completed ? "#999" : "inherit",
                }}
            >
                {todo.text}
            </Typography>
            <Chip
                label={`todos.${index}.completed`}
                size="small"
                sx={{ ml: "auto" }}
            />
        </Box>
    );
}

export default function WildcardWatchTest() {
    const form = useForm<TodoState>({
        initialValues: {
            todos: [
                { id: 1, text: "Learn React", completed: false },
                { id: 2, text: "Learn Forma", completed: false },
                { id: 3, text: "Build App", completed: false },
            ],
            completedCount: 0,
            lastCompletedId: null,
            watchLog: [],
        },
        watch: {
            // 🔥 와일드카드 패턴: todos 배열의 모든 항목의 completed 필드 감시
            "todos.*.completed": (ctx, value, prevValue) => {
                console.log(`🌟 Wildcard Watch: todos.*.completed changed`, {
                    value,
                    prevValue,
                });

                // 완료된 항목 개수 계산
                const todos = ctx.getValue("todos") as Todo[];
                const completed = todos.filter((t: Todo) => t.completed).length;
                ctx.setValue("completedCount", completed);

                // 로그 추가
                const logs = ctx.getValue("watchLog") as string[];
                ctx.setValue("watchLog", [
                    ...logs,
                    `[${new Date().toLocaleTimeString()}] todos.*.completed changed: ${prevValue} → ${value}`,
                ]);
            },

            // 일반 watch: todos 배열 전체 감시
            todos: (ctx, value: Todo[], prevValue) => {
                console.log(`📝 Normal Watch: todos changed`, {
                    value,
                    prevValue,
                });

                const logs = ctx.getValue("watchLog") as string[];
                ctx.setValue("watchLog", [
                    ...logs,
                    `[${new Date().toLocaleTimeString()}] todos array changed (length: ${
                        value.length
                    })`,
                ]);
            },
        },
    });

    // 초기 로그 클리어
    useEffect(() => {
        form.setFormValue("watchLog", [
            "🚀 Watch Test Started - Toggle checkboxes to see wildcard pattern in action!",
        ]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 마운트 시 한 번만 실행

    const completedCount = form.useFormValue("completedCount");
    const watchLog = form.useFormValue("watchLog");
    const todosLength = form.useFormValue("todos.length");

    const toggleTodo = (index: number) => {
        const todo = form.getFormValue(`todos.${index}`) as Todo;
        console.log("🔄 Toggle todo:", {
            index,
            todo,
            currentCompleted: todo?.completed,
        });
        if (todo) {
            const newValue = !todo.completed;
            console.log("🔄 Setting new value:", {
                path: `todos.${index}.completed`,
                newValue,
            });
            form.setFormValue(`todos.${index}.completed`, newValue);

            // 강제 새로고침 테스트
            const updated = form.getFormValue(`todos.${index}`) as Todo;
            console.log("✅ After set:", updated);
        }
    };

    const addTodo = () => {
        const todos = form.getFormValue("todos") as Todo[];
        const newTodo: Todo = {
            id: Date.now(),
            text: `New Todo #${todos.length + 1}`,
            completed: false,
        };
        form.setFormValue("todos", [...todos, newTodo]);
    };

    const clearLog = () => {
        form.setFormValue("watchLog", []);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                🌟 Wildcard Watch Pattern Test
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                와일드카드 패턴 <code>"todos.*.completed"</code>를 사용하여
                배열의 모든 항목의 특정 필드 변경을 감시합니다.
            </Typography>

            <Paper sx={{ p: 2, mt: 3, mb: 3, bgcolor: "#f5f5f5" }}>
                <Typography variant="h6" gutterBottom>
                    📊 Statistics
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Chip label={`Total: ${todosLength}`} color="primary" />
                    <Chip
                        label={`Completed: ${completedCount}`}
                        color="success"
                    />
                    <Chip
                        label={`Active: ${todosLength - completedCount}`}
                        color="warning"
                    />
                </Box>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    ✅ Todo List
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    체크박스를 토글하면 <code>"todos.*.completed"</code> watch가
                    실행됩니다
                </Typography>

                {Array.from({ length: todosLength }, (_, index) => (
                    <TodoItem
                        key={index}
                        useFormValue={form.useFormValue}
                        index={index}
                        onToggle={toggleTodo}
                    />
                ))}

                <Button
                    variant="outlined"
                    onClick={addTodo}
                    sx={{ mt: 2 }}
                    fullWidth
                >
                    + Add Todo
                </Button>
            </Paper>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6">📜 Watch Log</Typography>
                    <Button size="small" onClick={clearLog}>
                        Clear Log
                    </Button>
                </Box>
                <Box
                    sx={{
                        bgcolor: "#1e1e1e",
                        color: "#d4d4d4",
                        p: 2,
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: 12,
                        maxHeight: 300,
                        overflow: "auto",
                    }}
                >
                    {watchLog.map((log: string, idx: number) => (
                        <div key={idx}>{log}</div>
                    ))}
                    {watchLog.length === 0 && (
                        <div style={{ color: "#888" }}>
                            No logs yet. Toggle some checkboxes!
                        </div>
                    )}
                </Box>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: "#e3f2fd" }}>
                <Typography variant="h6" gutterBottom>
                    💡 How it works
                </Typography>
                <Typography variant="body2" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li>
                            <code>"todos.*.completed"</code> 패턴은{" "}
                            <code>todos.0.completed</code>,{" "}
                            <code>todos.1.completed</code> 등 모든 인덱스와
                            매칭됩니다
                        </li>
                        <li>
                            체크박스를 토글하면 해당 항목의{" "}
                            <code>completed</code> 필드만 변경됩니다
                        </li>
                        <li>
                            와일드카드 watch가 트리거되어 자동으로{" "}
                            <code>completedCount</code>를 업데이트합니다
                        </li>
                        <li>
                            <code>todos</code> watch는 배열 전체가 변경될 때만
                            실행됩니다 (항목 추가/삭제)
                        </li>
                    </ul>
                </Typography>
            </Paper>
        </Box>
    );
}
