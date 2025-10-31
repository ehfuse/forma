# Forma vs 다른 상태 관리 라이브러리 비교

## 📋 개요

Forma는 폼 관리에 특화된 React 상태 관리 라이브러리입니다. 이 문서에서는 Forma와 다른 인기 있는 상태 관리 라이브러리들을 비교하여 각각의 장단점과 적절한 사용 시나리오를 설명합니다.

## 🎯 Forma의 핵심 특징

### 1. 폼 관리에 특화된 설계 🎨

-   폼 관리에 최적화된 API
-   검증, 제출, 에러 처리 내장
-   Material-UI(MUI)와 완벽한 통합

### 2. 강력한 일반 상태 관리 📦

-   `useFormaState`: 로컬 상태 관리에 최적화
-   `useGlobalFormaState`: 글로벌 상태 관리 내장
-   Redux나 Zustand 없이도 완전한 상태 관리 가능
-   폼과 일반 상태를 하나의 라이브러리로 통합

### 3. 개별 필드 구독 ⚡

-   필드별 선택적 리렌더링
-   대규모 폼에서 뛰어난 성능
-   Dot notation 네이티브 지원
-   상태 변경 시 필요한 컴포넌트만 업데이트

### 4. TypeScript 우선 설계 📝

-   강력한 타입 추론
-   IDE 자동완성 최적화
-   컴파일 타임 에러 방지

## 🔍 주요 라이브러리 비교

### vs React Hook Form 📋

#### 코드 비교

```typescript
// React Hook Form
const { register, handleSubmit, watch } = useForm();
const name = watch("name"); // 전체 폼 리렌더링 위험

// Forma
const form = useForm();
const name = form.useFormValue("name"); // 해당 필드만 리렌더링
```

#### 장단점 비교

| 특징           | Forma               | React Hook Form           |
| -------------- | ------------------- | ------------------------- |
| **성능**       | ✅ 개별 필드 구독   | ⚠️ watch 사용 시 리렌더링 |
| **TypeScript** | ✅ 강력한 타입 추론 | ✅ 좋은 타입 지원         |
| **MUI 통합**   | ✅ 완벽한 통합      | ⚠️ 추가 설정 필요         |
| **생태계**     | ⚠️ 신규 라이브러리  | ✅ 큰 커뮤니티            |
| **번들 크기**  | ✅ 중간 크기        | ✅ 가벼움                 |
| **학습 곡선**  | ✅ 직관적           | ✅ 쉬움                   |

**Forma가 더 좋은 경우:**

-   복잡한 폼에서 성능이 중요할 때
-   MUI를 주로 사용하는 프로젝트
-   TypeScript 프로젝트에서 강력한 타입 지원이 필요할 때

**React Hook Form이 더 좋은 경우:**

-   검증된 안정성이 중요할 때
-   풍부한 생태계와 커뮤니티 지원이 필요할 때
-   uncontrolled 방식을 선호할 때

### vs Formik 📝

#### 코드 비교

```typescript
// Formik - 잘못된 사용법 (전체 폼 리렌더링)
<Formik>
    {({ values, setFieldValue }) => (
        <input
            value={values.user.name} // 전체 폼 리렌더링
            onChange={(e) => setFieldValue("user.name", e.target.value)}
        />
    )}
</Formik>;

// Formik - 올바른 사용법 (개별 필드 구독)
<Field name="user.name">
    {({ field, meta }) => (
        <input {...field} /> // 해당 필드만 리렌더링
    )}
</Field>;

// 또는 useField 사용
const [field, meta] = useField("user.name"); // 개별 필드 구독

// Forma
const userName = form.useFormValue("user.name"); // 개별 필드 구독 (기본)
<TextField
    name="user.name"
    value={userName}
    onChange={form.handleFormChange}
/>;
```

#### 장단점 비교

| 특징             | Forma                        | Formik                           |
| ---------------- | ---------------------------- | -------------------------------- |
| **성능**         | ✅ 기본적으로 개별 필드 구독 | ✅ useField/Field 사용 시 최적화 |
| **API 복잡도**   | ✅ 간단한 API                | ⚠️ render props 패턴 필요        |
| **TypeScript**   | ✅ 뛰어난 타입 추론          | ⚠️ 제한적 타입 지원              |
| **유지보수**     | ✅ 활발한 개발               | ⚠️ 유지보수 모드                 |
| **번들 크기**    | ✅ 중간 크기                 | ✅ 중간 크기                     |
| **Dot Notation** | ✅ 네이티브 지원             | ✅ 지원 (getIn 헬퍼 포함)        |
| **학습 곡선**    | ✅ 직관적                    | ⚠️ render props 패턴 학습 필요   |

