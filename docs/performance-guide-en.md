# Forma Performance Optimization Guide

Core patterns and optimization methods for using Forma efficiently.

> ⚠️ **Also check precautions**: Check out anti-patterns and pitfalls in [Performance Warnings](./performance-warnings-en.md).

## 🚀 Core Principles

### 1. Use Individual Field Subscriptions

```tsx
// ❌ Whole object subscription - re-renders on all field changes
const user = form.useFormValue("user");
return (
    <div>
        <TextField value={user.name} onChange={form.handleFormChange} />
        <TextField value={user.email} onChange={form.handleFormChange} />
    </div>
);

// ✅ Individual field subscription - re-renders only that field
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

### 3. Optimize Performance with Array Length Subscriptions

```tsx
// ✅ Optimize performance by subscribing only to array length
function TodoCounter() {
    const todoCount = state.useValue("todos.length");
    const completedCount = state.useValue("completedTodos.length");

    return (
        <div>
            {completedCount} of {todoCount} completed
        </div>
    );
    // Re-renders only when items are added/removed
    // No re-render when array contents change (e.g., todo.completed changes)
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

### 4. Memoize Complex Calculations

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

### 5. Batch Updates (setBatch) for Convenience and Synchronization

`setBatch` is a convenience function for updating multiple fields at once. Its main benefits are code readability and data consistency.

```tsx
// ❌ Individual updates (multiple listener executions)
function updateUserProfileIndividually() {
    state.setValue("user.name", "John Doe");
    state.setValue("user.email", "john@example.com");
    state.setValue("user.age", 30);
    state.setValue("settings.theme", "dark");
    state.setValue("settings.language", "en");
    state.setValue("preferences.notifications", false);
    // → Each setValue triggers listeners immediately
}

// ✅ Batch update (single listener execution)
function updateUserProfileWithBatch() {
    state.setBatch({
        "user.name": "John Doe",
        "user.email": "john@example.com",
        "user.age": 30,
        "settings.theme": "dark",
        "settings.language": "en",
        "preferences.notifications": false,
    });
    // → Collects all changes and executes listeners once at the end
}

// 🔥 Real-world example: Bulk checkbox selection
function selectAllCheckboxes() {
    const updates: Record<string, boolean> = {};

    // Select 100 checkboxes at once
    Array.from({ length: 100 }, (_, i) => {
        updates[`items.${i}.checked`] = true;
    });

    state.setBatch(updates);
    // → Individual setValue: immediate listener execution for each field
    // → setBatch: collects all changes and executes listeners once at the end
}

// 💡 Server data loading synchronization
async function loadDataFromServer() {
    const serverData = await fetchComplexDataFromServer();

    // Update multiple server data at once
    state.setBatch({
        "user.profile": serverData.userProfile,
        "user.settings": serverData.userSettings,
        "app.theme": serverData.theme,
        "app.language": serverData.language,
        "notifications.preferences": serverData.notifications,
        "dashboard.widgets": serverData.widgets,
    });
    // → All related components update simultaneously (ensures data consistency)
}
```

**setBatch Core Guidelines:**

1. **When to use:**

    - ✅ When logically updating multiple fields together
    - ✅ When loading server data into forms (data consistency)
    - ✅ Bulk checkbox/radio select/deselect (convenience)
    - ✅ Multiple option changes in settings pages (atomic updates)
    - ✅ Multiple table row updates (synchronization)

2. **Key Benefits:**

    - 📝 **Code Readability**: Express multiple field changes at once
    - 🔄 **Data Consistency**: All changes are applied simultaneously
    - ⏱️ **Timing Optimization**: Batches listener execution at the end
    - 🧹 **Convenience**: Single object instead of multiple setValue calls

3. **Usage patterns:**

    ```tsx
    // Pattern 1: Prepare object then batch update
    const updates = {};
    items.forEach((item, index) => {
        updates[`items.${index}.status`] = "updated";
    });
    state.setBatch(updates);

    // Pattern 2: Conditional batch update
    const updates = {};
    selectedItems.forEach((itemId) => {
        const index = findIndexById(itemId);
        updates[`items.${index}.selected`] = true;
    });
    if (Object.keys(updates).length > 0) {
        state.setBatch(updates);
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

// ✅ General state management (not form) → useFormaState
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
            { id: 2, text: "Try Forma", completed: true },
        ],
        filter: "all",
    });

    // ❌ Whole array subscription - re-renders on all todo changes
    // const todos = state.useValue("todos");

    // ✅ Individual todo item subscription (performance optimization)
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

// ✅ Subscribe to individual array elements (performance optimization)
function OptimizedTodoList() {
    const state = useFormaState({ todos: [] });

    // ❌ Whole array subscription (inefficient)
    // const todos = state.useValue("todos");

    // ✅ Subscribe only to specific fields of individual elements
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

-   Direct access to `form.values` (whole subscription)
-   Unconditional subscriptions in conditional fields
-   Creating separate useForm for each component
-   Creating new objects/arrays on every render

## 🔧 Debugging

```tsx
// Check performance in development environment
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
// ✅ Subscribe globally only under specific conditions
function GlobalStateWatcher() {
    const state = useFormaState({ data: {} });
    const [isWatching, setIsWatching] = useState(false);

    useEffect(() => {
        if (!isWatching) return;

        const unsubscribe = state.subscribe((values) => {
            console.log("Global state change:", values);
            // Logging, analytics, auto-save, etc.
        });

        return unsubscribe;
    }, [state, isWatching]);

    return (
        <button onClick={() => setIsWatching(!isWatching)}>
            {isWatching ? "Stop Watching" : "Start Watching"}
        </button>
    );
}
```

### Cleanup Before Field Removal

```tsx
// ✅ Cleanup before removing fields
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
                Reset (change count will also reset)
            </button>
        </div>
    );
}
```

## Related Documents

-   **[Performance Warnings](./performance-warnings-en.md)** - Anti-patterns and things to watch out for
-   **[API Reference](./API-en.md)** - Detailed API documentation
-   **[Getting Started Guide](./getting-started-en.md)** - Basic usage
-   **[Examples Collection](./examples-en.md)** - Practical usage examples
-   **[Migration Guide](./migration-en.md)** - Migration from other libraries
