# Getting Started Guide

A step-by-step guide for developers new to Forma.

## Step 1: Installation and Setup

### NPM // 4. Using with options

const stateWithOptions = ## Step 4: Array State Management and Length Subscription

One of Forma's **core features** is optimizing performance by subscribing only to array length.FormaState(
{
data: {},
},
{
onChange: (values) => console.log("State changed:", values),
deepEquals: true, // Enable deep equality checking
}
);stallation

```bash
npm install @ehfuse/forma
# or
yarn add @ehfuse/forma
```

### Basic Import

```tsx
import {
    useForm,
    useFormaState,
    GlobalFormProvider,
    useGlobalForm,
} from "@ehfuse/forma";
```

## Step 2: Creating Your First Form

### Basic Form

```tsx
import React from "react";
import { TextField, Button } from "@mui/material";
import { useForm } from "@/forma";

interface UserForm {
    name: string;
    email: string;
}

function UserRegistration() {
    const form = useForm<UserForm>({
        initialValues: {
            name: "",
            email: "",
        },
        onValidate: async (values) => {
            // Name validation
            if (!values.name.trim()) {
                alert("Please enter your name.");
                return false;
            }

            // Email validation
            if (!values.email.includes("@")) {
                alert("Please enter a valid email address.");
                return false;
            }

            return true; // Validation passed
        },
        onSubmit: async (values) => {
            try {
                // Send data to server
                await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });

                alert("Registration completed!");
                return true; // Success
            } catch (error) {
                alert("An error occurred during registration.");
                return false; // Failure
            }
        },
    });

    // **Individual field subscription (performance optimization)**
    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <form onSubmit={form.submit}>
            <TextField
                name="name"
                label="Name"
                value={name}
                onChange={form.handleFormChange}
                fullWidth
                margin="normal"
            />

            <TextField
                name="email"
                label="Email"
                type="email"
                value={email}
                onChange={form.handleFormChange}
                fullWidth
                margin="normal"
            />

            <Button
                type="submit"
                variant="contained"
                disabled={form.isSubmitting}
                fullWidth
                sx={{ mt: 2 }}
            >
                {form.isSubmitting ? "Submitting..." : "Sign Up"}
            </Button>
        </form>
    );
}
```

## Step 3: General State Management (useFormaState)

You can also leverage Forma's **individual field subscription feature** for general state management beyond forms.

### useFormaState Declaration Methods

```tsx
import { useFormaState } from "@/forma";

// 1. Explicit type specification (recommended)
interface AppData {
    count: number;
    message: string;
}

const typedState = useFormaState<AppData>({
    count: 0,
    message: "Hello",
});

// 2. Basic usage with initial values
const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light" },
});
    message: "Hello",
});

// 3. Starting with empty object (for dynamic fields)
const dynamicState = useFormaState<Record<string, any>>();

// 4. With options
const stateWithOptions = useFormaState(
    {
        data: {},
    },
    {
        onChange: (values) => console.log("State changed:", values),
        deepEquals: true, // Enable deep equality checking
    }
);
```

## Step 4: Array State Management and Length Subscription

One of Forma's **key features** is optimizing performance by subscribing only to array length.

```tsx
const state = useFormaState({
    todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Learn Forma", completed: true },
    ],
});

// **🔥 Key Feature: Subscribe only to array length (re-renders only when items are added/removed)**
const todoCount = state.useValue("todos.length");

// **Subscribe to individual fields**
const firstTodoText = state.useValue("todos.0.text");
const firstTodoCompleted = state.useValue("todos.0.completed");
```

**Key Features:**

-   **`todos.length` subscription**: Counter updates only when items are added/removed
-   **`todos.${index}.field` subscription**: Only specific component re-renders when that item changes
-   **✅ When todos array changes, todos.length subscribers are automatically notified!**
-   **✅ Only array content changes (same length) - no notification to todos.length**

**📋 Detailed Examples and Performance Optimization:**

-   [TodoApp Example - Array State Management](./examples/todoapp-example-en.md)
-   [Performance Optimization and Best Practices](./performance-optimization-en.md)

## Step 5: Nested Object State Management