**Forma가 더 좋은 경우:**

-   기본 API 자체가 최적화되어 추가 패턴 학습이 불필요한 경우
-   현대적이고 직관적인 API를 선호하는 경우
-   TypeScript 프로젝트에서 강력한 타입 지원이 필요한 경우

**Formik이 더 좋은 경우:**

-   render props 패턴에 익숙하고 선호하는 팀
-   기존 Formik 프로젝트의 마이그레이션 비용이 큰 경우
-   Formik 생태계의 기존 플러그인을 활용하고 싶은 경우

### vs Zustand/Redux 🏪

#### 코드 비교

```typescript
// Zustand (일반 상태 관리)
const name = useStore((state) => state.user.name);
// 폼 검증, 제출 로직을 직접 구현해야 함

// Forma - 폼 관리
const form = useForm({
    initialValues: { user: { name: "" } },
    onValidate: async (values) => {
        /* 검증 로직 */
    },
    onSubmit: async (values) => {
        /* 제출 로직 */
    },
});
const name = form.useFormValue("user.name");

// Forma - 일반 상태 관리
const userState = useFormaState({ user: { name: "" } });
const name = userState.useValue("user.name");

// Forma - 글로벌 상태 관리
const globalState = useGlobalFormaState("user-store", { user: { name: "" } });
const name = globalState.useValue("user.name");
```

#### 장단점 비교

| 특징          | Forma                    | Zustand      | Redux             |
| ------------- | ------------------------ | ------------ | ----------------- |
| **폼 관리**   | ✅ 전용 기능             | ⚠️ 직접 구현 | ⚠️ 직접 구현      |
| **범용 상태** | ✅ useFormaState 제공    | ✅ 뛰어남    | ✅ 뛰어남         |
| **글로벌**    | ✅ useGlobalFormaState   | ✅ 내장      | ✅ 내장           |
| **성능**      | ✅ 개별 필드 구독        | ✅ 좋음      | ✅ 좋음           |
| **개발 도구** | ⚠️ 제한적                | ✅ 간단함    | ✅ Redux DevTools |
| **학습 곡선** | ✅ 쉬움                  | ✅ 쉬움      | ⚠️ 복잡함         |
| **통합성**    | ✅ 폼+상태를 하나로 관리 | ⚠️ 폼은 별도 | ⚠️ 폼은 별도      |

**Forma의 장점:**

-   **올인원 솔루션**: 폼 관리 + 일반 상태 관리 + 글로벌 상태 관리
-   **일관된 API**: 모든 상태 관리 패턴이 동일한 인터페이스
-   **개별 구독**: Zustand보다 더 세밀한 리렌더링 제어

**Zustand/Redux가 더 좋은 경우:**

-   **Zustand**: 매우 가벼운 상태 관리만 필요한 경우
-   **Redux**: 강력한 디버깅 도구와 미들웨어가 중요한 경우

### vs TanStack Form 🆕

#### 코드 비교

```typescript
// TanStack Form
const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
        /* submit */
    },
});

// Forma
const form = useForm({
    initialValues: { name: "" },
    onSubmit: async (values) => {
        /* submit */
    },
});
```

#### 장단점 비교

| 특징           | Forma             | TanStack Form  |
| -------------- | ----------------- | -------------- |
| **성능**       | ✅ 개별 필드 구독 | ✅ 최적화됨    |
| **TypeScript** | ✅ 강력한 지원    | ✅ 강력한 지원 |
| **MUI 통합**   | ✅ 완벽한 통합    | ⚠️ 추가 설정   |
| **성숙도**     | ⚠️ 신규           | ⚠️ 신규        |
| **크기**       | ✅ 중간           | ✅ 작음        |

## 📊 성능 비교

### 대규모 폼 시나리오 (50개 필드)

```
1개 필드 변경 시 리렌더링 컴포넌트 수:

┌─────────────────┬─────────────────┐
│ 라이브러리      │ 리렌더링 수     │
├─────────────────┼─────────────────┤
│ Formik          │ 50개 (전체)     │
│ RHF + watch     │ 10-20개         │
│ Forma           │ 1개 (해당 필드) │
│ TanStack Form   │ 1-2개           │
└─────────────────┴─────────────────┘
```

### 메모리 사용량

-   **Forma**: 중간 수준 (개별 구독자 관리)
-   **RHF**: 낮음 (uncontrolled 방식)
-   **Formik**: 높음 (전체 상태 관리)

## 🎯 선택 가이드

### Forma를 선택해야 하는 경우 ✅

