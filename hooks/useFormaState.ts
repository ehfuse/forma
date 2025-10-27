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
    useState,
    useEffect,
    useSyncExternalStore,
    useReducer,
} from "react";
import { FieldStore } from "../core/FieldStore";
import { getNestedValue, setNestedValue, devWarn } from "../utils";
import { FormChangeEvent, ActionContext, Actions } from "../types/form";

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

    /** Enable validation on every change | 모든 변경에 대한 유효성 검사 활성화 */
    validateOnChange?: boolean;

    /** Custom actions (computed getters and handlers) | 커스텀 액션 (computed getter 및 handler) */
    actions?: Actions<T>;
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

    /** Get all current values (non-reactive) | 모든 현재 값 가져오기 (반응형 아님) */
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

    /** Direct access to the internal store for advanced usage | 고급 사용을 위한 내부 스토어 직접 접근 */
    _store: FieldStore<T>;
}

/**
 * Individual field subscription hook for useFormaState
 * useFormaState를 위한 개별 필드 구독 훅
 *
 * @param store FieldStore 인스턴스
 * @param fieldName 구독할 필드 이름 (dot notation 지원)
 * @returns 필드의 현재 값
 */
function useFieldValue<T>(store: FieldStore<any>, fieldName: string): T {
    const [value, setValue] = useState(() => store.getValue(fieldName));
    const [, forceUpdate] = useReducer((x) => x + 1, 0);

    useEffect(() => {
        // 초기값 강제 동기화
        const currentValue = store.getValue(fieldName);
        setValue(currentValue);

        // 구독 설정 / Setup subscription
        const unsubscribe = store.subscribe(fieldName, () => {
            const newValue = store.getValue(fieldName);
            setValue(newValue);
            // useReducer를 사용한 강제 리렌더링
            forceUpdate();
        });

        return unsubscribe;
    }, [fieldName, store]); // 깔끔한 의존성 배열

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
    path: string
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
    T extends Record<string, any> = Record<string, any>
>(initialValues?: T, options?: UseFormaStateOptions<T>): UseFormaStateReturn<T>;

// 명시적 타입을 가진 경우를 위한 오버로드
export function useFormaState<T extends Record<string, any>>(
    initialValues: T,
    options?: UseFormaStateOptions<T>
): UseFormaStateReturn<T>;

export function useFormaState<T extends Record<string, any>>(
    initialValues: T = {} as T,
    options: UseFormaStateOptions<T> = {}
): UseFormaStateReturn<T> {
    const {
        onChange,
        deepEquals = false,
        _externalStore,
        actions: actionsDefinition,
    } = options;

    // 초기값 안정화: 첫 번째 렌더링에서만 초기값을 고정
    // Stabilize initial values: fix initial values only on first render
    const stableInitialValues = useRef<T | null>(null);
    if (!stableInitialValues.current) {
        stableInitialValues.current = initialValues;
    }

    // Create or use external field store instance (persists across renders)
    // 필드 스토어 인스턴스 생성 또는 외부 스토어 사용 (렌더링 간 유지)
    const storeRef = useRef<FieldStore<T> | null>(null);
    if (_externalStore) {
        storeRef.current = _externalStore;

        // 외부 스토어 사용 시 초기값이 비어있으면 설정
        const currentValues = _externalStore.getValues();
        if (
            Object.keys(currentValues).length === 0 &&
            Object.keys(initialValues).length > 0
        ) {
            Object.keys(initialValues).forEach((key) => {
                _externalStore.setValue(key, initialValues[key as keyof T]);
            });
        }
    } else if (!storeRef.current) {
        storeRef.current = new FieldStore<T>(stableInitialValues.current);

        // Set up global change listener if provided
        // 글로벌 변경 리스너 설정 (제공된 경우)
        if (onChange) {
            storeRef.current.subscribeGlobal(() => {
                onChange(storeRef.current!.getValues());
            });
        }
    }

    const store = storeRef.current;

    // Subscribe to a specific field value with dot notation
    // dot notation으로 특정 필드 값 구독
    const useValue = useCallback(
        <K extends string>(path: K) => {
            return useFieldValue(store, path);
        },
        [store] // store 의존성 추가 - 외부 스토어 사용 시 중요
    );

    // Set a specific field value with dot notation
    // dot notation으로 특정 필드 값 설정
    const setValue = useCallback(
        <K extends string>(path: K, value: any) => {
            store.setValue(path, value);
        },
        [store] // store 의존성 추가
    );

    // Get all current values (non-reactive)
    // 모든 현재 값 가져오기 (반응형 아님)
    const getValues = useCallback(() => {
        return store.getValues();
    }, [store]); // store 의존성 추가

    // Set all values at once
    // 모든 값을 한 번에 설정
    const setValues = useCallback(
        (values: Partial<T>) => {
            const currentValues = store.getValues();
            const newValues = { ...currentValues, ...values };
            store.setValues(newValues as T);
        },
        [store] // store 의존성 추가
    );

    // Reset to initial values
    // 초기값으로 재설정
    const reset = useCallback(() => {
        store.reset();
    }, [store]); // store 의존성 추가

    // Set new initial values (for dynamic initialization)
    // 새 초기값 설정 (동적 초기화용)
    const setInitialValues = useCallback(
        (newInitialValues: T) => {
            stableInitialValues.current = newInitialValues;
            store.setInitialValues(newInitialValues);
        },
        [store]
    ); // store 의존성 추가

    // Handle standard input change events
    // 표준 입력 변경 이벤트 처리
    const handleChange = useCallback(
        (event: FormChangeEvent) => {
            const target = event.target;
            if (!target || !target.name) {
                devWarn(
                    'useFormaState.handleChange: input element must have a "name" attribute'
                );
                return;
            }

            const { name, type, value, checked } = target as any;
            let processedValue = value;

            // DatePicker 처리 (Dayjs 객체) / DatePicker handling (Dayjs object)
            if (value && typeof value === "object" && value.format) {
                processedValue = value.format("YYYY-MM-DD");
            }
            // 체크박스 처리 / Checkbox handling
            else if (type === "checkbox") {
                processedValue = checked;
            }
            // 숫자 타입 처리 / Number type handling
            else if (type === "number") {
                processedValue = Number(value);
            }
            // null 값 처리 / Null value handling
            else if (value === null) {
                processedValue = undefined;
            }

            setValue(name, processedValue);
        },
        [setValue]
    );

    // Bind actions to context if provided
    // actions가 제공된 경우 context에 바인딩
    const boundActions = useMemo(() => {
        if (!actionsDefinition) return {};

        const context: ActionContext<T> = {
            values: store.getValues(),
            getValue: (field: string | keyof T) =>
                store.getValue(field as string),
            setValue: (field: string | keyof T, value: any) =>
                store.setValue(field as string, value),
            setValues: (values: Partial<T>) => {
                const currentValues = store.getValues();
                const newValues = { ...currentValues, ...values };
                store.setValues(newValues as T);
            },
            reset: () => store.reset(),
            actions: {} as any, // Will be filled after binding
        };

        const bound: any = {};
        for (const [key, action] of Object.entries(actionsDefinition)) {
            bound[key] = (...args: any[]) => {
                // Update context.values with latest state
                context.values = store.getValues();
                return action(context, ...args);
            };
        }

        // Fill context.actions with bound actions
        context.actions = bound;

        return bound;
    }, [actionsDefinition, store]);

    return {
        useValue,
        setValue,
        getValues,
        setValues,
        setBatch: useCallback(
            (updates: Record<string, any>) => {
                store.setBatch(updates);
            },
            [store] // store 의존성 추가
        ),
        reset,
        setInitialValues,
        handleChange,
        hasField: useCallback(
            (path: string) => {
                return store.hasField(path);
            },
            [store] // store 의존성 추가
        ),
        removeField: useCallback(
            (path: string) => {
                store.removeField(path);
            },
            [store] // store 의존성 추가
        ),
        getValue: useCallback(
            (path: string) => {
                return store.getValue(path);
            },
            [store] // store 의존성 추가
        ),
        subscribe: useCallback(
            (callback: (values: T) => void) => {
                return store.subscribeToAll(callback);
            },
            [store] // store 의존성 추가
        ),
        refreshFields: useCallback(
            (prefix: string) => {
                store.refreshFields(prefix);
            },
            [store] // store 의존성 추가
        ),
        actions: boundActions,
        _store: store,
    };
}
