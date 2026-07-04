/**
 * useFormaState.ts
 *
 * Advanced state management hook with individual field subscriptions
 * Optimized for arrays, objects, and complex nested data structures
 *
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 * @license MIT License
 */

import {
    useRef,
    useCallback,
    useMemo,
    useEffect,
    useSyncExternalStore,
    useContext,
} from "react";
import { FieldStore } from "../core/FieldStore";
import { mergeActions } from "../utils";
import { isBrowser } from "../utils/environment";
import { FormChangeEvent, ActionContext, Actions } from "../types/form";
import {
    PersistConfig,
    PersistOptions,
    loadPersistedData,
    savePersistedData,
    clearPersistedData,
    hasPersistedData,
    normalizePersistConfig,
    debounce,
} from "../utils/persist";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";
import { getStateSurface } from "./storeSurface";

/**
 * Options for configuring useFormaState hook
 * useFormaState 훅 설정을 위한 옵션
 */
export interface UseFormaStateOptions<T extends Record<string, any>> {
    /** Optional callback when state changes | 상태 변경 시 선택적 콜백 */
    onChange?: (values: T) => void;

    /** Enable deep equality checking for better performance | 성능 향상을 위한 깊은 동등성 검사 활성화 */
    deepEquals?: boolean;

    /** External FieldStore instance for shared state | 공유 상태를 위한 외부 FieldStore 인스턴스 */
    _externalStore?: FieldStore<T>;

    /** Error handler for state operations | 상태 작업을 위한 에러 핸들러 */
    onError?: (error: Error) => void;

    /** Enable validation on every change (예약됨 — 현재 미구현, 하위호환을 위해 유지) | Enable validation on every change (reserved — currently unused, kept for backward compat) */
    validateOnChange?: boolean;

    /** Custom actions (computed getters and handlers) - can be object or array | 커스텀 액션 (computed getter 및 handler) - 객체 또는 배열 */
    actions?: Actions<T> | Actions<T>[];

    /** Watch callbacks - detect specific path changes (wildcard supported) | Watch 콜백 - 특정 경로 변경 감지 (와일드카드 지원). watch 키 집합은 마운트 시 고정되며, 핸들러 본문은 렌더마다 최신 함수가 반영됩니다. */
    watch?: Record<
        string,
        (
            context: ActionContext<T>,
            value: any,
            prevValue: any,
        ) => void | Promise<void>
    >;

    /** localStorage 영속성 설정 (마운트 시 고정) | localStorage persistence config (fixed at mount) */
    persist?: PersistConfig;
}

/**
 * Return type for useFormaState hook
 * useFormaState 훅의 반환 타입
 */
export interface UseFormaStateReturn<T extends Record<string, any>> {
    /** Subscribe to a specific field with dot notation | dot notation으로 특정 필드 구독 */
    useValue: <K extends string>(path: K) => any;

    /** Set a specific field value with dot notation | dot notation으로 특정 필드 값 설정 */
    setValue: <K extends string>(path: K, value: any) => void;

    /** Get all current values (non-reactive, shared cached object — do not mutate) | 모든 현재 값 가져오기 (반응형 아님, 공유 캐시 객체 — 변형 금지) */
    getValues: () => T;

    /** Set all values at once | 모든 값을 한 번에 설정 */
    setValues: (values: Partial<T>) => void;

    /** Batch update multiple fields efficiently | 여러 필드를 효율적으로 일괄 업데이트 */
    setBatch: (updates: Record<string, any>) => void;

    /** Reset to initial values | 초기값으로 재설정 */
    reset: () => void;

    /** Set new initial values (for dynamic initialization) | 새 초기값 설정 (동적 초기화용) */
    setInitialValues: (newInitialValues: T) => void;

    /** Handle standard input change events | 표준 입력 변경 이벤트 처리 */
    handleChange: (event: FormChangeEvent) => void;

    /** Handle standard form input change events | 표준 폼 입력 변경 이벤트 처리 */
    handleFormChange: (event: FormChangeEvent) => void;

    /** Check if a field exists | 필드 존재 여부 확인 */
    hasField: (path: string) => boolean;

    /** Remove a field from state | 상태에서 필드 제거 */
    removeField: (path: string) => void;

