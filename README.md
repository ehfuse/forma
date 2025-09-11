<!-- slide -->

# Forma

**Advanced React form state management library**
고급 React 폼 상태 관리 라이브러리

## 📚 Documentation | 문서

### 한국어 | Korean

- 🚀 **[시작 가이드](./docs/getting-started-ko.md)** - 단계별 튜토리얼과 예제
- 📖 **[완전한 문서](./docs/README-ko.md)** - API 레퍼런스, 사용 사례, 고급 기능
- 📋 **[API 레퍼런스](./docs/API-ko.md)** - 모든 메서드, 타입, 마이그레이션 가이드
- ⚡ **[성능 최적화 가이드](./docs/best-practices-ko.md)** - 최고 성능을 위한 모범 사례
- 🏠 **[GitHub](https://github.com/ehfuse/forma)**

### English

- 🚀 **[Getting Started Guide](./docs/getting-started-en.md)** - Step-by-step tutorial and examples
- 📖 **[Complete Documentation](./docs/README-en.md)** - API reference, use cases, advanced features
- 📋 **[API Reference](./docs/API-en.md)** - All methods, types, migration guide
- ⚡ **[Performance Optimization Guide](./docs/best-practices-en.md)** - Best practices for optimal performance
- 🏠 **[GitHub](https://github.com/ehfuse/forma)**

Forma는 React 애플리케이션에서 폼 상태를 효율적으로 관리하기 위한 고성능 라이브러리입니다. 개별 필드 구독을 통한 선택적 리렌더링과 글로벌 폼 상태 공유 기능을 제공합니다.

_Forma is a high-performance library for efficiently managing form state in React applications. It provides selective re-rendering through individual field subscriptions and global form state sharing capabilities._

## 🚀 주요 특징 | Key Features

- ✅ **개별 필드 구독** | **Individual Field Subscription**: 필드별 선택적 리렌더링으로 최적화된 성능
- ✅ **Dot Notation 최적화** | **Dot Notation Optimization**: `user.profile.name` 형태의 중첩 객체 접근
- ✅ **MUI 완전 호환** | **Full MUI Compatibility**: Material-UI 컴포넌트와 완벽한 통합
- ✅ **글로벌 폼 상태** | **Global Form State**: 여러 컴포넌트 간 폼 상태 공유
- ✅ **폼 등록 시스템** | **Form Registration System**: 기존 폼을 글로벌로 등록 가능
- ✅ **TypeScript 완전 지원** | **Full TypeScript Support**: 강력한 타입 안전성
- ✅ **React 19 최적화** | **React 19 Optimized**: 최신 React 기능 활용

## 📦 설치 | Installation

```bash
npm install @ehfuse/forma
```

```bash
yarn add @ehfuse/forma
```

## 🎯 빠른 시작 | Quick Start

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

## � 문서 | Documentation

### 한국어 | Korean

- 📖 **[완전한 문서](./docs/README-ko.md)** - API 레퍼런스, 사용 사례, 고급 기능
- 🌐 **[useGlobalForm 사용법](./docs/useGlobalForm-guide-ko.md)** - 글로벌 폼 상태 관리 가이드
- ⚡ **[성능 최적화 가이드](./docs/best-practices-ko.md)** - 최고 성능을 위한 모범 사례

### English

- 📖 **[Complete Documentation](./docs/README-en.md)** - API reference, use cases, advanced features
- 🌐 **[useGlobalForm Usage Guide](./docs/useGlobalForm-guide-en.md)** - Global form state management guide
- ⚡ **[Performance Optimization Guide](./docs/best-practices-en.md)** - Best practices for optimal performance

## 🎯 When to choose Forma?

언제 Forma를 선택해야 할까요?

Forma is **specialized for form state management** and shines in specific scenarios. Here's when Forma is the perfect choice for your project.

Forma는 **폼 상태 관리에 특화**된 라이브러리로 특정 시나리오에서 빛을 발합니다. 다음은 Forma가 프로젝트에 완벽한 선택이 되는 경우입니다.

### ✨ Perfect for these use cases:

이런 경우에 완벽합니다:

**🎨 MUI (Material-UI) Projects**
**MUI (Material-UI) 프로젝트**

- Seamless integration with MUI components
  MUI 컴포넌트와 완벽한 통합
- No additional wrapper components needed
  추가 래퍼 컴포넌트 불필요
- Built-in support for MUI's controlled component patterns
  MUI의 제어 컴포넌트 패턴 내장 지원

**⚡ Performance-Critical Forms**
**성능이 중요한 폼**

- Large forms with many fields (50+ inputs)
  많은 필드가 있는 대규모 폼 (50개 이상 입력)
- Real-time data visualization forms
  실시간 데이터 시각화 폼
- Forms that update frequently during user interaction
  사용자 상호작용 중 자주 업데이트되는 폼

**🔄 Multi-Step & Global Forms**
**멀티 스텝 & 글로벌 폼**

- Wizard-style multi-step forms
  마법사 스타일의 멀티 스텝 폼
- Forms shared across multiple components
  여러 컴포넌트에서 공유되는 폼
- Registration flows with data persistence
  데이터 지속성이 있는 등록 플로우

**🏗️ Complex Nested Data**
**복잡한 중첩 데이터**

- User profiles with nested address/contact info
  중첩된 주소/연락처 정보가 있는 사용자 프로필
- Product configurations with multiple layers
  다층 구조의 제품 구성
- Settings panels with grouped options
  그룹화된 옵션이 있는 설정 패널

**📊 Dynamic Form Generation**
**동적 폼 생성**

- Forms generated from API schemas
  API 스키마에서 생성되는 폼
- Conditional field rendering
  조건부 필드 렌더링
- Dynamic validation rules
  동적 검증 규칙

## 🎯 핵심 성능 원칙 | Core Performance Principles

```tsx
// ✅ 효율적 | Efficient: 개별 필드 구독 | Individual field subscription
const userName = form.useFormValue("user.name");
const userEmail = form.useFormValue("user.email");

// user.name 변경 시 → userName 필드만 리렌더링 | Only userName field re-renders
```

**[성능 최적화 상세 가이드 보기 | View Detailed Performance Guide](./docs/best-practices-ko.md)**

## 🌐 링크 | Links

- **📦 NPM**: [https://www.npmjs.com/package/@ehfuse/forma](https://www.npmjs.com/package/@ehfuse/forma)
- **🐙 GitHub**: [https://github.com/ehfuse/forma](https://github.com/ehfuse/forma)
- **📄 라이선스 | License**: [MIT](./LICENSE)

## 📞 연락처 | Contact

- **개발자 | Developer**: 김영진 (KIM YOUNG JIN)
- **이메일 | Email**: ehfuse@gmail.com
- **GitHub**: [@ehfuse](https://github.com/ehfuse)

---

Copyright (c) 2025 김영진 (KIM YOUNG JIN) - MIT License
