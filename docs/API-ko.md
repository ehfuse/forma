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
    -   [useModal](#usemodal)
-   [Methods](#methods)
    -   [setBatch](#setbatch)
-   [Components](#components)
    -   [GlobalFormaProvider](#globalformaprovider)
-   [Core Classes](#core-classes)
    -   [FieldStore](#fieldstore)
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
    /** 여러 필드를 효율적으로 일괄 업데이트 */
    setBatch: (updates: Record<string, any>) => void;
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

#### 기본 사용법

```typescript
import { useFormaState } from "forma";

const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light", notifications: true },
});

// 개별 필드 구독
const userName = state.useValue("user.name");
const theme = state.useValue("settings.theme");
```

📚 **[상세한 사용 예제 →](./examples-ko.md#useformastate-예제)**

#### Functions

| Function        | Signature                                         | Description                                                                  |
| --------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `useValue`      | `<K extends string>(path: K) => any`              | dot notation으로 특정 필드 값 구독. 필드가 변경될 때만 리렌더링.             |
| `setValue`      | `<K extends string>(path: K, value: any) => void` | dot notation으로 특정 필드 값 설정. 구독자에게 리렌더링 트리거.              |
| `getValues`     | `() => T`                                         | 모든 현재 값을 객체로 가져옴 (반응형 아님).                                  |
| `setValues`     | `(values: Partial<T>) => void`                    | 여러 값을 한 번에 설정. 영향을 받는 모든 구독자에게 리렌더링 트리거.         |
| `setBatch`      | `(updates: Record<string, any>) => void`          | 여러 필드를 효율적으로 일괄 업데이트. 리렌더링 최소화.                       |
| `reset`         | `() => void`                                      | 모든 필드를 초기값으로 재설정.                                               |
| `refreshFields` | `(prefix: string) => void`                        | 특정 prefix를 가진 모든 필드 구독자를 강제로 새로고침. 대량 업데이트에 유용. |
| `handleChange`  | `(event: React.ChangeEvent<...>) => void`         | 표준 입력 변경 이벤트 처리. 해당 필드를 자동으로 업데이트.                   |
| `hasField`      | `(path: string) => boolean`                       | 상태에 필드가 존재하는지 확인.                                               |
| `removeField`   | `(path: string) => void`                          | 상태에서 필드 제거.                                                          |
| `getValue`      | `(path: string) => any`                           | 단일 필드 값 가져옴 (반응형 아님).                                           |
| `subscribe`     | `(callback: (values: T) => void) => () => void`   | 모든 상태 변경에 구독. 구독 해제 함수 반환.                                  |
| `_store`        | `FieldStore<T>`                                   | 고급 사용을 위한 내부 스토어 직접 접근.                                      |

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
```

**주요 특징:**

-   ✅ **스마트 알림**: 배열 길이가 실제로 변경될 때만 알림
-   ✅ **성능 최적화**: 배열 내용 변경 시 불필요한 리렌더링 방지
-   ✅ **자동 감지**: 배열 변경 시 `.length` 구독자에게 자동 알림

� **[배열 길이 구독 상세 가이드 →](./performance-warnings-ko.md#배열-길이-구독-array-length-subscription)**

#### 🔄 **필드 새로고침 (Field Refresh)**

`refreshFields` 메서드를 사용하여 특정 prefix를 가진 모든 필드 구독자들을 강제로 새로고침할 수 있습니다. 이는 **값이 동일하더라도 UI를 강제로 새로고침**해야 하는 특수한 경우에 사용합니다.

```typescript
const state = useFormaState({
    user: { name: "김철수", email: "kim@example.com" },
    address: { city: "서울", street: "강남대로" },
});

// "user"로 시작하는 모든 필드 새로고침
state.refreshFields("user");
```

**💡 사용 용도:**

-   **서버 데이터 동기화**: 서버에서 받은 데이터가 현재 값과 동일하더라도 UI 새로고침
-   **강제 재검증**: 값은 같지만 유효성 검사나 포맷팅을 다시 실행
-   **외부 상태 동기화**: 외부 라이브러리나 시스템과의 동기화

**⚠️ 주의사항:**

-   `refreshFields`는 성능 최적화 도구가 아닙니다
-   개별 필드 구독자들은 여전히 각각 리렌더링됩니다
-   대량 데이터 업데이트 시에는 **배열 전체 교체**가 가장 효율적입니다

📚 **[필드 새로고침 활용 예제 →](./examples-ko.md#필드-새로고침-활용)**  
🔗 **[대량 데이터 최적화 가이드 →](./performance-warnings-ko.md#-대량-데이터-배치-처리-최적화)**

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
    /** 폼 제출 핸들러 - false 반환 시 제출 실패로 처리 */
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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

#### 기본 사용법

```typescript
const form = useForm({
    initialValues: { name: "", email: "", age: 0 },
    onSubmit: async (values) => {
        // ✅ 새로운 기능: boolean 반환으로 제출 성공/실패 제어
        const success = await api.submitUser(values);
        if (!success) {
            return false; // 제출 실패 시 false 반환
        }
        // return undefined 또는 true로 성공 표시
    },
    onValidate: async (values) => {
        return values.email.includes("@");
    },
});

// 개별 필드 구독 (성능 최적화)
const name = form.useFormValue("name");
const email = form.useFormValue("email");

// submit 함수는 여전히 boolean을 반환
const handleSubmit = async () => {
    const success = await form.submit();
    if (success) {
        console.log("제출 성공!");
    } else {
        console.log("제출 실패!");
    }
};
```

**💡 onSubmit 반환값 처리:**

-   `true` 또는 `undefined`: 제출 성공
-   `false`: 제출 실패 (더 이상 예외 던질 필요 없음)
-   예외 발생 시: 자동으로 제출 실패로 처리

📚 **[상세한 폼 사용 예제 →](./examples-ko.md#useform-예제)**

#### Functions

| Function                 | Signature                                        | Description                                   |
| ------------------------ | ------------------------------------------------ | --------------------------------------------- |
| `isSubmitting`           | `boolean`                                        | 폼이 현재 제출 중인지 여부.                   |
| `isValidating`           | `boolean`                                        | 폼이 현재 검증 중인지 여부.                   |
| `isModified`             | `boolean`                                        | 폼이 초기값에서 수정되었는지 여부.            |
| `useFormValue`           | `(fieldName: string) => any`                     | 특정 폼 필드 값 구독 (성능을 위해 권장).      |
| `getFormValue`           | `(fieldName: string) => any`                     | 구독 없이 특정 폼 필드 값 가져옴.             |
| `getFormValues`          | `() => T`                                        | 모든 현재 폼 값 가져옴.                       |
| `setFormValue`           | `(name: string, value: any) => void`             | 특정 폼 필드 값 설정.                         |
| `setFormValues`          | `(values: Partial<T>) => void`                   | 여러 폼 값 한 번에 설정.                      |
| `setInitialFormValues`   | `(values: T) => void`                            | 초기 폼 값 업데이트.                          |
| `handleFormChange`       | `(e: FormChangeEvent) => void`                   | 폼 입력 변경 이벤트 처리.                     |
| `handleDatePickerChange` | `(fieldName: string) => DatePickerChangeHandler` | 특정 필드용 date picker 변경 핸들러 생성.     |
| `submit`                 | `(e?: React.FormEvent) => Promise<boolean>`      | 폼 제출, 검증 결과 반환.                      |
| `resetForm`              | `() => void`                                     | 폼을 초기값으로 재설정.                       |
| `validateForm`           | `() => Promise<boolean>`                         | 폼 검증, 검증 결과 반환.                      |
| `values`                 | `T`                                              | 모든 폼 값 (전체 리렌더링 발생하므로 비권장). |

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
    /** 폼 제출 핸들러 - false 반환 시 제출 실패로 처리 */
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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

#### Functions

`useGlobalForm`은 `useForm`을 확장하며 다음 함수들을 추가합니다:

| Function | Signature       | Description                       |
| -------- | --------------- | --------------------------------- |
| `formId` | `string`        | 글로벌 폼의 고유 식별자.          |
| `_store` | `FieldStore<T>` | 글로벌 스토어 인스턴스 직접 접근. |

`useForm`의 모든 함수들이 사용 가능합니다.

#### Examples

##### 기본 사용법

```typescript
// 글로벌 폼 생성
const form = useGlobalForm({
    formId: "user-form",
    initialValues: { name: "", email: "" },
    onSubmit: async (values) => {
        await api.submitUser(values);
    },
});

// 다른 컴포넌트에서 같은 폼 상태 공유
const sharedForm = useGlobalForm({
    formId: "user-form", // 같은 ID로 상태 공유
});
```

##### 다단계 폼

```typescript
// Step 1 컴포넌트
function Step1() {
    const form = useGlobalForm({
        formId: "wizard-form",
        initialValues: {
            personal: { name: "", email: "" },
            address: { street: "", city: "" },
        },
    });

    return (
        <div>
            <input
                name="personal.name"
                value={form.useFormValue("personal.name")}
                onChange={form.handleFormChange}
            />
            <input
                name="personal.email"
                value={form.useFormValue("personal.email")}
                onChange={form.handleFormChange}
            />
        </div>
    );
}

// Step 2 컴포넌트
function Step2() {
    const form = useGlobalForm({
        formId: "wizard-form", // 같은 formId로 상태 공유
    });

    return (
        <div>
            <input
                name="address.street"
                value={form.useFormValue("address.street")}
                onChange={form.handleFormChange}
            />
            <input
                name="address.city"
                value={form.useFormValue("address.city")}
                onChange={form.handleFormChange}
            />
            <button onClick={form.submit}>완료</button>
        </div>
    );
}
```

📚 **[글로벌 폼 상세 예제 →](./examples-ko.md#useglobalform-예제)**`

#### 🔄 **자동 메모리 정리 (autoCleanup)**

`useGlobalForm`도 **참조 카운팅 기반 자동 정리**를 지원합니다:

```typescript
const form = useGlobalForm({
    formId: "wizard-form",
    autoCleanup: true, // 기본값 - 자동 정리
});

// autoCleanup: false - 수동 관리
const persistentForm = useGlobalForm({
    formId: "persistent-form",
    autoCleanup: false,
});
```

**자동 정리 동작:**

-   마지막 사용자가 언마운트되면 자동으로 폼 정리
-   `autoCleanup: false`: 수동으로 `useUnregisterGlobalForm` 필요

📚 **[자동 메모리 정리 상세 예제 →](./examples-ko.md#자동-메모리-정리-예제)**

#### 권장사항

✅ **권장사항:**

-   대부분의 경우 `autoCleanup: true` (기본값) 사용 권장
-   수동 정리는 전체 폼 완료 후나 사용자 로그아웃 시에만 사용
-   공유 폼의 경우 자동 정리에 의존하여 안전성 확보

⚠️ **주의:** 수동 unregister 시 해당 `formId`를 사용하는 모든 컴포넌트에 즉시 영향

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

#### Functions

`useGlobalFormaState`는 `useFormaState`와 동일한 `UseFormaStateReturn<T>` 인터페이스를 반환합니다:

| Function        | Signature                                         | Description                                                                  |
| --------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `useValue`      | `<K extends string>(path: K) => any`              | dot notation으로 특정 필드 값 구독. 필드가 변경될 때만 리렌더링.             |
| `setValue`      | `<K extends string>(path: K, value: any) => void` | dot notation으로 특정 필드 값 설정. 구독자에게 리렌더링 트리거.              |
| `getValues`     | `() => T`                                         | 모든 현재 값을 객체로 가져옴 (반응형 아님).                                  |
| `setValues`     | `(values: Partial<T>) => void`                    | 여러 값을 한 번에 설정. 영향을 받는 모든 구독자에게 리렌더링 트리거.         |
| `setBatch`      | `(updates: Record<string, any>) => void`          | 여러 필드를 효율적으로 일괄 업데이트. 리렌더링 최소화.                       |
| `reset`         | `() => void`                                      | 모든 필드를 초기값으로 재설정.                                               |
| `refreshFields` | `(prefix: string) => void`                        | 특정 prefix를 가진 모든 필드 구독자를 강제로 새로고침. 대량 업데이트에 유용. |
| `handleChange`  | `(event: React.ChangeEvent<...>) => void`         | 표준 입력 변경 이벤트 처리. 해당 필드를 자동으로 업데이트.                   |
| `hasField`      | `(path: string) => boolean`                       | 상태에 필드가 존재하는지 확인.                                               |
| `removeField`   | `(path: string) => void`                          | 상태에서 필드 제거.                                                          |
| `getValue`      | `(path: string) => any`                           | 단일 필드 값 가져옴 (반응형 아님).                                           |
| `subscribe`     | `(callback: (values: T) => void) => () => void`   | 모든 상태 변경에 구독. 구독 해제 함수 반환.                                  |
| `_store`        | `FieldStore<T>`                                   | 고급 사용을 위한 내부 스토어 직접 접근.                                      |

#### 특징

-   **전역 공유**: 같은 `stateId`를 사용하는 모든 컴포넌트가 상태 공유
-   **개별 필드 구독**: 필드별로 독립적인 리렌더링 최적화
-   **자동 생성**: 존재하지 않는 `stateId`의 경우 새로 생성
-   **타입 안전성**: TypeScript를 통한 완전한 타입 추론

#### 기본 사용법

```typescript
// 전역 상태 생성
const state = useGlobalFormaState({
    stateId: "user-data",
    initialValues: {
        user: { name: "", email: "" },
        preferences: { theme: "light" },
    },
});

// 개별 필드 구독
const userName = state.useValue("user.name");
const theme = state.useValue("preferences.theme");

// 다른 컴포넌트에서 같은 상태 공유
const sharedState = useGlobalFormaState({
    stateId: "user-data", // 같은 ID로 상태 공유
});
```

📚 **[글로벌 상태 상세 예제 →](./examples-ko.md#useglobalformastate-예제)**

```typescript
// 기본 장바구니 컴포넌트
function ShoppingCart() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart",
        initialValues: {
            items: [],
            total: 0,
        },
    });

    // ✅ 권장: .length 구독 (배열 길이 변경 시에만 리렌더링)
    const itemCount = cart.useValue("items.length");
    const total = cart.useValue("total");

    return (
        <div>
            <h2>장바구니 ({itemCount})</h2>
            <p>총액: {total}원</p>
        </div>
    );
}

// 상품 추가 컴포넌트
function ProductList() {
    const cart = useGlobalFormaState({
        stateId: "shopping-cart",
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
        <button
            onClick={() => addToCart({ id: 1, name: "상품 1", price: 10000 })}
        >
            상품 추가
        </button>
    );
}
```

**핵심 포인트:**

-   `itemCount = cart.useValue("items.length")`: 배열 길이만 구독
-   `items?.length || 0` 대신 `.length` 구독 사용
-   성능 최적화: 배열 내용 변경 시 불필요한 리렌더링 방지

� **[배열 길이 구독 상세 가이드 →](./performance-warnings-ko.md#배열-길이-구독-array-length-subscription)**
🔗 **[성능 최적화 모범 사례 →](./performance-guide-ko.md#성능-최적화)**

---

### 📖 **useUnregisterGlobalFormaState**

수동으로 글로벌 상태를 정리하는 훅입니다.

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

#### 기본 사용법

```typescript
// 로컬 폼을 글로벌로 등록
const form = useForm({ initialValues: { name: "", email: "" } });
useRegisterGlobalForm("shared-form", form);

// 다른 컴포넌트에서 접근
const sharedForm = useGlobalForm({ formId: "shared-form" });
```

📚 **[등록/해제 훅 상세 예제 →](./examples-ko.md#등록해제-훅-예제)**

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

#### 기본 사용법

```typescript
const { unregisterForm, clearForms } = useUnregisterGlobalForm();

// 특정 폼 제거
const success = unregisterForm("user-form");

// 모든 폼 제거
clearForms();
```

📚 **[등록/해제 훅 상세 예제 →](./examples-ko.md#등록해제-훅-예제)**

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

#### 기본 사용법

```typescript
const { unregisterState, clearStates } = useUnregisterGlobalFormaState();

// 특정 상태 제거
unregisterState("user-data");

// 모든 상태 제거
clearStates();
```

📚 **[등록/해제 훅 상세 예제 →](./examples-ko.md#등록해제-훅-예제)**

---

### useModal

모달 상태 관리 및 뒤로가기 처리를 위한 훅입니다. 모바일 환경에서 모달이 열려있을 때 뒤로가기 버튼을 누르면 페이지가 뒤로 가는 것이 아니라 모달이 닫히도록 처리합니다.

#### Signature

```typescript
function useModal(props?: UseModalProps): UseModalReturn;
```

#### Parameters

```typescript
interface UseModalProps {
    /** 초기 열림 상태 (기본값: false) */
    initialOpen?: boolean;
    /** 모달이 닫힐 때 실행될 콜백 함수 */
    onClose?: () => void;
}
```

#### Returns

```typescript
interface UseModalReturn {
    /** 모달 열림 상태 */
    isOpen: boolean;
    /** 모달 열기 함수 */
    open: () => void;
    /** 모달 닫기 함수 */
    close: () => void;
    /** 모달 토글 함수 */
    toggle: () => void;
    /** 모달 고유 ID */
    modalId: string;
}
```

#### 특징

-   **모바일 친화적**: 뒤로가기 시 모달만 닫히고 페이지는 유지
-   **모달 스택 관리**: 여러 모달이 중첩되어도 올바른 순서로 닫힘
-   **자동 정리**: 컴포넌트 언마운트 시 자동으로 모달 스택에서 제거
-   **고유 ID 생성**: 각 모달에 자동으로 고유 ID 부여

#### 기본 사용법

```typescript
function MyComponent() {
    const modal = useModal({
        onClose: () => console.log("Modal closed"),
    });

    return (
        <>
            <button onClick={modal.open}>모달 열기</button>

            <Dialog open={modal.isOpen} onClose={modal.close}>
                <DialogTitle>제목</DialogTitle>
                <DialogContent>내용</DialogContent>
                <DialogActions>
                    <Button onClick={modal.close}>닫기</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
```

#### 중첩 모달 예제

```typescript
function ParentComponent() {
    const parentModal = useModal();
    const childModal = useModal();

    return (
        <>
            <button onClick={parentModal.open}>부모 모달 열기</button>

            <Dialog open={parentModal.isOpen} onClose={parentModal.close}>
                <DialogTitle>부모 모달</DialogTitle>
                <DialogContent>
                    <button onClick={childModal.open}>자식 모달 열기</button>
                </DialogContent>
            </Dialog>

            <Dialog open={childModal.isOpen} onClose={childModal.close}>
                <DialogTitle>자식 모달</DialogTitle>
                <DialogContent>
                    뒤로가기를 누르면 이 모달만 닫힙니다.
                </DialogContent>
            </Dialog>
        </>
    );
}
```

#### 폼이 있는 모달 예제

```typescript
function FormModal() {
    const [formData, setFormData] = useState({ name: "", email: "" });

    const modal = useModal({
        onClose: () => {
            // 모달 닫힐 때 폼 초기화
            setFormData({ name: "", email: "" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submit:", formData);
        modal.close();
    };

    return (
        <>
            <button onClick={modal.open}>폼 모달 열기</button>

            <Dialog open={modal.isOpen} onClose={modal.close}>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>사용자 정보</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="이름"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                        />
                        <TextField
                            label="이메일"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={modal.close}>취소</Button>
                        <Button type="submit">제출</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}
```

#### 주의사항

-   `GlobalFormaProvider`로 앱을 감싸야 정상 동작합니다.
-   모달을 닫을 때는 반드시 `modal.close()`를 사용하세요 (내부적으로 히스토리 관리).
-   `initialOpen={true}`로 시작하는 경우 주의가 필요합니다 (히스토리 스택 고려).

---

## Methods

### setBatch

여러 필드를 일괄 업데이트하는 편의 함수입니다. 코드 가독성과 데이터 일관성을 향상시킵니다.

#### Signature

```typescript
setBatch(updates: Record<string, any>): void
```

#### Parameters

-   `updates`: 키로 필드 경로, 값으로 새 값을 가진 객체. dot notation 지원.

#### Description

`setBatch`를 사용하면 여러 필드를 한 번의 작업으로 업데이트할 수 있습니다. 개별 setValue 호출 대신 모든 변경사항을 객체로 한 번에 표현할 수 있어 코드 가독성이 향상되고, 모든 변경사항이 동시에 적용되어 데이터 일관성이 보장됩니다.

다음과 같은 경우에 특히 유용합니다:

-   서버 데이터를 폼에 로드할 때
-   여러 관련 필드를 논리적으로 함께 업데이트할 때
-   체크박스/라디오 버튼 일괄 선택/해제

#### Examples

```typescript
const state = useFormaState({
    user: { name: "", email: "", age: 0 },
    settings: { theme: "light", notifications: true },
});

// 여러 필드를 일괄 업데이트
state.setBatch({
    "user.name": "John Doe",
    "user.email": "john@example.com",
    "settings.theme": "dark",
});

// 구독자는 한 번만 리렌더링됨 (세 번이 아님)
```

**성능 이점:**

-   **리렌더링 감소**: N번 대신 1번 리렌더링
-   **더 나은 UX**: 대량 작업 시 더 부드러운 업데이트
-   **메모리 효율성**: 가비지 컬렉션 압력 감소

📚 **[setBatch 상세 예제 →](./examples-ko.md#배치-업데이트-setbatch-활용)**  
🔗 **[대량 데이터 최적화 가이드 →](./performance-warnings-ko.md#-대량-데이터-배치-처리-최적화)**

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

특정 필드의 현재 값을 반환합니다. 중첩 객체에 대한 dot notation을 지원합니다.

**매개변수:**

-   `fieldName`: 필드명 또는 dot notation 경로 (예: `"user.name"`)

**반환:** 필드 값, 또는 필드가 존재하지 않으면 `undefined`.

**예제:**

```typescript
const store = new FieldStore({ user: { name: "John" } });
const name = store.getValue("user.name"); // "John"
```

##### setValue

```typescript
setValue(fieldName: string, value: any): void
```

특정 필드의 값을 설정하고 모든 구독자에게 알립니다. Dot notation을 지원합니다.

**매개변수:**

-   `fieldName`: 필드명 또는 dot notation 경로
-   `value`: 설정할 새 값

**예제:**

```typescript
store.setValue("user.name", "Jane");
store.setValue("settings.theme", "dark");
```

##### getValues

```typescript
getValues(): T
```

모든 필드의 현재 값을 객체로 반환합니다.

**반환:** 완전한 상태 객체

**예제:**

```typescript
const allValues = store.getValues(); // { user: { name: "Jane" }, settings: { theme: "dark" } }
```

##### setValues

```typescript
setValues(values: Partial<T>): void
```

여러 필드의 값을 일괄 설정하고 구독자에게 알립니다.

**매개변수:**

-   `values`: 업데이트할 필드 객체

**예제:**

```typescript
store.setValues({
    "user.name": "Bob",
    "user.email": "bob@example.com",
});
```

##### setBatch

```typescript
setBatch(updates: Record<string, any>): void
```

여러 필드를 효율적으로 일괄 업데이트하여 리렌더링을 최소화합니다.

**매개변수:**

-   `updates`: 키로 필드 경로, 값으로 새 값을 가진 객체

**예제:**

```typescript
store.setBatch({
    "user.name": "Alice",
    "user.age": 30,
    "settings.notifications": true,
});
```

##### subscribe

```typescript
subscribe(fieldName: string, callback: () => void): () => void
```

특정 필드의 변경을 구독합니다. 구독 해제 함수를 반환합니다.

**매개변수:**

-   `fieldName`: 필드명 또는 dot notation 경로
-   `callback`: 변경 시 호출될 콜백 함수

**반환:** 구독 해제 함수

**예제:**

```typescript
const unsubscribe = store.subscribe("user.name", () => {
    console.log("Name changed");
});
// 나중에: unsubscribe();
```

##### subscribeGlobal

```typescript
subscribeGlobal(callback: () => void): () => void
```

모든 필드의 변경을 구독합니다.

##### reset

```typescript
reset(): void
```

모든 필드를 초기값으로 재설정하고 구독자에게 알립니다.

##### isModified

```typescript
isModified(): boolean
```

초기값에서 변경되었는지 확인합니다.

**반환:** 변경되었으면 `true`, 아니면 `false`

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
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
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

```typescript
// ✅ 권장: 개별 필드 구독
const name = form.useFormValue("name");

// ❌ 비권장: 전체 객체 구독
const { name } = form.values;
```

**핵심 원칙:**

-   개별 필드 구독 사용으로 리렌더링 최적화
-   배열 길이 구독 (`todos.length`) 활용
-   대량 데이터는 배치 처리 + `refreshFields` 사용

� **[성능 최적화 가이드 →](./performance-guide-ko.md)**
⚠️ **[성능 최적화 주의사항 →](./performance-warnings-ko.md)**

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
const formik = useFormik({ initialValues: { name: "" } });
const name = formik.values.name;

// Forma
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
```

📚 **[마이그레이션 상세 가이드 →](./migration-ko.md)**

---

이 API 레퍼런스는 Forma 라이브러리의 모든 공개 API를 다루고 있습니다.

## 관련 문서

-   **[API 레퍼런스](./API-ko.md)** - 모든 API 상세 설명
-   **[예제 모음](./examples-ko.md)** - 실용적인 사용 예제
-   **[성능 최적화 가이드](./performance-guide-ko.md)** - 성능 최적화 방법
-   **[성능 최적화 주의사항](./performance-warnings-ko.md)** - 안티패턴과 주의사항
-   **[마이그레이션 가이드](./migration-ko.md)** - 다른 라이브러리에서 이전
-   **[useGlobalForm 가이드](./useGlobalForm-guide-ko.md)** - 글로벌 폼 상태 관리
-   **[글로벌 훅 비교 가이드](./global-hooks-comparison-ko.md)** - 글로벌 훅들의 차이점
-   **[라이브러리 비교 가이드](./library-comparison-ko.md)** - 다른 상태 관리 라이브러리와의 비교

추가 질문이나 예제가 필요하시면 언제든 문의해 주세요.

```

```
