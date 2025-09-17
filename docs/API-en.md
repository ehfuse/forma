# Forma API Reference

This document provides detailed reference for all APIs in the Forma library.

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
-   [Utilities](#utilities)
    -   [getNestedValue](#getnestedvalue)
    -   [setNestedValue](#setnestedvalue)
-   [TypeScript Types](#typescript-types)

---

## Hooks

### useFormaState

A foundational hook for general state management of arrays, objects, and other data structures. Optimizes performance through individual field subscriptions.

#### Signature

```typescript
// Overload for starting with empty object
function useFormaState<T extends Record<string, any> = Record<string, any>>(
    initialValues?: T,
    options?: UseFormaStateOptions<T>
): UseFormaStateReturn<T>;

// Overload for explicit type with initial values
function useFormaState<T extends Record<string, any>>(
    initialValues: T,
    options?: UseFormaStateOptions<T>
): UseFormaStateReturn<T>;
```

#### Parameters

```typescript
interface UseFormaStateOptions<T> {
    /** Optional callback when state changes */
    onChange?: (values: T) => void;
    /** Enable deep equality checking for better performance */
    deepEquals?: boolean;
    /** External FieldStore instance for shared state */
    _externalStore?: FieldStore<T>;
    /** Error handler for state operations */
    onError?: (error: Error) => void;
    /** Enable validation on every change */
    validateOnChange?: boolean;
    /** Debounce delay for state updates in milliseconds */
    debounceMs?: number;
}
```

#### Return Value

```typescript
interface UseFormaStateReturn<T> {
    /** Subscribe to a specific field value with dot notation */
    useValue: <K extends string>(path: K) => any;
    /** Set a specific field value with dot notation */
    setValue: <K extends string>(path: K, value: any) => void;
    /** Get all current values (non-reactive) */
    getValues: () => T;
    /** Set all values at once */
    setValues: (values: Partial<T>) => void;
    /** Reset to initial values */
    reset: () => void;
    /** Handle standard input change events */
    handleChange: (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    /** Check if a field exists */
    hasField: (path: string) => boolean;
    /** Remove a field from state */
    removeField: (path: string) => void;
    /** Get a single field value (non-reactive) */
    getValue: (path: string) => any;
    /** Subscribe to all state changes */
    subscribe: (callback: (values: T) => void) => () => void;
    /** Direct access to the internal store for advanced usage */
    _store: FieldStore<T>;
}
```

#### Declaration Methods

```typescript
import { useFormaState } from "forma";

// 1. Basic usage with initial values
const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light", notifications: true },
});

// 2. Explicit type specification
interface UserData {
    name: string;
    email: string;
    age?: number;
}

const userState = useFormaState<{ user: UserData }>({
    user: { name: "", email: "" },
});

// 3. Starting with empty object
const dynamicState = useFormaState<Record<string, any>>();

// 4. With options
const stateWithOptions = useFormaState(
    {
        data: {},
    },
    {
        onChange: (values) => console.log("State changed:", values),
        debounceMs: 300,
        validateOnChange: true,
    }
);
```

#### Example

```typescript
import { useFormaState } from "forma";

// Basic usage
function MyComponent() {
    const state = useFormaState({
        user: { name: "", email: "" },
        settings: { theme: "light", notifications: true },
    });

    // Individual field subscription (re-renders only when this field changes)
    const userName = state.useValue("user.name");
    const theme = state.useValue("settings.theme");

    // New API methods usage
    const hasUserEmail = state.hasField("user.email");
    const userEmailValue = state.getValue("user.email"); // non-reactive

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
        // Only content changes (same length) - no notification to todos.length subscribers
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

#### 🔢 **Array Length Subscription**

`useFormaState` intelligently supports subscribing to array `length` properties:

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

// Change item content → no notification to todos.length subscribers (same length)
state.setValue("todos.0.text", "Updated todo");
```

**Key Features:**

-   ✅ **Smart Notifications**: Only notifies when array length actually changes
-   ✅ **Performance Optimized**: Prevents unnecessary re-renders on content changes
-   ✅ **Automatic Detection**: Auto-notifies `.length` subscribers when arrays change

**Usage Examples:**

```typescript
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

### useForm

The main hook for managing local form state.

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
    /** Callback after form submission completes */
    onComplete?: (values: T) => void;
    /** Internal API: External store (used by useGlobalForm) */
    _externalStore?: FieldStore<T>;
}
```

#### Return Value

```typescript
interface UseFormReturn<T> {
    // State
    isSubmitting: boolean; // Whether form is being submitted
    isValidating: boolean; // Whether form is being validated
    isModified: boolean; // Whether form has been modified

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

    // Compatibility (not recommended - causes full re-renders)
    values: T;
}
```

#### Examples

##### Basic Usage

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

##### Nested Object Handling

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

---

### useGlobalForm

Extended hook for managing global form state. Includes all features of useForm.

📚 **[Detailed Usage Guide](./useGlobalForm-guide-en.md)** for comprehensive examples.

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

##### Multi-Step Form

```typescript
// Step 1 Component
function Step1() {
    const form = useGlobalForm({
        formId: "user-registration",
        initialValues: { name: "", email: "", phone: "" },
    });

    return (
        <TextField
            name="name"
            value={form.useFormValue("name")}
            onChange={form.handleFormChange}
        />
    );
}

// Step 2 Component (shares same form state)
function Step2() {
    const form = useGlobalForm({
        formId: "user-registration", // Same ID
        initialValues: { name: "", email: "", phone: "" },
    });

    return (
        <TextField
            name="email"
            value={form.useFormValue("email")}
            onChange={form.handleFormChange}
        />
    );
}
```

---

### useGlobalFormaState

A hook for managing globally shared FormaState. Enables state sharing across multiple components while maintaining individual field-level subscriptions.

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
    /** Optional callback on state change */
    onChange?: (values: T) => void;
    /** Enable deep equality checking for performance */
    deepEquals?: boolean;
    /** Error handler for state operations */
    onError?: (error: Error) => void;
    /** Enable validation on all changes */
    validateOnChange?: boolean;
    /** Debounce delay for state updates (milliseconds) */
    debounceMs?: number;
}
```

#### Return Value

Returns the same `UseFormaStateReturn<T>` interface as `useFormaState`.

#### Features

-   **Global Sharing**: All components using the same `stateId` share the state
-   **Field-level Subscriptions**: Independent re-rendering optimization per field
-   **Auto Creation**: Creates new state if `stateId` doesn't exist
-   **Type Safety**: Full TypeScript type inference

#### Examples

##### Basic Usage

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

// User Profile Component
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

// User Settings Component (shares same state)
function UserSettings() {
    const state = useGlobalFormaState({
        stateId: "user-data", // Same ID shares state
        initialValues: {}, // Ignored since state already exists
    });

    const theme = state.useValue("preferences.theme");
    const language = state.useValue("preferences.language");
    const userName = state.useValue("user.name"); // Value from other component

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

##### Dynamic State Management

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
            <div>Current Session: {stateId}</div>
            {/* State from currently selected session is displayed */}
        </div>
    );
}
```

##### Multi-Component Synchronization

```typescript
// Shopping Cart State Management
function ShoppingCart() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart",
        initialValues: {
            items: [],
            total: 0,
            discount: 0,
        },
    });

    const items = cart.useValue("items");
    const total = cart.useValue("total");

    return (
        <div>
            <h2>Cart ({items?.length || 0})</h2>
            <p>Total: ${total}</p>
        </div>
    );
}

// Product List Component
function ProductList() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart", // Share same cart state
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
        <div>
            <button
                onClick={() =>
                    addToCart({ id: 1, name: "Product 1", price: 100 })
                }
            >
                Add to Cart
            </button>
        </div>
    );
}

// Checkout Component
function Checkout() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart", // Share same cart state
    });

    const total = cart.useValue("total");
    const items = cart.useValue("items");

    const handleCheckout = () => {
        console.log("Items to checkout:", items);
        console.log("Total:", total);

        // Reset cart after checkout
        cart.setValues({ items: [], total: 0, discount: 0 });
    };

    return (
        <div>
            <h3>Checkout</h3>
            <p>Amount: ${total}</p>
            <button onClick={handleCheckout}>Complete Purchase</button>
        </div>
    );
}
```

#### Important Notes

1. **GlobalFormaProvider Required**: Must be used within a component tree wrapped by `GlobalFormaProvider`.

2. **Initial Values Policy**: `initialValues` are only applied on the first call with a given `stateId`.

3. **Memory Management**: It's recommended to clean up unnecessary global states using `useUnregisterGlobalFormaState`.

---

### useRegisterGlobalForm

Hook for registering an existing useForm instance as a global form.

#### Signature

```typescript
function useRegisterGlobalForm<T>(formId: string, form: UseFormReturn<T>): void;
```

#### Parameters

-   `formId`: Unique identifier for the global form
-   `form`: useForm instance to register

#### Features

-   **Global Sharing**: Converts local forms to global state
-   **Auto Sync**: Registered forms are accessible from other components
-   **Type Safety**: Complete type inference through TypeScript

#### Example

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

---

### useRegisterGlobalFormaState

Hook to register an existing useFormaState instance as a global state.

#### Signature

```typescript
function useRegisterGlobalFormaState<T>(
    stateId: string,
    formaState: UseFormaStateReturn<T>
): void;
```

#### Parameters

-   `stateId`: Unique identifier for the global state
-   `formaState`: useFormaState instance to register

#### Features

-   **Global Sharing**: Convert local FormaState to global state
-   **Individual Field Subscriptions**: Registered state supports field-level subscriptions
-   **Auto Sync**: Immediately accessible from other components

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

Hook to remove registered global forms.

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

-   **Memory Management**: Remove unnecessary form state
-   **Selective Removal**: Remove specific forms only
-   **Batch Cleanup**: Clear all forms at once

#### Example

```typescript
import { useUnregisterGlobalForm } from "@ehfuse/forma";

function CleanupComponent() {
    const { unregisterForm, clearForms } = useUnregisterGlobalForm();

    const handleUnregister = () => {
        const success = unregisterForm("user-form");
        console.log(`Form removal ${success ? "success" : "failed"}`);
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

---

### useUnregisterGlobalFormaState

Hook to remove registered global FormaState.

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

-   **Memory Optimization**: Clean up unnecessary state
-   **Flexible Management**: Choose individual or batch removal
-   **Safe Removal**: Clean up subscribers before safe removal

#### Example

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

Sets values for multiple fields at once.

##### subscribe

```typescript
subscribe(fieldName: string, callback: () => void): () => void
```

Subscribes to changes of a specific field. Returns an unsubscribe function.

##### subscribeGlobal

```typescript
subscribeGlobal(callback: () => void): () => void
```

Subscribes to changes of all fields.

##### reset

```typescript
reset(): void
```

Resets all fields to their initial values.

##### isModified

```typescript
isModified(): boolean
```

Checks if any field has been modified from its initial value.

---

## Utilities

### getNestedValue

Utility function to get values from nested objects.

#### Signature

```typescript
function getNestedValue(obj: any, path: string): any;
```

#### Parameters

-   `obj`: Target object
-   `path`: Access path (e.g., "user.profile.name")

#### Example

```typescript
const user = {
    profile: {
        name: "John Doe",
        settings: { theme: "dark" },
    },
};

const name = getNestedValue(user, "profile.name"); // "John Doe"
const theme = getNestedValue(user, "profile.settings.theme"); // "dark"
```

---

### setNestedValue

Utility function to set values in nested objects. Maintains immutability.

#### Signature

```typescript
function setNestedValue(obj: any, path: string, value: any): any;
```

#### Parameters

-   `obj`: Target object
-   `path`: Path to set (e.g., "user.profile.name")
-   `value`: Value to set

#### Returns

New object (maintains immutability)

#### Example

```typescript
const user = {
    profile: {
        name: "John Doe",
        settings: { theme: "dark" },
    },
};

const newUser = setNestedValue(user, "profile.name", "Jane Doe");
// newUser.profile.name === "Jane Doe"
// user remains unchanged (immutability maintained)
```

---

## TypeScript Types

### FormChangeEvent

Unified type for form events. Supports various MUI component events.

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

Event handler type specifically for DatePicker.

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
}
```

### UseGlobalFormaStateProps

Parameter type for the useGlobalFormaState hook.

```typescript
interface UseGlobalFormaStateProps<T extends Record<string, any>> {
    stateId: string;
    initialValues?: T;
    onChange?: (values: T) => void;
    deepEquals?: boolean;
    onError?: (error: Error) => void;
    validateOnChange?: boolean;
    debounceMs?: number;
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

Return type of useUnregisterGlobalForm hook.

```typescript
interface UseUnregisterGlobalFormReturn {
    unregisterForm: (formId: string) => boolean;
    clearForms: () => void;
}
```

### UseUnregisterGlobalFormaStateReturn

Return type of useUnregisterGlobalFormaState hook.

```typescript
interface UseUnregisterGlobalFormaStateReturn {
    unregisterState: (stateId: string) => boolean;
    clearStates: () => void;
}
```

---

## Best Practices

### Performance Optimization

1. **Use Individual Field Subscriptions**

    ```typescript
    // ✅ Recommended: Field-specific subscription
    const name = form.useFormValue("name");

    // ❌ Not recommended: Full object subscription
    const { name } = form.values;
    ```

2. **Conditional Subscriptions**
    ```typescript
    function ConditionalField({ showField }) {
        const value = showField ? form.useFormValue("field") : "";
        return showField ? <TextField value={value} /> : null;
    }
    ```

### Type Safety

1. **Use Generic Types**

    ```typescript
    interface UserForm {
        name: string;
        email: string;
        age: number;
    }

    const form = useForm<UserForm>({
        initialValues: { name: "", email: "", age: 0 },
    });
    ```

2. **Use Type Guards**
    ```typescript
    const email = form.useFormValue("email") as string;
    ```

### Error Handling

1. **Error Handling in Validation Functions**

    ```typescript
    onValidate: async (values) => {
        try {
            await validateEmail(values.email);
            return true;
        } catch (error) {
            console.error("Validation failed:", error);
            return false;
        }
    };
    ```

2. **Error Handling in Submit Functions**
    ```typescript
    onSubmit: async (values) => {
        try {
            await api.submitForm(values);
        } catch (error) {
            console.error("Submit failed:", error);
            throw error; // Re-throw to handle isSubmitting state
        }
    };
    ```

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
const formik = useFormik({
    initialValues: { name: "" },
    onSubmit: handleSubmit,
});
const name = formik.values.name;

// Forma
const form = useForm({
    initialValues: { name: "" },
    onSubmit: handleSubmit,
});
const name = form.useFormValue("name");
```

---

This API reference covers all public APIs of the Forma library. If you need additional questions or examples, please feel free to ask.
