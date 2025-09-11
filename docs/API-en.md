# Forma API Reference

This document provides detailed reference for all APIs in the Forma library.

## Table of Contents

- [Hooks](#hooks)
    - [useForm](#useform)
    - [useGlobalForm](#useglobalform)
    - [useRegisterGlobalForm](#useregisterglobalform)
- [Components](#components)
    - [GlobalFormProvider](#globalformprovider)
- [Core Classes](#core-classes)
    - [FieldStore](#fieldstore)
- [Utilities](#utilities)
    - [getNestedValue](#getnestedvalue)
    - [setNestedValue](#setnestedvalue)
- [TypeScript Types](#typescript-types)

---

## Hooks

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
    initialValues: { name: "", email: "", phone: "" }
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
    initialValues: { name: "", email: "", phone: "" }
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

### useRegisterGlobalForm

Hook for registering an existing useForm instance as a global form.

#### Signature

```typescript
function useRegisterGlobalForm<T>(formId: string, form: UseFormReturn<T>): void;
```

#### Parameters

- `formId`: Unique identifier for the global form
- `form`: useForm instance to register

#### Features

- **Global Sharing**: Converts local forms to global state
- **Auto Sync**: Registered forms are accessible from other components
- **Type Safety**: Complete type inference through TypeScript

#### Example

```typescript
import { useForm, useRegisterGlobalForm } from '@ehfuse/forma';

function MyComponent() {
    // Create local form
    const form = useForm<{ name: string; email: string }>({
        initialValues: { name: '', email: '' },
        onSubmit: async (values) => console.log(values)
    });

    // Register as global form
    useRegisterGlobalForm('shared-form', form);

    return (
        <input
            value={form.useFormValue('name')}
            onChange={form.handleFormChange}
            name="name"
        />
    );
}

// Access from another component
function AnotherComponent() {
    const form = useGlobalForm<{ name: string; email: string }>({
        formId: 'shared-form'
    });

    return <p>Name: {form.useFormValue('name')}</p>;
}
```

---

## Components

### GlobalFormProvider

Context Provider for global form state management.

#### Signature

```typescript
function GlobalFormProvider({ children }: { children: ReactNode }): JSX.Element;
```

#### Usage

```typescript
// App.tsx
import { GlobalFormProvider } from "@/forma";

function App() {
  return (
    <GlobalFormProvider>
      <Router>
        <Routes>
          <Route path="/step1" element={<Step1 />} />
          <Route path="/step2" element={<Step2 />} />
        </Routes>
      </Router>
    </GlobalFormProvider>
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

- `obj`: Target object
- `path`: Access path (e.g., "user.profile.name")

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

- `obj`: Target object
- `path`: Path to set (e.g., "user.profile.name")
- `value`: Value to set

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

### GlobalFormContextType

Type for the global form context.

```typescript
interface GlobalFormContextType {
    getOrCreateStore: <T extends Record<string, any>>(
        formId: string,
        initialValues: T
    ) => FieldStore<T>;
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
