# TodoApp 예제 - 배열 상태 관리와 길이 구독

Forma의 **배열 길이 구독** 기능을 활용한 성능 최적화 TodoApp 예제입니다.

이 문서는 **두 가지 구현 방식**을 제공합니다:

1. **기본 구조**: 직접 상태를 관리하는 전통적인 방식
2. **Actions 구조**: 비즈니스 로직을 캡슐화한 고급 패턴

## 🔥 핵심 개념

-   **배열 길이만 구독**: `todos.length`로 항목 추가/삭제 시에만 리렌더링
-   **개별 필드 구독**: 각 할 일 항목 변경 시 해당 컴포넌트만 리렌더링
-   **성능 최적화**: 불필요한 전체 리렌더링 방지
-   **Actions 패턴**: 로직 캡슐화와 재사용성 향상

---

## 방법 1: 기본 구조 (직접 상태 관리)

```tsx
import React from "react";
import { useFormaState } from "@ehfuse/forma";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

function TodoApp() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Learn Forma", completed: true },
        ],
        filter: "all" as "all" | "active" | "completed",
        newTodoText: "",
    });

    // **🔥 핵심: 배열 길이만 구독 (항목 추가/삭제 시에만 리렌더링)**
    const todoCount = state.useValue("todos.length");

    // **개별 필드 구독**
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    const addTodo = () => {
        if (!newTodoText.trim()) return;

        const todos = state.getValues().todos;
        state.setValue("todos", [
            ...todos,
            { id: Date.now(), text: newTodoText, completed: false },
        ]);
        // **✅ todos 배열이 변경되면 todos.length 구독자에게 자동 알림!**

        state.setValue("newTodoText", "");
    };

    const toggleTodo = (index: number) => {
        const todo = state.getValue(`todos.${index}`);
        state.setValue(`todos.${index}.completed`, !todo.completed);
        // **✅ 배열 내용만 변경 (길이 동일) - todos.length에는 알림 안 감**
    };

    return (
        <div>
            <h2>할 일 관리 ({todoCount}개)</h2>

            <div>
                {/* ✅ name 속성이 있는 일반 입력: handleChange 사용 가능 */}
                <input
                    name="newTodoText"
                    value={newTodoText}
                    onChange={state.handleChange}
                    placeholder="새 할 일 입력"
                />
                <button onClick={addTodo}>추가</button>
            </div>

            <div>
                {/* 🔍 라디오 버튼: name은 있지만 고정 값 설정이 필요한 경우 */}
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={filter === "all"}
                        onChange={() => state.setValue("filter", "all")}
                    />
                    전체
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="active"
                        checked={filter === "active"}
                        onChange={() => state.setValue("filter", "active")}
                    />
                    진행 중
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="completed"
                        checked={filter === "completed"}
                        onChange={() => state.setValue("filter", "completed")}
                    />
                    완료
                </label>
            </div>

            <TodoList state={state} filter={filter} onToggle={toggleTodo} />
        </div>
    );
}

// 성능 최적화된 할 일 목록 컴포넌트
function TodoList({
    state,
    filter,
    onToggle,
}: {
    state: any;
    filter: "all" | "active" | "completed";
    onToggle: (index: number) => void;
}) {
    const todos = state.getValues().todos;

    return (
        <ul>
            {todos
                .filter((todo: Todo) => {
                    if (filter === "active") return !todo.completed;
                    if (filter === "completed") return todo.completed;
                    return true;
                })
                .map((todo: Todo, index: number) => (
                    <TodoItem
                        key={todo.id}
                        index={index}
                        state={state}
                        onToggle={onToggle}
                    />
                ))}
        </ul>
    );
}

// **개별 할 일 항목 컴포넌트 (해당 항목 변경 시에만 리렌더링)**
function TodoItem({
    index,
    state,
    onToggle,
}: {
    index: number;
    state: any;
    onToggle: (index: number) => void;
}) {
    // **개별 필드만 구독하여 성능 최적화**
    const text = state.useValue(`todos.${index}.text`);
    const completed = state.useValue(`todos.${index}.completed`);

    return (
        <li>
            <input
                type="checkbox"
                checked={completed}
                onChange={() => onToggle(index)}
            />
            <span
                style={{
                    textDecoration: completed ? "line-through" : "none",
                }}
            >
                {text}
            </span>
        </li>
    );
}

export default TodoApp;
```

## 🎯 성능 최적화 포인트

### 1. 배열 길이 구독의 효과

```tsx
// ✅ 스마트한 구독: 항목 추가/삭제 시에만 카운터 업데이트
const todoCount = state.useValue("todos.length");

// ❌ 비효율적: 모든 todo 변경 시 리렌더링
const todoCount = state.useValue("todos").length;
```

### 2. 개별 항목 구독으로 격리된 리렌더링

