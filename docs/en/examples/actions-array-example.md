# Actions Array Usage Example

## Overview

Actions can be passed as an object or array. When passed as an array, multiple actions objects are automatically merged.

## Usage Examples

### 1. Object Passing (Traditional Approach)

```typescript
const form = useForm({
    initialValues: { name: "", price: 0 },
    actions: {
        validateName: (context) => context.values.name.length > 0,
        formatPrice: (context) => `$${context.values.price.toFixed(2)}`,
    },
});
```

### 2. Array Passing (New Approach)

```typescript
// Reusable actions modules
const validationActions = {
    validateName: (context) => context.values.name.length > 0,
    validateEmail: (context) => context.values.email.includes("@"),
};

const formattingActions = {
    formatPrice: (context) => `$${context.values.price.toFixed(2)}`,
    formatDate: (context) => new Date(context.values.date).toLocaleDateString(),
};

// Automatically merged when passed as array
const form = useForm({
    initialValues: { name: "", email: "", price: 0, date: "" },
    actions: [validationActions, formattingActions],
});

// All actions available
form.actions.validateName();
form.actions.validateEmail();
form.actions.formatPrice();
form.actions.formatDate();
```

### 3. Common + Custom Actions Combination

```typescript
// Commonly used actions
const commonActions = {
    reset: (context) => context.reset(),
    clear: (context) => context.setValues({}),
};

// Form-specific actions
const productActions = {
    calculateDiscount: (context) => {
        const price = context.values.price;
        const discount = context.values.discount;
        return price * (1 - discount / 100);
    },
    applyTax: (context) => {
        const price = context.values.price;
        return price * 1.1; // 10% tax
    },
};

// Combine with array
const form = useForm({
    initialValues: { price: 0, discount: 0 },
    actions: [commonActions, productActions],
});
```

### 4. Array Usage in useGlobalForm

```typescript
// Component A: Define base actions
function ComponentA() {
    const form = useGlobalForm({
        formId: "product-form",
        initialValues: { name: "", price: 0 },
        actions: [validationActions, formattingActions],
    });

    // ...
}

// Component B: Define additional actions (merged)
function ComponentB() {
    const form = useGlobalForm({
        formId: "product-form",
        actions: [calculationActions], // Added to existing actions
    });

    // All actions available (validationActions + formattingActions + calculationActions)
    form.actions.validateName();
    form.actions.formatPrice();
    form.actions.calculateDiscount();
}
```

## Considerations

1. **Priority**: Later array elements override earlier ones

    ```typescript
    const actions1 = { save: () => "v1" };
    const actions2 = { save: () => "v2" };

    // actions2.save is used
    const form = useForm({
        actions: [actions1, actions2],
    });
    ```

2. **Type Safety**: TypeScript maintains types for all actions

3. **Performance**: Array merging is optimized with useMemo, no performance issues

## Use Case Scenarios

### 1. Domain-based Actions Separation

```typescript
// domains/validation.ts
export const validationActions = { ... };

// domains/formatting.ts
export const formattingActions = { ... };

// domains/calculation.ts
export const calculationActions = { ... };

// MyForm.tsx
import { validationActions, formattingActions, calculationActions } from './domains';

const form = useForm({
    actions: [validationActions, formattingActions, calculationActions]
});
```

### 2. Feature-based Actions Combination

```typescript
// Read-only view
const form = useForm({
    actions: [formattingActions], // Formatting only
});

// Editable form
const form = useForm({
    actions: [validationActions, formattingActions, calculationActions], // All features
});
```

### 3. Conditional Actions Addition

```typescript
const baseActions = [validationActions, formattingActions];
const adminActions = isAdmin ? [adminOnlyActions] : [];

const form = useForm({
    actions: [...baseActions, ...adminActions],
});
```
