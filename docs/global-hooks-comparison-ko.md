# useGlobalForm vs useGlobalFormaState 비교 및 활용 가이드

## 📋 개요

Forma 라이브러리는 두 가지 글로벌 상태 관리 훅을 제공합니다:

-   `useGlobalForm`: 폼 전용 전역 상태 관리
-   `useGlobalFormaState`: 일반적인 전역 상태 관리

각각의 특징과 적절한 사용 시나리오를 이해하는 것이 중요합니다.

## 🔍 주요 차이점

### useGlobalForm 🔷

**목적**: HTML 폼 요소들의 전역 관리
**Props**: `formId` (폼이므로 적절함)

**포함 기능**:

-   ✅ 폼 검증 (validation)
-   ✅ 폼 제출 (submit)
-   ✅ 제출 상태 (isSubmitting)
-   ✅ 에러 처리
-   ✅ onSubmit 콜백
-   ✅ 완료 콜백 (onComplete)

**사용 예시**:

```typescript
const form = useGlobalForm({
    formId: "checkout-form",
    initialValues: { name: "", email: "" },
    validation: { name: "required" },
    onSubmit: async (values) => {
        /* 제출 로직 */
    },
});

form.validate(); // 검증
form.submit(); // 제출
```

### useGlobalFormaState 🔶

**목적**: 일반적인 앱 상태의 전역 관리
**Props**: `stateId` (일반 상태이므로 더 적절함)

**포함 기능**:

-   ✅ 개별 필드 구독
-   ✅ 최적화된 렌더링
-   ✅ 순수한 상태 관리
-   ❌ 폼 검증 없음
-   ❌ 폼 제출 기능 없음
-   ❌ 제출 상태 없음

**사용 예시**:

```typescript
const state = useGlobalFormaState({
    stateId: "app-state",
});

const userName = state.useValue("user.name"); // name 변경시만 리렌더
state.setValue("user.name", "John"); // 상태 업데이트
```

## 🎯 실제 활용 시나리오

### 1. 전자상거래 앱 🛒

#### useGlobalFormaState 활용

```typescript
// 전역 앱 상태 관리
const appState = useGlobalFormaState({ stateId: "ecommerce-app" });

// 컴포넌트별 개별 필드 구독
const cartItems = appState.useValue("cart.items"); // 장바구니
const userInfo = appState.useValue("user.profile"); // 사용자 정보
const theme = appState.useValue("ui.theme"); // 테마 설정
const filters = appState.useValue("search.filters"); // 검색 필터
```

#### useGlobalForm 활용

```typescript
// 체크아웃 폼 관리 (여러 단계에서 공유)
const checkoutForm = useGlobalForm({
    formId: "checkout-form",
    validation: {
        email: "required|email",
        address: "required",
        paymentMethod: "required",
    },
    onSubmit: async (values) => {
        // 주문 처리 로직
        await processOrder(values);
    },
});
```

### 2. 소셜 미디어 앱 📱

#### useGlobalFormaState 활용

```typescript
// 실시간 데이터 상태 관리
const socialState = useGlobalFormaState({ stateId: "social-app" });

// 각 컴포넌트에서 필요한 데이터만 구독
const timeline = socialState.useValue("timeline.posts");
const notifications = socialState.useValue("notifications.unread");
const currentUser = socialState.useValue("user.profile");
const chatMessages = socialState.useValue("chat.messages");
```

#### useGlobalForm 활용

```typescript
// 게시물 작성 폼 (여러 페이지에서 접근 가능)
const postForm = useGlobalForm({
    formId: "create-post",
    validation: {
        content: "required|min:1",
        images: "max:5",
    },
    onSubmit: async (values) => {
        await createPost(values);
    },
});
```

### 3. 대시보드/관리자 패널 📊

#### useGlobalFormaState 활용

```typescript
// 대시보드 상태 관리
const dashboardState = useGlobalFormaState({ stateId: "admin-dashboard" });

// 실시간 데이터 구독
const metrics = dashboardState.useValue("analytics.metrics");
const userList = dashboardState.useValue("users.list");
const systemStatus = dashboardState.useValue("system.status");
const activeFilters = dashboardState.useValue("filters.current");
```

#### useGlobalForm 활용

