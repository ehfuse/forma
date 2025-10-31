# Forma 성능 최적화 주의사항

Forma를 사용할 때 피해야 할 안티패턴과 주의사항을 정리했습니다.

> 💡 **기본 최적화 방법**: [성능 최적화 가이드](./performance-guide.md)에서 권장 패턴과 방법들을 먼저 확인하세요.

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

### 4. map 내부에서 useValue 호출 금지

**❌ map 내부에서 직접 useValue 호출**

```tsx
function TodoList() {
    const todos = state.useValue("todos");

    return (
        <div>
            {todos.map((todo: any, index: number) => {
                // ❌ React Hook Rules 위반: 반복문 내부에서 Hook 호출
                const todoText = state.useValue(`todos.${index}.text`);
                const isCompleted = state.useValue(`todos.${index}.completed`);

                return (
                    <div key={index}>
                        <span
                            style={{
                                textDecoration: isCompleted
                                    ? "line-through"
                                    : "none",
                            }}
                        >
                            {todoText}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
```

**✅ 별도 컴포넌트로 분리하여 useValue 사용**

```tsx
function TodoItem({
    index,
    useValue,
}: {
    index: number;
    useValue: (path: string) => any;
}) {
    // ✅ 컴포넌트 최상위에서 useValue 호출 (prop으로 받은 함수 사용)
    const todoText = useValue(`todos.${index}.text`);
    const isCompleted = useValue(`todos.${index}.completed`);

    return (
        <div>
            <span
                style={{
                    textDecoration: isCompleted ? "line-through" : "none",
                }}
            >
                {todoText}
            </span>
        </div>
    );
}

function TodoList() {
    const { useValue } = useFormaState({ todos: [] }); // useValue 함수 추출
    const todos = useValue("todos");

    return (
        <div>
            {todos.map((todo: any, index: number) => (
                <TodoItem key={index} index={index} useValue={useValue} />
                // ✅ useValue 함수를 prop으로 전달
                // ✅ 각 TodoItem이 개별적으로 필드 구독
            ))}
        </div>
    );
}
```

**💡 컴포넌트 분리의 추가 이점:**

-   **성능 최적화**: 개별 항목 변경 시 다른 항목들은 리렌더링되지 않음
-   **메모리 효율성**: 각 컴포넌트가 필요한 필드만 구독
-   **디버깅 편의성**: React DevTools에서 개별 컴포넌트 렌더링 추적 가능

## 🚀 대량 데이터 배치 처리 최적화

### 배열 전체 교체를 활용한 고성능 업데이트

대량의 데이터를 동시에 업데이트해야 하는 경우, **배열 전체 교체**를 사용하면 최적의 성능을 얻을 수 있습니다.

**💡 핵심 개념:**

-   **개별 업데이트**: 각 필드마다 `setValue` → 변경된 모든 구독자가 리렌더링
-   **배열 전체 교체**: 새 배열로 `setValue` → **값이 실제로 변경된 구독자만** 리렌더링

### 실제 사용 사례: 100개 체크박스 전체 선택/해제

```tsx
const state = useFormaState({
    searchResults: [], // 100개+ 체크박스 데이터
});

// 🚀 고성능 배치 처리: 다중 체크박스 전체 선택/해제
const handleSelectAll = (allSearchResults: any[], selectAll: boolean) => {
    // ❌ 비효율적인 방법: 각 항목마다 개별 호출
    // allSearchResults.forEach((_: any, index: number) => {
    //     state.setValue(`searchResults.${index}.checked`, selectAll);
    //     // 각 setValue마다 개별 필드 구독자들이 리렌더링됨
    // });

    // ✅ 효율적인 방법: 배열 전체 교체
    if (allSearchResults.length > 0) {
        const updatedSearchResults = allSearchResults.map((item: any) => ({
            ...item,
            checked: selectAll,
        }));
        // 배열 전체를 교체하면 값이 실제로 변경된 필드만 자동으로 알림이 감
        state.setValue("searchResults", updatedSearchResults);
        // refreshFields는 불필요함 - 값이 변경된 구독자에게는 이미 알림이 갔음
    }
};
```

