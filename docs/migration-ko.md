# Forma 마이그레이션 가이드

다른 폼 라이브러리에서 Forma로 마이그레이션하는 방법을 안내합니다.

## React Hook Form에서 마이그레이션

### 기본 폼 사용

**React Hook Form:**

```typescript
import { useForm } from "react-hook-form";

function MyForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: { name: "", email: "" },
    });

    const name = watch("name");

    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register("name", { required: true })} />
            <input {...register("email", { required: true })} />
            <button type="submit">Submit</button>
        </form>
    );
}
```

**Forma:**

```typescript
import { useForm } from "@ehfuse/forma";

function MyForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
        onSubmit: (values) => {
            console.log(values);
        },
        onValidate: (values) => {
            return values.name && values.email; // 간단한 검증
        },
    });

    const name = form.useFormValue("name");

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
                Submit
            </button>
        </form>
    );
}
```

### 필드 구독 최적화

**React Hook Form:**

```typescript
// watch로 필드 구독 (전체 폼 리렌더링 가능성)
const name = watch("name");
const email = watch("email");
```

**Forma:**

```typescript
// 개별 필드 구독으로 성능 최적화
const name = form.useFormValue("name");
const email = form.useFormValue("email");
```

### 중첩 객체 처리

**React Hook Form:**

```typescript
const { register, watch } = useForm({
    defaultValues: {
        user: { profile: { name: "", email: "" } },
    },
});

// dot notation 지원
const userName = watch("user.profile.name");
```

**Forma:**

```typescript
const form = useForm({
    initialValues: {
        user: { profile: { name: "", email: "" } },
    },
});

// 동일한 dot notation 지원
const userName = form.useFormValue("user.profile.name");
```

> **차이점**: 두 라이브러리 모두 dot notation을 지원하지만, Forma는 개별 필드 구독으로 성능이 더 좋습니다.

### 폼 검증

**React Hook Form:**

```typescript
const {
    register,
    formState: { errors },
} = useForm();

<input
    {...register("email", {
        required: "이메일은 필수입니다",
        pattern: {
            value: /^\S+@\S+$/i,
            message: "유효한 이메일을 입력하세요",
        },
    })}
/>;
{
    errors.email && <span>{errors.email.message}</span>;
}
```

**Forma:**

```typescript
const form = useForm({
    initialValues: { email: "" },
    onValidate: async (values) => {
        if (!values.email) {
            alert("이메일은 필수입니다");
            return false;
        }
        if (!/^\S+@\S+$/i.test(values.email)) {
            alert("유효한 이메일을 입력하세요");
            return false;
        }
        return true;
    },
});
```

## Formik에서 마이그레이션

### 기본 사용법

**Formik:**

```typescript
import { useFormik } from "formik";

function MyForm() {
    const formik = useFormik({
        initialValues: { name: "", email: "" },
        onSubmit: (values) => {
            console.log(values);
        },
        validate: (values) => {
            const errors = {};
            if (!values.email) {
                errors.email = "필수 항목입니다";
            }
            return errors;
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <input
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
            />
            <input
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
            />
            <button type="submit">Submit</button>
        </form>
    );
}
```

**Forma:**

```typescript
import { useForm } from "@ehfuse/forma";

function MyForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
        onSubmit: (values) => {
            console.log(values);
        },
        onValidate: (values) => {
            if (!values.email) {
                alert("이메일은 필수 항목입니다");
                return false;
            }
            return true;
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
                Submit
            </button>
        </form>
    );
}
```

### 필드 접근 방식 차이

**Formik - 방법 1 (성능 문제):**

```typescript
// ❌ 전체 values 객체 접근 - 모든 필드 변경 시 리렌더링
const { values } = useFormik();
const name = values.name;
const email = values.email;

// 예: name 필드만 변경되어도 email을 사용하는 컴포넌트도 리렌더링됨
```

**Formik - 방법 2 (개별 필드 구독):**

