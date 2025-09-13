# Forma Performance Optimization Guide

Essential patterns for efficient Forma usage.

## 🚀 Core Principles

### 1. Use Individual Field Subsc// ✅ Subscribe to individual array elements (performance optimization)

function OptimizedTodoList() {
const state = useFormaState({ todos: [] });tions

```tsx
// ❌ Full object subscription - all fields re-render on any change
const user = form.useFormValue("user");
return (
    <div>
        <TextField value={user.name} onChange={form.handleFormChange} />
        <TextField value={user.email} onChange={form.handleFormChange} />
    </div>
);

// ✅ Individual field subscriptions - only specific fields re-render
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");
return (
    <div>
        <TextField value={userName} onChange={form.handleFormChange} />
        <TextField value={userEmail} onChange={form.handleFormChange} />
    </div>
);
```

### 2. Conditional Subscriptions

```tsx
// ✅ Subscribe only when needed
function ConditionalField({ showField }: { showField: boolean }) {
    const value = showField ? form.useFormValue("optionalField") : "";

    return showField ? (
        <TextField value={value} onChange={form.handleFormChange} />
    ) : null;
}
```

### 3. Performance Optimization with Array Length Subscription

```tsx
// ✅ Subscribe only to array length for performance optimization
function TodoCounter() {
    const todoCount = state.useValue("todos.length");
    const completedCount = state.useValue("completedTodos.length");

    return (
        <div>
            {completedCount} of {todoCount} todos completed
        </div>
    );
    // Re-renders only when items are added/removed
    // No re-render when array content changes (e.g., todo.completed)
}

// ✅ Smart notification system
function ShoppingCart() {
    const itemCount = state.useValue("cart.length");

    const addItem = (item) => {
        const cart = state.getValues().cart;
        state.setValue("cart", [...cart, item]);
        // ✅ Array length changed - notify cart.length subscribers
    };

    const updateQuantity = (index, quantity) => {
        state.setValue(`cart.${index}.quantity`, quantity);
        // ✅ Array length unchanged - no notification to cart.length subscribers
    };

    return <span>Cart ({itemCount})</span>;
}
```

### 4. Memoize Complex Calculations

```tsx
// ✅ Use useMemo for expensive operations
function ExpensiveValidation() {
    const email = form.useFormValue("email");
    const password = form.useFormValue("password");

    const isValid = useMemo(() => {
        return validateEmail(email) && validatePassword(password);
    }, [email, password]);

    return <div>{isValid ? "✓" : "✗"}</div>;
}
```

## 📝 Recommended Patterns

### useForm vs useGlobalForm vs useFormaState

```tsx
// ✅ Single component form → useForm
function ContactForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
    });
}

// ✅ Multiple components/pages form → useGlobalForm
function MultiStepForm() {
    const form = useGlobalForm({
        formId: "user-registration",
    });
}

// ✅ General state management (non-form) → useFormaState
function UserDashboard() {
    const state = useFormaState({
        user: { name: "John Doe", status: "online" },
        theme: "dark",
    });

    const userName = state.useValue("user.name");
    const theme = state.useValue("theme");

    return (
        <div>
            Hello, {userName}! Theme: {theme}
        </div>
    );
}

// ✅ Complex array/object state → useFormaState (individual subscription)
function TodoManager() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Try Forma", completed: true },
        ],
        filter: "all",
    });

    // ❌ Subscribe to entire array - re-renders on any todo change
    // const todos = state.useValue("todos");

    // ✅ Subscribe to individual todo items (performance optimization)
    const firstTodo = state.useValue("todos.0.text");
    const secondCompleted = state.useValue("todos.1.completed");

    return (
        <div>
            <div>First todo: {firstTodo}</div>
            <label>
                <input
                    type="checkbox"
                    checked={secondCompleted}
                    onChange={(e) =>
                        state.setValue("todos.1.completed", e.target.checked)
                    }
                />
                Complete second todo
            </label>
        </div>
    );
}
```

### useFormaState Optimization Patterns

```tsx
// ✅ Maintain immutability when updating arrays
function TodoList() {
    const state = useFormaState({ todos: [] });

    const addTodo = (text: string) => {
        const currentTodos = state.getValues().todos;
        state.setValue("todos", [
            ...currentTodos,
            { id: Date.now(), text, completed: false },
        ]);
    };

    const updateTodo = (id: number, updates: Partial<Todo>) => {
        const currentTodos = state.getValues().todos;
        state.setValue(
            "todos",
            currentTodos.map((todo) =>
                todo.id === id ? { ...todo, ...updates } : todo
            )
        );
    };
}

// ✅ Individual field subscription for nested objects
// ✅ Subscribe to individual fields in nested objects
function UserProfile() {
    const state = useFormaState({
        user: { name: "", email: "" },
        preferences: { theme: "light", notifications: true },
    });

    // Subscribe to each field individually - optimal performance
    const userName = state.useValue("user.name");
    const theme = state.useValue("preferences.theme");

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
            />
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

// ✅ Subscribe to individual array elements (performance optimization)
function OptimizedTodoList() {
    const state = useFormaState({ todos: [] });

    // ❌ Subscribe to entire array (inefficient)
    // const todos = state.useValue("todos");

    // ✅ Subscribe to specific fields of individual elements
    const firstTodoText = state.useValue("todos.0.text");
    const secondTodoCompleted = state.useValue("todos.1.completed");

    return (
        <div>
            <p>First todo: {firstTodoText}</p>
            <input
                type="checkbox"
                checked={secondTodoCompleted}
                onChange={(e) =>
                    state.setValue("todos.1.completed", e.target.checked)
                }
            />
        </div>
    );
}
```

### Component Separation

```tsx
// ✅ Separate components by field
function UserNameField() {
    const name = form.useFormValue("name");
    return <TextField value={name} onChange={form.handleFormChange} />;
}

function UserEmailField() {
    const email = form.useFormValue("email");
    return <TextField value={email} onChange={form.handleFormChange} />;
}
```

## ❌ Patterns to Avoid

-   Direct `form.values` access (full subscription)
-   Unconditional subscriptions for conditional fields
-   Creating separate useForm instances per component
-   Creating new objects/arrays on every render

## 🔧 Debugging

```tsx
// Check performance in development
if (process.env.NODE_ENV === "development") {
    console.log("Form Values:", form.getFormValues());
}
```

## 🆕 Using New API Methods

### Dynamic Field Management

```tsx
// ✅ Check field existence before safe access
function DynamicField({ fieldName }: { fieldName: string }) {
    const state = useFormaState<Record<string, any>>({});

    // Check field existence
    const hasField = state.hasField(fieldName);

    // Safe value access (non-reactive)
    const value = hasField ? state.getValue(fieldName) : "";

    return hasField ? (
        <input
            value={state.useValue(fieldName)} // Reactive subscription
            onChange={(e) => state.setValue(fieldName, e.target.value)}
        />
    ) : (
        <button onClick={() => state.setValue(fieldName, "")}>
            Add {fieldName} field
        </button>
    );
}
```

### Global State Subscription Optimization

```tsx
// ✅ Subscribe globally only under specific conditions
function GlobalStateWatcher() {
    const state = useFormaState({ data: {} });
    const [isWatching, setIsWatching] = useState(false);

    useEffect(() => {
        if (!isWatching) return;

        const unsubscribe = state.subscribe((values) => {
            console.log("Global state changed:", values);
            // Logging, analytics, auto-save, etc.
        });

        return unsubscribe;
    }, [state, isWatching]);

    return (
        <button onClick={() => setIsWatching(!isWatching)}>
            {isWatching ? "Stop Watching" : "Start Watching"}
        </button>
    );
}
```

### Safe Field Removal with Cleanup

```tsx
// ✅ Cleanup work before field removal
function removeFieldSafely(state: any, fieldPath: string) {
    if (state.hasField(fieldPath)) {
        // Cleanup related data
        const value = state.getValue(fieldPath);
        if (value && typeof value === "object") {
            // Clean up resources for objects or arrays
            console.log(`Cleaning up field: ${fieldPath}`, value);
        }

        // Remove field
        state.removeField(fieldPath);
    }
}
```

### Performance Monitoring

```tsx
// ✅ Monitor state change frequency
function PerformanceMonitor() {
    const state = useFormaState({ counters: {} });
    const [changeCount, setChangeCount] = useState(0);

    useEffect(() => {
        const unsubscribe = state.subscribe(() => {
            setChangeCount((prev) => prev + 1);
        });

        return unsubscribe;
    }, [state]);

    return (
        <div>
            <p>State changes: {changeCount}</p>
            <button onClick={() => state.reset()}>
                Reset (change count will also reset)
            </button>
        </div>
    );
}
```

    // personal.age, personal.email, work.company do not re-render

    return (
        <div>
            <TextField value={name} onChange={(e) => form.setFormValue("personal.name", e.target.value)} />
            <TextField value={age} onChange={(e) => form.setFormValue("personal.age", Number(e.target.value))} />
            <TextField value={email} onChange={(e) => form.setFormValue("personal.email", e.target.value)} />
            <TextField value={company} onChange={(e) => form.setFormValue("work.company", e.target.value)} />
        </div>
    );

}

