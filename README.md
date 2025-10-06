# Forma

**High-performance and developer-friendly React form state management library**  
**고성능이며 개발자 친화적인 React 폼 상태 관리 라이브러리**

[![npm version](https://img.shields.io/npm/v/@ehfuse/forma.svg)](https://www.npmjs.com/package/@ehfuse/forma)
[![npm downloads](https://img.shields.io/npm/dm/@ehfuse/forma.svg)](https://www.npmjs.com/package/@ehfuse/forma)
[![GitHub license](https://img.shields.io/github/license/ehfuse/forma.svg)](https://github.com/ehfuse/forma/blob/main/LICENSE)

Forma is a high-performance library that makes form and state management in React applications **simple yet powerful**. **Start immediately with Zero-Config**, and achieve optimal performance through **selective re-rendering** via individual field subscriptions. Easily access production-level advanced features like **global form state sharing**, **Dot Notation nested object access**, and **full MUI compatibility** without complex setup.

Forma는 React 애플리케이션에서 폼과 상태를 **간편하면서도 강력하게** 관리할 수 있는 고성능 라이브러리입니다. **Zero-Config로 바로 시작**할 수 있으며, 개별 필드 구독을 통한 **선택적 리렌더링**으로 최적의 성능을 제공합니다. 복잡한 설정 없이도 **글로벌 폼 상태 공유**, **Dot Notation 중첩 객체 접근**, **MUI 완전 호환** 등 프로덕션 레벨의 고급 기능들을 손쉽게 사용할 수 있습니다.

## Key Features

-   🎯 **Complete Zero-Config**: Start immediately without any configuration
-   ✅ **Individual Field Subscription**: Optimized performance through selective re-rendering per field
-   🌟 **Global State Subscription**: Subscribe to entire state with `useValue("*")` pattern for optimal performance
-   ✅ **General State Management**: Efficient management of non-form states with `useFormaState`
-   🎭 **Modal Stack Management**: Mobile-friendly modal handling with back button support via `useModal`
-   ✅ **Dot Notation Optimization**: Access nested objects like `user.profile.name`
-   ✅ **Full MUI Compatibility**: Perfect integration with Material-UI components
-   ✅ **Global Form State**: Share form state across multiple components
-   ✅ **Form Registration System**: Register existing forms as global
-   ✅ **Full TypeScript Support**: Strong type safety
-   ✅ **React 19 Optimized**: Utilizing latest React features

## 주요 특징

-   🎯 **완전한 Zero-Config**: 설정 없이 바로 사용 가능한 개발 경험
-   ✅ **개별 필드 구독**: 필드별 선택적 리렌더링으로 최적화된 성능
-   🌟 **전체 상태 구독**: `useValue("*")` 패턴으로 전체 상태를 한 번에 구독하여 최적 성능 제공
-   ✅ **범용 상태 관리**: `useFormaState`로 폼 외 일반 상태도 효율적 관리
-   🎭 **모달 스택 관리**: `useModal`로 뒤로가기 지원하는 모바일 친화적 모달 처리
-   ✅ **Dot Notation 최적화**: `user.profile.name` 형태의 중첩 객체 접근
-   ✅ **MUI 완전 호환**: Material-UI 컴포넌트와 완벽한 통합
-   ✅ **글로벌 폼 상태**: 여러 컴포넌트 간 폼 상태 공유
-   ✅ **폼 등록 시스템**: 기존 폼을 글로벌로 등록 가능
-   ✅ **TypeScript 완전 지원**: 강력한 타입 안전성
-   ✅ **React 19 최적화**: 최신 React 기능 활용

## Documentation | 문서

### English

-   **[Getting Started Guide](./docs/getting-started-en.md)** - Step-by-step tutorial and examples
-   **[API Reference](./docs/API-en.md)** - Complete API documentation with examples
-   **[Examples Collection](./docs/examples-en.md)** - Practical usage examples and patterns
-   **[Performance Guide](./docs/performance-guide-en.md)** - Performance optimization techniques
-   **[Performance Warnings](./docs/performance-warnings-en.md)** - Anti-patterns and common pitfalls
-   **[Migration Guide](./docs/migration-en.md)** - Migrate from other form libraries
-   **[useGlobalForm Guide](./docs/useGlobalForm-guide-en.md)** - Global form state management
-   **[Global Hooks Comparison](./docs/global-hooks-comparison-en.md)** - useGlobalForm vs useGlobalFormaState
-   **[Library Comparison](./docs/library-comparison-en.md)** - Forma vs other libraries

### 한국어 (Korean)

-   **[시작 가이드](./docs/getting-started-ko.md)** - 단계별 튜토리얼과 예제
-   **[API 레퍼런스](./docs/API-ko.md)** - 완전한 API 문서와 예제
-   **[예제 모음](./docs/examples-ko.md)** - 실용적인 사용 예제와 패턴
-   **[성능 최적화 가이드](./docs/performance-guide-ko.md)** - 성능 최적화 기법
-   **[성능 최적화 주의사항](./docs/performance-warnings-ko.md)** - 안티패턴과 일반적인 함정
-   **[마이그레이션 가이드](./docs/migration-ko.md)** - 다른 폼 라이브러리에서 이전
-   **[useGlobalForm 가이드](./docs/useGlobalForm-guide-ko.md)** - 글로벌 폼 상태 관리
-   **[글로벌 훅 비교](./docs/global-hooks-comparison-ko.md)** - useGlobalForm vs useGlobalFormaState
-   **[라이브러리 비교](./docs/library-comparison-ko.md)** - Forma vs 다른 라이브러리

### Links | 링크

### 링크

-   🏠 **[GitHub Repository](https://github.com/ehfuse/forma)**
-   📦 **[NPM Package](https://www.npmjs.com/package/@ehfuse/forma)**

---

## Installation | 설치

```bash
npm install @ehfuse/forma
```

```bash
yarn add @ehfuse/forma
```

---

## Quick Start | 빠른 시작

### Zero-Config Usage | Zero-Config 사용법

**Start immediately without any configuration!**  
**설정 없이 바로 시작하세요!**

```tsx
import { useForm, useFormaState } from "@ehfuse/forma";

function ZeroConfigForm() {
    // Zero-Config: Start without any parameters
    // Zero-Config: 매개변수 없이 바로 사용
    const form = useForm<{ name: string; email: string }>();

    return (
        <div>
            <input
                placeholder="Name"
                value={form.useFormValue("name")}
                onChange={(e) => form.setFormValue("name", e.target.value)}
            />
            <input
                placeholder="Email"
                value={form.useFormValue("email")}
                onChange={(e) => form.setFormValue("email", e.target.value)}
            />
            <button onClick={() => console.log(form.getFormValues())}>
                Log Values
            </button>
        </div>
    );
}

function ZeroConfigState() {
    // Zero-Config: General state without configuration
    // Zero-Config: 일반 상태도 설정 없이 사용
    const state = useFormaState<{ count: number }>();

    return (
        <div>
            <p>Count: {state.useValue("count") || 0}</p>
            <button
                onClick={() =>
                    state.setValue("count", (state.getValue("count") || 0) + 1)
                }
            >
                Increment
            </button>
        </div>
    );
}
```

### Form State Management | 폼 상태 관리

```tsx
import { useForm } from "@ehfuse/forma";

function MyForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
        onValidate: async (values) => {
            // Name validation
            // 이름 검증
            if (!values.name.trim()) {
                alert("Please enter your name.");
                return false;
            }

            // Email validation
            // 이메일 검증
            if (!values.email.includes("@")) {
                alert("Please enter a valid email address.");
                return false;
            }

            return true; // Validation passed
        },
        onSubmit: async (values) => {
            console.log("Submit:", values);
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
            <button type="submit">Submit</button>
        </form>
    );
}
```

### General State Management | 일반 상태 관리

```tsx
import { useFormaState } from "@ehfuse/forma";

function UserDashboard() {
    const state = useFormaState({
        todos: [
            { id: 1, text: "Learn React", completed: false },
            { id: 2, text: "Build app", completed: false },
        ],
        filter: "all",
    });

    // Individual field subscription - re-renders only when that field changes
    // 개별 필드 구독 - 해당 필드가 변경될 때만 리렌더링
    const filter = state.useValue("filter");

    // ✅ Subscribe only to array length (re-renders only when items are added/removed)
    // ✅ 배열 길이만 구독 (항목 추가/삭제 시에만 리렌더링)
    const todosLength = state.useValue("todos.length");

    // ✅ Subscribe to specific todo text (utilizing dot notation)
    // ✅ 특정 할 일의 텍스트만 구독 (dot notation 활용)
    const firstTodoText = state.useValue("todos.0.text");

    const addTodo = () => {
        const todos = state.getValues().todos;
        state.setValue("todos", [
            ...todos,
            { id: Date.now(), text: "New todo", completed: false },
        ]);
    };

    return (
        <div>
            <p>Filter: {filter}</p>
            <p>First Todo: {firstTodoText}</p>
            <p>Total Count: {todosLength}</p>
            <button onClick={addTodo}>Add Todo</button>
            <button onClick={() => state.setValue("filter", "completed")}>
                Show Completed
            </button>
        </div>
    );
}
```

---

## When to choose Forma?

Forma is **specialized for form state management** and shines in specific scenarios. Here's when Forma is the perfect choice for your project.

### Perfect for these use cases:

**🎨 MUI (Material-UI) Projects**

-   Seamless integration with MUI components
-   No additional wrapper components needed
-   Built-in support for MUI's controlled component patterns

**⚡ Performance-Critical Forms**

-   Large forms with many fields (50+ inputs)
-   Real-time data visualization forms
-   Forms that update frequently during user interaction

**🔄 Multi-Step & Global Forms**

-   Wizard-style multi-step forms
-   Forms shared across multiple components
-   Registration flows with data persistence

**🏗️ Complex Nested Data**

-   User profiles with nested address/contact info
-   Product configurations with multiple layers
-   Settings panels with grouped options

**📊 Dynamic Form Generation**

-   Forms generated from API schemas
-   Conditional field rendering
-   Dynamic validation rules

## 언제 Forma를 선택해야 할까요?

Forma는 **폼 상태 관리에 특화**된 라이브러리로 특정 시나리오에서 빛을 발합니다. 다음은 Forma가 프로젝트에 완벽한 선택이 되는 경우입니다.

### 이런 경우에 완벽합니다:

**🎨 MUI (Material-UI) 프로젝트**

-   MUI 컴포넌트와 완벽한 통합
-   추가 래퍼 컴포넌트 불필요
-   MUI의 제어 컴포넌트 패턴 내장 지원

**⚡ 성능이 중요한 폼**

-   많은 필드가 있는 대규모 폼 (50개 이상 입력)
-   실시간 데이터 시각화 폼
-   사용자 상호작용 중 자주 업데이트되는 폼

**🔄 멀티 스텝 & 글로벌 폼**

-   마법사 스타일의 멀티 스텝 폼
-   여러 컴포넌트에서 공유되는 폼
-   데이터 지속성이 있는 등록 플로우

**🏗️ 복잡한 중첩 데이터**

-   중첩된 주소/연락처 정보가 있는 사용자 프로필
-   다층 구조의 제품 구성
-   그룹화된 옵션이 있는 설정 패널

**📊 동적 폼 생성**

-   API 스키마에서 생성되는 폼
-   조건부 필드 렌더링
-   동적 검증 규칙

---

## Core Performance Principles | 핵심 성능 원칙

```tsx
// ✅ Efficient: Individual field subscription
// ✅ 효율적: 개별 필드 구독
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");

// When user.name changes → Only userName field re-renders
// user.name 변경 시 → userName 필드만 리렌더링
```

**[View Detailed Performance Guide](./docs/performance-guide-en.md)**

---

## Links | 링크

-   **📦 NPM**: [https://www.npmjs.com/package/@ehfuse/forma](https://www.npmjs.com/package/@ehfuse/forma)
-   **🐙 GitHub**: [https://github.com/ehfuse/forma](https://github.com/ehfuse/forma)
-   **📄 License**: [MIT](https://github.com/ehfuse/forma/blob/main/LICENSE)

---

## Contact | 연락처

-   **Developer**: 김영진 (KIM YOUNG JIN)
-   **Email**: ehfuse@gmail.com
-   **GitHub**: [@ehfuse](https://github.com/ehfuse)

---

Copyright (c) 2025 김영진 (KIM YOUNG JIN) - MIT License
