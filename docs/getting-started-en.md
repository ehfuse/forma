# Getting Started

A step-by-step guide for developers new to Forma.

## Step 1: Installation and Setup

### Install NPM Package

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

### Using Minified Bundle (Optimized for Production)

Forma provides minified bundles for smaller bundle sizes:

```tsx
// Use minified bundle (11-13% smaller)
import {
    useForm,
    useFormaState,
    GlobalFormProvider,
    useGlobalForm,
} from "@ehfuse/forma/min";
```

**Bundle Size Comparison:**

| Format | Standard | Minified | Reduction |
|--------|----------|----------|-----------|
| CommonJS | 6.3 KB | 5.6 KB | 11% |
| ESM | 3.1 KB | 2.7 KB | 13% |

**In package.json:**
```json
{
    "dependencies": {
        "@ehfuse/forma": "^1.8.0"
    }
}
```

**Dynamic Import (Recommended for Code Splitting):**
```tsx
// Lazy load minified bundle
const { useForm } = await import("@ehfuse/forma/min");
```

## Step 2: Create Your First Form

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
                {form.isSubmitting ? "Submitting..." : "Register"}
            </Button>
        </form>
    );
}
```

## Step 3: General State Management (useFormaState)

You can use Forma's **individual field subscription feature** for general state management beyond forms.

### How to Declare useFormaState

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

// 2. Basic usage - with initial values
const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light" },
});

// 3. Start with an empty object (dynamic field addition)
const dynamicState = useFormaState<Record<string, any>>();

// 4. Use with options
const stateWithOptions = useFormaState(
    {
        data: {},
    },
    {
        onChange: (values) => console.log("State changed:", values),
        deepEquals: true, // Enable deep equality check
    }
);
```

## Step 4: Array State Management and Length Subscription

One of Forma's **core features** is optimizing performance by subscribing only to array length.

```tsx
const state = useFormaState({
    todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Learn Forma", completed: true },
    ],
});

// **🔥 Key: Subscribe only to array length (re-render only when items are added/deleted)**
const todoCount = state.useValue("todos.length");

// **Individual field subscription**
const firstTodoText = state.useValue("todos.0.text");
const firstTodoCompleted = state.useValue("todos.0.completed");
```

**Key Features:**

-   **`todos.length` subscription**: Counter updates only when items are added/deleted
-   **`todos.${index}.field` subscription**: Only the component with that specific item re-renders
-   **✅ When todos array changes, todos.length subscribers are automatically notified!**
-   **✅ When only array contents change (length stays the same) - todos.length doesn't notify**

**�� Detailed Examples and Performance Optimization:**

-   [TodoApp Example - Array State Management](./examples/todoapp-example-en.md)
-   [Performance Optimization Guide](./performance-guide-en.md)
-   [Performance Optimization Warnings](./performance-warnings-en.md)

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

    // Subscribe to nested fields using dot notation
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
                Receive Notifications
            </label>
        </div>
    );
}
```

## Step 6: Using Global Forms

Use this when you need to share form state across multiple components. Commonly used in multi-step forms or complex forms.

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
        formId: "user-registration", // Share state with unique ID
        initialValues: { name: "", email: "" },
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <div>
            <input
                value={name}
                onChange={(e) => form.setFormValue("name", e.target.value)}
                placeholder="Name"
            />
            <input
                value={email}
                onChange={(e) => form.setFormValue("email", e.target.value)}
                placeholder="Email"
            />
        </div>
    );
}

// Retrieve the form registered in Step1 from another component
function Step2() {
    const form = useGlobalForm<UserForm>({
        formId: "user-registration", // Retrieve form from Step1 with same ID
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <div>
            <h2>Confirmation Page</h2>
            <p>Name: {name}</p>
            <p>Email: {email}</p>
            <button onClick={() => form.submit()}>Submit</button>
        </div>
    );
}
```

### ⚠️ Important: initialValues Behavior

When using the same `formId`, **`initialValues` is only applied on the first call**.

```tsx
// First call - initialValues applied
const form1 = useGlobalForm<UserForm>({
    formId: "user-registration",
    initialValues: { name: "", email: "" }, // ✅ Applied
});

// Second call - initialValues ignored
const form2 = useGlobalForm<UserForm>({
    formId: "user-registration",
    initialValues: { name: "james", email: "" }, // ❌ Ignored (store already created)
});
```

**Result:**

-   `form1` and `form2` share the **same store**
-   `form2`'s `initialValues` are ignored
-   Store data is maintained from the first call's `initialValues`

**To use different initial values, use different `formId`:**

```tsx
const form1 = useGlobalForm<UserForm>({
    formId: "user-registration-1", // Different ID
    initialValues: { name: "", email: "" },
});

const form2 = useGlobalForm<UserForm>({
    formId: "user-registration-2", // Different ID
    initialValues: { name: "james", email: "" }, // ✅ Applied
});
```

### How to Change initialValues

To reset form values that have already been created, use the `setInitialFormValues()` method:

```tsx
const form = useGlobalForm<UserForm>({
    formId: "user-registration",
    initialValues: { name: "", email: "" },
});

// Reset form values later
function resetFormValues() {
    form.setInitialFormValues({
        name: "john",
        email: "john@example.com",
    });
}

// Update a specific field
function updateName() {
    form.setFormValue("name", "jane");
}

// Update multiple fields at once
function updateMultiple() {
    form.setValues({
        name: "bob",
        email: "bob@example.com",
    });
}
```

**📋 Detailed Global Form Examples:**

-   [Multi-Step Form Implementation Guide](./useGlobalForm-guide-en.md)

## Step 7: Advanced Features

Forma is compatible with various UI libraries. Here we'll look at examples using **Material-UI (MUI)** components.

> **Note**: MUI component compatibility is currently verified, and compatibility with other UI libraries requires additional testing.

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
            label="Date of Birth"
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

## 💡 Performance Tips

1. **Use individual field subscription**

    ```tsx
    // ✅ Recommended
    const name = form.useFormValue("name");

    // ❌ Not recommended (full re-render)
    const { name } = form.values;
    ```

2. **Conditional subscription**

    ```tsx
    const conditionalValue = showField ? form.useFormValue("field") : "";
    ```

3. **Use memoization**
    ```tsx
    const expensiveValue = useMemo(() => {
        return calculateExpensiveValue(form.useFormValue("data"));
    }, [form.useFormValue("data")]);
    ```

You're all set to use Forma! 🎉

## Related Documentation

-   **[API Reference](./API-en.md)** - Detailed API documentation
-   **[Examples](./examples-en.md)** - Practical usage examples
-   **[Performance Optimization Guide](./performance-guide-en.md)** - Performance optimization methods
-   **[Performance Optimization Warnings](./performance-warnings-en.md)** - Anti-patterns and cautions
-   **[Migration Guide](./migration-en.md)** - Migrating from other libraries
-   **[useGlobalForm Guide](./useGlobalForm-guide-en.md)** - Global form state management
-   **[Global Hooks Comparison Guide](./global-hooks-comparison-en.md)** - Differences between global hooks
-   **[Library Comparison Guide](./library-comparison-en.md)** - Comparison with other state management libraries
