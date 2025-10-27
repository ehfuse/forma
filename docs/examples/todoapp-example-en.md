# TodoApp Example - Array State Management and Length Subscription

Performance-optimized TodoApp example using Forma's **array length subscription** feature.

This document provides **two implementation approaches**:

1. **Basic Structure**: Traditional approach with direct state management
2. **Actions Structure**: Advanced pattern with encapsulated business logic

## 🔥 Key Concepts

-   **Subscribe only to array length**: Use `todos.length` to re-render only when items are added/removed
-   **Individual field subscription**: Re-render only the specific component when each todo item changes
-   **Performance optimization**: Prevent unnecessary full re-renders
-   **Actions pattern**: Improved logic encapsulation and reusability

---

## Method 1: Basic Structure (Direct State Management)

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

---

## Method 2: Actions Structure (Logic Encapsulation)

Using Actions allows you to manage business logic alongside state, making code cleaner and more reusable.

### Complete Code (Actions Version)

```tsx
import React from "react";
import { useFormaState } from "@ehfuse/forma";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

interface TodoState {
    todos: Todo[];
    filter: "all" | "active" | "completed";
    newTodoText: string;
}

function TodoAppWithActions() {
    const state = useFormaState<TodoState>(
        {
            todos: [
                { id: 1, text: "Learn React", completed: false },
                { id: 2, text: "Learn Forma", completed: true },
            ],
            filter: "all",
            newTodoText: "",
        },
        {
            actions: {
                // 📊 Computed Getters
                getFilteredTodos: (context) => {
                    const { todos, filter } = context.values;
                    if (filter === "active")
                        return todos.filter((t) => !t.completed);
                    if (filter === "completed")
                        return todos.filter((t) => t.completed);
                    return todos;
                },

                getCompletedCount: (context) => {
                    return context.values.todos.filter((t) => t.completed)
                        .length;
                },

                getRemainingCount: (context) => {
                    return context.values.todos.filter((t) => !t.completed)
                        .length;
                },

                // 🎯 Handlers
                addTodo: (context) => {
                    const text = context.values.newTodoText.trim();
                    if (!text) return;

                    const newTodo: Todo = {
                        id: Date.now(),
                        text,
                        completed: false,
                    };

                    context.setValue("todos", [
                        ...context.values.todos,
                        newTodo,
                    ]);
                    context.setValue("newTodoText", "");
                },

                toggleTodo: (context, id: number) => {
                    const index = context.values.todos.findIndex(
                        (t) => t.id === id
                    );
                    if (index === -1) return;

                    const todo = context.getValue(`todos.${index}`);
                    context.setValue(
                        `todos.${index}.completed`,
                        !todo.completed
                    );
                },

                removeTodo: (context, id: number) => {
                    context.setValue(
                        "todos",
                        context.values.todos.filter((t) => t.id !== id)
                    );
                },

                clearCompleted: (context) => {
                    context.setValue(
                        "todos",
                        context.values.todos.filter((t) => !t.completed)
                    );
                },

                toggleAll: (context) => {
                    const allCompleted = context.values.todos.every(
                        (t) => t.completed
                    );
                    context.setValue(
                        "todos",
                        context.values.todos.map((t) => ({
                            ...t,
                            completed: !allCompleted,
                        }))
                    );
                },

                setFilter: (
                    context,
                    filter: "all" | "active" | "completed"
                ) => {
                    context.setValue("filter", filter);
                },
            },
        }
    );

    // **🔥 Key: Subscribe only to array length**
    const todoCount = state.useValue("todos.length");
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    // Using Actions
    const filteredTodos = state.actions.getFilteredTodos();
    const completedCount = state.actions.getCompletedCount();
    const remainingCount = state.actions.getRemainingCount();

    return (
        <div>
            <h2>Todo Management ({todoCount} items)</h2>

            {/* Input area */}
            <div>
                <input
                    name="newTodoText"
                    value={newTodoText}
                    onChange={state.handleChange}
                    onKeyPress={(e) =>
                        e.key === "Enter" && state.actions.addTodo()
                    }
                    placeholder="Enter new todo"
                />
                <button onClick={state.actions.addTodo}>Add</button>
            </div>

            {/* Statistics */}
            <div>
                <span>Remaining: {remainingCount} items</span>
                <span> | Completed: {completedCount} items</span>
            </div>

            {/* Filter */}
            <div>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={filter === "all"}
                        onChange={() => state.actions.setFilter("all")}
                    />
                    All ({todoCount})
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="active"
                        checked={filter === "active"}
                        onChange={() => state.actions.setFilter("active")}
                    />
                    Active ({remainingCount})
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="completed"
                        checked={filter === "completed"}
                        onChange={() => state.actions.setFilter("completed")}
                    />
                    Completed ({completedCount})
                </label>
            </div>

            {/* Todo list */}
            <ul>
                {filteredTodos.map((todo) => (
                    <TodoItemWithActions
                        key={todo.id}
                        todo={todo}
                        onToggle={state.actions.toggleTodo}
                        onRemove={state.actions.removeTodo}
                    />
                ))}
            </ul>

            {/* Batch operations */}
            <div>
                <button onClick={state.actions.toggleAll}>Toggle All</button>
                <button onClick={state.actions.clearCompleted}>
                    Clear Completed
                </button>
            </div>
        </div>
    );
}

// Individual item component for Actions version
function TodoItemWithActions({
    todo,
    onToggle,
    onRemove,
}: {
    todo: Todo;
    onToggle: (id: number) => void;
    onRemove: (id: number) => void;
}) {
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
            />
            <span
                style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                }}
            >
                {todo.text}
            </span>
            <button onClick={() => onRemove(todo.id)}>Delete</button>
        </li>
    );
}

export default TodoAppWithActions;
```

