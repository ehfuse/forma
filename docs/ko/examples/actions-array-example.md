# Actions 배열 사용 예제

## 개요

Actions를 객체 또는 배열로 전달할 수 있습니다. 배열로 전달하면 여러 actions 객체가 자동으로 병합됩니다.

## 사용 예제

### 1. 객체로 전달 (기존 방식)

```typescript
const form = useForm({
    initialValues: { name: "", price: 0 },
    actions: {
        validateName: (context) => context.values.name.length > 0,
        formatPrice: (context) => `$${context.values.price.toFixed(2)}`,
    },
});
```

### 2. 배열로 전달 (새로운 방식)

```typescript
// 재사용 가능한 actions 모듈
const validationActions = {
    validateName: (context) => context.values.name.length > 0,
    validateEmail: (context) => context.values.email.includes("@"),
};

const formattingActions = {
    formatPrice: (context) => `$${context.values.price.toFixed(2)}`,
    formatDate: (context) => new Date(context.values.date).toLocaleDateString(),
};

// 배열로 전달하면 자동 병합
const form = useForm({
    initialValues: { name: "", email: "", price: 0, date: "" },
    actions: [validationActions, formattingActions],
});

// 모든 actions 사용 가능
form.actions.validateName();
form.actions.validateEmail();
form.actions.formatPrice();
form.actions.formatDate();
```

### 3. 공통 + 커스텀 actions 조합

```typescript
// 공통으로 사용되는 actions
const commonActions = {
    reset: (context) => context.reset(),
    clear: (context) => context.setValues({}),
};

// 특정 폼에만 필요한 actions
const productActions = {
    calculateDiscount: (context) => {
        const price = context.values.price;
        const discount = context.values.discount;
        return price * (1 - discount / 100);
    },
    applyTax: (context) => {
        const price = context.values.price;
        return price * 1.1; // 10% 세금
    },
};

// 배열로 조합
const form = useForm({
    initialValues: { price: 0, discount: 0 },
    actions: [commonActions, productActions],
});
```

### 4. useGlobalForm에서 배열 사용

```typescript
// 컴포넌트 A: 기본 actions 정의
function ComponentA() {
    const form = useGlobalForm({
        formId: "product-form",
        initialValues: { name: "", price: 0 },
        actions: [validationActions, formattingActions],
    });

    // ...
}

// 컴포넌트 B: 추가 actions 정의 (병합됨)
function ComponentB() {
    const form = useGlobalForm({
        formId: "product-form",
        actions: [calculationActions], // 기존 actions에 추가
    });

    // 모든 actions 사용 가능 (validationActions + formattingActions + calculationActions)
    form.actions.validateName();
    form.actions.formatPrice();
    form.actions.calculateDiscount();
}
```

## 주의사항

1. **우선순위**: 배열의 나중 요소가 앞의 요소를 덮어씁니다

    ```typescript
    const actions1 = { save: () => "v1" };
    const actions2 = { save: () => "v2" };

    // actions2.save가 사용됨
    const form = useForm({
        actions: [actions1, actions2],
    });
    ```

2. **타입 안정성**: TypeScript에서 모든 actions의 타입이 유지됩니다

3. **성능**: 배열 병합은 useMemo로 최적화되어 있어 성능 이슈가 없습니다

## 활용 시나리오

### 1. 도메인별 actions 분리

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

### 2. 기능별 actions 조합

```typescript
// 읽기 전용 뷰
const form = useForm({
    actions: [formattingActions], // 포맷팅만
});

// 편집 가능한 폼
const form = useForm({
    actions: [validationActions, formattingActions, calculationActions], // 모든 기능
});
```

### 3. 조건부 actions 추가

```typescript
const baseActions = [validationActions, formattingActions];
const adminActions = isAdmin ? [adminOnlyActions] : [];

const form = useForm({
    actions: [...baseActions, ...adminActions],
});
```
