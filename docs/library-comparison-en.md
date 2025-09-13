# Forma vs Other State Management Libraries

## 📋 Overview

Forma is a React state management library specialized for form management. This document compares Forma with other popular state management libraries, explaining the pros and cons of each and appropriate usage scenarios.

## 🎯 Forma's Core Features

### 1. Form-Specialized Design 🎨

-   API optimized for form management
-   Built-in validation, submission, and error handling
-   Perfect integration with Material-UI (MUI)

### 2. Individual Field Subscriptions ⚡

-   Field-specific selective re-rendering
-   Excellent performance in large forms
-   Native dot notation support

### 3. TypeScript-First Design 📝

-   Strong type inference
-   Optimized IDE auto-completion
-   Compile-time error prevention

## 🔍 Major Library Comparisons

### vs React Hook Form 📋

#### Code Comparison

```typescript
// React Hook Form
const { register, handleSubmit, watch } = useForm();
const name = watch("name"); // Risk of entire form re-rendering

// Forma
const form = useForm();
const name = form.useFormValue("name"); // Only that field re-renders
```

#### Pros and Cons Comparison

| Feature             | Forma                            | React Hook Form                  |
| ------------------- | -------------------------------- | -------------------------------- |
| **Performance**     | ✅ Individual field subscription | ⚠️ Re-rendering when using watch |
| **TypeScript**      | ✅ Strong type inference         | ✅ Good type support             |
| **MUI Integration** | ✅ Perfect integration           | ⚠️ Additional setup required     |
| **Ecosystem**       | ⚠️ New library                   | ✅ Large community               |
| **Bundle Size**     | ✅ Medium size                   | ✅ Lightweight                   |
| **Learning Curve**  | ✅ Intuitive                     | ✅ Easy                          |

**When Forma is better:**

-   When performance is critical in complex forms
-   Projects primarily using MUI
-   TypeScript projects requiring strong type support

**When React Hook Form is better:**

-   When proven stability is important
-   Need rich ecosystem and community support
-   Prefer uncontrolled approach

### vs Formik 📝

#### Code Comparison

```typescript
// Formik
<Formik>
    {({ values, setFieldValue }) => (
        <Field name="user.name" /> // Entire form re-renders
    )}
</Formik>;

// Forma
const userName = form.useFormValue("user.name"); // Only field re-renders
<TextField
    name="user.name"
    value={userName}
    onChange={form.handleFormChange}
/>;
```

#### Pros and Cons Comparison

| Feature            | Forma                     | Formik                   |
| ------------------ | ------------------------- | ------------------------ |
| **Performance**    | ✅ Optimized re-rendering | ❌ Frequent re-rendering |
| **API Complexity** | ✅ Simple API             | ⚠️ Complex render props  |
| **TypeScript**     | ✅ Excellent support      | ⚠️ Limited support       |
| **Maintenance**    | ✅ Active development     | ⚠️ Maintenance mode      |
| **Bundle Size**    | ✅ Medium size            | ✅ Medium size           |

**When Forma is better:**

-   Performance-critical large forms
-   Modern development environment
-   TypeScript projects

**When Formik is better:**

-   High migration costs from existing Formik projects
-   Teams familiar with render props pattern

### vs Zustand/Redux 🏪

#### Role Differences

```typescript
// Zustand (general state management)
const name = useStore((state) => state.user.name);
// Must implement form validation and submission logic directly

// Forma (form-specialized)
const form = useForm({
    validation: { name: "required" },
    onSubmit: async (values) => {
        /* submission logic */
    },
});
const name = form.useFormValue("user.name");
```

#### Pros and Cons Comparison

| Feature             | Forma                 | Zustand                  | Redux                    |
| ------------------- | --------------------- | ------------------------ | ------------------------ |
| **Form Management** | ✅ Dedicated features | ⚠️ Manual implementation | ⚠️ Manual implementation |
| **General State**   | ⚠️ Limited            | ✅ Excellent             | ✅ Excellent             |
| **Performance**     | ✅ Form-optimized     | ✅ Good                  | ✅ Good                  |
| **Dev Tools**       | ⚠️ Limited            | ✅ Simple                | ✅ Redux DevTools        |
| **Learning Curve**  | ✅ Easy               | ✅ Easy                  | ⚠️ Complex               |

**Different roles:**

-   **Zustand/Redux**: General state management
-   **Forma**: Form-specific state management

### vs TanStack Form 🆕

#### Code Comparison