```tsx
// ✅ TodoItem 컴포넌트는 자신의 데이터만 구독
const text = state.useValue(`todos.${index}.text`);
const completed = state.useValue(`todos.${index}.completed`);

// 결과: 특정 할 일만 체크해도 다른 할 일들은 리렌더링 안 됨!
```

### 3. 이벤트 핸들링 방식의 선택

```tsx
// ✅ name 속성이 있는 일반 입력: handleChange 사용
<input
    name="newTodoText"
    value={newTodoText}
    onChange={state.handleChange} // 자동으로 name으로 필드 식별
/>

// ✅ 라디오 버튼: 고정 값 설정이 필요한 경우 setValue 직접 사용
<input
    type="radio"
    name="filter"
    value="active"
    checked={filter === "active"}
    onChange={() => state.setValue("filter", "active")} // 명시적 값 설정
/>

// 🔍 handleChange를 라디오에 사용하면?
<input
    type="radio"
    name="filter"
    value="active"
    checked={filter === "active"}
    onChange={state.handleChange} // "active" 문자열이 아닌 true/false가 설정됨
/>
```

### 4. 필터링과 성능

```tsx
// ✅ 필터 변경 시에만 TodoList 리렌더링
const filter = state.useValue("filter");

// TodoItem들은 필터 변경과 무관하게 자신의 데이터만 구독하므로
// 필터링에 의한 화면 표시/숨김과 리렌더링이 분리됨
```

## 🚀 실제 성능 효과

### Before (일반적인 상태 관리)

-   할 일 하나 체크 → 전체 목록 리렌더링
-   새 할 일 추가 → 전체 앱 리렌더링
-   필터 변경 → 모든 컴포넌트 리렌더링

### After (Forma 개별 필드 구독)

-   할 일 하나 체크 → 해당 TodoItem만 리렌더링
-   새 할 일 추가 → 카운터와 새 TodoItem만 렌더링
-   필터 변경 → TodoList만 리렌더링 (TodoItem들은 그대로)

## 📋 학습 포인트

1. **`todos.length` 구독**으로 배열 크기 변화만 감지
2. **`todos.${index}.field` 패턴**으로 개별 항목 구독
3. **컴포넌트 분할**로 리렌더링 범위 최소화
4. **이벤트 핸들링 방식 선택**:
    - `handleChange`: name 속성이 있는 일반 입력 (텍스트, 셀렉트 등)
    - `setValue`: 고정 값 설정이 필요한 경우 (라디오, 커스텀 로직 등)
5. **필요한 데이터만 구독**하는 원칙 준수

---

## 방법 2: Actions 구조 (로직 캡슐화)

Actions를 사용하면 비즈니스 로직을 상태와 함께 관리할 수 있어 코드가 더 깔끔하고 재사용 가능해집니다.

### 전체 코드 (Actions 버전)

```tsx
import React from "react";
import { useFormaState } from "@ehfuse/forma";

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
    const state = useFormaState<TodoState>(
        {
            todos: [
                { id: 1, text: "Learn React", completed: false },
                { id: 2, text: "Learn Forma", completed: true },
            ],
            filter: "all",
            newTodoText: "",
        },
        {
            actions: {
                // 📊 Computed Getters
                getFilteredTodos: (context) => {
                    const { todos, filter } = context.values;
                    if (filter === "active")
                        return todos.filter((t) => !t.completed);
                    if (filter === "completed")
                        return todos.filter((t) => t.completed);
                    return todos;
                },

                getCompletedCount: (context) => {
                    return context.values.todos.filter((t) => t.completed)
                        .length;
                },

                getRemainingCount: (context) => {
                    return context.values.todos.filter((t) => !t.completed)
                        .length;
                },

                // 🎯 Handlers
                addTodo: (context) => {
                    const text = context.values.newTodoText.trim();
                    if (!text) return;

                    const newTodo: Todo = {
                        id: Date.now(),
                        text,
                        completed: false,
                    };

                    context.setValue("todos", [
                        ...context.values.todos,
                        newTodo,
                    ]);
                    context.setValue("newTodoText", "");
                },

                toggleTodo: (context, id: number) => {
                    const index = context.values.todos.findIndex(
                        (t) => t.id === id
                    );
                    if (index === -1) return;

                    const todo = context.getValue(`todos.${index}`);
                    context.setValue(
                        `todos.${index}.completed`,
                        !todo.completed
                    );
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

                setFilter: (
                    context,
                    filter: "all" | "active" | "completed"
                ) => {
                    context.setValue("filter", filter);
                },
            },
        }
    );

    // **🔥 핵심: 배열 길이만 구독**
    const todoCount = state.useValue("todos.length");
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    // Actions 사용
    const filteredTodos = state.actions.getFilteredTodos();
    const completedCount = state.actions.getCompletedCount();
    const remainingCount = state.actions.getRemainingCount();

    return (
        <div>
            <h2>할 일 관리 ({todoCount}개)</h2>

            {/* 입력 영역 */}
            <div>
                <input
                    name="newTodoText"
                    value={newTodoText}
                    onChange={state.handleChange}
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
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="all"
                        checked={filter === "all"}
                        onChange={() => state.actions.setFilter("all")}
                    />
                    전체 ({todoCount})
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="active"
                        checked={filter === "active"}
                        onChange={() => state.actions.setFilter("active")}
                    />
                    진행 중 ({remainingCount})
                </label>
                <label>
                    <input
                        type="radio"
                        name="filter"
                        value="completed"
                        checked={filter === "completed"}
                        onChange={() => state.actions.setFilter("completed")}
                    />
                    완료 ({completedCount})
                </label>
            </div>

            {/* 할 일 목록 */}
            <ul>
                {filteredTodos.map((todo) => (
                    <TodoItemWithActions
                        key={todo.id}
                        todo={todo}
                        onToggle={state.actions.toggleTodo}
                        onRemove={state.actions.removeTodo}
                    />
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

// Actions 버전의 개별 항목 컴포넌트
function TodoItemWithActions({
    todo,
    onToggle,
    onRemove,
}: {
    todo: Todo;
    onToggle: (id: number) => void;
    onRemove: (id: number) => void;
}) {
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
            />
            <span
                style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                }}
            >
                {todo.text}
            </span>
            <button onClick={() => onRemove(todo.id)}>삭제</button>
        </li>
    );
}

export default TodoAppWithActions;
```

