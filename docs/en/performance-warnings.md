# Forma Performance Optimization Warnings

Anti-patterns and precautions to avoid when using Forma.

> 💡 **Basic optimization methods**: First check out recommended patterns and methods in [Performance Optimization Guide](./performance-guide.md).

## 🔥 Core Performance Optimization Principles

### 1. Individual Field Subscription

**❌ Inefficient method: Whole state subscription**

```tsx
const form = useForm({ name: "", email: "", age: 0 });
const values = form.values; // Whole state subscription - re-renders on all field changes

return (
    <div>
        <input value={values.name} onChange={...} />
        <input value={values.email} onChange={...} />
        <input value={values.age} onChange={...} />
    </div>
);
```

**✅ Efficient method: Individual field subscription**

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

**🔥 Core feature: Optimize performance by subscribing only to array length**

```tsx
const state = useFormaState({
    todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Learn Forma", completed: true },
    ],
});

// ✅ Subscribe only to array length - re-renders only when items are added/removed
const todoCount = state.useValue("todos.length");

// ✅ Subscribe only to specific item - re-renders only when that item changes
const firstTodo = state.useValue("todos.0.text");

const addTodo = () => {
    const todos = state.getValue("todos");
    state.setValue("todos", [...todos, newTodo]);
    // ✅ Automatically notifies todos.length subscribers!
};

const toggleTodo = (index: number) => {
    state.setValue(`todos.${index}.completed`, !completed);
    // ✅ Only changes that item - no notification to todos.length
};
```

## ⚠️ Precautions

### 1. Be Careful When Subscribing to Parent Paths of Nested Objects

**❌ Inefficient: Subscribe to entire parent object**

```tsx
const state = useFormaState({
    user: {
        profile: { name: "John Doe", email: "john@example.com" },
        settings: { theme: "dark", notifications: true },
    },
});

// ❌ Subscribe to entire 'user' - re-renders when any of profile/settings change
const user = state.useValue("user");

return (
    <div>
        <span>{user.profile.name}</span>
        <span>{user.settings.theme}</span>
    </div>
);
```

**✅ Efficient: Subscribe to only needed fields individually**

```tsx
// ✅ Subscribe to only needed fields individually
const userName = state.useValue("user.profile.name");
const userTheme = state.useValue("user.settings.theme");

return (
    <div>
        <span>{userName}</span> {/* Re-renders only when name changes */}
        <span>{userTheme}</span> {/* Re-renders only when theme changes */}
    </div>
);
```

### 2. Precautions When Changing Array Indices

**⚠️ Caution: Limitations of index-based subscriptions when array order changes**

```tsx
const state = useFormaState({
    items: ["Apple", "Banana", "Orange"],
});

// ❌ Index-based subscription - may cause issues when array order changes
const firstItem = state.useValue("items.0"); // "Apple"
const secondItem = state.useValue("items.1"); // "Banana"

// When array order changes, indices change causing unexpected values
state.setValue("items", ["Banana", "Apple", "Orange"]);
// firstItem still subscribes to "items.0" so becomes "Banana"
```

**✅ Solution: ID-based access or whole array subscription**

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

