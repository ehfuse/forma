# Library Comparison# Forma vs Other State Management Libraries

Comprehensive comparison of Forma with other popular form and state management libraries.## 📋 Overview

## Form Libraries ComparisonForma is a React state management library specialized for form management. This document compares Forma with other popular state management libraries, explaining the pros and cons of each and appropriate usage scenarios.

### Forma vs React Hook Form vs Formik## 🎯 Forma's Core Features

| Feature | Forma | React Hook Form | Formik |### 1. Form-Specialized Design 🎨

|---------|-------|-----------------|--------|

| **Performance** | ✅ Individual field subscriptions | ✅ Uncontrolled components | ⚠️ Controlled components |- API optimized for form management

| **Learning Curve** | ✅ Simple API | ⚠️ Medium complexity | ⚠️ Medium complexity |- Built-in validation, submission, and error handling

| **TypeScript Support** | ✅ Full support | ✅ Full support | ✅ Full support |- Perfect integration with Material-UI (MUI)

| **Bundle Size** | ✅ Lightweight | ✅ Small | ⚠️ Larger |

| **Global State** | ✅ Built-in | ❌ External solution needed | ❌ External solution needed |### 2. Individual Field Subscriptions ⚡

| **Dot Notation** | ✅ Native support | ✅ Supported | ✅ Supported |

| **Zero Config** | ✅ Start immediately | ⚠️ Setup required | ⚠️ Setup required |- Field-specific selective re-rendering

| **MUI Integration** | ✅ Perfect | ⚠️ Manual setup | ⚠️ Manual setup |- Excellent performance in large forms

-   Native dot notation support

### Code Comparison

### 3. TypeScript-First Design 📝

**Simple Form Example**

-   Strong type inference

**Forma:**- Optimized IDE auto-completion

````tsx- Compile-time error prevention

const form = useForm({

    initialValues: { name: "", email: "" },## 🔍 Major Library Comparisons

    onSubmit: (values) => console.log(values)

});### vs React Hook Form 📋



