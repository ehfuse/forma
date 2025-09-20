# Forma Performance Optimization and Precautions

Tips and precautions for achieving optimal performance when using Forma.

## 🔥 Core Performance Optimization Principles

### 1. Individual Field Subscription

**❌ Inefficient method: Full state subscription**

```tsx
const form = useForm({ name: "", email: "", age: 0 });
const values = form.values; // Full state subscription - re-renders on any field change

return (
    <div>
        <input value={values.name} onChange={...} />
        <input value={values.email} onChange={...} />
        <input value={values.age} onChange={...} />
    </div>
);
```

**✅ Efficient method: Individual field subscriptions**

```tsx
const form = useForm({ name: "", email: "", age: 0 });
const name = form.useFormValue("name");   // Subscribe to name field only
const email = form.useFormValue("email"); // Subscribe to email field only
const age = form.useFormValue("age");     // Subscribe to age field only

return (
    <div>
        <input value={name} onChange={...} />   {/* Re-renders only when name changes */}
        <input value={email} onChange={...} />  {/* Re-renders only when email changes */}
        <input value={age} onChange={...} />    {/* Re-renders only when age changes */}
    </div>
);
```

### 2. Array Length Subscription Optimization

**🔥 Core feature: Subscribe to array length only for performance optimization**

```tsx
const state = useFormaState({
    todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Learn Forma", completed: true },
    ],
});

// ✅ Subscribe to array length only - re-renders only when items are added/removed
const todoCount = state.useValue("todos.length");

// ✅ Subscribe to specific items only - re-renders only when that item changes
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

### 1. Caution when subscribing to parent paths of nested objects

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

### 2. Precautions when array indices change

**⚠️ Caution: Limitations of index-based subscriptions when array order changes**

```tsx
const state = useFormaState({
    items: ["apple", "banana", "orange"],
});

// ❌ Index-based subscription - can cause issues when array order changes
const firstItem = state.useValue("items.0"); // "apple"
const secondItem = state.useValue("items.1"); // "banana"

// If array order changes, indices will reference different values
state.setValue("items", ["banana", "apple", "orange"]);
// firstItem still subscribes to "items.0" so becomes "banana"
```

**✅ Solution: ID-based access or full array subscription**

```tsx
const state = useFormaState({
    items: [
        { id: 1, name: "apple" },
        { id: 2, name: "banana" },
        { id: 3, name: "orange" },
    ],
});

// ✅ Stable access through ID
const findItemById = (id: number) => {
    const items = state.getValue("items");
    const index = items.findIndex((item) => item.id === id);
    return state.useValue(`items.${index}.name`);
};