// 📊 Performance: When personal.name changes, only the name field re-renders for optimization

````

### 3. Conditional Subscriptions

Avoid unnecessary subscriptions by subscribing conditionally to optimize performance.

```tsx
function ConditionalField({ showField }: { showField: boolean }) {
    // Subscribe only when showField is true
    const value = showField ? form.useFormValue("conditionalField") : "";

    return showField ? <TextField name="conditionalField" value={value} onChange={form.handleFormChange} /> : null;
}

// More complex conditional subscription example
function AdvancedConditionalFields() {
    const accountType = form.useFormValue("accountType");

    // Subscribe to company info only when accountType is 'business'
    const companyName = accountType === "business" ? form.useFormValue("company.name") : "";
    const businessNumber = accountType === "business" ? form.useFormValue("company.businessNumber") : "";

    return (
        <div>
            <Select name="accountType" value={accountType} onChange={form.handleFormChange}>
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="business">Business</MenuItem>
            </Select>

            {accountType === "business" && (
                <>
                    <TextField name="company.name" value={companyName} onChange={form.handleFormChange} />
                    <TextField name="company.businessNumber" value={businessNumber} onChange={form.handleFormChange} />
                </>
            )}
        </div>
    );
}
````

## 🏗 Component Structure Optimization

### 1. Single Form Instance vs Multiple Form Instances

```tsx
// ❌ Inefficient: Using individual useForm in each card
function CardList() {
    const cards = [
        { id: 1, name: "", email: "" },
        { id: 2, name: "", email: "" },
        { id: 3, name: "", email: "" },
    ];

    return (
        <div>
            {cards.map((card) => (
                <UserCard key={card.id} cardId={card.id} initialData={card} />
            ))}
        </div>
    );
}

