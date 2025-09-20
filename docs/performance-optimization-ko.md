# Forma 성능 최적화 및 주의사항

Forma를 사용할 때 최적의 성능을 얻기 위한 팁과 주의사항을 정리했습니다.

## 🔥 핵심 성능 최적화 원리

### 1. 개별 필드 구독 (Individual Field Subscription)

**❌ 비효율적인 방법: 전체 상태 구독**

```tsx
const form = useForm({ name: "", email: "", age: 0 });
const values = form.values; // 전체 상태 구독 - 모든 필드 변경 시 리렌더링

return (
    <div>
        <input value={values.name} onChange={...} />
        <input value={values.email} onChange={...} />
        <input value={values.age} onChange={...} />
    </div>
);
```

**✅ 효율적인 방법: 개별 필드 구독**

```tsx
const form = useForm({ name: "", email: "", age: 0 });
const name = form.useFormValue("name");   // name 필드만 구독
const email = form.useFormValue("email"); // email 필드만 구독
const age = form.useFormValue("age");     // age 필드만 구독

return (
    <div>
        <input value={name} onChange={...} />   {/* name 변경 시에만 리렌더링 */}
        <input value={email} onChange={...} />  {/* email 변경 시에만 리렌더링 */}
        <input value={age} onChange={...} />    {/* age 변경 시에만 리렌더링 */}
    </div>
);
```

### 2. 배열 길이 구독 최적화

**🔥 핵심 기능: 배열 길이만 구독하여 성능 최적화**

```tsx
const state = useFormaState({
    todos: [
        { id: 1, text: "Learn React", completed: false },
        { id: 2, text: "Learn Forma", completed: true },
    ],
});

// ✅ 배열 길이만 구독 - 항목 추가/삭제 시에만 리렌더링
const todoCount = state.useValue("todos.length");

// ✅ 특정 항목만 구독 - 해당 항목 변경 시에만 리렌더링
const firstTodo = state.useValue("todos.0.text");

const addTodo = () => {
    const todos = state.getValue("todos");
    state.setValue("todos", [...todos, newTodo]);
    // ✅ todos.length 구독자에게 자동 알림!
};

const toggleTodo = (index: number) => {
    state.setValue(`todos.${index}.completed`, !completed);
    // ✅ 해당 항목만 변경 - todos.length에는 알림 안 감
};
```

## ⚠️ 주의사항

### 1. 중첩 객체 상위 경로 구독 시 주의

**❌ 비효율적: 상위 객체 전체 구독**

```tsx
const state = useFormaState({
    user: {
        profile: { name: "김철수", email: "kim@example.com" },
        settings: { theme: "dark", notifications: true },
    },
});

// ❌ 'user' 전체를 구독 - profile, settings 중 아무거나 변경되면 리렌더링
const user = state.useValue("user");

return (
    <div>
        <span>{user.profile.name}</span>
        <span>{user.settings.theme}</span>
    </div>
);
```

**✅ 효율적: 필요한 필드만 개별 구독**

```tsx
// ✅ 필요한 필드만 개별 구독
const userName = state.useValue("user.profile.name");
const userTheme = state.useValue("user.settings.theme");

return (
    <div>
        <span>{userName}</span> {/* name 변경 시에만 리렌더링 */}
        <span>{userTheme}</span> {/* theme 변경 시에만 리렌더링 */}
    </div>
);
```

### 2. 배열 인덱스 변경 시 주의사항

**⚠️ 주의: 배열 순서 변경 시 인덱스 기반 구독의 한계**

```tsx
const state = useFormaState({
    items: ["사과", "바나나", "오렌지"],
});

// ❌ 인덱스 기반 구독 - 배열 순서 변경 시 문제 발생 가능
const firstItem = state.useValue("items.0"); // "사과"
const secondItem = state.useValue("items.1"); // "바나나"

// 배열 순서를 변경하면 인덱스가 달라져서 예상과 다른 값 반환
state.setValue("items", ["바나나", "사과", "오렌지"]);
// firstItem은 여전히 "items.0"을 구독하므로 "바나나"가 됨
```

**✅ 해결책: ID 기반 접근 또는 전체 배열 구독**