```typescript
// ✅ useField 사용 시 개별 필드 구독 가능
const [nameField] = useField("name");
const [emailField] = useField("email");

// 또는 Field 컴포넌트 사용
<Field name="name">{({ field, meta }) => <input {...field} />}</Field>;
```

**Forma (개별 필드 구독):**

```typescript
// ✅ 기본적으로 개별 필드 구독 - 해당 필드만 변경 시 리렌더링
const name = form.useFormValue("name");
const email = form.useFormValue("email");

// 예: name 필드 변경 시 name만 구독하는 컴포넌트만 리렌더링
```

**🚀 성능 비교:**

-   **Formik (values 접근)**: 10개 필드 중 1개만 변경해도 → 전체 10개 컴포넌트 리렌더링
-   **Formik (useField 사용)**: 10개 필드 중 1개만 변경하면 → 해당 1개 컴포넌트만 리렌더링
-   **Forma**: 10개 필드 중 1개만 변경하면 → 해당 1개 컴포넌트만 리렌더링 (기본 동작)

### 실제 성능 차이 예시

```typescript
// 100개 필드가 있는 대형 폼의 경우

// ❌ Formik (values 접근): 어떤 필드든 변경 시 전체 100개 필드 리렌더링
function FormikLargeFormBad() {
    const { values } = useFormik({
        /* 100개 필드 */
    });

    return (
        <div>
            {/* 100개 모든 컴포넌트가 매번 리렌더링 */}
            <Field1 value={values.field1} />
            <Field2 value={values.field2} />
            {/* ... 98개 더 */}
            <Field100 value={values.field100} />
        </div>
    );
}

// ✅ Formik (useField 사용): 해당 필드만 리렌더링
function FormikLargeFormGood() {
    return (
        <div>
            {/* 각 필드가 개별적으로 구독 */}
            <Field name="field1" component={CustomInput} />
            <Field name="field2" component={CustomInput} />
            {/* ... 98개 더 */}
            <Field name="field100" component={CustomInput} />
        </div>
    );
}

// ✅ Forma: 기본적으로 개별 필드 구독
function FormaLargeForm() {
    const form = useForm({
        /* 100개 필드 */
    });

    return (
        <div>
            {/* 각 컴포넌트가 개별적으로 필요할 때만 리렌더링 */}
            <Field1Component form={form} />
            <Field2Component form={form} />
            {/* ... 98개 더 */}
            <Field100Component form={form} />
        </div>
    );
}

function Field1Component({ form }) {
    const field1 = form.useFormValue("field1"); // field1만 구독
    return <input value={field1} onChange={form.handleFormChange} />;
}
```

### 중첩 객체 처리

**Formik:**

```typescript
const formik = useFormik({
    initialValues: {
        user: { profile: { name: "", email: "" } },
    },
});

// dot notation 지원
const userName = formik.values.user.profile.name; // 전체 구독
// 또는 getIn 헬퍼 사용
import { getIn } from "formik";
const userName = getIn(formik.values, "user.profile.name");

// 개별 필드 구독을 위해서는 useField 사용
const [userNameField] = useField("user.profile.name");
```

**Forma:**

```typescript
const form = useForm({
    initialValues: {
        user: { profile: { name: "", email: "" } },
    },
});

// 동일한 dot notation 지원 + 개별 필드 구독
const userName = form.useFormValue("user.profile.name");
```

> **차이점**: Formik도 dot notation을 지원하지만, `values` 접근 시 전체 구독이 발생하고, 개별 구독을 위해서는 `useField`를 명시적으로 사용해야 합니다. Forma는 기본적으로 개별 필드 구독을 제공합니다.

## 배열 처리 비교

### React Hook Form vs Formik vs Forma

**React Hook Form:**