    /** Get a single field value (non-reactive) | 단일 필드 값 가져오기 (반응형 아님) */
    getValue: (path: string) => any;

    /** Subscribe to all state changes | 모든 상태 변경에 구독 */
    subscribe: (callback: (values: T) => void) => () => void;

    /** Refresh all field subscribers with specific prefix | 특정 prefix를 가진 모든 필드 구독자들을 새로고침 */
    refreshFields: (prefix: string) => void;

    /** Custom actions bound to this state | 이 상태에 바인딩된 커스텀 액션 */
    actions: any;

    /** 저장된 데이터 삭제 | Clear persisted data */
    clearPersisted: () => void;

    /** 저장된 데이터 존재 여부 | Has persisted data */
    hasPersisted: boolean;

    /** Direct access to the internal store for advanced usage | 고급 사용을 위한 내부 스토어 직접 접근 */
    _store: FieldStore<T>;
}

/**
 * Individual field subscription hook for useFormaState
 * useFormaState를 위한 개별 필드 구독 훅
 *
 * useSyncExternalStore를 사용하여 React 18의 동시성 모드를 지원하고
 * 구독 등록과 값 읽기를 동기적으로 처리하여 타이밍 이슈를 방지합니다.
 *
 * @param store FieldStore 인스턴스
 * @param fieldName 구독할 필드 이름 (dot notation 지원)
 * @returns 필드의 현재 값
 */
function useFieldValue<T>(store: FieldStore<any>, fieldName: string): T {
    // useSyncExternalStore를 사용하여 동기적으로 구독 등록
    // 이렇게 하면 컴포넌트 렌더링 중에 구독이 등록되어
    // setValues() 호출 시점과 상관없이 항상 알림을 받을 수 있습니다.
    const value = useSyncExternalStore(
        useCallback(
            (onStoreChange) => {
                // 구독 등록 (동기적으로 실행됨)
                return store.subscribe(fieldName, onStoreChange);
            },
            [store, fieldName],
        ),
        useCallback(() => {
            // 현재 값 읽기 (동기적으로 실행됨)
            return store.getValue(fieldName);
        }, [store, fieldName]),
        useCallback(() => {
            // 서버 사이드 렌더링용 초기값
            return store.getValue(fieldName);
        }, [store, fieldName]),
    );

    return value;
}
/**
 * Hook for subscribing to a specific field in a FieldStore
 * FieldStore의 특정 필드를 구독하기 위한 Hook
 *
 * @param store FieldStore 인스턴스
 * @param path 필드 경로 (dot notation)
 * @returns 필드의 현재 값
 */
export function useFieldSubscription<T = any>(
    store: FieldStore<any>,
    path: string,
): T {
    return useFieldValue<T>(store, path);
}

/**
 * 초경량 개별 필드 구독 훅 — 가상목록 셀 전용 경량 구독의 공식 API
 * Ultra-light single-field subscription hook — the official API for
 * lightweight per-cell subscriptions (e.g. virtualized list cells)
 *
 * `useFormaState`/`useGlobalFormaState` 인스턴스를 셀마다 만들지 말고,
 * 부모에서 `state._store` 를 내려받아 이 훅으로 해당 경로만 구독하세요.
 * 기존에 쓰던 비공식 `_store` + useSyncExternalStore 워크어라운드를 대체합니다.
 * Instead of calling the heavy state hooks per cell, pass `state._store`
 * down from the parent and subscribe to just one path with this hook.
 * Replaces the unofficial `_store` + useSyncExternalStore workaround.
 *
 * @example
 * ```tsx
 * // 부모 / parent
 * const state = useFormaState({ rows: [...] });
 * <Cell store={state._store} path={`rows.${index}.name`} />
 *
 * // 셀 / cell — 해당 경로가 변경될 때만 리렌더
 * function Cell({ store, path }: { store: FieldStore<any>; path: string }) {
 *     const value = useStoreValue<string>(store, path);
 *     return <span>{value}</span>;
 * }
 * ```
 *
 * @param store FieldStore 인스턴스 (`state._store`)
 * @param path 구독할 필드 경로 (dot notation)
 * @returns 필드의 현재 값
 */
export function useStoreValue<T = any>(
    store: FieldStore<any>,
    path: string,
): T {
    return useFieldValue<T>(store, path);
}

