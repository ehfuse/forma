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
-   [Methods](#methods)
    -   [setBatch](#setbatch)
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
    /** Batch update multiple fields efficiently */
    setBatch: (updates: Record<string, any>) => void;
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

#### Functions

| Function        | Signature                                         | Description                                                                                   |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `useValue`      | `<K extends string>(path: K) => any`              | Subscribe to specific field value using dot notation. Re-renders only when the field changes. |
| `setValue`      | `<K extends string>(path: K, value: any) => void` | Set specific field value using dot notation. Triggers re-render for subscribers.              |
| `getValues`     | `() => T`                                         | Get all current values as an object (not reactive).                                           |
| `setValues`     | `(values: Partial<T>) => void`                    | Set multiple values at once. Triggers re-render for all affected subscribers.                 |
| `setBatch`      | `(updates: Record<string, any>) => void`          | Batch update multiple fields efficiently. Minimizes re-renders by grouping updates.           |
| `reset`         | `() => void`                                      | Reset all fields to initial values.                                                           |
| `refreshFields` | `(prefix: string) => void`                        | Force refresh all field subscribers with specific prefix. Useful for bulk updates.            |
| `handleChange`  | `(event: React.ChangeEvent<...>) => void`         | Handle standard input change events. Automatically updates corresponding field.               |
| `hasField`      | `(path: string) => boolean`                       | Check if a field exists in the state.                                                         |
| `removeField`   | `(path: string) => void`                          | Remove a field from the state.                                                                |
| `getValue`      | `(path: string) => any`                           | Get single field value (not reactive).                                                        |
| `subscribe`     | `(callback: (values: T) => void) => () => void`   | Subscribe to all state changes. Returns unsubscribe function.                                 |
| `_store`        | `FieldStore<T>`                                   | Direct access to internal store for advanced usage.                                           |

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

You can use the `refreshFields` method to force refresh all field subscribers with a specific prefix. This is used for **forcing UI refresh even when values are identical** in special cases.

```typescript
const state = useFormaState({
    user: { name: "Kim Cheol-soo", email: "kim@example.com" },
    address: { city: "Seoul", street: "Gangnam-daero" },
});

// Refresh all fields starting with "user"
state.refreshFields("user");
```

**💡 Use Cases:**

-   **Server Data Synchronization**: Force UI refresh even when server data is identical to current values
-   **Force Re-validation**: Re-run validation or formatting even when values are same
-   **External State Sync**: Synchronization with external libraries or systems

**⚠️ Important Notes:**

-   `refreshFields` is not a performance optimization tool
-   Individual field subscribers will still re-render individually
-   For bulk data updates, **array replacement** is the most efficient approach

📚 **[Field Refresh Usage Examples →](./examples-en.md#field-refresh-utilization)**  
🔗 **[Bulk Data Optimization Guide →](./performance-warnings-en.md#-bulk-data-batch-processing-optimization)**

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
    /** Form submission handler - return false to indicate submission failure */
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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
        // ✅ New feature: Control submission success/failure with boolean return
        const success = await api.submitUser(values);
        if (!success) {
            return false; // Return false to indicate submission failure
        }
        // return undefined or true to indicate success
    },
    onValidate: async (values) => {
        return values.email.includes("@");
    },
});

// Subscribe to individual fields (performance optimization)
const name = form.useFormValue("name");
const email = form.useFormValue("email");

// submit function still returns boolean
const handleSubmit = async () => {
    const success = await form.submit();
    if (success) {
        console.log("Submission successful!");
    } else {
        console.log("Submission failed!");
    }
};
```

**💡 onSubmit Return Value Handling:**

-   `true` or `undefined`: Submission success
-   `false`: Submission failure (no need to throw exceptions)
-   Exception thrown: Automatically treated as submission failure

📚 **[Detailed Form Usage Examples →](./examples-en.md#useform-examples)**

#### Functions

| Function                 | Signature                                        | Description                                                           |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------------------- |
| `isSubmitting`           | `boolean`                                        | Whether the form is currently submitting.                             |
| `isValidating`           | `boolean`                                        | Whether the form is currently validating.                             |
| `isModified`             | `boolean`                                        | Whether the form has been modified from initial values.               |
| `useFormValue`           | `(fieldName: string) => any`                     | Subscribe to specific form field value (recommended for performance). |
| `getFormValue`           | `(fieldName: string) => any`                     | Get specific form field value without subscription.                   |
| `getFormValues`          | `() => T`                                        | Get all current form values.                                          |
| `setFormValue`           | `(name: string, value: any) => void`             | Set specific form field value.                                        |
| `setFormValues`          | `(values: Partial<T>) => void`                   | Set multiple form values at once.                                     |
| `setInitialFormValues`   | `(values: T) => void`                            | Update initial form values.                                           |
| `handleFormChange`       | `(e: FormChangeEvent) => void`                   | Handle form input change events.                                      |
| `handleDatePickerChange` | `(fieldName: string) => DatePickerChangeHandler` | Create date picker change handler for specific field.                 |
| `submit`                 | `(e?: React.FormEvent) => Promise<boolean>`      | Submit the form, returns validation result.                           |
| `resetForm`              | `() => void`                                     | Reset form to initial values.                                         |
| `validateForm`           | `() => Promise<boolean>`                         | Validate the form, returns validation result.                         |
| `values`                 | `T`                                              | All form values (not recommended - causes full re-render).            |

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
    /** Form submission handler - return false to indicate submission failure */
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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

#### Functions

`useGlobalForm` extends `useForm` and adds the following functions:

| Function | Signature       | Description                                 |
| -------- | --------------- | ------------------------------------------- |
| `formId` | `string`        | Unique identifier for the global form.      |
| `_store` | `FieldStore<T>` | Direct access to the global store instance. |

All other functions from `useForm` are available.

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

#### Functions

`useGlobalFormaState` returns the same `UseFormaStateReturn<T>` interface as `useFormaState`:

| Function        | Signature                                         | Description                                                                                   |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `useValue`      | `<K extends string>(path: K) => any`              | Subscribe to specific field value using dot notation. Re-renders only when the field changes. |
| `setValue`      | `<K extends string>(path: K, value: any) => void` | Set specific field value using dot notation. Triggers re-render for subscribers.              |
| `getValues`     | `() => T`                                         | Get all current values as an object (not reactive).                                           |
| `setValues`     | `(values: Partial<T>) => void`                    | Set multiple values at once. Triggers re-render for all affected subscribers.                 |
| `setBatch`      | `(updates: Record<string, any>) => void`          | Batch update multiple fields efficiently. Minimizes re-renders by grouping updates.           |
| `reset`         | `() => void`                                      | Reset all fields to initial values.                                                           |
| `refreshFields` | `(prefix: string) => void`                        | Force refresh all field subscribers with specific prefix. Useful for bulk updates.            |
| `handleChange`  | `(event: React.ChangeEvent<...>) => void`         | Handle standard input change events. Automatically updates corresponding field.               |
| `hasField`      | `(path: string) => boolean`                       | Check if a field exists in the state.                                                         |
| `removeField`   | `(path: string) => void`                          | Remove a field from the state.                                                                |
| `getValue`      | `(path: string) => any`                           | Get single field value (not reactive).                                                        |
| `subscribe`     | `(callback: (values: T) => void) => () => void`   | Subscribe to all state changes. Returns unsubscribe function.                                 |
| `_store`        | `FieldStore<T>`                                   | Direct access to internal store for advanced usage.                                           |

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

## Methods

### setBatch

A convenience function for updating multiple fields at once. Improves code readability and data consistency.

#### Signature

```typescript
setBatch(updates: Record<string, any>): void
```

#### Parameters

-   `updates`: Object containing field paths as keys and new values as values. Supports dot notation.

#### Description

`setBatch` allows you to update multiple fields in a single operation. Instead of multiple `setValue` calls, you can express all changes as an object at once, improving code readability. All changes are applied simultaneously, ensuring data consistency.

This method is particularly useful for:

-   Loading server data into forms
-   Logically updating multiple related fields together
-   Bulk checkbox/radio button select/deselect

#### Examples

```typescript
const state = useFormaState({
    user: { name: "", email: "", age: 0 },
    settings: { theme: "light", notifications: true },
});

// Batch update multiple fields
state.setBatch({
    "user.name": "John Doe",
    "user.email": "john@example.com",
    "settings.theme": "dark",
});

// All subscribers re-render only once, not three times
```

**Performance Benefits:**

-   **Reduced Re-renders**: 1 re-render instead of N re-renders
-   **Better UX**: Smoother updates for bulk operations
-   **Memory Efficient**: Less garbage collection pressure

📚 **[Detailed setBatch examples →](./examples-en.md#setbatch-examples)**  
🔗 **[Performance optimization with setBatch →](./performance-guide-en.md#setbatch-optimization)**

---

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

Returns the current value of a specific field. Supports dot notation for nested objects.

**Parameters:**

-   `fieldName`: Field name or dot notation path (e.g., `"user.name"`)

**Returns:** The field value, or `undefined` if the field doesn't exist.

**Example:**

```typescript
const store = new FieldStore({ user: { name: "John" } });
const name = store.getValue("user.name"); // "John"
```

##### setValue

```typescript
setValue(fieldName: string, value: any): void
```

Sets the value of a specific field and notifies all subscribers. Supports dot notation.

**Parameters:**

-   `fieldName`: Field name or dot notation path
-   `value`: New value to set

**Example:**

```typescript
store.setValue("user.name", "Jane");
store.setValue("settings.theme", "dark");
```

##### getValues

```typescript
getValues(): T
```

Returns all current field values as an object.

**Returns:** Complete state object

**Example:**

```typescript
const allValues = store.getValues(); // { user: { name: "Jane" }, settings: { theme: "dark" } }
```

##### setValues

```typescript
setValues(values: Partial<T>): void
```

Sets multiple field values at once and notifies subscribers.

**Parameters:**

-   `values`: Object with field updates

**Example:**

```typescript
store.setValues({
    "user.name": "Bob",
    "user.email": "bob@example.com",
});
```

##### setBatch

```typescript
setBatch(updates: Record<string, any>): void
```

Efficiently batch updates multiple fields in a single operation to minimize re-renders.

**Parameters:**

-   `updates`: Object with field paths as keys and new values

**Example:**

```typescript
store.setBatch({
    "user.name": "Alice",
    "user.age": 30,
    "settings.notifications": true,
});
```

##### subscribe

```typescript
subscribe(fieldName: string, callback: () => void): () => void
```

Subscribes to changes in a specific field. Returns an unsubscribe function.

**Parameters:**

-   `fieldName`: Field name or dot notation path
-   `listener`: Callback function called on change

**Returns:** Unsubscribe function

**Example:**

```typescript
const unsubscribe = store.subscribe("user.name", () => {
    console.log("Name changed");
});
// Later: unsubscribe();
```

##### subscribeGlobal

```typescript
subscribeGlobal(callback: () => void): () => void
```

Subscribes to changes in all fields.

**Parameters:**

-   `callback`: Callback function called on any change

**Returns:** Unsubscribe function

##### reset

```typescript
reset(): void
```

Resets all fields to their initial values and notifies subscribers.

##### isModified

```typescript
isModified(): boolean
```

Checks if any field has been modified from initial values.

**Returns:** `true` if modified, `false` otherwise

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
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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
