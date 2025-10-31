# Forma

**High-performance and developer-friendly React form state management library**  
**고성능이며 개발자 친화적인 React 폼 상태 관리 라이브러리**

[![npm version](https://img.shields.io/npm/v/@ehfuse/forma.svg)](https://www.npmjs.com/package/@ehfuse/forma)
[![npm downloads](https://img.shields.io/npm/dm/@ehfuse/forma.svg)](https://www.npmjs.com/package/@ehfuse/forma)
[![GitHub license](https://img.shields.io/github/license/ehfuse/forma.svg)](https://github.com/ehfuse/forma/blob/main/LICENSE)

Forma is a high-performance library that makes form and state management in React applications **simple yet powerful**. **Start immediately with Zero-Config**, and achieve optimal performance through **selective re-rendering** via individual field subscriptions. Easily access production-level advanced features like **global form state sharing**, **Dot Notation nested object access**, and **full MUI compatibility** without complex setup.

Forma는 React 애플리케이션에서 폼과 상태를 **간편하면서도 강력하게** 관리할 수 있는 고성능 라이브러리입니다. **Zero-Config로 바로 시작**할 수 있으며, 개별 필드 구독을 통한 **선택적 리렌더링**으로 최적의 성능을 제공합니다. 복잡한 설정 없이도 **글로벌 폼 상태 공유**, **Dot Notation 중첩 객체 접근**, **MUI 완전 호환** 등 프로덕션 레벨의 고급 기능들을 손쉽게 사용할 수 있습니다.

## Why Forma? | 왜 Forma인가?

Forma는 단순한 폼 라이브러리가 아닙니다. **React 상태 관리의 패러다임을 바꾸는** 혁신적인 솔루션입니다.

### 🚀 The Ultimate State Management Solution | 최강의 상태 관리 솔루션

#### 1. **Watch + Actions = No More useEffect & useState & Context**

**useEffect, useState, Context 지옥에서 탈출하세요**

```tsx
// ❌ Traditional: useEffect + useState + Context + Props Drilling
const AuthContext = createContext(null);

function App() {
    const [logined, setLogined] = useState(false);
    const [syncInterval, setSyncInterval] = useState(null);

    useEffect(() => {
        if (logined) {
            const interval = setInterval(() => syncData(), 5000);
            setSyncInterval(interval);
        } else {
            if (syncInterval) clearInterval(syncInterval);
            setSyncInterval(null);
        }
    }, [logined]);

    // Props drilling or Context Provider needed
    return (
        <AuthContext.Provider value={{ logined, setLogined }}>
            <Header />
            <Main />
            <Footer />
        </AuthContext.Provider>
    );
}

// ✅ Forma: Clean and declarative
const state = useGlobalFormaState({
    stateId: "auth",
    initialValues: {
        logined: false,
        user: { name: "", email: "" },
        syncInterval: null,
    },
    actions: {
        startSync: (ctx) => {
            const interval = setInterval(() => syncData(), 5000);
            ctx.setValue("syncInterval", interval);
        },
        stopSync: (ctx) => {
            const interval = ctx.getValue("syncInterval");
            if (interval) clearInterval(interval);
            ctx.setValue("syncInterval", null);
        },
    },
    watch: {
        logined: (ctx, value) => {
            value ? ctx.actions.startSync(ctx) : ctx.actions.stopSync(ctx);
        },
        "user.email": (ctx, value) => {
            console.log("Email changed:", value);
        },
    },
});
```

**Benefits | 이점:**

-   🧹 **No useEffect clutter** | useEffect 없이 깔끔한 코드
-   � **No Context needed** | Context API 불필요
-   🎯 **No Props Drilling** | Props 전달 지옥 탈출
-   �📦 **Modular logic** | 로직을 별도 파일로 분리 가능
-   🧪 **Easy testing** | actions/watch 단독 테스트 용이
-   🎯 **Better code cohesion** | 높은 코드 응집도

#### 2. **Surgical Re-rendering**

**수술적 정밀도의 리렌더링**

```tsx
// ❌ Redux/Context: Entire component re-renders
const { user, todos, settings } = useStore(); // or useContext(AppContext)
// All fields change = entire component re-renders

// ✅ Forma: Only what you need
const userName = state.useValue("user.name"); // Only this field
const todoCount = state.useValue("todos.length"); // Only array length
const theme = state.useValue("settings.theme"); // Only theme
// Each component subscribes to ONLY what it needs
```

**Performance | 성능:**

-   ⚡ **10-100x faster** than Redux for large forms | 대규모 폼에서 Redux 대비 10-100배 빠름
-   🎯 **Field-level optimization** | 필드 단위 최적화
-   📊 **No selectors needed** | 셀렉터 불필요
-   🔥 **Zero wasted renders** | 불필요한 렌더링 제로

#### 3. **Form + State + Global Access in One**

**폼, 상태, 글로벌 접근을 하나로**

```tsx
// ❌ Traditional: Multiple libraries + Context boilerplate
import { useForm } from "react-hook-form";
import { create } from "zustand";
import { createContext, useContext } from "react";

// Context setup, Provider wrapping, Props drilling...
const FormContext = createContext(null);

function App() {
    const form = useForm();
    return (
        <FormContext.Provider value={form}>
            <Header />
            <MainContent />
        </FormContext.Provider>
    );
}

// ✅ Forma: One library, zero boilerplate
import { useGlobalForm, useGlobalFormaState } from "@ehfuse/forma";

function Header() {
    // Access anywhere, no Provider needed!
    const state = useGlobalFormaState<AuthState>({ stateId: "auth" });
    const userName = state.useValue("user.name");
}

function MainContent() {
    // Same state, no props drilling
    const state = useGlobalFormaState<AuthState>({ stateId: "auth" });
}
```

**All-in-One | 올인원:**

-   📝 **Form management** | 폼 관리
-   🌐 **Global state (no Context!)** | 전역 상태 (Context 불필요!)
-   🚫 **No Props Drilling** | Props 전달 불필요
-   👀 **Reactive watch** | 반응형 감시
-   🎬 **Actions system** | 액션 시스템
-   🎭 **Modal management** | 모달 관리
-   📱 **Breakpoint detection** | 반응형 감지

## Key Features | 주요 특징

-   🎯 **Zero-Config**: Start immediately | 설정 없이 즉시 시작
-   👀 **Watch System**: Replace useEffect with declarative watchers | useEffect를 선언적 watcher로 대체
-   � **Actions Pattern**: Modular business logic | 모듈화된 비즈니스 로직
-   ✅ **Individual Field Subscription**: Surgical re-rendering | 수술적 리렌더링
-   🌟 **Dot Notation**: Deep nested access `user.profile.name` | 깊은 중첩 접근
-   🌐 **Global State Sharing**: Share across components | 컴포넌트 간 공유
-   🎭 **Modal Stack**: Mobile-friendly with back button | 뒤로가기 지원 모달
-   📱 **Breakpoint Management**: Responsive UI made easy | 반응형 UI 간편화
-   ✅ **Full MUI Compatibility**: Perfect Material-UI integration | MUI 완벽 통합
-   ✅ **TypeScript Native**: Full type safety | 완전한 타입 안전성

## Documentation | 문서

### English

-   **[Getting Started Guide](./docs/en/getting-started.md)** - Step-by-step tutorial and examples
-   **[API Reference](./docs/en/API.md)** - Complete API documentation with examples
-   **[Examples Collection](./docs/en/examples.md)** - Practical usage examples and patterns
-   **[Performance Guide](./docs/en/performance-guide.md)** - Performance optimization techniques
-   **[Performance Warnings](./docs/en/performance-warnings.md)** - Anti-patterns and common pitfalls
-   **[Migration Guide](./docs/en/migration.md)** - Migrate from other form libraries
-   **[useGlobalForm Guide](./docs/en/useGlobalForm-guide.md)** - Global form state management
-   **[Global Hooks Comparison](./docs/en/global-hooks-comparison.md)** - useGlobalForm vs useGlobalFormaState
-   **[Library Comparison](./docs/en/library-comparison.md)** - Forma vs other libraries

### 한국어 (Korean)

-   **[시작 가이드](./docs/ko/getting-started.md)** - 단계별 튜토리얼과 예제
-   **[API 레퍼런스](./docs/ko/API.md)** - 완전한 API 문서와 예제
-   **[예제 모음](./docs/ko/examples.md)** - 실용적인 사용 예제와 패턴
-   **[성능 최적화 가이드](./docs/ko/performance-guide.md)** - 성능 최적화 기법
-   **[성능 최적화 주의사항](./docs/ko/performance-warnings.md)** - 안티패턴과 일반적인 함정
-   **[마이그레이션 가이드](./docs/ko/migration.md)** - 다른 폼 라이브러리에서 이전
-   **[useGlobalForm 가이드](./docs/ko/useGlobalForm-guide.md)** - 글로벌 폼 상태 관리
-   **[글로벌 훅 비교](./docs/ko/global-hooks-comparison.md)** - useGlobalForm vs useGlobalFormaState
-   **[라이브러리 비교](./docs/ko/library-comparison.md)** - Forma vs 다른 라이브러리

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

```bash
npm install @ehfuse/forma
```

### Real-World Example: Todo App with Watch | 실전 예제: Watch를 활용한 Todo 앱

```tsx
import { useGlobalFormaState } from "@ehfuse/forma";

// 🎯 Separate actions file for better organization
// 액션을 별도 파일로 분리하여 코드 응집도 향상
const todoActions = {
    addTodo: (ctx, text: string) => {
        const todos = ctx.values.todos;
        ctx.setValue("todos", [
            ...todos,
            {
                id: Date.now(),
                text,
                completed: false,
            },
        ]);
    },

    toggleTodo: (ctx, id: number) => {
        const todos = ctx.values.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
        );
        ctx.setValue("todos", todos);
    },

    // Auto-save to localStorage
    saveToStorage: (ctx) => {
        localStorage.setItem("todos", JSON.stringify(ctx.values.todos));
    },
};

function TodoApp() {
    const state = useGlobalFormaState({
        stateId: "todo-app",
        initialValues: {
            todos: [],
            filter: "all",
            lastSync: null,
        },
        actions: todoActions,
        watch: {
            // 👀 Auto-save when todos change (replaces useEffect!)
            // todos 변경 시 자동 저장 (useEffect 불필요!)
            todos: (ctx, value) => {
                ctx.actions.saveToStorage(ctx);
                ctx.setValue("lastSync", new Date().toISOString());
            },

            // 🎯 Log filter changes
            filter: (ctx, value, prevValue) => {
                console.log(`Filter changed: ${prevValue} → ${value}`);
            },
        },
    });

    // ✅ Surgical re-rendering: Only subscribes to what's needed
    // 수술적 리렌더링: 필요한 것만 구독
    const todosLength = state.useValue("todos.length");
    const filter = state.useValue("filter");
    const lastSync = state.useValue("lastSync");

    return (
        <div>
            <h1>Todos ({todosLength})</h1>
            <p>Last synced: {lastSync}</p>

            <button onClick={() => state.actions.addTodo(state, "New Task")}>
                Add Todo
            </button>

            <select
                value={filter}
                onChange={(e) => state.setValue("filter", e.target.value)}
            >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
            </select>
        </div>
    );
}
```

**What you gain | 얻는 것:**

-   🧹 **No useEffect** - Watch handles all side effects | useEffect 제거 - Watch가 모든 부수효과 처리
-   📦 **Modular actions** - Easy to test and maintain | 모듈화된 액션 - 테스트와 유지보수 용이
-   ⚡ **Optimized rendering** - Only `todosLength`, `filter`, `lastSync` trigger re-renders | 최적화된 렌더링
-   🔄 **Automatic persistence** - Watch auto-saves changes | 자동 저장 - Watch가 변경사항 자동 저장

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

## Architecture Benefits | 아키텍처 이점

### 📁 Clean Separation of Concerns | 관심사의 명확한 분리

```tsx
// actions.ts - Business logic isolated
// actions.ts - 비즈니스 로직 분리
export const authActions = {
    login: async (ctx, credentials) => {
        const user = await api.login(credentials);
        ctx.setValues({ logined: true, user, token: user.token });
    },
    logout: (ctx) => {
        ctx.setValues({ logined: false, user: null, token: null });
    },
    startSync: (ctx) => {
        /* ... */
    },
    stopSync: (ctx) => {
        /* ... */
    },
};

// watch.ts - Side effects isolated
// watch.ts - 부수효과 분리
export const authWatch = {
    logined: (ctx, value) => {
        value ? ctx.actions.startSync(ctx) : ctx.actions.stopSync(ctx);
    },
    "user.preferences": (ctx, value) => {
        localStorage.setItem("prefs", JSON.stringify(value));
    },
};

// component.tsx - Pure UI
// component.tsx - 순수 UI
function AuthApp() {
    const state = useGlobalFormaState({
        stateId: "auth",
        actions: authActions,
        watch: authWatch,
    });

    // Clean, declarative UI
    // 깔끔한 선언적 UI
    return <LoginForm onSubmit={state.actions.login} />;
}
```

**Benefits | 이점:**

-   🧪 **Testable**: Test actions/watch independently | 독립적 테스트 가능
-   📦 **Reusable**: Share logic across projects | 프로젝트 간 로직 공유
-   🔍 **Maintainable**: Easy to locate and update logic | 로직 위치 파악 및 수정 용이
-   👥 **Team-friendly**: Clear code organization | 명확한 코드 구조

### ⚡ Performance Comparison | 성능 비교

```tsx
// ❌ Redux: Entire component re-renders
const state = useSelector((state) => state); // Everything triggers re-render
// 전체 컴포넌트 리렌더링

// ❌ Context: All consumers re-render
const { user, todos, settings } = useContext(AppContext);
// 모든 컨슈머 리렌더링

// ✅ Forma: Surgical precision
const userName = state.useValue("user.name"); // Only this
const todoCount = state.useValue("todos.length"); // Only this
const theme = state.useValue("settings.theme"); // Only this
// 수술적 정밀도
```

**Real-world impact | 실제 영향:**

-   📊 **50+ fields**: 10-100x faster than Redux | Redux 대비 10-100배 빠름
-   ⚡ **Real-time forms**: Smooth 60fps performance | 부드러운 60fps 성능
-   📱 **Mobile**: Better battery life | 배터리 수명 향상
-   🎯 **Zero wasted renders**: Every render is intentional | 모든 렌더링이 의도적

**[View Detailed Performance Guide](./docs/en/performance-guide.md)** | **[성능 가이드 보기](./docs/ko/performance-guide.md)**

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
