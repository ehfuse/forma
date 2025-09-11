# Forma API Reference

이 문서는 Forma 라이브러리의 모든 API에 대한 상세한 레퍼런스를 제공합니다.

## Table of Contents

- [Hooks](#hooks)
    - [useForm](#useform)
    - [useGlobalForm](#useglobalform)
    - [useRegisterGlobalForm](#useregisterglobalform)
- [Components](#components)
    - [GlobalFormProvider](#globalformprovider)
- [Core Classes](#core-classes)
    - [FieldStore](#fieldstore)
- [Utilities](#utilities)
    - [getNestedValue](#getnestedvalue)
    - [setNestedValue](#setnestedvalue)
- [TypeScript Types](#typescript-types)

---

## Hooks

### useForm

로컬 폼 상태를 관리하는 기본 훅입니다.

#### Signature

```typescript
function useForm<T extends Record<string, any>>(
    props: UseFormProps<T>
): UseFormReturn<T>;
```

#### Parameters

```typescript
interface UseFormProps<T> {
    /** 폼의 초기값 */
    initialValues: T;
    /** 폼 제출 핸들러 */
    onSubmit?: (values: T) => Promise<void> | void;
    /** 폼 검증 핸들러 - true 반환 시 검증 통과 */
    onValidate?: (values: T) => Promise<boolean> | boolean;
    /** 폼 제출 완료 후 콜백 */
    onComplete?: (values: T) => void;
    /** 내부 API: 외부 스토어 (useGlobalForm에서 사용) */
    _externalStore?: FieldStore<T>;
}
```

#### Return Value

```typescript
interface UseFormReturn<T> {
    // 상태
    isSubmitting: boolean; // 제출 중 여부
    isValidating: boolean; // 검증 중 여부
    isModified: boolean; // 수정됨 여부

    // 값 조회 (구독 있음 - 권장)
    useFormValue: (fieldName: string) => any;

    // 값 조회 (구독 없음)
    getFormValue: (fieldName: string) => any;
    getFormValues: () => T;

    // 값 설정
    setFormValue: (name: string, value: any) => void;
    setFormValues: (values: Partial<T>) => void;
    setInitialFormValues: (values: T) => void;

    // 이벤트 핸들러
    handleFormChange: (e: FormChangeEvent) => void;
    handleDatePickerChange: (fieldName: string) => DatePickerChangeHandler;

    // 폼 액션
    submit: (e?: React.FormEvent) => Promise<boolean>;
    resetForm: () => void;
    validateForm: () => Promise<boolean>;

    // 호환성 (비권장 - 전체 리렌더링 발생)
    values: T;
}
```

#### Examples

##### 기본 사용법

```typescript
const form = useForm({
    initialValues: {
        name: "",
        email: "",
        age: 0,
    },
    onSubmit: async (values) => {
        await api.submitUser(values);
    },
    onValidate: async (values) => {
        return values.email.includes("@");
    },
});

// 개별 필드 구독 (성능 최적화)
const name = form.useFormValue("name");
const email = form.useFormValue("email");
```

##### 중첩 객체 처리

```typescript
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
```

---

### useGlobalForm

글로벌 폼 상태를 관리하는 확장 훅입니다. useForm의 모든 기능을 포함합니다.

📚 **[자세한 사용법 가이드](./useGlobalForm-guide-ko.md)**를 참고하세요.

#### Signature

```typescript
function useGlobalForm<T extends Record<string, any>>(
    props: UseGlobalFormProps<T>
): UseGlobalFormReturn<T>;
```

#### Parameters

```typescript
interface UseGlobalFormProps<T> {
    /** 전역에서 폼을 식별하는 고유 ID */
    formId: string;
}
```

#### Return Value

```typescript
interface UseGlobalFormReturn<T> extends UseFormReturn<T> {
    /** 글로벌 폼 식별자 */
    formId: string;
    /** 글로벌 스토어 직접 접근 */
    _store: FieldStore<T>;
}
```

#### Examples

##### 다단계 폼

```typescript
// Step 1 Component
function Step1() {
  const form = useGlobalForm({
    formId: "user-registration",
    initialValues: { name: "", email: "", phone: "" }
  });

  return (
    <TextField
      name="name"
      value={form.useFormValue("name")}
      onChange={form.handleFormChange}
    />
  );
}

// Step 2 Component (같은 폼 상태 공유)
function Step2() {
  const form = useGlobalForm({
    formId: "user-registration", // 같은 ID
    initialValues: { name: "", email: "", phone: "" }
  });

  return (
    <TextField
      name="email"
      value={form.useFormValue("email")}
      onChange={form.handleFormChange}
    />
  );
}
```

---

### useRegisterGlobalForm

기존에 생성된 useForm 인스턴스를 글로벌 폼으로 등록하는 훅입니다.

#### Signature

```typescript
function useRegisterGlobalForm<T>(formId: string, form: UseFormReturn<T>): void;
```

#### Parameters

- `formId`: 글로벌 폼의 고유 식별자
- `form`: 등록할 useForm 인스턴스

#### 특징

- **글로벌 공유**: 로컬 폼을 글로벌 상태로 변환
- **자동 동기화**: 등록된 폼은 다른 컴포넌트에서 접근 가능
- **타입 안전성**: TypeScript를 통한 완전한 타입 추론

#### Example

```typescript
import { useForm, useRegisterGlobalForm } from '@ehfuse/forma';

function MyComponent() {
    // 로컬 폼 생성
    const form = useForm<{ name: string; email: string }>({
        initialValues: { name: '', email: '' },
        onSubmit: async (values) => console.log(values)
    });

    // 글로벌 폼으로 등록
    useRegisterGlobalForm('shared-form', form);

    return (
        <input
            value={form.useFormValue('name')}
            onChange={form.handleFormChange}
            name="name"
        />
    );
}

// 다른 컴포넌트에서 접근
function AnotherComponent() {
    const form = useGlobalForm<{ name: string; email: string }>({
        formId: 'shared-form'
    });

    return <p>이름: {form.useFormValue('name')}</p>;
}
```

---

## Components

### GlobalFormProvider

글로벌 폼 상태 관리를 위한 Context Provider입니다.

#### Signature

```typescript
function GlobalFormProvider({ children }: { children: ReactNode }): JSX.Element;
```

#### Usage

```typescript
// App.tsx
import { GlobalFormProvider } from "@/forma";

function App() {
  return (
    <GlobalFormProvider>
      <Router>
        <Routes>
          <Route path="/step1" element={<Step1 />} />
          <Route path="/step2" element={<Step2 />} />
        </Routes>
      </Router>
    </GlobalFormProvider>
  );
}
```

---

## Core Classes

### FieldStore

개별 필드별 상태 관리와 구독 시스템을 제공하는 핵심 클래스입니다.

#### Constructor

```typescript
constructor(initialValues: T)
```

#### Methods

##### getValue

```typescript
getValue(fieldName: string): any
```

특정 필드의 현재 값을 반환합니다.

##### setValue

```typescript
setValue(fieldName: string, value: any): void
```

특정 필드의 값을 설정합니다. Dot notation을 지원합니다.

##### getValues

```typescript
getValues(): T
```

모든 필드의 현재 값을 객체로 반환합니다.

##### setValues

```typescript
setValues(values: Partial<T>): void
```

여러 필드의 값을 일괄 설정합니다.

##### subscribe

```typescript
subscribe(fieldName: string, callback: () => void): () => void
```

특정 필드의 변경을 구독합니다. 구독 해제 함수를 반환합니다.

##### subscribeGlobal

```typescript
subscribeGlobal(callback: () => void): () => void
```

모든 필드의 변경을 구독합니다.

##### reset

```typescript
reset(): void
```

모든 필드를 초기값으로 되돌립니다.

##### isModified

```typescript
isModified(): boolean
```

초기값에서 변경되었는지 확인합니다.

---

## Utilities

### getNestedValue

중첩 객체에서 값을 가져오는 유틸리티 함수입니다.

#### Signature

```typescript
function getNestedValue(obj: any, path: string): any;
```

#### Parameters

- `obj`: 대상 객체
- `path`: 접근 경로 (예: "user.profile.name")

#### Example

```typescript
const user = {
    profile: {
        name: "김영진",
        settings: { theme: "dark" },
    },
};

const name = getNestedValue(user, "profile.name"); // "김영진"
const theme = getNestedValue(user, "profile.settings.theme"); // "dark"
```

---

### setNestedValue

중첩 객체에서 값을 설정하는 유틸리티 함수입니다. 불변성을 유지합니다.

#### Signature

```typescript
function setNestedValue(obj: any, path: string, value: any): any;
```

#### Parameters

- `obj`: 대상 객체
- `path`: 설정할 경로 (예: "user.profile.name")
- `value`: 설정할 값

#### Returns

새로운 객체 (불변성 유지)

#### Example

```typescript
const user = {
    profile: {
        name: "김영진",
        settings: { theme: "dark" },
    },
};

const newUser = setNestedValue(user, "profile.name", "이영희");
// newUser.profile.name === "이영희"
// user는 변경되지 않음 (불변성 유지)
```

---

## TypeScript Types

### FormChangeEvent

폼 이벤트의 통합 타입입니다. 다양한 MUI 컴포넌트의 이벤트를 지원합니다.

```typescript
type FormChangeEvent =
    | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    | SelectChangeEvent
    | SelectChangeEvent<string | number>
    | {
          target: { name: string; value: any };
          onChange?: (
              value: any,
              context: PickerChangeHandlerContext<any>
          ) => void;
      };
```

### DatePickerChangeHandler

DatePicker 전용 이벤트 핸들러 타입입니다.

```typescript
type DatePickerChangeHandler = (
    fieldName: string
) => (value: any, context?: PickerChangeHandlerContext<any>) => void;
```

### UseFormProps

useForm 훅의 매개변수 타입입니다.

```typescript
interface UseFormProps<T extends Record<string, any>> {
    initialValues: T;
    onSubmit?: (values: T) => Promise<void> | void;
    onValidate?: (values: T) => Promise<boolean> | boolean;
    onComplete?: (values: T) => void;
    _externalStore?: FieldStore<T>;
}
```

### UseGlobalFormProps

useGlobalForm 훅의 매개변수 타입입니다.

```typescript
interface UseGlobalFormProps<T extends Record<string, any>> {
    formId: string;
}
```

### GlobalFormContextType

글로벌 폼 컨텍스트의 타입입니다.

```typescript
interface GlobalFormContextType {
    getOrCreateStore: <T extends Record<string, any>>(
        formId: string,
        initialValues: T
    ) => FieldStore<T>;
}
```

---

## Best Practices

### 성능 최적화

1. **개별 필드 구독 사용**

    ```typescript
    // ✅ 권장: 필드별 구독
    const name = form.useFormValue("name");

    // ❌ 비권장: 전체 객체 구독
    const { name } = form.values;
    ```

2. **조건부 구독**
    ```typescript
    function ConditionalField({ showField }) {
      const value = showField ? form.useFormValue("field") : "";
      return showField ? <TextField value={value} /> : null;
    }
    ```

### 타입 안전성

1. **제네릭 타입 사용**

    ```typescript
    interface UserForm {
        name: string;
        email: string;
        age: number;
    }

    const form = useForm<UserForm>({
        initialValues: { name: "", email: "", age: 0 },
    });
    ```

2. **타입 가드 활용**
    ```typescript
    const email = form.useFormValue("email") as string;
    ```

### 에러 처리

1. **검증 함수에서 에러 처리**

    ```typescript
    onValidate: async (values) => {
        try {
            await validateEmail(values.email);
            return true;
        } catch (error) {
            console.error("Validation failed:", error);
            return false;
        }
    };
    ```

2. **제출 함수에서 에러 처리**
    ```typescript
    onSubmit: async (values) => {
        try {
            await api.submitForm(values);
        } catch (error) {
            console.error("Submit failed:", error);
            throw error; // 에러를 다시 던져서 isSubmitting 상태 관리
        }
    };
    ```

---

## Migration Guide

### From React Hook Form

```typescript
// React Hook Form
const { register, handleSubmit, watch } = useForm();
const name = watch("name");

// Forma
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
```

### From Formik

```typescript
// Formik
const formik = useFormik({
    initialValues: { name: "" },
    onSubmit: handleSubmit,
});
const name = formik.values.name;

// Forma
const form = useForm({
    initialValues: { name: "" },
    onSubmit: handleSubmit,
});
const name = form.useFormValue("name");
```

---

이 API 레퍼런스는 Forma 라이브러리의 모든 공개 API를 다루고 있습니다. 추가 질문이나 예제가 필요하시면 언제든 문의해 주세요.
