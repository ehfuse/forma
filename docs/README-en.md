# Forma - English Documentation

**Advanced React Form State Management Library**

Forma is a high-performance library for efficiently managing form state in React applications. It provides selective re-rendering through individual field subscriptions and global form state sharing capabilities.

## 🚀 Key Features

- ✅ **Individual Field Subscription**: Optimized performance with field-specific selective re-rendering
- ✅ **Dot Notation Support**: Nested object access like `user.profile.name`
- ✅ **Full MUI Compatibility**: Perfect integration with Material-UI components
- ✅ **Global Form State**: Share form state across multiple components
- ✅ **Full TypeScript Support**: Strong type safety
- ✅ **React 19 Optimized**: Leverages latest React features

## 📦 Installation

```bash
npm install @ehfuse/forma
```

or

```bash
yarn add @ehfuse/forma
```

## 🎯 Quick Start

```tsx
import { useForm } from "@ehfuse/forma";

interface UserForm {
    name: string;
    email: string;
}

function MyForm() {
    const form = useForm<UserForm>({
        initialValues: { name: "", email: "" },
        onSubmit: async (values) => {
            console.log("Submit:", values);
        },
    });

    // Individual field subscription (performance optimization)
    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <form onSubmit={form.submit}>
            <TextField name="name" value={name} onChange={form.handleFormChange} />
            <TextField name="email" value={email} onChange={form.handleFormChange} />
            <Button type="submit" disabled={form.isSubmitting}>Submit</Button>
        </form>
    );
}
```

📖 **[View Detailed Getting Started Guide](./getting-started-en.md)** - Step-by-step tutorial, validation, advanced features

## 📚 API Reference

### Core Hooks

#### useForm
Basic hook for managing local form state.

```tsx
const form = useForm<T>({
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
  onValidate?: (values: T) => Promise<boolean> | boolean;
});
```

#### useGlobalForm
Extended hook for managing global form state.

```tsx
const form = useGlobalForm<T>({
  formId: string;
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
});
```

📖 **[View Complete API Reference](./API-en.md)** - All methods, types, examples, migration guide

### Dot Notation Support

Easy access to nested objects:

```tsx
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

<TextField name="user.profile.name" value={name} onChange={form.handleFormChange} />;
```

## 🎨 MUI Component Support

Forma is fully compatible with all Material-UI form components:

### TextField

```tsx
<TextField name="email" value={form.useFormValue("email")} onChange={form.handleFormChange} />
```

### Select

```tsx
<Select name="category" value={form.useFormValue("category")} onChange={form.handleFormChange}>
    <MenuItem value="A">Category A</MenuItem>
    <MenuItem value="B">Category B</MenuItem>
</Select>
```

### DatePicker

```tsx
<DatePicker value={form.useFormValue("birthDate")} onChange={form.handleDatePickerChange("birthDate")} />
```

### Checkbox

```tsx
<Checkbox name="agree" checked={form.useFormValue("agree")} onChange={form.handleFormChange} />
```

## ⚡ Performance Optimization

### Individual Field Subscription

```tsx
## ⚡ Performance Optimization

Forma provides optimized performance through individual field subscriptions. For detailed performance optimization guide, see [Performance Optimization Documentation](./best-practices-en.md).

### Core Principles

- **Individual Field Subscription**: Subscribe only to needed fields with `useFormValue("fieldName")`
- **Conditional Subscription**: Apply conditional subscriptions for conditional rendering
- **Single Form Instance**: Share one form instance across multiple components

```tsx
// ✅ Efficient: Individual field subscription
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");

return (
    <div>
        <TextField name="user.name" value={userName} onChange={form.handleFormChange} />
        <TextField name="user.email" value={userEmail} onChange={form.handleFormChange} />
        {/* When user.name changes → Only userName TextField re-renders */}
    </div>
);
```

📖 **[View Detailed Performance Optimization Guide](./best-practices-en.md)**
```

### Conditional Subscription

```tsx
function ConditionalField({ showField }: { showField: boolean }) {
    // Subscribe only when showField is true
    const value = showField ? form.useFormValue("conditionalField") : "";

    return showField ? <TextField name="conditionalField" value={value} onChange={form.handleFormChange} /> : null;
}
```

### Component Structure Optimization

