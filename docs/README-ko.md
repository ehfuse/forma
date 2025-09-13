# Forma - 한국어 문서

**고급 React 폼 상태 관리 라이브러리**

Forma는 React 애플리케이션에서 폼 상태를 효율적으로 관리하기 위한 고성능 라이브러리입니다. 개별 필드 구독을 통한 선택적 리렌더링과 글로벌 폼 상태 공유 기능을 제공합니다.

---

## 🚀 주요 특징

-   ✅ **개별 필드 구독**: 필드별 선택적 리렌더링으로 최적화된 성능
-   ✅ **Dot Notation 지원**: `user.profile.name` 형태의 중첩 객체 접근
-   ✅ **MUI 완전 호환**: Material-UI 컴포넌트와 완벽한 통합
-   ✅ **글로벌 폼 상태**: 여러 컴포넌트 간 폼 상태 공유
-   ✅ **TypeScript 완전 지원**: 강력한 타입 안전성
-   ✅ **React 19 최적화**: 최신 React 기능 활용

---

## 📦 설치

```bash
npm install @ehfuse/forma
```

또는

```bash
yarn add @ehfuse/forma
```

---

## 🎯 빠른 시작

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
            console.log("제출:", values);
        },
    });

    // 개별 필드 구독 (성능 최적화)
    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <form onSubmit={form.submit}>
            <TextField
                name="name"
                value={name}
                onChange={form.handleFormChange}
            />
            <TextField
                name="email"
                value={email}
                onChange={form.handleFormChange}
            />
            <Button type="submit" disabled={form.isSubmitting}>
                제출
            </Button>
        </form>
    );
}
```

📖 **[상세한 시작 가이드 보기](./getting-started-ko.md)** - 단계별 튜토리얼, 검증, 고급 기능

🔄 **[글로벌 훅 비교 가이드 보기](./global-hooks-comparison-ko.md)** - useGlobalForm vs useGlobalFormaState 비교 및 활용법

⚖️ **[라이브러리 비교 가이드 보기](./library-comparison-ko.md)** - Forma vs 다른 상태 관리 라이브러리 상세 비교

---

## 📚 API 레퍼런스

### 핵심 훅

#### useForm

로컬 폼 상태를 관리하는 기본 훅입니다.

```tsx
const form = useForm<T>({
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
  onValidate?: (values: T) => Promise<boolean> | boolean;
});
```

#### useGlobalForm

글로벌 폼 상태를 관리하는 확장 훅입니다.

```tsx
const form = useGlobalForm<T>({
  formId: string;
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
});
```

📖 **[완전한 API 레퍼런스 보기](./API-ko.md)** - 모든 메서드, 타입, 예제, 마이그레이션 가이드

🔄 **[글로벌 훅 비교 가이드 보기](./global-hooks-comparison-ko.md)** - useGlobalForm vs useGlobalFormaState 차이점 및 활용 시나리오

### Dot Notation 지원

중첩된 객체에 쉽게 접근할 수 있습니다:

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

// Dot notation으로 중첩 객체 접근
const name = form.useFormValue("user.profile.name");
const theme = form.useFormValue("user.profile.settings.theme");

<TextField
    name="user.profile.name"
    value={name}
    onChange={form.handleFormChange}
/>;
```

## 🎨 MUI 컴포넌트 지원

Forma는 Material-UI의 모든 폼 컴포넌트와 완벽하게 호환됩니다:

### TextField

```tsx
<TextField
    name="email"
    value={form.useFormValue("email")}
    onChange={form.handleFormChange}
/>
```

### Select

```tsx
<Select
    name="category"
    value={form.useFormValue("category")}
    onChange={form.handleFormChange}
>
    <MenuItem value="A">카테고리 A</MenuItem>
    <MenuItem value="B">카테고리 B</MenuItem>
</Select>
```

### DatePicker

```tsx
<DatePicker
    value={form.useFormValue("birthDate")}
    onChange={form.handleDatePickerChange("birthDate")}
/>
```

### Checkbox

```tsx
<Checkbox
    name="agree"
    checked={form.useFormValue("agree")}
    onChange={form.handleFormChange}
/>
```

## ⚡ 성능 최적화

Forma는 개별 필드 구독을 통해 최적화된 성능을 제공합니다. 자세한 성능 최적화 가이드는 [성능 최적화 문서](./best-practices-ko.md)를 참고하세요.

### 핵심 원칙

-   **개별 필드 구독**: `useFormValue("fieldName")`로 필요한 필드만 구독
-   **조건부 구독**: 조건부 렌더링 시 조건부 구독 적용
-   **단일 Form 인스턴스**: 여러 컴포넌트에서 하나의 form 인스턴스 공유

