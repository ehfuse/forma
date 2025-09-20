# Getting Started with Forma# Getting Started Guide

A comprehensive guide to quickly get started with Forma, the high-performance React form and state management library.A step-by-step guide for developers new to Forma.

## Installation## Step 1: Installation and Setup

````bash### NPM // 4. Using with options

npm install @ehfuse/forma

```const stateWithOptions = ## Step 4: Array State Management and Length Subscription



```bashOne of Forma's **core features** is optimizing performance by subscribing only to array length.FormaState(

yarn add @ehfuse/forma{

```data: {},

},

## Quick Start{

onChange: (values) => console.log("State changed:", values),

### 1. Zero-Config FormdeepEquals: true, // Enable deep equality checking

}

The simplest way to get started:);stallation



```tsx```bash

import { useForm } from "@ehfuse/forma";npm install @ehfuse/forma

# or

function MyForm() {yarn add @ehfuse/forma

    const form = useForm<{ name: string; email: string }>();```



    return (### Basic Import

        <div>

            <input```tsx

                placeholder="Name"import {

                value={form.useFormValue("name") || ""}    useForm,

                onChange={(e) => form.setFormValue("name", e.target.value)}    useFormaState,

            />    GlobalFormProvider,

            <input    useGlobalForm,

                placeholder="Email"} from "@ehfuse/forma";

                value={form.useFormValue("email") || ""}```

                onChange={(e) => form.setFormValue("email", e.target.value)}

            />## Step 2: Creating Your First Form

            <button onClick={() => console.log(form.getFormValues())}>

                Log Values### Basic Form

            </button>

        </div>```tsx

    );import React from "react";

}import { TextField, Button } from "@mui/material";

```import { useForm } from "@/forma";



### 2. Form with Validation and Submissioninterface UserForm {

    name: string;

```tsx    email: string;

import { useForm } from "@ehfuse/forma";}



function ContactForm() {function UserRegistration() {

    const form = useForm({    const form = useForm<UserForm>({

        initialValues: { name: "", email: "", message: "" },        initialValues: {

        onValidate: async (values) => {            name: "",

            if (!values.name.trim()) {            email: "",

                alert("Please enter your name");        },

                return false;        onValidate: async (values) => {

            }            // Name validation

            if (!values.email.includes("@")) {            if (!values.name.trim()) {

                alert("Please enter a valid email");                alert("Please enter your name.");

                return false;                return false;

            }            }

            return true;

        },            // Email validation

        onSubmit: async (values) => {            if (!values.email.includes("@")) {

            console.log("Submitting:", values);                alert("Please enter a valid email address.");

            // API call here                return false;

            await submitForm(values);            }

        },

        onComplete: () => {            return true; // Validation passed

            alert("Form submitted successfully!");        },

        },        onSubmit: async (values) => {

    });            try {

                // Send data to server

    return (                await fetch("/api/users", {

        <form onSubmit={form.submit}>                    method: "POST",

            <input                    headers: { "Content-Type": "application/json" },

                name="name"                    body: JSON.stringify(values),

                placeholder="Name"                });

                value={form.useFormValue("name")}

                onChange={form.handleFormChange}                alert("Registration completed!");

            />                return true; // Success

            <input            } catch (error) {

                name="email"                alert("An error occurred during registration.");

                placeholder="Email"                return false; // Failure

                value={form.useFormValue("email")}            }

                onChange={form.handleFormChange}        },

            />    });

            <textarea

                name="message"    // **Individual field subscription (performance optimization)**

                placeholder="Message"    const name = form.useFormValue("name");

                value={form.useFormValue("message")}    const email = form.useFormValue("email");

                onChange={form.handleFormChange}

            />    return (

            <button type="submit" disabled={form.isSubmitting}>        <form onSubmit={form.submit}>

                {form.isSubmitting ? "Submitting..." : "Submit"}            <TextField

            </button>                name="name"

        </form>                label="Name"

    );                value={name}

}                onChange={form.handleFormChange}

```                fullWidth

                margin="normal"

### 3. State Management (Non-Form)            />



```tsx            <TextField

import { useFormaState } from "@ehfuse/forma";                name="email"

                label="Email"

function UserDashboard() {                type="email"

    const state = useFormaState({                value={email}

        user: { name: "John Doe", status: "online" },                onChange={form.handleFormChange}

        notifications: [],                fullWidth

        theme: "light",                margin="normal"

    });            />



    const userName = state.useValue("user.name");            <Button

    const theme = state.useValue("theme");                type="submit"

    const notificationCount = state.useValue("notifications.length");                variant="contained"

                disabled={form.isSubmitting}

    return (                fullWidth

        <div>                sx={{ mt: 2 }}

            <h1>Welcome, {userName}!</h1>            >

            <p>Theme: {theme}</p>                {form.isSubmitting ? "Submitting..." : "Sign Up"}

            <p>Notifications: {notificationCount}</p>            </Button>

                    </form>

            <button onClick={() => state.setValue("theme", "dark")}>    );

                Switch to Dark Theme}

            </button>```

            <button onClick={() => state.setValue("user.status", "away")}>

                Set Status to Away## Step 3: General State Management (useFormaState)

            </button>

        </div>You can also leverage Forma's **individual field subscription feature** for general state management beyond forms.

    );

}### useFormaState Declaration Methods