/**
 * Advanced state management hook with individual field subscriptions
 * 개별 필드 구독을 통한 고급 상태 관리 훅
 *
 * Optimized for managing complex arrays, objects, and nested data structures
 * where you want to avoid unnecessary re-renders when only specific fields change.
 *
 * 복잡한 배열, 객체, 중첩된 데이터 구조를 관리하는 데 최적화되어 있으며,
 * 특정 필드만 변경될 때 불필요한 재렌더링을 방지하고자 할 때 사용합니다.
 *
 * @example
 * ```typescript
 * // Managing an array of users
 * const state = useFormaState({
 *   users: [
 *     { name: 'John', email: 'john@example.com', age: 30 },
 *     { name: 'Jane', email: 'jane@example.com', age: 25 }
 *   ],
 *   settings: { theme: 'dark', notifications: true }
 * });
 *
 * // Subscribe to individual fields - only these components re-render when changed
 * const firstName = state.useValue('users.0.name');  // Only re-renders when John's name changes
 * const userAge = state.useValue('users.1.age');     // Only re-renders when Jane's age changes
 * const theme = state.useValue('settings.theme');    // Only re-renders when theme changes
 *
 * // Update specific fields
 * state.setValue('users.0.name', 'Johnny');
 * state.setValue('settings.theme', 'light');
 * ```
 */
// 빈 객체로 시작하는 경우를 위한 오버로드
export function useFormaState<
    T extends Record<string, any> = Record<string, any>,
>(initialValues?: T, options?: UseFormaStateOptions<T>): UseFormaStateReturn<T>;

// 명시적 타입을 가진 경우를 위한 오버로드
export function useFormaState<T extends Record<string, any>>(
    initialValues: T,
    options?: UseFormaStateOptions<T>,
): UseFormaStateReturn<T>;

