# Forma API Reference# Forma API Reference

This document provides a detailed reference for all APIs in the Forma library.This document provides detailed reference for all APIs in the Forma library.

## Table of Contents## Table of Contents

-   [Hooks](#hooks)- [Hooks](#hooks)

    -   [useFormaState](#useformastate) - [useFormaState](#useformastate)

    -   [useForm](#useform) - [useForm](#useform)

    -   [useGlobalForm](#useglobalform) - [useGlobalForm](#useglobalform)

    -   [useGlobalFormaState](#useglobalformastate) - [useGlobalFormaState](#useglobalformastate)

    -   [useRegisterGlobalForm](#useregisterglobalform) - [useRegisterGlobalForm](#useregisterglobalform)

    -   [useRegisterGlobalFormaState](#useregisterglobalformastate) - [useRegisterGlobalFormaState](#useregisterglobalformastate)

    -   [useUnregisterGlobalForm](#useunregisterglobalform) - [useUnregisterGlobalForm](#useunregisterglobalform)

    -   [useUnregisterGlobalFormaState](#useunregisterglobalformastate) - [useUnregisterGlobalFormaState](#useunregisterglobalformastate)

-   [Components](#components)- [Components](#components)

    -   [GlobalFormaProvider](#globalformaprovider) - [GlobalFormaProvider](#globalformaprovider)

-   [Core Classes](#core-classes)- [Core Classes](#core-classes)

    -   [FieldStore](#fieldstore) - [FieldStore](#fieldstore)

-   [TypeScript Types](#typescript-types)- [Utilities](#utilities)

    -   [getNestedValue](#getnestedvalue)

--- - [setNestedValue](#setnestedvalue)

-   [TypeScript Types](#typescript-types)

## Hooks

---

### useFormaState

## Hooks

Basic hook for general state management of arrays, objects, etc. Optimizes performance through individual field subscriptions.

### useFormaState

#### Signature

A foundational hook for general state management of arrays, objects, and other data structures. Optimizes performance through individual field subscriptions.

````typescript

// Overload for starting with empty object#### Signature

function useFormaState<T extends Record<string, any> = Record<string, any>>(

    initialValues?: T,```typescript

    options?: UseFormaStateOptions<T>// Overload for starting with empty object

): UseFormaStateReturn<T>;function useFormaState<T extends Record<string, any> = Record<string, any>>(

    initialValues?: T,

// Overload for explicit type    options?: UseFormaStateOptions<T>

function useFormaState<T extends Record<string, any>>(): UseFormaStateReturn<T>;

    initialValues: T,

    options?: UseFormaStateOptions<T>// Overload for explicit type with initial values

): UseFormaStateReturn<T>;function useFormaState<T extends Record<string, any>>(

```    initialValues: T,

    options?: UseFormaStateOptions<T>

#### Parameters): UseFormaStateReturn<T>;

````

````typescript

interface UseFormaStateOptions<T> {#### Parameters

    /** Optional callback for state changes */

    onChange?: (values: T) => void;```typescript

    /** Enable deep equality checking for performance improvement */interface UseFormaStateOptions<T> {

    deepEquals?: boolean;    /** Optional callback when state changes */

    /** External FieldStore instance for shared state */    onChange?: (values: T) => void;

    _externalStore?: FieldStore<T>;    /** Enable deep equality checking for better performance */

    /** Error handler for state operations */    deepEquals?: boolean;

    onError?: (error: Error) => void;    /** External FieldStore instance for shared state */

    /** Enable validation on all changes */    _externalStore?: FieldStore<T>;

    validateOnChange?: boolean;    /** Error handler for state operations */

}    onError?: (error: Error) => void;

```    /** Enable validation on every change */

    validateOnChange?: boolean;

#### Return Value}

````

````typescript

interface UseFormaStateReturn<T> {#### Return Value

    /** Subscribe to specific field value with dot notation */

    useValue: <K extends string>(path: K) => any;```typescript

    /** Set specific field value with dot notation */interface UseFormaStateReturn<T> {

    setValue: <K extends string>(path: K, value: any) => void;    /** Subscribe to a specific field value with dot notation */

    /** Get all current values (non-reactive) */    useValue: <K extends string>(path: K) => any;

    getValues: () => T;    /** Set a specific field value with dot notation */

    /** Set all values at once */    setValue: <K extends string>(path: K, value: any) => void;

    setValues: (values: Partial<T>) => void;    /** Get all current values (non-reactive) */

    /** Reset to initial values */    getValues: () => T;

    reset: () => void;    /** Set all values at once */

    /** Refresh all field subscribers with specific prefix */    setValues: (values: Partial<T>) => void;

    refreshFields: (prefix: string) => void;    /** Reset to initial values */

    /** Handle standard input change events */    reset: () => void;

    handleChange: (    /** Refresh all field subscribers with specific prefix */

        event: React.ChangeEvent<    refreshFields: (prefix: string) => void;

            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement    /** Handle standard input change events */

        >    handleChange: (

    ) => void;        event: React.ChangeEvent<

    /** Check if field exists */            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

    hasField: (path: string) => boolean;        >

    /** Remove field from state */    ) => void;

    removeField: (path: string) => void;    /** Check if a field exists */

    /** Get single field value (non-reactive) */    hasField: (path: string) => boolean;

    getValue: (path: string) => any;    /** Remove a field from state */

    /** Subscribe to all state changes */    removeField: (path: string) => void;

    subscribe: (callback: (values: T) => void) => () => void;    /** Get a single field value (non-reactive) */

    /** Direct access to internal store for advanced usage */    getValue: (path: string) => any;

    _store: FieldStore<T>;    /** Subscribe to all state changes */

}    subscribe: (callback: (values: T) => void) => () => void;

```    /** Direct access to the internal store for advanced usage */

    _store: FieldStore<T>;

#### Basic Usage}

````

````typescript

import { useFormaState } from "forma";#### Declaration Methods



const state = useFormaState({```typescript

    user: { name: "", email: "" },import { useFormaState } from "forma";

    settings: { theme: "light", notifications: true },

});// 1. Explicit type specification (Recommended)

interface UserData {

// Individual field subscriptions    name: string;

const userName = state.useValue("user.name");    email: string;

const theme = state.useValue("settings.theme");    age?: number;

```}



📚 **[Detailed usage examples →](./examples-en.md#useformastate-examples)**const userState = useFormaState<{ user: UserData }>({

    user: { name: "", email: "" },

#### 🔢 **Array Length Subscription**});



`useFormaState` can intelligently subscribe to array `length` property:// 2. Basic usage with initial values

const state = useFormaState({

```typescript    user: { name: "", email: "" },

const state = useFormaState({    settings: { theme: "light", notifications: true },

    todos: [});

        { id: 1, text: "Todo 1" },

        { id: 2, text: "Todo 2" },// 3. Starting with empty object

    ],const dynamicState = useFormaState<Record<string, any>>();

});

// 4. With options

// Subscribe only to array length - re-renders only when items are added/removedconst stateWithOptions = useFormaState(

const todoCount = state.useValue("todos.length"); // 2    {

```        data: {},

    },

**Key Features:**    {

        onChange: (values) => console.log("State changed:", values),

-   ✅ **Smart Notifications**: Only notify when array length actually changes        validateOnChange: true,

-   ✅ **Performance Optimized**: Prevents unnecessary re-renders when array content changes    }

-   ✅ **Automatic Detection**: Automatically notify `.length` subscribers when array changes);

````

📚 **[Array Length Subscription Detailed Guide →](./performance-warnings-en.md#array-length-subscription)**

#### Example

#### 🔄 **Field Refresh**

````typescript

Use the `refreshFields` method to force refresh all field subscribers with a specific prefix. This is very useful for **performance optimization in bulk data processing**.import { useFormaState } from "forma";



```typescript// Basic usage

const state = useFormaState({function MyComponent() {

    user: { name: "John", email: "john@example.com" },    const state = useFormaState({

    address: { city: "Seoul", street: "Gangnam-daero" },        user: { name: "", email: "" },

});        settings: { theme: "light", notifications: true },

    });

// Refresh all fields starting with "user"

state.refreshFields("user");    // Individual field subscription (re-renders only when this field changes)

```    const userName = state.useValue("user.name");

    const theme = state.useValue("settings.theme");

**💡 Core Concept:**

    // New API methods usage

-   **Individual Updates**: Each field `setValue` → N re-renders    const hasUserEmail = state.hasField("user.email");

-   **Batch Updates**: Bulk data `setValue` + `refreshFields` → 1 re-render    const userEmailValue = state.getValue("user.email"); // non-reactive



**📈 Performance Improvement:**    // Subscribe to global state changes

    React.useEffect(() => {

-   100 checkboxes select all: **100x faster** (100 → 1 re-render)        const unsubscribe = state.subscribe((values) => {

-   500 table rows update: **500x faster** (500 → 1 re-render)            console.log("Global state changed:", values);

        });

📚 **[Field Refresh Usage Examples →](./examples-en.md#field-refresh-usage)**          return unsubscribe;

🔗 **[Bulk Data Batch Processing Guide →](./performance-warnings-en.md#bulk-data-batch-processing-optimization)**    }, [state]);



### useForm    return (

        <div>

Basic hook for managing local form state.            <input

                value={userName}

#### Signature                onChange={(e) => state.setValue("user.name", e.target.value)}

            />

```typescript            <button onClick={() => state.setValue("settings.theme", "dark")}>

function useForm<T extends Record<string, any>>(                Switch to Dark Theme

    props: UseFormProps<T>            </button>

): UseFormReturn<T>;            <button onClick={() => state.removeField("user.email")}>

```                Remove Email Field

            </button>

#### Parameters            <button onClick={() => state.reset()}>

                Reset to Initial Values

```typescript            </button>

interface UseFormProps<T> {            {hasUserEmail && <p>Email field exists</p>}

    /** Initial values for the form */        </div>

    initialValues: T;    );

    /** Form submission handler */}

    onSubmit?: (values: T) => Promise<void> | void;

    /** Form validation handler - return true for validation pass */// Array state management

    onValidate?: (values: T) => Promise<boolean> | boolean;function TodoList() {

    /** Callback after form submission completion */    const state = useFormaState({

    onComplete?: (values: T) => void;        todos: [

    /** Internal API: external store (used by useGlobalForm) */            { id: 1, text: "Learn React", completed: false },

    _externalStore?: FieldStore<T>;            { id: 2, text: "Build app", completed: false },

}        ],

```    });



#### Return Value    // Subscribe to specific todo item

    const firstTodo = state.useValue("todos.0.text");

```typescript

interface UseFormReturn<T> {    // Subscribe only to array length (re-renders only when items are added/removed)

    // State    const todoCount = state.useValue("todos.length");

    isSubmitting: boolean; // Whether submitting

    isValidating: boolean; // Whether validating    const addTodo = () => {

    isModified: boolean; // Whether modified        const todos = state.getValues().todos;

        state.setValue("todos", [

    // Value retrieval (with subscription - recommended)            ...todos,

    useFormValue: (fieldName: string) => any;            { id: Date.now(), text: "New todo", completed: false },

        ]);

    // Value retrieval (without subscription)        // When todos array changes, todos.length subscribers are automatically notified

    getFormValue: (fieldName: string) => any;    };

    getFormValues: () => T;

    const updateTodo = (index: number, newText: string) => {

    // Value setting        // Only content changes (same length) - no notification to todos.length subscribers

    setFormValue: (name: string, value: any) => void;        state.setValue(`todos.${index}.text`, newText);

    setFormValues: (values: Partial<T>) => void;    };

    setInitialFormValues: (values: T) => void;

    const removeTodo = (index: number) => {

    // Event handlers        state.removeField(`todos.${index}`);

    handleFormChange: (e: FormChangeEvent) => void;    };

    handleDatePickerChange: (fieldName: string) => DatePickerChangeHandler;

    return (

    // Form actions        <div>

    submit: (e?: React.FormEvent) => Promise<boolean>;            <p>First todo: {firstTodo}</p>

    resetForm: () => void;            <p>Total todos: {todoCount}</p>

    validateForm: () => Promise<boolean>;            <button onClick={addTodo}>Add Todo</button>

            <button onClick={() => removeTodo(0)}>Remove First Todo</button>

    // Compatibility (not recommended - causes full re-renders)        </div>

    values: T;    );

}}

````

// Dynamic field management

#### Basic Usagefunction DynamicForm() {

    const state = useFormaState<Record<string, any>>({});

`````typescript

const form = useForm({    const addField = (fieldName: string, defaultValue: any) => {

    initialValues: { name: "", email: "", age: 0 },        state.setValue(fieldName, defaultValue);

    onSubmit: async (values) => {    };

        await api.submitUser(values);

    },    const removeField = (fieldName: string) => {

    onValidate: async (values) => {        if (state.hasField(fieldName)) {

        return values.email.includes("@");            state.removeField(fieldName);

    },        }

});    };



// Individual field subscriptions (performance optimized)    return (

const name = form.useFormValue("name");        <div>

const email = form.useFormValue("email");            <button onClick={() => addField("newField", "")}>

```                Add New Field

            </button>

📚 **[Detailed form usage examples →](./examples-en.md#useform-examples)**            <button onClick={() => removeField("newField")}>

                Remove Field

---            </button>

            {state.hasField("newField") && (

### useGlobalForm                <input

                    value={state.useValue("newField")}

Extended hook for managing global form state. Includes all features of useForm.                    onChange={(e) => state.setValue("newField", e.target.value)}

                />

📚 **[Detailed usage guide](./useGlobalForm-guide-en.md)** for more information.            )}

        </div>

#### Signature    );

}

```typescript```

function useGlobalForm<T extends Record<string, any>>(

    props: UseGlobalFormProps<T>#### 🔢 **Array Length Subscription**

): UseGlobalFormReturn<T>;

````useFormaState` intelligently supports subscribing to array `length` properties:



#### Parameters```typescript

const state = useFormaState({

```typescript    todos: [

interface UseGlobalFormProps<T> {        { id: 1, text: "Todo 1" },

    /** Unique ID to identify the form globally */        { id: 2, text: "Todo 2" },

    formId: string;    ],

    /** Initial values */});

    initialValues?: Partial<T>;

    /** Auto cleanup when component unmounts (default: true) */// Subscribe only to array length - re-renders only when items are added/removed

    autoCleanup?: boolean;const todoCount = state.useValue("todos.length"); // 2

    /** Form submission handler */

    onSubmit?: (values: T) => Promise<void> | void;// Add item → notifies todos.length subscribers

    /** Form validation handler - return true for validation pass */state.setValue("todos", [...state.getValues().todos, newItem]);

    onValidate?: (values: T) => Promise<boolean> | boolean;

    /** Callback after form submission completion */// Change item content → no notification to todos.length subscribers (same length)

    onComplete?: (values: T) => void;state.setValue("todos.0.text", "Updated todo");

}```

`````

**Key Features:**

#### Return Value

-   ✅ **Smart Notifications**: Only notifies when array length actually changes

````typescript- ✅ **Performance Optimized**: Prevents unnecessary re-renders on content changes

interface UseGlobalFormReturn<T> extends UseFormReturn<T> {-   ✅ **Automatic Detection**: Auto-notifies `.length` subscribers when arrays change

    /** Global form identifier */

    formId: string;**Usage Examples:**

    /** Direct access to global store */

    _store: FieldStore<T>;```typescript

}// Counter component (re-renders only when length changes)

```function TodoCounter() {

    const count = state.useValue("todos.length");

#### Examples    return <span>Todos: {count}</span>;

}

##### Basic Usage

// Individual item component (re-renders only when that item changes)

```typescriptfunction TodoItem({ index }) {

// Create global form    const text = state.useValue(`todos.${index}.text`);

const form = useGlobalForm({    return <div>{text}</div>;

    formId: "user-form",}

    initialValues: { name: "", email: "" },```

    onSubmit: async (values) => {

        await api.submitUser(values);#### 🔄 **Field Refresh**

    },

});Use the `refreshFields` method to force refresh all field subscribers with a specific prefix. This is extremely useful for **performance optimization when batch processing large datasets**.



// Share same form state in another component**💡 Key Concept:**

const sharedForm = useGlobalForm({

    formId: "user-form", // Same ID to share state-   **Individual Updates**: Each field `setValue` → N re-renders

});-   **Batch Updates**: Entire data `setValue` + `refreshFields` → 1 re-render

````

````typescript

##### Multi-step Formconst state = useFormaState({

    user: { name: "John Doe", email: "john@example.com" },

```typescript    address: { city: "New York", street: "Broadway" },

// Step 1 Component    settings: { theme: "light", language: "en" },

function Step1() {    searchResults: [], // Large checkbox dataset

    const form = useGlobalForm({});

        formId: "wizard-form",    address: { city: "Seoul", street: "Gangnam-daero" },

        initialValues: {    settings: { theme: "light", language: "en" },

            personal: { name: "", email: "" },});

            address: { street: "", city: "" },

        },// Components subscribing to individual fields

    });const userName = state.useValue("user.name");

const userEmail = state.useValue("user.email");

    return (const addressCity = state.useValue("address.city");

        <div>

            <input// Refresh all fields with specific prefix

                name="personal.name"const refreshUserFields = () => {

                value={form.useFormValue("personal.name")}    // Refresh all fields starting with "user" (user.name, user.email)

                onChange={form.handleFormChange}    state.refreshFields("user");

            />};

            <input

                name="personal.email"const refreshAddressFields = () => {

                value={form.useFormValue("personal.email")}    // Refresh all fields starting with "address" (address.city, address.street)

                onChange={form.handleFormChange}    state.refreshFields("address");

            />};

        </div>

    );// Use case: Sync UI after external data source updates

}const syncWithServer = async () => {

    // Fetch latest data from server

// Step 2 Component    const latestUserData = await fetchUserFromServer();

function Step2() {

    const form = useGlobalForm({    // Update state (but subscribers might not re-render if values are the same)

        formId: "wizard-form", // Same formId to share state    state.setValue("user.name", latestUserData.name);

    });    state.setValue("user.email", latestUserData.email);



    return (    // Force refresh UI components even if values are identical

        <div>    state.refreshFields("user");

            <input};

                name="address.street"```

                value={form.useFormValue("address.street")}

                onChange={form.handleFormChange}#### 🚀 **Batch Processing Optimization for Large Datasets**

            />

            <input`refreshFields` provides dramatic performance improvements for scenarios like **100+ checkboxes, bulk table row updates**.

                name="address.city"

                value={form.useFormValue("address.city")}**📈 Performance Benefits:**

                onChange={form.handleFormChange}

            />-   100 checkboxes select all: **100x faster** (100 → 1 re-render)

            <button onClick={form.submit}>Submit</button>-   500 table rows update: **500x faster** (500 → 1 re-render)

        </div>

    );**🔗 Detailed usage and performance comparison:** [Performance Optimization Guide](./performance-optimization-en.md#-batch-processing-optimization-for-large-datasets)

}

```### useForm



📚 **[Global form detailed examples →](./examples-en.md#useglobalform-examples)**The main hook for managing local form state.



#### 🔄 **Automatic Memory Cleanup (autoCleanup)**#### Signature



`useGlobalForm` also supports **reference counting-based automatic cleanup**:```typescript

function useForm<T extends Record<string, any>>(

```typescript    props: UseFormProps<T>

const form = useGlobalForm({): UseFormReturn<T>;

    formId: "wizard-form",```

    autoCleanup: true, // Default - automatic cleanup

});#### Parameters



// autoCleanup: false - manual management```typescript

const persistentForm = useGlobalForm({interface UseFormProps<T> {

    formId: "persistent-form",    /** Initial values for the form */

    autoCleanup: false,    initialValues: T;

});    /** Form submission handler */

```    onSubmit?: (values: T) => Promise<void> | void;

    /** Form validation handler - returns true if validation passes */

**Automatic Cleanup Behavior:**    onValidate?: (values: T) => Promise<boolean> | boolean;

    /** Callback after form submission completes */

-   Automatically cleans up form when last user unmounts    onComplete?: (values: T) => void;

-   `autoCleanup: false`: Requires manual `useUnregisterGlobalForm`    /** Internal API: External store (used by useGlobalForm) */

    _externalStore?: FieldStore<T>;

📚 **[Automatic memory cleanup detailed examples →](./examples-en.md#automatic-memory-cleanup-examples)**}

````

#### Recommendations

#### Return Value

✅ **Recommendations:**

````typescript

-   Use `autoCleanup: true` (default) for most casesinterface UseFormReturn<T> {

-   Use manual cleanup only after complete form submission or user logout    // State

-   Rely on automatic cleanup for safety with shared forms    isSubmitting: boolean; // Whether form is being submitted

    isValidating: boolean; // Whether form is being validated

⚠️ **Warning:** Manual unregister immediately affects all components using that `formId`    isModified: boolean; // Whether form has been modified



---    // Value retrieval (with subscription - recommended)

    useFormValue: (fieldName: string) => any;

### useGlobalFormaState

    // Value retrieval (without subscription)

Hook for managing globally shared FormaState. Supports sharing state across multiple components while maintaining individual field subscriptions.    getFormValue: (fieldName: string) => any;

    getFormValues: () => T;

#### Signature

    // Value setting

```typescript    setFormValue: (name: string, value: any) => void;

function useGlobalFormaState<    setFormValues: (values: Partial<T>) => void;

    T extends Record<string, any> = Record<string, any>    setInitialFormValues: (values: T) => void;

>(props: UseGlobalFormaStateProps<T>): UseFormaStateReturn<T>;

```    // Event handlers

    handleFormChange: (e: FormChangeEvent) => void;

#### Parameters    handleDatePickerChange: (fieldName: string) => DatePickerChangeHandler;



```typescript    // Form actions

interface UseGlobalFormaStateProps<T> {    submit: (e?: React.FormEvent) => Promise<boolean>;

    /** Unique ID to identify the state globally */    resetForm: () => void;

    stateId: string;    validateForm: () => Promise<boolean>;

    /** Initial values (used only on first creation) */

    initialValues?: T;    // Compatibility (not recommended - causes full re-renders)

    /** Auto cleanup when component unmounts (default: true) */    values: T;

    autoCleanup?: boolean;}

    /** Optional callback for state changes */```

    onChange?: (values: T) => void;

    /** Enable deep equality checking for performance improvement */#### Examples

    deepEquals?: boolean;

    /** Error handler for state operations */##### Basic Usage

    onError?: (error: Error) => void;

    /** Enable validation on all changes */```typescript

    validateOnChange?: boolean;const form = useForm({

}    initialValues: {

```        name: "",

        email: "",

#### Return Value        age: 0,

    },

Returns the same `UseFormaStateReturn<T>` interface as `useFormaState`.    onSubmit: async (values) => {

        await api.submitUser(values);

#### Features    },

    onValidate: async (values) => {

-   **Global Sharing**: All components using the same `stateId` share state        return values.email.includes("@");

-   **Individual Field Subscriptions**: Independent re-rendering optimization per field    },

-   **Automatic Creation**: Creates new state if `stateId` doesn't exist});

-   **Type Safety**: Complete type inference through TypeScript

// Individual field subscription (performance optimization)

#### Basic Usageconst name = form.useFormValue("name");

const email = form.useFormValue("email");

```typescript```

// Create global state

const state = useGlobalFormaState({##### Nested Object Handling

    stateId: "user-data",

    initialValues: {```typescript

        user: { name: "", email: "" },const form = useForm({

        preferences: { theme: "light" },    initialValues: {

    },        user: {

});            profile: {

                name: "",

// Individual field subscriptions                settings: {

const userName = state.useValue("user.name");                    theme: "light",

const theme = state.useValue("preferences.theme");                },

            },

// Share same state in another component        },

const sharedState = useGlobalFormaState({    },

    stateId: "user-data", // Same ID to share state});

});

```// Access nested objects with dot notation

const name = form.useFormValue("user.profile.name");

📚 **[Global state detailed examples →](./examples-en.md#useglobalformastate-examples)**const theme = form.useFormValue("user.profile.settings.theme");

````

````typescript

// Basic shopping cart component---

function ShoppingCart() {

    const cart = useGlobalFormaState({### useGlobalForm

        stateId: "shopping-cart",

        initialValues: {Extended hook for managing global form state. Includes all features of useForm.

            items: [],

            total: 0,📚 **[Detailed Usage Guide](./useGlobalForm-guide-en.md)** for comprehensive examples.

        },

    });#### Signature



    // ✅ Recommended: .length subscription (re-renders only when array length changes)```typescript

    const itemCount = cart.useValue("items.length");function useGlobalForm<T extends Record<string, any>>(

    const total = cart.useValue("total");    props: UseGlobalFormProps<T>

): UseGlobalFormReturn<T>;

    return (```

        <div>

            <h2>Cart ({itemCount})</h2>#### Parameters

            <p>Total: ${total}</p>

        </div>```typescript

    );interface UseGlobalFormProps<T> {

}    /** Unique ID to identify the form globally */

    formId: string;

// Product addition component    /** Initial values for the form */

function ProductList() {    initialValues?: Partial<T>;

    const cart = useGlobalFormaState({    /** Auto cleanup on component unmount (default: true) */

        stateId: "shopping-cart",    autoCleanup?: boolean;

    });    /** Form submission handler */

    onSubmit?: (values: T) => Promise<void> | void;

    const addToCart = (product) => {    /** Form validation handler - returns true if validation passes */

        const currentItems = cart.getValues().items || [];    onValidate?: (values: T) => Promise<boolean> | boolean;

        cart.setValue("items", [...currentItems, product]);    /** Callback after form submission completion */

    onComplete?: (values: T) => void;

        // Update total}

        const newTotal =```

            currentItems.reduce((sum, item) => sum + item.price, 0) +

            product.price;#### Return Value

        cart.setValue("total", newTotal);

    };```typescript

interface UseGlobalFormReturn<T> extends UseFormReturn<T> {

    return (    /** Global form identifier */

        <button    formId: string;

            onClick={() => addToCart({ id: 1, name: "Product 1", price: 100 })}    /** Direct access to global store */

        >    _store: FieldStore<T>;

            Add Product}

        </button>```

    );

}#### Examples

````

##### Multi-Step Form

**Key Points:**

```````typescript

-   `itemCount = cart.useValue("items.length")`: Subscribe only to array length#### Examples

-   Use `.length` subscription instead of `items?.length || 0`

-   Performance optimized: Prevents unnecessary re-renders when array content changes##### Complete Global Form with Handlers



📚 **[Array Length Subscription Detailed Guide →](./performance-warnings-en.md#array-length-subscription)**```typescript

🔗 **[Performance Optimization Best Practices →](./performance-guide-en.md#performance-optimization)**// Global form with validation and submission logic

function GlobalFormExample() {

---    const form = useGlobalForm({

        formId: "user-form",

### 📖 **useUnregisterGlobalFormaState**        initialValues: { name: "", email: "", age: 0 },

        onValidate: async (values) => {

Hook for manually cleaning up global state.            // Name validation

            if (!values.name.trim()) {

#### Precautions                alert("Please enter your name.");

                return false;

1. **GlobalFormaProvider Required**: Must be used within component tree wrapped by `GlobalFormaProvider`.            }



2. **Initial Values Policy**: `initialValues` only applies on first call with same `stateId`.            // Email validation

            if (!values.email.includes("@")) {

3. **Memory Management**:                alert("Please enter a valid email.");

                return false;

    - `autoCleanup: true` (default): Automatic memory cleanup            }

    - `autoCleanup: false`: Manual `useUnregisterGlobalFormaState` required

            return true;

4. **Manual Unregister Precautions**:        },

        onSubmit: async (values) => {

    ```typescript            console.log("Global form submission:", values);

    // 🚨 Warning: Manual unregister immediately affects all references            await api.submitUser(values);

    function ComponentA() {        },

        const { unregisterState } = useUnregisterGlobalFormaState();        onComplete: (values) => {

        const state = useGlobalFormaState({ stateId: "shared" });            alert("Submission completed!");

        }

        const handleCleanup = () => {    });

            // This call immediately affects ComponentB too!

            unregisterState("shared");    return (

        };        <form onSubmit={form.submit}>

    }            <input

                name="name"

    function ComponentB() {                value={form.useFormValue("name")}

        const state = useGlobalFormaState({ stateId: "shared" });                onChange={form.handleFormChange}

        // Error possible if ComponentA manually removes            />

    }            <input

    ```                name="email"

                value={form.useFormValue("email")}

#### Recommendations                onChange={form.handleFormChange}

            />

1. **Use Default Settings**: Use `autoCleanup: true` (default) for most cases.            <button type="submit" disabled={form.isSubmitting}>

                {form.isSubmitting ? "Submitting..." : "Submit"}

2. **Manual Cleanup Usage Points**:            </button>

        </form>

    - Application global reset    );

    - User logout}

    - Special situations where memory optimization is critical

// Another component sharing the same form state

3. **Shared State Management**:function FormViewer() {

    const form = useGlobalForm({

    - Rely on `autoCleanup` for states used by multiple components        formId: "user-form", // Same ID shares state

    - Minimize manual cleanup for predictable lifecycle    });



4. **Debugging Tips**:    return (

    ```typescript        <div>

    // Track state in development environment            <p>Current name: {form.useFormValue("name")}</p>

    const state = useGlobalFormaState({            <p>Current email: {form.useFormValue("email")}</p>

        stateId: "debug-state",            <p>Modified: {form.isModified ? "Yes" : "No"}</p>

        onChange: (values) => {        </div>

            console.log("State changed:", values);    );

        },}

    });````

    ```

##### Multi-Step Form

---

```typescript

### useRegisterGlobalForm// Step 1 Component

function Step1() {

Hook for registering an existing useForm instance as a global form.    const form = useGlobalForm({

        formId: "user-registration",

#### Signature        initialValues: { name: "", email: "", phone: "" },

    });

```typescript

function useRegisterGlobalForm<T>(formId: string, form: UseFormReturn<T>): void;    return (

```        <TextField

            name="name"

#### Parameters            value={form.useFormValue("name")}

            onChange={form.handleFormChange}

-   `formId`: Unique identifier for the global form        />

-   `form`: useForm instance to register    );

}

#### Features

// Step 2 Component (shares same form state)

-   **Global Sharing**: Converts local form to global statefunction Step2() {

-   **Automatic Synchronization**: Registered form accessible from other components    const form = useGlobalForm({

-   **Type Safety**: Complete type inference through TypeScript        formId: "user-registration", // Same ID

        initialValues: { name: "", email: "", phone: "" },

#### Basic Usage    });



```typescript    return (

// Register local form as global        <TextField

const form = useForm({ initialValues: { name: "", email: "" } });            name="email"

useRegisterGlobalForm("shared-form", form);            value={form.useFormValue("email")}

            onChange={form.handleFormChange}

// Access from another component        />

const sharedForm = useGlobalForm({ formId: "shared-form" });    );

```}



📚 **[Registration/Unregistration hooks detailed examples →](./examples-en.md#registration-unregistration-hooks-examples)**// Final step - validation and submission

function FinalStep() {

---    const form = useGlobalForm({

        formId: "user-registration", // Same form state

### useRegisterGlobalFormaState        onValidate: async (values) => {

            return values.name && values.email && values.phone;

Hook for registering an existing useFormaState instance as global state.        },

        onSubmit: async (values) => {

#### Signature            await api.registerUser(values);

        },

```typescript    });

function useRegisterGlobalFormaState<T>(

    stateId: string,    return (

    formaState: UseFormaStateReturn<T>        <div>

): void;            <p>Name: {form.useFormValue("name")}</p>

```            <p>Email: {form.useFormValue("email")}</p>

            <p>Phone: {form.useFormValue("phone")}</p>

#### Parameters            <button onClick={form.submit} disabled={form.isSubmitting}>

                Complete Registration

-   `stateId`: Unique identifier for the global state            </button>

-   `formaState`: useFormaState instance to register        </div>

    );

#### Features}

```

-   **Global Sharing**: Converts local FormaState to global state

-   **Individual Field Subscriptions**: Registered state supports per-field subscriptions#### 🔄 **Auto Memory Cleanup (autoCleanup)**

-   **Automatic Synchronization**: Immediately accessible from other components

`useGlobalForm` supports **reference counting-based automatic cleanup**:

#### Example

```typescript

```typescript// Multi-step form with auto cleanup

import { useFormaState, useRegisterGlobalFormaState } from "@ehfuse/forma";function Step1() {

    const form = useGlobalForm({

function DataProvider() {        formId: "wizard-form",

    // Create local state        autoCleanup: true, // Default - auto cleanup

    const state = useFormaState({    });

        user: { name: "", email: "" },    return <input name="step1Field" />;

        settings: { theme: "light" },}

    });

function Step2() {

    // Register as global state    const form = useGlobalForm({

    useRegisterGlobalFormaState("app-data", state);        formId: "wizard-form", // Same form shared

        autoCleanup: true,

    return <div>Data Provider</div>;    });

}    return <input name="step2Field" />;

}

// Access from another component

function UserProfile() {// Persistent form requiring manual management

    const state = useGlobalFormaState({function PersistentForm() {

        stateId: "app-data",    const form = useGlobalForm({

    });        formId: "persistent-form",

        autoCleanup: false, // Manual management

    return <p>User: {state.useValue("user.name")}</p>;    });

}    return <input name="importantData" />;

```}

```

---

**Auto cleanup behavior:**

### useUnregisterGlobalForm

-   Step1 → Step2 navigation: Form state maintained (Step2 is using it)

Hook for removing registered global forms.-   Step2 completion and unmount: Form automatically cleaned up

-   `autoCleanup: false`: Manual cleanup via `useUnregisterGlobalForm` required

#### Signature

#### Important Notes & Best Practices

```typescript

function useUnregisterGlobalForm(): {⚠️ **Manual Unregister Caution:**

    unregisterForm: (formId: string) => boolean;

    clearForms: () => void;-   Calling `unregisterForm()` from `useUnregisterGlobalForm` immediately affects all components using that `formId`

};-   Manual cleanup in middle of multi-step form may cause data loss in other steps

```

✅ **Recommendations:**

#### Returns

-   Use `autoCleanup: true` (default) in most cases

-   `unregisterForm`: Function to remove specific form-   Manual cleanup only after complete form submission or user cancellation

-   `clearForms`: Function to remove all global forms-   Rely on auto cleanup for shared forms to ensure safety



#### Features---



-   **Memory Management**: Remove unnecessary form state### useGlobalFormaState

-   **Selective Removal**: Remove only specific forms

-   **Batch Cleanup**: Clean all forms at onceA hook for managing globally shared FormaState. Enables state sharing across multiple components while maintaining individual field-level subscriptions.



#### Basic Usage#### Signature



```typescript```typescript

const { unregisterForm, clearForms } = useUnregisterGlobalForm();function useGlobalFormaState<

    T extends Record<string, any> = Record<string, any>

// Remove specific form>(props: UseGlobalFormaStateProps<T>): UseFormaStateReturn<T>;

const success = unregisterForm("user-form");```



// Remove all forms#### Parameters

clearForms();

``````typescript

interface UseGlobalFormaStateProps<T> {

📚 **[Registration/Unregistration hooks detailed examples →](./examples-en.md#registration-unregistration-hooks-examples)**    /** Unique ID to identify the state globally */

    stateId: string;

---    /** Initial values (used only on first creation) */

    initialValues?: T;

### useUnregisterGlobalFormaState    /** Auto cleanup on component unmount (default: true) */

    autoCleanup?: boolean;

Hook for removing registered global FormaState.    /** Optional callback on state change */

    onChange?: (values: T) => void;

#### Signature    /** Enable deep equality checking for performance */

    deepEquals?: boolean;

```typescript    /** Error handler for state operations */

function useUnregisterGlobalFormaState(): {    onError?: (error: Error) => void;

    unregisterState: (stateId: string) => boolean;    /** Enable validation on all changes */

    clearStates: () => void;    validateOnChange?: boolean;

};}

```````

#### Returns#### Return Value

-   `unregisterState`: Function to remove specific stateReturns the same `UseFormaStateReturn<T>` interface as `useFormaState`.

-   `clearStates`: Function to remove all global states

#### Features

#### Features

-   **Global Sharing**: All components using the same `stateId` share the state

-   **Memory Optimization**: Clean unnecessary state- **Field-level Subscriptions**: Independent re-rendering optimization per field

-   **Flexible Management**: Choose individual or batch removal- **Auto Creation**: Creates new state if `stateId` doesn't exist

-   **Safe Removal**: Safely remove after cleaning subscribers- **Type Safety**: Full TypeScript type inference

#### Basic Usage#### Examples

````typescript##### Basic Usage

const { unregisterState, clearStates } = useUnregisterGlobalFormaState();

```typescript

// Remove specific stateimport { useGlobalFormaState, GlobalFormaProvider } from "@ehfuse/forma";

unregisterState("user-data");

// App.tsx

// Remove all statesfunction App() {

clearStates();    return (

```        <GlobalFormaProvider>

            <UserProfile />

📚 **[Registration/Unregistration hooks detailed examples →](./examples-en.md#registration-unregistration-hooks-examples)**            <UserSettings />

        </GlobalFormaProvider>

---    );

}

## Components

// User Profile Component

### GlobalFormaProviderfunction UserProfile() {

    const state = useGlobalFormaState({

Context Provider for global Forma state management.        stateId: "user-data",

        initialValues: {

#### Signature            user: { name: "", email: "" },

            preferences: { theme: "light", language: "en" },

```typescript        },

function GlobalFormaProvider({    });

    children,

}: {    const userName = state.useValue("user.name");

    children: ReactNode;    const userEmail = state.useValue("user.email");

}): JSX.Element;

```    return (

        <div>

#### Usage            <input

                value={userName}

```typescript                onChange={(e) => state.setValue("user.name", e.target.value)}

// App.tsx                placeholder="Name"

import { GlobalFormaProvider } from "@/forma";            />

            <input

function App() {                value={userEmail}

    return (                onChange={(e) => state.setValue("user.email", e.target.value)}

        <GlobalFormaProvider>                placeholder="Email"

            <Router>            />

                <Routes>        </div>

                    <Route path="/step1" element={<Step1 />} />    );

                    <Route path="/step2" element={<Step2 />} />}

                </Routes>

            </Router>// User Settings Component (shares same state)

        </GlobalFormaProvider>function UserSettings() {

    );    const state = useGlobalFormaState({

}        stateId: "user-data", // Same ID shares state

```        initialValues: {}, // Ignored since state already exists

    });

---

    const theme = state.useValue("preferences.theme");

## Core Classes    const language = state.useValue("preferences.language");

    const userName = state.useValue("user.name"); // Value from other component

### FieldStore

    return (

Core class that provides individual field-based state management and subscription system.        <div>

            <p>User: {userName}</p>

#### Constructor            <select

                value={theme}

```typescript                onChange={(e) =>

constructor(initialValues: T)                    state.setValue("preferences.theme", e.target.value)

```                }

            >

#### Methods                <option value="light">Light</option>

                <option value="dark">Dark</option>

##### getValue            </select>

        </div>

```typescript    );

getValue(fieldName: string): any}

````

Returns the current value of a specific field.##### Dynamic State Management

##### setValue```typescript

function DynamicStateManager() {

````typescript const [stateId, setStateId] = useState("session-1");

setValue(fieldName: string, value: any): void

```    const state = useGlobalFormaState({

        stateId,

Sets the value of a specific field. Supports dot notation.        initialValues: { data: {}, metadata: { created: Date.now() } },

    });

##### getValues

    const switchSession = (newId: string) => {

```typescript        setStateId(newId); // Switch to different global state

getValues(): T    };

````

    return (

Returns current values of all fields as an object. <div>

            <button onClick={() => switchSession("session-1")}>

##### setValues Session 1

            </button>

````typescript <button onClick={() => switchSession("session-2")}>

setValues(values: Partial<T>): void                Session 2

```            </button>

            <div>Current Session: {stateId}</div>

Sets values of multiple fields at once.            {/* State from currently selected session is displayed */}

        </div>

##### subscribe    );

}

```typescript```

subscribe(fieldName: string, callback: () => void): () => void

```##### Shopping Cart Example - Using .length Subscription



Subscribes to changes of a specific field. Returns unsubscribe function.```typescript

// Basic Shopping Cart Component

##### subscribeGlobalfunction ShoppingCart() {

    const cart = useGlobalFormaState({

```typescript        stateId: "shopping-cart",

subscribeGlobal(callback: () => void): () => void        initialValues: {

```            items: [],

            total: 0,

Subscribes to changes of all fields.        },

    });

##### reset

    // ✅ Recommended: .length subscription (rerenders only when array length changes)

```typescript    const itemCount = cart.useValue("items.length");

reset(): void    const total = cart.useValue("total");

````

    return (

Resets all fields to initial values. <div>

            <h2>Cart ({itemCount})</h2>

##### isModified <p>Total: ${total}</p>

        </div>

```typescript );

isModified(): boolean}

```

// Product List Component

Checks if changed from initial values.function ProductList() {

    const cart = useGlobalFormaState({

--- stateId: "shopping-cart",

    });

## TypeScript Types

    const addToCart = (product) => {

### FormChangeEvent const currentItems = cart.getValues().items || [];

        cart.setValue("items", [...currentItems, product]);

Unified type for form events. Supports various MUI component events.

        // Update total

```typescript const newTotal =

type FormChangeEvent =            currentItems.reduce((sum, item) => sum + item.price, 0) +

    | React.ChangeEvent<            product.price;

          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement        cart.setValue("total", newTotal);

      >    };

    | SelectChangeEvent

    | SelectChangeEvent<string | number>    return (

    | {        <button

          target: { name: string; value: any };            onClick={() => addToCart({ id: 1, name: "Product 1", price: 100 })}

          onChange?: (        >

              value: any,            Add Product

              context: PickerChangeHandlerContext<any>        </button>

          ) => void;    );

      };}

```

### DatePickerChangeHandler**Key Points:**

Event handler type dedicated to DatePicker.- `itemCount = cart.useValue("items.length")`: Subscribe to array length only

-   Use `.length` subscription instead of `items?.length || 0`

```typescript- Performance optimization: Prevents unnecessary rerenders when array content changes

type DatePickerChangeHandler = (

    fieldName: string📚 **[Array Length Subscription Detailed Guide →](./performance-optimization-en.md#array-length-subscription)**

) => (value: any, context?: PickerChangeHandlerContext<any>) => void;🔗 **[Performance Optimization Best Practices →](./best-practices-en.md#performance-optimization)**

```

#### 🔄 **Auto Memory Cleanup (autoCleanup)**

### UseFormProps

`useGlobalFormaState` provides **reference counting-based automatic cleanup**:

Parameter type for useForm hook.

````typescript

```typescript// Auto cleanup enabled by default

interface UseFormProps<T extends Record<string, any>> {const state = useGlobalFormaState({

    initialValues: T;    stateId: "shared-data",

    onSubmit?: (values: T) => Promise<void> | void;    autoCleanup: true, // Default value

    onValidate?: (values: T) => Promise<boolean> | boolean;});

    onComplete?: (values: T) => void;

    _externalStore?: FieldStore<T>;// Disable auto cleanup

}const persistentState = useGlobalFormaState({

```    stateId: "persistent-data",

    autoCleanup: false, // Manual management

### UseGlobalFormProps});

````

Parameter type for useGlobalForm hook.

**How it works:**

````typescript

interface UseGlobalFormProps<T extends Record<string, any>> {```typescript

    formId: string;// Component A mounts → Reference count: 1

    initialValues?: Partial<T>;function ComponentA() {

    autoCleanup?: boolean;    const state = useGlobalFormaState({

    onSubmit?: (values: T) => Promise<void> | void;        stateId: "shared",

    onValidate?: (values: T) => Promise<boolean> | boolean;        autoCleanup: true,

    onComplete?: (values: T) => void;    });

}    return <div>{state.useValue("data")}</div>;

```}



### UseGlobalFormaStateProps// Component B mounts → Reference count: 2

function ComponentB() {

Parameter type for useGlobalFormaState hook.    const state = useGlobalFormaState({

        stateId: "shared", // Same ID

```typescript        autoCleanup: true,

interface UseGlobalFormaStateProps<T extends Record<string, any>> {    });

    stateId: string;    return <div>{state.useValue("data")}</div>;

    initialValues?: T;}

    autoCleanup?: boolean;

    onChange?: (values: T) => void;// Component A unmounts → Reference count: 1 (state preserved)

    deepEquals?: boolean;// Component B unmounts → Reference count: 0 → 🗑️ Auto cleanup!

    onError?: (error: Error) => void;```

    validateOnChange?: boolean;

}**Benefits:**

````

-   ✅ **Safe Sharing**: States in use by other components are protected

### GlobalFormaContextType- ✅ **Auto Cleanup**: Memory automatically freed when last user leaves

-   ✅ **Memory Optimization**: Prevents unnecessary state accumulation

Type for global form context.

#### Important Notes

````typescript

interface GlobalFormaContextType {1. **GlobalFormaProvider Required**: Must be used within a component tree wrapped by `GlobalFormaProvider`.

    getOrCreateStore: <T extends Record<string, any>>(

        formId: string,2. **Initial Values Policy**: `initialValues` are only applied on the first call with a given `stateId`.

        initialValues: T

    ) => FieldStore<T>;3. **Memory Management**:

    registerStore: <T extends Record<string, any>>(

        formId: string,    - `autoCleanup: true` (default): Automatic memory cleanup

        store: FieldStore<T>    - `autoCleanup: false`: Manual cleanup via `useUnregisterGlobalFormaState` required

    ) => void;

    unregisterStore: (formId: string) => boolean;4. **Manual Unregister Caution**:

    clearStores: () => void;

}    ```typescript

```    // 🚨 Warning: Manual unregister immediately affects all references

    function ComponentA() {

### UseUnregisterGlobalFormReturn        const { unregisterState } = useUnregisterGlobalFormaState();

        const state = useGlobalFormaState({ stateId: "shared" });

Return type for useUnregisterGlobalForm hook.

        const handleCleanup = () => {

```typescript            // This call immediately affects ComponentB too!

interface UseUnregisterGlobalFormReturn {            unregisterState("shared");

    unregisterForm: (formId: string) => boolean;        };

    clearForms: () => void;    }

}

```    function ComponentB() {

        const state = useGlobalFormaState({ stateId: "shared" });

### UseUnregisterGlobalFormaStateReturn        // Error possible if ComponentA manually removes the state

    }

Return type for useUnregisterGlobalFormaState hook.    ```



```typescript#### Best Practices

interface UseUnregisterGlobalFormaStateReturn {

    unregisterState: (stateId: string) => boolean;1. **Use Default Settings**: Recommend using `autoCleanup: true` (default) in most cases.

    clearStates: () => void;

}2. **Manual Cleanup Timing**:

````

    - Application-wide reset

--- - User logout

    - Special situations requiring memory optimization

## Best Practices

3. **Shared State Management**:

### Performance Optimization

    - Rely on `autoCleanup` for states used by multiple components

````typescript - Minimize manual cleanup for predictable lifecycle

// ✅ Recommended: Individual field subscriptions

const name = form.useFormValue("name");4. **Debugging Tips**:

    ```typescript

// ❌ Not recommended: Full object subscription    // Track state changes in development

const { name } = form.values;    const state = useGlobalFormaState({

```        stateId: "debug-state",

        onChange: (values) => {

**Core Principles:**            console.log("State changed:", values);

        },

-   Use individual field subscriptions to optimize re-rendering    });

-   Utilize array length subscriptions (`todos.length`)    ```

-   Use batch processing + `refreshFields` for bulk data

---

📚 **[Performance Optimization Guide →](./performance-guide-en.md)**

⚠️ **[Performance Optimization Warnings →](./performance-warnings-en.md)**### useRegisterGlobalForm



---Hook for registering an existing useForm instance as a global form.



## Migration Guide#### Signature



### From React Hook Form```typescript

function useRegisterGlobalForm<T>(formId: string, form: UseFormReturn<T>): void;

```typescript```

// React Hook Form

const { register, handleSubmit, watch } = useForm();#### Parameters

const name = watch("name");

-   `formId`: Unique identifier for the global form

// Forma-   `form`: useForm instance to register

const form = useForm({ initialValues: { name: "" } });

const name = form.useFormValue("name");#### Features

````

-   **Global Sharing**: Converts local forms to global state

### From Formik- **Auto Sync**: Registered forms are accessible from other components

-   **Type Safety**: Complete type inference through TypeScript

````typescript

// Formik#### Example

const formik = useFormik({ initialValues: { name: "" } });

const name = formik.values.name;```typescript

import { useForm, useRegisterGlobalForm } from "@ehfuse/forma";

// Forma

const form = useForm({ initialValues: { name: "" } });function MyComponent() {

const name = form.useFormValue("name");    // Create local form

```    const form = useForm<{ name: string; email: string }>({

        initialValues: { name: "", email: "" },

📚 **[Detailed Migration Guide →](./migration-en.md)**        onSubmit: async (values) => console.log(values),

    });

---

    // Register as global form

This API reference covers all public APIs of the Forma library.    useRegisterGlobalForm("shared-form", form);



## Related Documents    return (

        <input

-   **[API Reference](./API-en.md)** - Detailed explanation of all APIs            value={form.useFormValue("name")}

-   **[Examples Collection](./examples-en.md)** - Practical usage examples            onChange={form.handleFormChange}

-   **[Performance Optimization Guide](./performance-guide-en.md)** - Performance optimization methods            name="name"

-   **[Performance Optimization Warnings](./performance-warnings-en.md)** - Anti-patterns and warnings        />

-   **[Migration Guide](./migration-en.md)** - Migration from other libraries    );

-   **[useGlobalForm Guide](./useGlobalForm-guide-en.md)** - Global form state management}

-   **[Global Hooks Comparison Guide](./global-hooks-comparison-en.md)** - Differences between global hooks

-   **[Library Comparison Guide](./library-comparison-en.md)** - Comparison with other state management libraries// Access from another component

function AnotherComponent() {

Please feel free to contact us if you need additional questions or examples.    const form = useGlobalForm<{ name: string; email: string }>({
        formId: "shared-form",
    });

    return <p>Name: {form.useFormValue("name")}</p>;
}
````

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

Utility function to get values from nested objects. Starting from v1.4.9, provides special handling for `.length` properties.

#### Signature

```typescript
function getNestedValue(obj: any, path: string): any;
```

#### Parameters

-   `obj`: Target object
-   `path`: Access path (e.g., "user.profile.name")

#### Special Features

-   **`.length` property optimization**: When an array is `undefined`, `.length` returns `0`. Subscription is maintained.

#### Important Notes

-   Do not use fallback code like `|| 0` when subscribing to `.length`. This is already handled internally.

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

// Special .length handling
const data = { items: undefined };
const length = getNestedValue(data, "items.length"); // 0 (instead of undefined)

const dataWithArray = { items: [1, 2, 3] };
const actualLength = getNestedValue(dataWithArray, "items.length"); // 3
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

3. **Batch Processing for Large Datasets**

    ```typescript
    // ✅ Recommended: Batch processing + refreshFields (see performance guide for details)
    state.setValue("items", updatedItems);
    state.refreshFields("items"); // Only 1 re-render

    // 🔗 Details: See Performance Optimization Guide
    ```

4. **Leverage Array Length Subscriptions**

    ```typescript
    // ✅ Counter subscribes only to length
    const TodoCounter = () => {
        const count = state.useValue("todos.length");
        return <span>{count} items</span>;
    };

    // ✅ Individual items subscribe only to their index
    const TodoItem = ({ index }) => {
        const todo = state.useValue(`todos.${index}`);
        return <div>{todo.text}</div>;
    };
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
