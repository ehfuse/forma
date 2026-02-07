# Forma 예제 가이드

이 문서는 Forma 라이브러리의 다양한 사용 예제를 제공합니다. 각 API의 실제 활용법을 단계별로 설명합니다.

## 목차

- [useFormaState 예제](#useformastate-예제)
    - [기본 사용법](#기본-사용법)
    - [배열 상태 관리](#배열-상태-관리)
    - [동적 필드 관리](#동적-필드-관리)
    - [배열 길이 구독](#배열-길이-구독)
    - [전체 상태 구독 활용](#전체-상태-구독-활용)
    - [필드 새로고침 활용](#필드-새로고침-활용)
    - [배치 업데이트 (setBatch) 활용](#배치-업데이트-setbatch-활용)
    - [Actions 활용](#useformastate-actions-활용)
- [useForm 예제](#useform-예제)
    - [기본 폼 관리](#기본-폼-관리)
    - [중첩 객체 처리](#중첩-객체-처리)
    - [Actions 활용](#useform-actions-활용)
- [useGlobalForm 예제](#useglobalform-예제)
    - [완전한 글로벌 폼](#완전한-글로벌-폼)
    - [다단계 폼](#다단계-폼)
- [useGlobalFormaState 예제](#useglobalformastate-예제)
    - [기본 사용법](#글로벌-상태-기본-사용법)
    - [동적 상태 관리](#동적-상태-관리)
    - [쇼핑카트 예제](#쇼핑카트-예제)
- [useModal 예제](#usemodal-예제)
    - [기본 모달 사용](#기본-모달-사용)
    - [중첩 모달 관리](#중첩-모달-관리)
    - [펼이 포함된 모달](#폼이-포함된-모달)
- [useBreakpoint 예제](#usebreakpoint-예제)
    - [기본 사용법](#반응형-기본-사용법)
    - [모바일/데스크톱 분기](#모바일데스크톱-분기)
    - [동적 레이아웃](#동적-레이아웃)
- [등록/해제 훅 예제](#등록해제-훅-예제)

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

### 배치 업데이트 (setBatch) 활용

`setBatch` 메서드는 여러 필드를 한 번에 효율적으로 업데이트할 수 있는 기능입니다. 특히 대량의 필드를 동시에 변경할 때 성능상 큰 이점을 제공합니다.

```typescript
const state = useFormaState({
    user: { name: "", email: "", age: 0 },
    settings: { theme: "light", language: "ko", notifications: true },
    preferences: { privacy: "public", newsletter: false },
});

// ❌ 개별 업데이트 (여러 번 리렌더링)
const updateProfileIndividually = () => {
    state.setValue("user.name", "김철수");
    state.setValue("user.email", "kim@example.com");
    state.setValue("user.age", 30);
    state.setValue("settings.theme", "dark");
    state.setValue("settings.language", "en");
    // → 5번 리렌더링 발생
};

// ✅ 배치 업데이트 (한 번만 리렌더링)
const updateProfileWithBatch = () => {
    state.setBatch({
        "user.name": "김철수",
        "user.email": "kim@example.com",
        "user.age": 30,
        "settings.theme": "dark",
        "settings.language": "en",
    });
    // → 1번만 리렌더링 발생
};

// 🔥 실전 활용 예시: 폼 데이터 일괄 업데이트
const loadUserDataFromServer = async () => {
    const userData = await fetchUserFromServer();

    // 서버에서 받은 데이터를 한 번에 업데이트
    state.setBatch({
        "user.name": userData.name,
        "user.email": userData.email,
        "user.age": userData.age,
        "settings.theme": userData.preferences.theme,
        "settings.language": userData.preferences.language,
        "settings.notifications": userData.preferences.notifications,
        "preferences.privacy": userData.privacy.level,
        "preferences.newsletter": userData.marketing.newsletter,
    });
};

// 🎯 체크박스 일괄 선택/해제 예시
const checkboxData = useFormaState({
    items: Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `아이템 ${i + 1}`,
        checked: false,
    })),
});

// ❌ 개별 선택 (100번 리렌더링)
const selectAllIndividually = () => {
    checkboxData.getValues().items.forEach((_, index) => {
        checkboxData.setValue(`items.${index}.checked`, true);
    });
    // → 100번 리렌더링
};

// ✅ 배치 선택 (1번만 리렌더링)
const selectAllWithBatch = () => {
    const updates: Record<string, boolean> = {};
    checkboxData.getValues().items.forEach((_, index) => {
        updates[`items.${index}.checked`] = true;
    });
    checkboxData.setBatch(updates);
    // → 1번만 리렌더링
};

// 💡 조건부 배치 업데이트
const updateSelectedItems = (selectedIds: number[], newStatus: string) => {
    const updates: Record<string, any> = {};

    checkboxData.getValues().items.forEach((item, index) => {
        if (selectedIds.includes(item.id)) {
            updates[`items.${index}.status`] = newStatus;
            updates[`items.${index}.lastModified`] = Date.now();
        }
    });

    // 선택된 아이템들만 일괄 업데이트
    if (Object.keys(updates).length > 0) {
        checkboxData.setBatch(updates);
    }
};
```

**setBatch 사용 시기:**

- ✅ 10개 이상의 필드를 동시에 업데이트할 때
- ✅ 서버 데이터를 폼에 로드할 때
- ✅ 체크박스/라디오 버튼 일괄 선택/해제
- ✅ 설정 화면에서 여러 옵션 동시 변경
- ✅ 테이블의 여러 행 데이터 업데이트

**주요 장점:**

- 📝 **코드 가독성**: 여러 필드 변경을 한 번에 표현
- 🔄 **데이터 일관성**: 모든 변경사항이 동시에 반영
- ⏱️ **편의성**: 개별 setValue 대신 객체로 한 번에 처리

### 전체 상태 구독 활용

`useValue("*")` 패턴을 사용하여 전체 상태를 한 번에 구독할 수 있습니다. 이는 여러 필드를 개별 구독하는 대신 **성능 최적화**를 위해 사용합니다.

```typescript
import { useFormaState } from "forma";

// 다이얼로그 상태 관리 예제
function DialogComponent({ stateId }: { stateId: string }) {
    const dialogState = useGlobalFormaState({
        stateId: `${stateId}_dialog`,
        initialValues: {
            tabValue: 0,
            activeTabIndex: 0,
            scrollToSectionIndex: 0,
            isScrolling: false,
            autoTabChange: true,
            autoScroll: false,
            message: "Hello World",
        },
    });

    // 🌟 전체 상태를 "*" 패턴으로 구독 - 1회 리렌더링만!
    const allValues = dialogState.useValue("*");

    // 여러 필드를 한 번에 업데이트
    const handleTabChange = (newTabIndex: number) => {
        dialogState.setValues({
            tabValue: newTabIndex,
            activeTabIndex: newTabIndex,
            scrollToSectionIndex: newTabIndex,
            isScrolling: true,
            autoTabChange: false,
            autoScroll: true,
        }); // 6개 필드 변경이지만 1회만 리렌더링!
    };

    return (
        <div>
            <h3>다이얼로그 상태</h3>

            {/* 전체 상태 표시 */}
            <div>
                <strong>현재 탭:</strong> {allValues?.tabValue}
                <br />
                <strong>활성 인덱스:</strong> {allValues?.activeTabIndex}
                <br />
                <strong>스크롤 중:</strong>{" "}
                {allValues?.isScrolling ? "예" : "아니오"}
                <br />
                <strong>자동 탭 변경:</strong>{" "}
                {allValues?.autoTabChange ? "활성화" : "비활성화"}
                <br />
                <strong>메시지:</strong> {allValues?.message}
            </div>

            {/* 탭 버튼들 */}
            <div>
                {[0, 1, 2, 3].map((index) => (
                    <button
                        key={index}
                        onClick={() => handleTabChange(index)}
                        style={{
                            backgroundColor:
                                allValues?.activeTabIndex === index
                                    ? "#007bff"
                                    : "#f0f0f0",
                            color:
                                allValues?.activeTabIndex === index
                                    ? "white"
                                    : "black",
                            border: "none",
                            padding: "8px 16px",
                            margin: "4px",
                            borderRadius: "4px",
                            cursor: "pointer",
                        }}
                    >
                        탭 {index + 1}
                    </button>
                ))}
            </div>

            {/* 디버그 정보 */}
            <details style={{ marginTop: "16px" }}>
                <summary>전체 상태 (디버그용)</summary>
                <pre
                    style={{
                        background: "#f5f5f5",
                        padding: "8px",
                        fontSize: "12px",
                    }}
                >
                    {JSON.stringify(allValues, null, 2)}
                </pre>
            </details>
        </div>
    );
}
```

**성능 비교:**

```typescript
// ❌ 개별 필드 구독 (6번의 개별 리렌더링 가능)
const tabValue = dialogState.useValue("tabValue");
const activeTabIndex = dialogState.useValue("activeTabIndex");
const scrollToSectionIndex = dialogState.useValue("scrollToSectionIndex");
const isScrolling = dialogState.useValue("isScrolling");
const autoTabChange = dialogState.useValue("autoTabChange");
const autoScroll = dialogState.useValue("autoScroll");

// ✅ 전체 상태 구독 (1번의 리렌더링만)
const allValues = dialogState.useValue("*");
const {
    tabValue,
    activeTabIndex,
    scrollToSectionIndex,
    isScrolling,
    autoTabChange,
    autoScroll,
} = allValues || {};
```

**🎯 실전 활용 사례:**

```typescript
// 대시보드 위젯 - 모든 데이터를 함께 표시
function DashboardWidget() {
    const dashboardState = useFormaState({
        metrics: { sales: 0, visitors: 0, conversion: 0 },
        settings: { period: "daily", showTrends: true },
        loading: false,
        lastUpdated: null,
    });

    // 전체 상태 구독으로 위젯 전체 리렌더링
    const widgetData = dashboardState.useValue("*");

    const refreshData = async () => {
        dashboardState.setValue("loading", true);

        const newData = await fetchDashboardData();

        // 모든 데이터를 한 번에 업데이트
        dashboardState.setValues({
            metrics: newData.metrics,
            settings: { ...widgetData.settings, ...newData.settings },
            loading: false,
            lastUpdated: Date.now(),
        });
    };

    if (widgetData?.loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="dashboard-widget">
            <div className="metrics">
                <div>매출: {widgetData?.metrics?.sales}</div>
                <div>방문자: {widgetData?.metrics?.visitors}</div>
                <div>전환율: {widgetData?.metrics?.conversion}%</div>
            </div>

            <div className="controls">
                <select
                    value={widgetData?.settings?.period}
                    onChange={(e) =>
                        dashboardState.setValue(
                            "settings.period",
                            e.target.value
                        )
                    }
                >
                    <option value="daily">일별</option>
                    <option value="weekly">주별</option>
                    <option value="monthly">월별</option>
                </select>

                <button onClick={refreshData}>새로고침</button>
            </div>

            {widgetData?.lastUpdated && (
                <small>
                    마지막 업데이트:{" "}
                    {new Date(widgetData.lastUpdated).toLocaleString()}
                </small>
            )}
        </div>
    );
}
```

**🔄 언제 사용할까?**

- ✅ **다중 필드 표시**: 여러 필드 값을 동시에 화면에 보여줄 때
- ✅ **상태 디버깅**: 개발 중 전체 상태를 한 눈에 확인하고 싶을 때
- ✅ **배치 업데이트**: 여러 필드가 자주 함께 변경되는 경우
- ✅ **위젯/대시보드**: 모든 데이터가 함께 업데이트되어야 하는 컴포넌트
- ✅ **성능 최적화**: 개별 필드 구독보다 전체 구독이 더 효율적인 경우

**⚠️ 주의사항:**

- 전체 상태를 구독하므로 **어떤 필드가 변경되어도 리렌더링**됩니다
- 필드별로 세분화된 최적화가 필요한 경우에는 개별 필드 구독을 사용하세요
- `allValues`가 `undefined`일 수 있으므로 **옵셔널 체이닝(?.)** 사용을 권장합니다

### useFormaState Actions 활용

`actions`를 사용하면 비즈니스 로직을 상태와 함께 캡슐화할 수 있습니다. Computed getters, 핸들러, 복잡한 워크플로우를 하나의 객체로 관리할 수 있습니다.

```typescript
import { useFormaState } from "forma";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

interface TodoState {
    todos: Todo[];
    filter: "all" | "active" | "completed";
    newTodoText: string;
}

function TodoAppWithActions() {
    const state = useFormaState<TodoState>({
        initialValues: {
            todos: [
                { id: 1, text: "Learn React", completed: false },
                { id: 2, text: "Learn Forma", completed: true },
            ],
            filter: "all",
            newTodoText: "",
        },
        actions: {
            // 📊 Computed Getters: 계산된 값 반환
            getFilteredTodos: (context) => {
                const { todos, filter } = context.values;
                if (filter === "active")
                    return todos.filter((t) => !t.completed);
                if (filter === "completed")
                    return todos.filter((t) => t.completed);
                return todos;
            },

            getCompletedCount: (context) => {
                return context.values.todos.filter((t) => t.completed).length;
            },

            getRemainingCount: (context) => {
                return context.values.todos.filter((t) => !t.completed).length;
            },

            // 🎯 Handlers: 상태 변경 작업
            addTodo: (context) => {
                const text = context.values.newTodoText.trim();
                if (!text) return;

                const newTodo: Todo = {
                    id: Date.now(),
                    text,
                    completed: false,
                };

                context.setValue("todos", [...context.values.todos, newTodo]);
                context.setValue("newTodoText", "");
            },

            toggleTodo: (context, id: number) => {
                const index = context.values.todos.findIndex(
                    (t) => t.id === id
                );
                if (index === -1) return;

                const todo = context.getValue(`todos.${index}`);
                context.setValue(`todos.${index}.completed`, !todo.completed);
            },

            removeTodo: (context, id: number) => {
                context.setValue(
                    "todos",
                    context.values.todos.filter((t) => t.id !== id)
                );
            },

            clearCompleted: (context) => {
                context.setValue(
                    "todos",
                    context.values.todos.filter((t) => !t.completed)
                );
            },

            toggleAll: (context) => {
                const allCompleted = context.values.todos.every(
                    (t) => t.completed
                );
                context.setValue(
                    "todos",
                    context.values.todos.map((t) => ({
                        ...t,
                        completed: !allCompleted,
                    }))
                );
            },

            setFilter: (context, filter: "all" | "active" | "completed") => {
                context.setValue("filter", filter);
            },
        },
    });

    // 구독
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    // Actions 사용
    const filteredTodos = state.actions.getFilteredTodos();
    const completedCount = state.actions.getCompletedCount();
    const remainingCount = state.actions.getRemainingCount();

    return (
        <div>
            <h2>할 일 관리</h2>

            {/* 입력 영역 */}
            <div>
                <input
                    value={newTodoText}
                    onChange={(e) =>
                        state.setValue("newTodoText", e.target.value)
                    }
                    onKeyPress={(e) =>
                        e.key === "Enter" && state.actions.addTodo()
                    }
                    placeholder="새 할 일 입력"
                />
                <button onClick={state.actions.addTodo}>추가</button>
            </div>

            {/* 통계 */}
            <div>
                <span>남은 할 일: {remainingCount}개</span>
                <span> | 완료: {completedCount}개</span>
            </div>

            {/* 필터 */}
            <div>
                <button onClick={() => state.actions.setFilter("all")}>
                    전체 ({state.useValue("todos.length")})
                </button>
                <button onClick={() => state.actions.setFilter("active")}>
                    진행 중 ({remainingCount})
                </button>
                <button onClick={() => state.actions.setFilter("completed")}>
                    완료 ({completedCount})
                </button>
            </div>

            {/* 할 일 목록 */}
            <ul>
                {filteredTodos.map((todo) => (
                    <li key={todo.id}>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => state.actions.toggleTodo(todo.id)}
                        />
                        <span
                            style={{
                                textDecoration: todo.completed
                                    ? "line-through"
                                    : "none",
                            }}
                        >
                            {todo.text}
                        </span>
                        <button
                            onClick={() => state.actions.removeTodo(todo.id)}
                        >
                            삭제
                        </button>
                    </li>
                ))}
            </ul>

            {/* 일괄 작업 */}
            <div>
                <button onClick={state.actions.toggleAll}>전체 토글</button>
                <button onClick={state.actions.clearCompleted}>
                    완료 항목 삭제
                </button>
            </div>
        </div>
    );
}
```

**Actions의 장점:**

- ✅ **로직 캡슐화**: 비즈니스 로직을 상태 정의와 함께 관리
- ✅ **재사용성**: 같은 액션을 여러 곳에서 호출 가능
- ✅ **타입 안전성**: ActionContext를 통한 타입 추론
- ✅ **테스트 용이성**: 액션만 독립적으로 테스트 가능
- ✅ **가독성**: 복잡한 상태 변경 로직을 명확한 이름으로 표현

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

### useForm Actions 활용

`useForm`에서도 actions를 사용하여 폼 로직을 캡슐화할 수 있습니다. 쇼핑카트 예제를 통해 알아봅시다.

```typescript
import { useForm } from "forma";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface CartForm {
    items: CartItem[];
    discount: number;
    customerName: string;
    customerEmail: string;
}

function ShoppingCartWithActions() {
    const form = useForm<CartForm>({
        initialValues: {
            items: [],
            discount: 0,
            customerName: "",
            customerEmail: "",
        },
        actions: {
            // 📊 Computed Getters
            getTotal: (context) => {
                return context.values.items.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                );
            },

            getDiscountedTotal: (context) => {
                const total = context.actions.getTotal();
                return total * (1 - context.values.discount / 100);
            },

            isEmpty: (context) => {
                return context.values.items.length === 0;
            },

            // 🎯 Handlers
            addItem: (context, item: CartItem) => {
                const existingIndex = context.values.items.findIndex(
                    (i) => i.id === item.id
                );

                if (existingIndex >= 0) {
                    // 이미 있는 상품: 수량 증가
                    const existingItem = context.getValue(
                        `items.${existingIndex}`
                    );
                    context.setValue(
                        `items.${existingIndex}.quantity`,
                        existingItem.quantity + 1
                    );
                } else {
                    // 새 상품 추가
                    context.setValue("items", [...context.values.items, item]);
                }
            },

            removeItem: (context, itemId: number) => {
                context.setValue(
                    "items",
                    context.values.items.filter((item) => item.id !== itemId)
                );
            },

            updateQuantity: (context, itemId: number, quantity: number) => {
                const index = context.values.items.findIndex(
                    (i) => i.id === itemId
                );
                if (index >= 0) {
                    context.setValue(`items.${index}.quantity`, quantity);
                }
            },

            applyDiscount: (context, discountPercent: number) => {
                context.setValue(
                    "discount",
                    Math.min(100, Math.max(0, discountPercent))
                );
            },

            clearAll: (context) => {
                context.setValue("items", []);
                context.setValue("discount", 0);
            },

            // 🔄 Complex Workflow
            submitOrder: async (context) => {
                // 검증
                if (context.actions.isEmpty()) {
                    alert("장바구니가 비어있습니다");
                    return false;
                }

                if (!context.values.customerName.trim()) {
                    alert("이름을 입력해주세요");
                    return false;
                }

                if (!context.values.customerEmail.includes("@")) {
                    alert("올바른 이메일을 입력해주세요");
                    return false;
                }

                // 주문 제출
                const orderData = {
                    customer: {
                        name: context.values.customerName,
                        email: context.values.customerEmail,
                    },
                    items: context.values.items,
                    discount: context.values.discount,
                    total: context.actions.getTotal(),
                    finalAmount: context.actions.getDiscountedTotal(),
                };

                console.log("주문 제출:", orderData);
                // await api.submitOrder(orderData);

                // 성공 후 초기화
                context.actions.clearAll();
                context.setValue("customerName", "");
                context.setValue("customerEmail", "");

                return true;
            },
        },
        onSubmit: async (values, actions) => {
            return actions.submitOrder();
        },
    });

    // 구독
    const items = form.useFormValue("items");
    const customerName = form.useFormValue("customerName");
    const customerEmail = form.useFormValue("customerEmail");
    const discount = form.useFormValue("discount");

    // Actions 사용
    const total = form.actions.getTotal();
    const finalAmount = form.actions.getDiscountedTotal();

    return (
        <div>
            <h2>쇼핑카트</h2>

            {/* 상품 추가 버튼들 */}
            <div>
                <button
                    onClick={() =>
                        form.actions.addItem({
                            id: 1,
                            name: "노트북",
                            price: 1000000,
                            quantity: 1,
                        })
                    }
                >
                    노트북 추가
                </button>
                <button
                    onClick={() =>
                        form.actions.addItem({
                            id: 2,
                            name: "마우스",
                            price: 30000,
                            quantity: 1,
                        })
                    }
                >
                    마우스 추가
                </button>
                <button
                    onClick={() =>
                        form.actions.addItem({
                            id: 3,
                            name: "키보드",
                            price: 80000,
                            quantity: 1,
                        })
                    }
                >
                    키보드 추가
                </button>
            </div>

            {/* 장바구니 목록 */}
            <div>
                <h3>장바구니 항목</h3>
                {items.map((item) => (
                    <div key={item.id} style={{ marginBottom: "10px" }}>
                        <span>{item.name}</span>
                        <span> - {item.price.toLocaleString()}원</span>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                                form.actions.updateQuantity(
                                    item.id,
                                    parseInt(e.target.value) || 1
                                )
                            }
                            style={{ width: "50px", margin: "0 10px" }}
                        />
                        <button
                            onClick={() => form.actions.removeItem(item.id)}
                        >
                            삭제
                        </button>
                    </div>
                ))}
                {items.length === 0 && <p>장바구니가 비어있습니다</p>}
            </div>

            {/* 할인 */}
            <div>
                <label>
                    할인율 (%):
                    <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) =>
                            form.actions.applyDiscount(
                                parseInt(e.target.value) || 0
                            )
                        }
                        style={{ width: "60px", marginLeft: "10px" }}
                    />
                </label>
            </div>

            {/* 가격 정보 */}
            <div
                style={{
                    marginTop: "20px",
                    padding: "10px",
                    background: "#f0f0f0",
                }}
            >
                <div>
                    <strong>총액:</strong> {total.toLocaleString()}원
                </div>
                {discount > 0 && (
                    <div>
                        <strong>할인 ({discount}%):</strong> -
                        {(total - finalAmount).toLocaleString()}원
                    </div>
                )}
                <div style={{ fontSize: "20px", marginTop: "10px" }}>
                    <strong>최종 금액:</strong> {finalAmount.toLocaleString()}원
                </div>
            </div>

            {/* 고객 정보 */}
            <div style={{ marginTop: "20px" }}>
                <h3>고객 정보</h3>
                <input
                    name="customerName"
                    value={customerName}
                    onChange={form.handleFormChange}
                    placeholder="이름"
                    style={{ display: "block", marginBottom: "10px" }}
                />
                <input
                    name="customerEmail"
                    value={customerEmail}
                    onChange={form.handleFormChange}
                    placeholder="이메일"
                    style={{ display: "block", marginBottom: "10px" }}
                />
            </div>

            {/* 주문 버튼 */}
            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={form.submit}
                    disabled={form.isSubmitting || form.actions.isEmpty()}
                    style={{ marginRight: "10px" }}
                >
                    {form.isSubmitting ? "제출 중..." : "주문하기"}
                </button>
                <button onClick={form.actions.clearAll}>장바구니 비우기</button>
            </div>
        </div>
    );
}
```

**useForm Actions 활용 시나리오:**

- ✅ **복잡한 계산**: 총액, 할인가, 세금 등 계산 로직
- ✅ **아이템 관리**: 추가, 삭제, 수량 변경 등
- ✅ **검증 로직**: 폼 제출 전 복합 검증
- ✅ **워크플로우**: 여러 단계를 거치는 제출 프로세스

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

// 컴포넌트 A: 폼 로직과 핸들러 정의
function UserFormEditor() {
    const form = useGlobalForm({
        formId: "user-form",
        initialValues: { name: "", email: "" },
        onValidate: async (values) => {
            // 이메일 검증
            return values.email.includes("@");
        },
        onSubmit: async (values) => {
            // 실제 제출 로직
            await api.submitUser(values);
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

// 컴포넌트 B: 같은 폼의 데이터와 핸들러 자동 공유
function FormViewer() {
    const form = useGlobalForm({
        formId: "user-form", // 같은 ID로 데이터와 핸들러 모두 공유
    });
    const isModified = useFormModified(form);

    return (
        <div>
            <p>현재 이름: {form.useFormValue("name")}</p>
            <p>현재 이메일: {form.useFormValue("email")}</p>
            <p>수정 여부: {isModified ? "수정됨" : "수정 안됨"}</p>

            {/* ✅ 여기서도 submit() 동작! */}
            {/* 컴포넌트 A의 onValidate, onSubmit 자동으로 사용됨 */}
            <button onClick={form.submit} disabled={form.isSubmitting}>
                다른 곳에서 제출
            </button>
        </div>
    );
}
```

**핵심 개념:**

- **자동 핸들러 공유**: 첫 번째로 등록된 `onValidate`, `onSubmit`, `onComplete`가 글로벌하게 공유됨
- **직관적 동작**: `formId`만 같으면 데이터와 핸들러 모두 공유되어 예상대로 동작
- **어디서든 submit**: 어느 컴포넌트에서든 `submit()` 호출 가능
- **일관된 검증**: 모든 컴포넌트에서 동일한 검증 로직 적용됨

### Actions와 함께 사용하는 글로벌 폼

```typescript
// 컴포넌트 A: 폼 로직, 핸들러, actions 정의
function ProductFormEditor() {
    const form = useGlobalForm({
        formId: "product-form",
        initialValues: {
            name: "",
            price: 0,
            discount: 0,
            stock: 0,
        },
        actions: {
            // Computed getter - 할인된 가격 계산
            getDiscountedPrice: (context) => {
                const price = context.values.price;
                const discount = context.values.discount;
                return price * (1 - discount / 100);
            },

            // Computed getter - 재고 상태
            getStockStatus: (context) => {
                const stock = context.values.stock;
                if (stock === 0) return "품절";
                if (stock < 10) return "재고 부족";
                return "재고 충분";
            },

            // Handler - 가격 검증
            validatePrice: (context) => {
                const price = context.values.price;
                const discountedPrice =
                    context.actions.getDiscountedPrice(context);

                if (price <= 0) {
                    alert("가격은 0보다 커야 합니다.");
                    return false;
                }

                if (discountedPrice < 1000) {
                    alert("할인 후 가격이 1000원 미만일 수 없습니다.");
                    return false;
                }

                return true;
            },

            // Handler - 재고 증가
            increaseStock: (context, amount: number) => {
                const currentStock = context.values.stock;
                context.setValue("stock", currentStock + amount);
            },

            // Handler - 할인 적용
            applyDiscount: (context, discountPercent: number) => {
                if (discountPercent < 0 || discountPercent > 100) {
                    alert("할인율은 0~100 사이여야 합니다.");
                    return;
                }
                context.setValue("discount", discountPercent);
            },
        },
        onValidate: async (values) => {
            if (!values.name.trim()) {
                alert("상품명을 입력해주세요.");
                return false;
            }
            return true;
        },
        onSubmit: async (values) => {
            console.log("상품 저장:", values);
            await api.saveProduct(values);
        },
    });

    const discountedPrice = form.actions.getDiscountedPrice();
    const stockStatus = form.actions.getStockStatus();

    return (
        <form onSubmit={form.submit}>
            <h3>상품 편집</h3>
            <input
                name="name"
                placeholder="상품명"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
            <input
                name="price"
                type="number"
                placeholder="가격"
                value={form.useFormValue("price")}
                onChange={form.handleFormChange}
            />
            <input
                name="discount"
                type="number"
                placeholder="할인율 (%)"
                value={form.useFormValue("discount")}
                onChange={form.handleFormChange}
            />
            <p>할인가: {discountedPrice.toLocaleString()}원</p>

            <div>
                <button
                    type="button"
                    onClick={() => form.actions.applyDiscount(10)}
                >
                    10% 할인
                </button>
                <button
                    type="button"
                    onClick={() => form.actions.applyDiscount(20)}
                >
                    20% 할인
                </button>
            </div>

            <button type="submit" disabled={form.isSubmitting}>
                저장
            </button>
        </form>
    );
}

// 컴포넌트 B: 같은 폼의 데이터, 핸들러, actions 자동 공유
function ProductSummary() {
    const form = useGlobalForm({
        formId: "product-form", // 같은 ID로 모든 것 공유
    });

    // ✅ actions도 자동으로 사용 가능!
    const discountedPrice = form.actions.getDiscountedPrice();
    const stockStatus = form.actions.getStockStatus();

    return (
        <div>
            <h3>상품 요약</h3>
            <p>상품명: {form.useFormValue("name")}</p>
            <p>원가: {form.useFormValue("price").toLocaleString()}원</p>
            <p>할인율: {form.useFormValue("discount")}%</p>
            <p>할인가: {discountedPrice.toLocaleString()}원</p>
            <p>
                재고: {form.useFormValue("stock")}개 ({stockStatus})
            </p>

            <div>
                <button onClick={() => form.actions.increaseStock(10)}>
                    재고 +10
                </button>
                <button onClick={() => form.actions.increaseStock(50)}>
                    재고 +50
                </button>
            </div>

            {/* actions의 검증 로직도 사용 가능 */}
            <button
                onClick={() => {
                    if (form.actions.validatePrice()) {
                        form.submit();
                    }
                }}
            >
                가격 검증 후 제출
            </button>
        </div>
    );
}
```

**핵심 개념:**

- **Actions 자동 공유**: 첫 번째로 등록된 `actions`도 글로벌하게 공유됨
- **비즈니스 로직 캡슐화**: 복잡한 계산과 검증 로직을 actions에 모아서 관리
- **재사용성**: 다른 컴포넌트에서도 같은 actions를 사용 가능
- **일관성**: 모든 컴포넌트에서 동일한 로직 적용

````

### 다단계 폼

```typescript
// Step 1 Component: 기본 정보 입력 + 초기값 설정
function Step1() {
    const form = useGlobalForm({
        formId: "user-registration",
        initialValues: { name: "", email: "", phone: "" }, // 여기서만 초기값 설정
    });

    return (
        <TextField
            name="name"
            value={form.useFormValue("name")}
            onChange={form.handleFormChange}
        />
    );
}

// Step 2 Component: 같은 폼 상태 공유 (initialValues 불필요)
function Step2() {
    const form = useGlobalForm({
        formId: "user-registration", // 같은 ID로 데이터 공유
        // initialValues 생략 - 이미 Step1에서 생성됨 (여기서 써도 무시됨)
    });

    return (
        <TextField
            name="email"
            value={form.useFormValue("email")}
            onChange={form.handleFormChange}
        />
    );
}

// 최종 단계: 검증과 제출 핸들러 등록 (initialValues 불필요)
function FinalStep() {
    const form = useGlobalForm({
        formId: "user-registration", // 같은 폼 상태
        // initialValues 생략 - 이미 Step1에서 설정됨 (여기서 써도 무시됨)
        onValidate: async (values) => {
            // 모든 필드 검증
            return values.name && values.email && values.phone;
        },
        onSubmit: async (values) => {
            // 실제 제출 로직
            await api.registerUser(values);
        },
    });

    return (
        <div>
            <p>이름: {form.useFormValue("name")}</p>
            <p>이메일: {form.useFormValue("email")}</p>
            <p>전화번호: {form.useFormValue("phone")}</p>

            {/* 여기서 submit 호출하면 위의 onValidate, onSubmit 실행됨 */}
            <button onClick={form.submit} disabled={form.isSubmitting}>
                등록 완료
            </button>
        </div>
    );
}

// 💡 추가 팁: 다른 컴포넌트에서도 submit 가능!
function QuickSubmitButton() {
    const form = useGlobalForm({
        formId: "user-registration", // 같은 ID
        // 핸들러 없어도 FinalStep에서 등록한 핸들러 자동 사용
    });

    return (
        <button onClick={form.submit} disabled={form.isSubmitting}>
            빠른 등록
        </button>
    );
}
````

**핵심 포인트:**

- ✅ **initialValues는 첫 번째만**: 처음 글로벌 폼을 생성하는 컴포넌트에서만 `initialValues` 설정
- ✅ **이후에는 생략**: 같은 `formId`로 접근하는 다른 컴포넌트는 `initialValues` 불필요
- ✅ **핸들러는 필요할 때만**: `onSubmit`, `onValidate` 등도 필요한 컴포넌트에서만 등록

```

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
        // initialValues 생략 - UserProfile에서 이미 생성됨 (여기서 써도 무시됨)
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

## useModal 예제

`useModal` 훅은 모바일 환경에서 뒤로가기 버튼을 지원하는 모달 상태 관리를 제공합니다.

### 기본 모달 사용

```typescript
import { useModal } from "@ehfuse/forma";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";

function UserProfileDialog() {
    const modal = useModal({
        onClose: () => {
            console.log("모달이 닫혔습니다");
        },
    });

    return (
        <>
            <button onClick={modal.open}>프로필 보기</button>

            <Dialog open={modal.isOpen} onClose={modal.close}>
                <DialogTitle>사용자 프로필</DialogTitle>
                <DialogContent>
                    <p>이름: 홍길동</p>
                    <p>이메일: hong@example.com</p>
                    <p>
                        특징: 모바일에서 뒤로가기 버튼을 누르면
                        <br />
                        페이지 이동 대신 모달만 닫힙니다!
                    </p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={modal.close}>닫기</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
```

#### 주요 기능

- **모바일 뒤로가기 지원**: 뒤로가기 버튼을 누르면 페이지 이동 대신 모달만 닫힙니다.
- **자동 정리**: 컴포넌트 언마운트 시 모달 스택에서 자동 제거됩니다.
- **onClose 콜백**: 모달이 닫힐 때마다 호출됩니다.

### 중첩 모달 관리

```typescript
import { useModal } from "@ehfuse/forma";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

function NestedModalExample() {
    const firstModal = useModal();
    const secondModal = useModal();
    const thirdModal = useModal();

    return (
        <>
            <button onClick={firstModal.open}>첫 번째 모달 열기</button>

            {/* 첫 번째 모달 */}
            <Dialog open={firstModal.isOpen} onClose={firstModal.close}>
                <DialogTitle>첫 번째 모달</DialogTitle>
                <DialogContent>
                    <p>레벨 1 모달</p>
                    <Button onClick={secondModal.open}>
                        두 번째 모달 열기
                    </Button>
                </DialogContent>
            </Dialog>

            {/* 두 번째 모달 */}
            <Dialog open={secondModal.isOpen} onClose={secondModal.close}>
                <DialogTitle>두 번째 모달</DialogTitle>
                <DialogContent>
                    <p>레벨 2 모달</p>
                    <Button onClick={thirdModal.open}>세 번째 모달 열기</Button>
                </DialogContent>
            </Dialog>

            {/* 세 번째 모달 */}
            <Dialog open={thirdModal.isOpen} onClose={thirdModal.close}>
                <DialogTitle>세 번째 모달</DialogTitle>
                <DialogContent>
                    <p>레벨 3 모달</p>
                    <p>
                        모바일에서 뒤로가기를 누르면 가장 마지막에 열린 모달부터
                        닫힙니다.
                    </p>
                </DialogContent>
            </Dialog>
        </>
    );
}
```

#### 중첩 모달 동작

1. 모달을 열 때마다 글로벌 모달 스택에 추가됩니다.
2. 뒤로가기 버튼을 누르면 가장 마지막 모달만 닫힙니다.
3. 각 모달은 독립적으로 관리되며, 언마운트 시 자동으로 스택에서 제거됩니다.

### 폼이 포함된 모달

```typescript
import { useModal, useForm } from "@ehfuse/forma";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from "@mui/material";

function EditUserModal({ userId, onSave }) {
    const modal = useModal({
        onClose: () => {
            // 모달이 닫힐 때 폼도 리셋
            form.reset();
        },
    });

    const form = useForm({
        initialValues: {
            name: "",
            email: "",
        },
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    const handleSubmit = () => {
        const values = form.getValues();
        onSave(values);
        modal.close();
    };

    return (
        <>
            <button onClick={modal.open}>사용자 정보 수정</button>

            <Dialog open={modal.isOpen} onClose={modal.close}>
                <DialogTitle>사용자 정보 수정</DialogTitle>
                <DialogContent>
                    <TextField
                        label="이름"
                        value={name}
                        onChange={(e) => form.setValue("name", e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="이메일"
                        value={email}
                        onChange={(e) => form.setValue("email", e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={modal.close}>취소</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
```

#### 폼과 모달 통합

- **onClose에서 리셋**: 모달이 닫힐 때 폼도 함께 초기화할 수 있습니다.
- **저장 후 닫기**: 데이터 저장 후 `modal.close()`로 모달을 닫습니다.
- **뒤로가기 안전**: 모바일에서 뒤로가기를 누르면 폼 데이터가 손실되지 않습니다 (모달만 닫힘).

#### 중요 사항

`useModal`을 사용하려면 앱의 최상단에 `GlobalFormaProvider`로 감싸야 합니다:

```typescript
import { GlobalFormaProvider } from "@ehfuse/forma";

function App() {
    return (
        <GlobalFormaProvider>
            <YourApp />
        </GlobalFormaProvider>
    );
}
```

---

———

## useBreakpoint 예제

`useBreakpoint` 훅은 화면 크기에 따른 반응형 UI를 구현할 때 사용합니다. 모바일, 태블릿, 데스크톱 등 다양한 화면 크기에 대응하는 컴포넌트를 만들 수 있습니다.

### 반응형 기본 사용법

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function ResponsiveNavigation() {
    const { smUp } = useBreakpoint();

    return (
        <header>
            {smUp ? (
                // 데스크톱: 수평 네비게이션
                <nav>
                    <a href="/home">홈</a>
                    <a href="/about">소개</a>
                    <a href="/contact">연락처</a>
                </nav>
            ) : (
                // 모바일: 햄버거 메뉴
                <HamburgerMenu />
            )}
        </header>
    );
}
```

### 모바일/데스크톱 분기

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function ProductPage() {
    const { xs, sm, mdUp } = useBreakpoint();

    // 화면 크기에 따라 다른 레이아웃 사용
    if (xs) {
        return (
            <div>
                <MobileProductView />
                <MobileImageCarousel />
                <MobileReviews />
            </div>
        );
    }

    if (sm) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr" }}>
                <TabletProductView />
                <TabletImageGallery />
                <TabletReviews />
            </div>
        );
    }

    // 데스크톱 (md 이상)
    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr" }}>
            <div>
                <DesktopProductView />
                <DesktopImageGallery />
            </div>
            <div>
                <Sidebar>
                    <PriceInfo />
                    <AddToCart />
                </Sidebar>
            </div>
        </div>
    );
}
```

### 동적 레이아웃

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function Dashboard() {
    const { xs, sm, md, mdUp, lgUp } = useBreakpoint();

    // 화면 크기에 따라 그리드 열 수 조정
    const columns = xs ? 1 : sm ? 2 : md ? 3 : 4;

    return (
        <div>
            <MainContent />

            {/* 중간 크기부터 사이드바 표시 */}
            {mdUp && (
                <Sidebar>
                    <QuickStats />
                    <RecentActivity />
                </Sidebar>
            )}

            {/* 큰 화면에서만 추가 패널 표시 */}
            {lgUp && (
                <RightPanel>
                    <Notifications />
                    <Calendar />
                </RightPanel>
            )}

            <Grid container spacing={2}>
                {cards.map((card) => (
                    <Grid item xs={12 / columns} key={card.id}>
                        <Card {...card} />
                    </Grid>
                ))}
            </Grid>
        </div>
    );
}
```

#### 이미지 갤러리 예제

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function ImageGallery({ images }) {
    const { xs, sm, md, lg, xlUp } = useBreakpoint();

    // 화면 크기별 열 수 결정
    const getColumns = () => {
        if (xs) return 1;
        if (sm) return 2;
        if (md) return 3;
        if (lg) return 4;
        if (xlUp) return 5;
        return 3; // 기본값
    };

    const columns = getColumns();
    const columnWidth = `${100 / columns}%`;

    return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            {images.map((image) => (
                <div
                    key={image.id}
                    style={{
                        width: columnWidth,
                        padding: "8px",
                    }}
                >
                    <img
                        src={image.url}
                        alt={image.title}
                        style={{ width: "100%", height: "auto" }}
                    />
                </div>
            ))}
        </div>
    );
}
```

#### 반응형 폰트 크기

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function Article({ title, content }) {
    const { xs, sm, mdUp } = useBreakpoint();

    const titleFontSize = xs ? "24px" : sm ? "32px" : "48px";
    const contentFontSize = xs ? "14px" : sm ? "16px" : "18px";
    const maxWidth = mdUp ? "800px" : "100%";

    return (
        <article style={{ maxWidth, margin: "0 auto", padding: "16px" }}>
            <h1 style={{ fontSize: titleFontSize }}>{title}</h1>
            <p style={{ fontSize: contentFontSize, lineHeight: 1.6 }}>
                {content}
            </p>
        </article>
    );
}
```

#### 조건부 컴포넌트 렌더링

```typescript
import { useBreakpoint } from "@ehfuse/forma";

function VideoPlayer() {
    const { smUp, mdUp } = useBreakpoint();

    return (
        <div>
            <video controls>
                <source src="video.mp4" type="video/mp4" />
            </video>

            {/* 작은 화면에서는 기본 컨트롤만 */}
            {smUp && <VideoControls />}

            {/* 중간 크기부터 재생목록 */}
            {mdUp && <Playlist />}

            {/* 큰 화면에서는 추천 동영상 */}
            {mdUp && <RecommendedVideos />}
        </div>
    );
}
```

#### 주요 활용 케이스

1. **네비게이션 패턴**: 데스크톱은 수평 메뉴, 모바일은 햄버거
2. **레이아웃 변경**: 화면 크기에 따라 1열/2열/3열 그리드
3. **조건부 컴포넌트**: 큰 화면에서만 사이드바/패널 표시
4. **동적 스타일링**: 화면 크기별 폰트/여백 조정
5. **콘텐츠 최적화**: 모바일/데스크톱별 다른 컴포넌트 사용

#### 주의사항

- 창 크기 변경 시 리렌더링이 발생하므로 성능을 고려하여 사용하세요.
- 단순한 스타일 변경은 CSS 미디어 쿼리를 사용하는 것이 더 효율적입니다.
- 컴포넌트의 표시/비표시나 구조적 변경이 필요한 경우에 사용하세요.

———

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

- **[API Reference](./API.md)** - 상세한 API 문서
- **[시작하기 가이드](./getting-started.md)** - 기본 사용법
- **[성능 최적화 가이드](./performance-guide.md)** - 성능 최적화 방법
- **[성능 최적화 주의사항](./performance-warnings.md)** - 안티패턴과 주의사항
- **[마이그레이션 가이드](./migration.md)** - 다른 라이브러리에서 이전
- **[useGlobalForm 가이드](./useGlobalForm-guide.md)** - 글로벌 폼 상태 관리
