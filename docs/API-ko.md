# Forma API Reference

이 문서는 Forma 라이브러리의 모든 API에 대한 상세한 레퍼런스를 제공합니다.

## Table of Contents

-   [Hooks](#hooks)
    -   [useFormaState](#useformastate)
    -   [useForm](#useform)
    -   [useGlobalForm](#useglobalform)
    -   [useGlobalFormaState](#useglobalformastate)
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
    /** 특정 prefix를 가진 모든 필드 구독자들을 새로고침 */
    refreshFields: (prefix: string) => void;
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

// 1. 타입 명시적 지정 (권장)
interface UserData {
    name: string;
    email: string;
    age?: number;
}

const userState = useFormaState<{ user: UserData }>({
    user: { name: "", email: "" },
});

// 2. 기본 사용법 - 초기값과 함께
const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light", notifications: true },
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

#### 🔄 **필드 새로고침 (Field Refresh)**

`refreshFields` 메서드를 사용하여 특정 prefix를 가진 모든 필드 구독자들을 강제로 새로고침할 수 있습니다. 이는 **대량 데이터 일괄 처리 시 성능 최적화**에 매우 유용합니다.

**💡 핵심 개념:**

-   **개별 업데이트**: 각 필드마다 `setValue` → N번의 리렌더링
-   **배치 업데이트**: 전체 데이터 `setValue` + `refreshFields` → 1번의 리렌더링

```typescript
const state = useFormaState({
    user: { name: "김철수", email: "kim@example.com" },
    address: { city: "서울", street: "강남대로" },
    settings: { theme: "light", language: "ko" },
    searchResults: [], // 대량 체크박스 데이터
});

// 각 필드를 개별적으로 구독하는 컴포넌트들
const userName = state.useValue("user.name");
const userEmail = state.useValue("user.email");
const addressCity = state.useValue("address.city");

// 특정 prefix의 모든 필드 새로고침
const refreshUserFields = () => {
    // "user"로 시작하는 모든 필드 (user.name, user.email) 새로고침
    state.refreshFields("user");
};

const refreshAddressFields = () => {
    // "address"로 시작하는 모든 필드 (address.city, address.street) 새로고침
    state.refreshFields("address");
};

// 사용 사례: 외부 데이터 소스에서 업데이트된 후 UI 동기화
const syncWithServer = async () => {
    // 서버에서 최신 데이터 가져오기
    const latestUserData = await fetchUserFromServer();

    // 상태 업데이트 (하지만 이미 같은 값이면 구독자들이 리렌더링되지 않을 수 있음)
    state.setValue("user.name", latestUserData.name);
    state.setValue("user.email", latestUserData.email);

    // 값이 동일하더라도 UI 컴포넌트들을 강제로 새로고침
    state.refreshFields("user");
};
```

#### 🚀 **대량 데이터 배치 처리 최적화**

`refreshFields`는 **100개 이상의 체크박스, 테이블 행 일괄 업데이트** 등에서 극적인 성능 향상을 제공합니다.

**📈 성능 개선 효과:**

-   100개 체크박스 전체 선택: **100배 빨라짐** (100번 → 1번 리렌더링)
-   500개 테이블 행 업데이트: **500배 빨라짐** (500번 → 1번 리렌더링)

**🔗 자세한 사용법과 성능 비교:** [성능 최적화 가이드](./performance-optimization-ko.md#-대량-데이터-배치-처리-최적화)

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
    /** 초기값 */
    initialValues?: Partial<T>;
    /** 컴포넌트 언마운트 시 자동 정리 여부 (기본값: true) */
    autoCleanup?: boolean;
    /** 폼 제출 핸들러 */
    onSubmit?: (values: T) => Promise<void> | void;
    /** 폼 검증 핸들러 - true 반환 시 검증 통과 */
    onValidate?: (values: T) => Promise<boolean> | boolean;
    /** 폼 제출 완료 후 콜백 */
    onComplete?: (values: T) => void;
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

````typescript
#### Examples

##### 완전한 폼 기능을 가진 글로벌 폼

```typescript
// 검증과 제출 로직을 가진 글로벌 폼
function GlobalFormExample() {
    const form = useGlobalForm({
        formId: "user-form",
        initialValues: { name: "", email: "", age: 0 },
        onValidate: async (values) => {
            // 이름 검증
            if (!values.name.trim()) {
                alert("이름을 입력해주세요.");
                return false;
            }

            // 이메일 검증
            if (!values.email.includes("@")) {
                alert("올바른 이메일을 입력해주세요.");
                return false;
            }

            return true;
        },
        onSubmit: async (values) => {
            console.log("글로벌 폼 제출:", values);
            await api.submitUser(values);
        },
        onComplete: (values) => {
            alert("제출이 완료되었습니다!");
        }
    });

    return (
        <form onSubmit={form.submit}>
            <input
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
            <input
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
            />
            <button type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting ? "제출 중..." : "제출"}
            </button>
        </form>
    );
}

// 다른 컴포넌트에서 같은 폼 상태 공유
function FormViewer() {
    const form = useGlobalForm({
        formId: "user-form", // 같은 ID로 상태 공유
    });

    return (
        <div>
            <p>현재 이름: {form.useFormValue("name")}</p>
            <p>현재 이메일: {form.useFormValue("email")}</p>
            <p>수정 여부: {form.isModified ? "수정됨" : "수정 안됨"}</p>
        </div>
    );
}
````

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

// 최종 단계 - 검증과 제출
function FinalStep() {
    const form = useGlobalForm({
        formId: "user-registration", // 같은 폼 상태
        onValidate: async (values) => {
            return values.name && values.email && values.phone;
        },
        onSubmit: async (values) => {
            await api.registerUser(values);
        },
    });

    return (
        <div>
            <p>이름: {form.useFormValue("name")}</p>
            <p>이메일: {form.useFormValue("email")}</p>
            <p>전화번호: {form.useFormValue("phone")}</p>
            <button onClick={form.submit} disabled={form.isSubmitting}>
                등록 완료
            </button>
        </div>
    );
}
```

#### 🔄 **자동 메모리 정리 (autoCleanup)**

`useGlobalForm`도 **참조 카운팅 기반 자동 정리**를 지원합니다:

```typescript
// 다단계 폼에서 자동 정리 활용
function Step1() {
    const form = useGlobalForm({
        formId: "wizard-form",
        autoCleanup: true, // 기본값 - 자동 정리
    });
    return <input name="step1Field" />;
}

function Step2() {
    const form = useGlobalForm({
        formId: "wizard-form", // 같은 폼 공유
        autoCleanup: true,
    });
    return <input name="step2Field" />;
}

// 영구 보존이 필요한 폼
function PersistentForm() {
    const form = useGlobalForm({
        formId: "persistent-form",
        autoCleanup: false, // 수동 관리
    });
    return <input name="importantData" />;
}
```

**자동 정리 동작:**

-   Step1 → Step2 이동: 폼 상태 유지 (Step2가 사용중)
-   Step2 완료 후 컴포넌트 언마운트: 자동으로 폼 정리
-   `autoCleanup: false`: 수동으로 `useUnregisterGlobalForm` 필요

#### 주의사항 및 권장사항

⚠️ **수동 unregister 사용 시 주의:**

-   `useUnregisterGlobalForm`의 `unregisterForm()` 호출 시 해당 `formId`를 사용하는 모든 컴포넌트에 즉시 영향
-   다단계 폼에서 중간 단계에서 수동 정리 시 다른 단계의 데이터 손실 가능

✅ **권장사항:**

-   대부분의 경우 `autoCleanup: true` (기본값) 사용 권장
-   수동 정리는 전체 폼 완료 후나 사용자 취소 시에만 사용
-   공유 폼의 경우 자동 정리에 의존하여 안전성 확보

---

### useGlobalFormaState

전역으로 공유되는 FormaState를 관리하는 훅입니다. 여러 컴포넌트 간에 상태를 공유하면서도 개별 필드별 구독을 지원합니다.

#### Signature

```typescript
function useGlobalFormaState<
    T extends Record<string, any> = Record<string, any>
>(props: UseGlobalFormaStateProps<T>): UseFormaStateReturn<T>;
```

#### Parameters

```typescript
interface UseGlobalFormaStateProps<T> {
    /** 전역에서 상태를 식별하는 고유 ID */
    stateId: string;
    /** 초기값 (최초 생성 시에만 사용) */
    initialValues?: T;
    /** 컴포넌트 언마운트 시 자동 정리 여부 (기본값: true) */
    autoCleanup?: boolean;
    /** 상태 변경 시 선택적 콜백 */
    onChange?: (values: T) => void;
    /** 성능 향상을 위한 깊은 동등성 검사 활성화 */
    deepEquals?: boolean;
    /** 상태 작업을 위한 에러 핸들러 */
    onError?: (error: Error) => void;
    /** 모든 변경에 대한 유효성 검사 활성화 */
    validateOnChange?: boolean;
}
```

#### Return Value

`useFormaState`와 동일한 `UseFormaStateReturn<T>` 인터페이스를 반환합니다.

#### 특징

-   **전역 공유**: 같은 `stateId`를 사용하는 모든 컴포넌트가 상태 공유
-   **개별 필드 구독**: 필드별로 독립적인 리렌더링 최적화
-   **자동 생성**: 존재하지 않는 `stateId`의 경우 새로 생성
-   **타입 안전성**: TypeScript를 통한 완전한 타입 추론

#### Examples

##### 기본 사용법

```typescript
import { useGlobalFormaState, GlobalFormaProvider } from "@ehfuse/forma";

// App.tsx
function App() {
    return (
        <GlobalFormaProvider>
            <UserProfile />
            <UserSettings />
        </GlobalFormaProvider>
    );
}

// 사용자 프로필 컴포넌트
function UserProfile() {
    const state = useGlobalFormaState({
        stateId: "user-data",
        initialValues: {
            user: { name: "", email: "" },
            preferences: { theme: "light", language: "ko" },
        },
    });

    const userName = state.useValue("user.name");
    const userEmail = state.useValue("user.email");

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
                placeholder="이름"
            />
            <input
                value={userEmail}
                onChange={(e) => state.setValue("user.email", e.target.value)}
                placeholder="이메일"
            />
        </div>
    );
}

// 사용자 설정 컴포넌트 (같은 상태 공유)
function UserSettings() {
    const state = useGlobalFormaState({
        stateId: "user-data", // 같은 ID로 상태 공유
        initialValues: {}, // 이미 생성된 상태이므로 무시됨
    });

    const theme = state.useValue("preferences.theme");
    const language = state.useValue("preferences.language");
    const userName = state.useValue("user.name"); // 다른 컴포넌트에서 입력한 값

    return (
        <div>
            <p>사용자: {userName}</p>
            <select
                value={theme}
                onChange={(e) =>
                    state.setValue("preferences.theme", e.target.value)
                }
            >
                <option value="light">라이트</option>
                <option value="dark">다크</option>
            </select>
        </div>
    );
}
```

##### 동적 상태 관리

```typescript
function DynamicStateManager() {
    const [stateId, setStateId] = useState("session-1");

    const state = useGlobalFormaState({
        stateId,
        initialValues: { data: {}, metadata: { created: Date.now() } },
    });

    const switchSession = (newId: string) => {
        setStateId(newId); // 다른 전역 상태로 전환
    };

    return (
        <div>
            <button onClick={() => switchSession("session-1")}>세션 1</button>
            <button onClick={() => switchSession("session-2")}>세션 2</button>
            <div>현재 세션: {stateId}</div>
            {/* 현재 선택된 세션의 상태가 표시됨 */}
        </div>
    );
}
```

##### 다중 컴포넌트 동기화

```typescript
// 쇼핑카트 상태 관리
function ShoppingCart() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart",
        initialValues: {
            items: [],
            total: 0,
            discount: 0,
        },
    });

    const items = cart.useValue("items");
    const total = cart.useValue("total");

    return (
        <div>
            <h2>장바구니 ({items?.length || 0})</h2>
            <p>총액: {total}원</p>
        </div>
    );
}

// 상품 목록 컴포넌트
function ProductList() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart", // 같은 장바구니 상태 공유
    });

    const addToCart = (product) => {
        const currentItems = cart.getValues().items || [];
        cart.setValue("items", [...currentItems, product]);

        // 총액 업데이트
        const newTotal =
            currentItems.reduce((sum, item) => sum + item.price, 0) +
            product.price;
        cart.setValue("total", newTotal);
    };

    return (
        <div>
            <button
                onClick={() =>
                    addToCart({ id: 1, name: "상품 1", price: 10000 })
                }
            >
                장바구니에 추가
            </button>
        </div>
    );
}

// 결제 컴포넌트
function Checkout() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart", // 같은 장바구니 상태 공유
    });

    const total = cart.useValue("total");
    const items = cart.useValue("items");

    const handleCheckout = () => {
        console.log("결제할 항목:", items);
        console.log("총액:", total);

        // 결제 후 장바구니 초기화
        cart.setValues({ items: [], total: 0, discount: 0 });
    };

    return (
        <div>
            <h3>결제</h3>
            <p>결제 금액: {total}원</p>
            <button onClick={handleCheckout}>결제하기</button>
        </div>
    );
}
```

#### 🔄 **자동 메모리 정리 (autoCleanup)**

`useGlobalFormaState`는 **참조 카운팅 기반 자동 정리** 기능을 제공합니다:

```typescript
// 기본적으로 autoCleanup이 활성화됨
const state = useGlobalFormaState({
    stateId: "shared-data",
    autoCleanup: true, // 기본값
});

// 자동 정리 비활성화
const persistentState = useGlobalFormaState({
    stateId: "persistent-data",
    autoCleanup: false, // 수동 관리
});
```

**동작 방식:**

```typescript
// Component A 마운트 → 참조 카운트: 1
function ComponentA() {
    const state = useGlobalFormaState({
        stateId: "shared",
        autoCleanup: true,
    });
    return <div>{state.useValue("data")}</div>;
}

// Component B 마운트 → 참조 카운트: 2
function ComponentB() {
    const state = useGlobalFormaState({
        stateId: "shared", // 같은 ID
        autoCleanup: true,
    });
    return <div>{state.useValue("data")}</div>;
}

// Component A 언마운트 → 참조 카운트: 1 (상태 유지)
// Component B 언마운트 → 참조 카운트: 0 → 🗑️ 자동 정리!
```

**장점:**

-   ✅ **안전한 공유**: 다른 컴포넌트가 사용중인 상태는 보호
-   ✅ **자동 정리**: 마지막 사용자가 떠나면 메모리 자동 해제
-   ✅ **메모리 최적화**: 불필요한 상태 누적 방지

#### 주의사항

1. **GlobalFormaProvider 필수**: 반드시 `GlobalFormaProvider`로 래핑된 컴포넌트 트리 내에서 사용해야 합니다.

2. **초기값 정책**: 같은 `stateId`를 가진 첫 번째 호출에서만 `initialValues`가 적용됩니다.

3. **메모리 관리**:

    - `autoCleanup: true` (기본값): 자동으로 메모리 정리
    - `autoCleanup: false`: 수동으로 `useUnregisterGlobalFormaState` 사용 필요

4. **수동 unregister 주의사항**:

    ```typescript
    // 🚨 주의: 수동 unregister는 즉시 모든 참조자에게 영향
    function ComponentA() {
        const { unregisterState } = useUnregisterGlobalFormaState();
        const state = useGlobalFormaState({ stateId: "shared" });

        const handleCleanup = () => {
            // 이 호출은 ComponentB에도 즉시 영향을 줌!
            unregisterState("shared");
        };
    }

    function ComponentB() {
        const state = useGlobalFormaState({ stateId: "shared" });
        // ComponentA에서 수동 제거하면 여기서 에러 가능성
    }
    ```

#### 권장사항

1. **기본 설정 사용**: 대부분의 경우 `autoCleanup: true` (기본값) 사용을 권장합니다.

2. **수동 정리 사용 시점**:

    - 애플리케이션 전역 리셋 시
    - 사용자 로그아웃 시
    - 메모리 최적화가 중요한 특수 상황

3. **공유 상태 관리**:

    - 여러 컴포넌트가 사용하는 상태는 `autoCleanup`에 의존
    - 예측 가능한 생명주기를 위해 수동 정리 최소화

4. **디버깅 팁**:
    ```typescript
    // 개발 환경에서 상태 추적
    const state = useGlobalFormaState({
        stateId: "debug-state",
        onChange: (values) => {
            console.log("State changed:", values);
        },
    });
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

중첩 객체에서 값을 가져오는 유틸리티 함수입니다. v1.4.9부터 `.length` 속성에 대한 특별한 처리를 제공합니다.

#### Signature

```typescript
function getNestedValue(obj: any, path: string): any;
```

#### Parameters

-   `obj`: 대상 객체
-   `path`: 접근 경로 (예: "user.profile.name")

#### 특별한 기능

-   **`.length` 속성 최적화**: 배열이 `undefined`인 경우 `.length`는 `0`을 반환합니다. 구독은 계속 유지됩니다.

#### 주의사항

-   `.length` 구독 시 `|| 0`과 같은 fallback 코드를 사용하면 안됩니다. 이미 내부적으로 처리되어 있습니다.

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

// .length 특별 처리
const data = { items: undefined };
const length = getNestedValue(data, "items.length"); // 0 (undefined 대신)

const dataWithArray = { items: [1, 2, 3] };
const actualLength = getNestedValue(dataWithArray, "items.length"); // 3
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
    initialValues?: Partial<T>;
    autoCleanup?: boolean;
    onSubmit?: (values: T) => Promise<void> | void;
    onValidate?: (values: T) => Promise<boolean> | boolean;
    onComplete?: (values: T) => void;
}
```

### UseGlobalFormaStateProps

useGlobalFormaState 훅의 매개변수 타입입니다.

```typescript
interface UseGlobalFormaStateProps<T extends Record<string, any>> {
    stateId: string;
    initialValues?: T;
    autoCleanup?: boolean;
    onChange?: (values: T) => void;
    deepEquals?: boolean;
    onError?: (error: Error) => void;
    validateOnChange?: boolean;
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

3. **대량 데이터 배치 처리**

    ```typescript
    // ✅ 권장: 배치 처리 + refreshFields (상세 내용은 성능 가이드 참조)
    state.setValue("items", updatedItems);
    state.refreshFields("items"); // 1번만 리렌더링

    // 🔗 자세한 내용: 성능 최적화 가이드 참조
    ```

4. **배열 길이 구독 활용**

    ```typescript
    // ✅ 카운터는 길이만 구독
    const TodoCounter = () => {
        const count = state.useValue("todos.length");
        return <span>{count}개</span>;
    };

    // ✅ 개별 항목은 해당 인덱스만 구독
    const TodoItem = ({ index }) => {
        const todo = state.useValue(`todos.${index}`);
        return <div>{todo.text}</div>;
    };
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