**⚡ 성능 최적화 원리:**

1. **스마트 비교**: Forma는 배열 교체 시 각 요소를 개별적으로 비교
2. **선택적 알림**: 실제로 값이 변경된 필드 구독자에게만 알림
3. **불변성 활용**: 새 배열 생성으로 React 최적화와 호환

**💡 왜 배열 전체 교체가 가장 효율적인가?**

```tsx
// 100개 체크박스 시나리오 분석
const state = useFormaState({
    items: Array(100)
        .fill()
        .map((_, i) => ({ id: i, checked: false })),
});

// 시나리오 1: 개별 setValue (비효율적)
// - setValue 호출 100번
// - 각 호출마다 해당 구독자 리렌더링
// - 총 100번의 리렌더링 발생
items.forEach((_, index) => {
    state.setValue(`items.${index}.checked`, true);
});

// 시나리오 2: 배열 전체 교체 (효율적)
// - setValue 호출 1번
// - Forma가 내부적으로 이전 값과 새 값을 비교
// - 실제로 false→true로 변경된 구독자만 리렌더링
// - 총 100번의 리렌더링 발생 (하지만 1번의 API 호출)
const updatedItems = items.map((item) => ({ ...item, checked: true }));
state.setValue("items", updatedItems);

// 시나리오 3: 일부만 변경 (가장 효율적)
// - 50개만 true→false로 변경하는 경우
// - setValue 호출 1번
// - 실제로 변경된 50개 구독자만 리렌더링
const partiallyUpdated = items.map((item, index) =>
    index < 50 ? { ...item, checked: false } : item
);
state.setValue("items", partiallyUpdated);
```

**🎯 핵심 이점:**

-   **API 호출 최소화**: N번 → 1번 호출로 JavaScript 실행 시간 단축
-   **배치 처리**: 단일 업데이트 사이클에서 모든 변경사항 처리
-   **스마트 리렌더링**: 실제 변경된 값만 감지하여 리렌더링
-   **React 친화적**: 불변성 원칙을 따라 React 최적화와 호환

```tsx
// 실제 체크박스 컴포넌트들
function SearchResultItem({
    index,
    useValue,
}: {
    index: number;
    useValue: (path: string) => any;
}) {
    // 개별 체크박스 상태 구독 (prop으로 받은 useValue 함수 사용)
    const isChecked = useValue(`searchResults.${index}.checked`);
    const itemData = useValue(`searchResults.${index}`);

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

// ❌ 잘못된 방법: map 내부에서 useValue 사용
function SearchResultsListBad() {
    const { useValue } = useFormaState({ searchResults: [] });
    const searchResults = useValue("searchResults");

    return (
        <div>
            {searchResults.map((item: any, index: number) => {
                // ❌ React Hook Rules 위반: 반복문/조건문 내부에서 Hook 호출 금지
                const isChecked = useValue(`searchResults.${index}.checked`);
                const itemData = useValue(`searchResults.${index}`);

                return (
                    <div key={index}>
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
            })}
        </div>
    );
}

// ✅ 올바른 방법: 별도 컴포넌트로 분리하여 useValue 사용
function SearchResultsList() {
    const { useValue } = useFormaState({ searchResults: [] }); // useValue 함수 추출
    const searchResults = useValue("searchResults");

    return (
        <div>
            {searchResults.map((item: any, index: number) => (
                <SearchResultItem
                    key={index}
                    index={index}
                    useValue={useValue}
                />
                // ✅ useValue 함수를 prop으로 전달
                // ✅ 각 SearchResultItem 내부에서 useValue 호출
                // ✅ 개별 필드 구독으로 해당 항목만 리렌더링
            ))}
        </div>
    );
}

// 💡 컴포넌트 분리의 장점:
// 1. React Hook Rules 준수: useValue를 컴포넌트 최상위에서 호출
// 2. 개별 필드 구독: 각 항목이 독립적으로 리렌더링
// 3. 성능 최적화: 한 항목 변경 시 다른 항목들은 리렌더링되지 않음

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

### ⚡ 성능 비교: 배열 전체 교체의 효과

| 시나리오                 | 개별 처리                  | 배열 전체 교체                     | 성능 개선                                |
| ------------------------ | -------------------------- | ---------------------------------- | ---------------------------------------- |
| 100개 체크박스 전체 선택 | 100번 setValue 호출        | 1번 배열 교체                      | **대폭 향상** (API 호출 횟수 감소)       |
| 체크 상태가 모두 동일    | 100개 구독자 모두 리렌더링 | 0개 구독자 리렌더링 (값 변경 없음) | **무한대 향상** (불필요한 리렌더링 방지) |
| 절반만 체크 상태 변경    | 100개 구독자 모두 리렌더링 | 50개 구독자만 리렌더링             | **2배 향상** (변경된 구독자만 처리)      |
| 1000개 상태 동기화       | 1000번 개별 setValue       | 1번 배열 교체                      | **극적 향상** (Forma 내부 처리 최적화)   |

### 📊 실제 성능 측정

```tsx
// 성능 측정 예시
console.time("Individual Updates");
// ❌ 개별 처리: 각 필드마다 setValue + 리렌더링
searchResults.forEach((_, index) => {
    state.setValue(`searchResults.${index}.checked`, true);
});
console.timeEnd("Individual Updates"); // ~145ms (100개 setValue 호출)

