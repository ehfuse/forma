# useGlobalForm 사용 가이드

`useGlobalForm`은 여러 컴포넌트 간에 폼 데이터를 공유하기 위한 고급 훅입니다. 복잡한 다단계 폼이나 여러 페이지에 걸친 폼 데이터 관리에 특화되어 있습니다.

## 기본 개념

### 글로벌 폼의 특징

-   **데이터 공유**: 같은 `formId`를 사용하는 모든 컴포넌트가 동일한 폼 데이터를 공유
-   **단순함**: `formId`만 지정하면 즉시 사용 가능
-   **독립성**: 각 `formId`별로 완전히 독립적인 상태 관리

### 언제 사용해야 하나요?

-   다단계 폼 (Step Form)
-   여러 페이지에 걸친 폼 데이터
-   서로 다른 컴포넌트에서 같은 폼 데이터에 접근해야 할 때
-   복잡한 폼의 일부를 분리된 컴포넌트로 관리할 때

## 기본 사용법

### 1. Provider 설정

먼저 애플리케이션 최상단에 `GlobalFormaProvider`를 설정합니다:

````typescript
// App.tsx
import { GlobalFormaProvider } from '@ehfuse/forma';

function App() {
  return (
    <GlobalFormaProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </Router>
    </GlobalFormaProvider>
  );
}

### 2. 타입 정의

TypeScript를 사용한다면 폼 데이터의 타입을 정의합니다:

```typescript
// types/userForm.ts
interface UserFormData {
    // 개인정보
    name: string;
    email: string;
    phone: string;

    // 주소정보
    address: {
        street: string;
        city: string;
        zipCode: string;
    };

    // 추가정보
    preferences: string[];
    newsletter: boolean;
}
````

### 3. 기본 사용

```typescript
// Step1.tsx - 개인정보 입력
import { useGlobalForm } from "@ehfuse/forma";

function Step1() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    return (
        <div>
            <h2>1단계: 개인정보</h2>
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
                label="이름"
            />

            <TextField
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
                label="이메일"
            />

            <TextField
                name="phone"
                value={form.useFormValue("phone")}
                onChange={form.handleFormChange}
                label="전화번호"
            />
        </div>
    );
}
```

```typescript
// Step2.tsx - 주소정보 입력
import { useGlobalForm } from "@ehfuse/forma";

function Step2() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration", // 같은 formId 사용
    });

    return (
        <div>
            <h2>2단계: 주소정보</h2>
            <TextField
                name="address.street"
                value={form.useFormValue("address.street")}
                onChange={form.handleFormChange}
                label="도로명주소"
            />

            <TextField
                name="address.city"
                value={form.useFormValue("address.city")}
                onChange={form.handleFormChange}
                label="도시"
            />

            <TextField
                name="address.zipCode"
                value={form.useFormValue("address.zipCode")}
                onChange={form.handleFormChange}
                label="우편번호"
            />
        </div>
    );
}
```

```typescript
// Step3.tsx - 최종 확인 및 제출
import { useGlobalForm } from "@ehfuse/forma";

function Step3() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    const handleSubmit = async () => {
        // 폼 검증
        const isValid = await form.validateForm();
        if (!isValid) {
            alert("입력 내용을 확인해주세요.");
            return;
        }

        // 데이터 제출
        const formData = form.getFormValues();
        try {
            await submitUserRegistration(formData);
            alert("등록이 완료되었습니다!");
        } catch (error) {
            alert("등록 중 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <h2>3단계: 최종 확인</h2>

            {/* 입력된 데이터 표시 */}
            <div>
                <h3>개인정보</h3>
                <p>이름: {form.useFormValue("name")}</p>
                <p>이메일: {form.useFormValue("email")}</p>
                <p>전화번호: {form.useFormValue("phone")}</p>
            </div>

            <div>
                <h3>주소정보</h3>
                <p>주소: {form.useFormValue("address.street")}</p>
                <p>도시: {form.useFormValue("address.city")}</p>
                <p>우편번호: {form.useFormValue("address.zipCode")}</p>
            </div>

            <button onClick={handleSubmit}>등록 완료</button>
        </div>
    );
}
```

## 고급 사용법

### 1. 초기 데이터 설정

첫 번째 컴포넌트에서 초기 데이터를 설정할 수 있습니다:

```typescript
function UserFormInit() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    useEffect(() => {
        // 초기 데이터 설정
        form.setFormValues({
            name: "",
            email: "",
            phone: "",
            address: {
                street: "",
                city: "",
                zipCode: "",
            },
            preferences: [],
            newsletter: false,
        });
    }, []);

    return <Step1 />;
}
```

### 2. 기존 useForm을 글로벌로 등록

이미 만들어진 로컬 폼을 글로벌 상태로 공유할 수 있습니다:

```typescript
import { useForm, useRegisterGlobalForm } from "@ehfuse/forma";