// Or subscribe to whole array when needed
const items = state.useValue("items");
```

### 3. Caution with Conditional Field Subscriptions

**❌ Conditional useValue calls violate React Hook rules**

```tsx
function ConditionalComponent({ showEmail }: { showEmail: boolean }) {
    const form = useForm({ name: "", email: "" });

    const name = form.useFormValue("name");

    // ❌ Conditional Hook calls are prohibited
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

**✅ Always call all Hooks and render conditionally**

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

### 4. Prohibit useValue Calls Inside map

**❌ Direct useValue calls inside map**

```tsx
function TodoList() {
    const todos = state.useValue("todos");

    return (
        <div>
            {todos.map((todo: any, index: number) => {
                // ❌ React Hook Rules violation: Hook calls inside loops
                const todoText = state.useValue(`todos.${index}.text`);
                const isCompleted = state.useValue(`todos.${index}.completed`);

                return (
                    <div key={index}>
                        <span
                            style={{
                                textDecoration: isCompleted
                                    ? "line-through"
                                    : "none",
                            }}
                        >
                            {todoText}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
```

**✅ Separate into components to use useValue**

```tsx
function TodoItem({
    index,
    useValue,
}: {
    index: number;
    useValue: (path: string) => any;
}) {
    // ✅ Call useValue at component top level (using function passed as prop)
    const todoText = useValue(`todos.${index}.text`);
    const isCompleted = useValue(`todos.${index}.completed`);

    return (
        <div>
            <span
                style={{
                    textDecoration: isCompleted ? "line-through" : "none",
                }}
            >
                {todoText}
            </span>
        </div>
    );
}

function TodoList() {
    const { useValue } = useFormaState({ todos: [] }); // Extract useValue function
    const todos = useValue("todos");

    return (
        <div>
            {todos.map((todo: any, index: number) => (
                <TodoItem key={index} index={index} useValue={useValue} />
                // ✅ Pass useValue function as prop
                // ✅ Each TodoItem subscribes to fields individually
            ))}
        </div>
    );
}
```

**💡 Additional benefits of component separation:**

-   **Performance optimization**: When individual items change, other items don't re-render
-   **Memory efficiency**: Each component subscribes only to needed fields
-   **Debugging convenience**: Track individual component rendering in React DevTools

## 🚀 Mass Data Batch Processing Optimization

### High-Performance Updates Using Array Replacement

When you need to update large amounts of data simultaneously, **array replacement** provides optimal performance.

**💡 Core concept:**

-   **Individual updates**: `setValue` for each field → All subscribed field subscribers re-render
-   **Array replacement**: `setValue` with new array → **Only actually changed field subscribers** re-render

### Real Use Case: Select/Deselect All for 100 Checkboxes

```tsx
const state = useFormaState({
    searchResults: [], // 100+ checkbox data
});

// 🚀 High-performance batch processing: Select/deselect all checkboxes
const handleSelectAll = (allSearchResults: any[], selectAll: boolean) => {
    // ❌ Inefficient method: Individual calls for each item
    // allSearchResults.forEach((_: any, index: number) => {
    //     state.setValue(`searchResults.${index}.checked`, selectAll);
    //     // Each setValue causes individual field subscribers to re-render
    // });

    // ✅ Efficient method: Array replacement
    if (allSearchResults.length > 0) {
        const updatedSearchResults = allSearchResults.map((item: any) => ({
            ...item,
            checked: selectAll,
        }));
        // Replacing the entire array automatically notifies only fields with changed values
        state.setValue("searchResults", updatedSearchResults);
        // refreshFields is unnecessary - notifications already sent to changed subscribers
    }
};
```

**⚡ Performance optimization principles:**

1. **Smart comparison**: Forma compares each element individually when replacing arrays
2. **Selective notification**: Only field subscribers with actually changed values get notified
3. **Immutability utilization**: Creating new arrays is compatible with React optimizations

**💡 Why is array replacement most efficient?**

```tsx
// 100 checkbox scenario analysis
const state = useFormaState({
    items: Array(100)
        .fill()
        .map((_, i) => ({ id: i, checked: false })),
});

// Scenario 1: Individual setValue (inefficient)
// - 100 setValue calls
// - Each call causes corresponding subscriber to re-render
// - Total 100 re-renders occur
items.forEach((_, index) => {
    state.setValue(`items.${index}.checked`, true);
});

// Scenario 2: Array replacement (efficient)
// - 1 setValue call
// - Forma internally compares previous vs new values
// - Only subscribers with actual false→true changes re-render
// - Total 100 re-renders occur (but only 1 API call)
const updatedItems = items.map((item) => ({ ...item, checked: true }));
state.setValue("items", updatedItems);

// Scenario 3: Partial changes (most efficient)
// - When only 50 items change true→false
// - 1 setValue call
// - Only 50 changed subscribers re-render
const partiallyUpdated = items.map((item, index) =>
    index < 50 ? { ...item, checked: false } : item
);
state.setValue("items", partiallyUpdated);
```

**🎯 Key Benefits:**

-   **Minimize API calls**: N calls → 1 call reduces JavaScript execution time
-   **Batch processing**: All changes processed in single update cycle
-   **Smart re-rendering**: Only actual value changes trigger re-renders
-   **React-friendly**: Follows immutability principles compatible with React optimizations

```tsx
// Actual checkbox components
function SearchResultItem({
    index,
    useValue,
}: {
    index: number;
    useValue: (path: string) => any;
}) {
    // Subscribe to individual checkbox state (using useValue function passed as prop)
    const isChecked = useValue(`searchResults.${index}.checked`);
    const itemData = useValue(`searchResults.${index}`);

    return (
        <div>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                    state.setValue(
                        `searchResults.${index}.checked`,
                        e.target.checked
                    )
                }
            />
            <span>{itemData?.name}</span>
        </div>
    );
}

// ❌ Wrong way: Using useValue inside map
function SearchResultsListBad() {
    const { useValue } = useFormaState({ searchResults: [] });
    const searchResults = useValue("searchResults");

    return (
        <div>
            {searchResults.map((item: any, index: number) => {
                // ❌ React Hook Rules violation: Hook calls inside loops/conditions prohibited
                const isChecked = useValue(`searchResults.${index}.checked`);
                const itemData = useValue(`searchResults.${index}`);

                return (
                    <div key={index}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                                state.setValue(
                                    `searchResults.${index}.checked`,
                                    e.target.checked
                                )
                            }
                        />
                        <span>{itemData?.name}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ✅ Correct way: Separate components to use useValue
function SearchResultsList() {
    const { useValue } = useFormaState({ searchResults: [] }); // Extract useValue function
    const searchResults = useValue("searchResults");

    return (
        <div>
            {searchResults.map((item: any, index: number) => (
                <SearchResultItem
                    key={index}
                    index={index}
                    useValue={useValue}
                />
                // ✅ Pass useValue function as prop
                // ✅ Call useValue inside each SearchResultItem
                // ✅ Individual field subscriptions so only that item re-renders
            ))}
        </div>
    );
}

// 💡 Benefits of component separation:
// 1. Follow React Hook Rules: Call useValue at component top level
// 2. Individual field subscriptions: Each item re-renders independently
// 3. Performance optimization: When one item changes, other items don't re-render

// Select all component
function SelectAllButton() {
    const searchResults = state.useValue("searchResults");
    const allChecked =
        searchResults?.every((item: any) => item.checked) || false;

    return (
        <button onClick={() => handleSelectAll(searchResults, !allChecked)}>
            {allChecked ? "Deselect All" : "Select All"}
        </button>
    );
}
```

### ⚡ Performance Comparison: Effects of Array Replacement

| Scenario                  | Individual Processing          | Array Replacement                          | Performance Improvement                                |
| ------------------------- | ------------------------------ | ------------------------------------------ | ------------------------------------------------------ |
| Select all 100 checkboxes | 100 setValue calls             | 1 array replacement                        | **Significant improvement** (Reduced API calls)        |
| All items same state      | 100 subscribers all re-render  | 0 subscribers re-render (no value changes) | **Infinite improvement** (No unnecessary re-renders)   |
| Half items change state   | 100 subscribers all re-render  | 50 subscribers re-render only              | **2x improvement** (Only changed subscribers)          |
| Synchronize 1000 states   | 1000 individual setValue calls | 1 array replacement                        | **Dramatic improvement** (Forma internal optimization) |

### 📊 Actual Performance Measurement

```tsx
// Performance measurement example
console.time("Individual Updates");
// ❌ Individual processing: Each field setValue + re-render
searchResults.forEach((_, index) => {
    state.setValue(`searchResults.${index}.checked`, true);
});
console.timeEnd("Individual Updates"); // ~145ms (100 setValue calls)

console.time("Array Replacement");
// ✅ Array replacement: Single setValue + smart re-rendering
const updatedResults = searchResults.map((item) => ({
    ...item,
    checked: true,
}));
state.setValue("searchResults", updatedResults);
console.timeEnd("Array Replacement"); // ~2ms (1 setValue call)
```

### Other Use Cases

1. **Bulk table row updates**

    ```tsx
    const updateTableRows = (rowUpdates: number[]) => {
        // ✅ Optimize with array replacement
        const updatedTable = tableData.map((row, index) =>
            rowUpdates.includes(index) ? { ...row, status: "updated" } : row
        );
        state.setValue("tableData", updatedTable);
        // Only actually changed rows automatically re-render
    };
    ```

2. **Form field initialization**

    ```tsx
    const resetFormSection = () => {
        // ✅ Update multiple areas at once with setValues
        state.setValues({
            personal: { name: "", email: "", phone: "" },
            address: { street: "", city: "", zipCode: "" },
        });
        // Only changed fields automatically re-render
    };
    ```

3. **Server data synchronization**

    ```tsx
    const syncWithServer = async () => {
        const serverData = await fetchLatestData();

        // ✅ Batch update
        state.setValues({
            userData: serverData.user,
            preferences: serverData.preferences,
        });

        // Use refreshFields only when force refresh is needed even with identical values
        if (forceRefresh) {
            state.refreshFields("userData");
            state.refreshFields("preferences");
        }
    };
    ```

## 🎯 Performance Optimization Checklist

### ✅ DO (Recommendations)

1. **Use individual field subscriptions**

    ```tsx
    const name = form.useFormValue("name");
    const email = form.useFormValue("email");
    ```

2. **Optimize counts with array length subscriptions**

    ```tsx
    const todoCount = state.useValue("todos.length");
    ```

3. **Direct access to nested fields with dot notation**

    ```tsx
    const userName = state.useValue("user.profile.name");
    ```

4. **Minimize re-render scope with component division**
    ```tsx
    function TodoItem({ index, useValue }) {
        const text = useValue(`todos.${index}.text`);
        return <li>{text}</li>;
    }
    ```

### ❌ DON'T (Things to Avoid)

1. **Subscribe to entire state object**

    ```tsx
    const values = form.values; // ❌ Re-renders on all field changes
    ```

2. **Unnecessary re-renders from parent object subscription**

    ```tsx
    const user = state.useValue("user"); // ❌ Re-renders on all user sub-changes
    ```

3. **Conditional Hook calls**

    ```tsx
    if (condition) {
        const value = form.useFormValue("field"); // ❌ Hook rules violation
    }
    ```

4. **Direct useValue calls inside map**

    ```tsx
    items.map((item, index) => {
        const value = state.useValue(`items.${index}`); // ❌ Hook rules violation
        return <div>{value}</div>;
    });
    ```

5. **Maintain appropriate depth without excessive nesting**

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

Following these optimization principles will provide smooth user experience even with large-scale forms and complex state.

## Related Documents

-   **[Performance Optimization Guide](./performance-guide.md)** - Recommended patterns and optimization methods
-   **[API Reference](./API.md)** - Detailed API documentation
-   **[Getting Started Guide](./getting-started.md)** - Basic usage
-   **[Examples Collection](./examples/basic-example.md)** - Practical usage examples
-   **[Migration Guide](./migration.md)** - Migration from other libraries