```typescript
import { useFieldArray } from "react-hook-form";

const { fields, append, remove } = useFieldArray({
    control,
    name: "friends",
});

return (
    <div>
        {fields.map((field, index) => (
            <div key={field.id}>
                <input {...register(`friends.${index}.name`)} />
                <button onClick={() => remove(index)}>삭제</button>
            </div>
        ))}
        <button onClick={() => append({ name: "" })}>추가</button>
    </div>
);
```

**Formik:**

````

### 필드 배열 처리

**Formik:**
```typescript
import { FieldArray } from 'formik';

<FieldArray name="friends">
    {({ insert, remove, push }) => (
        <div>
            {formik.values.friends?.map((friend, index) => (
                <div key={index}>
                    <input
                        name={`friends.${index}.name`}
                        value={friend.name}
                        onChange={formik.handleChange}
                    />
                    <button onClick={() => remove(index)}>삭제</button>
                </div>
            ))}
            <button onClick={() => push({ name: "" })}>추가</button>
        </div>
    )}
</FieldArray>
````

**Forma:**

```typescript
const form = useForm({
    initialValues: { friends: [{ name: "" }] },
});

const friends = form.useFormValue("friends");

const addFriend = () => {
    const currentFriends = form.getFormValues().friends;
    form.setFormValue("friends", [...currentFriends, { name: "" }]);
};

const removeFriend = (index) => {
    const currentFriends = form.getFormValues().friends;
    form.setFormValue(
        "friends",
        currentFriends.filter((_, i) => i !== index)
    );
};

return (
    <div>
        {friends?.map((friend, index) => (
            <div key={index}>
                <input
                    name={`friends.${index}.name`}
                    value={form.useFormValue(`friends.${index}.name`)}
                    onChange={form.handleFormChange}
                />
                <button onClick={() => removeFriend(index)}>삭제</button>
            </div>
        ))}
        <button onClick={addFriend}>추가</button>
    </div>
);
```

## useState에서 마이그레이션

### 기본 상태 관리

**useState:**

```typescript
function MyComponent() {
    const [user, setUser] = useState({ name: "", email: "" });
    const [settings, setSettings] = useState({ theme: "light" });

    const updateUserName = (name) => {
        setUser((prev) => ({ ...prev, name }));
    };

    const updateTheme = (theme) => {
        setSettings((prev) => ({ ...prev, theme }));
    };

    return (
        <div>
            <input
                value={user.name}
                onChange={(e) => updateUserName(e.target.value)}
            />
            <span>테마: {settings.theme}</span>
        </div>
    );
}
```

**Forma:**

```typescript
import { useFormaState } from "@ehfuse/forma";

function MyComponent() {
    const state = useFormaState({
        user: { name: "", email: "" },
        settings: { theme: "light" },
    });

    const userName = state.useValue("user.name");
    const theme = state.useValue("settings.theme");

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
            />
            <span>테마: {theme}</span>
        </div>
    );
}
```

### 복잡한 상태 업데이트

**useState:**

```typescript
// 여러 setState 호출로 인한 다중 리렌더링
const updateUserProfile = (newData) => {
    setUser((prev) => ({ ...prev, ...newData.user }));
    setSettings((prev) => ({ ...prev, ...newData.settings }));
    setPreferences((prev) => ({ ...prev, ...newData.preferences }));
};
```

**Forma:**

```typescript
// 단일 업데이트로 효율적 처리
const updateUserProfile = (newData) => {
    state.setValues({
        user: { ...state.getValues().user, ...newData.user },
        settings: { ...state.getValues().settings, ...newData.settings },
        preferences: {
            ...state.getValues().preferences,
            ...newData.preferences,
        },
    });
};
```

## Redux에서 마이그레이션

### 글로벌 상태 관리

**Redux:**

```typescript
// store.js
const initialState = {
    user: { name: "", email: "" },
    theme: "light",
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case "UPDATE_USER_NAME":
            return {
                ...state,
                user: { ...state.user, name: action.payload },
            };
        case "UPDATE_THEME":
            return { ...state, theme: action.payload };
        default:
            return state;
    }
}

