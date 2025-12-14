import { useEffect } from "react";
import { useFormaState } from "@ehfuse/forma";
import { Box, Button, Typography, Paper, Divider, Chip } from "@mui/material";

interface TodoState {
    todos: Array<{ id: number; text: string; completed: boolean }>;
    filter: "all" | "active" | "completed";
}

/**
 * useFormaState의 actions 기능 테스트
 */
export default function FormaStateActionsTest() {
    const state = useFormaState<TodoState>(
        {
            todos: [
                { id: 1, text: "Learn React", completed: false },
                { id: 2, text: "Learn Forma", completed: true },
                { id: 3, text: "Build awesome app", completed: false },
            ],
            filter: "all",
        },
        {
            actions: {
                // Computed getter - 필터링된 todos
                getFilteredTodos: (context) => {
                    const { todos, filter } = context.values;
                    if (filter === "active") {
                        return todos.filter((t) => !t.completed);
                    }
                    if (filter === "completed") {
                        return todos.filter((t) => t.completed);
                    }
                    return todos;
                },

                // Computed getter - 완료된 개수
                getCompletedCount: (context) => {
                    return context.values.todos.filter((t) => t.completed)
                        .length;
                },

                // Computed getter - 남은 개수
                getRemainingCount: (context) => {
                    return context.values.todos.filter((t) => !t.completed)
                        .length;
                },

                // Handler - todo 추가
                addTodo: (context, text: string) => {
                    const newId =
                        Math.max(0, ...context.values.todos.map((t) => t.id)) +
                        1;
                    const newTodos = [
                        ...context.values.todos,
                        { id: newId, text, completed: false },
                    ];
                    context.setValue("todos", newTodos);
                },

                // Handler - todo 토글
                toggleTodo: (context, id: number) => {
                    const todos = context.values.todos.map((todo) =>
                        todo.id === id
                            ? { ...todo, completed: !todo.completed }
                            : todo
                    );
                    context.setValue("todos", todos);
                },

                // Handler - todo 삭제
                removeTodo: (context, id: number) => {
                    const filtered = context.values.todos.filter(
                        (t) => t.id !== id
                    );
                    context.setValue("todos", filtered);
                },

                // Handler - 완료된 항목 모두 삭제
                clearCompleted: (context) => {
                    const remaining = context.values.todos.filter(
                        (t) => !t.completed
                    );
                    context.setValue("todos", remaining);
                },

                // Handler - 모두 완료 토글
                toggleAll: (context) => {
                    const allCompleted = context.values.todos.every(
                        (t) => t.completed
                    );
                    const todos = context.values.todos.map((t) => ({
                        ...t,
                        completed: !allCompleted,
                    }));
                    context.setValue("todos", todos);
                },

                // Handler - 필터 변경
                setFilter: (
                    context,
                    filter: "all" | "active" | "completed"
                ) => {
                    context.setValue("filter", filter);
                },
            },
        }
    );

    const todos = state.useValue("todos");
    const filter = state.useValue("filter");

    // actions 테스트를 위한 로깅
    useEffect(() => {
        console.log("🔍 FormaState Current State:", {
            todos,
            filter,
            filteredTodos: state.actions.getFilteredTodos(),
            completedCount: state.actions.getCompletedCount(),
            remainingCount: state.actions.getRemainingCount(),
        });
    }, [todos, filter]);

    const filteredTodos = state.actions.getFilteredTodos();

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                FormaState Actions Test
            </Typography>
            <Typography variant="body1" gutterBottom>
                useFormaState의 actions 기능을 테스트합니다. 일반 상태
                관리에서도 actions를 사용할 수 있습니다.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Stats */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: "success.50" }}>
                <Typography variant="h6" gutterBottom>
                    📊 Stats (Computed Values)
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Chip
                        label={`Total: ${todos.length}`}
                        color="primary"
                        variant="outlined"
                    />
                    <Chip
                        label={`Remaining: ${state.actions.getRemainingCount()}`}
                        color="warning"
                        variant="outlined"
                    />
                    <Chip
                        label={`Completed: ${state.actions.getCompletedCount()}`}
                        color="success"
                        variant="outlined"
                    />
                </Box>
            </Paper>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    🎯 Filters
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    {(["all", "active", "completed"] as const).map((f) => (
                        <Button
                            key={f}
                            variant={filter === f ? "contained" : "outlined"}
                            onClick={() => state.actions.setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Button>
                    ))}
                </Box>
            </Paper>

            {/* Todos List */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    📝 Todos
                </Typography>

                {filteredTodos.length === 0 ? (
                    <Typography color="text.secondary">
                        {filter === "all"
                            ? "No todos yet"
                            : `No ${filter} todos`}
                    </Typography>
                ) : (
                    filteredTodos.map(
                        (todo: {
                            id: number;
                            text: string;
                            completed: boolean;
                        }) => (
                            <Box
                                key={todo.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                    p: 1,
                                    bgcolor: todo.completed
                                        ? "grey.200"
                                        : "grey.100",
                                    borderRadius: 1,
                                    textDecoration: todo.completed
                                        ? "line-through"
                                        : "none",
                                }}
                            >
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: todo.completed
                                            ? "text.secondary"
                                            : "text.primary",
                                    }}
                                >
                                    {todo.text}
                                </Typography>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() =>
                                            state.actions.toggleTodo(todo.id)
                                        }
                                    >
                                        {todo.completed ? "Undo" : "Done"}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() =>
                                            state.actions.removeTodo(todo.id)
                                        }
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            </Box>
                        )
                    )
                )}
            </Paper>

            {/* Actions */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    🎬 Actions (Handlers)
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() =>
                                state.actions.addTodo(
                                    `New Task ${Date.now()
                                        .toString()
                                        .slice(-4)}`
                                )
                            }
                        >
                            Add Random Todo
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => state.actions.toggleAll()}
                        >
                            Toggle All
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => state.actions.clearCompleted()}
                            disabled={state.actions.getCompletedCount() === 0}
                        >
                            Clear Completed
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Console Log Instruction */}
            <Paper sx={{ p: 2, bgcolor: "info.50" }}>
                <Typography variant="body2" color="info.main">
                    💡 브라우저 콘솔을 열어서 state 변경 로그를 확인하세요!
                </Typography>
            </Paper>
        </Box>
    );
}
