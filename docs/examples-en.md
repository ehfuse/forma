# Forma Examples Guide

This document provides various usage examples of the Forma library. It explains how to use each API in real-world scenarios with step-by-step instructions.

## Table of Contents

-   [useFormaState Examples](#useformastate-examples)
    -   [Basic Usage](#basic-usage)
    -   [Array State Management](#array-state-management)
    -   [Dynamic Field Management](#dynamic-field-management)
    -   [Array Length Subscription](#array-length-subscription)
    -   [Field Refresh Utilization](#field-refresh-utilization)
    -   [Batch Updates (setBatch) Utilization](#batch-updates-setbatch-utilization)
-   [useForm Examples](#useform-examples)
    -   [Basic Form Management](#basic-form-management)
    -   [Nested Object Handling](#nested-object-handling)
-   [useGlobalForm Examples](#useglobalform-examples)
    -   [Complete Global Form](#complete-global-form)
    -   [Multi-Step Form](#multi-step-form)
-   [useGlobalFormaState Examples](#useglobalformastate-examples)
    -   [Basic Usage](#global-state-basic-usage)
    -   [Dynamic State Management](#dynamic-state-management)
    -   [Shopping Cart Example](#shopping-cart-example)
-   [Register/Unregister Hook Examples](#registerunregister-hook-examples)

---

## useFormaState Examples

### Basic Usage

```typescript
import { useFormaState } from "forma";

// Basic usage
function MyComponent() {
    const state = useFormaState({
        user: { name: "", email: "" },
        settings: { theme: "light", notifications: true },
    });

    // Individual field subscription (re-renders only when that field changes)
    const userName = state.useValue("user.name");
    const theme = state.useValue("settings.theme");

    // Using new API methods
    const hasUserEmail = state.hasField("user.email");
    const userEmailValue = state.getValue("user.email"); // Non-reactive

    // Subscribe to global state changes
    React.useEffect(() => {
        const unsubscribe = state.subscribe((values) => {
            console.log("Global state changed:", values);
        });
        return unsubscribe;
    }, [state]);

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
            />
            <button onClick={() => state.setValue("settings.theme", "dark")}>
                Switch to Dark Theme
            </button>
            <button onClick={() => state.removeField("user.email")}>
                Remove Email Field
            </button>
            <button onClick={() => state.reset()}>
                Reset to Initial Values
            </button>
            {hasUserEmail && <p>Email field exists</p>}
        </div>
    );
}
```

### Array State Management

```typescript
// Array state management
function TodoList() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Build app", completed: false },
        ],
    });

    // Subscribe to specific todo item
    const firstTodo = state.useValue("todos.0.text");

    // Subscribe only to array length (re-renders only when items are added/removed)
    const todoCount = state.useValue("todos.length");

    const addTodo = () => {
        const todos = state.getValues().todos;
        state.setValue("todos", [
            ...todos,
            { id: Date.now(), text: "New todo", completed: false },
        ]);
        // When todos array changes, todos.length subscribers are automatically notified
    };

    const updateTodo = (index: number, newText: string) => {
        // Only array content changes (length stays same) - todos.length subscribers are not notified
        state.setValue(`todos.${index}.text`, newText);
    };

    const removeTodo = (index: number) => {
        state.removeField(`todos.${index}`);
    };

    return (
        <div>
            <p>First todo: {firstTodo}</p>
            <p>Total todos: {todoCount}</p>
            <button onClick={addTodo}>Add Todo</button>
            <button onClick={() => removeTodo(0)}>Remove First Todo</button>
        </div>
    );
}
```

### Dynamic Field Management

```typescript
// Dynamic field management
function DynamicForm() {
    const state = useFormaState<Record<string, any>>({});

    const addField = (fieldName: string, defaultValue: any) => {
        state.setValue(fieldName, defaultValue);
    };

    const removeField = (fieldName: string) => {
        if (state.hasField(fieldName)) {
            state.removeField(fieldName);
        }
    };

    return (
        <div>
            <button onClick={() => addField("newField", "")}>
                Add New Field
            </button>
            <button onClick={() => removeField("newField")}>
                Remove Field
            </button>
            {state.hasField("newField") && (
                <input
                    value={state.useValue("newField")}
                    onChange={(e) => state.setValue("newField", e.target.value)}
                />
            )}
        </div>
    );
}
```

### Array Length Subscription

```typescript
const state = useFormaState({
    todos: [
        { id: 1, text: "Todo 1" },
        { id: 2, text: "Todo 2" },
    ],
});

// Subscribe only to array length - re-renders only when items are added/removed
const todoCount = state.useValue("todos.length"); // 2

// Add item → notifies todos.length subscribers
state.setValue("todos", [...state.getValues().todos, newItem]);

// Change item content → no notification to todos.length subscribers (length stays same)
state.setValue("todos.0.text", "Modified todo");

// Usage example:
// Counter component (re-renders only when length changes)
function TodoCounter() {
    const count = state.useValue("todos.length");
    return <span>Todos: {count}</span>;
}

// Individual item component (re-renders only when that item changes)
function TodoItem({ index }) {
    const text = state.useValue(`todos.${index}.text`);
    return <div>{text}</div>;
}
```

### Field Refresh Utilization

```typescript
const state = useFormaState({
    user: { name: "John Doe", email: "john@example.com" },
    address: { city: "Seoul", street: "Gangnam-daero" },
    settings: { theme: "light", language: "en" },
    searchResults: [], // Large checkbox data
});

// Components subscribing to individual fields
const userName = state.useValue("user.name");
const userEmail = state.useValue("user.email");
const addressCity = state.useValue("address.city");

// Refresh all fields with specific prefix
const refreshUserFields = () => {
    // Refresh all fields starting with "user" (user.name, user.email)
    state.refreshFields("user");
};

const refreshAddressFields = () => {
    // Refresh all fields starting with "address" (address.city, address.street)
    state.refreshFields("address");
};

// Use case: Sync UI after external data source update
const syncWithServer = async () => {
    // Fetch latest data from server
    const latestUserData = await fetchUserFromServer();

    // Update state (but subscribers may not re-render if values are the same)
    state.setValue("user.name", latestUserData.name);
    state.setValue("user.email", latestUserData.email);

    // Force refresh UI components even if values are identical
    state.refreshFields("user");
};
```

### Batch Updates (setBatch) Utilization

The `setBatch` method allows you to efficiently update multiple fields in a single operation. This provides significant performance benefits when updating many fields simultaneously.

```typescript
const state = useFormaState({
    user: { name: "", email: "", age: 0 },
    settings: { theme: "light", language: "en", notifications: true },
    preferences: { privacy: "public", newsletter: false },
});

// ❌ Individual updates (multiple re-renders)
const updateProfileIndividually = () => {
    state.setValue("user.name", "John Doe");
    state.setValue("user.email", "john@example.com");
    state.setValue("user.age", 30);
    state.setValue("settings.theme", "dark");
    state.setValue("settings.language", "ko");
    // → 5 re-renders
};

// ✅ Batch update (single re-render)
const updateProfileWithBatch = () => {
    state.setBatch({
        "user.name": "John Doe",
        "user.email": "john@example.com",
        "user.age": 30,
        "settings.theme": "dark",
        "settings.language": "ko",
    });
    // → 1 re-render only
};

// 🔥 Real-world usage: Bulk form data update
const loadUserDataFromServer = async () => {
    const userData = await fetchUserFromServer();

    // Update server data all at once
    state.setBatch({
        "user.name": userData.name,
        "user.email": userData.email,
        "user.age": userData.age,
        "settings.theme": userData.preferences.theme,
        "settings.language": userData.preferences.language,
        "settings.notifications": userData.preferences.notifications,
        "preferences.privacy": userData.privacy.level,
        "preferences.newsletter": userData.marketing.newsletter,
    });
};

// 🎯 Bulk checkbox select/deselect example
const checkboxData = useFormaState({
    items: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        checked: false,
    })),
});

// ❌ Individual selection (100 re-renders)
const selectAllIndividually = () => {
    checkboxData.getValues().items.forEach((_, index) => {
        checkboxData.setValue(`items.${index}.checked`, true);
    });
    // → 100 re-renders
};

// ✅ Batch selection (single re-render)
const selectAllWithBatch = () => {
    const updates: Record<string, boolean> = {};
    checkboxData.getValues().items.forEach((_, index) => {
        updates[`items.${index}.checked`] = true;
    });
    checkboxData.setBatch(updates);
    // → 1 re-render only
};

// 💡 Conditional batch update
const updateSelectedItems = (selectedIds: number[], newStatus: string) => {
    const updates: Record<string, any> = {};

    checkboxData.getValues().items.forEach((item, index) => {
        if (selectedIds.includes(item.id)) {
            updates[`items.${index}.status`] = newStatus;
            updates[`items.${index}.lastModified`] = Date.now();
        }
    });

    // Bulk update only selected items
    if (Object.keys(updates).length > 0) {
        checkboxData.setBatch(updates);
    }
};
```

**When to use setBatch:**

-   ✅ When updating 10+ fields simultaneously
-   ✅ When loading server data into forms
-   ✅ Bulk checkbox/radio button select/deselect
-   ✅ Simultaneous changes to multiple settings
-   ✅ Updating multiple table rows data

**Key Benefits:**

-   📝 **Code Readability**: Express multiple field changes at once
-   🔄 **Data Consistency**: All changes are applied simultaneously
-   ⏱️ **Convenience**: Single object instead of multiple setValue calls

---

## useForm Examples

### Basic Form Management

```typescript
const form = useForm({
    initialValues: {
        name: "",
        email: "",
        age: 0,
    },
    onSubmit: async (values) => {
        await api.submitUser(values);
    },
    onValidate: async (values) => {
        return values.email.includes("@");
    },
});

// Individual field subscription (performance optimization)
const name = form.useFormValue("name");
const email = form.useFormValue("email");
```

### Nested Object Handling

```typescript
const form = useForm({
    initialValues: {
        user: {
            profile: {
                name: "",
                settings: {
                    theme: "light",
                },
            },
        },
    },
});

// Access nested objects with dot notation
const name = form.useFormValue("user.profile.name");
const theme = form.useFormValue("user.profile.settings.theme");
```

---

## useGlobalForm Examples

### Complete Global Form

```typescript
// Global form with validation and submission logic
function GlobalFormExample() {
    const form = useGlobalForm({
        formId: "user-form",
        initialValues: { name: "", email: "", age: 0 },
        onValidate: async (values) => {
            // Name validation
            if (!values.name.trim()) {
                alert("Please enter your name.");
                return false;
            }

            // Email validation
            if (!values.email.includes("@")) {
                alert("Please enter a valid email.");
                return false;
            }

            return true;
        },
        onSubmit: async (values) => {
            console.log("Global form submission:", values);
            await api.submitUser(values);
        },
        onComplete: (values) => {
            alert("Submission completed!");
        },
    });

    return (
        <form onSubmit={form.submit}>
            <input
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
            <input
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
            />
            <button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting ? "Submitting..." : "Submit"}
            </button>
        </form>
    );
}

// Share the same form state in another component
function FormViewer() {
    const form = useGlobalForm({
        formId: "user-form", // Share state with same ID
    });

    return (
        <div>
            <p>Current name: {form.useFormValue("name")}</p>
            <p>Current email: {form.useFormValue("email")}</p>
            <p>Modified: {form.isModified ? "Yes" : "No"}</p>
        </div>
    );
}
```

### Multi-Step Form

```typescript
// Step 1 Component
function Step1() {
    const form = useGlobalForm({
        formId: "user-registration",
        initialValues: { name: "", email: "", phone: "" },
    });

    return (
        <TextField
            name="name"
            value={form.useFormValue("name")}
            onChange={form.handleFormChange}
        />
    );
}

// Step 2 Component (shares same form state)
function Step2() {
    const form = useGlobalForm({
        formId: "user-registration", // Same ID
        initialValues: { name: "", email: "", phone: "" },
    });

    return (
        <TextField
            name="email"
            value={form.useFormValue("email")}
            onChange={form.handleFormChange}
        />
    );
}

// Final step - validation and submission
function FinalStep() {
    const form = useGlobalForm({
        formId: "user-registration", // Same form state
        onValidate: async (values) => {
            return values.name && values.email && values.phone;
        },
        onSubmit: async (values) => {
            await api.registerUser(values);
        },
    });

    return (
        <div>
            <p>Name: {form.useFormValue("name")}</p>
            <p>Email: {form.useFormValue("email")}</p>
            <p>Phone: {form.useFormValue("phone")}</p>
            <button onClick={form.submit} disabled={form.isSubmitting}>
                Complete Registration
            </button>
        </div>
    );
}
```

### Automatic Memory Cleanup Example

```typescript
// Automatic cleanup in multi-step forms
function Step1() {
    const form = useGlobalForm({
        formId: "wizard-form",
        autoCleanup: true, // Default - automatic cleanup
    });
    return <input name="step1Field" />;
}

function Step2() {
    const form = useGlobalForm({
        formId: "wizard-form", // Share same form
        autoCleanup: true,
    });
    return <input name="step2Field" />;
}

// Form that needs persistent data
function PersistentForm() {
    const form = useGlobalForm({
        formId: "persistent-form",
        autoCleanup: false, // Manual management
    });
    return <input name="importantData" />;
}
```

---

## useGlobalFormaState Examples

### Global State Basic Usage

```typescript
import { useGlobalFormaState, GlobalFormaProvider } from "@ehfuse/forma";

// App.tsx
function App() {
    return (
        <GlobalFormaProvider>
            <UserProfile />
            <UserSettings />
        </GlobalFormaProvider>
    );
}

// User profile component
function UserProfile() {
    const state = useGlobalFormaState({
        stateId: "user-data",
        initialValues: {
            user: { name: "", email: "" },
            preferences: { theme: "light", language: "en" },
        },
    });

    const userName = state.useValue("user.name");
    const userEmail = state.useValue("user.email");

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
                placeholder="Name"
            />
            <input
                value={userEmail}
                onChange={(e) => state.setValue("user.email", e.target.value)}
                placeholder="Email"
            />
        </div>
    );
}

// User settings component (shares same state)
function UserSettings() {
    const state = useGlobalFormaState({
        stateId: "user-data", // Share state with same ID
        initialValues: {}, // Ignored since state already exists
    });

    const theme = state.useValue("preferences.theme");
    const language = state.useValue("preferences.language");
    const userName = state.useValue("user.name"); // Value entered from other component

    return (
        <div>
            <p>User: {userName}</p>
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
```

### Dynamic State Management

```typescript
function DynamicStateManager() {
    const [stateId, setStateId] = useState("session-1");

    const state = useGlobalFormaState({
        stateId,
        initialValues: { data: {}, metadata: { created: Date.now() } },
    });

    const switchSession = (newId: string) => {
        setStateId(newId); // Switch to different global state
    };

    return (
        <div>
            <button onClick={() => switchSession("session-1")}>
                Session 1
            </button>
            <button onClick={() => switchSession("session-2")}>
                Session 2
            </button>
            <div>Current session: {stateId}</div>
            {/* Displays state of currently selected session */}
        </div>
    );
}
```

### Shopping Cart Example

```typescript
// Basic shopping cart component
function ShoppingCart() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart",
        initialValues: {
            items: [],
            total: 0,
        },
    });

    // ✅ Recommended: .length subscription (re-renders only when array length changes)
    const itemCount = cart.useValue("items.length");
    const total = cart.useValue("total");

    return (
        <div>
            <h2>Shopping Cart ({itemCount})</h2>
            <p>Total: ${total}</p>
        </div>
    );
}

// Product addition component
function ProductList() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart",
    });

    const addToCart = (product) => {
        const currentItems = cart.getValues().items || [];
        cart.setValue("items", [...currentItems, product]);

        // Update total
        const newTotal =
            currentItems.reduce((sum, item) => sum + item.price, 0) +
            product.price;
        cart.setValue("total", newTotal);
    };

    return (
        <button
            onClick={() => addToCart({ id: 1, name: "Product 1", price: 100 })}
        >
            Add Product
        </button>
    );
}
```

### Automatic Memory Cleanup Example

```typescript
// Component A mounts → reference count: 1
function ComponentA() {
    const state = useGlobalFormaState({
        stateId: "shared",
        autoCleanup: true,
    });
    return <div>{state.useValue("data")}</div>;
}

// Component B mounts → reference count: 2
function ComponentB() {
    const state = useGlobalFormaState({
        stateId: "shared", // Same ID
        autoCleanup: true,
    });
    return <div>{state.useValue("data")}</div>;
}

// Component A unmounts → reference count: 1 (state preserved)
// Component B unmounts → reference count: 0 → 🗑️ Automatic cleanup!
```

---

## Register/Unregister Hook Examples

### useRegisterGlobalForm Example

```typescript
import { useForm, useRegisterGlobalForm } from "@ehfuse/forma";

function MyComponent() {
    // Create local form
    const form = useForm<{ name: string; email: string }>({
        initialValues: { name: "", email: "" },
        onSubmit: async (values) => console.log(values),
    });

    // Register as global form
    useRegisterGlobalForm("shared-form", form);

    return (
        <input
            value={form.useFormValue("name")}
            onChange={form.handleFormChange}
            name="name"
        />
    );
}

// Access from another component
function AnotherComponent() {
    const form = useGlobalForm<{ name: string; email: string }>({
        formId: "shared-form",
    });

    return <p>Name: {form.useFormValue("name")}</p>;
}
```

### useRegisterGlobalFormaState Example

```typescript
import { useFormaState, useRegisterGlobalFormaState } from "@ehfuse/forma";

function DataProvider() {
    // Create local state
    const state = useFormaState({
        user: { name: "", email: "" },
        settings: { theme: "light" },
    });

    // Register as global state
    useRegisterGlobalFormaState("app-data", state);

    return <div>Data Provider</div>;
}

// Access from another component
function UserProfile() {
    const state = useGlobalFormaState({
        stateId: "app-data",
    });

    return <p>User: {state.useValue("user.name")}</p>;
}
```

### useUnregisterGlobalForm Example

```typescript
import { useUnregisterGlobalForm } from "@ehfuse/forma";

function CleanupComponent() {
    const { unregisterForm, clearForms } = useUnregisterGlobalForm();

    const handleUnregister = () => {
        const success = unregisterForm("user-form");
        console.log(`Form removal ${success ? "succeeded" : "failed"}`);
    };

    const handleClearAll = () => {
        clearForms();
        console.log("All forms have been removed");
    };

    return (
        <div>
            <button onClick={handleUnregister}>Remove Specific Form</button>
            <button onClick={handleClearAll}>Remove All Forms</button>
        </div>
    );
}
```

### useUnregisterGlobalFormaState Example

```typescript
import { useUnregisterGlobalFormaState } from "@ehfuse/forma";

function StateManager() {
    const { unregisterState, clearStates } = useUnregisterGlobalFormaState();

    const handleLogout = () => {
        // Remove only user-related states on logout
        unregisterState("user-data");
        unregisterState("user-preferences");
    };

    const handleAppReset = () => {
        // Remove all states on app reset
        clearStates();
    };

    return (
        <div>
            <button onClick={handleLogout}>Logout</button>
            <button onClick={handleAppReset}>Reset App</button>
        </div>
    );
}
```

---

## Performance Optimization Examples

### Individual Field Subscription

```typescript
// ✅ Recommended: Field-by-field subscription
const name = form.useFormValue("name");

// ❌ Not recommended: Whole object subscription
const { name } = form.values;
```

### Conditional Subscription

```typescript
function ConditionalField({ showField }) {
    const value = showField ? form.useFormValue("field") : "";
    return showField ? <TextField value={value} /> : null;
}
```

### Array Length Subscription Utilization

```typescript
// ✅ Counter subscribes only to length
const TodoCounter = () => {
    const count = state.useValue("todos.length");
    return <span>{count} items</span>;
};

// ✅ Individual item subscribes only to its index
const TodoItem = ({ index }) => {
    const todo = state.useValue(`todos.${index}`);
    return <div>{todo.text}</div>;
};
```

---

This examples guide provides practical usage patterns for all major features of the Forma library.

## Related Documents

-   **[API Reference](./API-en.md)** - Detailed API documentation
-   **[Getting Started Guide](./getting-started-en.md)** - Basic usage
-   **[Performance Optimization Guide](./performance-guide-en.md)** - Performance optimization methods
-   **[Performance Warnings](./performance-warnings-en.md)** - Anti-patterns and precautions
-   **[Migration Guide](./migration-en.md)** - Migration from other libraries
-   **[useGlobalForm Guide](./useGlobalForm-guide-en.md)** - Global form state management
