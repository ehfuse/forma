# Forma 성능 최적화 가이드

Forma를 효율적으로 사용하기 위한 핵심 패턴입니다.

## 🚀 핵심 원칙

### 1. 개별 필드 구독 사용하기

```tsx
// ❌ 전체 객체 구독 - 모든 필드 변경 시 리렌더링
const user = form.useFormValue("user");
return (
    <div>
        <TextField value={user.name} onChange={form.handleFormChange} />
        <TextField value={user.email} onChange={form.handleFormChange} />
    </div>
);

// ✅ 개별 필드 구독 - 해당 필드만 리렌더링
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");
return (
    <div>
        <TextField value={userName} onChange={form.handleFormChange} />
        <TextField value={userEmail} onChange={form.handleFormChange} />
    </div>
);
```

### 2. 조건부 구독

```tsx
// ✅ 필요할 때만 구독
function ConditionalField({ showField }: { showField: boolean }) {
    const value = showField ? form.useFormValue("optionalField") : "";

    return showField ? (
        <TextField value={value} onChange={form.handleFormChange} />
    ) : null;
}
```

### 3. 복잡한 계산 메모이제이션

```tsx
// ✅ 복잡한 계산은 useMemo 사용
function ExpensiveValidation() {
    const email = form.useFormValue("email");
    const password = form.useFormValue("password");

    const isValid = useMemo(() => {
        return validateEmail(email) && validatePassword(password);
    }, [email, password]);

    return <div>{isValid ? "✓" : "✗"}</div>;
}
```

## 📝 권장 패턴

### useForm vs useGlobalForm

```tsx
// ✅ 단일 컴포넌트 → useForm
function ContactForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
    });
}

// ✅ 다중 컴포넌트/페이지 → useGlobalForm
function MultiStepForm() {
    const form = useGlobalForm({
        formId: "user-registration",
    });
}
```

### 컴포넌트 분리

```tsx
// ✅ 필드별 컴포넌트 분리
function UserNameField() {
    const name = form.useFormValue("name");
    return <TextField value={name} onChange={form.handleFormChange} />;
}

function UserEmailField() {
    const email = form.useFormValue("email");
    return <TextField value={email} onChange={form.handleFormChange} />;
}
```

## ❌ 피해야 할 패턴

- `form.values` 직접 접근 (전체 구독)
- 조건부 필드에서 무조건 구독
- 컴포넌트마다 별도 useForm 생성
- 매 렌더링마다 새 객체/배열 생성

## 🔧 디버깅

```tsx
// 개발 환경에서 성능 확인
if (process.env.NODE_ENV === "development") {
    console.log("Form Values:", form.getFormValues());
}
```
