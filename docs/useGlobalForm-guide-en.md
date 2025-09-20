# useGlobalForm Usage Guide

`useGlobalForm` is an advanced hook for sharing form data across multiple components. It's specifically designed for complex multi-step forms or form data management across multiple pages.

## Core Concepts

### Global Form Features

-   **Data Sharing**: All components using the same `formId` share identical form data
-   **Simplicity**: Just specify a `formId` and it's ready to use
-   **Independence**: Completely independent state management for each `formId`

### When to Use?

-   Multi-step forms (Step Forms)
-   Form data across multiple pages
-   When different components need access to the same form data
-   Managing parts of complex forms in separate components

## Basic Usage

### 1. Provider Setup

First, set up `GlobalFormaProvider` at the top level of your application:

````typescript
// App.tsx
import { GlobalFormaProvider } from '@ehfuse/forma';

function App() {
  return (
    <GlobalFormaProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </Router>
    </GlobalFormaProvider>
  );
}

### 2. Type Definition

If using TypeScript, define the form data type:

```typescript
// types/userForm.ts
interface UserFormData {
    // Personal information
    name: string;
    email: string;
    phone: string;

    // Address information
    address: {
        street: string;
        city: string;
        zipCode: string;
    };

    // Additional information
    preferences: string[];
    newsletter: boolean;
}
````

### 3. Registering Existing useForm to Global

You can register an existing local form to global state for sharing:

```typescript
import { useForm, useRegisterGlobalForm } from "@ehfuse/forma";

function LocalFormComponent() {
    // Create existing local form
    const form = useForm<UserFormData>({
        initialValues: {
            name: "",
            email: "",
            phone: "",
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
            console.log("Submit:", values);
        },
    });

    // Register local form as global form
    useRegisterGlobalForm("my-shared-form", form);

    return (
        <div>
            <h2>Local Form (Now shared globally)</h2>
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
                label="Name"
            />

            <TextField
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
                label="Email"
            />

            <button onClick={form.submit}>Submit</button>
        </div>
    );
}

function AnotherComponent() {
    // Access same global form by formId
    const form = useGlobalForm<UserFormData>({
        formId: "my-shared-form",
    });

    return (
        <div>
            <h2>Access same data from another component</h2>
            <p>Name: {form.useFormValue("name")}</p>
            <p>Email: {form.useFormValue("email")}</p>

            {/* Changes here sync with above component */}
            <TextField
                name="phone"
                value={form.useFormValue("phone")}
                onChange={form.handleFormChange}
                label="Phone"
            />
        </div>
    );
}
```

### 4. Basic Usage

```typescript
// Step1.tsx - Personal information input
import { useGlobalForm } from "@ehfuse/forma";

function Step1() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    return (
        <div>
            <h2>Step 1: Personal Information</h2>
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
                label="Name"
            />

            <TextField
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
                label="Email"
            />

            <TextField
                name="phone"
                value={form.useFormValue("phone")}
                onChange={form.handleFormChange}
                label="Phone"
            />
        </div>
    );
}
```

```typescript
// Step2.tsx - Address information input
import { useGlobalForm } from "@ehfuse/forma";

function Step2() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration", // Same formId
    });

    return (
        <div>
            <h2>Step 2: Address Information</h2>
            <TextField
                name="address.street"
                value={form.useFormValue("address.street")}
                onChange={form.handleFormChange}
                label="Street Address"
            />

            <TextField
                name="address.city"
                value={form.useFormValue("address.city")}
                onChange={form.handleFormChange}
                label="City"
            />

            <TextField
                name="address.zipCode"
                value={form.useFormValue("address.zipCode")}
                onChange={form.handleFormChange}
                label="ZIP Code"
            />
        </div>
    );
}
```

```typescript
// Step3.tsx - Final confirmation and submission
import { useGlobalForm } from "@ehfuse/forma";

