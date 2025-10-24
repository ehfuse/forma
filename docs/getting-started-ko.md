# 시작 가이드 (Getting Started)

Forma를 처음 사용하는 개발자를 위한 단계별 가이드입니다.

## 1단계: 설치 및 설정

### NPM 패키지 설치

```bash
npm install @ehfuse/forma
# 또는
yarn add @ehfuse/forma
```

### 기본 Import

```tsx
import {
    useForm,
    useFormaState,
    GlobalFormProvider,
    useGlobalForm,
} from "@ehfuse/forma";
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
                // 서버에 데이터 전송
                await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(values),
                });

                alert("가입이 완료되었습니다!");
                return true; // 성공
            } catch (error) {
                alert("가입 중 오류가 발생했습니다.");
                return false; // 실패
            }
        },
    });

    // **개별 필드 구독 (성능 최적화)**
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

## 3단계: 일반 상태 관리 (useFormaState)

폼이 아닌 일반적인 상태 관리에도 Forma의 **개별 필드 구독 기능**을 활용할 수 있습니다.

### useFormaState 선언 방법

```tsx
import { useFormaState } from "@/forma";

// 1. 타입 명시적 지정 (권장)
interface AppData {
    count: number;
    message: string;
}

const typedState = useFormaState<AppData>({
    count: 0,
    message: "Hello",
});

// 2. 기본 사용법 - 초기값과 함께
const state = useFormaState({
    user: { name: "", email: "" },
    settings: { theme: "light" },
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
        deepEquals: true, // 깊은 동등성 검사 활성화
    }
);
```

## 4단계: 배열 상태 관리와 길이 구독

Forma의 **핵심 기능** 중 하나는 배열의 길이만 구독하여 성능을 최적화하는 것입니다.

```tsx
const state = useFormaState({
    todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Learn Forma", completed: true },
    ],
});

// **🔥 핵심: 배열 길이만 구독 (항목 추가/삭제 시에만 리렌더링)**
const todoCount = state.useValue("todos.length");

// **개별 필드 구독**
const firstTodoText = state.useValue("todos.0.text");
const firstTodoCompleted = state.useValue("todos.0.completed");
```

**주요 특징:**

-   **`todos.length` 구독**: 항목 추가/삭제 시에만 카운터 업데이트
-   **`todos.${index}.field` 구독**: 특정 항목 변경 시 해당 컴포넌트만 리렌더링
-   **✅ todos 배열이 변경되면 todos.length 구독자에게 자동 알림!**
-   **✅ 배열 내용만 변경 (길이 동일) - todos.length에는 알림 안 감**

**📋 자세한 예제와 성능 최적화:**

-   [TodoApp 예제 - 배열 상태 관리](./examples/todoapp-example-ko.md)
-   [성능 최적화 가이드](./performance-guide-ko.md)
-   [성능 최적화 주의사항](./performance-warnings-ko.md)

## 5단계: 중첩 객체 상태 관리

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

## 6단계: 글로벌 폼 사용하기

여러 컴포넌트 간에 폼 상태를 공유해야 할 때 사용합니다. 주로 다단계 폼(multi-step form)이나 복잡한 폼에서 활용됩니다.

### 기본 설정

```tsx
// App.tsx - Provider로 감싸기
import { GlobalFormProvider } from "@/forma";

function App() {
    return (
        <GlobalFormProvider>
            <YourComponents />
        </GlobalFormProvider>
    );
}

// 컴포넌트에서 사용
interface UserForm {
    name: string;
    email: string;
}