````

````tsx

### 4. Global State Sharingimport { useFormaState } from "@/forma";



```tsx// 1. Explicit type specification (recommended)

import { useGlobalFormaState, GlobalFormaProvider } from "@ehfuse/forma";interface AppData {

    count: number;

// Wrap your app    message: string;

function App() {}

    return (

        <GlobalFormaProvider>const typedState = useFormaState<AppData>({

            <UserProfile />    count: 0,

            <UserSettings />    message: "Hello",

        </GlobalFormaProvider>});

    );

}// 2. Basic usage with initial values

const state = useFormaState({

// Component 1    user: { name: "", email: "" },

function UserProfile() {    settings: { theme: "light" },

    const state = useGlobalFormaState({});

        stateId: "user-data",    message: "Hello",

        initialValues: { name: "", email: "" },});

    });

// 3. Starting with empty object (for dynamic fields)

    return (const dynamicState = useFormaState<Record<string, any>>();

        <div>

            <input// 4. With options

                value={state.useValue("name")}const stateWithOptions = useFormaState(

                onChange={(e) => state.setValue("name", e.target.value)}    {

                placeholder="Name"        data: {},

            />    },

        </div>    {

    );        onChange: (values) => console.log("State changed:", values),

}        deepEquals: true, // Enable deep equality checking

    }

// Component 2 - shares the same state);

function UserSettings() {```

    const state = useGlobalFormaState({

        stateId: "user-data", // Same ID = shared state## Step 4: Array State Management and Length Subscription

    });

One of Forma's **key features** is optimizing performance by subscribing only to array length.

    const userName = state.useValue("name"); // Value from UserProfile

```tsx

    return <div>Current user: {userName}</div>;const state = useFormaState({

}    todos: [

```        { id: 1, text: "Learn React", completed: false },

        { id: 2, text: "Learn Forma", completed: true },

## Core Concepts    ],

});

### Individual Field Subscriptions

// **🔥 Key Feature: Subscribe only to array length (re-renders only when items are added/removed)**

**The key to Forma's performance:**const todoCount = state.useValue("todos.length");



```tsx// **Subscribe to individual fields**

// ✅ Efficient - only re-renders when name changesconst firstTodoText = state.useValue("todos.0.text");

const name = form.useFormValue("name");const firstTodoCompleted = state.useValue("todos.0.completed");

````

// ❌ Inefficient - re-renders when any field changes

const values = form.values;**Key Features:**

const name = values.name;

```-   **`todos.length` subscription\*\*: Counter updates only when items are added/removed

-   **`todos.${index}.field` subscription**: Only specific component re-renders when that item changes

### Dot Notation for Nested Objects- **✅ When todos array changes, todos.length subscribers are automatically notified!**

-   **✅ Only array content changes (same length) - no notification to todos.length**

````tsx