```tsx
import { useFormaState } from "@/forma";

interface UserProfile {
    personal: {
        name: string;
        email: string;
    };
    settings: {
        theme: "light" | "dark";
        notifications: boolean;
    };
}

function ProfileSettings() {
    const state = useFormaState<UserProfile>({
        personal: { name: "", email: "" },
        settings: { theme: "light", notifications: true },
    });

    // Individual subscription to nested fields using dot notation
    const name = state.useValue("personal.name");
    const theme = state.useValue("settings.theme");
    const notifications = state.useValue("settings.notifications");

    return (
        <div>
            <input
                value={name}
                onChange={(e) =>
                    state.setValue("personal.name", e.target.value)
                }
                placeholder="Name"
            />

            <button
                onClick={() =>
                    state.setValue(
                        "settings.theme",
                        theme === "light" ? "dark" : "light"
                    )
                }
            >
                Theme: {theme}
            </button>

            <label>
                <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) =>
                        state.setValue(
                            "settings.notifications",
                            e.target.checked
                        )
                    }
                />
                Enable notifications
            </label>
        </div>
    );
}
```

## Step 6: Using Global Forms

### Provider Setup

````tsx
## Step 6: Using Global Forms

When you need to share form state across multiple components, typically used for multi-step forms or complex forms.

### Basic Setup

```tsx
// App.tsx - Wrap with Provider
import { GlobalFormProvider } from "@/forma";

function App() {
    return (
        <GlobalFormProvider>
            <YourComponents />
        </GlobalFormProvider>
    );
}

// Use in components
interface UserForm {
    name: string;
    email: string;
}

function Step1() {
    const form = useGlobalForm<UserForm>({
        formId: "user-registration", // Unique ID for state sharing
        initialValues: { name: "", email: "" },
    });

    const name = form.useFormValue("name");
    // ... form logic
}
````

**📋 Detailed Global Form Examples:**

-   [Multi-Step Form Implementation Guide](./useGlobalForm-guide-en.md)

## 🎯 Next Steps

1. **[API Reference](./API-en.md)** - Complete API documentation
2. **[TodoApp Example](./examples/todoapp-example-en.md)** - Real-world array state management example
3. **[Performance Optimization Guide](./performance-optimization-en.md)** - Performance optimization and best practices

## Step 7: Advanced Features

Forma is compatible with various UI libraries. Here we'll explore examples using **Material-UI (MUI)** components.

> **📝 Note**: Currently, compatibility with MUI components has been verified, and compatibility with other UI libraries requires additional testing.

### Using DatePicker

```tsx
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function FormWithDate() {
    const form = useForm({
        initialValues: { birthDate: "" },
    });

    const birthDate = form.useFormValue("birthDate");

    return (
        <DatePicker
            label="Birth Date"
            value={birthDate}
            onChange={form.handleDatePickerChange("birthDate")}
        />
    );
}
```

### Using Select

```tsx
import { Select, MenuItem } from "@mui/material";

function FormWithSelect() {
    const form = useForm({
        initialValues: { category: "" },
    });

    const category = form.useFormValue("category");

    return (
        <Select
            name="category"
            value={category}
            onChange={form.handleFormChange}
        >
            <MenuItem value="A">Category A</MenuItem>
            <MenuItem value="B">Category B</MenuItem>
            <MenuItem value="C">Category C</MenuItem>
        </Select>
    );
}
```

## 🎯 Next Steps

1. **[API Reference](./API-en.md)** - Detailed API documentation
2. **[TodoApp Example](./examples/todoapp-example-en.md)** - Practical array state management example
3. **[Performance Optimization Guide](./performance-optimization-en.md)** - Performance optimization and best practices

## 💡 Performance Tips

1. **Use Individual Field Subscriptions**

    ```tsx
    // ✅ Recommended
    const name = form.useFormValue("name");

    // ❌ Not recommended (full re-rendering)
    const { name } = form.values;
    ```

2. **Conditional Subscriptions**

    ```tsx
    const conditionalValue = showField ? form.useFormValue("field") : "";
    ```

3. **Use Memoization**
    ```tsx

    ```

````

## 💡 Performance Tips

1. **Use Individual Field Subscription**

    ```tsx
    // ✅ Recommended
    const name = form.useFormValue("name");

    // ❌ Not recommended (full re-rendering)
    const { name } = form.values;
    ```

2. **Conditional Subscription**

    ```tsx
    const conditionalValue = showField ? form.useFormValue("field") : "";
    ```

3. **Use Memoization**
    ```tsx
    const expensiveValue = useMemo(() => {
        return calculateExpensiveValue(form.useFormValue("data"));
    }, [form.useFormValue("data")]);
    ```

You're now ready to use Forma! 🎉
````
