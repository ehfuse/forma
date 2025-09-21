# Forma API Reference

This document provides a detailed reference for all APIs in the Forma library.

## Table of Contents

-   [Hooks](#hooks)
    -   [useFormaState](#useformastate)
    -   [useForm](#useform)
    -   [useGlobalForm](#useglobalform)
    -   [useGlobalFormaState](#useglobalformastate)
    -   [useRegisterGlobalForm](#useregisterglobalform)
    -   [useRegisterGlobalFormaState](#useregisterglobalformastate)
    -   [useUnregisterGlobalForm](#useunregisterglobalform)
    -   [useUnregisterGlobalFormaState](#useunregisterglobalformastate)
-   [Components](#components)
    -   [GlobalFormaProvider](#globalformaprovider)
-   [Core Classes](#core-classes)
    -   [FieldStore](#fieldstore)
-   [TypeScript Types](#typescript-types)

---

## Hooks

### useFormaState

A basic hook for managing general state such as arrays and objects. Optimizes performance through individual field subscriptions.

#### Signature

```typescript
// Overload for starting with an empty object
function useFormaState<T extends Record<string, any> = Record<string, any>>(
    initialValues?: T,
    options?: UseFormaStateOptions<T>
): UseFormaStateReturn<T>;

// Overload for cases with explicit types
function useFormaState<T extends Record<string, any>>(
    initialValues: T,
    options?: UseFormaStateOptions<T>
): UseFormaStateReturn<T>;
```

#### Parameters

```typescript
interface UseFormaStateOptions<T> {
    /** Optional callback on state change */
    onChange?: (values: T) => void;
    /** Enable deep equality check for performance improvement */
    deepEquals?: boolean;
    /** External FieldStore instance for shared state */
    _externalStore?: FieldStore<T>;
    /** Error handler for state operations */
    onError?: (error: Error) => void;
    /** Enable validation on all changes */
    validateOnChange?: boolean;
}
```

#### Return Value

```typescript
interface UseFormaStateReturn<T> {
    /** Subscribe to specific field value using dot notation */
    useValue: <K extends string>(path: K) => any;
    /** Set specific field value using dot notation */
    setValue: <K extends string>(path: K, value: any) => void;
    /** Get all current values (not reactive) */
    getValues: () => T;
    /** Set all values at once */
    setValues: (values: Partial<T>) => void;
    /** Reset to initial values */
    reset: () => void;
    /** Refresh all field subscribers with specific prefix */
    refreshFields: (prefix: string) => void;
    /** Handle standard input change events */
    handleChange: (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    /** Check if field exists */
    hasField: (path: string) => boolean;
    /** Remove field from state */
    removeField: (path: string) => void;
    /** Get single field value (not reactive) */
    getValue: (path: string) => any;
    /** Subscribe to all state changes */
    subscribe: (callback: (values: T) => void) => () => void;
    /** Direct access to internal store for advanced usage */
    _store: FieldStore<T>;
}
```

#### Basic Usage

```typescript
import { useFormaState } from "forma";

const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light", notifications: true },
});

// Subscribe to individual fields
const userName = state.useValue("user.name");
const theme = state.useValue("settings.theme");
```

📚 **[Detailed usage examples →](./examples-en.md#useformastate-examples)**

#### 🔢 **Array Length Subscription**

`useFormaState` can intelligently subscribe to the `length` property of arrays:

```typescript
const state = useFormaState({
    todos: [
        { id: 1, text: "Todo 1" },
        { id: 2, text: "Todo 2" },
    ],
});

// Subscribe only to array length - re-renders only when items are added/removed
const todoCount = state.useValue("todos.length"); // 2
```

**Key Features:**

-   ✅ **Smart Notifications**: Notifies only when array length actually changes
-   ✅ **Performance Optimization**: Prevents unnecessary re-renders when array contents change
-   ✅ **Auto Detection**: Automatically notifies `.length` subscribers when arrays change

📚 **[Detailed Array Length Subscription Guide →](./performance-warnings-en.md#array-length-subscription-array-length-subscription)**

#### 🔄 **Field Refresh**

You can use the `refreshFields` method to force refresh all field subscribers with a specific prefix. This is very useful for **performance optimization in bulk data processing**.

```typescript
const state = useFormaState({
    user: { name: "Kim Cheol-soo", email: "kim@example.com" },
    address: { city: "Seoul", street: "Gangnam-daero" },
});

// Refresh all fields starting with "user"
state.refreshFields("user");
```

**💡 Key Concepts:**

-   **Individual Updates**: Each field `setValue` → N re-renders
-   **Batch Updates**: Set entire data `setValue` + `refreshFields` → 1 re-render

**📈 Performance Improvement Effects:**

-   Selecting all 100 checkboxes: **100x faster** (100 re-renders → 1 re-render)
-   Updating 500 table rows: **500x faster** (500 re-renders → 1 re-render)

📚 **[Detailed Field Refresh Examples →](./examples-en.md#field-refresh-utilization)**  
🔗 **[Bulk Data Batch Processing Optimization Guide →](./performance-warnings-en.md#-bulk-data-batch-processing-optimization)**

### useForm

A basic hook for managing local form state.

#### Signature

```typescript
function useForm<T extends Record<string, any>>(
    props: UseFormProps<T>
): UseFormReturn<T>;
```

#### Parameters

```typescript
interface UseFormProps<T> {
    /** Initial values for the form */
    initialValues: T;
    /** Form submission handler */
    onSubmit?: (values: T) => Promise<void> | void;
    /** Form validation handler - returns true if validation passes */
    onValidate?: (values: T) => Promise<boolean> | boolean;
    /** Callback after form submission completion */
    onComplete?: (values: T) => void;
    /** Internal API: External store (used in useGlobalForm) */
    _externalStore?: FieldStore<T>;
}
```

#### Return Value

```typescript
interface UseFormReturn<T> {
    // State
    isSubmitting: boolean; // Whether submitting
    isValidating: boolean; // Whether validating
    isModified: boolean; // Whether modified

    // Value retrieval (with subscription - recommended)
    useFormValue: (fieldName: string) => any;

    // Value retrieval (without subscription)
    getFormValue: (fieldName: string) => any;
    getFormValues: () => T;

    // Value setting
    setFormValue: (name: string, value: any) => void;
    setFormValues: (values: Partial<T>) => void;
    setInitialFormValues: (values: T) => void;

    // Event handlers
    handleFormChange: (e: FormChangeEvent) => void;
    handleDatePickerChange: (fieldName: string) => DatePickerChangeHandler;

    // Form actions
    submit: (e?: React.FormEvent) => Promise<boolean>;
    resetForm: () => void;
    validateForm: () => Promise<boolean>;

    // Compatibility (not recommended - causes full re-render)
    values: T;
}
```

#### Basic Usage

```typescript
const form = useForm({
    initialValues: { name: "", email: "", age: 0 },
    onSubmit: async (values) => {
        await api.submitUser(values);
    },
    onValidate: async (values) => {
        return values.email.includes("@");
    },
});

// Subscribe to individual fields (performance optimization)
const name = form.useFormValue("name");
const email = form.useFormValue("email");
```

📚 **[Detailed Form Usage Examples →](./examples-en.md#useform-examples)**

---

### useGlobalForm

An extended hook for managing global form state. Includes all features of useForm.

📚 **[Detailed Usage Guide](./useGlobalForm-guide-en.md)**

#### Signature

```typescript
function useGlobalForm<T extends Record<string, any>>(
    props: UseGlobalFormProps<T>
): UseGlobalFormReturn<T>;
```

#### Parameters

```typescript
interface UseGlobalFormProps<T> {
    /** Unique ID to identify the form globally */
    formId: string;
    /** Initial values */
    initialValues?: Partial<T>;
    /** Whether to auto-cleanup on component unmount (default: true) */
    autoCleanup?: boolean;
    /** Form submission handler */
    onSubmit?: (values: T) => Promise<void> | void;
    /** Form validation handler - returns true if validation passes */
    onValidate?: (values: T) => Promise<boolean> | boolean;
    /** Callback after form submission completion */
    onComplete?: (values: T) => void;
}
```

#### Return Value

```typescript
interface UseGlobalFormReturn<T> extends UseFormReturn<T> {
    /** Global form identifier */
    formId: string;
    /** Direct access to global store */
    _store: FieldStore<T>;
}
```

#### Examples

##### Basic Usage

```typescript
// Create global form
const form = useGlobalForm({
    formId: "user-form",
    initialValues: { name: "", email: "" },
    onSubmit: async (values) => {
        await api.submitUser(values);
    },
});

// Share same form state in another component
const sharedForm = useGlobalForm({
    formId: "user-form", // Share state with same ID
});
```

##### Multi-step Form

```typescript
// Step 1 Component
function Step1() {
    const form = useGlobalForm({
        formId: "wizard-form",
        initialValues: {
            personal: { name: "", email: "" },
            address: { street: "", city: "" },
        },
    });

    return (
        <div>
            <input
                name="personal.name"
                value={form.useFormValue("personal.name")}
                onChange={form.handleFormChange}
            />
            <input
                name="personal.email"
                value={form.useFormValue("personal.email")}
                onChange={form.handleFormChange}
            />
        </div>
    );
}

// Step 2 Component
function Step2() {
    const form = useGlobalForm({
        formId: "wizard-form", // Share state with same formId
    });

    return (
        <div>
            <input
                name="address.street"
                value={form.useFormValue("address.street")}
                onChange={form.handleFormChange}
            />
            <input
                name="address.city"
                value={form.useFormValue("address.city")}
                onChange={form.handleFormChange}
            />
            <button onClick={form.submit}>Complete</button>
        </div>
    );
}
```

📚 **[Detailed Global Form Examples →](./examples-en.md#useglobalform-examples)**

#### 🔄 **Auto Memory Cleanup (autoCleanup)**

`useGlobalForm` also supports **reference-counting based auto cleanup**:

```typescript
const form = useGlobalForm({
    formId: "wizard-form",
    autoCleanup: true, // Default - auto cleanup
});

// autoCleanup: false - Manual management
const persistentForm = useGlobalForm({
    formId: "persistent-form",
    autoCleanup: false,
});
```

**Auto Cleanup Behavior:**

-   Automatically cleans up the form when the last user unmounts
-   `autoCleanup: false`: Manual cleanup with `useUnregisterGlobalForm` required

📚 **[Detailed Auto Memory Cleanup Examples →](./examples-en.md#auto-memory-cleanup-examples)**

#### Recommendations

✅ **Recommendations:**

-   Use `autoCleanup: true` (default) in most cases
-   Use manual cleanup only after full form completion or user logout
-   Rely on auto cleanup for shared forms to ensure safety

⚠️ **Caution:** Manual unregister immediately affects all components using that `formId`

---

### useGlobalFormaState

A hook for managing globally shared FormaState. Supports individual field subscriptions while sharing state across multiple components.

#### Signature

```typescript
function useGlobalFormaState<
    T extends Record<string, any> = Record<string, any>
>(props: UseGlobalFormaStateProps<T>): UseFormaStateReturn<T>;
```

#### Parameters

```typescript
interface UseGlobalFormaStateProps<T> {
    /** Unique ID to identify the state globally */
    stateId: string;
    /** Initial values (used only on first creation) */
    initialValues?: T;
    /** Whether to auto-cleanup on component unmount (default: true) */
    autoCleanup?: boolean;
    /** Optional callback on state change */
    onChange?: (values: T) => void;
    /** Enable deep equality check for performance improvement */
    deepEquals?: boolean;
    /** Error handler for state operations */
    onError?: (error: Error) => void;
    /** Enable validation on all changes */
    validateOnChange?: boolean;
}
```

#### Return Value

Returns the same `UseFormaStateReturn<T>` interface as `useFormaState`.

#### Features

-   **Global Sharing**: All components using the same `stateId` share state
-   **Individual Field Subscriptions**: Supports independent re-rendering per field
-   **Auto Creation**: Creates new if `stateId` doesn't exist
-   **Type Safety**: Complete type inference with TypeScript

#### Basic Usage

```typescript
// Create global state
const state = useGlobalFormaState({
    stateId: "user-data",
    initialValues: {
        user: { name: "", email: "" },
        preferences: { theme: "light" },
    },
});

// Subscribe to individual fields
const userName = state.useValue("user.name");
const theme = state.useValue("preferences.theme");

// Share same state in another component
const sharedState = useGlobalFormaState({
    stateId: "user-data", // Share state with same ID
});
```

📚 **[Detailed Global State Examples →](./examples-en.md#useglobalformastate-examples)**

```typescript
// Basic Shopping Cart Component
function ShoppingCart() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart",
        initialValues: {
            items: [],
            total: 0,
        },
    });

    // ✅ Recommended: Subscribe to .length (re-renders only when array length changes)
    const itemCount = cart.useValue("items.length");
    const total = cart.useValue("total");

    return (
        <div>
            <h2>Shopping Cart ({itemCount})</h2>
            <p>Total: {total} won</p>
        </div>
    );
}

// Product Addition Component
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
            onClick={() =>
                addToCart({ id: 1, name: "Product 1", price: 10000 })
            }
        >
            Add Product
        </button>
    );
}
```

**Key Points:**

-   `itemCount = cart.useValue("items.length")`: Subscribe only to array length
-   Instead of `items?.length || 0`, use `.length` subscription
-   Performance optimization: Prevents unnecessary re-renders when array contents change

📚 **[Detailed Array Length Subscription Guide →](./performance-warnings-en.md#array-length-subscription-array-length-subscription)**
🔗 **[Performance Optimization Best Practices →](./performance-guide-en.md#performance-optimization)**

---

### 📖 **useUnregisterGlobalFormaState**

A hook for manually cleaning up global state.

#### Precautions

1. **GlobalFormaProvider Required**: Must be used within a component tree wrapped with `GlobalFormaProvider`.

2. **Initial Values Policy**: `initialValues` are applied only on the first call with the same `stateId`.

3. **Memory Management**:

    - `autoCleanup: true` (default): Automatic memory cleanup
    - `autoCleanup: false`: Manual cleanup with `useUnregisterGlobalFormaState` required

4. **Manual Unregister Precautions**:

    ```typescript
    // 🚨 Caution: Manual unregister immediately affects all references
    function ComponentA() {
        const { unregisterState } = useUnregisterGlobalFormaState();
        const state = useGlobalFormaState({ stateId: "shared" });

        const handleCleanup = () => {
            // This call immediately affects ComponentB!
            unregisterState("shared");
        };
    }

    function ComponentB() {
        const state = useGlobalFormaState({ stateId: "shared" });
        // Possible errors in ComponentB if manually removed
    }
    ```

#### Recommendations

1. **Use Default Settings**: Use `autoCleanup: true` (default) in most cases.

2. **Manual Cleanup Usage Times**:

    - Application-wide reset
    - User logout
    - Special situations requiring memory optimization

3. **Shared State Management**:

    - Rely on `autoCleanup` for states used by multiple components
    - Minimize manual cleanup for predictable lifecycles

4. **Debugging Tips**:
    ```typescript
    // Track state in development environment
    const state = useGlobalFormaState({
        stateId: "debug-state",
        onChange: (values) => {
            console.log("State changed:", values);
        },
    });
    ```

---

### useRegisterGlobalForm

A hook for registering an existing useForm instance as a global form.

#### Signature

```typescript
function useRegisterGlobalForm<T>(formId: string, form: UseFormReturn<T>): void;
```

#### Parameters

-   `formId`: Unique identifier for the global form
-   `form`: The useForm instance to register

#### Features

-   **Global Sharing**: Convert local form to global state
-   **Auto Synchronization**: Registered form is accessible from other components
-   **Type Safety**: Complete type inference with TypeScript

#### Basic Usage

```typescript
// Register local form as global
const form = useForm({ initialValues: { name: "", email: "" } });
useRegisterGlobalForm("shared-form", form);

// Access from another component
const sharedForm = useGlobalForm({ formId: "shared-form" });
```

📚 **[Detailed Register/Unregister Hook Examples →](./examples-en.md#register-unregister-hook-examples)**

---

### useRegisterGlobalFormaState

A hook for registering an existing useFormaState instance as global state.

#### Signature

```typescript
function useRegisterGlobalFormaState<T>(
    stateId: string,
    formaState: UseFormaStateReturn<T>
): void;
```

#### Parameters

-   `stateId`: Unique identifier for the global state
-   `formaState`: The useFormaState instance to register

#### Features

-   **Global Sharing**: Convert local FormaState to global state
-   **Individual Field Subscriptions**: Registered state supports field-by-field subscriptions
-   **Auto Synchronization**: Immediately accessible from other components

#### Example

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

---

### useUnregisterGlobalForm

A hook for removing registered global forms.

#### Signature

```typescript
function useUnregisterGlobalForm(): {
    unregisterForm: (formId: string) => boolean;
    clearForms: () => void;
};
```

#### Returns

-   `unregisterForm`: Function to remove a specific form
-   `clearForms`: Function to remove all global forms

#### Features

-   **Memory Management**: Remove unnecessary form states
-   **Selective Removal**: Can remove specific forms selectively
-   **Batch Cleanup**: Can clean up all forms at once

#### Basic Usage

```typescript
const { unregisterForm, clearForms } = useUnregisterGlobalForm();

// Remove specific form
const success = unregisterForm("user-form");

// Remove all forms
clearForms();
```

📚 **[Detailed Register/Unregister Hook Examples →](./examples-en.md#register-unregister-hook-examples)**

---

### useUnregisterGlobalFormaState

A hook for removing registered global FormaState.

#### Signature

```typescript
function useUnregisterGlobalFormaState(): {
    unregisterState: (stateId: string) => boolean;
    clearStates: () => void;
};
```

#### Returns

-   `unregisterState`: Function to remove a specific state
-   `clearStates`: Function to remove all global states

#### Features

-   **Memory Optimization**: Clean up unnecessary states
-   **Flexible Management**: Choose individual or batch removal
-   **Safe Removal**: Safely remove after cleaning up subscribers

#### Basic Usage

```typescript
const { unregisterState, clearStates } = useUnregisterGlobalFormaState();

// Remove specific state
unregisterState("user-data");

// Remove all states
clearStates();
```

📚 **[Detailed Register/Unregister Hook Examples →](./examples-en.md#register-unregister-hook-examples)**

---

## Components

### GlobalFormaProvider

Context Provider for global Forma state management.

#### Signature

```typescript
function GlobalFormaProvider({
    children,
}: {
    children: ReactNode;
}): JSX.Element;
```

#### Usage

```typescript
// App.tsx
import { GlobalFormaProvider } from "@/forma";

function App() {
    return (
        <GlobalFormaProvider>
            <Router>
                <Routes>
                    <Route path="/step1" element={<Step1 />} />
                    <Route path="/step2" element={<Step2 />} />
                </Routes>
            </Router>
        </GlobalFormaProvider>
    );
}
```

---

## Core Classes

### FieldStore

Core class that provides individual field state management and subscription system.

#### Constructor

```typescript
constructor(initialValues: T)
```

#### Methods

##### getValue

```typescript
getValue(fieldName: string): any
```

Returns the current value of a specific field.

##### setValue

```typescript
setValue(fieldName: string, value: any): void
```

Sets the value of a specific field. Supports dot notation.

##### getValues

```typescript
getValues(): T
```

Returns the current values of all fields as an object.

##### setValues

```typescript
setValues(values: Partial<T>): void
```

Sets the values of multiple fields in batch.

##### subscribe

```typescript
subscribe(fieldName: string, callback: () => void): () => void
```

Subscribes to changes in a specific field. Returns an unsubscribe function.

##### subscribeGlobal

```typescript
subscribeGlobal(callback: () => void): () => void
```

Subscribes to changes in all fields.

##### reset

```typescript
reset(): void
```

Resets all fields to their initial values.

##### isModified

```typescript
isModified(): boolean
```

Checks if any field has been modified from initial values.

---

## TypeScript Types

### FormChangeEvent

Unified type for form events. Supports events from various MUI components.

```typescript
type FormChangeEvent =
    | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    | SelectChangeEvent
    | SelectChangeEvent<string | number>
    | {
          target: { name: string; value: any };
          onChange?: (
              value: any,
              context: PickerChangeHandlerContext<any>
          ) => void;
      };
```

### DatePickerChangeHandler

Event handler type specific to DatePicker.

```typescript
type DatePickerChangeHandler = (
    fieldName: string
) => (value: any, context?: PickerChangeHandlerContext<any>) => void;
```

### UseFormProps

Parameter type for the useForm hook.

```typescript
interface UseFormProps<T extends Record<string, any>> {
    initialValues: T;
    onSubmit?: (values: T) => Promise<void> | void;
    onValidate?: (values: T) => Promise<boolean> | boolean;
    onComplete?: (values: T) => void;
    _externalStore?: FieldStore<T>;
}
```

### UseGlobalFormProps

Parameter type for the useGlobalForm hook.

```typescript
interface UseGlobalFormProps<T extends Record<string, any>> {
    formId: string;
    initialValues?: Partial<T>;
    autoCleanup?: boolean;
    onSubmit?: (values: T) => Promise<void> | void;
    onValidate?: (values: T) => Promise<boolean> | boolean;
    onComplete?: (values: T) => void;
}
```

### UseGlobalFormaStateProps

Parameter type for the useGlobalFormaState hook.

```typescript
interface UseGlobalFormaStateProps<T extends Record<string, any>> {
    stateId: string;
    initialValues?: T;
    autoCleanup?: boolean;
    onChange?: (values: T) => void;
    deepEquals?: boolean;
    onError?: (error: Error) => void;
    validateOnChange?: boolean;
}
```

### GlobalFormaContextType

Type for the global form context.

```typescript
interface GlobalFormaContextType {
    getOrCreateStore: <T extends Record<string, any>>(
        formId: string,
        initialValues: T
    ) => FieldStore<T>;
    registerStore: <T extends Record<string, any>>(
        formId: string,
        store: FieldStore<T>
    ) => void;
    unregisterStore: (formId: string) => boolean;
    clearStores: () => void;
}
```

### UseUnregisterGlobalFormReturn

Return type for the useUnregisterGlobalForm hook.

```typescript
interface UseUnregisterGlobalFormReturn {
    unregisterForm: (formId: string) => boolean;
    clearForms: () => void;
}
```

### UseUnregisterGlobalFormaStateReturn

Return type for the useUnregisterGlobalFormaState hook.

```typescript
interface UseUnregisterGlobalFormaStateReturn {
    unregisterState: (stateId: string) => boolean;
    clearStates: () => void;
}
```

---

## Best Practices

### Performance Optimization

```typescript
// ✅ Recommended: Individual field subscription
const name = form.useFormValue("name");

// ❌ Not recommended: Subscribe to entire object
const { name } = form.values;
```

**Core Principles:**

-   Optimize re-rendering with individual field subscriptions
-   Utilize array length subscription (`todos.length`)
-   Use batch processing + `refreshFields` for bulk data

📚 **[Performance Optimization Guide →](./performance-guide-en.md)**
⚠️ **[Performance Optimization Warnings →](./performance-warnings-en.md)**

---

## Migration Guide

### From React Hook Form

```typescript
// React Hook Form
const { register, handleSubmit, watch } = useForm();
const name = watch("name");

// Forma
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
```

### From Formik

```typescript
// Formik
const formik = useFormik({ initialValues: { name: "" } });
const name = formik.values.name;

// Forma
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
```

📚 **[Detailed Migration Guide →](./migration-en.md)**

---

This API reference covers all public APIs of the Forma library.

## Related Documents

-   **[API Reference](./API-en.md)** - Detailed explanations of all APIs
-   **[Example Collection](./examples-en.md)** - Practical usage examples
-   **[Performance Optimization Guide](./performance-guide-en.md)** - Performance optimization methods
-   **[Performance Optimization Warnings](./performance-warnings-en.md)** - Anti-patterns and cautions
-   **[Migration Guide](./migration-en.md)** - Migrating from other libraries
-   **[useGlobalForm Guide](./useGlobalForm-guide-en.md)** - Global form state management
-   **[Global Hooks Comparison Guide](./global-hooks-comparison-en.md)** - Differences between global hooks
-   **[Library Comparison Guide](./library-comparison-en.md)** - Comparison with other state management libraries

Please contact us anytime if you need additional questions or examples.