function Step3() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    const handleSubmit = async () => {
        // Form validation
        const isValid = await form.validateForm();
        if (!isValid) {
            alert("Please check your input.");
            return;
        }

        // Data submission
        const formData = form.getFormValues();
        try {
            await submitUserRegistration(formData);
            alert("Registration completed!");
        } catch (error) {
            alert("An error occurred during registration.");
        }
    };

    return (
        <div>
            <h2>Step 3: Final Confirmation</h2>

            {/* Display entered data */}
            <div>
                <h3>Personal Information</h3>
                <p>Name: {form.useFormValue("name")}</p>
                <p>Email: {form.useFormValue("email")}</p>
                <p>Phone: {form.useFormValue("phone")}</p>
            </div>

            <div>
                <h3>Address Information</h3>
                <p>Address: {form.useFormValue("address.street")}</p>
                <p>City: {form.useFormValue("address.city")}</p>
                <p>ZIP Code: {form.useFormValue("address.zipCode")}</p>
            </div>

            <button onClick={handleSubmit}>Complete Registration</button>
        </div>
    );
}
```

## Advanced Usage

### 1. Setting Initial Data

You can set initial data in the first component:

```typescript
function UserFormInit() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    useEffect(() => {
        // Set initial data
        form.setFormValues({
            name: "",
            email: "",
            phone: "",
            address: {
                street: "",
                city: "",
                zipCode: "",
            },
            preferences: [],
            newsletter: false,
        });
    }, []);

    return <Step1 />;
}
```

### 2. Pre-loading Data

You can also load and set data from a server:

```typescript
function EditUserForm({ userId }: { userId: string }) {
    const form = useGlobalForm<UserFormData>({
        formId: `user-edit-${userId}`,
    });

    useEffect(() => {
        async function loadUserData() {
            try {
                const userData = await fetchUser(userId);
                form.setFormValues(userData);
            } catch (error) {
                console.error("Failed to load user data:", error);
            }
        }

        loadUserData();
    }, [userId]);

    return <UserEditSteps />;
}
```

### 3. Direct Store Access

For advanced users, you can directly access the global store:

```typescript
function AdvancedGlobalForm() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    // Direct access to global store
    const store = form._store;

    // Use the same store in another useForm hook
    const localForm = useForm<UserFormData>({
        initialValues: {} as UserFormData,
        _externalStore: store, // Share the same store
    });

    // Now form and localForm share the same data
    return (
        <div>
            <h3>Global Form Data</h3>
            <p>Name: {form.useFormValue("name")}</p>

            <h3>Same Data from Local Form</h3>
            <p>Name: {localForm.useFormValue("name")}</p>

            {/* Changing either one updates both */}
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
                label="Change from Global Form"
            />

            <TextField
                name="name"
                value={localForm.useFormValue("name")}
                onChange={localForm.handleFormChange}
                label="Change from Local Form"
            />
        </div>
    );
}
```

### 4. Conditional Validation

You can perform validation only at specific steps:

```typescript
function Step1Validation() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    const validateStep1 = () => {
        const name = form.getFormValue("name");
        const email = form.getFormValue("email");

        if (!name || name.length < 2) {
            alert("Please enter a name with at least 2 characters.");
            return false;
        }

        if (!email || !email.includes("@")) {
            alert("Please enter a valid email.");
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            // Move to next step
            router.push("/step2");
        }
    };

    return (
        <div>
            {/* Form inputs */}
            <button onClick={handleNext}>Next Step</button>
        </div>
    );
}
```

### 4. Real-time Data Synchronization

Data is synchronized in real-time across multiple components:

```typescript
// Left panel - Data input
function LeftPanel() {
    const form = useGlobalForm<UserFormData>({ formId: "shared-form" });

    return (
        <div>
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
        </div>
    );
}

// Right panel - Real-time preview
function RightPanel() {
    const form = useGlobalForm<UserFormData>({ formId: "shared-form" });

    return (
        <div>
            <h3>Preview</h3>
            <p>Name: {form.useFormValue("name")}</p> {/* Real-time updates */}
        </div>
    );
}
```

## Best Practices

### 1. formId Naming Convention

```typescript
// ✅ Good examples - Clear and specific names
const form = useGlobalForm({ formId: "user-registration" }); // User registration form
const form = useGlobalForm({ formId: "product-edit-123" }); // Specific product edit form
const form = useGlobalForm({ formId: "order-checkout" }); // Order checkout form

// ❌ Avoid these - Vague and generic names
const form = useGlobalForm({ formId: "form1" }); // Unclear what this form does
const form = useGlobalForm({ formId: "data" }); // Too generic, high collision risk
```

**Good formId characteristics:**

-   **Specific**: Clearly expresses the form's purpose
-   **Unique**: Doesn't conflict with other forms
-   **Consistent**: Uses unified naming conventions within the team
-   **Descriptive**: Easy for code readers to understand

**Problems with bad formIds:**

-   **Ambiguous**: Makes maintenance difficult due to unclear purpose
-   **Collision risk**: Generic names can cause data conflicts
-   **Debugging difficulty**: Hard to identify issues when problems occur

### 2. Type Safety

```typescript
// ✅ Explicitly specify types
const form = useGlobalForm<UserFormData>({ formId: "user-form" });

// ❌ Avoid using any
const form = useGlobalForm<any>({ formId: "user-form" });
```

### 3. Memory Management

Global forms are not automatically cleaned up, so manual cleanup may be necessary:

```typescript
function MultiStepForm() {
    const form = useGlobalForm<UserFormData>({ formId: "temp-form" });

    useEffect(() => {
        return () => {
            // Clean up form data on component unmount
            form.resetForm();
        };
    }, []);

    return <FormSteps />;
}
```

## Precautions

### 1. Prevent formId Conflicts

-   Use unique `formId`s within the same application
-   Include user ID or timestamp for dynamic IDs when needed

### 2. Prevent Memory Leaks

-   Call `resetForm()` after using temporary forms
-   Be especially careful in single-page applications

### 3. Type Consistency

-   Use the same type across all components
-   Check all related components when form structure changes

## Related Documentation

-   [API Reference](./API-en.md#useglobalform)
-   [Getting Started](./getting-started-en.md)
-   [Best Practices](./best-practices-en.md)
