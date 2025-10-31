# TodoApp Example - Complete Watch + Actions Guide

A practical example implementing perfect state management without useEffect using Forma's **Watch + Actions** combination.

## 📑 Table of Contents

1. [🎯 Key Points](#-key-points)
2. [📁 File Structure](#-file-structure)
3. [🎯 Complete Implementation](#-complete-implementation)
    - [todoActions.ts - Business Logic](#1-todoactionsts---business-logic)
    - [todoWatch.ts - Side Effects](#2-todowatchts---side-effects)
    - [TodoApp.tsx - UI Component](#3-todoapptsx---ui-component)
4. [🎉 Benefits of This Pattern](#-benefits-of-this-pattern)
5. [📚 Implementation Methods](#-implementation-methods)
    - [Method 1: Basic Structure (Direct State Management)](#method-1-basic-structure-direct-state-management)
    - [Method 2: Actions Structure (Business Logic Encapsulation)](#method-2-actions-structure-business-logic-encapsulation)
6. [🔍 Comparing Two Approaches](#-comparing-two-approaches)
7. [💡 Additional Benefits of Actions Pattern](#-additional-benefits-of-actions-pattern)
8. [🎯 Comparison Table](#-comparison-table-1)
9. [🚀 When to Use Which Approach?](#-when-to-use-which-approach)
10. [🎯 Advanced Pattern: Dependency Injection via Currying](#-advanced-pattern-dependency-injection-via-currying)
    - [When to Use?](#when-to-use)
    - [Example: Auth Actions with API Dependencies](#example-auth-actions-with-api-dependencies)
    - [Benefits of Currying Pattern](#benefits-of-currying-pattern)
    - [Plain Object vs Currying Pattern](#plain-object-vs-currying-pattern)
    - [When to Use Currying Pattern?](#when-to-use-currying-pattern)

---

## 🎯 Key Points

-   ✅ **Eliminate useEffect**: Watch handles all side effects
-   ✅ **Actions Pattern**: Encapsulate business logic
-   ✅ **Surgical Re-rendering**: Optimize with individual field subscriptions
-   ✅ **Modularization**: Separate logic into dedicated files
-   ✅ **Auto-save**: Automated localStorage synchronization

---

## 📁 File Structure

```
src/
  todo/
    ├── todoActions.ts    # Business logic (pure functions)
    ├── todoWatch.ts      # Side effects (replaces useEffect)
    └── TodoApp.tsx       # UI component
```

---

## 🎯 Complete Implementation

### 1. todoActions.ts - Business Logic

```tsx
// 🎯 Separate business logic into dedicated file
export const todoActions = {
    addTodo: (ctx, text: string) => {
        if (!text.trim()) return;

        const todos = ctx.values.todos;
        ctx.setValue("todos", [
            ...todos,
            { id: Date.now(), text, completed: false },
        ]);
        ctx.setValue("newTodoText", "");
    },

    toggleTodo: (ctx, id: number) => {
        const todos = ctx.values.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        ctx.setValue("todos", todos);
    },

    deleteTodo: (ctx, id: number) => {
        const todos = ctx.values.todos.filter((t) => t.id !== id);
        ctx.setValue("todos", todos);
    },

    clearCompleted: (ctx) => {
        const todos = ctx.values.todos.filter((t) => !t.completed);
        ctx.setValue("todos", todos);
    },

    saveToStorage: (ctx) => {
        localStorage.setItem("todos", JSON.stringify(ctx.values.todos));
    },

    loadFromStorage: (ctx) => {
        const saved = localStorage.getItem("todos");
        if (saved) {
            ctx.setValue("todos", JSON.parse(saved));
        }
    },
};
```

### 2. todoWatch.ts - Side Effects

```tsx
// 👀 Separate side effects into dedicated file (replaces useEffect!)
export const todoWatch = {
    // Auto-save when todos change
    todos: (ctx, value) => {
        ctx.actions.saveToStorage(ctx);
        ctx.setValue("lastSync", new Date().toISOString());
        console.log(`✅ Saved ${value.length} todos`);
    },

    // Log when filter changes
    filter: (ctx, value, prevValue) => {
        console.log(`Filter changed: ${prevValue} → ${value}`);
    },

    // Track completed items count (wildcard pattern!)
    "todos.*.completed": (ctx) => {
        const completed = ctx.values.todos.filter((t) => t.completed).length;
        ctx.setValue("completedCount", completed);
    },
};
```

### 3. TodoApp.tsx - UI Component

```tsx
import React, { useEffect } from "react";
import { useFormaState } from "@ehfuse/forma";
import { todoActions } from "./todoActions";
import { todoWatch } from "./todoWatch";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

function TodoApp() {
    const state = useFormaState(
        {
            todos: [] as Todo[],
            filter: "all" as "all" | "active" | "completed",
            newTodoText: "",
            lastSync: null as string | null,
            completedCount: 0,
        },
        {
            actions: todoActions,
            watch: todoWatch, // 🔥 Activate Watch system
        }
    );

    // Only use useEffect for initial load (runs once)
    useEffect(() => {
        state.actions.loadFromStorage(state);
    }, []);

    // ✅ Subscribe to individual fields (surgical re-rendering)
    const todoCount = state.useValue("todos.length");
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");
    const lastSync = state.useValue("lastSync");
    const completedCount = state.useValue("completedCount");

    // Filtered todos (computation in component)
    const filteredTodos = state.getValues().todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    return (
        <div>
            <h2>Todo List ({todoCount} items)</h2>
            <p>
                Completed: {completedCount} | Last saved: {lastSync}
            </p>

            <div>
                <input
                    value={newTodoText}
                    onChange={(e) =>
                        state.setValue("newTodoText", e.target.value)
                    }
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            state.actions.addTodo(state, newTodoText);
                        }
                    }}
                    placeholder="Enter new todo"
                />
                <button
                    onClick={() => state.actions.addTodo(state, newTodoText)}
                >
                    Add
                </button>
            </div>

            <div>
                <button onClick={() => state.setValue("filter", "all")}>
                    All
                </button>
                <button onClick={() => state.setValue("filter", "active")}>
                    Active
                </button>
                <button onClick={() => state.setValue("filter", "completed")}>
                    Completed
                </button>
                <button onClick={() => state.actions.clearCompleted(state)}>
                    Clear Completed
                </button>
            </div>

            <ul>
                {filteredTodos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={() =>
                            state.actions.toggleTodo(state, todo.id)
                        }
                        onDelete={() =>
                            state.actions.deleteTodo(state, todo.id)
                        }
                    />
                ))}
            </ul>
        </div>
    );
}

// Individual todo item component
function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={onToggle}
            />
            <span
                style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                }}
            >
                {todo.text}
            </span>
            <button onClick={onDelete}>Delete</button>
        </li>
    );
}

export default TodoApp;
```

### 🎉 Benefits of This Pattern

**1. Eliminate useEffect**

```tsx
// ❌ Before: useEffect hell
useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);

useEffect(() => {
    const completed = todos.filter(t => t.completed).length;
    setCompletedCount(completed);
}, [todos]);

// ✅ After: Declarative Watch
watch: {
    "todos": (ctx, value) => {
        ctx.actions.saveToStorage(ctx);
    },
    "todos.*.completed": (ctx) => {
        const completed = ctx.values.todos.filter(t => t.completed).length;
        ctx.setValue("completedCount", completed);
    }
}
```

**2. Perfect Modularization**

-   ✅ `todoActions.ts`: Business logic (pure functions, testable)
-   ✅ `todoWatch.ts`: Side effects (declarative, clear intent)
-   ✅ `TodoApp.tsx`: UI only (clean code)

**3. Reusability**

-   ✅ Actions/watch can be reused in other projects
-   ✅ Independently testable
-   ✅ Team members know exactly where logic lives

**4. Performance**

-   ✅ Individual field subscriptions eliminate unnecessary re-renders
-   ✅ `todos.length` subscription updates count only on length changes
-   ✅ Watch executes only when values actually change

---

## 📚 Implementation Methods

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

    // **🔥 Key: Subscribe to array length only (re-render only on add/remove)**
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
        // **✅ When todos array changes, todos.length subscribers are notified!**

        state.setValue("newTodoText", "");
    };

    const toggleTodo = (index: number) => {
        const todo = state.getValue(`todos.${index}`);
        state.setValue(`todos.${index}.completed`, !todo.completed);
        // **✅ Only array content changes (same length) - todos.length not notified**
    };

    return (
        <div>
            <h2>Todo Management ({todoCount} items)</h2>

            <div>
                {/* ✅ Standard input with name attribute: can use handleChange */}
                <input
                    name="newTodoText"
                    value={newTodoText}
                    onChange={state.handleChange}
                    placeholder="Enter new todo"
                />
                <button onClick={addTodo}>Add</button>
            </div>

            <div>
                {/* 🔍 Radio buttons: has name but needs explicit value setting */}
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
    // ✅ Subscribe to array length only - re-render only on add/remove
    const todosLength = state.useValue("todos.length");

    return (
        <ul>
            {Array.from({ length: todosLength }, (_, index) => {
                const todo = state.getValue(`todos.${index}`);

                // Filter check
                if (filter === "active" && todo.completed) return null;
                if (filter === "completed" && !todo.completed) return null;

                return (
                    <TodoItem
                        key={todo.id}
                        index={index}
                        state={state}
                        onToggle={onToggle}
                    />
                );
            })}
        </ul>
    );
}

// **Individual todo item component (re-renders only when its own data changes)**
function TodoItem({
    index,
    state,
    onToggle,
}: {
    index: number;
    state: any;
    onToggle: (index: number) => void;
}) {
    // **Subscribe to individual fields for performance optimization**
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

### 1. Array Length Subscription Effect

```tsx
// ✅ Smart subscription: update counter only on add/remove
const todoCount = state.useValue("todos.length");

// ❌ Inefficient: re-render on every todo change
const todoCount = state.useValue("todos").length;
```

### 2. Isolated Re-rendering with Individual Item Subscription

```tsx
// ✅ TodoItem component subscribes only to its own data
const text = state.useValue(`todos.${index}.text`);
const completed = state.useValue(`todos.${index}.completed`);

// Result: Checking one todo doesn't re-render other todos!
```

### 3. Choosing Event Handling Approach

```tsx
// ✅ Standard input with name attribute: use handleChange
<input
    name="newTodoText"
    value={newTodoText}
    onChange={state.handleChange} // Automatically identifies field by name
/>

// ✅ Radio button: use setValue directly when explicit value setting needed
<input
    type="radio"
    name="filter"
    value="active"
    checked={filter === "active"}
    onChange={() => state.setValue("filter", "active")} // Explicit value setting
/>

// 🔍 What if using handleChange on radio?
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
// ✅ TodoList re-renders only on filter change
const filter = state.useValue("filter");

// TodoItems subscribe only to their own data regardless of filter changes
// Display/hide by filtering is separated from re-rendering
```

## 🚀 Actual Performance Impact

### Before (Traditional State Management)

-   Check one todo → entire list re-renders
-   Add new todo → entire app re-renders
-   Change filter → all components re-render

### After (Forma Individual Field Subscription)

-   Check one todo → only that TodoItem re-renders
-   Add new todo → only counter and new TodoItem render
-   Change filter → only TodoList re-renders (TodoItems remain unchanged)

## 📋 Learning Points

1. **`todos.length` subscription** detects only array size changes
2. **`todos.${index}.field` pattern** for individual item subscription
3. **Component separation** minimizes re-rendering scope
4. **Event handling approach selection**:
    - `handleChange`: standard inputs with name attribute (text, select, etc.)
    - `setValue`: when explicit value setting needed (radio, custom logic, etc.)
5. **Subscribe only to needed data** principle

---

## Method 2: Actions Structure (Logic Encapsulation)

Using Actions makes business logic manageable alongside state, resulting in cleaner and more reusable code.

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

    // **🔥 Key: Subscribe to array length only**
    const todoCount = state.useValue("todos.length");
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    // Use Actions
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
                <span>Remaining: {remainingCount}</span>
                <span> | Completed: {completedCount}</span>
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

// Actions version individual item component
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

### Benefits of Actions Version

1. **📦 Logic Encapsulation**

```tsx
// ❌ Basic structure: logic scattered in component
const addTodo = () => {
    if (!newTodoText.trim()) return;
    const todos = state.getValues().todos;
    state.setValue("todos", [
        ...todos,
        { id: Date.now(), text: newTodoText, completed: false },
    ]);
    state.setValue("newTodoText", "");
};

// ✅ Actions structure: logic organized in one place
state.actions.addTodo();
```

2. **🔄 Reusability**

```tsx
// Same action can be called from multiple places
<button onClick={state.actions.addTodo}>Add</button>
<input onKeyPress={(e) => e.key === "Enter" && state.actions.addTodo()} />
```

3. **📊 Computed Values**

```tsx
// Manage filtering, counting, etc. logic as getters
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

## 🔍 Comparing Two Approaches

| Feature            | Basic Structure         | Actions Structure                |
| ------------------ | ----------------------- | -------------------------------- |
| **Learning Curve** | Easy                    | Medium                           |
| **Code Structure** | Scattered in component  | Managed with state               |
| **Reusability**    | Low                     | High                             |
| **Testing**        | Requires component test | Actions testable alone           |
| **Complexity**     | Can become complex      | Stays clean                      |
| **Best For**       | Simple apps             | Medium-large apps, complex logic |

---

## 💡 Additional Benefits of Actions Pattern

1. **📦 Logic Encapsulation**

```tsx
// ❌ Scattered logic: hard to find and modify
const addTodo = () => {
    /* logic */
};
const toggleTodo = () => {
    /* logic */
};
const clearCompleted = () => {
    /* logic */
};

// ✅ Actions structure: all logic in one place
state.actions.addTodo();
```

2. **🔄 Reusability**

```tsx
// Same action callable from multiple places
<button onClick={state.actions.addTodo}>Add</button>
<input onKeyPress={(e) => e.key === "Enter" && state.actions.addTodo()} />
```

3. **📊 Computed Values (Computed Values)**

```tsx
// Manage filtering, counting, etc. logic as methods
const filteredTodos = state.actions.getFilteredTodos();
const completedCount = state.actions.getCompletedCount();
const remainingCount = state.actions.getRemainingCount();
```

4. **🧪 Testability**

```tsx
// Actions independently testable
test("addTodo should add new todo", () => {
    const context = createMockContext();
    actions.addTodo(context);
    expect(context.values.todos.length).toBe(1);
});
```

---

## 🎯 Comparison Table

| Feature            | Basic Structure         | Actions Structure                |
| ------------------ | ----------------------- | -------------------------------- |
| **Learning Curve** | Easy                    | Medium                           |
| **Code Structure** | Scattered in component  | Managed with state               |
| **Reusability**    | Low                     | High                             |
| **Testing**        | Requires component test | Actions testable alone           |
| **Complexity**     | Can become complex      | Stays clean                      |
| **Best For**       | Simple apps             | Medium-large apps, complex logic |

---

## 📋 Overall Learning Points

### Common (Both Approaches)

1. **`todos.length` subscription** detects only array size changes
2. **`todos.${index}.field` pattern** for individual item subscription
3. **Component separation** minimizes re-rendering scope
4. **Event handling approach selection**:
    - `handleChange`: standard inputs with name attribute
    - `setValue`: when explicit value setting needed

### Additional Points for Actions Structure

5. **Business logic encapsulation**: managed in actions object
6. **Computed getters**: provide calculated values as methods
7. **Reusable handlers**: call same action from multiple places
8. **Test-friendly**: test Actions independently

---

## 🚀 When to Use Which Approach?

### Use Basic Structure

-   ✅ Quick prototyping
-   ✅ Simple CRUD apps
-   ✅ Logic not complex
-   ✅ Team first adopting Forma

### Use Actions Structure

-   ✅ Complex business logic
-   ✅ Same logic used in multiple places
-   ✅ Many computed values
-   ✅ Unit testing important
-   ✅ Code structure and maintainability important

---

## 🎯 Advanced Pattern: Dependency Injection via Currying

You can use **currying pattern** to make Actions more flexible. This approach is useful when injecting external APIs, dialog handlers, configuration values, etc. into Actions.

### When to Use?

-   ✅ Need to inject API functions into Actions
-   ✅ Multiple components using same Actions with different configurations
-   ✅ Need to pass external handlers (dialogs, toasts, etc.) to Actions
-   ✅ Want to easily inject mock data in tests

### Example: Auth Actions with API Dependencies

#### 1. Actions Definition (Currying Style)

```tsx
// authActions.ts
import { ActionContext } from "@ehfuse/forma";

interface LoginState {
    username: string;
    password: string;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
}

// 🔥 Currying pattern: receive API and callbacks first, ActionContext later
export const AuthActions = {
    // Currying function receiving API function
    checkLoginStatus:
        (checkLoginStatusAPI: () => Promise<{ isLoggedIn: boolean }>) =>
        async (context: ActionContext<LoginState>): Promise<void> => {
            context.setValue("loading", true);

            try {
                const result = await checkLoginStatusAPI();
                context.setValue("isLoggedIn", result.isLoggedIn);
            } catch (error) {
                context.setValue(
                    "error",
                    "Login status check failed: " + error.message
                );
            } finally {
                context.setValue("loading", false);
            }
        },

    // Currying function receiving multiple dependencies
    login:
        (
            loginAPI: (
                username: string,
                password: string
            ) => Promise<{ success: boolean }>,
            setShowPasswordChangeDialog: (show: boolean) => void
        ) =>
        async (context: ActionContext<LoginState>): Promise<void> => {
            const { username, password } = context.values;

            if (!username || !password) {
                context.setValue("error", "Enter username and password");
                return;
            }

            context.setValue("loading", true);
            context.setValue("error", null);

            try {
                const result = await loginAPI(username, password);

                if (result.success) {
                    context.setValue("isLoggedIn", true);
                    // Use externally injected dialog handler
                    setShowPasswordChangeDialog(true);
                } else {
                    context.setValue("error", "Login failed");
                }
            } catch (error) {
                context.setValue("error", "Login error: " + error.message);
            } finally {
                context.setValue("loading", false);
            }
        },

    // Simple action without parameters
    logout:
        (logoutAPI: () => Promise<void>) =>
        async (context: ActionContext<LoginState>): Promise<void> => {
            context.setValue("loading", true);

            try {
                await logoutAPI();
                context.setValue("isLoggedIn", false);
                context.setValue("username", "");
                context.setValue("password", "");
            } catch (error) {
                context.setValue("error", "Logout failed: " + error.message);
            } finally {
                context.setValue("loading", false);
            }
        },

    // Currying function receiving parameters (auth token, etc.)
    updateUserInfo:
        () =>
        async (
            context: ActionContext<LoginState>,
            newUsername: string
        ): Promise<void> => {
            context.setValue("username", newUsername);
            console.log("User info updated:", newUsername);
        },
};
```

#### 2. Usage in Component

```tsx
// LoginForm.tsx
import React, { useState } from "react";
import { useForm } from "@ehfuse/forma";
import { AuthActions } from "./authActions";

// 🔧 Actual API functions (or mocks)
const api = {
    checkLoginStatus: async () => {
        // Actual API call
        const response = await fetch("/api/auth/status");
        return response.json();
    },

    login: async (username: string, password: string) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        return response.json();
    },

    logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
    },
};

function LoginForm() {
    const [showPasswordChangeDialog, setShowPasswordChangeDialog] =
        useState(false);

    const form = useForm<LoginState>({
        initialValues: {
            username: "",
            password: "",
            isLoggedIn: false,
            loading: false,
            error: null,
        },
        // 🔥 Inject dependencies with currying pattern!
        actions: {
            checkLoginStatus: AuthActions.checkLoginStatus(
                api.checkLoginStatus
            ),
            login: AuthActions.login(api.login, setShowPasswordChangeDialog),
            logout: AuthActions.logout(api.logout),
            updateUserInfo: AuthActions.updateUserInfo(),
        },
    });

    const isLoggedIn = form.useFormValue("isLoggedIn");
    const loading = form.useFormValue("loading");
    const error = form.useFormValue("error");

    React.useEffect(() => {
        form.actions.checkLoginStatus();
    }, []);

    if (isLoggedIn) {
        return (
            <div>
                <h2>Login Successful!</h2>
                <button onClick={form.actions.logout}>Logout</button>
                <button onClick={() => form.actions.updateUserInfo("NewName")}>
                    Change Username
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <h2>Login</h2>

            {error && <div style={{ color: "red" }}>{error}</div>}

            <input
                name="username"
                placeholder="Username"
                onChange={form.handleFormChange}
                disabled={loading}
            />

            <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={form.handleFormChange}
                disabled={loading}
            />

            <button onClick={() => form.actions.login()} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
            </button>

            {showPasswordChangeDialog && <div>Password Change Dialog</div>}
        </form>
    );
}

export default LoginForm;
```

### Benefits of Currying Pattern

**1. Dependency Separation**

```tsx
// ❌ Plain approach: API hardcoded in Actions
const actions = {
    login: async (ctx) => {
        const result = await fetch("/api/login"); // Hardcoded!
    },
};

// ✅ Currying approach: inject API externally
const actions = {
    login: AuthActions.login(api.login, setDialog), // Injected!
};
```

**2. Testability**

```tsx
// Easily inject mock API in tests
const mockApi = {
    login: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue(undefined),
};

const form = useForm({
    initialValues: testData,
    actions: {
        login: AuthActions.login(mockApi.login, mockSetDialog),
        logout: AuthActions.logout(mockApi.logout),
    },
});

// Execute Actions and verify mock was called
await form.actions.login();
expect(mockApi.login).toHaveBeenCalledWith("user", "pass");
```

**3. Reusability**

```tsx
// Same Actions with different API implementations
const devActions = {
    login: AuthActions.login(devApi.login, devSetDialog),
};

const prodActions = {
    login: AuthActions.login(prodApi.login, prodSetDialog),
};
```

**4. Type Safety**

```tsx
// TypeScript checks signatures of injected functions
AuthActions.login(
    api.login, // (username: string, password: string) => Promise<{success: boolean}>
    setDialog // (show: boolean) => void
); // ✅ Type checked
```

### Plain Object vs Currying Pattern

| Feature                    | Plain Object Actions         | Currying Pattern Actions |
| -------------------------- | ---------------------------- | ------------------------ |
| **Dependency Injection**   | Difficult                    | Easy                     |
| **Testing**                | Requires full component test | Actions testable alone   |
| **Reusability**            | Low                          | High                     |
| **Type Safety**            | Moderate                     | Strong                   |
| **Learning Curve**         | Low                          | Medium                   |
| **Best For**               | Simple logic                 | API calls, complex logic |
| **Code Readability**       | High                         | Medium                   |
| **Setup Complexity**       | Low                          | Medium                   |
| **Dependency Change Ease** | Difficult                    | Easy                     |

### When to Use Currying Pattern?

**Use Currying Pattern:**

-   ✅ Actions requiring API functions
-   ✅ Need external handlers (dialogs, toasts, etc.)
-   ✅ Different implementations needed per environment (dev/prod)
-   ✅ Unit testing important
-   ✅ Want to reuse Actions like a library

**Use Plain Object:**

-   ✅ Pure state manipulation without external dependencies
-   ✅ Simple calculation/transformation logic
-   ✅ Quick prototyping
-   ✅ Team unfamiliar with currying pattern

---

This example demonstrates Forma's core philosophy of "subscribe only to what you need for performance optimization" and "choose structure based on situation".