```tsx
// ✅ 효율적: 개별 필드 구독
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");

return (
    <div>
        <TextField
            name="user.name"
            value={userName}
            onChange={form.handleFormChange}
        />
        <TextField
            name="user.email"
            value={userEmail}
            onChange={form.handleFormChange}
        />
        {/* user.name 변경 시 → userName TextField만 리렌더링 */}
    </div>
);
```

📖 **[상세한 성능 최적화 가이드 보기](./best-practices-ko.md)**

## 🔧 고급 사용법

### 폼 검증

```tsx
const form = useForm({
    initialValues: { email: "", password: "" },
    onValidate: async (values) => {
        if (!values.email.includes("@")) {
            alert("올바른 이메일을 입력하세요");
            return false;
        }
        if (values.password.length < 6) {
            alert("비밀번호는 6자 이상이어야 합니다");
            return false;
        }
        return true;
    },
    onSubmit: async (values) => {
        await api.submitForm(values);
    },
});
```

### 동적 초기값 설정

```tsx
useEffect(() => {
    if (userId) {
        // 사용자 데이터 로드 후 초기값 설정
        const userData = await fetchUser(userId);
        form.setInitialFormValues(userData);
    }
}, [userId]);
```

### 복잡한 중첩 구조

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

// 배열 요소 접근도 가능
const firstEmployeeName = form.useFormValue("company.employees.0.name");
const firstEmployeeEmail = form.useFormValue(
    "company.employees.0.contact.email"
);
```

## 🌟 사용 사례

### 1. 다단계 폼

```tsx
// 1단계: 기본 정보
function Step1() {
    const form = useGlobalForm({
        formId: "registration",
        initialValues: { name: "", email: "", phone: "" },
    });

    return (
        <>
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
            <TextField
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
            />
        </>
    );
}

// 2단계: 추가 정보 (같은 폼 상태 공유)
function Step2() {
    const form = useGlobalForm({
        formId: "registration",
        initialValues: { name: "", email: "", phone: "" },
    });

    return (
        <TextField
            name="phone"
            value={form.useFormValue("phone")}
            onChange={form.handleFormChange}
        />
    );
}
```

### 2. 실시간 미리보기

```tsx
function FormWithPreview() {
    const form = useForm({
        initialValues: { title: "", content: "", author: "" },
    });

    return (
        <Grid container spacing={2}>
            <Grid item xs={6}>
                {/* 입력 폼 */}
                <TextField
                    name="title"
                    value={form.useFormValue("title")}
                    onChange={form.handleFormChange}
                />
                <TextField
                    name="content"
                    value={form.useFormValue("content")}
                    onChange={form.handleFormChange}
                />
            </Grid>
            <Grid item xs={6}>
                {/* 실시간 미리보기 */}
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
            <Typography variant="h5">{title || "제목 없음"}</Typography>
            <Typography>{content || "내용 없음"}</Typography>
        </Paper>
    );
}
```

### 3. 조건부 필드

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
            <Select
                name="accountType"
                value={accountType}
                onChange={form.handleFormChange}
            >
                <MenuItem value="personal">개인</MenuItem>
                <MenuItem value="business">사업자</MenuItem>
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

## 🐛 문제 해결

### 일반적인 문제

**Q: 폼이 리렌더링되지 않아요**

```tsx
// ❌ 잘못된 방법
const value = form.getFormValue("name"); // 구독 없음

// ✅ 올바른 방법
const value = form.useFormValue("name"); // 구독 있음
```

**Q: DatePicker 값이 제대로 설정되지 않아요**

```tsx
// ✅ DatePicker 전용 핸들러 사용
<DatePicker
    value={form.useFormValue("date")}
    onChange={form.handleDatePickerChange("date")}
/>
```

**Q: 중첩 객체 접근이 안 돼요**

```tsx
// ✅ Dot notation 사용
const cityValue = form.useFormValue("address.city");

<TextField
    name="address.city"
    value={cityValue}
    onChange={form.handleFormChange}
/>;
```

### 성능 최적화 팁

1. **useFormValue 사용**: 가능한 한 `useFormValue`를 사용하여 개별 필드 구독
2. **조건부 구독**: 조건부로 렌더링되는 필드는 조건부로 구독
3. **메모이제이션**: 복잡한 계산이 필요한 경우 useMemo 사용

## 📞 연락처

-   **개발자**: 김영진 (KIM YOUNG JIN)
-   **이메일**: ehfuse@gmail.com
-   **GitHub**: https://github.com/ehfuse/forma

## 🔄 버전 히스토리

### v1.0.0 (2025-01-07)

-   초기 릴리스
-   useForm, useGlobalForm 훅 제공
-   Dot notation 지원
-   MUI 완전 호환
-   TypeScript 완전 지원

---

**Forma** - _고급 React 폼 상태 관리의 새로운 기준_