```tsx
const state = useFormaState({
    items: [
        { id: 1, name: "사과" },
        { id: 2, name: "바나나" },
        { id: 3, name: "오렌지" },
    ],
});

// ✅ ID를 통한 안정적인 접근
const findItemById = (id: number) => {
    const items = state.getValue("items");
    const index = items.findIndex((item) => item.id === id);
    return state.useValue(`items.${index}.name`);
};

// 또는 필요에 따라 전체 배열 구독
const items = state.useValue("items");
```

### 3. 조건부 필드 구독 시 주의

**❌ 조건부 useValue 호출은 React Hook 규칙 위반**

```tsx
function ConditionalComponent({ showEmail }: { showEmail: boolean }) {
    const form = useForm({ name: "", email: "" });

    const name = form.useFormValue("name");

    // ❌ 조건부 Hook 호출은 금지
    if (showEmail) {
        const email = form.useFormValue("email");
        return (
            <div>
                {name} - {email}
            </div>
        );
    }

    return <div>{name}</div>;
}
```

**✅ 항상 모든 Hook을 호출하고 조건부로 렌더링**

```tsx
function ConditionalComponent({ showEmail }: { showEmail: boolean }) {
    const form = useForm({ name: "", email: "" });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email"); // ✅ 항상 호출

    return (
        <div>
            {name}
            {showEmail && ` - ${email}`} {/* ✅ 조건부 렌더링 */}
        </div>
    );
}
```

## 🚀 대량 데이터 배치 처리 최적화

### refreshFields를 활용한 고성능 업데이트

대량의 데이터를 동시에 업데이트해야 하는 경우, `refreshFields`를 사용하면 극적인 성능 향상을 얻을 수 있습니다.

**💡 핵심 개념:**

-   **개별 업데이트**: 각 필드마다 `setValue` → N번의 리렌더링
-   **배치 업데이트**: 전체 데이터 `setValue` + `refreshFields` → 1번의 리렌더링

### 실제 사용 사례: 100개 체크박스 전체 선택/해제

```tsx
const state = useFormaState({
    searchResults: [], // 100개+ 체크박스 데이터
});

// 🚀 고성능 배치 처리: 다중 체크박스 전체 선택/해제
const handleSelectAll = (allSearchResults: any[], selectAll: boolean) => {
    // ❌ 비효율적인 방법: 각 항목마다 개별 호출 (145개 항목 = 145번 리렌더링)
    // allSearchResults.forEach((_: any, index: number) => {
    //     state.setValue(`searchResults.${index}.checked`, selectAll);
    //     // 각 setValue마다 개별 필드 구독자들이 리렌더링됨
    // });

    // ✅ 효율적인 방법: 배치 처리 후 한 번에 새로고침
    if (allSearchResults.length > 0) {
        // 1. 배치로 전체 데이터 업데이트 (리렌더링 없음)
        const updatedSearchResults = allSearchResults.map((item: any) => ({
            ...item,
            checked: selectAll,
        }));
        state.setValue("searchResults", updatedSearchResults);

        // 2. 단 1번의 호출로 모든 관련 필드 새로고침 (1번 리렌더링)
        state.refreshFields("searchResults"); // 모든 searchResults.*.checked 필드 처리
    }
};

// 실제 체크박스 컴포넌트들
function SearchResultItem({ index }: { index: number }) {
    // 개별 체크박스 상태 구독
    const isChecked = state.useValue(`searchResults.${index}.checked`);
    const itemData = state.useValue(`searchResults.${index}`);

    return (
        <div>
            <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) =>
                    state.setValue(
                        `searchResults.${index}.checked`,
                        e.target.checked
                    )
                }
            />
            <span>{itemData?.name}</span>
        </div>
    );
}

// 전체 선택 컴포넌트
function SelectAllButton() {
    const searchResults = state.useValue("searchResults");
    const allChecked =
        searchResults?.every((item: any) => item.checked) || false;

    return (
        <button onClick={() => handleSelectAll(searchResults, !allChecked)}>
            {allChecked ? "전체 해제" : "전체 선택"}
        </button>
    );
}
```

### ⚡ 성능 비교: 배치 처리의 효과