console.time("Array Replacement");
// ✅ 배열 교체: 한 번의 setValue + 스마트 리렌더링
const updatedResults = searchResults.map((item) => ({
    ...item,
    checked: true,
}));
state.setValue("searchResults", updatedResults);
console.timeEnd("Array Replacement"); // ~2ms (1번 setValue 호출)
```

### 다른 활용 사례들

1. **테이블 행 일괄 업데이트**

    ```tsx
    const updateTableRows = (rowUpdates: number[]) => {
        // ✅ 배열 전체 교체로 최적화
        const updatedTable = tableData.map((row, index) =>
            rowUpdates.includes(index) ? { ...row, status: "updated" } : row
        );
        state.setValue("tableData", updatedTable);
        // 값이 실제로 변경된 행만 자동으로 리렌더링됨
    };
    ```

2. **폼 필드 초기화**

    ```tsx
    const resetFormSection = () => {
        // ✅ setValues로 여러 영역 한 번에 업데이트
        state.setValues({
            personal: { name: "", email: "", phone: "" },
            address: { street: "", city: "", zipCode: "" },
        });
        // 변경된 필드만 자동으로 리렌더링됨
    };
    ```

3. **서버 데이터 동기화**

    ```tsx
    const syncWithServer = async () => {
        const serverData = await fetchLatestData();

        // ✅ 배치로 업데이트
        state.setValues({
            userData: serverData.user,
            preferences: serverData.preferences,
        });

        // refreshFields는 값이 동일하더라도 강제 새로고침이 필요한 경우에만 사용
        if (forceRefresh) {
            state.refreshFields("userData");
            state.refreshFields("preferences");
        }
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
    function TodoItem({ index, useValue }) {
        const text = useValue(`todos.${index}.text`);
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

4. **map 내부에서 useValue 직접 호출**

    ```tsx
    items.map((item, index) => {
        const value = state.useValue(`items.${index}`); // ❌ Hook 규칙 위반
        return <div>{value}</div>;
    });
    ```

5. **과도한 중첩 없이 적절한 깊이 유지**

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

## 관련 문서

-   **[성능 최적화 가이드](./performance-guide.md)** - 권장 패턴과 최적화 방법들
-   **[API 레퍼런스](./API.md)** - 상세한 API 문서
-   **[시작하기 가이드](./getting-started.md)** - 기본 사용법
-   **[예제 모음](./examples/basic-example.md)** - 실용적인 사용 예제
-   **[마이그레이션 가이드](./migration.md)** - 다른 라이브러리에서 이전
