# 시작 가이드 (Getting Started)

Forma를 처음 사용하는 개발자를 위한 단계별 가이드입니다.

## 1단계: 설치 및 설정

### 현재 프로젝트에서 사용

```tsx
// 현재는 로컬 프로젝트에서 사용
import { useForm, useGlobalForm, GlobalFormProvider } from "@/forma";
```

### 향후 NPM 패키지 설치 (준비 중)

```bash
npm install @ehfuse/forma
# 또는
yarn add @ehfuse/forma
```

## 2단계: 첫 번째 폼 만들기

### 기본 폼

```tsx
import React from "react";
import { TextField, Button } from "@mui/material";
import { useForm } from "@/forma";

interface UserForm {
    name: string;
    email: string;
}

function UserRegistration() {
    const form = useForm<UserForm>({
        initialValues: {
            name: "",
            email: "",
        },
        onSubmit: async (values) => {
            // 서버에 데이터 전송
            console.log("제출된 데이터:", values);
        },
    });

    // 개별 필드 구독 (성능 최적화)
    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <form onSubmit={form.submit}>
            <TextField
                name="name"
                label="이름"
                value={name}
                onChange={form.handleFormChange}
                fullWidth
                margin="normal"
            />

            <TextField
                name="email"
                label="이메일"
                type="email"
                value={email}
                onChange={form.handleFormChange}
                fullWidth
                margin="normal"
            />

            <Button
                type="submit"
                variant="contained"
                disabled={form.isSubmitting}
                fullWidth
                sx={{ mt: 2 }}
            >
                {form.isSubmitting ? "제출 중..." : "가입하기"}
            </Button>
        </form>
    );
}
```

## 2.5단계: 일반 상태 관리 (useFormaState)

폼이 아닌 일반적인 상태 관리에도 Forma의 개별 필드 구독 기능을 활용할 수 있습니다.

### useFormaState 선언 방법

```tsx
import { useFormaState } from "@/forma";

// 1. 기본 사용법 - 초기값과 함께
const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light" },
});

// 2. 타입 명시적 지정
interface AppData {
    count: number;
    message: string;
}

const typedState = useFormaState<AppData>({
    count: 0,
    message: "Hello",
});

// 3. 빈 객체로 시작 (동적 필드 추가)
const dynamicState = useFormaState<Record<string, any>>();

// 4. 옵션과 함께 사용
const stateWithOptions = useFormaState(
    {
        data: {},
    },
    {
        onChange: (values) => console.log("상태 변경:", values),
        debounceMs: 300,
    }
);
```

### 새로운 API 메서드 활용

```tsx
function StateManager() {
    const state = useFormaState<Record<string, any>>({});

    // 필드 동적 관리
    const addField = (name: string, value: any) => {
        state.setValue(name, value);
    };

    const removeField = (name: string) => {
        if (state.hasField(name)) {
            state.removeField(name);
        }
    };

    // 상태 변경 구독
    React.useEffect(() => {
        const unsubscribe = state.subscribe((values) => {
            console.log("전체 상태 변경:", values);
        });
        return unsubscribe;
    }, [state]);

    return (
        <div>
            <button onClick={() => addField("newField", "초기값")}>
                필드 추가
            </button>
            <button onClick={() => removeField("newField")}>필드 제거</button>

            {state.hasField("newField") && (
                <input
                    value={state.useValue("newField")}
                    onChange={(e) => state.setValue("newField", e.target.value)}
                />
            )}

            <button onClick={() => state.reset()}>초기값으로 리셋</button>
        </div>
    );
}
```

### 배열 상태 관리와 길이 구독