export function useFormaState<T extends Record<string, any>>(
    initialValues: T = {} as T,
    options: UseFormaStateOptions<T> = {},
): UseFormaStateReturn<T> {
    const {
        onChange,
        deepEquals: _deepEquals = false,
        _externalStore,
        actions: actionsDefinition,
        watch,
        persist,
    } = options;

    // GlobalFormaContext에서 storagePrefix 가져오기 | Get storagePrefix from GlobalFormaContext
    const context = useContext(GlobalFormaContext);
    const storagePrefix = context?.storagePrefix;

    // Persist 설정 정규화 — 마운트 시 1회 고정 (인라인 객체가 렌더마다 새 참조로 와도
    // 저장 구독을 재등록하지 않도록 안정화) | Normalize persist config — fixed at mount so
    // inline config objects don't churn the save subscription every render
    const persistConfigRef = useRef<PersistOptions | null | undefined>(
        undefined,
    );
    if (persistConfigRef.current === undefined) {
        persistConfigRef.current = persist
            ? normalizePersistConfig(persist)
            : null;
    }
    const persistConfig = persistConfigRef.current;

    // 초기값 안정화: 첫 번째 렌더링에서만 초기값을 고정
    // Stabilize initial values: fix initial values only on first render
    // persist가 있으면 localStorage에서 복원 시도
    const stableInitialValues = useRef<T | null>(null);
    if (!stableInitialValues.current) {
        let mergedInitialValues = initialValues;

        // persist 설정이 있으면 저장된 데이터 복원 시도
        if (persistConfig) {
            const persisted = loadPersistedData<T>(
                persistConfig,
                storagePrefix,
            );
            if (persisted) {
                mergedInitialValues = { ...initialValues, ...persisted };
            }
        }

        stableInitialValues.current = mergedInitialValues;
    }
    if (!stableInitialValues.current) {
        stableInitialValues.current = initialValues;
    }

    // Create or use external field store instance (persists across renders)
    // 필드 스토어 인스턴스 생성 또는 외부 스토어 사용 (렌더링 간 유지)
    const storeRef = useRef<FieldStore<T> | null>(null);
    if (_externalStore) {
        // 외부 스토어는 한번만 설정 (이미 설정되어 있으면 변경하지 않음)
        // Set external store only once (don't change if already set)
        if (!storeRef.current) {
            storeRef.current = _externalStore;

            // 외부 스토어 사용 시 초기값이 비어있으면 설정
            const currentValues = _externalStore.getValues();
            if (
                Object.keys(currentValues).length === 0 &&
                Object.keys(initialValues).length > 0
            ) {
                // ⭐ initialValues 먼저 설정 (reset()이 참조함)
                _externalStore.setInitialValues(initialValues);

                // 그 다음 값 설정
                Object.keys(initialValues).forEach((key) => {
                    _externalStore.setValue(key, initialValues[key as keyof T]);
                });
            }
        }
    } else if (!storeRef.current) {
        storeRef.current = new FieldStore<T>(stableInitialValues.current);

        // Set up global change listener if provided
        // 글로벌 변경 리스너 설정 (제공된 경우)
        // getValues() 는 공유 캐시 객체이므로 사용자 콜백에는 얕은 복사본을 전달 (기존 시맨틱 유지)
        // getValues() returns the shared cache; hand user callbacks a shallow copy (old semantics)
        if (onChange) {
            storeRef.current.subscribeGlobal(() => {
                onChange({ ...storeRef.current!.getValues() });
            });
        }
    }

    const store = storeRef.current;

    // store 수준 훅 표면 — store 당 1회 생성되어 렌더 간 동일 참조 유지
    // Store-level hook surface — created once per store, identical reference across renders
    const surface = getStateSurface<T>(store, useFieldValue);

    // Persist: 디바운스 저장 + 구독 + 이탈/언마운트 시 flush
    // Persist: debounced save + subscription + flush on unmount/page-hide
    // 하나의 effect 로 묶어 debounce 함수 생성과 flush 시점을 동일한 라이프사이클에 둔다.
    // 이렇게 하면 언마운트나 탭 종료 직전의 마지막 변경이 debounce 대기 중에 유실되지 않는다.
    // Keeping creation and flush in one effect ensures the last change isn't lost
    // while still pending in the debounce window on unmount or tab close.
    // persistConfig 가 마운트 시 고정되므로 이 effect 는 1회만 등록된다 (persist 미사용 시 즉시 no-op).
    // persistConfig is fixed at mount, so this effect registers once (cheap no-op without persist).
    useEffect(() => {
        if (!persistConfig) return;

        const debounceTime = persistConfig.debounce ?? 300;
        const debouncedSave = debounce((values: T) => {
            savePersistedData(persistConfig, values, storagePrefix);
        }, debounceTime);

        const unsubscribe = store.subscribeGlobal(() => {
            debouncedSave(store.getValues());
        });

        // 페이지 이탈/백그라운드 전환 시 대기 중인 저장을 즉시 실행
        // Flush pending save when the page is hidden or being unloaded.
        // visibilitychange(hidden) + pagehide 가 beforeunload 보다 신뢰도가 높다(특히 모바일).
        const flush = () => debouncedSave.flush();
        const handleVisibility = () => {
            if (document.visibilityState === "hidden") flush();
        };

        if (isBrowser()) {
            document.addEventListener("visibilitychange", handleVisibility);
            window.addEventListener("pagehide", flush);
        }

        return () => {
            unsubscribe();
            if (isBrowser()) {
                document.removeEventListener(
                    "visibilitychange",
                    handleVisibility,
                );
                window.removeEventListener("pagehide", flush);
            }
            // 언마운트 시 대기 중인 마지막 저장을 즉시 반영 (손실 방지)
            // Flush the pending save on unmount so the last change is persisted.
            debouncedSave.flush();
        };
    }, [store, persistConfig, storagePrefix]);

    // Persist: hasPersisted 상태 — 기존과 동일하게 렌더마다 재확인 (persist 미사용 시 비용 없음)
    // Persist: hasPersisted — re-checked per render as before (free when persist is unset)
    const hasPersisted = persistConfig
        ? hasPersistedData(persistConfig, storagePrefix)
        : false;

    // 최신 actions 정의를 ref 로 추적 — 인라인 객체가 렌더마다 새 참조로 와도 재바인딩하지 않고,
    // 접근 시점에 최신 정의(키 집합 포함)를 반영한다
    // Track the latest actions definition via ref — inline objects don't cause re-binding;
    // the latest definition (including its key set) is resolved at access time
    const actionsRef = useRef(actionsDefinition);
    actionsRef.current = actionsDefinition;

    // Bind actions to context if provided
    // actions가 제공된 경우 context에 바인딩 — store 당 1회 생성되는 동적 Proxy 로
    // 식별자는 안정적이면서 항상 최신 actions 정의를 실행한다 (글로벌 훅과 동일 패턴)
    // Bound as a dynamic Proxy created once per store — stable identity while always
    // executing the latest actions definition (same pattern as the global hooks)
    const boundActions = useMemo(() => {
        // 접근 시점의 병합된 actions 정의 조회 / resolve the merged actions definition at access time
        const resolveMerged = (): Record<string, any> =>
            (actionsRef.current ? mergeActions(actionsRef.current) : null) ||
            {};

        const bound: any = new Proxy({} as any, {
            get: (_target, prop) => {
                const action = resolveMerged()[prop as any];
                if (typeof action !== "function") return action;

                // 호출 시점에 컨텍스트를 구성해 실행하는 래퍼 / wrapper building a per-call context
                return (...args: any[]) => {
                    // values 는 공유 캐시 보호를 위해 얕은 복사 / values shallow-copied to protect the shared cache
                    const context: ActionContext<T> = {
                        values: { ...store.getValues() },
                        getValue: (field: string | keyof T) =>
                            store.getValue(field as string),
                        setValue: (field: string | keyof T, value: any) =>
                            store.setValue(field as string, value),
                        setValues: surface.setValues,
                        reset: () => store.reset(),
                        actions: bound,
                    };

                    return action(context, ...args);
                };
            },
            has: (_target, prop) => prop in resolveMerged(),
            ownKeys: () => Reflect.ownKeys(resolveMerged()),
            getOwnPropertyDescriptor: (_target, prop) => {
                if (prop in resolveMerged()) {
                    return { enumerable: true, configurable: true };
                }
                return undefined;
            },
        });

        return bound;
    }, [store, surface]);

    // 최신 watch 맵을 ref 로 추적 — 인라인 객체가 렌더마다 새 참조로 와도 재구독하지 않는다
    // Track the latest watch map via ref — inline objects no longer unsubscribe/resubscribe per render
    const watchRef = useRef(watch);
    watchRef.current = watch;

    // Register watch callbacks — 마운트(스토어) 기준 1회 등록.
    // watch 키 집합은 마운트 시 고정 (기존에도 동적 키 변경은 미지원), 핸들러 본문은 ref 로 최신 반영.
    // Registered once per store; the watch key set is fixed at mount (dynamic keys were never
    // supported), while the latest handler body is read through the ref.
    useEffect(() => {
        const watchMap = watchRef.current;
        if (!watchMap) return;

        const unsubscribers = Object.keys(watchMap).map((path) =>
            store.watch(path, (value: any, prevValue: any) => {
                const callback = watchRef.current?.[path];
                if (!callback) return;

                // watch 콜백용 컨텍스트 — values 는 공유 캐시 보호를 위해 얕은 복사
                // per-event context — values shallow-copied to protect the shared cache
                const context: ActionContext<T> = {
                    values: { ...store.getValues() },
                    getValue: (field: string | keyof T) =>
                        store.getValue(field as string),
                    setValue: (field: string | keyof T, value: any) =>
                        store.setValue(field as string, value),
                    setValues: surface.setValues,
                    reset: () => store.reset(),
                    actions: boundActions,
                };

                callback(context, value, prevValue);
            }),
        );

        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    }, [store, surface, boundActions]);

    // 반환 객체 — store 수준 표면 + 컴포넌트 수준 조각(actions/persist)의 합성.
    // deps 가 모두 안정적이므로 재렌더 간 동일 참조를 유지한다 (공개 형태는 기존과 100% 동일).
    // Return object — store-level surface + per-component pieces (actions/persist).
    // All deps are stable, so the reference stays identical across re-renders (public shape unchanged).
    return useMemo(
        () => ({
            ...surface,
            actions: boundActions,
            // 저장된 데이터 삭제 / clear persisted data
            clearPersisted: () => {
                if (persistConfig) {
                    clearPersistedData(persistConfig, storagePrefix);
                }
            },
            hasPersisted,
        }),
        [surface, boundActions, hasPersisted, persistConfig, storagePrefix],
    );
}
