# Forma Hooks Comparison Guide

## 📋 Overview

The Forma library provides 4 main state management hooks:

**Local Hooks (Component-internal state)**:

-   `useFormaState`: General state management
-   `useForm`: Form-specific state management

**Global Hooks (Shared state across components)**:

-   `useGlobalFormaState`: General global state management
-   `useGlobalForm`: Form-specific global state management

## 🎯 useForm vs useFormaState Differences

### useForm 🔷

**Purpose**: Local management of HTML form elements
**Additional Features**:

-   ✅ Form validation (`onValidate`)
-   ✅ Form submission (`onSubmit`, `submit()`)
-   ✅ Submission state (`isSubmitting`)
-   ✅ Submission complete callback (`onComplete`)

**Usage Example**:

```typescript
const form = useForm({
    initialValues: { name: "", email: "" },
    onValidate: async (values) => values.email.includes("@"),
    onSubmit: async (values) => {
        await api.submitForm(values);
    },
});

form.submit(); // Validate then submit
```

### useFormaState 🔶

**Purpose**: Local management of general app state
**Characteristics**:

-   ✅ Provides pure state management only
-   ✅ Individual field subscriptions
-   ❌ No form validation
-   ❌ No form submission features

**Usage Example**:

```typescript
const state = useFormaState({
    items: [],
    filter: "all",
});

const items = state.useValue("items");
state.setValue("filter", "completed");
```

## 🌍 useGlobalForm vs useGlobalFormaState Differences

Follows the same pattern as local hooks, but **shares state across multiple components**.

### useGlobalForm 🔷

**Purpose**: Global management of HTML form elements
**Props**: `formId` (appropriate for forms)

**Included Features**:

-   ✅ Form validation
-   ✅ Form submission
-   ✅ Submission state (isSubmitting)
-   ✅ Error handling
-   ✅ onSubmit callback
-   ✅ onComplete callback

**Usage Example**:

```typescript
const form = useGlobalForm({
    formId: "checkout-form",
    initialValues: { name: "", email: "" },
    onValidate: async (values) => values.email.includes("@"),
    onSubmit: async (values) => {
        /* submission logic */
    },
});

form.validate(); // validation
form.submit(); // submission
```

### useGlobalFormaState 🔶

**Purpose**: Global management of general app state
**Props**: `stateId` (more appropriate for general state)

**Included Features**:

            onChange={form.handleFormChange}-   ❌ No form validation

        />-   ❌ No form submission features

    );-   ❌ No submission state

}

**Usage Example**:

