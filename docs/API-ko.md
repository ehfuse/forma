# Forma API Reference

이 문서는 Forma 라이브러리의 모든 API에 대한 상세한 레퍼런스를 제공합니다.

## Table of Contents

-   [Hooks](#hooks)
    -   [useFormaState](#useformastate)
    -   [useForm](#useform)
    -   [useGlobalForm](#useglobalform)
    -   [useRegisterGlobalForm](#useregisterglobalform)
    -   [useRegisterGlobalFormaState](#useregisterglobalformastate)
    -   [useUnregisterGlobalForm](#useunregisterglobalform)
    -   [useUnregisterGlobalFormaState](#useunregisterglobalformastate)
-   [Components](#components)
    -   [GlobalFormaProvider](#globalformaprovider)
-   [Core Classes](#core-classes)
    -   [FieldStore](#fieldstore)
-   [Utilities](#utilities)
    -   [getNestedValue](#getnestedvalue)
    -   [setNestedValue](#setnestedvalue)
-   [TypeScript Types](#typescript-types)

---

## Hooks

### useFormaState

배열, 객체 등의 일반적인 상태 관리를 위한 기본 훅입니다. 개별 필드 구독을 통해 성능을 최적화합니다.

#### Signature

```typescript
// 빈 객체로 시작하는 경우를 위한 오버로드
function useFormaState<T extends Record<string, any> = Record<string, any>>(
    initialValues?: T,
    options?: UseFormaStateOptions<T>
): UseFormaStateReturn<T>;

// 명시적 타입을 가진 경우를 위한 오버로드
function useFormaState<T extends Record<string, any>>(
    initialValues: T,
    options?: UseFormaStateOptions<T>
): UseFormaStateReturn<T>;
```

#### Parameters

```typescript
interface UseFormaStateOptions<T> {
    /** 상태 변경 시 선택적 콜백 */
    onChange?: (values: T) => void;
    /** 성능 향상을 위한 깊은 동등성 검사 활성화 */
    deepEquals?: boolean;
    /** 공유 상태를 위한 외부 FieldStore 인스턴스 */
    _externalStore?: FieldStore<T>;
    /** 상태 작업을 위한 에러 핸들러 */
    onError?: (error: Error) => void;
    /** 모든 변경에 대한 유효성 검사 활성화 */
    validateOnChange?: boolean;
    /** 상태 업데이트를 위한 디바운스 지연 시간 (밀리초) */
    debounceMs?: number;
}
```

#### Return Value

```typescript
interface UseFormaStateReturn<T> {
    /** dot notation으로 특정 필드 값 구독 */
    useValue: <K extends string>(path: K) => any;
    /** dot notation으로 특정 필드 값 설정 */
    setValue: <K extends string>(path: K, value: any) => void;
    /** 모든 현재 값 가져오기 (반응형 아님) */
    getValues: () => T;
    /** 모든 값을 한 번에 설정 */
    setValues: (values: Partial<T>) => void;
    /** 초기값으로 재설정 */
    reset: () => void;
    /** 표준 입력 변경 이벤트 처리 */
    handleChange: (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
    /** 필드 존재 여부 확인 */
    hasField: (path: string) => boolean;
    /** 상태에서 필드 제거 */
    removeField: (path: string) => void;
    /** 단일 필드 값 가져오기 (반응형 아님) */
    getValue: (path: string) => any;
    /** 모든 상태 변경에 구독 */
    subscribe: (callback: (values: T) => void) => () => void;
    /** 고급 사용을 위한 내부 스토어 직접 접근 */
    _store: FieldStore<T>;
}
```

#### 선언 방법

```typescript
import { useFormaState } from "forma";

// 1. 기본 사용법 - 초기값과 함께
const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light", notifications: true },
});

// 2. 타입 명시적 지정
interface UserData {
    name: string;
    email: string;
    age?: number;
}

const userState = useFormaState<{ user: UserData }>({
    user: { name: "", email: "" },
});

// 3. 빈 객체로 시작
const dynamicState = useFormaState<Record<string, any>>();

// 4. 옵션과 함께 사용
const stateWithOptions = useFormaState(
    {
        data: {},
    },
    {
        onChange: (values) => console.log("State changed:", values),
        debounceMs: 300,
        validateOnChange: true,
    }
);
```

#### Example

```typescript
import { useFormaState } from "forma";

// 기본 사용법
function MyComponent() {
    const state = useFormaState({
        user: { name: "", email: "" },
        settings: { theme: "light", notifications: true },
    });

    // 개별 필드 구독 (해당 필드가 변경될 때만 리렌더링)
    const userName = state.useValue("user.name");
    const theme = state.useValue("settings.theme");

    // 새로운 API 메서드 사용
    const hasUserEmail = state.hasField("user.email");
    const userEmailValue = state.getValue("user.email"); // 반응형 아님

    // 전역 상태 변경 구독
    React.useEffect(() => {
        const unsubscribe = state.subscribe((values) => {
            console.log("전체 상태가 변경되었습니다:", values);
        });
        return unsubscribe;
    }, [state]);

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
            />
            <button onClick={() => state.setValue("settings.theme", "dark")}>
                다크 테마로 변경
            </button>
            <button onClick={() => state.removeField("user.email")}>
                이메일 필드 제거
            </button>
            <button onClick={() => state.reset()}>초기값으로 리셋</button>
            {hasUserEmail && <p>이메일 필드가 존재합니다</p>}
        </div>
    );
}

// 배열 상태 관리
function TodoList() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Build app", completed: false },
        ],
    });

    // 특정 할 일 항목 구독
    const firstTodo = state.useValue("todos.0.text");

    // 배열 길이만 구독 (항목 추가/삭제 시에만 리렌더링)
    const todoCount = state.useValue("todos.length");

    const addTodo = () => {
        const todos = state.getValues().todos;
        state.setValue("todos", [
            ...todos,
            { id: Date.now(), text: "New todo", completed: false },
        ]);
        // todos 배열이 변경되면 todos.length 구독자에게도 자동으로 알림이 갑니다
    };

    const updateTodo = (index: number, newText: string) => {
        // 배열 내용만 변경 (길이는 동일) - todos.length 구독자에게는 알림이 가지 않음
        state.setValue(`todos.${index}.text`, newText);
    };

    const removeTodo = (index: number) => {
        state.removeField(`todos.${index}`);
    };

    return (
        <div>
            <p>첫 번째 할 일: {firstTodo}</p>
            <p>총 할 일 개수: {todoCount}</p>
            <button onClick={addTodo}>할 일 추가</button>
            <button onClick={() => removeTodo(0)}>첫 번째 할 일 제거</button>
        </div>
    );
}

// 동적 필드 관리
function DynamicForm() {
    const state = useFormaState<Record<string, any>>({});

    const addField = (fieldName: string, defaultValue: any) => {
        state.setValue(fieldName, defaultValue);
    };

    const removeField = (fieldName: string) => {
        if (state.hasField(fieldName)) {
            state.removeField(fieldName);
        }
    };

    return (
        <div>
            <button onClick={() => addField("newField", "")}>
                새 필드 추가
            </button>
            <button onClick={() => removeField("newField")}>필드 제거</button>
            {state.hasField("newField") && (
                <input
                    value={state.useValue("newField")}
                    onChange={(e) => state.setValue("newField", e.target.value)}
                />
            )}
        </div>
    );
}
```

#### 🔢 **배열 길이 구독 (Array Length Subscription)**

`useFormaState`는 배열의 `length` 속성을 지능적으로 구독할 수 있습니다:

```typescript
const state = useFormaState({
    todos: [
        { id: 1, text: "할 일 1" },
        { id: 2, text: "할 일 2" },
    ],
});

// 배열 길이만 구독 - 항목 추가/삭제 시에만 리렌더링
const todoCount = state.useValue("todos.length"); // 2

// 항목 추가 → todos.length 구독자에게 알림
state.setValue("todos", [...state.getValues().todos, newItem]);

// 항목 내용 변경 → todos.length 구독자에게는 알림 없음 (길이가 동일하므로)
state.setValue("todos.0.text", "수정된 할 일");
```

**주요 특징:**

-   ✅ **스마트 알림**: 배열 길이가 실제로 변경될 때만 알림
-   ✅ **성능 최적화**: 배열 내용 변경 시 불필요한 리렌더링 방지
-   ✅ **자동 감지**: 배열 변경 시 `.length` 구독자에게 자동 알림

**사용 예시:**

```typescript
// 카운터 컴포넌트 (길이 변경 시에만 리렌더링)
function TodoCounter() {
    const count = state.useValue("todos.length");
    return <span>할 일: {count}개</span>;
}

// 개별 항목 컴포넌트 (해당 항목 변경 시에만 리렌더링)
function TodoItem({ index }) {
    const text = state.useValue(`todos.${index}.text`);
    return <div>{text}</div>;
}
```

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
        initialValues: { name: "", email: "", phone: "" },
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
        initialValues: { name: "", email: "", phone: "" },
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

-   `formId`: 글로벌 폼의 고유 식별자
-   `form`: 등록할 useForm 인스턴스

#### 특징

-   **글로벌 공유**: 로컬 폼을 글로벌 상태로 변환
-   **자동 동기화**: 등록된 폼은 다른 컴포넌트에서 접근 가능
-   **타입 안전성**: TypeScript를 통한 완전한 타입 추론

#### Example

```typescript
import { useForm, useRegisterGlobalForm } from "@ehfuse/forma";

function MyComponent() {
    // 로컬 폼 생성
    const form = useForm<{ name: string; email: string }>({
        initialValues: { name: "", email: "" },
        onSubmit: async (values) => console.log(values),
    });

    // 글로벌 폼으로 등록
    useRegisterGlobalForm("shared-form", form);

    return (
        <input
            value={form.useFormValue("name")}
            onChange={form.handleFormChange}
            name="name"
        />
    );
}

// 다른 컴포넌트에서 접근
function AnotherComponent() {
    const form = useGlobalForm<{ name: string; email: string }>({
        formId: "shared-form",
    });

    return <p>이름: {form.useFormValue("name")}</p>;
}
```

---

### useRegisterGlobalFormaState

기존에 생성된 useFormaState 인스턴스를 글로벌 상태로 등록하는 훅입니다.

#### Signature

```typescript
function useRegisterGlobalFormaState<T>(
    stateId: string,
    formaState: UseFormaStateReturn<T>
): void;
```

#### Parameters

-   `stateId`: 글로벌 상태의 고유 식별자
-   `formaState`: 등록할 useFormaState 인스턴스

#### 특징

-   **글로벌 공유**: 로컬 FormaState를 글로벌 상태로 변환
-   **개별 필드 구독**: 등록된 상태는 필드별 구독 지원
-   **자동 동기화**: 다른 컴포넌트에서 즉시 접근 가능

#### Example

```typescript
import { useFormaState, useRegisterGlobalFormaState } from "@ehfuse/forma";

function DataProvider() {
    // 로컬 상태 생성
    const state = useFormaState({
        user: { name: "", email: "" },
        settings: { theme: "light" },
    });

    // 글로벌 상태로 등록
    useRegisterGlobalFormaState("app-data", state);

    return <div>데이터 제공자</div>;
}

// 다른 컴포넌트에서 접근
function UserProfile() {
    const state = useGlobalFormaState({
        stateId: "app-data",
    });

    return <p>사용자: {state.useValue("user.name")}</p>;
}
```

---

### useUnregisterGlobalForm

등록된 글로벌 폼을 제거하는 훅입니다.

#### Signature

```typescript
function useUnregisterGlobalForm(): {
    unregisterForm: (formId: string) => boolean;
    clearForms: () => void;
};
```

#### Returns

-   `unregisterForm`: 특정 폼을 제거하는 함수
-   `clearForms`: 모든 글로벌 폼을 제거하는 함수

#### 특징

-   **메모리 관리**: 불필요한 폼 상태 제거
-   **선택적 제거**: 특정 폼만 선택해서 제거 가능
-   **일괄 정리**: 모든 폼을 한번에 정리 가능

#### Example

```typescript
import { useUnregisterGlobalForm } from "@ehfuse/forma";

function CleanupComponent() {
    const { unregisterForm, clearForms } = useUnregisterGlobalForm();

    const handleUnregister = () => {
        const success = unregisterForm("user-form");
        console.log(`폼 제거 ${success ? "성공" : "실패"}`);
    };

    const handleClearAll = () => {
        clearForms();
        console.log("모든 폼이 제거되었습니다");
    };

    return (
        <div>
            <button onClick={handleUnregister}>특정 폼 제거</button>
            <button onClick={handleClearAll}>모든 폼 제거</button>
        </div>
    );
}
```

---

### useUnregisterGlobalFormaState

등록된 글로벌 FormaState를 제거하는 훅입니다.

#### Signature

```typescript
function useUnregisterGlobalFormaState(): {
    unregisterState: (stateId: string) => boolean;
    clearStates: () => void;
};
```

#### Returns

-   `unregisterState`: 특정 상태를 제거하는 함수
-   `clearStates`: 모든 글로벌 상태를 제거하는 함수

#### 특징

-   **메모리 최적화**: 불필요한 상태 정리
-   **유연한 관리**: 개별 또는 일괄 제거 선택 가능
-   **안전한 제거**: 구독자 정리 후 안전하게 제거

#### Example

```typescript
import { useUnregisterGlobalFormaState } from "@ehfuse/forma";

function StateManager() {
    const { unregisterState, clearStates } = useUnregisterGlobalFormaState();

    const handleLogout = () => {
        // 로그아웃 시 사용자 관련 상태만 제거
        unregisterState("user-data");
        unregisterState("user-preferences");
    };

    const handleAppReset = () => {
        // 앱 리셋 시 모든 상태 제거
        clearStates();
    };

    return (
        <div>
            <button onClick={handleLogout}>로그아웃</button>
            <button onClick={handleAppReset}>앱 리셋</button>
        </div>
    );
}
```

---

## Components

### GlobalFormaProvider

글로벌 Forma 상태 관리를 위한 Context Provider입니다.

#### Signature

```typescript
function GlobalFormaProvider({
    children,
}: {
    children: ReactNode;
}): JSX.Element;
```

#### Usage

```typescript
// App.tsx
import { GlobalFormaProvider } from "@/forma";

function App() {
    return (
        <GlobalFormaProvider>
            <Router>
                <Routes>
                    <Route path="/step1" element={<Step1 />} />
                    <Route path="/step2" element={<Step2 />} />
                </Routes>
            </Router>
        </GlobalFormaProvider>
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

-   `obj`: 대상 객체
-   `path`: 접근 경로 (예: "user.profile.name")

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

-   `obj`: 대상 객체
-   `path`: 설정할 경로 (예: "user.profile.name")
-   `value`: 설정할 값

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

### GlobalFormaContextType

글로벌 폼 컨텍스트의 타입입니다.

```typescript
interface GlobalFormaContextType {
    getOrCreateStore: <T extends Record<string, any>>(
        formId: string,
        initialValues: T
    ) => FieldStore<T>;
    registerStore: <T extends Record<string, any>>(
        formId: string,
        store: FieldStore<T>
    ) => void;
    unregisterStore: (formId: string) => boolean;
    clearStores: () => void;
}
```

### UseUnregisterGlobalFormReturn

useUnregisterGlobalForm 훅의 반환 타입입니다.

```typescript
interface UseUnregisterGlobalFormReturn {
    unregisterForm: (formId: string) => boolean;
    clearForms: () => void;
}
```

### UseUnregisterGlobalFormaStateReturn

useUnregisterGlobalFormaState 훅의 반환 타입입니다.

```typescript
interface UseUnregisterGlobalFormaStateReturn {
    unregisterState: (stateId: string) => boolean;
    clearStates: () => void;
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