```tsx
// ❌ Inefficient: Each card uses individual useForm
function CardList() {
    const cards = [
        { id: 1, name: "", email: "" },
        { id: 2, name: "", email: "" },
        { id: 3, name: "", email: "" }
    ];

    return (
        <div>
            {cards.map(card => (
                <UserCard key={card.id} cardId={card.id} initialData={card} />
            ))}
        </div>
    );
}

function UserCard({ cardId, initialData }: { cardId: number; initialData: any }) {
    // ❌ Each card creates separate form instance (memory inefficient)
    const form = useForm({
        initialValues: initialData
    });

    return (
        <Card>
            <TextField 
                name={`user.${cardId}.name`} 
                value={form.useFormValue("name")} 
                onChange={form.handleFormChange} 
            />
            <TextField 
                name={`user.${cardId}.email`} 
                value={form.useFormValue("email")} 
                onChange={form.handleFormChange} 
            />
        </Card>
    );
}

// ✅ Efficient: Use useForm at parent level and pass props
function CardList() {
    const form = useForm({
        initialValues: {
            users: [
                { name: "", email: "" },
                { name: "", email: "" },
                { name: "", email: "" }
            ]
        }
    });

    return (
        <div>
            {form.useFormValue("users").map((user: any, index: number) => (
                <UserCard 
                    key={index}
                    index={index}
                    name={form.useFormValue(`users.${index}.name`)}
                    email={form.useFormValue(`users.${index}.email`)}
                    onNameChange={(value) => form.setFormValue(`users.${index}.name`, value)}
                    onEmailChange={(value) => form.setFormValue(`users.${index}.email`, value)}
                />
            ))}
        </div>
    );
}

// 🔄 Alternative Approach: Pass useFormValue function as props
function CardListAlternative() {
    const form = useForm({
        initialValues: {
            users: [
                { name: "", email: "" },
                { name: "", email: "" },
                { name: "", email: "" }
            ]
        }
    });

    return (
        <div>
            {form.useFormValue("users").map((user: any, index: number) => (
                <UserCardWithFunction 
                    key={index}
                    index={index}
                    useFormValue={form.useFormValue}
                    setFormValue={form.setFormValue}
                />
            ))}
        </div>
    );
}

interface UserCardProps {
    index: number;
    name: string;
    email: string;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
}

function UserCard({ index, name, email, onNameChange, onEmailChange }: UserCardProps) {
    return (
        <Card>
            <TextField 
                value={name} 
                onChange={(e) => onNameChange(e.target.value)} 
            />
            <TextField 
                value={email} 
                onChange={(e) => onEmailChange(e.target.value)} 
            />
        </Card>
    );
}

// 🔄 Alternative Component: Receiving functions as props
interface UserCardWithFunctionProps {
    index: number;
    useFormValue: (field: string) => any;
    setFormValue: (field: string, value: any) => void;
}

function UserCardWithFunction({ index, useFormValue, setFormValue }: UserCardWithFunctionProps) {
    const name = useFormValue(`users.${index}.name`);
    const email = useFormValue(`users.${index}.email`);

    return (
        <Card>
            <TextField 
                value={name} 
                onChange={(e) => setFormValue(`users.${index}.name`, e.target.value)} 
            />
            <TextField 
                value={email} 
                onChange={(e) => setFormValue(`users.${index}.email`, e.target.value)} 
            />
        </Card>
    );
}

// 📊 Performance Comparison:
// ❌ Inefficient: 3 cards = 3 form instances + separate FieldStores
// ✅ Efficient: 1 form instance + individual field subscriptions for selective re-rendering
```

## 🔧 Advanced Usage

### Form Validation

```tsx
const form = useForm({
    initialValues: { email: "", password: "" },
    onValidate: async (values) => {
        if (!values.email.includes("@")) {
            alert("Please enter a valid email");
            return false;
        }
        if (values.password.length < 6) {
            alert("Password must be at least 6 characters");
            return false;
        }
        return true;
    },
    onSubmit: async (values) => {
        await api.submitForm(values);
    },
});
```

### Dynamic Initial Values

```tsx
useEffect(() => {
    if (userId) {
        // Set initial values after loading user data
        const userData = await fetchUser(userId);
        form.setInitialFormValues(userData);
    }
}, [userId]);
```

