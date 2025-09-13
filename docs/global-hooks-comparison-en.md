# useGlobalForm vs useGlobalFormaState Comparison and Usage Guide

## 📋 Overview

The Forma library provides two global state management hooks:

-   `useGlobalForm`: Global state management for forms
-   `useGlobalFormaState`: General global state management

Understanding the characteristics and appropriate usage scenarios for each is crucial.

## 🔍 Key Differences

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
    validation: { name: "required" },
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

-   ✅ Individual field subscriptions
-   ✅ Optimized rendering
-   ✅ Pure state management
-   ❌ No form validation
-   ❌ No form submission features
-   ❌ No submission state

**Usage Example**:

```typescript
const state = useGlobalFormaState({
    stateId: "app-state",
});

const userName = state.useValue("user.name"); // re-render only on name change
state.setValue("user.name", "John"); // state update
```

## 🎯 Real-world Usage Scenarios

### 1. E-commerce App 🛒

#### useGlobalFormaState Usage

```typescript
// Global app state management
const appState = useGlobalFormaState({ stateId: "ecommerce-app" });

// Individual field subscriptions per component
const cartItems = appState.useValue("cart.items"); // shopping cart
const userInfo = appState.useValue("user.profile"); // user info
const theme = appState.useValue("ui.theme"); // theme settings
const filters = appState.useValue("search.filters"); // search filters
```

#### useGlobalForm Usage

```typescript
// Checkout form management (shared across multiple steps)
const checkoutForm = useGlobalForm({
    formId: "checkout-form",
    validation: {
        email: "required|email",
        address: "required",
        paymentMethod: "required",
    },
    onSubmit: async (values) => {
        // order processing logic
        await processOrder(values);
    },
});
```

### 2. Social Media App 📱

#### useGlobalFormaState Usage

```typescript
// Real-time data state management
const socialState = useGlobalFormaState({ stateId: "social-app" });

// Subscribe only to necessary data in each component
const timeline = socialState.useValue("timeline.posts");
const notifications = socialState.useValue("notifications.unread");
const currentUser = socialState.useValue("user.profile");
const chatMessages = socialState.useValue("chat.messages");
```

#### useGlobalForm Usage

```typescript
// Post creation form (accessible from multiple pages)
const postForm = useGlobalForm({
    formId: "create-post",
    validation: {
        content: "required|min:1",
        images: "max:5",
    },
    onSubmit: async (values) => {
        await createPost(values);
    },
});
```

### 3. Dashboard/Admin Panel 📊

#### useGlobalFormaState Usage

```typescript
// Dashboard state management
const dashboardState = useGlobalFormaState({ stateId: "admin-dashboard" });

// Real-time data subscriptions
const metrics = dashboardState.useValue("analytics.metrics");
const userList = dashboardState.useValue("users.list");
const systemStatus = dashboardState.useValue("system.status");
const activeFilters = dashboardState.useValue("filters.current");
```

#### useGlobalForm Usage

```typescript
// Settings form (shared across multiple tabs)
const settingsForm = useGlobalForm({
    formId: "admin-settings",
    validation: {
        siteName: "required",
        adminEmail: "required|email",
        maxUsers: "required|numeric",
    },
    onSubmit: async (values) => {
        await updateSettings(values);
    },
});
```

### 4. Gaming App 🎮

#### useGlobalFormaState Usage

```typescript
// Game state management
const gameState = useGlobalFormaState({ stateId: "game-state" });

// Game data subscriptions
const playerStats = gameState.useValue("player.stats");
const inventory = gameState.useValue("player.inventory");
const gameSettings = gameState.useValue("settings.game");
const leaderboard = gameState.useValue("leaderboard.top10");
```

#### useGlobalForm Usage

```typescript
// Profile settings form
const profileForm = useGlobalForm({
    formId: "player-profile",
    validation: {
        nickname: "required|min:3|max:20",
        avatar: "required",
    },
    onSubmit: async (values) => {
        await updateProfile(values);
    },
});
```

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

-   [useGlobalForm Guide](./useGlobalForm-guide-en.md)
-   [useFormaState Usage](./getting-started-en.md)
-   [Performance Optimization Tips](./performance-optimization-report.md)
