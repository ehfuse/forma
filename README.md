# Forma

**High-performance and developer-friendly React form state management library**  
고성능이며 개발자 친화적인 React 폼 상태 관리 라이브러리

[![npm version](https://img.shields.io/npm/v/@ehfuse/forma.svg)](https://www.npmjs.com/package/@ehfuse/forma)
[![npm downloads](https://img.shields.io/npm/dm/@ehfuse/forma.svg)](https://www.npmjs.com/package/@ehfuse/forma)
[![GitHub license](https://img.shields.io/github/license/ehfuse/forma.svg)](https://github.com/ehfuse/forma/blob/main/LICENSE)

Forma는 React 애플리케이션에서 폼과 상태를 **간편하면서도 강력하게** 관리할 수 있는 고성능 라이브러리입니다. **Zero-Config로 바로 시작**할 수 있으며, 개별 필드 구독을 통한 **선택적 리렌더링**으로 최적의 성능을 제공합니다. 복잡한 설정 없이도 **글로벌 폼 상태 공유**, **Dot Notation 중첩 객체 접근**, **MUI 완전 호환** 등 프로덕션 레벨의 고급 기능들을 손쉽게 사용할 수 있습니다.

_Forma is a high-performance library that makes form and state management in React applications **simple yet powerful**. **Start immediately with Zero-Config**, and achieve optimal performance through **selective re-rendering** via individual field subscriptions. Easily access production-level advanced features like **global form state sharing**, **Dot Notation nested object access**, and **full MUI compatibility** without complex setup._

## 📚 Documentation | 문서

### 한국어 (Korean)

-   🚀 **[시작 가이드](https://github.com/ehfuse/forma/blob/main/docs/getting-started-ko.md)** - 단계별 튜토리얼과 예제
-   **[API 레퍼런스](https://github.com/ehfuse/forma/blob/main/docs/API-ko.md)** - 모든 메서드, 타입, 마이그레이션 가이드
-   ⚡ **[성능 최적화 가이드](https://github.com/ehfuse/forma/blob/main/docs/best-practices-ko.md)** - 최고 성능을 위한 모범 사례

### English

-   🚀 **[Getting Started Guide](https://github.com/ehfuse/forma/blob/main/docs/getting-started-en.md)** - Step-by-step tutorial and examples
-   📋 **[API Reference](https://github.com/ehfuse/forma/blob/main/docs/API-en.md)** - All methods, types, migration guide
-   ⚡ **[Performance Optimization Guide](https://github.com/ehfuse/forma/blob/main/docs/best-practices-en.md)** - Best practices for optimal performance

### Links | 링크

-   🏠 **[GitHub Repository](https://github.com/ehfuse/forma)**
-   📦 **[NPM Package](https://www.npmjs.com/package/@ehfuse/forma)**

---

## 🚀 주요 특징 | Key Features

-   🎯 **완전한 Zero-Config** | **Complete Zero-Config**: 설정 없이 바로 사용 가능한 개발 경험
-   ✅ **개별 필드 구독** | **Individual Field Subscription**: 필드별 선택적 리렌더링으로 최적화된 성능
-   ✅ **범용 상태 관리** | **General State Management**: `useFormaState`로 폼 외 일반 상태도 효율적 관리
-   ✅ **Dot Notation 최적화** | **Dot Notation Optimization**: `user.profile.name` 형태의 중첩 객체 접근
-   ✅ **MUI 완전 호환** | **Full MUI Compatibility**: Material-UI 컴포넌트와 완벽한 통합
-   ✅ **글로벌 폼 상태** | **Global Form State**: 여러 컴포넌트 간 폼 상태 공유
-   ✅ **폼 등록 시스템** | **Form Registration System**: 기존 폼을 글로벌로 등록 가능
-   ✅ **TypeScript 완전 지원** | **Full TypeScript Support**: 강력한 타입 안전성
-   ✅ **React 19 최적화** | **React 19 Optimized**: 최신 React 기능 활용

---

## 📦 설치 | Installation

```bash
npm install @ehfuse/forma
```

```bash
yarn add @ehfuse/forma
```

---

## 🎯 빠른 시작 | Quick Start

### 💫 Zero-Config 사용법 | Zero-Config Usage

**설정 없이 바로 시작하세요! | Start immediately without any configuration!**

```tsx
import { useForm, useFormaState } from "@ehfuse/forma";

function ZeroConfigForm() {
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

### 폼 상태 관리 | Form State Management

```tsx
import { useForm } from "@ehfuse/forma";

function MyForm() {
    const form = useForm({
        initialValues: { name: "", email: "" },
        onSubmit: async (values) => {
            console.log("제출 | Submit:", values);
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
            <button type="submit">제출 | Submit</button>
        </form>
    );
}
```

### 일반 상태 관리 | General State Management

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

    // 개별 필드 구독 - 해당 필드가 변경될 때만 리렌더링
    const filter = state.useValue("filter");

    // ✅ 배열 길이만 구독 (항목 추가/삭제 시에만 리렌더링)
    const todosLength = state.useValue("todos.length");

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
            <p>필터: {filter}</p>
            <p>첫 번째 할 일: {firstTodoText}</p>
            <p>총 개수: {todosLength}</p>
            <button onClick={addTodo}>할 일 추가</button>
            <button onClick={() => state.setValue("filter", "completed")}>
                완료된 항목 보기
            </button>
        </div>
    );
}
```

---

## 🎯 When to choose Forma?

**언제 Forma를 선택해야 할까요?**

Forma is **specialized for form state management** and shines in specific scenarios. Here's when Forma is the perfect choice for your project.

_Forma는 **폼 상태 관리에 특화**된 라이브러리로 특정 시나리오에서 빛을 발합니다. 다음은 Forma가 프로젝트에 완벽한 선택이 되는 경우입니다._

### ✨ Perfect for these use cases:

**이런 경우에 완벽합니다:**

**🎨 MUI (Material-UI) Projects**
**MUI (Material-UI) 프로젝트**

-   Seamless integration with MUI components
    MUI 컴포넌트와 완벽한 통합
-   No additional wrapper components needed
    추가 래퍼 컴포넌트 불필요
-   Built-in support for MUI's controlled component patterns
    MUI의 제어 컴포넌트 패턴 내장 지원

**⚡ Performance-Critical Forms**
**성능이 중요한 폼**

-   Large forms with many fields (50+ inputs)
    많은 필드가 있는 대규모 폼 (50개 이상 입력)
-   Real-time data visualization forms
    실시간 데이터 시각화 폼
-   Forms that update frequently during user interaction
    사용자 상호작용 중 자주 업데이트되는 폼

**🔄 Multi-Step & Global Forms**
**멀티 스텝 & 글로벌 폼**

-   Wizard-style multi-step forms
    마법사 스타일의 멀티 스텝 폼
-   Forms shared across multiple components
    여러 컴포넌트에서 공유되는 폼
-   Registration flows with data persistence
    데이터 지속성이 있는 등록 플로우

**🏗️ Complex Nested Data**
**복잡한 중첩 데이터**

-   User profiles with nested address/contact info
    중첩된 주소/연락처 정보가 있는 사용자 프로필
-   Product configurations with multiple layers
    다층 구조의 제품 구성
-   Settings panels with grouped options
    그룹화된 옵션이 있는 설정 패널

**📊 Dynamic Form Generation**
**동적 폼 생성**

-   Forms generated from API schemas
    API 스키마에서 생성되는 폼
-   Conditional field rendering
    조건부 필드 렌더링
-   Dynamic validation rules
    동적 검증 규칙

---

## 🎯 핵심 성능 원칙 | Core Performance Principles

```tsx
// ✅ 효율적 | Efficient: 개별 필드 구독 | Individual field subscription
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");

// user.name 변경 시 → userName 필드만 리렌더링 | Only userName field re-renders
```

**[성능 최적화 상세 가이드 보기 | View Detailed Performance Guide](https://github.com/ehfuse/forma/blob/main/docs/best-practices-ko.md)**

---

## 🌐 링크 | Links

-   **📦 NPM**: [https://www.npmjs.com/package/@ehfuse/forma](https://www.npmjs.com/package/@ehfuse/forma)
-   **🐙 GitHub**: [https://github.com/ehfuse/forma](https://github.com/ehfuse/forma)
-   **📄 라이선스 | License**: [MIT](https://github.com/ehfuse/forma/blob/main/LICENSE)

---

## 📞 연락처 | Contact

-   **개발자 | Developer**: 김영진 (KIM YOUNG JIN)
-   **이메일 | Email**: ehfuse@gmail.com
-   **GitHub**: [@ehfuse](https://github.com/ehfuse)

---

Copyright (c) 2025 김영진 (KIM YOUNG JIN) - MIT License
