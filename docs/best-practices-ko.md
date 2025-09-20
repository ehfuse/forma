# Forma 성능 최적화 가이드

Forma를 효율적으로 사용하기 위한 핵심 패턴입니다.

> 💡 **더 자세한 성능 최적화 정보**: [성능 최적화 및 주의사항 가이드](./performance-optimization-ko.md)에서 배치 처리, refreshFields 활용법, Hook 사용 주의사항 등을 확인하세요.

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

### 3. 배열 길이 구독으로 성능 최적화

```tsx
// ✅ 배열 길이만 구독하여 성능 최적화
function TodoCounter() {
    const todoCount = state.useValue("todos.length");
    const completedCount = state.useValue("completedTodos.length");

    return (
        <div>
            전체 {todoCount}개 중 {completedCount}개 완료
        </div>
    );
    // 항목이 추가/삭제될 때만 리렌더링됨
    // 배열 내용 변경(예: todo.completed 변경)시에는 리렌더링 안됨
}

// ✅ 스마트 알림 시스템
function ShoppingCart() {
    const itemCount = state.useValue("cart.length");

    const addItem = (item) => {
        const cart = state.getValues().cart;
        state.setValue("cart", [...cart, item]);
        // ✅ 배열 길이가 변경되었으므로 cart.length 구독자에게 알림
    };

    const updateQuantity = (index, quantity) => {
        state.setValue(`cart.${index}.quantity`, quantity);
        // ✅ 배열 길이는 동일하므로 cart.length 구독자에게 알림 안됨
    };

    return <span>장바구니 ({itemCount})</span>;
}
```

### 4. 복잡한 계산 메모이제이션

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

### useForm vs useGlobalForm vs useFormaState

```tsx
// ✅ 단일 컴포넌트 폼 → useForm
function ContactForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
    });
}

// ✅ 다중 컴포넌트/페이지 폼 → useGlobalForm
function MultiStepForm() {
    const form = useGlobalForm({
        formId: "user-registration",
    });
}

// ✅ 일반 상태 관리 (폼 아님) → useFormaState
function UserDashboard() {
    const state = useFormaState({
        user: { name: "김철수", status: "online" },
        theme: "dark",
    });

    const userName = state.useValue("user.name");
    const theme = state.useValue("theme");

    return (
        <div>
            안녕하세요, {userName}님! 테마: {theme}
        </div>
    );
}

// ✅ 복잡한 배열/객체 상태 → useFormaState (개별 구독)
function TodoManager() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "React 공부하기", completed: false },
            { id: 2, text: "Forma 사용해보기", completed: true },
        ],
        filter: "all",
    });

    // ❌ 전체 배열 구독 - 모든 todo 변경 시 리렌더링
    // const todos = state.useValue("todos");

    // ✅ 개별 todo 항목 구독 (성능 최적화)
    const firstTodo = state.useValue("todos.0.text");
    const secondCompleted = state.useValue("todos.1.completed");

    return (
        <div>
            <div>첫 번째: {firstTodo}</div>
            <label>
                <input
                    type="checkbox"
                    checked={secondCompleted}
                    onChange={(e) =>
                        state.setValue("todos.1.completed", e.target.checked)
                    }
                />
                두 번째 할 일 완료
            </label>
        </div>
    );
}
```

### useFormaState 최적화 패턴

