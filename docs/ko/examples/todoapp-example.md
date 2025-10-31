# TodoApp 예제 - Watch + Actions 완벽 가이드

Forma의 **Watch + Actions** 조합으로 useEffect 없이 완벽한 상태 관리를 구현하는 실전 예제입니다.

## 📑 목차

1. [🎯 핵심 포인트](#-핵심-포인트)
2. [📁 파일 구조](#-파일-구조)
3. [🎯 완전한 구현](#-완전한-구현)
    - [todoActions.ts - 비즈니스 로직](#1-todoactionsts---비즈니스-로직)
    - [todoWatch.ts - 부수효과](#2-todowatchts---부수효과)
    - [TodoApp.tsx - UI 컴포넌트](#3-todoapptsx---ui-컴포넌트)
4. [🎉 이 패턴의 이점](#-이-패턴의-이점)
5. [📚 다양한 구현 방법](#-다양한-구현-방법)
    - [방법 1: 기본 구조 (직접 상태 관리)](#방법-1-기본-구조-직접-상태-관리)
    - [방법 2: Actions 구조 (비즈니스 로직 캡슐화)](#방법-2-actions-구조-비즈니스-로직-캡슐화)
6. [🔍 두 방식 비교](#-두-방식-비교)
7. [💡 Actions 패턴의 추가 장점](#-actions-패턴의-추가-장점)
8. [🎯 두 방식 비교표](#-두-방식-비교-1)
9. [🚀 언제 어떤 방식을 사용할까?](#-언제-어떤-방식을-사용할까)
10. [🎯 고급 패턴: 커링(Currying)을 통한 의존성 주입](#-고급-패턴-커링currying을-통한-의존성-주입)
    - [언제 사용하나?](#언제-사용하나)
    - [예제: API 의존성이 있는 Auth Actions](#예제-api-의존성이-있는-auth-actions)
    - [커링 패턴의 장점](#커링-패턴의-장점)
    - [일반 객체 vs 커링 패턴 비교](#일반-객체-vs-커링-패턴-비교)
    - [언제 커링 패턴을 사용할까?](#언제-커링-패턴을-사용할까)

---

## 🎯 핵심 포인트

-   ✅ **useEffect 제거**: Watch가 모든 부수효과 처리
-   ✅ **Actions 패턴**: 비즈니스 로직 캡슐화
-   ✅ **수술적 리렌더링**: 개별 필드 구독으로 최적화
-   ✅ **모듈화**: 로직을 별도 파일로 분리
-   ✅ **자동 저장**: localStorage 동기화 자동화

---

## 📁 파일 구조

```
src/
  todo/
    ├── todoActions.ts    # 비즈니스 로직 (순수 함수)
    ├── todoWatch.ts      # 부수효과 (useEffect 대체)
    └── TodoApp.tsx       # UI 컴포넌트
```

---

## 🎯 완전한 구현

### 1. todoActions.ts - 비즈니스 로직

```tsx
// 🎯 비즈니스 로직을 별도 파일로 분리
export const todoActions = {
    addTodo: (ctx, text: string) => {
        if (!text.trim()) return;

        const todos = ctx.values.todos;
        ctx.setValue("todos", [
            ...todos,
            { id: Date.now(), text, completed: false },
        ]);
        ctx.setValue("newTodoText", "");
    },

    toggleTodo: (ctx, id: number) => {
        const todos = ctx.values.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        ctx.setValue("todos", todos);
    },

    deleteTodo: (ctx, id: number) => {
        const todos = ctx.values.todos.filter((t) => t.id !== id);
        ctx.setValue("todos", todos);
    },

    clearCompleted: (ctx) => {
        const todos = ctx.values.todos.filter((t) => !t.completed);
        ctx.setValue("todos", todos);
    },

    saveToStorage: (ctx) => {
        localStorage.setItem("todos", JSON.stringify(ctx.values.todos));
    },

    loadFromStorage: (ctx) => {
        const saved = localStorage.getItem("todos");
        if (saved) {
            ctx.setValue("todos", JSON.parse(saved));
        }
    },
};
```

### 2. todoWatch.ts - 부수효과

```tsx
// 👀 부수효과를 별도 파일로 분리 (useEffect 대체!)
export const todoWatch = {
    // todos 변경 시 자동 저장
    todos: (ctx, value) => {
        ctx.actions.saveToStorage(ctx);
        ctx.setValue("lastSync", new Date().toISOString());
        console.log(`✅ Saved ${value.length} todos`);
    },

    // filter 변경 시 로그
    filter: (ctx, value, prevValue) => {
        console.log(`Filter changed: ${prevValue} → ${value}`);
    },

    // 완료된 항목 개수 추적
    "todos.*.completed": (ctx) => {
        const completed = ctx.values.todos.filter((t) => t.completed).length;
        ctx.setValue("completedCount", completed);
    },
};
```

### 3. TodoApp.tsx - UI 컴포넌트

```tsx
import React, { useEffect } from "react";
import { useFormaState } from "@ehfuse/forma";
import { todoActions } from "./todoActions";
import { todoWatch } from "./todoWatch";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

function TodoApp() {
    const state = useFormaState(
        {
            todos: [] as Todo[],
            filter: "all" as "all" | "active" | "completed",
            newTodoText: "",
            lastSync: null as string | null,
            completedCount: 0,
        },
        {
            actions: todoActions,
            watch: todoWatch, // 🔥 Watch 시스템 활성화
        }
    );

    // 초기 로드만 useEffect 사용 (한 번만 실행)
    useEffect(() => {
        state.actions.loadFromStorage(state);
    }, []);

    // ✅ 개별 필드 구독 (수술적 리렌더링)
    const todoCount = state.useValue("todos.length");
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");
    const lastSync = state.useValue("lastSync");
    const completedCount = state.useValue("completedCount");

    // 필터링된 todos (연산은 컴포넌트에서)
    const filteredTodos = state.getValues().todos.filter((todo) => {
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return true;
    });

    return (
        <div>
            <h2>할 일 관리 ({todoCount}개)</h2>
            <p>
                완료: {completedCount}개 | 마지막 저장: {lastSync}
            </p>

            <div>
                <input
                    value={newTodoText}
                    onChange={(e) =>
                        state.setValue("newTodoText", e.target.value)
                    }
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            state.actions.addTodo(state, newTodoText);
                        }
                    }}
                    placeholder="새 할 일 입력"
                />
                <button
                    onClick={() => state.actions.addTodo(state, newTodoText)}
                >
                    추가
                </button>
            </div>

            <div>
                <button onClick={() => state.setValue("filter", "all")}>
                    전체
                </button>
                <button onClick={() => state.setValue("filter", "active")}>
                    진행중
                </button>
                <button onClick={() => state.setValue("filter", "completed")}>
                    완료
                </button>
                <button onClick={() => state.actions.clearCompleted(state)}>
                    완료 항목 삭제
                </button>
            </div>

            <ul>
                {filteredTodos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={() =>
                            state.actions.toggleTodo(state, todo.id)
                        }
                        onDelete={() =>
                            state.actions.deleteTodo(state, todo.id)
                        }
                    />
                ))}
            </ul>
        </div>
    );
}

// 개별 todo 아이템 컴포넌트
function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <li>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={onToggle}
            />
            <span
                style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                }}
            >
                {todo.text}
            </span>
            <button onClick={onDelete}>삭제</button>
        </li>
    );
}

export default TodoApp;
```

### 🎉 이 패턴의 이점

**1. useEffect 제거**

```tsx
// ❌ Before: useEffect 지옥
useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
}, [todos]);

useEffect(() => {
    const completed = todos.filter(t => t.completed).length;
    setCompletedCount(completed);
}, [todos]);

// ✅ After: 선언적 Watch
watch: {
    "todos": (ctx, value) => {
        ctx.actions.saveToStorage(ctx);
    },
    "todos.*.completed": (ctx) => {
        const completed = ctx.values.todos.filter(t => t.completed).length;
        ctx.setValue("completedCount", completed);
    }
}
```

**2. 완벽한 모듈화**

-   ✅ `todoActions.ts`: 비즈니스 로직 (순수 함수, 테스트 용이)
-   ✅ `todoWatch.ts`: 부수효과 (선언적, 명확한 의도)
-   ✅ `TodoApp.tsx`: UI만 담당 (깔끔한 코드)

**3. 재사용성**

-   ✅ actions/watch를 다른 프로젝트에서도 재사용 가능
-   ✅ 단독 테스트 가능
-   ✅ 팀원들이 로직 위치를 명확히 알 수 있음

**4. 성능**

-   ✅ 개별 필드 구독으로 불필요한 리렌더링 제거
-   ✅ `todos.length` 구독으로 길이 변경 시에만 카운트 업데이트
-   ✅ Watch는 실제 값이 변경될 때만 실행

---

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
    // ✅ 배열 길이만 구독 - 항목 추가/삭제 시에만 리렌더링
    const todosLength = state.useValue("todos.length");

    return (
        <ul>
            {Array.from({ length: todosLength }, (_, index) => {
                const todo = state.getValue(`todos.${index}`);

                // 필터링 조건 체크
                if (filter === "active" && todo.completed) return null;
                if (filter === "completed" && !todo.completed) return null;

                return (
                    <TodoItem
                        key={todo.id}
                        index={index}
                        state={state}
                        onToggle={onToggle}
                    />
                );
            })}
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

---

## 🎯 고급 패턴: 커링(Currying)을 통한 의존성 주입

Actions를 더 유연하게 만들기 위해 **커링 패턴**을 사용할 수 있습니다. 이 방식은 외부 API, 다이얼로그 핸들러, 설정값 등을 Actions에 주입할 때 유용합니다.

### 언제 사용하나?

-   ✅ API 함수를 Actions에 주입해야 할 때
-   ✅ 여러 컴포넌트가 다른 설정으로 같은 Actions를 사용할 때
-   ✅ 다이얼로그, 토스트 등 외부 핸들러를 Actions에 전달할 때
-   ✅ 테스트 시 mock 데이터를 쉽게 주입하고 싶을 때

### 예제: API 의존성이 있는 Auth Actions

#### 1. Actions 정의 (커링 방식)

```tsx
// authActions.ts
import { ActionContext } from "@ehfuse/forma";

interface LoginState {
    username: string;
    password: string;
    isLoggedIn: boolean;
    loading: boolean;
    error: string | null;
}

// 🔥 커링 패턴: API와 콜백을 먼저 받고, ActionContext는 나중에 받음
export const AuthActions = {
    // API 함수를 주입받는 커링 함수
    checkLoginStatus:
        (checkLoginStatusAPI: () => Promise<{ isLoggedIn: boolean }>) =>
        async (context: ActionContext<LoginState>): Promise<void> => {
            context.setValue("loading", true);

            try {
                const result = await checkLoginStatusAPI();
                context.setValue("isLoggedIn", result.isLoggedIn);
            } catch (error) {
                context.setValue(
                    "error",
                    "로그인 상태 확인 실패: " + error.message
                );
            } finally {
                context.setValue("loading", false);
            }
        },

    // 여러 의존성을 받는 커링 함수
    login:
        (
            loginAPI: (
                username: string,
                password: string
            ) => Promise<{ success: boolean }>,
            setShowPasswordChangeDialog: (show: boolean) => void
        ) =>
        async (context: ActionContext<LoginState>): Promise<void> => {
            const { username, password } = context.values;

            if (!username || !password) {
                context.setValue("error", "아이디와 비밀번호를 입력하세요");
                return;
            }

            context.setValue("loading", true);
            context.setValue("error", null);

            try {
                const result = await loginAPI(username, password);

                if (result.success) {
                    context.setValue("isLoggedIn", true);
                    // 외부에서 주입받은 다이얼로그 핸들러 사용
                    setShowPasswordChangeDialog(true);
                } else {
                    context.setValue("error", "로그인 실패");
                }
            } catch (error) {
                context.setValue("error", "로그인 오류: " + error.message);
            } finally {
                context.setValue("loading", false);
            }
        },

    // 파라미터 없는 간단한 action
    logout:
        (logoutAPI: () => Promise<void>) =>
        async (context: ActionContext<LoginState>): Promise<void> => {
            context.setValue("loading", true);

            try {
                await logoutAPI();
                context.setValue("isLoggedIn", false);
                context.setValue("username", "");
                context.setValue("password", "");
            } catch (error) {
                context.setValue("error", "로그아웃 실패: " + error.message);
            } finally {
                context.setValue("loading", false);
            }
        },

    // 파라미터를 받는 커링 함수 (인증 토큰 등)
    updateUserInfo:
        () =>
        async (
            context: ActionContext<LoginState>,
            newUsername: string
        ): Promise<void> => {
            context.setValue("username", newUsername);
            console.log("사용자 정보 업데이트:", newUsername);
        },
};
```

#### 2. 컴포넌트에서 사용

```tsx
// LoginForm.tsx
import React, { useState } from "react";
import { useForm } from "@ehfuse/forma";
import { AuthActions } from "./authActions";

// 🔧 실제 API 함수들 (또는 mock)
const api = {
    checkLoginStatus: async () => {
        // 실제 API 호출
        const response = await fetch("/api/auth/status");
        return response.json();
    },

    login: async (username: string, password: string) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        return response.json();
    },

    logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
    },
};

function LoginForm() {
    const [showPasswordChangeDialog, setShowPasswordChangeDialog] =
        useState(false);

    const form = useForm<LoginState>({
        initialValues: {
            username: "",
            password: "",
            isLoggedIn: false,
            loading: false,
            error: null,
        },
        // 🔥 커링 패턴으로 의존성 주입!
        actions: {
            checkLoginStatus: AuthActions.checkLoginStatus(
                api.checkLoginStatus
            ),
            login: AuthActions.login(api.login, setShowPasswordChangeDialog),
            logout: AuthActions.logout(api.logout),
            updateUserInfo: AuthActions.updateUserInfo(),
        },
    });

    const isLoggedIn = form.useFormValue("isLoggedIn");
    const loading = form.useFormValue("loading");
    const error = form.useFormValue("error");

    React.useEffect(() => {
        form.actions.checkLoginStatus();
    }, []);

    if (isLoggedIn) {
        return (
            <div>
                <h2>로그인 성공!</h2>
                <button onClick={form.actions.logout}>로그아웃</button>
                <button
                    onClick={() => form.actions.updateUserInfo("새로운이름")}
                >
                    사용자명 변경
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <h2>로그인</h2>

            {error && <div style={{ color: "red" }}>{error}</div>}

            <input
                name="username"
                placeholder="아이디"
                onChange={form.handleFormChange}
                disabled={loading}
            />

            <input
                name="password"
                type="password"
                placeholder="비밀번호"
                onChange={form.handleFormChange}
                disabled={loading}
            />

            <button onClick={() => form.actions.login()} disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
            </button>

            {showPasswordChangeDialog && <div>비밀번호 변경 다이얼로그</div>}
        </form>
    );
}

export default LoginForm;
```

### 커링 패턴의 장점

**1. 의존성 분리**

```tsx
// ❌ 일반 방식: API가 Actions에 하드코딩됨
const actions = {
    login: async (ctx) => {
        const result = await fetch("/api/login"); // 하드코딩!
    },
};

// ✅ 커링 방식: API를 외부에서 주입
const actions = {
    login: AuthActions.login(api.login, setDialog), // 주입!
};
```

**2. 테스트 용이성**

```tsx
// 테스트에서 mock API를 쉽게 주입
const mockApi = {
    login: jest.fn().mockResolvedValue({ success: true }),
    logout: jest.fn().mockResolvedValue(undefined),
};

const form = useForm({
    initialValues: testData,
    actions: {
        login: AuthActions.login(mockApi.login, mockSetDialog),
        logout: AuthActions.logout(mockApi.logout),
    },
});

// Actions를 실행하고 mock이 호출되었는지 검증
await form.actions.login();
expect(mockApi.login).toHaveBeenCalledWith("user", "pass");
```

**3. 재사용성**

```tsx
// 같은 Actions를 다른 API 구현체로 사용 가능
const devActions = {
    login: AuthActions.login(devApi.login, devSetDialog),
};

const prodActions = {
    login: AuthActions.login(prodApi.login, prodSetDialog),
};
```

**4. 타입 안정성**

```tsx
// TypeScript가 주입된 함수의 시그니처를 체크
AuthActions.login(
    api.login, // (username: string, password: string) => Promise<{success: boolean}>
    setDialog // (show: boolean) => void
); // ✅ 타입 체크됨
```

### 일반 객체 vs 커링 패턴 비교

| 특징                   | 일반 객체 Actions        | 커링 패턴 Actions     |
| ---------------------- | ------------------------ | --------------------- |
| **의존성 주입**        | 어려움                   | 쉬움                  |
| **테스트**             | 컴포넌트 전체 테스트필요 | Actions만 테스트 가능 |
| **재사용성**           | 낮음                     | 높음                  |
| **타입 안정성**        | 보통                     | 강력함                |
| **학습 곡선**          | 낮음                     | 중간                  |
| **적합한 경우**        | 간단한 로직              | API 호출, 복잡한 로직 |
| **코드 가독성**        | 높음                     | 중간                  |
| **설정 복잡도**        | 낮음                     | 중간                  |
| **의존성 변경 용이성** | 어려움                   | 쉬움                  |

### 언제 커링 패턴을 사용할까?

**커링 패턴을 사용하세요:**

-   ✅ API 함수가 필요한 Actions
-   ✅ 외부 핸들러(다이얼로그, 토스트 등)가 필요한 경우
-   ✅ 환경별로 다른 구현체가 필요한 경우 (dev/prod)
-   ✅ 단위 테스트가 중요한 경우
-   ✅ Actions를 라이브러리처럼 재사용하고 싶은 경우

**일반 객체를 사용하세요:**

-   ✅ 외부 의존성이 없는 순수한 상태 조작
-   ✅ 간단한 계산/변환 로직
-   ✅ 빠른 프로토타이핑
-   ✅ 팀이 커링 패턴에 익숙하지 않은 경우

---

이 예제는 Forma의 핵심 철학인 "필요한 것만 구독하여 성능 최적화"와 "상황에 맞는 구조 선택"을 보여주는 대표적인 사례입니다.
