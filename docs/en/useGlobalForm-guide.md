# useGlobalForm Guide# useGlobalForm Usage Guide

Complete guide to using Forma's global form state management.`useGlobalForm` is an advanced hook for sharing form data across multiple components. It's specifically designed for complex multi-step forms or form data management across multiple pages.

## Overview## Core Concepts

`useGlobalForm` allows you to share form state across multiple components, making it perfect for multi-step forms, wizard interfaces, and complex form flows.### Global Form Features

## Basic Usage- **Data Sharing**: All components using the same `formId` share identical form data

-   **Simplicity**: Just specify a `formId` and it's ready to use

### Simple Global Form- **Independence**: Completely independent state management for each `formId`

`````tsx### When to Use?

// Component A

function UserInfoStep() {-   Multi-step forms (Step Forms)

    const form = useGlobalForm({-   Form data across multiple pages

        formId: "user-registration",-   When different components need access to the same form data

        initialValues: { name: "", email: "", phone: "" }-   Managing parts of complex forms in separate components

    });

## Basic Usage

    return (

        <div>### 1. Provider Setup

            <input

                name="name"First, set up `GlobalFormaProvider` at the top level of your application:

                value={form.useFormValue("name")}

                onChange={form.handleFormChange}````typescript

                placeholder="Name"// App.tsx

            />import { GlobalFormaProvider } from '@ehfuse/forma';

            <input

                name="email"function App() {

                value={form.useFormValue("email")}  return (

                onChange={form.handleFormChange}    <GlobalFormaProvider>

                placeholder="Email"      <Router>

            />        <Routes>

        </div>          <Route path="/" element={<HomePage />} />

    );          <Route path="/checkout" element={<CheckoutPage />} />

}        </Routes>

      </Router>

// Component B - shares the same form state    </GlobalFormaProvider>

function ContactInfoStep() {  );

    const form = useGlobalForm({}

        formId: "user-registration", // Same ID = shared state

    });### 2. Type Definition



    return (If using TypeScript, define the form data type:

        <div>

            <input```typescript

                name="phone"// types/userForm.ts

                value={form.useFormValue("phone")}interface UserFormData {

                onChange={form.handleFormChange}    // Personal information

                placeholder="Phone"    name: string;

            />    email: string;

            <p>Name: {form.useFormValue("name")}</p> {/* From Component A */}    phone: string;

        </div>

    );    // Address information

}    address: {

```        street: string;

        city: string;

## Advanced Features        zipCode: string;

    };

### With Validation and Submission

    // Additional information

```tsx    preferences: string[];

function FinalStep() {    newsletter: boolean;

    const form = useGlobalForm({}

        formId: "user-registration",````

        onValidate: async (values) => {

            if (!values.name || !values.email || !values.phone) {### 3. Registering Existing useForm to Global

                alert("Please fill all required fields");

                return false;You can register an existing local form to global state for sharing:

            }

            ```typescript

            // Email validationimport { useForm, useRegisterGlobalForm } from "@ehfuse/forma";

            if (!values.email.includes("@")) {

                alert("Please enter a valid email");function LocalFormComponent() {

                return false;    // Create existing local form

            }    const form = useForm<UserFormData>({

                    initialValues: {

            return true;            name: "",

        },            email: "",

        onSubmit: async (values) => {            phone: "",

            console.log("Submitting user registration:", values);        },

            await registerUser(values);        onValidate: async (values) => {

        },            // Name validation

        onComplete: () => {            if (!values.name.trim()) {

            alert("Registration completed successfully!");                alert("Please enter your name.");

            // Redirect to dashboard                return false;

        }            }

    });

            // Email validation

    return (            if (!values.email.includes("@")) {

        <div>                alert("Please enter a valid email address.");

            <h3>Review Your Information</h3>                return false;

            <p>Name: {form.useFormValue("name")}</p>            }

            <p>Email: {form.useFormValue("email")}</p>

            <p>Phone: {form.useFormValue("phone")}</p>            return true; // Validation passed

                    },

            <button         onSubmit: async (values) => {

                onClick={form.submit}             console.log("Submit:", values);

                disabled={form.isSubmitting}        },

            >    });

                {form.isSubmitting ? "Submitting..." : "Complete Registration"}

            </button>    // Register local form as global form

        </div>    useRegisterGlobalForm("my-shared-form", form);

    );

}    return (

```        <div>

            <h2>Local Form (Now shared globally)</h2>

### Automatic Memory Management            <TextField

                name="name"

```tsx                value={form.useFormValue("name")}

function WizardStep1() {                onChange={form.handleFormChange}

    const form = useGlobalForm({                label="Name"

        formId: "wizard-form",            />

        autoCleanup: true, // Default - automatic cleanup when no components use it

        initialValues: { step1Data: "" }            <TextField

    });                name="email"

                value={form.useFormValue("email")}

    return <input name="step1Data" value={form.useFormValue("step1Data")} />;                onChange={form.handleFormChange}

}                label="Email"

            />

function PersistentForm() {

    const form = useGlobalForm({            <button onClick={form.submit}>Submit</button>

        formId: "persistent-form",        </div>

        autoCleanup: false, // Manual cleanup required    );

        initialValues: { importantData: "" }}

    });

function AnotherComponent() {

    return <input name="importantData" value={form.useFormValue("importantData")} />;    // Access same global form by formId

}    const form = useGlobalForm<UserFormData>({

```        formId: "my-shared-form",

    });

## Real-World Examples

    return (

### Multi-Step User Registration        <div>

            <h2>Access same data from another component</h2>

```tsx            <p>Name: {form.useFormValue("name")}</p>

// Step 1: Personal Information            <p>Email: {form.useFormValue("email")}</p>

function PersonalInfoStep({ onNext }) {

    const form = useGlobalForm({            {/* Changes here sync with above component */}

        formId: "registration-wizard",            <TextField

        initialValues: {                name="phone"

            personal: { firstName: "", lastName: "", email: "" },                value={form.useFormValue("phone")}

            address: { street: "", city: "", zipCode: "" },                onChange={form.handleFormChange}

            preferences: { newsletter: false, theme: "light" }                label="Phone"

        }            />

    });        </div>

    );

    const firstName = form.useFormValue("personal.firstName");}

    const lastName = form.useFormValue("personal.lastName");```

    const email = form.useFormValue("personal.email");

### 4. Basic Usage

    const handleNext = () => {

        if (firstName && lastName && email) {```typescript

            onNext();// Step1.tsx - Personal information input

        } else {import { useGlobalForm } from "@ehfuse/forma";

            alert("Please fill all required fields");

        }function Step1() {

    };    const form = useGlobalForm<UserFormData>({

        formId: "user-registration",

    return (    });

        <div>

            <h2>Personal Information</h2>    return (

            <input        <div>

                name="personal.firstName"            <h2>Step 1: Personal Information</h2>

                value={firstName}            <TextField

                onChange={form.handleFormChange}                name="name"

                placeholder="First Name"                value={form.useFormValue("name")}

            />                onChange={form.handleFormChange}

            <input                label="Name"

                name="personal.lastName"            />

                value={lastName}

                onChange={form.handleFormChange}            <TextField

                placeholder="Last Name"                name="email"

            />                value={form.useFormValue("email")}

            <input                onChange={form.handleFormChange}

                name="personal.email"                label="Email"

                value={email}            />

                onChange={form.handleFormChange}

                placeholder="Email"            <TextField

            />                name="phone"

            <button onClick={handleNext}>Next</button>                value={form.useFormValue("phone")}

        </div>                onChange={form.handleFormChange}

    );                label="Phone"

}            />

        </div>

// Step 2: Address Information    );

function AddressStep({ onNext, onPrev }) {}

    const form = useGlobalForm({```

        formId: "registration-wizard" // Same form state

    });```typescript

// Step2.tsx - Address information input

    const street = form.useFormValue("address.street");import { useGlobalForm } from "@ehfuse/forma";

    const city = form.useFormValue("address.city");

    const zipCode = form.useFormValue("address.zipCode");function Step2() {

    const form = useGlobalForm<UserFormData>({

    return (        formId: "user-registration", // Same formId

        <div>    });

            <h2>Address Information</h2>

            <input    return (

                name="address.street"        <div>

                value={street}            <h2>Step 2: Address Information</h2>

                onChange={form.handleFormChange}            <TextField

                placeholder="Street Address"                name="address.street"

            />                value={form.useFormValue("address.street")}

            <input                onChange={form.handleFormChange}

                name="address.city"                label="Street Address"

                value={city}            />

                onChange={form.handleFormChange}

                placeholder="City"            <TextField

            />                name="address.city"

            <input                value={form.useFormValue("address.city")}

                name="address.zipCode"                onChange={form.handleFormChange}

                value={zipCode}                label="City"

                onChange={form.handleFormChange}            />

                placeholder="ZIP Code"

            />            <TextField

            <button onClick={onPrev}>Previous</button>                name="address.zipCode"

            <button onClick={onNext}>Next</button>                value={form.useFormValue("address.zipCode")}

        </div>                onChange={form.handleFormChange}

    );                label="ZIP Code"

}            />

        </div>

// Step 3: Preferences and Review    );

function ReviewStep({ onPrev }) {}

    const form = useGlobalForm({```

        formId: "registration-wizard",

        onValidate: async (values) => {```typescript

            // Final validation before submission// Step3.tsx - Final confirmation and submission

            const { personal, address } = values;import { useGlobalForm } from "@ehfuse/forma";

            return personal.firstName && personal.email && address.city;

        },function Step3() {

        onSubmit: async (values) => {    const form = useGlobalForm<UserFormData>({

            await submitRegistration(values);        formId: "user-registration",

        },    });

        onComplete: () => {

            alert("Registration successful!");    const handleSubmit = async () => {

        }        // Form validation

    });        const isValid = await form.validateForm();

        if (!isValid) {

    const newsletter = form.useFormValue("preferences.newsletter");            alert("Please check your input.");

    const theme = form.useFormValue("preferences.theme");            return;

            }

    // Access data from previous steps

    const fullName = `${form.useFormValue("personal.firstName")} ${form.useFormValue("personal.lastName")}`;        // Data submission

    const email = form.useFormValue("personal.email");        const formData = form.getFormValues();

    const fullAddress = `${form.useFormValue("address.street")}, ${form.useFormValue("address.city")} ${form.useFormValue("address.zipCode")}`;        try {

            await submitUserRegistration(formData);

    return (            alert("Registration completed!");

        <div>        } catch (error) {

            <h2>Preferences & Review</h2>            alert("An error occurred during registration.");

                    }

            <div>    };

                <label>

                    <input    return (

                        type="checkbox"        <div>

                        name="preferences.newsletter"            <h2>Step 3: Final Confirmation</h2>

                        checked={newsletter}

                        onChange={form.handleFormChange}            {/* Display entered data */}

                    />            <div>

                    Subscribe to newsletter                <h3>Personal Information</h3>

                </label>                <p>Name: {form.useFormValue("name")}</p>

            </div>                <p>Email: {form.useFormValue("email")}</p>

                            <p>Phone: {form.useFormValue("phone")}</p>

            <div>            </div>

                <label>Theme:</label>

                <select            <div>

                    name="preferences.theme"                <h3>Address Information</h3>

                    value={theme}                <p>Address: {form.useFormValue("address.street")}</p>

                    onChange={form.handleFormChange}                <p>City: {form.useFormValue("address.city")}</p>

                >                <p>ZIP Code: {form.useFormValue("address.zipCode")}</p>

                    <option value="light">Light</option>            </div>

                    <option value="dark">Dark</option>

                </select>            <button onClick={handleSubmit}>Complete Registration</button>

            </div>        </div>

    );

            <div>}

                <h3>Review Your Information:</h3>```

                <p><strong>Name:</strong> {fullName}</p>

                <p><strong>Email:</strong> {email}</p>## Advanced Usage

                <p><strong>Address:</strong> {fullAddress}</p>

                <p><strong>Newsletter:</strong> {newsletter ? "Yes" : "No"}</p>### 1. Setting Initial Data

                <p><strong>Theme:</strong> {theme}</p>

            </div>You can set initial data in the first component:



            <button onClick={onPrev}>Previous</button>```typescript

            <button function UserFormInit() {

                onClick={form.submit}    const form = useGlobalForm<UserFormData>({

                disabled={form.isSubmitting}        formId: "user-registration",

            >    });

                {form.isSubmitting ? "Submitting..." : "Complete Registration"}

            </button>    useEffect(() => {

        </div>        // Set initial data

    );        form.setFormValues({

}            name: "",

```            email: "",

            phone: "",

### Cross-Component Form Sync            address: {

                street: "",

```tsx                city: "",

// Form editor component                zipCode: "",

function FormEditor() {            },

    const form = useGlobalForm({            preferences: [],

        formId: "live-form",            newsletter: false,

        initialValues: { title: "", description: "", fields: [] }        });

    });    }, []);



    return (    return <Step1 />;

        <div>}

            <h3>Form Builder</h3>```

            <input

                name="title"### 2. Pre-loading Data

                value={form.useFormValue("title")}

                onChange={form.handleFormChange}You can also load and set data from a server:

                placeholder="Form Title"

            />```typescript

            <textareafunction EditUserForm({ userId }: { userId: string }) {

                name="description"    const form = useGlobalForm<UserFormData>({

                value={form.useFormValue("description")}        formId: `user-edit-${userId}`,

                onChange={form.handleFormChange}    });

                placeholder="Form Description"

            />    useEffect(() => {

        </div>        async function loadUserData() {

    );            try {

}                const userData = await fetchUser(userId);

                form.setFormValues(userData);

// Live preview component            } catch (error) {

function FormPreview() {                console.error("Failed to load user data:", error);

    const form = useGlobalForm({            }

        formId: "live-form" // Same form state        }

    });

        loadUserData();

    const title = form.useFormValue("title");    }, [userId]);

    const description = form.useFormValue("description");

    return <UserEditSteps />;

    return (}

        <div>```

            <h3>Live Preview</h3>

            <div style={{ border: "1px solid #ccc", padding: "1rem" }}>### 3. Direct Store Access

                <h4>{title || "Untitled Form"}</h4>

                <p>{description || "No description"}</p>For advanced users, you can directly access the global store:

            </div>

        </div>```typescript

    );function AdvancedGlobalForm() {

}    const form = useGlobalForm<UserFormData>({

        formId: "user-registration",

// Usage    });

function FormBuilderApp() {

    return (    // Direct access to global store

        <div style={{ display: "flex" }}>    const store = form._store;

            <FormEditor />

            <FormPreview />    // Use the same store in another useForm hook

        </div>    const localForm = useForm<UserFormData>({

    );        initialValues: {} as UserFormData,

}        _externalStore: store, // Share the same store

```    });



## Best Practices    // Now form and localForm share the same data

    return (

### 1. Use Unique Form IDs        <div>

            <h3>Global Form Data</h3>

```tsx            <p>Name: {form.useFormValue("name")}</p>

// ✅ Good - descriptive and unique

const form = useGlobalForm({ formId: "user-registration-wizard" });            <h3>Same Data from Local Form</h3>

const form = useGlobalForm({ formId: "product-configuration-form" });            <p>Name: {localForm.useFormValue("name")}</p>



// ❌ Avoid - generic or conflicting IDs            {/* Changing either one updates both */}

const form = useGlobalForm({ formId: "form" });            <TextField

const form = useGlobalForm({ formId: "data" });                name="name"

```                value={form.useFormValue("name")}

                onChange={form.handleFormChange}

### 2. Initialize Values in First Component                label="Change from Global Form"

            />

```tsx

// ✅ First component defines the structure            <TextField

function Step1() {                name="name"

    const form = useGlobalForm({                value={localForm.useFormValue("name")}

        formId: "wizard",                onChange={localForm.handleFormChange}

        initialValues: { name: "", email: "", preferences: {} }                label="Change from Local Form"

    });            />

    // ...        </div>

}    );

}

// ✅ Subsequent components don't need initialValues```

function Step2() {

    const form = useGlobalForm({### 4. Conditional Validation

        formId: "wizard" // Initial values ignored if form already exists

    });You can perform validation only at specific steps:

    // ...

}```typescript

```function Step1Validation() {

    const form = useGlobalForm<UserFormData>({

### 3. Handle Form State Cleanup        formId: "user-registration",

    });

```tsx

// For temporary forms    const validateStep1 = () => {

const form = useGlobalForm({        const name = form.getFormValue("name");

    formId: "temp-form",        const email = form.getFormValue("email");

    autoCleanup: true // Default - cleans up when no components use it

});        if (!name || name.length < 2) {

            alert("Please enter a name with at least 2 characters.");

// For persistent forms            return false;

const form = useGlobalForm({        }

    formId: "persistent-form",

    autoCleanup: false // Keeps state until manually cleared        if (!email || !email.includes("@")) {

});            alert("Please enter a valid email.");

            return false;

// Manual cleanup when needed        }

const { clearForms } = useUnregisterGlobalForm();

const handleLogout = () => {        return true;

    clearForms(); // Clear all global forms    };

};

```    const handleNext = () => {

        if (validateStep1()) {

### 4. Validate at Appropriate Steps            // Move to next step

            router.push("/step2");

```tsx        }

// Step validation    };

function StepWithValidation({ onNext }) {

    const form = useGlobalForm({ formId: "wizard" });    return (

            <div>

    const handleNext = () => {            {/* Form inputs */}

        const currentValues = form.getFormValues();            <button onClick={handleNext}>Next Step</button>

        if (validateCurrentStep(currentValues)) {        </div>

            onNext();    );

        }}

    };```



    return <button onClick={handleNext}>Next</button>;### 4. Real-time Data Synchronization

}

Data is synchronized in real-time across multiple components:

// Final validation and submission

function FinalStep() {```typescript

    const form = useGlobalForm({// Left panel - Data input

        formId: "wizard",function LeftPanel() {

        onValidate: async (values) => {    const form = useGlobalForm<UserFormData>({ formId: "shared-form" });

            return validateEntireForm(values);

        },    return (

        onSubmit: async (values) => {        <div>

            await submitForm(values);            <TextField

        }                name="name"

    });                value={form.useFormValue("name")}

                    onChange={form.handleFormChange}

    return <button onClick={form.submit}>Submit</button>;            />

}        </div>

```    );

}

## Performance Considerations

// Right panel - Real-time preview

### Individual Field Subscriptionsfunction RightPanel() {

    const form = useGlobalForm<UserFormData>({ formId: "shared-form" });

```tsx

// ✅ Efficient - only re-renders when specific field changes    return (

const firstName = form.useFormValue("personal.firstName");        <div>

const lastName = form.useFormValue("personal.lastName");            <h3>Preview</h3>

            <p>Name: {form.useFormValue("name")}</p> {/* Real-time updates */}

// ❌ Inefficient - re-renders when any field changes        </div>

const values = form.getFormValues();    );

const firstName = values.personal.firstName;}

`````

### Component Memoization## Best Practices

````tsx### 1. formId Naming Convention

// Optimize with React.memo for stable components

const FormStep = React.memo(({ stepData, onNext }) => {```typescript

    const form = useGlobalForm({ formId: "wizard" });// ✅ Good examples - Clear and specific names

    const form = useGlobalForm({ formId: "user-registration" }); // User registration form

    return (const form = useGlobalForm({ formId: "product-edit-123" }); // Specific product edit form

        <div>const form = useGlobalForm({ formId: "order-checkout" }); // Order checkout form

            {/* Component content */}

        </div>// ❌ Avoid these - Vague and generic names

    );const form = useGlobalForm({ formId: "form1" }); // Unclear what this form does

});const form = useGlobalForm({ formId: "data" }); // Too generic, high collision risk

````

## Troubleshooting**Good formId characteristics:**

### Common Issues- **Specific**: Clearly expresses the form's purpose

-   **Unique**: Doesn't conflict with other forms

1. **Form not sharing state**- **Consistent**: Uses unified naming conventions within the team

    - Ensure same `formId` is used across components- **Descriptive**: Easy for code readers to understand

    - Check that components are mounted when accessing shared state

**Problems with bad formIds:**

2. **Memory leaks**

    - Use `autoCleanup: true` for temporary forms- **Ambiguous**: Makes maintenance difficult due to unclear purpose

    - Manually clear persistent forms when needed- **Collision risk**: Generic names can cause data conflicts

-   **Debugging difficulty**: Hard to identify issues when problems occur

3. **Performance issues**

    - Use individual field subscriptions instead of `getFormValues()`### 2. Type Safety

    - Memoize heavy components

```typescript

## Related Documents// ✅ Explicitly specify types

const form = useGlobalForm<UserFormData>({ formId: "user-form" });

- **[API Reference](./API.md)** - Complete useGlobalForm API

- **[Performance Guide](./performance-guide.md)** - Optimization techniques// ❌ Avoid using any

- **[Examples Collection](./examples/basic-example.md)** - More practical examplesconst form = useGlobalForm<any>({ formId: "user-form" });
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

-   [API Reference](./API.md#useglobalform)
-   [Getting Started](./getting-started.md)
-   [Best Practices](./best-practices.md)
