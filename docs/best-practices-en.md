# Forma Performance Optimization Guide

Essential patterns for efficient use of Forma.

> 💡 **For More Detailed Performance Information**: Check the [Performance Optimization and Precautions Guide](./performance-optimization-en.md) for batch processing, refreshFields usage, Hook precautions, and more.

## 🚀 Core Principles

### 1. Use Individual Field Subscriptions

```tsx
// ❌ Full object subscription - re-renders on any field change
const user = form.useFormValue("user");
return (
    <div>
        <TextField value={user.name} onChange={form.handleFormChange} />
        <TextField value={user.email} onChange={form.handleFormChange} />
    </div>
);

// ✅ Individual field subscriptions - re-renders only on specific field changes
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");
return (
    <div>
        <TextField value={userName} onChange={form.handleFormChange} />
        <TextField value={userEmail} onChange={form.handleFormChange} />
    </div>
);
```

### 2. Conditional Subscriptions

```tsx
// ✅ Subscribe only when needed
function ConditionalField({ showField }: { showField: boolean }) {
    const value = showField ? form.useFormValue("optionalField") : "";

    return showField ? (
        <TextField value={value} onChange={form.handleFormChange} />
    ) : null;
}
```

### 3. Array Length Subscription for Performance Optimization

```tsx
// ✅ Subscribe to array length only for performance optimization
function TodoCounter() {
    const todoCount = state.useValue("todos.length");
    const completedCount = state.useValue("completedTodos.length");

    return (
        <div>
            {completedCount} out of {todoCount} completed
        </div>
    );
    // Re-renders only when items are added/removed
    // No re-render when array content changes (e.g., todo.completed change)
}

// ✅ Smart notification system
function ShoppingCart() {
    const itemCount = state.useValue("cart.length");

    const addItem = (item) => {
        const cart = state.getValues().cart;
        state.setValue("cart", [...cart, item]);
        // ✅ Array length changed, so cart.length subscribers are notified
    };

    const updateQuantity = (index, quantity) => {
        state.setValue(`cart.${index}.quantity`, quantity);
        // ✅ Array length unchanged, so cart.length subscribers are not notified
    };

    return <span>Cart ({itemCount})</span>;
}
```

### 4. Memoization for Complex Calculations

```tsx
// ✅ Use useMemo for complex calculations
function ExpensiveValidation() {
    const email = form.useFormValue("email");
    const password = form.useFormValue("password");

    const isValid = useMemo(() => {
        return validateEmail(email) && validatePassword(password);
    }, [email, password]);

    return <div>{isValid ? "✓" : "✗"}</div>;
}
```

## 📝 Recommended Patterns

### useForm vs useGlobalForm vs useFormaState

```tsx
// ✅ Single component form → useForm
function ContactForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
    });
}

// ✅ Multi-component/page form → useGlobalForm
function MultiStepForm() {
    const form = useGlobalForm({
        formId: "user-registration",
    });
}

// ✅ General state management (non-form) → useFormaState
function UserDashboard() {
    const state = useFormaState({
        user: { name: "John Doe", status: "online" },
        theme: "dark",
    });

    const userName = state.useValue("user.name");
    const theme = state.useValue("theme");

    return (
        <div>
            Hello, {userName}! Theme: {theme}
        </div>
    );
}

// ✅ Complex array/object state → useFormaState (individual subscriptions)
function TodoManager() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Learn Forma", completed: true },
        ],
        filter: "all",
    });

    // ❌ Full array subscription - re-renders on any todo change
    // const todos = state.useValue("todos");

    // ✅ Individual todo item subscriptions (performance optimization)
    const firstTodo = state.useValue("todos.0.text");
    const secondCompleted = state.useValue("todos.1.completed");

    return (
        <div>
            <div>First: {firstTodo}</div>
            <label>
                <input
                    type="checkbox"
                    checked={secondCompleted}
                    onChange={(e) =>
                        state.setValue("todos.1.completed", e.target.checked)
                    }
                />
                Second todo completed
            </label>
        </div>
    );
}
```

### useFormaState Optimization Patterns

