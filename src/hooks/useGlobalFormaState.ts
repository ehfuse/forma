/**
 * useGlobalFormaState.ts
 *
 * Forma - 글로벌 FormaState 관리 훅 / Global FormaState management hook
 * 여러 컴포넌트 간 개별 필드 구독 기반 상태 공유를 위한 확장 훅
 * Extended hook for sharing state across multiple components with individual field subscriptions
 *
 * @license MIT License
 * @copyright 2025 KIM YOUNG JIN (Kim Young Jin)
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useContext, useEffect, useRef, useMemo } from "react";
import { useFormaState } from "./useFormaState";
import {
    UseGlobalFormaStateProps,
    UseGlobalFormaStateReturn,
} from "../types/globalForm";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";
import { mergeActions } from "../utils";

/**
 * 글로벌 FormaState 관리 훅 (오버로드 1: 전체 옵션)
 * Global FormaState management hook (Overload 1: Full options)
 */
export function useGlobalFormaState<T extends Record<string, any>>(
    props: UseGlobalFormaStateProps<T>
): UseGlobalFormaStateReturn<T>;

/**
 * 글로벌 FormaState 관리 훅 (오버로드 2: stateId + initialValues)
 * Global FormaState management hook (Overload 2: stateId + initialValues)
 */
export function useGlobalFormaState<T extends Record<string, any>>(
    stateId: string,
    initialValues: T
): UseGlobalFormaStateReturn<T>;

/**
 * 글로벌 FormaState 관리 훅 (오버로드 3: stateId만)
 * Global FormaState management hook (Overload 3: stateId only)
 */
export function useGlobalFormaState<T extends Record<string, any>>(
    stateId: string
): UseGlobalFormaStateReturn<T>;