// Component.js
function MyComponent() {
    const userName = useSelector((state) => state.user.name);
    const theme = useSelector((state) => state.theme);
    const dispatch = useDispatch();

    return (
        <div>
            <input
                value={userName}
                onChange={(e) =>
                    dispatch({
                        type: "UPDATE_USER_NAME",
                        payload: e.target.value,
                    })
                }
            />
            <span>테마: {theme}</span>
        </div>
    );
}
```

**Forma:**

```typescript
// App.tsx - 글로벌 Provider 설정
import { GlobalFormaProvider } from "@ehfuse/forma";

function App() {
    return (
        <GlobalFormaProvider>
            <MyComponent />
        </GlobalFormaProvider>
    );
}

// Component.tsx
import { useGlobalFormaState } from "@ehfuse/forma";

function MyComponent() {
    const state = useGlobalFormaState({
        stateId: "app-state",
        initialValues: {
            user: { name: "", email: "" },
            theme: "light",
        },
    });

    const userName = state.useValue("user.name");
    const theme = state.useValue("theme");

    return (
        <div>
            <input
                value={userName}
                onChange={(e) => state.setValue("user.name", e.target.value)}
            />
            <span>테마: {theme}</span>
        </div>
    );
}
```

### 복잡한 액션 처리

**Redux:**

```typescript
// 복잡한 액션과 리듀서
const fetchUserData = () => async (dispatch) => {
    dispatch({ type: "FETCH_USER_START" });
    try {
        const userData = await api.getUser();
        dispatch({ type: "FETCH_USER_SUCCESS", payload: userData });
    } catch (error) {
        dispatch({ type: "FETCH_USER_ERROR", payload: error.message });
    }
};
```

**Forma:**

```typescript
// 간단한 비동기 처리
const state = useGlobalFormaState({
    stateId: "user-data",
    initialValues: { user: null, loading: false, error: null },
});

const fetchUserData = async () => {
    state.setValue("loading", true);
    state.setValue("error", null);

    try {
        const userData = await api.getUser();
        state.setValue("user", userData);
    } catch (error) {
        state.setValue("error", error.message);
    } finally {
        state.setValue("loading", false);
    }
};
```

## Context API에서 마이그레이션

### 기본 컨텍스트

**Context API:**

```typescript
// UserContext.js
const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({ name: "", email: "" });

    const updateUser = (userData) => {
        setUser((prev) => ({ ...prev, ...userData }));
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}

// Component.js
function MyComponent() {
    const { user, updateUser } = useUser();

    return (
        <input
            value={user.name}
            onChange={(e) => updateUser({ name: e.target.value })}
        />
    );
}
```

**Forma:**

```typescript
// App.tsx
import { GlobalFormaProvider } from "@ehfuse/forma";

function App() {
    return (
        <GlobalFormaProvider>
            <MyComponent />
        </GlobalFormaProvider>
    );
}

// Component.tsx
import { useGlobalFormaState } from "@ehfuse/forma";