### Actions 버전의 장점

1. **📦 로직 캡슐화**

```tsx
// ❌ 기본 구조: 로직이 컴포넌트에 분산
const addTodo = () => {
    if (!newTodoText.trim()) return;
    const todos = state.getValues().todos;
    state.setValue("todos", [
        ...todos,
        { id: Date.now(), text: newTodoText, completed: false },
    ]);
    state.setValue("newTodoText", "");
};

// ✅ Actions 구조: 로직이 한 곳에 정리
state.actions.addTodo();
```

2. **🔄 재사용성**

```tsx
// 여러 곳에서 같은 액션 호출 가능
<button onClick={state.actions.addTodo}>추가</button>
<input onKeyPress={(e) => e.key === "Enter" && state.actions.addTodo()} />
```

3. **📊 계산된 값 (Computed Values)**

```tsx
// 필터링, 카운트 등의 로직을 getter로 관리
const filteredTodos = state.actions.getFilteredTodos();
const completedCount = state.actions.getCompletedCount();
const remainingCount = state.actions.getRemainingCount();
```

4. **🧪 테스트 용이성**

```tsx
// Actions는 독립적으로 테스트 가능
test("addTodo should add new todo", () => {
    const context = createMockContext();
    actions.addTodo(context);
    expect(context.values.todos.length).toBe(1);
});
```

---

## 🎯 두 방식 비교

| 특징            | 기본 구조            | Actions 구조           |
| --------------- | -------------------- | ---------------------- |
| **학습 곡선**   | 쉬움                 | 중간                   |
| **코드 구조**   | 컴포넌트 내 분산     | 상태와 함께 관리       |
| **재사용성**    | 낮음                 | 높음                   |
| **테스트**      | 컴포넌트 테스트 필요 | Actions만 테스트 가능  |
| **복잡도 관리** | 복잡해질 수 있음     | 깔끔하게 유지          |
| **적합한 경우** | 간단한 앱            | 중대형 앱, 복잡한 로직 |

---

## 📋 전체 학습 포인트

### 공통 (두 방식 모두 적용)

1. **`todos.length` 구독**으로 배열 크기 변화만 감지
2. **`todos.${index}.field` 패턴**으로 개별 항목 구독
3. **컴포넌트 분할**로 리렌더링 범위 최소화
4. **이벤트 핸들링 방식 선택**:
    - `handleChange`: name 속성이 있는 일반 입력
    - `setValue`: 고정 값 설정이 필요한 경우

### Actions 구조 추가 포인트

5. **비즈니스 로직 캡슐화**: actions 객체로 관리
6. **Computed getters**: 계산된 값을 메서드로 제공
7. **재사용 가능한 핸들러**: 여러 곳에서 동일한 액션 호출
8. **테스트 친화적**: Actions만 독립적으로 테스트

---

## 🚀 언제 어떤 방식을 사용할까?

### 기본 구조를 사용하세요

-   ✅ 빠른 프로토타이핑
-   ✅ 간단한 CRUD 앱
-   ✅ 로직이 복잡하지 않은 경우
-   ✅ 팀이 Forma를 처음 도입하는 경우

### Actions 구조를 사용하세요

-   ✅ 복잡한 비즈니스 로직
-   ✅ 같은 로직을 여러 곳에서 사용
-   ✅ 계산된 값이 많은 경우
-   ✅ 단위 테스트가 중요한 경우
-   ✅ 코드 구조와 유지보수성이 중요한 경우

이 예제는 Forma의 핵심 철학인 "필요한 것만 구독하여 성능 최적화"와 "상황에 맞는 구조 선택"을 보여주는 대표적인 사례입니다.