function Step2() {

    const form = useGlobalForm({```typescript

        formId: "wizard-form" // Same ID = shared stateconst state = useGlobalFormaState({

    });    stateId: "app-state",

    });

    return (

        <inputconst userName = state.useValue("user.name"); // re-render only on name change

            name="email"state.setValue("user.name", "John"); // state update

            value={form.useFormValue("email")}```

            onChange={form.handleFormChange}

        />## 🎯 Real-world Usage Scenarios

    );

}### 1. E-commerce App 🛒

`````

#### useGlobalFormaState Usage

## useGlobalFormaState vs Zustand

````typescript

### Zustand Approach// Global app state management

const appState = useGlobalFormaState({ stateId: "ecommerce-app" });

```tsx

import { create } from 'zustand';// Individual field subscriptions per component

const cartItems = appState.useValue("cart.items"); // shopping cart

const useStore = create((set) => ({const userInfo = appState.useValue("user.profile"); // user info

    user: { name: "", email: "" },const theme = appState.useValue("ui.theme"); // theme settings

    updateUser: (field, value) => set((state) => ({const filters = appState.useValue("search.filters"); // search filters

        user: { ...state.user, [field]: value }```

    })),

}));#### useGlobalForm Usage



function UserComponent() {```typescript

    const user = useStore((state) => state.user); // Whole object subscription// Checkout form management (shared across multiple steps)

    const updateUser = useStore((state) => state.updateUser);const checkoutForm = useGlobalForm({

        formId: "checkout-form",

    return (    validation: {

        <input        email: "required|email",

            value={user.name}        address: "required",

            onChange={(e) => updateUser("name", e.target.value)}        paymentMethod: "required",

        />    },

    );    onSubmit: async (values) => {

}        // order processing logic

```        await processOrder(values);

    },

### Forma's useGlobalFormaState});

`````

````tsx

function UserComponent() {### 2. Social Media App 📱

    const state = useGlobalFormaState({

        stateId: "user-data",#### useGlobalFormaState Usage

        initialValues: { user: { name: "", email: "" } }

    });```typescript

    // Real-time data state management

    // Individual field subscription - better performanceconst socialState = useGlobalFormaState({ stateId: "social-app" });

    const userName = state.useValue("user.name");

    // Subscribe only to necessary data in each component

    return (const timeline = socialState.useValue("timeline.posts");

        <inputconst notifications = socialState.useValue("notifications.unread");

            value={userName}const currentUser = socialState.useValue("user.profile");

            onChange={(e) => state.setValue("user.name", e.target.value)}const chatMessages = socialState.useValue("chat.messages");

        />```

    );

}#### useGlobalForm Usage

````

```````typescript

## Benefits of Forma's Global Hooks// Post creation form (accessible from multiple pages)

const postForm = useGlobalForm({

### 1. **Automatic Memory Management**    formId: "create-post",

    validation: {

```tsx        content: "required|min:1",

// Component A mounts → reference count: 1        images: "max:5",

function ComponentA() {    },

    const form = useGlobalForm({ formId: "shared-form" });    onSubmit: async (values) => {

    // ...        await createPost(values);

}    },

});

// Component B mounts → reference count: 2```

function ComponentB() {

    const form = useGlobalForm({ formId: "shared-form" });### 3. Dashboard/Admin Panel 📊

    // ...

}#### useGlobalFormaState Usage



// Component A unmounts → reference count: 1 (state preserved)```typescript

// Component B unmounts → reference count: 0 → automatic cleanup!// Dashboard state management

```const dashboardState = useGlobalFormaState({ stateId: "admin-dashboard" });



### 2. **Individual Field Subscriptions**// Real-time data subscriptions

const metrics = dashboardState.useValue("analytics.metrics");

```tsxconst userList = dashboardState.useValue("users.list");

// ✅ Forma - only re-renders when specific field changesconst systemStatus = dashboardState.useValue("system.status");

const userName = state.useValue("user.name");const activeFilters = dashboardState.useValue("filters.current");

const userEmail = state.useValue("user.email");```



// ❌ Traditional approach - re-renders when any field changes#### useGlobalForm Usage

const user = useStore((state) => state.user);

``````typescript

// Settings form (shared across multiple tabs)

### 3. **Dot Notation Support**const settingsForm = useGlobalForm({

    formId: "admin-settings",

```tsx    validation: {

// Access nested objects naturally        siteName: "required",

const streetAddress = state.useValue("user.address.street");        adminEmail: "required|email",

const phoneNumber = state.useValue("user.contact.phone");        maxUsers: "required|numeric",

```    },

    onSubmit: async (values) => {

### 4. **Built-in Form Features**        await updateSettings(values);

    },

```tsx});

const form = useGlobalForm({```

    formId: "contact-form",

    onValidate: async (values) => { /* validation */ },### 4. Gaming App 🎮

    onSubmit: async (values) => { /* submission */ },

    onComplete: () => { /* success callback */ }#### useGlobalFormaState Usage

});

```typescript

// Built-in loading states// Game state management

console.log(form.isSubmitting); // true/falseconst gameState = useGlobalFormaState({ stateId: "game-state" });

console.log(form.isModified); // true/false

```// Game data subscriptions

const playerStats = gameState.useValue("player.stats");

## Performance Comparisonconst inventory = gameState.useValue("player.inventory");

const gameSettings = gameState.useValue("settings.game");

| Feature | Context API | Zustand | Forma |const leaderboard = gameState.useValue("leaderboard.top10");

|---------|------------|---------|--------|```

| Individual Field Subscriptions | ❌ | ⚠️ Manual | ✅ Built-in |

| Automatic Memory Cleanup | ❌ | ❌ | ✅ |#### useGlobalForm Usage

| Dot Notation Access | ❌ | ❌ | ✅ |

| Form-specific Features | ❌ | ❌ | ✅ |```typescript

| Zero Configuration | ❌ | ⚠️ Setup Required | ✅ |// Profile settings form

const profileForm = useGlobalForm({

## Related Documents    formId: "player-profile",

    validation: {

- **[API Reference](./API.md)** - Complete API documentation        nickname: "required|min:3|max:20",

- **[Library Comparison](./library-comparison.md)** - Compare with other form libraries        avatar: "required",

- **[useGlobalForm Guide](./useGlobalForm-guide.md)** - Detailed global form guide    },
    onSubmit: async (values) => {
        await updateProfile(values);
    },
});
```````

### 5. Collaboration Tool 💼

#### useGlobalFormaState Usage

```typescript
// Workspace state management
const workspaceState = useGlobalFormaState({ stateId: "workspace" });

// Real-time collaboration data
const messages = workspaceState.useValue("chat.messages");
const documents = workspaceState.useValue("documents.list");
const members = workspaceState.useValue("workspace.members");
const notifications = workspaceState.useValue("notifications.all");
```

#### useGlobalForm Usage

```typescript
// Document creation/editing form
const documentForm = useGlobalForm({
    formId: "document-editor",
    validation: {
        title: "required",
        content: "required",
    },
    onSubmit: async (values) => {
        await saveDocument(values);
    },
});
```

## 🔄 Interaction Patterns

### 1. FormaState → Form Direction

```typescript
// Data transfer from global state to form
const appState = useGlobalFormaState({ stateId: "app" });
const userProfile = appState.useValue("user.profile");

const form = useGlobalForm({
    formId: "edit-profile",
    initialValues: userProfile, // Use global state data as initial values
});
```

### 2. Form → FormaState Direction

```typescript
const form = useGlobalForm({
    formId: "user-form",
    onSubmit: async (values) => {
        await updateUser(values);
        // Update global state after successful form submission
        appState.setValue("user.profile", values);
    },
});
```

### 3. Independent Operation

-   **FormaState**: Real-time data, filters, UI state management
-   **Form**: User input, validation, submission tasks

## 💡 Selection Guide

### Choose useGlobalFormaState when:

-   Simple state sharing between multiple components is needed
-   Real-time data synchronization is required
-   Managing UI state (theme, language, sidebar state, etc.)
-   Performance optimization through individual field subscriptions is important

### Choose useGlobalForm when:

-   Managing actual HTML form elements
-   Form validation and submission logic is needed
-   Maintaining form state across multiple steps/pages
-   Error handling and loading state management is required

## ⚠️ Precautions

1. **Proper Separation**: Clearly distinguish between state management and form management
2. **ID Naming**: Use `formId` for forms, `stateId` for general state
3. **Memory Management**: Clean up unnecessary global state to prevent memory leaks
4. **Type Safety**: Use with TypeScript to ensure type safety

## 📚 Related Documentation

-   [useGlobalForm Guide](./useGlobalForm-guide.md)
-   [useFormaState Usage](./getting-started.md)
-   [Performance Optimization Tips](./performance-optimization-report.md)