function LocalFormComponent() {
    // 기존 로컬 폼 생성
    const form = useForm<UserFormData>({
        initialValues: {
            name: "",
            email: "",
            phone: "",
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
            console.log("제출:", values);
        },
    });

    // 로컬 폼을 글로벌 폼으로 등록
    useRegisterGlobalForm("my-shared-form", form);

    return (
        <div>
            <h2>로컬 폼 (이제 글로벌로 공유됨)</h2>
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
                label="이름"
            />

            <TextField
                name="email"
                value={form.useFormValue("email")}
                onChange={form.handleFormChange}
                label="이메일"
            />

            <button onClick={form.submit}>제출</button>
        </div>
    );
}

function AnotherComponent() {
    // 같은 formId로 글로벌 폼에 접근
    const form = useGlobalForm<UserFormData>({
        formId: "my-shared-form",
    });

    return (
        <div>
            <h2>다른 컴포넌트에서 같은 데이터 접근</h2>
            <p>이름: {form.useFormValue("name")}</p>
            <p>이메일: {form.useFormValue("email")}</p>

            {/* 여기서 수정해도 위 컴포넌트와 동기화됨 */}
            <TextField
                name="phone"
                value={form.useFormValue("phone")}
                onChange={form.handleFormChange}
                label="전화번호"
            />
        </div>
    );
}
```

### 3. 데이터 사전 로드

서버에서 데이터를 불러와서 설정할 수도 있습니다:

```typescript
function EditUserForm({ userId }: { userId: string }) {
    const form = useGlobalForm<UserFormData>({
        formId: `user-edit-${userId}`,
    });

    useEffect(() => {
        async function loadUserData() {
            try {
                const userData = await fetchUser(userId);
                form.setFormValues(userData);
            } catch (error) {
                console.error("사용자 데이터 로드 실패:", error);
            }
        }

        loadUserData();
    }, [userId]);

    return <UserEditSteps />;
}
```

### 3. Store 직접 접근

고급 사용자를 위해 글로벌 store에 직접 접근할 수 있습니다:

```typescript
function AdvancedGlobalForm() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    // 글로벌 store 직접 접근
    const store = form._store;

    // 다른 useForm 훅에서 같은 store 사용
    const localForm = useForm<UserFormData>({
        initialValues: {} as UserFormData,
        _externalStore: store, // 같은 store 공유
    });

    // 이제 form과 localForm이 같은 데이터를 공유합니다
    return (
        <div>
            <h3>글로벌 폼 데이터</h3>
            <p>이름: {form.useFormValue("name")}</p>

            <h3>로컬 폼에서 같은 데이터</h3>
            <p>이름: {localForm.useFormValue("name")}</p>

            {/* 둘 중 하나를 변경하면 모두 업데이트됩니다 */}
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
                label="글로벌 폼에서 변경"
            />

            <TextField
                name="name"
                value={localForm.useFormValue("name")}
                onChange={localForm.handleFormChange}
                label="로컬 폼에서 변경"
            />
        </div>
    );
}
```

### 4. 조건부 검증

특정 단계에서만 검증을 수행할 수 있습니다:

```typescript
function Step1Validation() {
    const form = useGlobalForm<UserFormData>({
        formId: "user-registration",
    });

    const validateStep1 = () => {
        const name = form.getFormValue("name");
        const email = form.getFormValue("email");

        if (!name || name.length < 2) {
            alert("이름을 2글자 이상 입력해주세요.");
            return false;
        }

        if (!email || !email.includes("@")) {
            alert("올바른 이메일을 입력해주세요.");
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (validateStep1()) {
            // 다음 단계로 이동
            router.push("/step2");
        }
    };

    return (
        <div>
            {/* 폼 입력 */}
            <button onClick={handleNext}>다음 단계</button>
        </div>
    );
}
```

### 4. 실시간 데이터 동기화

여러 컴포넌트에서 실시간으로 데이터가 동기화됩니다:

```typescript
// 왼쪽 패널 - 데이터 입력
function LeftPanel() {
    const form = useGlobalForm<UserFormData>({ formId: "shared-form" });

    return (
        <div>
            <TextField
                name="name"
                value={form.useFormValue("name")}
                onChange={form.handleFormChange}
            />
        </div>
    );
}

// 오른쪽 패널 - 실시간 미리보기
function RightPanel() {
    const form = useGlobalForm<UserFormData>({ formId: "shared-form" });

    return (
        <div>
            <h3>미리보기</h3>
            <p>이름: {form.useFormValue("name")}</p> {/* 실시간 업데이트 */}
        </div>
    );
}
```

## 모범 사례

### 1. formId 명명 규칙

```typescript
// ✅ 좋은 예 - 명확하고 구체적인 이름
const form = useGlobalForm({ formId: "user-registration" }); // 사용자 등록 폼
const form = useGlobalForm({ formId: "product-edit-123" }); // 특정 상품 편집 폼
const form = useGlobalForm({ formId: "order-checkout" }); // 주문 결제 폼

// ❌ 피해야 할 예 - 모호하고 일반적인 이름
const form = useGlobalForm({ formId: "form1" }); // 어떤 폼인지 알 수 없음
const form = useGlobalForm({ formId: "data" }); // 너무 일반적이며 충돌 가능성 높음
```

**좋은 formId의 특징:**

-   **구체적**: 폼의 목적을 명확히 표현
-   **유니크**: 다른 폼과 중복되지 않음
-   **일관성**: 팀 내에서 통일된 명명 규칙 사용
-   **의미전달**: 코드를 읽는 사람이 쉽게 이해할 수 있음

**나쁜 formId의 문제점:**

-   **모호함**: 폼의 용도를 알 수 없어 유지보수 어려움
-   **충돌위험**: 일반적인 이름으로 인한 데이터 충돌 가능성
-   **디버깅 어려움**: 문제 발생 시 원인 파악이 힘듦

### 2. 타입 안정성

```typescript
// ✅ 타입을 명시적으로 지정
const form = useGlobalForm<UserFormData>({ formId: "user-form" });

// ❌ any 타입 사용 금지
const form = useGlobalForm<any>({ formId: "user-form" });
```

### 3. 메모리 관리

글로벌 폼은 자동으로 정리되지 않으므로, 필요에 따라 수동으로 정리해야 합니다:

```typescript
function MultiStepForm() {
    const form = useGlobalForm<UserFormData>({ formId: "temp-form" });

    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시 폼 데이터 정리
            form.resetForm();
        };
    }, []);

    return <FormSteps />;
}
```

## 주의사항

### 1. formId 충돌 방지

-   같은 애플리케이션에서 고유한 `formId`를 사용하세요
-   동적 ID가 필요한 경우 사용자 ID나 타임스탬프를 포함하세요

### 2. 메모리 누수 방지

-   임시 폼의 경우 사용 후 `resetForm()`을 호출하세요
-   단일 페이지 애플리케이션에서는 특히 주의하세요

### 3. 타입 일관성

-   모든 컴포넌트에서 동일한 타입을 사용하세요
-   폼 구조가 변경되면 관련된 모든 컴포넌트를 확인하세요

## 관련 문서

-   [API Reference](./API-ko.md#useglobalform)
-   [Getting Started](./getting-started-ko.md)
-   [Best Practices](./best-practices-ko.md)