```typescript
// 설정 폼 (여러 탭에서 공유)
const settingsForm = useGlobalForm({
    formId: "admin-settings",
    validation: {
        siteName: "required",
        adminEmail: "required|email",
        maxUsers: "required|numeric",
    },
    onSubmit: async (values) => {
        await updateSettings(values);
    },
});
```

### 4. 게임 앱 🎮

#### useGlobalFormaState 활용

```typescript
// 게임 상태 관리
const gameState = useGlobalFormaState({ stateId: "game-state" });

// 게임 데이터 구독
const playerStats = gameState.useValue("player.stats");
const inventory = gameState.useValue("player.inventory");
const gameSettings = gameState.useValue("settings.game");
const leaderboard = gameState.useValue("leaderboard.top10");
```

#### useGlobalForm 활용

```typescript
// 프로필 설정 폼
const profileForm = useGlobalForm({
    formId: "player-profile",
    validation: {
        nickname: "required|min:3|max:20",
        avatar: "required",
    },
    onSubmit: async (values) => {
        await updateProfile(values);
    },
});
```

### 5. 협업 도구 💼

#### useGlobalFormaState 활용

```typescript
// 워크스페이스 상태 관리
const workspaceState = useGlobalFormaState({ stateId: "workspace" });

// 실시간 협업 데이터
const messages = workspaceState.useValue("chat.messages");
const documents = workspaceState.useValue("documents.list");
const members = workspaceState.useValue("workspace.members");
const notifications = workspaceState.useValue("notifications.all");
```

#### useGlobalForm 활용

```typescript
// 문서 생성/편집 폼
const documentForm = useGlobalForm({
    formId: "document-editor",
    validation: {
        title: "required",
        content: "required",
    },
    onSubmit: async (values) => {
        await saveDocument(values);
    },
});
```

## 🔄 상호작용 패턴

### 1. FormaState → Form 방향

```typescript
// 전역 상태에서 폼으로 데이터 전달
const appState = useGlobalFormaState({ stateId: "app" });
const userProfile = appState.useValue("user.profile");

const form = useGlobalForm({
    formId: "edit-profile",
    initialValues: userProfile, // 전역 상태의 데이터를 초기값으로 사용
});
```

### 2. Form → FormaState 방향

```typescript
const form = useGlobalForm({
    formId: "user-form",
    onSubmit: async (values) => {
        await updateUser(values);
        // 폼 제출 성공 후 전역 상태 업데이트
        appState.setValue("user.profile", values);
    },
});
```

### 3. 독립적 운영

-   **FormaState**: 실시간 데이터, 필터, UI 상태 관리
-   **Form**: 사용자 입력, 검증, 제출이 필요한 작업

## 💡 선택 가이드

### useGlobalFormaState를 선택하세요:

-   여러 컴포넌트 간 단순한 상태 공유가 필요할 때
-   실시간 데이터 동기화가 필요할 때
-   UI 상태 (테마, 언어, 사이드바 상태 등) 관리
-   개별 필드 구독으로 성능 최적화가 중요할 때

### useGlobalForm을 선택하세요:

-   실제 HTML 폼 요소들을 관리할 때
-   폼 검증과 제출 로직이 필요할 때
-   여러 단계/페이지에 걸친 폼 상태 유지
-   에러 처리와 로딩 상태 관리가 필요할 때

## ⚠️ 주의사항

1. **적절한 분리**: 상태 관리와 폼 관리를 명확히 구분하여 사용
2. **ID 네이밍**: `formId`는 폼용, `stateId`는 일반 상태용으로 구분
3. **메모리 관리**: 필요하지 않은 전역 상태는 정리하여 메모리 누수 방지
4. **타입 안전성**: TypeScript와 함께 사용하여 타입 안전성 확보

## 📚 관련 문서

-   [시작하기 가이드](./getting-started-ko.md)
-   [API 레퍼런스](./API-ko.md)
-   [예제 모음](./examples-ko.md)
-   [useGlobalForm 가이드](./useGlobalForm-guide-ko.md)
-   [성능 최적화 가이드](./performance-guide-ko.md)
-   [성능 최적화 주의사항](./performance-warnings-ko.md)
-   [마이그레이션 가이드](./migration-ko.md)
-   [라이브러리 비교 가이드](./library-comparison-ko.md)