1. **폼 중심 애플리케이션**

    - 설문조사 플랫폼
    - 양식 관리 시스템
    - 복잡한 다단계 폼

2. **통합 상태 관리가 필요한 경우**

    - 폼 + 일반 상태를 하나의 라이브러리로 관리
    - 추가 상태 관리 라이브러리 설치 부담 없이
    - 일관된 API로 모든 상태 관리

3. **성능이 중요한 폼**

    - 50개 이상의 필드
    - 실시간 업데이트가 빈번
    - 모바일 환경 최적화

4. **MUI 프로젝트**

    - Material-UI 기반 디자인 시스템
    - MUI 컴포넌트 중심 개발

5. **TypeScript 프로젝트**
    - 강력한 타입 안전성 필요
    - IDE 자동완성 중요

### 다른 라이브러리를 고려해야 하는 경우 ⚠️

1. **React Hook Form 선택:**

    - 생태계와 플러그인이 중요
    - 커뮤니티 지원이 중요한 프로젝트
    - 검증된 안정성 우선

2. **범용 상태 관리 필요:**

    - 폼 외에도 복잡한 전역 상태 관리
    - Redux DevTools 등 디버깅 도구 중요
    - 서버 상태 관리도 함께 필요

3. **기존 프로젝트:**
    - 이미 다른 라이브러리 사용 중
    - 마이그레이션 비용이 큰 경우

## 🚀 마이그레이션 가이드

### From React Hook Form

```typescript
// Before (RHF)
const { register, handleSubmit, watch } = useForm();
const name = watch("name");

// After (Forma)
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
```

### From Formik

```typescript
// Before (Formik)
<Formik initialValues={{ name: "" }}>
    {({ values, setFieldValue }) => (
        <input
            value={values.name}
            onChange={(e) => setFieldValue("name", e.target.value)}
        />
    )}
</Formik>;

// After (Forma)
const form = useForm({ initialValues: { name: "" } });
const name = form.useFormValue("name");
return <input name="name" value={name} onChange={form.handleFormChange} />;
```

## 📈 성능 최적화 팁

### Forma에서 최고 성능 얻기

1. **개별 필드 구독 사용**

```typescript
// ✅ 좋음
const name = form.useFormValue("name");
const email = form.useFormValue("email");

// ❌ 피하기
const allValues = form.getValues(); // 전체 상태 구독
```

2. **조건부 구독**

```typescript
// ✅ 조건부 렌더링 시 조건부 구독
{
    showAdvanced && form.useFormValue("advanced.option");
}
```

3. **메모이제이션 활용**

```typescript
const expensiveValue = useMemo(() => {
    return computeExpensiveValue(form.useFormValue("input"));
}, [form.useFormValue("input")]);
```

## 🔮 미래 전망

### Forma의 로드맵

-   React Server Components 지원
-   더 많은 UI 라이브러리 통합
-   성능 최적화 고도화

### 생태계 트렌드

-   폼 라이브러리들의 성능 최적화 경쟁
-   TypeScript 지원 강화
-   React 19+ 새로운 기능 활용

## 📞 결론

**Forma는 다음과 같은 경우에 최적의 선택입니다:**

-   폼이 애플리케이션의 핵심인 경우
-   폼 + 일반 상태 관리를 하나의 라이브러리로 통합하고 싶은 경우
-   성능 최적화가 중요한 복잡한 폼
-   MUI를 사용하는 TypeScript 프로젝트
-   추가 상태 관리 라이브러리 없이 완전한 솔루션을 원하는 경우
-   새로운 기술 도입이 가능한 초기 단계 프로젝트

**하지만 다음과 같은 경우에는 다른 라이브러리가 더 나을 수 있습니다:**

-   검증된 안정성이 가장 중요한 경우
-   기존 팀의 경험과 학습 곡선을 고려해야 하는 경우
-   이미 다른 상태 관리 라이브러리가 잘 구축된 프로젝트
-   Redux DevTools 등 특정 개발 도구가 필수인 경우

**Forma의 핵심 가치는 폼과 상태 관리를 하나의 일관된 API로 제공하는 통합 솔루션입니다.**

---

📚 **관련 문서**

-   [시작하기 가이드](./getting-started.md)
-   [API 레퍼런스](./API.md)
-   [예제 모음](./examples/basic-example.md)
-   [글로벌 훅 비교 가이드](./global-hooks-comparison.md)
-   [성능 최적화 가이드](./performance-guide.md)
-   [성능 최적화 주의사항](./performance-warnings.md)
-   [마이그레이션 가이드](./migration.md)
-   [useGlobalForm 가이드](./useGlobalForm-guide.md)
