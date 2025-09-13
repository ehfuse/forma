/**
 * useFormaState.ts
 *
 * Advanced state management hook with individual field subscriptions
 * Optimized for arrays, objects, and complex nested data structures
 *
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 * @license MIT License
 */

import { useRef, useCallback, useMemo, useState, useEffect } from "react";
import { FieldStore } from "../core/FieldStore";
import { getNestedValue, setNestedValue } from "../utils/dotNotation";

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

    /** Debounce delay for state updates in milliseconds | 상태 업데이트를 위한 디바운스 지연 시간 (밀리초) */
    debounceMs?: number;
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

    /** Reset to initial values | 초기값으로 재설정 */
    reset: () => void;

    /** Handle standard input change events | 표준 입력 변경 이벤트 처리 */
    handleChange: (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;

    /** Check if a field exists | 필드 존재 여부 확인 */
    hasField: (path: string) => boolean;

    /** Remove a field from state | 상태에서 필드 제거 */
    removeField: (path: string) => void;

    /** Get a single field value (non-reactive) | 단일 필드 값 가져오기 (반응형 아님) */
    getValue: (path: string) => any;

    /** Subscribe to all state changes | 모든 상태 변경에 구독 */
    subscribe: (callback: (values: T) => void) => () => void;

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

    useEffect(() => {
        // 구독 설정 / Setup subscription
        const unsubscribe = store.subscribe(fieldName, () => {
            const newValue = store.getValue(fieldName);
            setValue(newValue);
        });

        return unsubscribe;
    }, [fieldName]); // store는 참조가 변경되지 않는다고 가정하고 의존성에서 제거

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
    const { onChange, deepEquals = false, _externalStore } = options;

    // Create or use external field store instance (persists across renders)
    // 필드 스토어 인스턴스 생성 또는 외부 스토어 사용 (렌더링 간 유지)
    const storeRef = useRef<FieldStore<T> | null>(null);
    if (_externalStore) {
        storeRef.current = _externalStore;
    } else if (!storeRef.current) {
        storeRef.current = new FieldStore<T>(initialValues);

        // Set up global change listener if provided
        // 글로벌 변경 리스너 설정 (제공된 경우)
        if (onChange) {
            storeRef.current.subscribeGlobal(() => {
                onChange(storeRef.current!.getValues());
            });
        }
    }

    const store = storeRef.current;

    // Update initial values when they change (only for non-external stores)
    // 초기값이 변경되면 업데이트 (외부 스토어가 아닌 경우에만)
    const initialValuesRef = useRef(initialValues);
    const initialValuesStringRef = useRef(JSON.stringify(initialValues));

    useEffect(() => {
        const currentInitialValuesString = JSON.stringify(initialValues);
        if (
            !_externalStore &&
            store &&
            initialValuesStringRef.current !== currentInitialValuesString
        ) {
            store.setInitialValues(initialValues);
            initialValuesRef.current = initialValues;
            initialValuesStringRef.current = currentInitialValuesString;
        }
    }, [initialValues, _externalStore]); // store 의존성 제거

    // Subscribe to a specific field value with dot notation
    // dot notation으로 특정 필드 값 구독
    const useValue = useCallback(
        <K extends string>(path: K) => {
            return useFieldValue(store, path);
        },
        [] // store 의존성 제거 - storeRef.current는 안정적인 참조
    );

    // Set a specific field value with dot notation
    // dot notation으로 특정 필드 값 설정
    const setValue = useCallback(
        <K extends string>(path: K, value: any) => {
            store.setValue(path, value);
        },
        [] // store 의존성 제거
    );

    // Get all current values (non-reactive)
    // 모든 현재 값 가져오기 (반응형 아님)
    const getValues = useCallback(() => {
        return store.getValues();
    }, []); // store 의존성 제거

    // Set all values at once
    // 모든 값을 한 번에 설정
    const setValues = useCallback(
        (values: Partial<T>) => {
            const currentValues = store.getValues();
            const newValues = { ...currentValues, ...values };
            store.setValues(newValues as T);
        },
        [] // store 의존성 제거
    );

    // Reset to initial values
    // 초기값으로 재설정
    const reset = useCallback(() => {
        store.setValues(initialValuesRef.current);
    }, []); // store 의존성 제거

    // Handle standard input change events
    // 표준 입력 변경 이벤트 처리
    const handleChange = useCallback(
        (
            event: React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
            >
        ) => {
            const { name, value, type } = event.target;

            if (!name) {
                console.warn(
                    'useFormaState.handleChange: input element must have a "name" attribute'
                );
                return;
            }

            let processedValue: any = value;

            // Handle different input types
            // 다양한 입력 타입 처리
            if (type === "checkbox") {
                processedValue = (event.target as HTMLInputElement).checked;
            } else if (type === "number") {
                processedValue = value === "" ? "" : Number(value);
            }

            setValue(name, processedValue);
        },
        [setValue]
    );

    return {
        useValue,
        setValue,
        getValues,
        setValues,
        reset,
        handleChange,
        hasField: useCallback(
            (path: string) => {
                return store.hasField(path);
            },
            [] // store 의존성 제거
        ),
        removeField: useCallback(
            (path: string) => {
                store.removeField(path);
            },
            [] // store 의존성 제거
        ),
        getValue: useCallback(
            (path: string) => {
                return store.getValue(path);
            },
            [] // store 의존성 제거
        ),
        subscribe: useCallback(
            (callback: (values: T) => void) => {
                return store.subscribeToAll(callback);
            },
            [] // store 의존성 제거
        ),
        _store: store,
    };
}