return (#### Code Comparison

    <form onSubmit={form.submit}>

        <input name="name" value={form.useFormValue("name")} onChange={form.handleFormChange} />```typescript

        <input name="email" value={form.useFormValue("email")} onChange={form.handleFormChange} />// React Hook Form

        <button type="submit">Submit</button>const { register, handleSubmit, watch } = useForm();

    </form>const name = watch("name"); // Risk of entire form re-rendering

);

```// Forma

const form = useForm();

**React Hook Form:**const name = form.useFormValue("name"); // Only that field re-renders

```tsx```

const { register, handleSubmit } = useForm();

#### Pros and Cons Comparison

return (

    <form onSubmit={handleSubmit((data) => console.log(data))}>| Feature             | Forma                            | React Hook Form                  |

        <input {...register("name")} />| ------------------- | -------------------------------- | -------------------------------- |

        <input {...register("email")} />| **Performance**     | ✅ Individual field subscription | ⚠️ Re-rendering when using watch |

        <button type="submit">Submit</button>| **TypeScript**      | ✅ Strong type inference         | ✅ Good type support             |

    </form>| **MUI Integration** | ✅ Perfect integration           | ⚠️ Additional setup required     |

);| **Ecosystem**       | ⚠️ New library                   | ✅ Large community               |

```| **Bundle Size**     | ✅ Medium size                   | ✅ Lightweight                   |

| **Learning Curve**  | ✅ Intuitive                     | ✅ Easy                          |

**Formik:**

```tsx**When Forma is better:**

const formik = useFormik({

    initialValues: { name: "", email: "" },-   When performance is critical in complex forms

    onSubmit: (values) => console.log(values)-   Projects primarily using MUI

});-   TypeScript projects requiring strong type support



return (**When React Hook Form is better:**

    <form onSubmit={formik.handleSubmit}>

        <input name="name" value={formik.values.name} onChange={formik.handleChange} />-   When proven stability is important

        <input name="email" value={formik.values.email} onChange={formik.handleChange} />-   Need rich ecosystem and community support

        <button type="submit">Submit</button>-   Prefer uncontrolled approach

    </form>

);### vs Formik 📝

````

#### Code Comparison

## State Management Comparison

```typescript

### Forma vs Redux vs Zustand vs Jotai// Formik

<Formik>

| Feature | Forma | Redux | Zustand | Jotai |    {({ values, setFieldValue }) => (

|---------|-------|-------|---------|-------|        <Field name="user.name" /> // Entire form re-renders

| **Setup Complexity** | ✅ Zero config | ❌ Complex setup | ✅ Simple | ✅ Simple |    )}

| **Individual Subscriptions** | ✅ Built-in | ⚠️ Manual selectors | ⚠️ Manual selectors | ✅ Atomic |</Formik>;

| **Form-specific Features** | ✅ Built-in | ❌ External libraries | ❌ External libraries | ❌ External libraries |

| **Developer Experience** | ✅ Excellent | ⚠️ Verbose | ✅ Good | ✅ Good |// Forma

| **Bundle Size** | ✅ Small | ❌ Large | ✅ Small | ✅ Small |const userName = form.useFormValue("user.name"); // Only field re-renders

| **Global State** | ✅ Built-in | ✅ Full solution | ✅ Built-in | ✅ Built-in |<TextField

    name="user.name"

### Performance Comparison    value={userName}

    onChange={form.handleFormChange}

**Large Form Performance (100+ fields)**/>;

```

| Library | Initial Render | Field Update | Full Form Update |

|---------|---------------|--------------|------------------|#### Pros and Cons Comparison

| Forma | ✅ Fast | ✅ 1 component | ✅ Selective |

| React Hook Form | ✅ Fast | ✅ 1 component | ✅ Selective || Feature | Forma | Formik |

| Formik (basic) | ⚠️ Slow | ❌ All components | ❌ All components || ------------------ | ------------------------- | ------------------------ |

| Formik (optimized) | ✅ Fast | ✅ 1 component | ✅ Selective || **Performance** | ✅ Optimized re-rendering | ❌ Frequent re-rendering |

| **API Complexity** | ✅ Simple API | ⚠️ Complex render props |

**State Management Performance**| **TypeScript** | ✅ Excellent support | ⚠️ Limited support |

| **Maintenance** | ✅ Active development | ⚠️ Maintenance mode |

| Library | State Update | Component Re-renders | Memory Usage || **Bundle Size** | ✅ Medium size | ✅ Medium size |

|---------|--------------|---------------------|--------------|

| Forma | ✅ Optimized | ✅ Minimal | ✅ Low |**When Forma is better:**

| Redux | ✅ Optimized | ⚠️ Depends on selectors | ⚠️ Medium |

| Zustand | ✅ Optimized | ⚠️ Depends on selectors | ✅ Low |- Performance-critical large forms

| Context API | ❌ All consumers | ❌ All consumers | ✅ Low |- Modern development environment

-   TypeScript projects

## Use Case Recommendations

**When Formik is better:**

### ✅ Choose Forma When:

-   High migration costs from existing Formik projects

1. **Form-heavy applications**- Teams familiar with render props pattern

    - Multi-step forms

    - Dynamic forms### vs Zustand/Redux 🏪

    - Large forms with many fields

#### Role Differences

2. **MUI/Material-UI projects**

    - Perfect integration```typescript

    - No additional setup required// Zustand (general state management)

const name = useStore((state) => state.user.name);

3. **Performance-critical applications**// Must implement form validation and submission logic directly

    - Need individual field subscriptions

    - Minimal re-renders required// Forma (form-specialized)

const form = useForm({

4. **Rapid development** validation: { name: "required" },

    - Zero configuration onSubmit: async (values) => {

    - Simple API /_ submission logic _/

    - Built-in features },

});

### ⚠️ Consider Alternatives When:const name = form.useFormValue("user.name");

````

1. **Existing Redux ecosystem**

   - Already using Redux extensively#### Pros and Cons Comparison

   - Complex state logic beyond forms

| Feature             | Forma                 | Zustand                  | Redux                    |

2. **Uncontrolled forms preference**| ------------------- | --------------------- | ------------------------ | ------------------------ |

   - React Hook Form might be better| **Form Management** | ✅ Dedicated features | ⚠️ Manual implementation | ⚠️ Manual implementation |

   - Minimal DOM manipulation| **General State**   | ⚠️ Limited            | ✅ Excellent             | ✅ Excellent             |

| **Performance**     | ✅ Form-optimized     | ✅ Good                  | ✅ Good                  |

3. **Very specific requirements**| **Dev Tools**       | ⚠️ Limited            | ✅ Simple                | ✅ Redux DevTools        |

   - Custom validation libraries| **Learning Curve**  | ✅ Easy               | ✅ Easy                  | ⚠️ Complex               |

   - Unique form behaviors

**Different roles:**

## Migration Effort

-   **Zustand/Redux**: General state management

### From React Hook Form-   **Forma**: Form-specific state management

- **Effort**: ⭐⭐ (Low-Medium)

- **Benefits**: Global state, better MUI integration### vs TanStack Form 🆕

- **Time**: 1-2 days for medium project

#### Code Comparison

### From Formik

- **Effort**: ⭐ (Low)```typescript

- **Benefits**: Better performance, global state// TanStack Form

- **Time**: 1 day for medium projectconst form = useForm({

    defaultValues: { name: "" },

### From Redux Forms    onSubmit: async ({ value }) => {

- **Effort**: ⭐⭐⭐ (Medium)        /* submit */

- **Benefits**: Modern API, better performance    },

- **Time**: 3-5 days for large project});



