# Getting Started Guide

A step-by-step guide for developers new to Forma.

## Step 1: Installation and Setup

### Using in Current Project

```tsx
// Currently for use in local projects
import { useForm, useGlobalForm, GlobalFormProvider } from "@/forma";
```

### Future NPM Package Installation (Coming Soon)

```bash
npm install @ehfuse/forma
# or
yarn add @ehfuse/forma
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
        onSubmit: async (values) => {
            // Send data to server
            console.log("Submitted data:", values);
        },
    });

    // Individual field subscription (performance optimization)
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

            <Button type="submit" variant="contained" disabled={form.isSubmitting} fullWidth sx={{ mt: 2 }}>
                {form.isSubmitting ? "Submitting..." : "Sign Up"}
            </Button>
        </form>
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
            <TextField name="personal.name" label="Name" value={name} onChange={form.handleFormChange} />

            <TextField name="contact.email" label="Email" value={email} onChange={form.handleFormChange} />

            <TextField name="contact.address.city" label="City" value={city} onChange={form.handleFormChange} />
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
            <TextField name="personal.name" value={name} onChange={form.handleFormChange} />
            <TextField name="personal.email" value={email} onChange={form.handleFormChange} />
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
                    <Checkbox name="preferences.newsletter" checked={newsletter} onChange={form.handleFormChange} />
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
        initialValues: {
            personal: { name: "", email: "" },
            preferences: { newsletter: false },
        },
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

## Step 6: Advanced Features

### Using DatePicker

```tsx
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function FormWithDate() {
    const form = useForm({
        initialValues: { birthDate: "" },
    });

    const birthDate = form.useFormValue("birthDate");

    return <DatePicker label="Birth Date" value={birthDate} onChange={form.handleDatePickerChange("birthDate")} />;
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
        <Select name="category" value={category} onChange={form.handleFormChange}>
            <MenuItem value="A">Category A</MenuItem>
            <MenuItem value="B">Category B</MenuItem>
            <MenuItem value="C">Category C</MenuItem>
        </Select>
    );
}
```

## 🎯 Next Steps

1. **[API Reference](./API.md)** - Detailed API documentation
2. **[Example Code](../examples/)** - More practical examples
3. **[Troubleshooting](./README-en.md#troubleshooting)** - Common issues and solutions

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