### Complex Nested Structure

```tsx
interface ComplexForm {
    company: {
        name: string;
        address: {
            street: string;
            city: string;
            country: string;
        };
        employees: Array<{
            name: string;
            position: string;
            contact: {
                email: string;
                phone: string;
            };
        }>;
    };
}

// Array element access is also possible
const firstEmployeeName = form.useFormValue("company.employees.0.name");
const firstEmployeeEmail = form.useFormValue("company.employees.0.contact.email");
```

## 🌟 Use Cases

### 1. Multi-step Forms

```tsx
// Step 1: Basic information
function Step1() {
    const form = useGlobalForm({
        formId: "registration",
        initialValues: { name: "", email: "", phone: "" },
    });

    return (
        <>
            <TextField name="name" value={form.useFormValue("name")} onChange={form.handleFormChange} />
            <TextField name="email" value={form.useFormValue("email")} onChange={form.handleFormChange} />
        </>
    );
}

// Step 2: Additional information (shares same form state)
function Step2() {
    const form = useGlobalForm({
        formId: "registration",
        initialValues: { name: "", email: "", phone: "" },
    });

    return <TextField name="phone" value={form.useFormValue("phone")} onChange={form.handleFormChange} />;
}
```

### 2. Real-time Preview

```tsx
function FormWithPreview() {
    const form = useForm({
        initialValues: { title: "", content: "", author: "" },
    });

    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                {/* Input form */}
                <TextField name="title" value={form.useFormValue("title")} onChange={form.handleFormChange} />
                <TextField name="content" value={form.useFormValue("content")} onChange={form.handleFormChange} />
            </Grid>
            <Grid item xs={6}>
                {/* Real-time preview */}
                <PreviewComponent form={form} />
            </Grid>
        </Grid>
    );
}

function PreviewComponent({ form }) {
    const title = form.useFormValue("title");
    const content = form.useFormValue("content");

    return (
        <Paper>
            <Typography variant="h5">{title || "No title"}</Typography>
            <Typography>{content || "No content"}</Typography>
        </Paper>
    );
}
```

### 3. Conditional Fields

```tsx
function ConditionalForm() {
    const form = useForm({
        initialValues: {
            accountType: "personal",
            companyName: "",
            personalName: "",
        },
    });

    const accountType = form.useFormValue("accountType");

    return (
        <>
            <Select name="accountType" value={accountType} onChange={form.handleFormChange}>
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="business">Business</MenuItem>
            </Select>

            {accountType === "personal" ? (
                <TextField
                    name="personalName"
                    value={form.useFormValue("personalName")}
                    onChange={form.handleFormChange}
                />
            ) : (
                <TextField
                    name="companyName"
                    value={form.useFormValue("companyName")}
                    onChange={form.handleFormChange}
                />
            )}
        </>
    );
}
```

## 🐛 Troubleshooting

### Common Issues

**Q: Form is not re-rendering**

```tsx
// ❌ Wrong way
const value = form.getFormValue("name"); // No subscription

// ✅ Correct way
const value = form.useFormValue("name"); // With subscription
```

**Q: DatePicker value is not being set properly**

```tsx
// ✅ Use DatePicker specific handler
<DatePicker value={form.useFormValue("date")} onChange={form.handleDatePickerChange("date")} />
```

**Q: Cannot access nested objects**

```tsx
// ✅ Use dot notation
const cityValue = form.useFormValue("address.city");

<TextField name="address.city" value={cityValue} onChange={form.handleFormChange} />;
```

### Performance Optimization Tips

1. **Use useFormValue**: Use `useFormValue` whenever possible for individual field subscriptions
2. **Conditional Subscription**: Subscribe conditionally for conditionally rendered fields
3. **Memoization**: Use useMemo for complex calculations

## 📞 Contact

- **Developer**: KIM YOUNG JIN (김영진)
- **Email**: ehfuse@gmail.com
- **GitHub**: https://github.com/ehfuse/forma

## 🔄 Version History

### v1.0.0 (2025-01-07)

- Initial release
- Provided useForm, useGlobalForm hooks
- Dot notation support
- Full MUI compatibility
- Full TypeScript support

---

**Forma** - _The New Standard for Advanced React Form State Management_
