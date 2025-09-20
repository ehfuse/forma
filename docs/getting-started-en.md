# Getting Started Guide

A step-by-step guide for developers new to Forma.

## Step 1: Installation and Setup

### NPM // 4. Using with options

const stateWithOptions = useFormaState(
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

## Step 2.5: General State Management (useFormaState)

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

### Array State Management and Length Subscription

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

### Nested Object State Management

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

## Step 3: Adding Form Validation

```tsx
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
            await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            alert("Registration completed!");
            form.resetForm(); // Reset form
        } catch (error) {
            alert("An error occurred during registration.");
        }
    },
});
```

## Step 4: Working with Nested Objects

```tsx
interface DetailedUserForm {
    personal: {
        name: string;
        age: number;
    };
    contact: {
        email: string;
        phone: string;
        address: {
            city: string;
            zipCode: string;
        };
    };
}

function DetailedForm() {
    const form = useForm<DetailedUserForm>({
        initialValues: {
            personal: { name: "", age: 0 },
            contact: {
                email: "",
                phone: "",
                address: { city: "", zipCode: "" },
            },
        },
    });

    // Access nested objects with dot notation
    const name = form.useFormValue("personal.name");
    const email = form.useFormValue("contact.email");
    const city = form.useFormValue("contact.address.city");

    return (
        <form onSubmit={form.submit}>
            <TextField
                name="personal.name"
                label="Name"
                value={name}
                onChange={form.handleFormChange}
            />

            <TextField
                name="contact.email"
                label="Email"
                value={email}
                onChange={form.handleFormChange}
            />

            <TextField
                name="contact.address.city"
                label="City"
                value={city}
                onChange={form.handleFormChange}
            />
        </form>
    );
}
```

## Step 5: Using Global Forms

### Provider Setup

```tsx
// App.tsx
import { GlobalFormProvider } from "@/forma";

function App() {
    return (
        <GlobalFormProvider>
            <Router>
                <Routes>
                    <Route path="/step1" element={<Step1 />} />
                    <Route path="/step2" element={<Step2 />} />
                    <Route path="/review" element={<ReviewStep />} />
                </Routes>
            </Router>
        </GlobalFormProvider>
    );
}
```

### Multi-Step Form Implementation

**Method 1: Using Type Definition (Recommended)**

```tsx
// Type definition
interface UserRegistrationData {
    personal: {
        name: string;
        email: string;
    };
    preferences: {
        newsletter: boolean;
    };
}

// Step1.tsx
function Step1() {
    const form = useGlobalForm<UserRegistrationData>({
        formId: "user-registration",
        initialValues: {
            personal: { name: "", email: "" },
            preferences: { newsletter: false },
        },
    });

    const name = form.useFormValue("personal.name");
    const email = form.useFormValue("personal.email");

    return (
        <div>
            <h2>Step 1: Basic Information</h2>
            <TextField
                name="personal.name"
                value={name}
                onChange={form.handleFormChange}
            />
            <TextField
                name="personal.email"
                value={email}
                onChange={form.handleFormChange}
            />
            <Button onClick={() => navigate("/step2")}>Next Step</Button>
        </div>
    );
}

// Step2.tsx
function Step2() {
    const form = useGlobalForm<UserRegistrationData>({
        formId: "user-registration", // Share state with same form ID
    });

    const newsletter = form.useFormValue("preferences.newsletter");

    return (
        <div>
            <h2>Step 2: Preferences</h2>
            <FormControlLabel
                control={
                    <Checkbox
                        name="preferences.newsletter"
                        checked={newsletter}
                        onChange={form.handleFormChange}
                    />
                }
                label="Subscribe to Newsletter"
            />
            <Button onClick={() => navigate("/review")}>Review</Button>
        </div>
    );
}
```

**Method 2: Using Inline Initial Values**

```tsx
// Step1.tsx
function Step1() {
    const form = useGlobalForm({
        formId: "user-registration", // Form ID to share
        initialValues: {
            personal: { name: "", email: "" },
            preferences: { newsletter: false },
        },
    });

    const name = form.useFormValue("personal.name");
    const email = form.useFormValue("personal.email");

    return (
        <div>
            <h2>Step 1: Basic Information</h2>
            <TextField
                name="personal.name"
                value={name}
                onChange={form.handleFormChange}
            />
            <TextField
                name="personal.email"
                value={email}
                onChange={form.handleFormChange}
            />
            <Button onClick={() => navigate("/step2")}>Next Step</Button>
        </div>
    );
}

// Step2.tsx
function Step2() {
    const form = useGlobalForm({
        formId: "user-registration", // Share state with same form ID
        initialValues: {
            personal: { name: "", email: "" },
            preferences: { newsletter: false },
        },
    });

    const newsletter = form.useFormValue("preferences.newsletter");

    return (
        <div>
            <h2>Step 2: Preferences</h2>
            <FormControlLabel
                control={
                    <Checkbox
                        name="preferences.newsletter"
                        checked={newsletter}
                        onChange={form.handleFormChange}
                    />
                }
                label="Subscribe to newsletter"
            />
            <Button onClick={() => navigate("/review")}>Review</Button>
        </div>
    );
}

// ReviewStep.tsx
function ReviewStep() {
    const form = useGlobalForm({
        formId: "user-registration", // Access same state
        onSubmit: async (values) => {
            await submitRegistration(values);
        },
    });

    const name = form.useFormValue("personal.name");
    const email = form.useFormValue("personal.email");
    const newsletter = form.useFormValue("preferences.newsletter");

    return (
        <div>
            <h2>Review and Submit</h2>
            <p>Name: {name}</p>
            <p>Email: {email}</p>
            <p>Newsletter: {newsletter ? "Subscribed" : "Not subscribed"}</p>

            <Button onClick={form.submit} variant="contained">
                Complete Registration
            </Button>
        </div>
    );
}
```

                Complete Registration
            </Button>
        </div>
    );

}

````

## Step 6: Advanced Features

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
````

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
    const expensiveValue = useMemo(() => {
        return calculateExpensiveValue(form.useFormValue("data"));
    }, [form.useFormValue("data")]);
    ```

You're now ready to use Forma! 🎉
