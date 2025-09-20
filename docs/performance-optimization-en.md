# Forma Performance Optimization and Best Practices

Tips and precautions for optimal performance when using Forma.

## 🔥 Core Performance Optimization Principles

### 1. Individual Field Subscription

**❌ Inefficient: Subscribe to entire state**

```tsx
const form = useForm({ name: "", email: "", age: 0 });
const values = form.values; // Subscribe to entire state - re-renders on any field change

return (
    <div>
        <input value={values.name} onChange={...} />
        <input value={values.email} onChange={...} />
        <input value={values.age} onChange={...} />
    </div>
);
```

**✅ Efficient: Subscribe to individual fields**

```tsx
const form = useForm({ name: "", email: "", age: 0 });
const name = form.useFormValue("name");   // Subscribe only to name field
const email = form.useFormValue("email"); // Subscribe only to email field
const age = form.useFormValue("age");     // Subscribe only to age field

return (
    <div>
        <input value={name} onChange={...} />   {/* Re-renders only when name changes */}
        <input value={email} onChange={...} />  {/* Re-renders only when email changes */}
        <input value={age} onChange={...} />    {/* Re-renders only when age changes */}
    </div>
);
```

### 2. Array Length Subscription Optimization

**🔥 Key Feature: Subscribe only to array length for performance optimization**

```tsx
const state = useFormaState({
    todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Learn Forma", completed: true },
    ],
});

// ✅ Subscribe only to array length - re-renders only when items are added/removed
const todoCount = state.useValue("todos.length");

// ✅ Subscribe to specific item - re-renders only when that item changes
const firstTodo = state.useValue("todos.0.text");

const addTodo = () => {
    const todos = state.getValue("todos");
    state.setValue("todos", [...todos, newTodo]);
    // ✅ Automatically notifies todos.length subscribers!
};

const toggleTodo = (index: number) => {
    state.setValue(`todos.${index}.completed`, !completed);
    // ✅ Only that item changes - no notification to todos.length
};
```

## ⚠️ Precautions

### 1. Be Careful When Subscribing to Parent Objects of Nested Structures

**❌ Inefficient: Subscribe to entire parent object**

```tsx
const state = useFormaState({
    user: {
        profile: { name: "John Doe", email: "john@example.com" },
        settings: { theme: "dark", notifications: true },
    },
});

// ❌ Subscribe to entire 'user' - re-renders when either profile or settings change
const user = state.useValue("user");

return (
    <div>
        <span>{user.profile.name}</span>
        <span>{user.settings.theme}</span>
    </div>
);
```

**✅ Efficient: Subscribe to individual fields only**

```tsx
// ✅ Subscribe to individual fields only
const userName = state.useValue("user.profile.name");
const userTheme = state.useValue("user.settings.theme");

return (
    <div>
        <span>{userName}</span> {/* Re-renders only when name changes */}
        <span>{userTheme}</span> {/* Re-renders only when theme changes */}
    </div>
);
```

### 2. Limitations of Index-based Subscriptions When Array Order Changes

**⚠️ Caution: Index-based subscriptions can be problematic when array order changes**

```tsx
const state = useFormaState({
    items: ["Apple", "Banana", "Orange"],
});

// ❌ Index-based subscription - problems when array order changes
const firstItem = state.useValue("items.0"); // "Apple"
const secondItem = state.useValue("items.1"); // "Banana"

// When array order changes, indices change causing unexpected values
state.setValue("items", ["Banana", "Apple", "Orange"]);
// firstItem still subscribes to "items.0", so it becomes "Banana"
```

**✅ Solution: ID-based access or full array subscription**

```tsx
const state = useFormaState({
    items: [
        { id: 1, name: "Apple" },
        { id: 2, name: "Banana" },
        { id: 3, name: "Orange" },
    ],
});

// ✅ Stable access through ID
const findItemById = (id: number) => {
    const items = state.getValue("items");
    const index = items.findIndex((item) => item.id === id);
    return state.useValue(`items.${index}.name`);
};

// Or subscribe to entire array when needed
const items = state.useValue("items");
```

### 3. Conditional Field Subscriptions

**❌ Conditional useValue calls violate React Hook rules**

```tsx
function ConditionalComponent({ showEmail }: { showEmail: boolean }) {
    const form = useForm({ name: "", email: "" });

    const name = form.useFormValue("name");

    // ❌ Conditional Hook calls are forbidden
    if (showEmail) {
        const email = form.useFormValue("email");
        return (
            <div>
                {name} - {email}
            </div>
        );
    }

    return <div>{name}</div>;
}
```

**✅ Always call all Hooks and conditionally render**

```tsx
function ConditionalComponent({ showEmail }: { showEmail: boolean }) {
    const form = useForm({ name: "", email: "" });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email"); // ✅ Always call

    return (
        <div>
            {name}
            {showEmail && ` - ${email}`} {/* ✅ Conditional rendering */}
        </div>
    );
}
```

## 🎯 Performance Optimization Checklist

### ✅ DO (Recommendations)

1. **Use individual field subscriptions**

    ```tsx
    const name = form.useFormValue("name");
    const email = form.useFormValue("email");
    ```

2. **Optimize counts with array length subscription**

    ```tsx
    const todoCount = state.useValue("todos.length");
    ```

3. **Direct access to nested fields with dot notation**

    ```tsx
    const userName = state.useValue("user.profile.name");
    ```

4. **Minimize re-render scope with component separation**
    ```tsx
    function TodoItem({ index }) {
        const text = state.useValue(`todos.${index}.text`);
        return <li>{text}</li>;
    }
    ```

### ❌ DON'T (Things to Avoid)

1. **Subscribe to entire state object**

    ```tsx
    const values = form.values; // ❌ Re-renders on any field change
    ```

2. **Unnecessary re-renders by subscribing to parent objects**

    ```tsx
    const user = state.useValue("user"); // ❌ Re-renders on any user sub-field change
    ```

3. **Conditional Hook calls**

    ```tsx
    if (condition) {
        const value = form.useFormValue("field"); // ❌ Violates Hook rules
    }
    ```

4. **Maintain appropriate depth without excessive nesting**

    ```tsx
    // ❌ Excessive nesting
    const value = state.useValue("level1.level2.level3.level4.level5.field");

    // ✅ Appropriate structure design
    const value = state.useValue("userSettings.theme");
    ```

## 📊 Performance Measurement Tips

### Using React DevTools Profiler

1. Install React DevTools and use Profiler tab
2. Check which components re-render during form input
3. Compare before and after individual field subscriptions

### Track re-renders with console logs

```tsx
function MyComponent() {
    const name = form.useFormValue("name");

    console.log("MyComponent rendered with name:", name);

    return <input value={name} onChange={...} />;
}
```

Following these optimization principles ensures smooth user experience even with large-scale forms and complex state.