## Real-World Examples// Forma

const form = useForm({

### E-commerce Checkout Form    initialValues: { name: "" },

    onSubmit: async (values) => {

**Forma's advantages:**        /* submit */

```tsx    },

// Multi-step form with shared state});

function CheckoutStep1() {```

    const form = useGlobalForm({ formId: "checkout" });

    return <AddressForm form={form} />;#### Pros and Cons Comparison

}

| Feature             | Forma                            | TanStack Form       |

function CheckoutStep2() {| ------------------- | -------------------------------- | ------------------- |

    const form = useGlobalForm({ formId: "checkout" }); // Same state| **Performance**     | ✅ Individual field subscription | ✅ Optimized        |

    return <PaymentForm form={form} />;| **TypeScript**      | ✅ Strong support                | ✅ Strong support   |

}| **MUI Integration** | ✅ Perfect integration           | ⚠️ Additional setup |

```| **Maturity**        | ⚠️ New                           | ⚠️ New              |

| **Size**            | ✅ Medium                        | ✅ Small            |

### Dashboard with Real-time Updates

## 📊 Performance Comparison

**Forma's advantages:**

```tsx### Large Form Scenario (50 fields)

// Individual field subscriptions prevent unnecessary re-renders

const userName = state.useValue("user.name");```

const notifications = state.useValue("notifications.length");Number of re-rendered components when 1 field changes:

const theme = state.useValue("settings.theme");

```┌─────────────────┬─────────────────┐

│ Library         │ Re-renders      │

### Dynamic Survey Builder├─────────────────┼─────────────────┤

│ Formik          │ 50 (entire)    │

**Forma's advantages:**│ RHF + watch     │ 10-20           │

```tsx│ Forma           │ 1 (that field)  │

// Easy dynamic field management│ TanStack Form   │ 1-2             │

const state = useFormaState({});└─────────────────┴─────────────────┘

````

const addQuestion = (type) => {

    const questionId = `question_${Date.now()}`;### Memory Usage

    state.setValue(questionId, { type, value: "" });

};- **Forma**: Medium level (managing individual subscribers)

-   **RHF**: Low (uncontrolled approach)

const hasQuestion = state.hasField("question_1");- **Formik**: High (entire state management)

````

## 🎯 Selection Guide

## Conclusion

### When to Choose Forma ✅

Forma excels in:

- ✅ **Form-centric applications**1. **Form-Centric Applications**

- ✅ **Performance-critical scenarios**

- ✅ **Rapid development**    - Survey platforms

- ✅ **MUI integration**    - Form management systems

- ✅ **Global state sharing**    - Complex multi-step forms



Other libraries might be better for:2. **Performance-Critical Forms**

- ⚠️ **Complex non-form state logic** (Redux)

- ⚠️ **Uncontrolled form preference** (React Hook Form)    - 50+ fields

- ⚠️ **Atomic state patterns** (Jotai)    - Frequent real-time updates

    - Mobile environment optimization

## Related Documents

3. **MUI Projects**

- **[Migration Guide](./migration-en.md)** - Step-by-step migration from other libraries

- **[Performance Guide](./performance-guide-en.md)** - Optimization techniques    - Material-UI based design systems

- **[API Reference](./API-en.md)** - Complete API documentation    - MUI component-centric development

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
````

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