### Advantages of Actions Version

1. **📦 Logic Encapsulation**

```tsx
// ❌ Basic structure: Logic scattered in component
const addTodo = () => {
    if (!newTodoText.trim()) return;
    const todos = state.getValues().todos;
    state.setValue("todos", [
        ...todos,
        { id: Date.now(), text: newTodoText, completed: false },
    ]);
    state.setValue("newTodoText", "");
};

// ✅ Actions structure: Logic organized in one place
state.actions.addTodo();
```

2. **🔄 Reusability**

```tsx
// Same action callable from multiple places
<button onClick={state.actions.addTodo}>Add</button>
<input onKeyPress={(e) => e.key === "Enter" && state.actions.addTodo()} />
```

3. **📊 Computed Values**

```tsx
// Manage filtering, counting logic as getters
const filteredTodos = state.actions.getFilteredTodos();
const completedCount = state.actions.getCompletedCount();
const remainingCount = state.actions.getRemainingCount();
```

4. **🧪 Testability**

```tsx
// Actions can be tested independently
test("addTodo should add new todo", () => {
    const context = createMockContext();
    actions.addTodo(context);
    expect(context.values.todos.length).toBe(1);
});
```

---

## 🎯 Comparison of Two Approaches

| Feature                   | Basic Structure          | Actions Structure                |
| ------------------------- | ------------------------ | -------------------------------- |
| **Learning Curve**        | Easy                     | Moderate                         |
| **Code Structure**        | Scattered in components  | Managed with state               |
| **Reusability**           | Low                      | High                             |
| **Testing**               | Requires component tests | Actions testable alone           |
| **Complexity Management** | Can become complex       | Stays clean                      |
| **Best For**              | Simple apps              | Medium-large apps, complex logic |

---

## 📋 Complete Learning Points

### Common (Both approaches)

1. **`todos.length` subscription** detects only array size changes
2. **`todos.${index}.field` pattern** for individual item subscription
3. **Component separation** minimizes re-render scope
4. **Event handling method selection**:
    - `handleChange`: Regular inputs with name attribute
    - `setValue`: When fixed value setting is needed

### Additional Points for Actions Structure

5. **Business logic encapsulation**: Managed in actions object
6. **Computed getters**: Provide calculated values as methods
7. **Reusable handlers**: Same action callable from multiple places
8. **Test-friendly**: Actions testable independently

---

## 🚀 When to Use Which Approach?

### Use Basic Structure

-   ✅ Quick prototyping
-   ✅ Simple CRUD apps
-   ✅ Logic is not complex
-   ✅ Team is new to Forma

### Use Actions Structure

-   ✅ Complex business logic
-   ✅ Same logic used in multiple places
-   ✅ Many computed values
-   ✅ Unit testing is important
-   ✅ Code structure and maintainability matter

This example demonstrates Forma's core philosophy: "Subscribe only to what you need for performance optimization" and "Choose the right structure for your situation".