| 시나리오                 | 개별 처리       | 배치 처리    | 성능 개선       |
| ------------------------ | --------------- | ------------ | --------------- |
| 100개 체크박스 전체 선택 | 100번 리렌더링  | 1번 리렌더링 | **100배 향상**  |
| 500개 테이블 행 업데이트 | 500번 리렌더링  | 1번 리렌더링 | **500배 향상**  |
| 1000개 상태 동기화       | 1000번 리렌더링 | 1번 리렌더링 | **1000배 향상** |

### 📊 실제 성능 측정

```tsx
// 성능 측정 예시
console.time("Individual Updates");
// ❌ 개별 처리: 145ms (145개 항목)
searchResults.forEach((_, index) => {
    state.setValue(`searchResults.${index}.checked`, true);
});
console.timeEnd("Individual Updates"); // ~145ms

console.time("Batch Update");
// ✅ 배치 처리: 2ms (동일한 145개 항목)
state.setValue("searchResults", updatedResults);
state.refreshFields("searchResults");
console.timeEnd("Batch Update"); // ~2ms
```

### 다른 활용 사례들

1. **테이블 행 일괄 업데이트**

    ```tsx
    const updateTableRows = (rowUpdates: any[]) => {
        const updatedTable = tableData.map((row, index) =>
            rowUpdates.includes(index) ? { ...row, status: "updated" } : row
        );
        state.setValue("tableData", updatedTable);
        state.refreshFields("tableData");
    };
    ```

2. **폼 필드 초기화**

    ```tsx
    const resetFormSection = () => {
        const resetData = {
            personal: { name: "", email: "", phone: "" },
            address: { street: "", city: "", zipCode: "" },
        };
        state.setValues(resetData);
        state.refreshFields("personal");
        state.refreshFields("address");
    };
    ```

3. **서버 데이터 동기화**
    ```tsx
    const syncWithServer = async () => {
        const serverData = await fetchLatestData();
        state.setValue("userData", serverData.user);
        state.setValue("preferences", serverData.preferences);

        // 값이 동일하더라도 UI 강제 새로고침
        state.refreshFields("userData");
        state.refreshFields("preferences");
    };
    ```

## 🎯 성능 최적화 체크리스트

### ✅ DO (권장사항)

1. **개별 필드 구독 사용**

    ```tsx
    const name = form.useFormValue("name");
    const email = form.useFormValue("email");
    ```

2. **배열 길이 구독으로 카운트 최적화**

    ```tsx
    const todoCount = state.useValue("todos.length");
    ```

3. **Dot notation으로 중첩 필드 직접 접근**

    ```tsx
    const userName = state.useValue("user.profile.name");
    ```

4. **컴포넌트 분할로 리렌더링 범위 최소화**
    ```tsx
    function TodoItem({ index }) {
        const text = state.useValue(`todos.${index}.text`);
        return <li>{text}</li>;
    }
    ```

### ❌ DON'T (피해야 할 것)

1. **전체 상태 객체 구독**

    ```tsx
    const values = form.values; // ❌ 모든 필드 변경 시 리렌더링
    ```

2. **상위 객체 구독으로 불필요한 리렌더링**

    ```tsx
    const user = state.useValue("user"); // ❌ user 하위 모든 변경 시 리렌더링
    ```

3. **조건부 Hook 호출**

    ```tsx
    if (condition) {
        const value = form.useFormValue("field"); // ❌ Hook 규칙 위반
    }
    ```

4. **과도한 중첩 없이 적절한 깊이 유지**

    ```tsx
    // ❌ 과도한 중첩
    const value = state.useValue("level1.level2.level3.level4.level5.field");

    // ✅ 적절한 구조 설계
    const value = state.useValue("userSettings.theme");
    ```

## 📊 성능 측정 팁

### React DevTools Profiler 활용

1. React DevTools 설치 후 Profiler 탭 사용
2. 폼 입력 시 리렌더링되는 컴포넌트 확인
3. 개별 필드 구독 전후 비교

### Console 로그로 리렌더링 추적

```tsx
function MyComponent() {
    const name = form.useFormValue("name");

    console.log("MyComponent rendered with name:", name);

    return <input value={name} onChange={...} />;
}
```

이러한 최적화 원칙을 따르면 대규모 폼과 복잡한 상태에서도 부드러운 사용자 경험을 제공할 수 있습니다.
