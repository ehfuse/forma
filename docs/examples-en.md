# Forma Examples Guide

This document provides various usage examples of the Forma library. It explains how to use each API in real-world scenarios with step-by-step instructions.

## Table of Contents

-   [useFormaState Examples](#useformastate-examples)
    -   [Basic Usage](#basic-usage)
    -   [Array State Management](#array-state-management)
    -   [Dynamic Field Management](#dynamic-field-management)
    -   [Array Length Subscription](#array-length-subscription)
    -   [Global State Subscription Utilization](#global-state-subscription-utilization)
    -   [Field Refresh Utilization](#field-refresh-utilization)
    -   [Batch Updates (setBatch) Utilization](#batch-updates-setbatch-utilization)
    -   [Actions Utilization](#useformastate-actions-utilization)
-   [useForm Examples](#useform-examples)
    -   [Basic Form Management](#basic-form-management)
    -   [Nested Object Handling](#nested-object-handling)
    -   [Actions Utilization](#useform-actions-utilization)
-   [useGlobalForm Examples](#useglobalform-examples)
    -   [Complete Global Form](#complete-global-form)
    -   [Multi-Step Form](#multi-step-form)
-   [useGlobalFormaState Examples](#useglobalformastate-examples)
    -   [Basic Usage](#global-state-basic-usage)
    -   [Dynamic State Management](#dynamic-state-management)
    -   [Shopping Cart Example](#shopping-cart-example)
-   [useModal Examples](#usemodal-examples)
    -   [Basic Modal Usage](#basic-modal-usage)
    -   [Nested Modal Management](#nested-modal-management)
    -   [Modal with Form](#modal-with-form)
-   [useBreakpoint Examples](#usebreakpoint-examples)
    -   [Basic Usage](#responsive-basic-usage)
    -   [Mobile/Desktop Branching](#mobiledesktop-branching)
    -   [Dynamic Layout](#dynamic-layout)
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

### useFormaState Actions Utilization

Using `actions` allows you to encapsulate business logic alongside state. You can manage computed getters, handlers, and complex workflows in a single object.

```typescript
import { useFormaState } from "forma";

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
    const state = useFormaState<TodoState>({
        initialValues: {
            todos: [
                { id: 1, text: "Learn React", completed: false },
                { id: 2, text: "Learn Forma", completed: true },
            ],
            filter: "all",
            newTodoText: "",
        },
        actions: {
            // 📊 Computed Getters: Return calculated values
            getFilteredTodos: (context) => {
                const { todos, filter } = context.values;
                if (filter === "active")
                    return todos.filter((t) => !t.completed);
                if (filter === "completed")
                    return todos.filter((t) => t.completed);
                return todos;
            },

            getCompletedCount: (context) => {
                return context.values.todos.filter((t) => t.completed).length;
            },

            getRemainingCount: (context) => {
                return context.values.todos.filter((t) => !t.completed).length;
            },

            // 🎯 Handlers: State modification operations
            addTodo: (context) => {
                const text = context.values.newTodoText.trim();
                if (!text) return;

                const newTodo: Todo = {
                    id: Date.now(),
                    text,
                    completed: false,
                };

                context.setValue("todos", [...context.values.todos, newTodo]);
                context.setValue("newTodoText", "");
            },

            toggleTodo: (context, id: number) => {
                const index = context.values.todos.findIndex(
                    (t) => t.id === id
                );
                if (index === -1) return;

                const todo = context.getValue(`todos.${index}`);
                context.setValue(`todos.${index}.completed`, !todo.completed);
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

            setFilter: (context, filter: "all" | "active" | "completed") => {
                context.setValue("filter", filter);
            },
        },
    });

    // Subscriptions
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    // Using Actions
    const filteredTodos = state.actions.getFilteredTodos();
    const completedCount = state.actions.getCompletedCount();
    const remainingCount = state.actions.getRemainingCount();

    return (
        <div>
            <h2>Todo Management</h2>

            {/* Input area */}
            <div>
                <input
                    value={newTodoText}
                    onChange={(e) =>
                        state.setValue("newTodoText", e.target.value)
                    }
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
                <button onClick={() => state.actions.setFilter("all")}>
                    All ({state.useValue("todos.length")})
                </button>
                <button onClick={() => state.actions.setFilter("active")}>
                    Active ({remainingCount})
                </button>
                <button onClick={() => state.actions.setFilter("completed")}>
                    Completed ({completedCount})
                </button>
            </div>

            {/* Todo list */}
            <ul>
                {filteredTodos.map((todo) => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => state.actions.toggleTodo(todo.id)}
                        />
                        <span
                            style={{
                                textDecoration: todo.completed
                                    ? "line-through"
                                    : "none",
                            }}
                        >
                            {todo.text}
                        </span>
                        <button
                            onClick={() => state.actions.removeTodo(todo.id)}
                        >
                            Delete
                        </button>
                    </li>
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
```

**Benefits of Actions:**

-   ✅ **Logic Encapsulation**: Manage business logic together with state definition
-   ✅ **Reusability**: Same action callable from multiple places
-   ✅ **Type Safety**: Type inference through ActionContext
-   ✅ **Testability**: Actions testable independently
-   ✅ **Readability**: Express complex state changes with clear names

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

### useForm Actions Utilization

You can also use actions with `useForm` to encapsulate form logic. Let's learn through a shopping cart example.

```typescript
import { useForm } from "forma";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartForm {
    items: CartItem[];
    discount: number;
    customerName: string;
    customerEmail: string;
}

function ShoppingCartWithActions() {
    const form = useForm<CartForm>({
        initialValues: {
            items: [],
            discount: 0,
            customerName: "",
            customerEmail: "",
        },
        actions: {
            // 📊 Computed Getters
            getTotal: (context) => {
                return context.values.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
            },

            getDiscountedTotal: (context) => {
                const total = context.actions.getTotal();
                return total * (1 - context.values.discount / 100);
            },

            isEmpty: (context) => {
                return context.values.items.length === 0;
            },

            // 🎯 Handlers
            addItem: (context, item: CartItem) => {
                const existingIndex = context.values.items.findIndex(
                    (i) => i.id === item.id
                );

                if (existingIndex >= 0) {
                    // Existing item: increase quantity
                    const existingItem = context.getValue(
                        `items.${existingIndex}`
                    );
                    context.setValue(
                        `items.${existingIndex}.quantity`,
                        existingItem.quantity + 1
                    );
                } else {
                    // Add new item
                    context.setValue("items", [...context.values.items, item]);
                }
            },

            removeItem: (context, itemId: number) => {
                context.setValue(
                    "items",
                    context.values.items.filter((item) => item.id !== itemId)
                );
            },

            updateQuantity: (context, itemId: number, quantity: number) => {
                const index = context.values.items.findIndex(
                    (i) => i.id === itemId
                );
                if (index >= 0) {
                    context.setValue(`items.${index}.quantity`, quantity);
                }
            },

            applyDiscount: (context, discountPercent: number) => {
                context.setValue(
                    "discount",
                    Math.min(100, Math.max(0, discountPercent))
                );
            },

            clearAll: (context) => {
                context.setValue("items", []);
                context.setValue("discount", 0);
            },

            // 🔄 Complex Workflow
            submitOrder: async (context) => {
                // Validation
                if (context.actions.isEmpty()) {
                    alert("Cart is empty");
                    return false;
                }

                if (!context.values.customerName.trim()) {
                    alert("Please enter your name");
                    return false;
                }

                if (!context.values.customerEmail.includes("@")) {
                    alert("Please enter a valid email");
                    return false;
                }

                // Submit order
                const orderData = {
                    customer: {
                        name: context.values.customerName,
                        email: context.values.customerEmail,
                    },
                    items: context.values.items,
                    discount: context.values.discount,
                    total: context.actions.getTotal(),
                    finalAmount: context.actions.getDiscountedTotal(),
                };

                console.log("Order submitted:", orderData);
                // await api.submitOrder(orderData);

                // Reset after success
                context.actions.clearAll();
                context.setValue("customerName", "");
                context.setValue("customerEmail", "");

                return true;
            },
        },
        onSubmit: async (values, actions) => {
            return actions.submitOrder();
        },
    });

    // Subscriptions
    const items = form.useFormValue("items");
    const customerName = form.useFormValue("customerName");
    const customerEmail = form.useFormValue("customerEmail");
    const discount = form.useFormValue("discount");

    // Using Actions
    const total = form.actions.getTotal();
    const finalAmount = form.actions.getDiscountedTotal();

    return (
        <div>
            <h2>Shopping Cart</h2>

            {/* Add product buttons */}
            <div>
                <button
                    onClick={() =>
                        form.actions.addItem({
                            id: 1,
                            name: "Laptop",
                            price: 1000,
                            quantity: 1,
                        })
                    }
                >
                    Add Laptop
                </button>
                <button
                    onClick={() =>
                        form.actions.addItem({
                            id: 2,
                            name: "Mouse",
                            price: 30,
                            quantity: 1,
                        })
                    }
                >
                    Add Mouse
                </button>
                <button
                    onClick={() =>
                        form.actions.addItem({
                            id: 3,
                            name: "Keyboard",
                            price: 80,
                            quantity: 1,
                        })
                    }
                >
                    Add Keyboard
                </button>
            </div>

            {/* Cart items */}
            <div>
                <h3>Cart Items</h3>
                {items.map((item) => (
                    <div key={item.id} style={{ marginBottom: "10px" }}>
                        <span>{item.name}</span>
                        <span> - ${item.price}</span>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                                form.actions.updateQuantity(
                                    item.id,
                                    parseInt(e.target.value) || 1
                                )
                            }
                            style={{ width: "50px", margin: "0 10px" }}
                        />
                        <button
                            onClick={() => form.actions.removeItem(item.id)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                {items.length === 0 && <p>Cart is empty</p>}
            </div>

            {/* Discount */}
            <div>
                <label>
                    Discount (%):
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) =>
                            form.actions.applyDiscount(
                                parseInt(e.target.value) || 0
                            )
                        }
                        style={{ width: "60px", marginLeft: "10px" }}
                    />
                </label>
            </div>

            {/* Price info */}
            <div
                style={{
                    marginTop: "20px",
                    padding: "10px",
                    background: "#f0f0f0",
                }}
            >
                <div>
                    <strong>Total:</strong> ${total}
                </div>
                {discount > 0 && (
                    <div>
                        <strong>Discount ({discount}%):</strong> -$
                        {total - finalAmount}
                    </div>
                )}
                <div style={{ fontSize: "20px", marginTop: "10px" }}>
                    <strong>Final Amount:</strong> ${finalAmount}
                </div>
            </div>

            {/* Customer info */}
            <div style={{ marginTop: "20px" }}>
                <h3>Customer Information</h3>
                <input
                    name="customerName"
                    value={customerName}
                    onChange={form.handleFormChange}
                    placeholder="Name"
                    style={{ display: "block", marginBottom: "10px" }}
                />
                <input
                    name="customerEmail"
                    value={customerEmail}
                    onChange={form.handleFormChange}
                    placeholder="Email"
                    style={{ display: "block", marginBottom: "10px" }}
                />
            </div>

            {/* Order button */}
            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={form.submit}
                    disabled={form.isSubmitting || form.actions.isEmpty()}
                    style={{ marginRight: "10px" }}
                >
                    {form.isSubmitting ? "Submitting..." : "Place Order"}
                </button>
                <button onClick={form.actions.clearAll}>Clear Cart</button>
            </div>
        </div>
    );
}
```

**useForm Actions Use Cases:**

-   ✅ **Complex Calculations**: Total, discounted price, tax calculation logic
-   ✅ **Item Management**: Add, remove, quantity changes
-   ✅ **Validation Logic**: Complex validation before form submission
-   ✅ **Workflows**: Multi-step submission processes

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

// Component A: Define form logic and handlers
function UserFormEditor() {
    const form = useGlobalForm({
        formId: "user-form",
        initialValues: { name: "", email: "" },
        onValidate: async (values) => {
            // Email validation
            return values.email.includes("@");
        },
        onSubmit: async (values) => {
            // Actual submission logic
            await api.submitUser(values);
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

// Component B: Automatically shares same form data and handlers
function FormViewer() {
    const form = useGlobalForm({
        formId: "user-form", // Share both data and handlers with same ID
    });

    return (
        <div>
            <p>Current name: {form.useFormValue("name")}</p>
            <p>Current email: {form.useFormValue("email")}</p>
            <p>Modified: {form.isModified ? "Yes" : "No"}</p>

            {/* ✅ submit() works here too! */}
            {/* Automatically uses onValidate, onSubmit from Component A */}
            <button onClick={form.submit} disabled={form.isSubmitting}>
                Submit from elsewhere
            </button>
        </div>
    );
}
```

**Core Concepts:**

-   **Automatic handler sharing**: `onValidate`, `onSubmit`, `onComplete` registered first are shared globally
-   **Intuitive behavior**: Same `formId` shares both data and handlers as expected
-   **Submit anywhere**: Can call `submit()` from any component
-   **Consistent validation**: Same validation logic applies across all components

````

### Multi-Step Form

```typescript
// Step 1 Component: Basic info + set initial values
function Step1() {
    const form = useGlobalForm({
        formId: "user-registration",
        initialValues: { name: "", email: "", phone: "" }, // Set initial values here only
    });

    return (
        <TextField
            name="name"
            value={form.useFormValue("name")}
            onChange={form.handleFormChange}
        />
    );
}

// Step 2 Component: Share same form state (initialValues not needed)
function Step2() {
    const form = useGlobalForm({
        formId: "user-registration", // Share data with same ID
        // initialValues omitted - already created in Step1 (ignored even if provided)
    });

    return (
        <TextField
            name="email"
            value={form.useFormValue("email")}
            onChange={form.handleFormChange}
        />
    );
}

// Final step: Register validation and submission handlers (initialValues not needed)
function FinalStep() {
    const form = useGlobalForm({
        formId: "user-registration", // Same form state
        // initialValues omitted - already set in Step1 (ignored even if provided)
        onValidate: async (values) => {
            // Validate all fields
            return values.name && values.email && values.phone;
        },
        onSubmit: async (values) => {
            // Actual submission logic
            await api.registerUser(values);
        },
    });

    return (
        <div>
            <p>Name: {form.useFormValue("name")}</p>
            <p>Email: {form.useFormValue("email")}</p>
            <p>Phone: {form.useFormValue("phone")}</p>

            {/* Calling submit here executes onValidate and onSubmit above */}
            <button onClick={form.submit} disabled={form.isSubmitting}>
                Complete Registration
            </button>
        </div>
    );
}

// 💡 Pro tip: Can submit from other components too!
function QuickSubmitButton() {
    const form = useGlobalForm({
        formId: "user-registration", // Same ID
        // No handlers - automatically uses handlers registered in FinalStep
    });

    return (
        <button onClick={form.submit} disabled={form.isSubmitting}>
            Quick Register
        </button>
    );
}
````

**Key Points:**

-   ✅ **initialValues only first**: Set `initialValues` only in the first component that creates the global form
-   ✅ **Omit later**: Other components accessing the same `formId` don't need `initialValues`
-   ✅ **Handlers when needed**: Register `onSubmit`, `onValidate` etc. only in components that need them

````

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
````

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
        // initialValues omitted - already created in UserProfile (ignored even if provided)
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

## useModal Examples

The `useModal` hook provides modal state management with back button support for mobile environments.

### Basic Modal Usage

```typescript
import { useModal } from "@ehfuse/forma";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";

function UserProfileDialog() {
    const modal = useModal({
        onClose: () => {
            console.log("Modal closed");
        },
    });

    return (
        <>
            <button onClick={modal.open}>View Profile</button>

            <Dialog open={modal.isOpen} onClose={modal.close}>
                <DialogTitle>User Profile</DialogTitle>
                <DialogContent>
                    <p>Name: John Doe</p>
                    <p>Email: john@example.com</p>
                    <p>
                        Feature: Press back button on mobile
                        <br />
                        and only the modal closes (not the page)!
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={modal.close}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
```

#### Key Features

-   **Mobile Back Button Support**: Back button closes only the modal, not the page.
-   **Automatic Cleanup**: Modal is automatically removed from stack on component unmount.
-   **onClose Callback**: Called every time the modal closes.

### Nested Modal Management

```typescript
import { useModal } from "@ehfuse/forma";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

function NestedModalExample() {
    const firstModal = useModal();
    const secondModal = useModal();
    const thirdModal = useModal();

    return (
        <>
            <button onClick={firstModal.open}>Open First Modal</button>

            {/* First Modal */}
            <Dialog open={firstModal.isOpen} onClose={firstModal.close}>
                <DialogTitle>First Modal</DialogTitle>
                <DialogContent>
                    <p>Level 1 Modal</p>
                    <Button onClick={secondModal.open}>
                        Open Second Modal
                    </Button>
                </DialogContent>
            </Dialog>

            {/* Second Modal */}
            <Dialog open={secondModal.isOpen} onClose={secondModal.close}>
                <DialogTitle>Second Modal</DialogTitle>
                <DialogContent>
                    <p>Level 2 Modal</p>
                    <Button onClick={thirdModal.open}>Open Third Modal</Button>
                </DialogContent>
            </Dialog>

            {/* Third Modal */}
            <Dialog open={thirdModal.isOpen} onClose={thirdModal.close}>
                <DialogTitle>Third Modal</DialogTitle>
                <DialogContent>
                    <p>Level 3 Modal</p>
                    <p>
                        Press back button on mobile - modals close from last
                        opened.
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}
```

#### Nested Modal Behavior

1. Each time a modal opens, it's added to the global modal stack.
2. Back button press closes only the last opened modal.
3. Each modal is managed independently and automatically removed from stack on unmount.

### Modal with Form

```typescript
import { useModal, useForm } from "@ehfuse/forma";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

function EditUserModal({ userId, onSave }) {
    const modal = useModal({
        onClose: () => {
            // Reset form when modal closes
            form.reset();
        },
    });

    const form = useForm({
        initialValues: {
            name: "",
            email: "",
        },
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    const handleSubmit = () => {
        const values = form.getValues();
        onSave(values);
        modal.close();
    };

    return (
        <>
            <button onClick={modal.open}>Edit User Info</button>

            <Dialog open={modal.isOpen} onClose={modal.close}>
                <DialogTitle>Edit User Information</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => form.setValue("name", e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        value={email}
                        onChange={(e) => form.setValue("email", e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={modal.close}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
```

#### Form and Modal Integration

-   **Reset in onClose**: Form can be reset when modal closes.
-   **Close After Save**: Close modal with `modal.close()` after saving data.
-   **Back Button Safe**: On mobile, back button only closes modal without losing form data.

#### Important Note

To use `useModal`, wrap your app with `GlobalFormaProvider` at the top level:

```typescript
import { GlobalFormaProvider } from "@ehfuse/forma";

function App() {
    return (
        <GlobalFormaProvider>
            <YourApp />
        </GlobalFormaProvider>
    );
}
```

---

———

## useBreakpoint Examples

The `useBreakpoint` hook is used to implement responsive UI based on screen size. It enables building components that adapt to mobile, tablet, desktop, and other screen sizes.

### Responsive Basic Usage

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function ResponsiveNavigation() {
    const { smUp } = useBreakpoint();

    return (
        <header>
            {smUp ? (
                // Desktop: Horizontal navigation
                <nav>
                    <a href="/home">Home</a>
                    <a href="/about">About</a>
                    <a href="/contact">Contact</a>
                </nav>
            ) : (
                // Mobile: Hamburger menu
                <HamburgerMenu />
            )}
        </header>
    );
}
```

### Mobile/Desktop Branching

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function ProductPage() {
    const { xs, sm, mdUp } = useBreakpoint();

    // Use different layouts based on screen size
    if (xs) {
        return (
            <div>
                <MobileProductView />
                <MobileImageCarousel />
                <MobileReviews />
            </div>
        );
    }

    if (sm) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
                <TabletProductView />
                <TabletImageGallery />
                <TabletReviews />
            </div>
        );
    }

    // Desktop (md and up)
    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
            <div>
                <DesktopProductView />
                <DesktopImageGallery />
            </div>
            <div>
                <Sidebar>
                    <PriceInfo />
                    <AddToCart />
                </Sidebar>
            </div>
        </div>
    );
}
```

### Dynamic Layout

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function Dashboard() {
    const { xs, sm, md, mdUp, lgUp } = useBreakpoint();

    // Adjust grid columns based on screen size
    const columns = xs ? 1 : sm ? 2 : md ? 3 : 4;

    return (
        <div>
            <MainContent />

            {/* Show sidebar from medium size */}
            {mdUp && (
                <Sidebar>
                    <QuickStats />
                    <RecentActivity />
                </Sidebar>
            )}

            {/* Show additional panel only on large screens */}
            {lgUp && (
                <RightPanel>
                    <Notifications />
                    <Calendar />
                </RightPanel>
            )}

            <Grid container spacing={2}>
                {cards.map((card) => (
                    <Grid item xs={12 / columns} key={card.id}>
                        <Card {...card} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}
```

#### Image Gallery Example

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function ImageGallery({ images }) {
    const { xs, sm, md, lg, xlUp } = useBreakpoint();

    // Determine columns based on screen size
    const getColumns = () => {
        if (xs) return 1;
        if (sm) return 2;
        if (md) return 3;
        if (lg) return 4;
        if (xlUp) return 5;
        return 3; // default
    };

    const columns = getColumns();
    const columnWidth = `${100 / columns}%`;

    return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            {images.map((image) => (
                <div
                    key={image.id}
                    style={{
                        width: columnWidth,
                        padding: "8px",
                    }}
                >
                    <img
                        src={image.url}
                        alt={image.title}
                        style={{ width: "100%", height: "auto" }}
                    />
                </div>
            ))}
        </div>
    );
}
```

#### Responsive Font Sizes

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function Article({ title, content }) {
    const { xs, sm, mdUp } = useBreakpoint();

    const titleFontSize = xs ? "24px" : sm ? "32px" : "48px";
    const contentFontSize = xs ? "14px" : sm ? "16px" : "18px";
    const maxWidth = mdUp ? "800px" : "100%";

    return (
        <article style={{ maxWidth, margin: "0 auto", padding: "16px" }}>
            <h1 style={{ fontSize: titleFontSize }}>{title}</h1>
            <p style={{ fontSize: contentFontSize, lineHeight: 1.6 }}>
                {content}
            </p>
        </article>
    );
}
```

#### Conditional Component Rendering

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function VideoPlayer() {
    const { smUp, mdUp } = useBreakpoint();

    return (
        <div>
            <video controls>
                <source src="video.mp4" type="video/mp4" />
            </video>

            {/* Basic controls only on small screens */}
            {smUp && <VideoControls />}

            {/* Playlist from medium size */}
            {mdUp && <Playlist />}

            {/* Recommended videos on large screens */}
            {mdUp && <RecommendedVideos />}
        </div>
    );
}
```

#### Key Use Cases

1. **Navigation Patterns**: Horizontal menu on desktop, hamburger on mobile
2. **Layout Changes**: 1-column/2-column/3-column grid based on screen size
3. **Conditional Components**: Show sidebar/panels only on larger screens
4. **Dynamic Styling**: Adjust font sizes/spacing by screen size
5. **Content Optimization**: Use different components for mobile/desktop

#### Important Notes

-   Re-renders occur on window resize, so use with performance in mind.
-   For simple style changes, CSS media queries are more efficient.
-   Use when you need to show/hide components or make structural changes.

———

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