````tsx
import React from "react";
import { useFormaState } from "@/forma";

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

    // 🔥 핵심: 배열 길이만 구독 (항목 추가/삭제 시에만 리렌더링)
    const todoCount = state.useValue("todos.length");

    // 개별 필드 구독
    const newTodoText = state.useValue("newTodoText");
    const filter = state.useValue("filter");

    const addTodo = () => {
        if (!newTodoText.trim()) return;

        const todos = state.getValues().todos;
        state.setValue("todos", [
            ...todos,
            { id: Date.now(), text: newTodoText, completed: false }
        ]);
        // ✅ todos 배열이 변경되면 todos.length 구독자에게 자동 알림!

        state.setValue("newTodoText", "");
    };

    const toggleTodo = (index: number) => {
        const todo = state.getValue(`todos.${index}`);
        state.setValue(`todos.${index}.completed`, !todo.completed);
        // ✅ 배열 내용만 변경 (길이 동일) - todos.length에는 알림 안 감
    };

    return (
        <div>
            <h2>할 일 관리 ({todoCount}개)</h2>

            <div>
                <input
                    value={newTodoText}
                    onChange={(e) => state.setValue("newTodoText", e.target.value)}
                    placeholder="새 할 일 입력"
                />
                <button onClick={addTodo}>추가</button>
            </div>

            <div>
                <label>
                    <input
                        type="radio"
                        checked={filter === "all"}
                        onChange={() => state.setValue("filter", "all")}
                    />
                    전체
                </label>
                <label>
                    <input
                        type="radio"
                        checked={filter === "active"}
                        onChange={() => state.setValue("filter", "active")}
                    />
                    진행 중
                </label>
                <label>
                    <input
                        type="radio"
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
function TodoList({ state, filter, onToggle }) {
    const todos = state.getValues().todos;

    return (
        <ul>
            {todos
                .filter(todo => {
                    if (filter === "active") return !todo.completed;
                    if (filter === "completed") return todo.completed;
                    return true;
                })
                .map((todo, index) => (
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

// 개별 할 일 항목 컴포넌트 (해당 항목 변경 시에만 리렌더링)
function TodoItem({ index, state, onToggle }) {
    // 개별 필드만 구독하여 성능 최적화
    const text = state.useValue(`todos.${index}.text`);
    const completed = state.useValue(`todos.${index}.completed`);

    return (
        <li>
            <input
                type="checkbox"
                checked={completed}
                onChange={() => onToggle(index)}
            />
            <span style={{
                textDecoration: completed ? "line-through" : "none"
            }}>
                {text}
            </span>
        </li>
    );
}

```tsx
import React from "react";
import {
    Button,
    List,
    ListItem,
    ListItemText,
    TextField,
    Checkbox,
} from "@mui/material";
import { useFormaState } from "@/forma";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

interface AppState {
    todos: Todo[];
    filter: "all" | "active" | "completed";
    newTodoText: string;
}

// 개별 할 일 항목 컴포넌트 (성능 최적화)
function TodoItem({ index }: { index: number }) {
    const state = useFormaState<AppState>({
        /* 외부에서 주입 */
    });

    // 개별 필드만 구독 (dot notation 활용)
    const text = state.useValue(`todos.${index}.text`);
    const completed = state.useValue(`todos.${index}.completed`);
    const filter = state.useValue("filter");

    const toggleTodo = () => {
        state.setValue(`todos.${index}.completed`, !completed);
    };

    // 필터링 조건 확인 (렌더링 여부 결정)
    const shouldShow = () => {
        if (filter === "active") return !completed;
        if (filter === "completed") return completed;
        return true; // "all"
    };

    // 필터 조건에 맞지 않으면 렌더링하지 않음
    if (!shouldShow()) return null;

    return (
        <ListItem>
            <Checkbox checked={completed} onChange={toggleTodo} />
            <ListItemText
                primary={text}
                style={{ textDecoration: completed ? "line-through" : "none" }}
            />
        </ListItem>
    );
}

function TodoApp() {
    const state = useFormaState<AppState>({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Learn Forma", completed: true },
        ],
        filter: "all",
        newTodoText: "",
    });

    // 개별 필드 구독 - 최적화된 방식
    const filter = state.useValue("filter");
    const newTodoText = state.useValue("newTodoText");
    const todosLength = state.useValue("todos.length");

    const addTodo = () => {
        if (!newTodoText.trim()) return;

        // getValues()는 구독이 아닌 일회성 값 조회이므로 괜찮음
        const currentTodos = state.getValues().todos;
        state.setValue("todos", [
            ...currentTodos,
            { id: Date.now(), text: newTodoText, completed: false },
        ]);
        state.setValue("newTodoText", "");
    };

    // ✅ 개별 인덱스로 렌더링 (성능 최적화)
    const renderTodoItems = () => {
        const items = [];
        for (let i = 0; i < todosLength; i++) {
            items.push(<TodoItem key={i} index={i} />);
        }
        return items;
    };

    return (
        <div>
            <TextField
                value={newTodoText}
                onChange={(e) => state.setValue("newTodoText", e.target.value)}
                placeholder="새 할 일 입력..."
                onKeyPress={(e) => e.key === "Enter" && addTodo()}
            />
            <Button onClick={addTodo}>추가</Button>

            <div>
                <Button onClick={() => state.setValue("filter", "all")}>
                    전체
                </Button>
                <Button onClick={() => state.setValue("filter", "active")}>
                    활성
                </Button>
                <Button onClick={() => state.setValue("filter", "completed")}>
                    완료
                </Button>
                <span>현재 필터: {filter}</span>
            </div>

            <List>{renderTodoItems()}</List>

            <p>총 할 일 개수: {todosLength}</p>
        </div>
    );
}
````

### 중첩 객체 상태 관리

```tsx
import { useFormaState } from "@/forma";

interface UserProfile {
    personal: {
        name: string;
        email: string;
    };
    settings: {
        theme: "light" | "dark";
        notifications: boolean;
    };
}

function ProfileSettings() {
    const state = useFormaState<UserProfile>({
        personal: { name: "", email: "" },
        settings: { theme: "light", notifications: true },
    });

    // Dot notation으로 중첩 필드에 개별 구독
    const name = state.useValue("personal.name");
    const theme = state.useValue("settings.theme");
    const notifications = state.useValue("settings.notifications");

    return (
        <div>
            <input
                value={name}
                onChange={(e) =>
                    state.setValue("personal.name", e.target.value)
                }
                placeholder="이름"
            />

            <button
                onClick={() =>
                    state.setValue(
                        "settings.theme",
                        theme === "light" ? "dark" : "light"
                    )
                }
            >
                테마: {theme}
            </button>

            <label>
                <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) =>
                        state.setValue(
                            "settings.notifications",
                            e.target.checked
                        )
                    }
                />
                알림 받기
            </label>
        </div>
    );
}
```

## 3단계: 폼 검증 추가

```tsx
const form = useForm<UserForm>({
    initialValues: {
        name: "",
        email: "",
    },
    onValidate: async (values) => {
        // 이름 검증
        if (!values.name.trim()) {
            alert("이름을 입력해주세요.");
            return false;
        }

        // 이메일 검증
        if (!values.email.includes("@")) {
            alert("올바른 이메일 주소를 입력해주세요.");
            return false;
        }

        return true; // 검증 통과
    },
    onSubmit: async (values) => {
        try {
            await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            alert("가입이 완료되었습니다!");
            form.resetForm(); // 폼 초기화
        } catch (error) {
            alert("가입 중 오류가 발생했습니다.");
        }
    },
});
```

## 4단계: 중첩 객체 다루기

```tsx
interface DetailedUserForm {
    personal: {
        name: string;
        age: number;
    };
    contact: {
        email: string;
        phone: string;
        address: {
            city: string;
            zipCode: string;
        };
    };
}

function DetailedForm() {
    const form = useForm<DetailedUserForm>({
        initialValues: {
            personal: { name: "", age: 0 },
            contact: {
                email: "",
                phone: "",
                address: { city: "", zipCode: "" },
            },
        },
    });

    // Dot notation으로 중첩 객체 접근
    const name = form.useFormValue("personal.name");
    const email = form.useFormValue("contact.email");
    const city = form.useFormValue("contact.address.city");

    return (
        <form onSubmit={form.submit}>
            <TextField
                name="personal.name"
                label="이름"
                value={name}
                onChange={form.handleFormChange}
            />

            <TextField
                name="contact.email"
                label="이메일"
                value={email}
                onChange={form.handleFormChange}
            />

            <TextField
                name="contact.address.city"
                label="도시"
                value={city}
                onChange={form.handleFormChange}
            />
        </form>
    );
}
```

## 5단계: 글로벌 폼 사용하기

### Provider 설정

```tsx
// App.tsx
import { GlobalFormProvider } from "@/forma";

function App() {
    return (
        <GlobalFormProvider>
            <Router>
                <Routes>
                    <Route path="/step1" element={<Step1 />} />
                    <Route path="/step2" element={<Step2 />} />
                    <Route path="/review" element={<ReviewStep />} />
                </Routes>
            </Router>
        </GlobalFormProvider>
    );
}
```

### 다단계 폼 구현

```tsx
// Step1.tsx
function Step1() {
    const form = useGlobalForm({
        formId: "user-registration", // 공유할 폼 ID
        initialValues: {
            personal: { name: "", email: "" },
            preferences: { newsletter: false },
        },
    });

    const name = form.useFormValue("personal.name");
    const email = form.useFormValue("personal.email");

    return (
        <div>
            <h2>1단계: 기본 정보</h2>
            <TextField
                name="personal.name"
                value={name}
                onChange={form.handleFormChange}
            />
            <TextField
                name="personal.email"
                value={email}
                onChange={form.handleFormChange}
            />
            <Button onClick={() => navigate("/step2")}>다음 단계</Button>
        </div>
    );
}

// Step2.tsx
function Step2() {
    const form = useGlobalForm({
        formId: "user-registration", // 같은 폼 ID로 상태 공유
        initialValues: {
            personal: { name: "", email: "" },
            preferences: { newsletter: false },
        },
    });

    const newsletter = form.useFormValue("preferences.newsletter");

    return (
        <div>
            <h2>2단계: 선택사항</h2>
            <FormControlLabel
                control={
                    <Checkbox
                        name="preferences.newsletter"
                        checked={newsletter}
                        onChange={form.handleFormChange}
                    />
                }
                label="뉴스레터 구독"
            />
            <Button onClick={() => navigate("/review")}>검토하기</Button>
        </div>
    );
}

// ReviewStep.tsx
function ReviewStep() {
    const form = useGlobalForm({
        formId: "user-registration", // 같은 상태 조회
        initialValues: {
            personal: { name: "", email: "" },
            preferences: { newsletter: false },
        },
        onSubmit: async (values) => {
            await submitRegistration(values);
        },
    });

    const name = form.useFormValue("personal.name");
    const email = form.useFormValue("personal.email");
    const newsletter = form.useFormValue("preferences.newsletter");

    return (
        <div>
            <h2>검토 및 제출</h2>
            <p>이름: {name}</p>
            <p>이메일: {email}</p>
            <p>뉴스레터: {newsletter ? "구독" : "구독안함"}</p>

            <Button onClick={form.submit} variant="contained">
                가입 완료
            </Button>
        </div>
    );
}
```

## 6단계: 고급 기능

### DatePicker 사용

```tsx
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function FormWithDate() {
    const form = useForm({
        initialValues: { birthDate: "" },
    });

    const birthDate = form.useFormValue("birthDate");

    return (
        <DatePicker
            label="생년월일"
            value={birthDate}
            onChange={form.handleDatePickerChange("birthDate")}
        />
    );
}
```

### Select 사용

```tsx
import { Select, MenuItem } from "@mui/material";

function FormWithSelect() {
    const form = useForm({
        initialValues: { category: "" },
    });

    const category = form.useFormValue("category");

    return (
        <Select
            name="category"
            value={category}
            onChange={form.handleFormChange}
        >
            <MenuItem value="A">카테고리 A</MenuItem>
            <MenuItem value="B">카테고리 B</MenuItem>
            <MenuItem value="C">카테고리 C</MenuItem>
        </Select>
    );
}
```

## 🎯 다음 단계

1. **[API 레퍼런스](./API.md)** - 모든 API 상세 설명
2. **[예제 코드](../examples/)** - 더 많은 실제 예제
3. **[문제 해결](./README.md#문제-해결)** - 자주 발생하는 문제들

## 💡 성능 팁

1. **개별 필드 구독 사용**

    ```tsx
    // ✅ 권장
    const name = form.useFormValue("name");

    // ❌ 비권장 (전체 리렌더링)
    const { name } = form.values;
    ```

2. **조건부 구독**

    ```tsx
    const conditionalValue = showField ? form.useFormValue("field") : "";
    ```

3. **메모이제이션 활용**
    ```tsx
    const expensiveValue = useMemo(() => {
        return calculateExpensiveValue(form.useFormValue("data"));
    }, [form.useFormValue("data")]);
    ```

이제 Forma를 사용할 준비가 모두 끝났습니다! 🎉