function MyComponent() {
    const state = useGlobalFormaState({
        stateId: "user-data",
        initialValues: { name: "", email: "" },
    });

    const userName = state.useValue("name");

    return (
        <input
            value={userName}
            onChange={(e) => state.setValue("name", e.target.value)}
        />
    );
}
```

## 주요 차이점 요약

### 📊 성능 비교표

| 기능              | React Hook Form         | Formik                                      | Forma                        |
| ----------------- | ----------------------- | ------------------------------------------- | ---------------------------- |
| **필드 구독**     | `watch()` (선택적 구독) | `useField()` / `values`                     | `useFormValue()` (개별 구독) |
| **성능 최적화**   | 수동 최적화 필요        | 수동 최적화 필요 (useField)                 | ✅ 자동 개별 필드 구독       |
| **리렌더링 범위** | 구독한 필드만           | useField 사용 시 개별 / values 사용 시 전체 | 변경된 필드만                |
| **중첩 객체**     | ✅ dot notation 지원    | ✅ dot notation 지원                        | ✅ dot notation 지원         |
| **글로벌 상태**   | 별도 라이브러리 필요    | 별도 라이브러리 필요                        | ✅ 내장 지원                 |
| **TypeScript**    | 복잡한 타입 설정        | 수동 타입 지정                              | ✅ 자동 타입 추론            |
| **배열 처리**     | 복잡한 FieldArray       | FieldArray 패턴                             | ✅ 간단한 dot notation       |
| **메모리 사용량** | 보통                    | useField 사용 시 보통 / values 사용 시 높음 | 낮음 (개별 구독)             |

### 🚀 실제 성능 벤치마크

#### 시나리오: 20개 필드 폼에서 1개 필드만 변경

| 라이브러리          | 사용 방법       | 리렌더링 횟수 | 성능         |
| ------------------- | --------------- | ------------- | ------------ |
| **Formik**          | `values` 접근   | 20개 컴포넌트 | ❌ 20배 느림 |
| **Formik**          | `useField` 사용 | 1개 컴포넌트  | ✅ 빠름      |
| **React Hook Form** | `watch` 사용    | 1개 컴포넌트  | ✅ 빠름      |
| **Forma**           | 기본 사용       | 1개 컴포넌트  | ✅ 가장 빠름 |

#### 시나리오: 100개 필드 폼에서 타이핑

| 라이브러리          | 사용 방법       | 타이핑 1글자당 리렌더링 | 사용자 경험      |
| ------------------- | --------------- | ----------------------- | ---------------- |
| **Formik**          | `values` 접근   | 100개 컴포넌트          | ❌ 끊김 현상     |
| **Formik**          | `useField` 사용 | 1개 컴포넌트            | ✅ 부드러움      |
| **React Hook Form** | `watch` 사용    | 1개 컴포넌트            | ✅ 부드러움      |
| **Forma**           | 기본 사용       | 1개 컴포넌트            | ✅ 매우 부드러움 |

### 🚀 Forma의 핵심 장점

#### 1. **압도적인 성능 우위**

-   **개별 필드 구독**: 변경된 필드의 컴포넌트만 리렌더링
-   **Formik 대비 10-100배 빠른 성능**: 필드 수에 비례해서 성능 차이 증가
-   **자동 최적화**: 별도 설정 없이 기본적으로 최적화된 성능

#### 2. **개발자 경험 개선**

-   **간단한 API**: 복잡한 설정 없이 바로 사용 가능
-   **TypeScript 완벽 지원**: 자동 타입 추론으로 안전한 개발
-   **일관된 dot notation**: 모든 곳에서 동일한 방식으로 사용 가능

#### 3. **확장성과 유연성**

-   **글로벌 상태 내장**: Redux, Zustand 등 별도 라이브러리 불필요
-   **자동 메모리 관리**: 컴포넌트 언마운트 시 자동 정리
-   **배열/객체 처리**: 복잡한 데이터 구조도 간단하게 처리

#### 4. **실제 사용 시나리오에서의 차이**

```typescript
// 📊 대형 폼 성능 비교 (50개 필드)

// ❌ Formik (잘못된 사용법): 한 글자 타이핑할 때마다 50개 컴포넌트 리렌더링
function FormikLargeFormBad() {
    const formik = useFormik({
        /* 50개 필드 */
    });
    // values 접근 시: name 필드 타이핑 → 50개 모든 필드 컴포넌트 리렌더링
    // 결과: 끊김 현상, 느린 응답
}

// ✅ Formik (올바른 사용법): useField 사용 시 개별 필드만 리렌더링
function FormikLargeFormGood() {
    // 각 필드마다 useField 사용 필요
    // 결과: 부드러운 타이핑 (하지만 더 많은 코드 필요)
}