function Step1() {
    const form = useGlobalForm<UserForm>({
        formId: "user-registration", // 고유 ID로 상태 공유
        initialValues: { name: "", email: "" },
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <div>
            <input
                value={name}
                onChange={(e) => form.setFormValue("name", e.target.value)}
                placeholder="이름"
            />
            <input
                value={email}
                onChange={(e) => form.setFormValue("email", e.target.value)}
                placeholder="이메일"
            />
        </div>
    );
}

// 다른 컴포넌트에서 동일한 폼 상태 공유
function Step2() {
    const form = useGlobalForm<UserForm>({
        formId: "user-registration", // 같은 ID로 Step1에서 등록한 폼 꺼내오기
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <div>
            <h2>확인 페이지</h2>
            <p>이름: {name}</p>
            <p>이메일: {email}</p>
            <button onClick={() => form.submit()}>제출하기</button>
        </div>
    );
}
```

### ⚠️ 중요: initialValues 동작

같은 `formId`를 사용할 때 **`initialValues`는 첫 번째 호출에서만 적용**됩니다.

```tsx
// 첫 번째 호출 - initialValues 적용됨
const form1 = useGlobalForm<UserForm>({
    formId: "user-registration",
    initialValues: { name: "", email: "" }, // ✅ 적용됨
});

// 두 번째 호출 - initialValues 무시됨
const form2 = useGlobalForm<UserForm>({
    formId: "user-registration",
    initialValues: { name: "james", email: "" }, // ❌ 무시됨 (스토어가 이미 생성됨)
});
```

**결과:**

-   `form1`과 `form2`는 **동일한 스토어**를 공유
-   `form2`의 `initialValues`는 무시됨
-   스토어의 데이터는 첫 번째 호출의 `initialValues`로 유지

**다른 초기값이 필요하면 다른 `formId`를 사용하세요:**

```tsx
const form1 = useGlobalForm<UserForm>({
    formId: "user-registration-1", // 다른 ID
    initialValues: { name: "", email: "" },
});

const form2 = useGlobalForm<UserForm>({
    formId: "user-registration-2", // 다른 ID
    initialValues: { name: "james", email: "" }, // ✅ 적용됨
});
```

### initialValues 변경하는 방법

이미 생성된 폼의 값을 초기화하려면 `setInitialFormValues()` 메서드를 사용하세요:

```tsx
const form = useGlobalForm<UserForm>({
    formId: "user-registration",
    initialValues: { name: "", email: "" },
});

// 나중에 폼 값을 다시 초기화
function resetFormValues() {
    form.setInitialFormValues({
        name: "john",
        email: "john@example.com",
    });
}

// 특정 필드만 업데이트
function updateName() {
    form.setFormValue("name", "jane");
}

// 여러 필드를 한 번에 업데이트
function updateMultiple() {
    form.setValues({
        name: "bob",
        email: "bob@example.com",
    });
}
```

**📋 자세한 글로벌 폼 예제:**

-   [다단계 폼 구현 가이드](./useGlobalForm-guide-ko.md)

## 7단계: 고급 기능

Forma는 다양한 UI 라이브러리와 호환됩니다. 여기서는 **Material-UI (MUI)** 컴포넌트를 활용한 예제들을 살펴보겠습니다.

> **� 참고**: 현재 MUI 컴포넌트와의 호환성이 검증되었으며, 다른 UI 라이브러리와의 호환성은 추가 테스트가 필요합니다.

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

## 관련 문서

-   **[API 레퍼런스](./API-ko.md)** - 모든 API 상세 설명
-   **[예제 모음](./examples-ko.md)** - 실용적인 사용 예제
-   **[성능 최적화 가이드](./performance-guide-ko.md)** - 성능 최적화 방법
-   **[성능 최적화 주의사항](./performance-warnings-ko.md)** - 안티패턴과 주의사항
-   **[마이그레이션 가이드](./migration-ko.md)** - 다른 라이브러리에서 이전
-   **[useGlobalForm 가이드](./useGlobalForm-guide-ko.md)** - 글로벌 폼 상태 관리
-   **[글로벌 훅 비교 가이드](./global-hooks-comparison-ko.md)** - 글로벌 훅들의 차이점
-   **[라이브러리 비교 가이드](./library-comparison-ko.md)** - 다른 상태 관리 라이브러리와의 비교