const form = useForm({**📋 Detailed Examples and Performance Optimization:**

    initialValues: {

        user: {-   [TodoApp Example - Array State Management](./examples/todoapp-example-en.md)

            profile: {-   [Performance Optimization and Best Practices](./performance-optimization-en.md)

                name: "",

                address: { city: "", street: "" }## Step 5: Nested Object State Management

            }

        }```tsx

    }import { useFormaState } from "@/forma";

});

interface UserProfile {

// Access nested values directly    personal: {

const userName = form.useFormValue("user.profile.name");        name: string;

const city = form.useFormValue("user.profile.address.city");        email: string;

```    };

    settings: {

### Array Length Subscriptions        theme: "light" | "dark";

        notifications: boolean;

```tsx    };

const state = useFormaState({}

    todos: [

        { id: 1, text: "Learn React", completed: false },function ProfileSettings() {

        { id: 2, text: "Try Forma", completed: true },    const state = useFormaState<UserProfile>({

    ]        personal: { name: "", email: "" },

});        settings: { theme: "light", notifications: true },

    });

// ✅ Subscribe only to array length - re-renders only when items added/removed

const todoCount = state.useValue("todos.length");    // Individual subscription to nested fields using dot notation

    const name = state.useValue("personal.name");

// ✅ Subscribe to specific item - re-renders only when that item changes    const theme = state.useValue("settings.theme");

const firstTodo = state.useValue("todos.0.text");    const notifications = state.useValue("settings.notifications");

````

    return (

## Best Practices <div>

            <input

### 1. Component Separation value={name}

                onChange={(e) =>

`````tsx state.setValue("personal.name", e.target.value)

// ✅ Separate components for better performance                }

function NameField() {                placeholder="Name"

    const name = form.useFormValue("name");            />

    return <input value={name} onChange={form.handleFormChange} name="name" />;

}            <button

                onClick={() =>

function EmailField() {                    state.setValue(

    const email = form.useFormValue("email");                        "settings.theme",

    return <input value={email} onChange={form.handleFormChange} name="email" />;                        theme === "light" ? "dark" : "light"

}                    )

```                }

            >

### 2. Conditional Fields                Theme: {theme}

            </button>

```tsx

function ConditionalField({ showField }) {            <label>

    const value = showField ? form.useFormValue("optionalField") : "";                <input

                        type="checkbox"

    return showField ? (                    checked={notifications}

        <input value={value} onChange={form.handleFormChange} />                    onChange={(e) =>

    ) : null;                        state.setValue(

}                            "settings.notifications",

```                            e.target.checked

                        )

### 3. Dynamic Fields                    }

                />

```tsx                Enable notifications

function DynamicForm() {            </label>

    const state = useFormaState({});        </div>

        );

    const addField = (fieldName) => {}

        state.setValue(fieldName, "");```

    };

    ## Step 6: Using Global Forms

    const hasField = state.hasField("dynamicField");

    ### Provider Setup

    return (

        <div>````tsx

            {hasField ? (## Step 6: Using Global Forms

                <input

                    value={state.useValue("dynamicField")}When you need to share form state across multiple components, typically used for multi-step forms or complex forms.

                    onChange={(e) => state.setValue("dynamicField", e.target.value)}

                />### Basic Setup

            ) : (

                <button onClick={() => addField("dynamicField")}>```tsx

                    Add Field// App.tsx - Wrap with Provider

                </button>import { GlobalFormProvider } from "@/forma";

            )}

        </div>function App() {

    );    return (

}        <GlobalFormProvider>

```            <YourComponents />

        </GlobalFormProvider>

## Material-UI Integration    );

}

Forma works perfectly with MUI components:

// Use in components

```tsxinterface UserForm {

import { TextField, Select, MenuItem } from "@mui/material";    name: string;

    email: string;

function MUIForm() {}

    const form = useForm({

        initialValues: { name: "", category: "" }function Step1() {

    });    const form = useGlobalForm<UserForm>({

        formId: "user-registration", // Unique ID for state sharing

    return (        initialValues: { name: "", email: "" },

        <div>    });

            <TextField

                name="name"    const name = form.useFormValue("name");

                label="Name"    // ... form logic

                value={form.useFormValue("name")}}

                onChange={form.handleFormChange}````

            />

            <Select**📋 Detailed Global Form Examples:**

                name="category"

                value={form.useFormValue("category")}-   [Multi-Step Form Implementation Guide](./useGlobalForm-guide-en.md)

                onChange={form.handleFormChange}

            >## 🎯 Next Steps

                <MenuItem value="dev">Developer</MenuItem>

                <MenuItem value="design">Designer</MenuItem>1. **[API Reference](./API-en.md)** - Complete API documentation

            </Select>2. **[TodoApp Example](./examples/todoapp-example-en.md)** - Real-world array state management example

        </div>3. **[Performance Optimization Guide](./performance-optimization-en.md)** - Performance optimization and best practices

    );

}## Step 7: Advanced Features

`````

Forma is compatible with various UI libraries. Here we'll explore examples using **Material-UI (MUI)** components.

## Next Steps

> **📝 Note**: Currently, compatibility with MUI components has been verified, and compatibility with other UI libraries requires additional testing.

-   **[API Reference](./API-en.md)** - Complete API documentation

-   **[Examples Collection](./examples-en.md)** - Practical examples### Using DatePicker

-   **[Performance Guide](./performance-guide-en.md)** - Optimization techniques

-   **[Migration Guide](./migration-en.md)** - Migrate from other libraries```tsx
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
````

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