/**
 * 글로벌 FormaState 관리 훅 / Global FormaState management hook
 *
 * 여러 컴포넌트 간 개별 필드 구독 기반 상태를 공유하기 위한 훅입니다
 * Hook for sharing state across multiple components with individual field subscriptions
 *
 * 데이터 공유에만 집중하며, 각 컴포넌트에서 필요한 필드만 구독하여 최적화된 렌더링을 제공합니다
 * Focuses only on data sharing and provides optimized rendering by subscribing only to necessary fields in each component
 *
 * @template T FormaState 데이터의 타입 / FormaState data type
 * @param propsOrStateId 글로벌 FormaState 설정 옵션 또는 stateId 문자열 / Global FormaState configuration options or stateId string
 * @returns 글로벌 FormaState 관리 API 객체 / Global FormaState management API object
 *
 * @example
 * ```typescript
 * // 글로벌 상태 정의
 * interface AppState {
 *   user: { name: string; email: string };
 *   settings: { theme: 'light' | 'dark'; notifications: boolean };
 *   cart: { items: any[]; total: number };
 * }
 *
 * // 컴포넌트 A - 사용자 정보만 구독
 * function UserProfile() {
 *   const state = useGlobalFormaState<AppState>({ stateId: 'app-state' });
 *   const userName = state.useValue('user.name');     // name 변경시만 리렌더
 *   const userEmail = state.useValue('user.email');   // email 변경시만 리렌더
 *
 *   return (
 *     <div>
 *       <h1>{userName}</h1>
 *       <p>{userEmail}</p>
 *       <button onClick={() => state.setValue('user.name', 'New Name')}>
 *         Update Name
 *       </button>
 *     </div>
 *   );
 * }
 *
 * // 컴포넌트 B - 설정만 구독
 * function Settings() {
 *   const state = useGlobalFormaState<AppState>({ stateId: 'app-state' });
 *   const theme = state.useValue('settings.theme');              // theme 변경시만 리렌더
 *   const notifications = state.useValue('settings.notifications'); // notifications 변경시만 리렌더
 *
 *   return (
 *     <div>
 *       <select
 *         value={theme}
 *         onChange={(e) => state.setValue('settings.theme', e.target.value)}
 *       >
 *         <option value="light">Light</option>
 *         <option value="dark">Dark</option>
 *       </select>
 *     </div>
 *   );
 * }
 *
 * // 컴포넌트 C - 장바구니만 구독
 * function Cart() {
 *   const state = useGlobalFormaState<AppState>({ stateId: 'app-state' });
 *   const cartItems = state.useValue('cart.items');    // cart.items 변경시만 리렌더
 *   const cartTotal = state.useValue('cart.total');    // cart.total 변경시만 리렌더
 *
 *   return (
 *     <div>
 *       <h2>Cart ({cartItems.length} items)</h2>
 *       <p>Total: ${cartTotal}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGlobalFormaState<T extends Record<string, any>>(
    propsOrStateId: UseGlobalFormaStateProps<T> | string,
    initialValuesArg?: T
): UseGlobalFormaStateReturn<T> {
    // 문자열로 전달된 경우 props 객체로 변환
    const props: UseGlobalFormaStateProps<T> =
        typeof propsOrStateId === "string"
            ? { stateId: propsOrStateId, initialValues: initialValuesArg }
            : propsOrStateId;

    const {
        stateId,
        initialValues,
        autoCleanup = true,
        actions,
        watch,
        persist,
    } = props;
    const context = useContext(GlobalFormaContext);

    // 참조 등록 상태를 추적하는 ref 추가 + 컴포넌트 고유 ID
    const isRegisteredRef = useRef(false);
    const componentIdRef = useRef<string | undefined>(undefined);

    // 컴포넌트 고유 ID 생성 (한 번만)
    if (!componentIdRef.current) {
        componentIdRef.current = `${stateId}-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }

    // Context가 제대로 설정되지 않았을 때 명확한 에러 표시
    // Show clear error when Context is not properly configured
    if (!context || !context.getOrCreateStore) {
        // 페이지에 에러가 표시되도록 컴포넌트 렌더링을 방해하는 에러를 던짐
        // Throw error that prevents component rendering so error shows on page
        const errorMessage = `
🚨 GlobalFormaProvider 설정 오류 | Configuration Error

GlobalFormaProvider가 App.tsx에 설정되지 않았습니다!
GlobalFormaProvider is not configured in App.tsx!

해결 방법 | Solution:
1. App.tsx 파일에서 GlobalFormaProvider로 컴포넌트를 감싸주세요.
2. import { GlobalFormaProvider } from '@/forma';
3. <GlobalFormaProvider><YourApp /></GlobalFormaProvider>

Details: GlobalFormaContext must be used within GlobalFormaProvider (stateId: ${stateId})
        `.trim();

        throw new Error(errorMessage);
    }

    const {
        getOrCreateStore,
        incrementRef,
        decrementRef,
        validateAndStoreAutoCleanupSetting,
        registerActions,
        getActions,
    } = context;

    // autoCleanup 설정 일관성 검증
    validateAndStoreAutoCleanupSetting(stateId, autoCleanup);

    // 글로벌 스토어 가져오기 또는 생성 / Get or create global store
    const store = getOrCreateStore<T>(stateId);

    // actions가 제공되면 글로벌에 동기적으로 등록 / Register actions to global synchronously if provided
    if (actions) {
        const mergedActions = mergeActions(actions);
        if (mergedActions) {
            registerActions(stateId, mergedActions);
        }
    }

    // 글로벌 actions 가져오기 / Get global actions
    const globalActions = getActions(stateId);

    // 로컬 actions가 없으면 글로벌 actions 사용 / Use global actions if local actions are not provided
    const effectiveActions = actions || globalActions;

    // useFormaState에 초기값과 외부 스토어 전달 (올바른 방식)
    const formaState = useFormaState<T>((initialValues as T) || ({} as T), {
        _externalStore: store,
        actions: effectiveActions,
        watch, // watch 옵션 전달
        persist, // persist 옵션 전달
    });

    // 초기값이 있고 스토어가 비어있다면 초기값 설정 (올바른 방법으로)
    // Set initial values if provided and store is empty (using proper method)
    useEffect(() => {
        if (initialValues && Object.keys(store.getValues()).length === 0) {
            formaState.setInitialValues(initialValues as T);
        }
    }, [stateId, initialValues, store, formaState]);

    // 참조 카운팅을 통한 자동 정리 관리 (마운트 시 한 번만 실행)
    // Auto cleanup management through reference counting (execute only once on mount)
    useEffect(() => {
        if (!autoCleanup) return;

        // 첫 번째 등록시에만 참조 카운트 증가
        incrementRef(stateId, autoCleanup);
        isRegisteredRef.current = true;

        return () => {
            // 컴포넌트 언마운트 시에만 참조 카운트 감소
            decrementRef(stateId, autoCleanup);
            isRegisteredRef.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 완전히 빈 의존성 배열로 마운트 시 한 번만 실행

    // 최신 로컬 actions 를 ref 로 추적 — 인라인 객체가 렌더마다 새 참조로 와도
    // Proxy 를 재생성하지 않는다 (P1: actions Proxy 는 store 당 1회 생성, 식별자 안정)
    // Track the latest local actions via ref — inline objects no longer recreate the Proxy
    const localActionsRef = useRef(actions);
    localActionsRef.current = actions;

    // actions를 동적으로 가져오는 getter 생성 (deps 가 모두 안정적이라 1회만 생성됨)
    // Create getter to dynamically fetch actions (all deps stable — created once)
    const actionsGetter = useMemo(() => {
        // 호출 시점의 유효 actions 집합 조회 (로컬 우선, 없으면 글로벌 최신)
        // Resolve the effective actions at call time (local first, else latest global)
        const resolveActions = () =>
            localActionsRef.current || getActions(stateId) || {};

        return new Proxy({} as any, {
            get: (_target, prop) => {
                const action = resolveActions()[prop as any];
                if (typeof action === "function") {
                    // context를 바인딩하여 반환 / Return with context binding
                    return (...args: any[]) => {
                        const context = {
                            // 공유 캐시 보호를 위해 얕은 복사 / shallow copy protects the shared cache
                            values: { ...store.getValues() },
                            getValue: (field: string | keyof T) =>
                                store.getValue(field as string),
                            setValue: (field: string | keyof T, value: any) =>
                                store.setValue(field as string, value),
                            setValues: (values: Partial<T>) => {
                                const currentValues = store.getValues();
                                const newValues = {
                                    ...currentValues,
                                    ...values,
                                };
                                store.setValues(newValues as T);
                            },
                            reset: () => store.reset(),
                            actions: {} as any, // Will be filled after
                        };
                        context.actions = actionsGetter;
                        return action(context, ...args);
                    };
                }
                return action;
            },
            has: (_target, prop) => {
                return prop in resolveActions();
            },
            ownKeys: (_target) => {
                return Reflect.ownKeys(resolveActions());
            },
            getOwnPropertyDescriptor: (_target, prop) => {
                if (prop in resolveActions()) {
                    return {
                        enumerable: true,
                        configurable: true,
                    };
                }
                return undefined;
            },
        });
    }, [stateId, getActions, store]);

    // 반환 객체 — formaState/actionsGetter/store 가 모두 안정적이라 재렌더 간 동일 참조 유지
    // Return object — formaState/actionsGetter/store are stable, identical reference across re-renders
    return useMemo(
        () =>
            ({
                ...formaState,
                actions: actionsGetter, // 동적 actions getter로 교체 / Replace with dynamic actions getter
                stateId, // 글로벌 FormaState ID 추가 제공 / Provide additional global FormaState ID
                _store: store, // 글로벌 스토어 직접 접근용 (이미 formaState에 있지만 명시적으로 재정의) / Direct access to global store
            }) as UseGlobalFormaStateReturn<T>,
        [formaState, actionsGetter, stateId, store],
    );
}
