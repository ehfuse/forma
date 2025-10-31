# Forma Migration Guide

Guide for migrating from other form libraries to Forma.

## Migration from React Hook Form

### Basic Form Usage

**React Hook Form:**

```typescript
import { useForm } from "react-hook-form";

function MyForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: { name: "", email: "" },
    });

    const name = watch("name");

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("name", { required: true })} />
            <input {...register("email", { required: true })} />
            <button type="submit">Submit</button>
        </form>
    );
}
```

**Forma:**

```typescript
import { useForm } from "@ehfuse/forma";

function MyForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
        onSubmit: (values) => {
            console.log(values);
        },
        onValidate: (values) => {
            return values.name && values.email; // Simple validation
        },
    });

    const name = form.useFormValue("name");

    return (
        <form onSubmit={form.submit}>
            <input
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
            <input
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
            />
            <button type="submit" disabled={form.isSubmitting}>
                Submit
            </button>
        </form>
    );
}
```

### Field Subscription Optimization

**React Hook Form:**

```typescript
// Subscribe to fields with watch (possible whole form re-rendering)
const name = watch("name");
const email = watch("email");
```

**Forma:**

```typescript
// Performance optimization with individual field subscriptions
const name = form.useFormValue("name");
const email = form.useFormValue("email");
```

### Nested Object Handling

**React Hook Form:**

```typescript
// Dot notation in register
<input {...register("user.profile.name")} />;
const profileName = watch("user.profile.name");
```

**Forma:**

```typescript
// Natural dot notation support
<input
    name="user.profile.name"
    value={form.useFormValue("user.profile.name")}
    onChange={form.handleFormChange}
/>;
const profileName = form.useFormValue("user.profile.name");
```

## Migration from Formik

### Basic Form

**Formik:**

```typescript
import { useFormik } from "formik";

function MyForm() {
    const formik = useFormik({
        initialValues: { name: "", email: "" },
        onSubmit: (values) => {
            console.log(values);
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
            />
            <input
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```

**Forma:**

```typescript
import { useForm } from "@ehfuse/forma";

function MyForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
        onSubmit: (values) => {
            console.log(values);
        },
    });

    return (
        <form onSubmit={form.submit}>
            <input
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
            <input
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
            />
            <button type="submit" disabled={form.isSubmitting}>
                Submit
            </button>
        </form>
    );
}
```

### Performance Comparison

**Formik (potential performance issues):**

```typescript
// ❌ Whole object subscription - re-renders on all field changes
const { values } = useFormik({...});
return (
    <div>
        <input value={values.name} onChange={...} />
        <input value={values.email} onChange={...} />
    </div>
);
```

**Formik (optimized with useField):**

```typescript
// ✅ Formik's optimized approach
import { useField } from "formik";

function NameField() {
    const [field] = useField("name");
    return <input {...field} />;
}
```

**Forma (always optimized):**

```typescript
// ✅ Always optimized by default
const name = form.useFormValue("name");
const email = form.useFormValue("email");
```

## Migration from Redux Forms

### Basic Setup

**Redux Forms:**

```typescript
import { Field, reduxForm } from "redux-form";

let ContactForm = (props) => {
    const { handleSubmit } = props;
    return (
        <form onSubmit={handleSubmit}>
            <Field name="name" component="input" type="text" />
            <Field name="email" component="input" type="email" />
            <button type="submit">Submit</button>
        </form>
    );
};

ContactForm = reduxForm({
    form: "contact",
})(ContactForm);
```

**Forma:**

```typescript
import { useForm } from "@ehfuse/forma";

function ContactForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
        onSubmit: (values) => {
            console.log(values);
        },
    });

    return (
        <form onSubmit={form.submit}>
            <input
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
            <input
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```

## Key Migration Benefits

### 1. **Zero Configuration**

**Before (React Hook Form/Formik):**

```typescript
// Need to set up validation schemas, error handling, etc.
const schema = yup.object().shape({...});
const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
});
```

**After (Forma):**

```typescript
// Start immediately without any setup
const form = useForm(); // Zero configuration!
```

### 2. **Individual Field Subscriptions**

**Before:**

```typescript
// Potential whole form re-renders
const values = formik.values;
```

**After:**

```typescript
// Only specific field re-renders
const name = form.useFormValue("name");
```

### 3. **Global State Management**

**Before:**

```typescript
// Need external state management for form sharing
const [formData, setFormData] = useState({});
```

**After:**

```typescript
// Built-in global form state
const form = useGlobalForm({ formId: "shared-form" });
```

### 4. **MUI Integration**

**Before:**

```typescript
// Manual integration required
<TextField {...register("name")} error={!!errors.name} />
```

**After:**

```typescript
// Perfect MUI integration
<TextField
    name="name"
    value={form.useFormValue("name")}
    onChange={form.handleFormChange}
/>
```

## Migration Checklist

### ✅ Steps to Take

1. **Install Forma**

    ```bash
    npm install @ehfuse/forma
    ```

2. **Replace form hooks**

    - `useForm` from react-hook-form → `useForm` from @ehfuse/forma
    - `useFormik` → `useForm` from @ehfuse/forma

3. **Update field bindings**

    - Replace `register` or `formik.values` with `form.useFormValue`
    - Use `form.handleFormChange` for onChange handlers

4. **Update validation**

    - Move validation logic to `onValidate` callback

5. **Update submission**
    - Use `form.submit` or `onSubmit` callback

### 🎯 Performance Optimizations

1. **Use individual field subscriptions**

    ```typescript
    // ✅ Do this
    const name = form.useFormValue("name");

    // ❌ Not this
    const { name } = form.values;
    ```

2. **Leverage global forms for multi-component usage**

    ```typescript
    const form = useGlobalForm({ formId: "user-registration" });
    ```

3. **Use dot notation for nested objects**
    ```typescript
    const userName = form.useFormValue("user.profile.name");
    ```

## Common Migration Issues

### 1. **Field Registration**

**Old way (React Hook Form):**

```typescript
<input {...register("name")} />
```

**New way (Forma):**

```typescript
<input
    name="name"
    value={form.useFormValue("name")}
    onChange={form.handleFormChange}
/>
```

### 2. **Validation**

**Old way (Formik/React Hook Form):**

```typescript
const validationSchema = yup.object({...});
```

**New way (Forma):**

```typescript
const form = useForm({
    onValidate: (values) => {
        return values.name && values.email; // Return boolean
    },
});
```

### 3. **Error Handling**

**Old way:**

```typescript
{
    errors.name && <span>Name is required</span>;
}
```

**New way:**

```typescript
// Validation feedback through onValidate callback
const form = useForm({
    onValidate: (values) => {
        if (!values.name) {
            alert("Name is required"); // or set error state
            return false;
        }
        return true;
    },
});
```

## Related Documents

-   **[API Reference](./API.md)** - Complete API documentation
-   **[Getting Started Guide](./getting-started.md)** - Basic usage
-   **[Performance Guide](./performance-guide.md)** - Optimization best practices
-   **[Examples Collection](./examples/basic-example.md)** - Practical examples