```tsx
// ✅ Maintain immutability when updating arrays
function TodoList() {
    const state = useFormaState({ todos: [] });

    const addTodo = (text: string) => {
        const currentTodos = state.getValues().todos;
        state.setValue("todos", [
            ...currentTodos,
            { id: Date.now(), text, completed: false },
        ]);
    };

    const updateTodo = (id: number, updates: Partial<Todo>) => {
        const currentTodos = state.getValues().todos;
        state.setValue(
            "todos",
            currentTodos.map((todo) =>
                todo.id === id ? { ...todo, ...updates } : todo
            )
        );
    };
}

// ✅ Individual field subscriptions for nested objects
function UserProfile() {
    const state = useFormaState({
        user: { name: "", email: "" },
        preferences: { theme: "light", notifications: true },
    });

    // Subscribe to each field individually - optimal performance
    const userName = state.useValue("user.name");
    const theme = state.useValue("preferences.theme");

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
            />
            <select
                value={theme}
                onChange={(e) =>
                    state.setValue("preferences.theme", e.target.value)
                }
            >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>
    );
}

// ✅ Individual element subscriptions for arrays (performance optimization)
function OptimizedTodoList() {
    const state = useFormaState({ todos: [] });

    // ❌ Full array subscription (inefficient)
    // const todos = state.useValue("todos");

    // ✅ Subscribe to specific fields of individual elements
    const firstTodoText = state.useValue("todos.0.text");
    const secondTodoCompleted = state.useValue("todos.1.completed");

    return (
        <div>
            <p>First: {firstTodoText}</p>
            <input
                type="checkbox"
                checked={secondTodoCompleted}
                onChange={(e) =>
                    state.setValue("todos.1.completed", e.target.checked)
                }
            />
        </div>
    );
}
```

### Component Separation

```tsx
// ✅ Separate components by field
function UserNameField() {
    const name = form.useFormValue("name");
    return <TextField value={name} onChange={form.handleFormChange} />;
}

function UserEmailField() {
    const email = form.useFormValue("email");
    return <TextField value={email} onChange={form.handleFormChange} />;
}
```

## ❌ Patterns to Avoid

-   Direct access to `form.values` (full subscription)
-   Unconditional subscriptions in conditional fields
-   Creating separate useForm for each component
-   Creating new objects/arrays on every render

## 🔧 Debugging

```tsx
// Performance check in development environment
if (process.env.NODE_ENV === "development") {
    console.log("Form Values:", form.getFormValues());
}
```

## 🆕 Utilizing New API Methods

### Dynamic Field Management

```tsx
// ✅ Check field existence before safe access
function DynamicField({ fieldName }: { fieldName: string }) {
    const state = useFormaState<Record<string, any>>({});

    // Check field existence
    const hasField = state.hasField(fieldName);

    // Safe value access (non-reactive)
    const value = hasField ? state.getValue(fieldName) : "";

    return hasField ? (
        <input
            value={state.useValue(fieldName)} // Reactive subscription
            onChange={(e) => state.setValue(fieldName, e.target.value)}
        />
    ) : (
        <button onClick={() => state.setValue(fieldName, "")}>
            Add {fieldName} field
        </button>
    );
}
```

### Global State Subscription Optimization

```tsx
// ✅ Global subscription only under specific conditions
function GlobalStateWatcher() {
    const state = useFormaState({ data: {} });
    const [isWatching, setIsWatching] = useState(false);

    useEffect(() => {
        if (!isWatching) return;

        const unsubscribe = state.subscribe((values) => {
            console.log("Full state change:", values);
            // Logging, analytics, auto-save, etc.
        });

        return unsubscribe;
    }, [state, isWatching]);

    return (
        <button onClick={() => setIsWatching(!isWatching)}>
            {isWatching ? "Stop watching" : "Start watching"}
        </button>
    );
}
```

### Cleanup When Removing Fields

```tsx
// ✅ Cleanup work before removing fields
function removeFieldSafely(state: any, fieldPath: string) {
    if (state.hasField(fieldPath)) {
        // Clean up related data
        const value = state.getValue(fieldPath);
        if (value && typeof value === "object") {
            // Clean up related resources for objects or arrays
            console.log(`Cleaning up field: ${fieldPath}`, value);
        }

        // Remove field
        state.removeField(fieldPath);
    }
}
```

### Performance Monitoring

```tsx
// ✅ Monitor state change frequency
function PerformanceMonitor() {
    const state = useFormaState({ counters: {} });
    const [changeCount, setChangeCount] = useState(0);

    useEffect(() => {
        const unsubscribe = state.subscribe(() => {
            setChangeCount((prev) => prev + 1);
        });

        return unsubscribe;
    }, [state]);

    return (
        <div>
            <p>State changes: {changeCount}</p>
            <button onClick={() => state.reset()}>
                Reset (change count also resets)
            </button>
        </div>
    );
}
```