```tsx
// ✅ 배열 업데이트 시 불변성 유지
function TodoList() {
    const state = useFormaState({ todos: [] });

    const addTodo = (text: string) => {
        const currentTodos = state.getValues().todos;
        state.setValue("todos", [
            ...currentTodos,
            { id: Date.now(), text, completed: false },
        ]);
    };

    const updateTodo = (id: number, updates: Partial<Todo>) => {
        const currentTodos = state.getValues().todos;
        state.setValue(
            "todos",
            currentTodos.map((todo) =>
                todo.id === id ? { ...todo, ...updates } : todo
            )
        );
    };
}

// ✅ 중첩 객체의 개별 필드 구독
function UserProfile() {
    const state = useFormaState({
        user: { name: "", email: "" },
        preferences: { theme: "light", notifications: true },
    });

    // 각 필드별로 구독 - 최적의 성능
    const userName = state.useValue("user.name");
    const theme = state.useValue("preferences.theme");

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
            />
            <select
                value={theme}
                onChange={(e) =>
                    state.setValue("preferences.theme", e.target.value)
                }
            >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </div>
    );
}

// ✅ 배열의 개별 요소 구독 (성능 최적화)
function OptimizedTodoList() {
    const state = useFormaState({ todos: [] });

    // ❌ 전체 배열 구독 (비효율적)
    // const todos = state.useValue("todos");

    // ✅ 개별 요소의 특정 필드만 구독
    const firstTodoText = state.useValue("todos.0.text");
    const secondTodoCompleted = state.useValue("todos.1.completed");

    return (
        <div>
            <p>첫 번째: {firstTodoText}</p>
            <input
                type="checkbox"
                checked={secondTodoCompleted}
                onChange={(e) =>
                    state.setValue("todos.1.completed", e.target.checked)
                }
            />
        </div>
    );
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

-   `form.values` 직접 접근 (전체 구독)
-   조건부 필드에서 무조건 구독
-   컴포넌트마다 별도 useForm 생성
-   매 렌더링마다 새 객체/배열 생성

## 🔧 디버깅

```tsx
// 개발 환경에서 성능 확인
if (process.env.NODE_ENV === "development") {
    console.log("Form Values:", form.getFormValues());
}
```

## 🆕 새로운 API 메서드 활용

### 동적 필드 관리

```tsx
// ✅ 필드 존재 여부 확인 후 안전하게 접근
function DynamicField({ fieldName }: { fieldName: string }) {
    const state = useFormaState<Record<string, any>>({});

    // 필드 존재 여부 확인
    const hasField = state.hasField(fieldName);

    // 안전한 값 접근 (반응형 아님)
    const value = hasField ? state.getValue(fieldName) : "";

    return hasField ? (
        <input
            value={state.useValue(fieldName)} // 반응형 구독
            onChange={(e) => state.setValue(fieldName, e.target.value)}
        />
    ) : (
        <button onClick={() => state.setValue(fieldName, "")}>
            {fieldName} 필드 추가
        </button>
    );
}
```

### 전역 상태 구독 최적화

```tsx
// ✅ 특정 조건에서만 전역 구독
function GlobalStateWatcher() {
    const state = useFormaState({ data: {} });
    const [isWatching, setIsWatching] = useState(false);

    useEffect(() => {
        if (!isWatching) return;

        const unsubscribe = state.subscribe((values) => {
            console.log("전체 상태 변경:", values);
            // 로그, 분석, 자동 저장 등
        });

        return unsubscribe;
    }, [state, isWatching]);

    return (
        <button onClick={() => setIsWatching(!isWatching)}>
            {isWatching ? "구독 중지" : "구독 시작"}
        </button>
    );
}
```

### 필드 제거 시 정리 작업

```tsx
// ✅ 필드 제거 전 정리 작업
function removeFieldSafely(state: any, fieldPath: string) {
    if (state.hasField(fieldPath)) {
        // 관련 데이터 정리
        const value = state.getValue(fieldPath);
        if (value && typeof value === "object") {
            // 객체나 배열인 경우 관련 리소스 정리
            console.log(`Cleaning up field: ${fieldPath}`, value);
        }

        // 필드 제거
        state.removeField(fieldPath);
    }
}
```

### 성능 모니터링

```tsx
// ✅ 상태 변경 빈도 모니터링
function PerformanceMonitor() {
    const state = useFormaState({ counters: {} });
    const [changeCount, setChangeCount] = useState(0);

    useEffect(() => {
        const unsubscribe = state.subscribe(() => {
            setChangeCount((prev) => prev + 1);
        });

        return unsubscribe;
    }, [state]);

    return (
        <div>
            <p>상태 변경 횟수: {changeCount}</p>
            <button onClick={() => state.reset()}>
                리셋 (변경 횟수도 초기화됨)
            </button>
        </div>
    );
}
```