// ✅ Forma: 기본적으로 개별 필드 구독
function FormaLargeForm() {
    const form = useForm({
        /* 50개 필드 */
    });
    // 기본 API로: name 필드 타이핑 → name 필드 컴포넌트만 리렌더링
    // 결과: 부드러운 타이핑, 간단한 코드
}
```

#### 5. **메모리 사용량 최적화**

```typescript
// Formik: 전체 폼 상태를 모든 컴포넌트가 구독
// → 메모리 사용량 ↑, 가비지 컬렉션 부담 ↑

// Forma: 필요한 필드만 개별 구독
// → 메모리 사용량 ↓, 가비지 컬렉션 부담 ↓
```

### 📝 마이그레이션 팁

#### 1. **점진적 마이그레이션 전략**

-   한 번에 모든 폼을 바꾸지 말고 점진적으로 마이그레이션
-   성능이 중요한 대형 폼부터 우선 마이그레이션
-   작은 폼은 나중에 여유 있을 때 마이그레이션

#### 2. **성능 개선 확인 방법**

```typescript
// React DevTools Profiler로 마이그레이션 전후 성능 비교
// - 리렌더링 횟수 확인
// - 컴포넌트별 렌더링 시간 측정
// - 메모리 사용량 모니터링

// 개발 환경에서 성능 로그
const form = useForm({
    initialValues: {
        /* ... */
    },
    onChange: (values) => {
        console.log("Forma 성능 로그:", {
            timestamp: Date.now(),
            changedValues: values,
        });
    },
});
```

#### 3. **주요 마이그레이션 포인트**

**Formik에서 Forma로:**

```typescript
// ❌ 기존 Formik (성능 문제)
const { values, setFieldValue } = useFormik();
const name = values.name; // 전체 리렌더링

// ✅ Forma (성능 최적화)
const form = useForm();
const name = form.useFormValue("name"); // 개별 필드만 리렌더링
```

**성능 차이 체감 팁:**

-   **필드 수가 많을수록** Forma의 성능 우위가 더 확실해짐
-   **실시간 검색, 자동완성** 등에서 성능 차이가 크게 체감됨
-   **모바일 환경**에서 특히 성능 차이가 뚜렷함

#### 4. **타입 활용**

-   TypeScript 사용 시 Forma의 자동 타입 추론 활용
-   `form.useFormValue("user.name")`에서 자동으로 string 타입 추론

#### 5. **글로벌 상태 마이그레이션**

-   여러 컴포넌트에서 공유하는 폼은 `useGlobalForm` 사용
-   Redux, Context API 등을 Forma의 글로벌 상태로 대체 가능

#### 6. **성능 모니터링 체크리스트**

-   [ ] 타이핑 시 부드러운 응답성 확인
-   [ ] React DevTools에서 리렌더링 횟수 측정
-   [ ] 대형 폼에서 메모리 사용량 확인
-   [ ] 모바일 디바이스에서 성능 테스트

## 관련 문서

-   **[API 레퍼런스](./API-ko.md)** - 모든 API 상세 설명
-   **[예제 모음](./examples-ko.md)** - 실용적인 사용 예제
-   **[성능 최적화 가이드](./performance-guide-ko.md)** - 성능 최적화 방법
-   **[성능 최적화 주의사항](./performance-warnings-ko.md)** - 안티패턴과 주의사항
-   **[마이그레이션 가이드](./migration-ko.md)** - 다른 라이브러리에서 이전
-   **[useGlobalForm 가이드](./useGlobalForm-guide-ko.md)** - 글로벌 폼 상태 관리
-   **[글로벌 훅 비교 가이드](./global-hooks-comparison-ko.md)** - 글로벌 훅들의 차이점
-   **[라이브러리 비교 가이드](./library-comparison-ko.md)** - 다른 상태 관리 라이브러리와의 비교

마이그레이션 과정에서 궁금한 점이 있으시면 언제든 문의해 주세요!