// Or subscribe to full array if needed
const items = state.useValue("items");
```

### 3. Caution with conditional field subscriptions

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

### 4. Prohibit useValue calls inside map

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

**✅ Separate component to use useValue**

```tsx
function TodoItem({
    index,
    useValue,
}: {
    index: number;
    useValue: (path: string) => any;
}) {
    // ✅ Call useValue at top level of component (using prop function)
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
-   **Memory efficiency**: Each component subscribes only to necessary fields
-   **Debugging convenience**: Individual component rendering can be tracked in React DevTools

## 🚀 Batch Processing Optimization for Large Data

### High-performance updates using refreshFields

When you need to update large amounts of data simultaneously, using `refreshFields` can provide dramatic performance improvements.

**💡 Core concept:**

-   **Individual updates**: Each field `setValue` → N re-renders
-   **Batch updates**: Full data `setValue` + `refreshFields` → 1 re-render

### Real use case: Select/deselect all for 100+ checkboxes

```tsx
const state = useFormaState({
    searchResults: [], // 100+ checkbox data
});

// 🚀 High-performance batch processing: Select/deselect all checkboxes
const handleSelectAll = (allSearchResults: any[], selectAll: boolean) => {
    // ❌ Inefficient method: Individual calls (145 items = 145 re-renders)
    // allSearchResults.forEach((_: any, index: number) => {
    //     state.setValue(`searchResults.${index}.checked`, selectAll);
    //     // Each setValue triggers individual field subscribers to re-render
    // });

    // ✅ Efficient method: Batch processing then refresh once
    if (allSearchResults.length > 0) {
        // 1. Batch update all data (no re-renders)
        const updatedSearchResults = allSearchResults.map((item: any) => ({
            ...item,
            checked: selectAll,
        }));
        state.setValue("searchResults", updatedSearchResults);

        // 2. Single call to refresh all related fields (1 re-render)
        state.refreshFields("searchResults"); // Process all searchResults.*.checked fields
    }
};

// Actual checkbox components
function SearchResultItem({
    index,
    useValue,
}: {
    index: number;
    useValue: (path: string) => any;
}) {
    // Subscribe to individual checkbox state (using prop useValue function)
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

// ❌ Incorrect method: Using useValue inside map
function SearchResultsListBad() {
    const { useValue } = useFormaState({ searchResults: [] });
    const searchResults = useValue("searchResults");

    return (
        <div>
            {searchResults.map((item: any, index: number) => {
                // ❌ React Hook Rules violation: Hook calls inside loops/conditionals prohibited
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

// ✅ Correct method: Separate component to use useValue
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
                // ✅ Each SearchResultItem calls useValue internally
                // ✅ Individual field subscriptions so only that item re-renders
            ))}
        </div>
    );
}

// 💡 Benefits of component separation:
// 1. React Hook Rules compliance: Call useValue at component top level
// 2. Individual field subscriptions: Each item re-renders independently
// 3. Performance optimization: When one item changes, others don't re-render

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

### ⚡ Performance comparison: Effect of batch processing

| Scenario                   | Individual Processing | Batch Processing | Performance Gain     |
| -------------------------- | --------------------- | ---------------- | -------------------- |
| 100 checkboxes select all | 100 re-renders       | 1 re-render      | **100x improvement** |
| 500 table rows update     | 500 re-renders       | 1 re-render      | **500x improvement** |
| 1000 state sync           | 1000 re-renders      | 1 re-render      | **1000x improvement** |

### 📊 Actual performance measurement

```tsx
// Performance measurement example
console.time("Individual Updates");
// ❌ Individual processing: 145ms (145 items)
searchResults.forEach((_, index) => {
    state.setValue(`searchResults.${index}.checked`, true);
});
console.timeEnd("Individual Updates"); // ~145ms

console.time("Batch Update");
// ✅ Batch processing: 2ms (same 145 items)
state.setValue("searchResults", updatedResults);
state.refreshFields("searchResults");
console.timeEnd("Batch Update"); // ~2ms
```

### Other use cases

1. **Bulk table row updates**

    ```tsx
    const updateTableRows = (rowUpdates: any[]) => {
        const updatedTable = tableData.map((row, index) =>
            rowUpdates.includes(index) ? { ...row, status: "updated" } : row
        );
        state.setValue("tableData", updatedTable);
        state.refreshFields("tableData");
    };
    ```

2. **Form field initialization**

    ```tsx
    const resetFormSection = () => {
        const resetData = {
            personal: { name: "", email: "", phone: "" },
            address: { street: "", city: "", zipCode: "" },
        };
        state.setValues(resetData);
        state.refreshFields("personal");
        state.refreshFields("address");
    };
    ```

3. **Server data synchronization**

    ```tsx
    const syncWithServer = async () => {
        const serverData = await fetchLatestData();
        state.setValue("userData", serverData.user);
        state.setValue("preferences", serverData.preferences);

        // Force UI refresh even if values are the same
        state.refreshFields("userData");
        state.refreshFields("preferences");
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

4. **Minimize re-render scope with component separation**
    ```tsx
    function TodoItem({ index, useValue }) {
        const text = useValue(`todos.${index}.text`);
        return <li>{text}</li>;
    }
    ```

### ❌ DON'T (Avoid these patterns)

1. **Full state object subscriptions**

    ```tsx
    const values = form.values; // ❌ Re-renders on any field change
    ```

2. **Unnecessary re-renders with parent object subscriptions**

    ```tsx
    const user = state.useValue("user"); // ❌ Re-renders on any user sub-change
    ```

3. **Conditional Hook calls**

    ```tsx
    if (condition) {
        const value = form.useFormValue("field"); // ❌ Hook rule violation
    }
    ```

4. **Direct useValue calls inside map**

    ```tsx
    items.map((item, index) => {
        const value = state.useValue(`items.${index}`); // ❌ Hook rule violation
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