```typescript
// TanStack Form
const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
        /* submit */
    },
});

// Forma
const form = useForm({
    initialValues: { name: "" },
    onSubmit: async (values) => {
        /* submit */
    },
});
```

#### Pros and Cons Comparison

| Feature             | Forma                            | TanStack Form       |
| ------------------- | -------------------------------- | ------------------- |
| **Performance**     | ✅ Individual field subscription | ✅ Optimized        |
| **TypeScript**      | ✅ Strong support                | ✅ Strong support   |
| **MUI Integration** | ✅ Perfect integration           | ⚠️ Additional setup |
| **Maturity**        | ⚠️ New                           | ⚠️ New              |
| **Size**            | ✅ Medium                        | ✅ Small            |

## 📊 Performance Comparison

### Large Form Scenario (50 fields)

```
Number of re-rendered components when 1 field changes:

┌─────────────────┬─────────────────┐
│ Library         │ Re-renders      │
├─────────────────┼─────────────────┤
│ Formik          │ 50 (entire)    │
│ RHF + watch     │ 10-20           │
│ Forma           │ 1 (that field)  │
│ TanStack Form   │ 1-2             │
└─────────────────┴─────────────────┘
```

### Memory Usage

-   **Forma**: Medium level (managing individual subscribers)
-   **RHF**: Low (uncontrolled approach)
-   **Formik**: High (entire state management)

## 🎯 Selection Guide

### When to Choose Forma ✅

1. **Form-Centric Applications**

    - Survey platforms
    - Form management systems
    - Complex multi-step forms

2. **Performance-Critical Forms**

    - 50+ fields
    - Frequent real-time updates
    - Mobile environment optimization

3. **MUI Projects**

    - Material-UI based design systems
    - MUI component-centric development

4. **TypeScript Projects**
    - Strong type safety required
    - IDE auto-completion important

### When to Consider Other Libraries ⚠️

1. **Choose React Hook Form:**

    - Ecosystem and plugins are important
    - Community support matters for the project
    - Proven stability is priority

2. **Need General State Management:**

    - Complex global state management beyond forms
    - Debugging tools like Redux DevTools important
    - Server state management also needed

3. **Existing Projects:**
    - Already using other libraries
    - High migration costs

## 🚀 Migration Guide

### From React Hook Form

```typescript
// Before (RHF)
const { register, handleSubmit, watch } = useForm();
const name = watch("name");

// After (Forma)
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
```

### From Formik

```typescript
// Before (Formik)
<Formik initialValues={{ name: "" }}>
    {({ values, setFieldValue }) => (
        <input
            value={values.name}
            onChange={(e) => setFieldValue("name", e.target.value)}
        />
    )}
</Formik>;

// After (Forma)
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
return <input name="name" value={name} onChange={form.handleFormChange} />;
```

## 📈 Performance Optimization Tips

### Getting Best Performance with Forma

1. **Use Individual Field Subscriptions**

```typescript
// ✅ Good
const name = form.useFormValue("name");
const email = form.useFormValue("email");

// ❌ Avoid
const allValues = form.getValues(); // Subscribe to entire state
```

2. **Conditional Subscriptions**

```typescript
// ✅ Conditional subscription for conditional rendering
{
    showAdvanced && form.useFormValue("advanced.option");
}
```

3. **Utilize Memoization**

```typescript
const expensiveValue = useMemo(() => {
    return computeExpensiveValue(form.useFormValue("input"));
}, [form.useFormValue("input")]);
```

## 🔮 Future Outlook

### Forma's Roadmap

-   React Server Components support
-   Integration with more UI libraries
-   Advanced performance optimization

### Ecosystem Trends

-   Performance optimization competition among form libraries
-   Enhanced TypeScript support
-   Utilizing React 19+ new features

## 📞 Conclusion

**Forma is the optimal choice when:**

-   Forms are core to your application
-   Performance optimization is crucial for complex forms
-   Using MUI in TypeScript projects
-   New technology adoption is possible in early-stage projects

**But other libraries might be better when:**

-   Proven stability is most important
-   Must consider existing team experience and learning curve
-   General state management is more important than forms

**The key to selection is choosing the right tool that fits your project requirements and team situation.**

---

📚 **Related Documentation**

-   [Forma Getting Started Guide](./getting-started-en.md)
-   [Global Hooks Comparison Guide](./global-hooks-comparison-en.md)
-   [Performance Optimization Guide](./best-practices-en.md)
