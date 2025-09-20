# TodoApp Example - Array State Management and Length Subscription

Performance-optimized TodoApp example using Forma's **array length subscription** feature.

## 🔥 Key Concepts

-   **Subscribe only to array length**: Use `todos.length` to re-render only when items are added/removed
-   **Individual field subscription**: Re-render only the specific component when each todo item changes
-   **Performance optimization**: Prevent unnecessary full re-renders

## Complete Code

```tsx
import React from "react";
import { useFormaState } from "@ehfuse/forma";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

function TodoApp() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Learn Forma", completed: true },
        ],
        filter: "all" as "all" | "active" | "completed",
        newTodoText: "",
    });

    // **🔥 Key Feature: Subscribe only to array length (re-renders only when items are added/removed)**
    const todoCount = state.useValue("todos.length");

    // **Subscribe to individual fields**
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    const addTodo = () => {
        if (!newTodoText.trim()) return;

        const todos = state.getValues().todos;
        state.setValue("todos", [
            ...todos,
            { id: Date.now(), text: newTodoText, completed: false },
        ]);
        // **✅ When todos array changes, todos.length subscribers are automatically notified!**

        state.setValue("newTodoText", "");
    };

    const toggleTodo = (index: number) => {
        const todo = state.getValue(`todos.${index}`);
        state.setValue(`todos.${index}.completed`, !todo.completed);
        // **✅ Only array content changes (same length) - no notification to todos.length**
    };

    return (
        <div>
            <h2>Todo Management ({todoCount} items)</h2>

            <div>
                {/* ✅ Regular input with name attribute: handleChange available */}
                <input
                    name="newTodoText"
                    value={newTodoText}
                    onChange={state.handleChange}
                    placeholder="Enter new todo"
                />
                <button onClick={addTodo}>Add</button>
            </div>

            <div>
                {/* 🔍 Radio buttons: name exists but fixed value setting needed */}
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={filter === "all"}
                        onChange={() => state.setValue("filter", "all")}
                    />
                    All
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="active"
                        checked={filter === "active"}
                        onChange={() => state.setValue("filter", "active")}
                    />
                    Active
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="completed"
                        checked={filter === "completed"}
                        onChange={() => state.setValue("filter", "completed")}
                    />
                    Completed
                </label>
            </div>

            <TodoList state={state} filter={filter} onToggle={toggleTodo} />
        </div>
    );
}

// Performance-optimized todo list component
function TodoList({
    state,
    filter,
    onToggle,
}: {
    state: any;
    filter: "all" | "active" | "completed";
    onToggle: (index: number) => void;
}) {
    const todos = state.getValues().todos;

    return (
        <ul>
            {todos
                .filter((todo: Todo) => {
                    if (filter === "active") return !todo.completed;
                    if (filter === "completed") return todo.completed;
                    return true;
                })
                .map((todo: Todo, index: number) => (
                    <TodoItem
                        key={todo.id}
                        index={index}
                        state={state}
                        onToggle={onToggle}
                    />
                ))}
        </ul>
    );
}

// **Individual todo item component (re-renders only when this specific item changes)**
function TodoItem({
    index,
    state,
    onToggle,
}: {
    index: number;
    state: any;
    onToggle: (index: number) => void;
}) {
    // **Subscribe only to individual fields for performance optimization**
    const text = state.useValue(`todos.${index}.text`);
    const completed = state.useValue(`todos.${index}.completed`);

    return (
        <li>
            <input
                type="checkbox"
                checked={completed}
                onChange={() => onToggle(index)}
            />
            <span
                style={{
                    textDecoration: completed ? "line-through" : "none",
                }}
            >
                {text}
            </span>
        </li>
    );
}

export default TodoApp;
```

## 🎯 Performance Optimization Points

### 1. Effect of Array Length Subscription

```tsx
// ✅ Smart subscription: Counter updates only when items are added/removed
const todoCount = state.useValue("todos.length");

// ❌ Inefficient: Re-renders on every todo change
const todoCount = state.useValue("todos").length;
```

### 2. Isolated Re-rendering with Individual Item Subscription

```tsx
// ✅ TodoItem component subscribes only to its own data
const text = state.useValue(`todos.${index}.text`);
const completed = state.useValue(`todos.${index}.completed`);

// Result: Checking one todo doesn't re-render other todos!
```

### 3. Event Handling Method Selection

```tsx
// ✅ Regular input with name attribute: use handleChange
<input
    name="newTodoText"
    value={newTodoText}
    onChange={state.handleChange} // Automatically identifies field by name
/>

// ✅ Radio buttons: use setValue directly when fixed value setting is needed
<input
    type="radio"
    name="filter"
    value="active"
    checked={filter === "active"}
    onChange={() => state.setValue("filter", "active")} // Explicit value setting
/>

// 🔍 What if handleChange is used with radio?
<input
    type="radio"
    name="filter"
    value="active"
    checked={filter === "active"}
    onChange={state.handleChange} // Sets true/false instead of "active" string
/>
```

### 4. Filtering and Performance

```tsx
// ✅ TodoList re-renders only when filter changes
const filter = state.useValue("filter");

// TodoItems subscribe only to their own data regardless of filter changes
// So display/hide by filtering is separated from re-rendering
```

## 🚀 Real Performance Impact

### Before (Traditional State Management)

-   Check one todo → Re-render entire list
-   Add new todo → Re-render entire app
-   Change filter → Re-render all components

### After (Forma Individual Field Subscription)

-   Check one todo → Re-render only that TodoItem
-   Add new todo → Render only counter and new TodoItem
-   Change filter → Re-render only TodoList (TodoItems stay the same)

## 📋 Learning Points

1. **`todos.length` subscription** detects only array size changes
2. **`todos.${index}.field` pattern** for individual item subscription
3. **Component separation** minimizes re-render scope
4. **Event handling method selection**:
    - `handleChange`: Regular inputs with name attribute (text, select, etc.)
    - `setValue`: When fixed value setting is needed (radio, custom logic, etc.)
5. **Subscribe only to necessary data** principle adherence

This example demonstrates Forma's core philosophy: "Subscribe only to what you need for performance optimization" and "Choose the right event handling method for each situation".