function UserCard({
    cardId,
    initialData,
}: {
    cardId: number;
    initialData: any;
}) {
    // ❌ Creating separate form instance for each card (memory inefficient)
    const form = useForm({
        initialValues: initialData,
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

// ✅ Efficient: Using useForm at parent level and passing props
function CardList() {
    const form = useForm({
        initialValues: {
            users: [
                { name: "", email: "" },
                { name: "", email: "" },
                { name: "", email: "" },
            ],
        },
    });

    return (
        <div>
            {form.useFormValue("users").map((user: any, index: number) => (
                <UserCard
                    key={index}
                    index={index}
                    name={form.useFormValue(`users.${index}.name`)}
                    email={form.useFormValue(`users.${index}.email`)}
                    onNameChange={(value) =>
                        form.setFormValue(`users.${index}.name`, value)
                    }
                    onEmailChange={(value) =>
                        form.setFormValue(`users.${index}.email`, value)
                    }
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

function UserCard({
    index,
    name,
    email,
    onNameChange,
    onEmailChange,
}: UserCardProps) {
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
```

### 2. Passing Functions as Props Pattern

```tsx
// 🔄 Alternative Approach: Pass useFormValue function as props
function CardListAlternative() {
    const form = useForm({
        initialValues: {
            users: [
                { name: "", email: "" },
                { name: "", email: "" },
                { name: "", email: "" },
            ],
        },
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

interface UserCardWithFunctionProps {
    index: number;
    useFormValue: (field: string) => any;
    setFormValue: (field: string, value: any) => void;
}

function UserCardWithFunction({
    index,
    useFormValue,
    setFormValue,
}: UserCardWithFunctionProps) {
    const name = useFormValue(`users.${index}.name`);
    const email = useFormValue(`users.${index}.email`);

    return (
        <Card>
            <TextField
                value={name}
                onChange={(e) =>
                    setFormValue(`users.${index}.name`, e.target.value)
                }
            />
            <TextField
                value={email}
                onChange={(e) =>
                    setFormValue(`users.${index}.email`, e.target.value)
                }
            />
        </Card>
    );
}

// 📊 Performance Comparison:
// ❌ Inefficient: 3 cards = 3 form instances + separate FieldStores
// ✅ Efficient: 1 form instance + individual field subscriptions for selective re-rendering
```

## 🔍 Advanced Performance Patterns

### 1. Utilizing Memoization

```tsx
function ExpensiveCalculation() {
    const rawData = form.useFormValue("data");

    // Memoize complex calculations
    const processedData = useMemo(() => {
        return expensiveProcessing(rawData);
    }, [rawData]);

    return <div>{processedData}</div>;
}

// Memoization for complex form validation
function FormWithExpensiveValidation() {
    const email = form.useFormValue("email");
    const password = form.useFormValue("password");

    const validationResult = useMemo(() => {
        // Complex validation logic
        return {
            isEmailValid: validateEmail(email),
            isPasswordStrong: checkPasswordStrength(password),
            overallValid:
                validateEmail(email) && checkPasswordStrength(password),
        };
    }, [email, password]);

    return (
        <div>
            <TextField
                name="email"
                value={email}
                onChange={form.handleFormChange}
                error={!validationResult.isEmailValid}
                helperText={
                    !validationResult.isEmailValid ? "Invalid email" : ""
                }
            />
            <TextField
                name="password"
                type="password"
                value={password}
                onChange={form.handleFormChange}
                error={!validationResult.isPasswordStrong}
                helperText={
                    !validationResult.isPasswordStrong
                        ? "Password needs to be stronger"
                        : ""
                }
            />
        </div>
    );
}
```

### 2. Handling Large Datasets

```tsx
// Virtualized large list processing
function VirtualizedFormList() {
    const form = useForm({
        initialValues: {
            items: Array.from({ length: 10000 }, (_, i) => ({
                id: i,
                name: `Item ${i}`,
                value: 0,
            })),
        },
    });

    const handleItemChange = useCallback(
        (index: number, field: string, value: any) => {
            form.setFormValue(`items.${index}.${field}`, value);
        },
        [form]
    );

    return (
        <FixedSizeList
            height={600}
            itemCount={form.useFormValue("items").length}
            itemSize={60}
            itemData={{ form, handleItemChange }}
        >
            {VirtualizedFormItem}
        </FixedSizeList>
    );
}

const VirtualizedFormItem = memo(
    ({ index, data }: { index: number; data: any }) => {
        const { form, handleItemChange } = data;
        const name = form.useFormValue(`items.${index}.name`);
        const value = form.useFormValue(`items.${index}.value`);

        return (
            <div style={{ display: "flex", padding: "10px" }}>
                <TextField
                    value={name}
                    onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                    }
                    size="small"
                />
                <TextField
                    type="number"
                    value={value}
                    onChange={(e) =>
                        handleItemChange(index, "value", Number(e.target.value))
                    }
                    size="small"
                />
            </div>
        );
    }
);
```

### 3. Lazy Loading Pattern

```tsx
// Tab-based lazy loading
function TabbedForm() {
    const [activeTab, setActiveTab] = useState(0);
    const form = useForm({
        initialValues: {
            basic: { name: "", email: "" },
            advanced: { preferences: {}, settings: {} },
            billing: { address: "", paymentMethod: "" },
        },
    });

    return (
        <div>
            <Tabs
                value={activeTab}
                onChange={(_, value) => setActiveTab(value)}
            >
                <Tab label="Basic Info" />
                <Tab label="Advanced Settings" />
                <Tab label="Billing Info" />
            </Tabs>

            {/* Render only the active tab's component for performance optimization */}
            {activeTab === 0 && <BasicInfoTab form={form} />}
            {activeTab === 1 && <AdvancedSettingsTab form={form} />}
            {activeTab === 2 && <BillingInfoTab form={form} />}
        </div>
    );
}

function BasicInfoTab({ form }: { form: any }) {
    // Start subscription only when basic info tab is active
    const name = form.useFormValue("basic.name");
    const email = form.useFormValue("basic.email");

    return (
        <div>
            <TextField
                name="basic.name"
                value={name}
                onChange={form.handleFormChange}
            />
            <TextField
                name="basic.email"
                value={email}
                onChange={form.handleFormChange}
            />
        </div>
    );
}
```

## ⚡ Real-time Performance Monitoring

### 1. Development Environment Performance Check

```tsx
function PerformanceMonitor({ children }: { children: React.ReactNode }) {
    const renderCount = useRef(0);

    if (process.env.NODE_ENV === "development") {
        renderCount.current += 1;
        console.log(`Component render count: ${renderCount.current}`);
    }

    return <>{children}</>;
}

// Usage example
function MonitoredFormField() {
    const name = form.useFormValue("name");

    return (
        <PerformanceMonitor>
            <TextField
                name="name"
                value={name}
                onChange={form.handleFormChange}
            />
        </PerformanceMonitor>
    );
}
```

### 2. Performance Benchmarking

```tsx
// Test component for performance comparison
function PerformanceBenchmark() {
    const [useOptimized, setUseOptimized] = useState(true);
    const renderStart = performance.now();

    useEffect(() => {
        const renderEnd = performance.now();
        console.log(`Render time: ${renderEnd - renderStart}ms`);
    });

    return (
        <div>
            <Switch
                checked={useOptimized}
                onChange={(e) => setUseOptimized(e.target.checked)}
                label="Use optimized pattern"
            />

            {useOptimized ? (
                <OptimizedFormComponent />
            ) : (
                <UnoptimizedFormComponent />
            )}
        </div>
    );
}
```

## 📊 Performance Checklist

### ✅ Recommended Practices

-   [ ] Use `useFormValue` for individual field subscriptions
-   [ ] Apply conditional subscriptions for conditional rendering
-   [ ] Memoize complex calculations with `useMemo`
-   [ ] Apply virtualization for large lists
-   [ ] Use single Form instance instead of multiple instances
-   [ ] Avoid unnecessary full object subscriptions

### ❌ Patterns to Avoid

-   [ ] Direct access to `form.values` (full subscription)
-   [ ] Creating new objects/arrays on every render
-   [ ] Unconditional subscriptions for conditional fields
-   [ ] Creating separate Form instances per component
-   [ ] Running complex calculations on every render

## 🔧 Debugging Tools

### Performance Profiling

```tsx
function FormPerformanceProfiler() {
    const form = useForm({
        initialValues: {
            /* ... */
        },
    });

    // Output performance info in development environment
    if (process.env.NODE_ENV === "development") {
        const fieldCount = Object.keys(form.getFormValues()).length;
        const subscribedFields = form._getSubscribedFields?.() || [];

        console.log(`Total field count: ${fieldCount}`);
        console.log(`Subscribed field count: ${subscribedFields.length}`);
        console.log(`Subscribed fields:`, subscribedFields);
    }

    return <div>{/* Form content */}</div>;
}
```
