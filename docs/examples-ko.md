# Forma 예제 가이드

이 문서는 Forma 라이브러리의 다양한 사용 예제를 제공합니다. 각 API의 실제 활용법을 단계별로 설명합니다.

## 목차

-   [useFormaState 예제](#useformastate-예제)
    -   [기본 사용법](#기본-사용법)
    -   [배열 상태 관리](#배열-상태-관리)
    -   [동적 필드 관리](#동적-필드-관리)
    -   [배열 길이 구독](#배열-길이-구독)
    -   [필드 새로고침 활용](#필드-새로고침-활용)
-   [useForm 예제](#useform-예제)
    -   [기본 폼 관리](#기본-폼-관리)
    -   [중첩 객체 처리](#중첩-객체-처리)
-   [useGlobalForm 예제](#useglobalform-예제)
    -   [완전한 글로벌 폼](#완전한-글로벌-폼)
    -   [다단계 폼](#다단계-폼)
-   [useGlobalFormaState 예제](#useglobalformastate-예제)
    -   [기본 사용법](#글로벌-상태-기본-사용법)
    -   [동적 상태 관리](#동적-상태-관리)
    -   [쇼핑카트 예제](#쇼핑카트-예제)
-   [등록/해제 훅 예제](#등록해제-훅-예제)

---

## useFormaState 예제

### 기본 사용법

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
```

### 배열 상태 관리

```typescript
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
```

### 동적 필드 관리

```typescript
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

### 배열 길이 구독

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

// 사용 예시:
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

### 필드 새로고침 활용

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

---

## useForm 예제

### 기본 폼 관리

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

### 중첩 객체 처리

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

## useGlobalForm 예제

### 완전한 글로벌 폼

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
        },
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
```

### 다단계 폼

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

### 자동 메모리 정리 예제

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

---

## useGlobalFormaState 예제

### 글로벌 상태 기본 사용법

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

### 동적 상태 관리

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

### 쇼핑카트 예제

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

### 자동 메모리 정리 예제

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

---

## 등록/해제 훅 예제

### useRegisterGlobalForm 예제

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

### useRegisterGlobalFormaState 예제

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

### useUnregisterGlobalForm 예제

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

### useUnregisterGlobalFormaState 예제

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

## 성능 최적화 예제

### 개별 필드 구독

```typescript
// ✅ 권장: 필드별 구독
const name = form.useFormValue("name");

// ❌ 비권장: 전체 객체 구독
const { name } = form.values;
```

### 조건부 구독

```typescript
function ConditionalField({ showField }) {
    const value = showField ? form.useFormValue("field") : "";
    return showField ? <TextField value={value} /> : null;
}
```

### 배열 길이 구독 활용

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

---

이 예제 가이드는 Forma 라이브러리의 모든 주요 기능에 대한 실용적인 사용법을 제공합니다.

## 관련 문서

-   **[API Reference](./API-ko.md)** - 상세한 API 문서
-   **[시작하기 가이드](./getting-started-ko.md)** - 기본 사용법
-   **[성능 최적화 가이드](./performance-guide-ko.md)** - 성능 최적화 방법
-   **[성능 최적화 주의사항](./performance-warnings-ko.md)** - 안티패턴과 주의사항
-   **[마이그레이션 가이드](./migration-ko.md)** - 다른 라이브러리에서 이전
-   **[useGlobalForm 가이드](./useGlobalForm-guide-ko.md)** - 글로벌 폼 상태 관리
