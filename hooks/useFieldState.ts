/**
 * useFieldState.ts
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
 * Options for configuring useFieldState hook
 * useFieldState 훅 설정을 위한 옵션
 */
export interface UseFieldStateOptions<T extends Record<string, any>> {
    /** Optional callback when state changes | 상태 변경 시 선택적 콜백 */
    onChange?: (values: T) => void;

    /** Enable deep equality checking for better performance | 성능 향상을 위한 깊은 동등성 검사 활성화 */
    deepEquals?: boolean;

    /** External FieldStore instance for shared state | 공유 상태를 위한 외부 FieldStore 인스턴스 */
    _externalStore?: FieldStore<T>;
}

/**
 * Return type of useFieldState hook
 * useFieldState 훅의 반환 타입
 */
export interface UseFieldStateReturn<T extends Record<string, any>> {
    /** Subscribe to a specific field value with dot notation | dot notation으로 특정 필드 값 구독 */
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

    /** Direct access to the internal store for advanced usage | 고급 사용을 위한 내부 스토어 직접 접근 */
    _store: FieldStore<T>;

    /** Current values (reactive) | 현재 값들 (반응형) */
    values: T;
}

/**
 * Individual field subscription for useFieldState
 * 개별 필드 구독을 위한 내부 함수
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
    }, [fieldName]); // store 의존성 제거로 불필요한 재구독 방지 / Remove store dependency to prevent unnecessary re-subscriptions

    return value;
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
 * const state = useFieldState({
 *   initialValues: {
 *     users: [
 *       { name: 'John', email: 'john@example.com', age: 30 },
 *       { name: 'Jane', email: 'jane@example.com', age: 25 }
 *     ],
 *     settings: { theme: 'dark', notifications: true }
 *   }
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
export function useFieldState<T extends Record<string, any>>(
    initialValues: T,
    options: UseFieldStateOptions<T> = {}
): UseFieldStateReturn<T> {
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
    useEffect(() => {
        if (!_externalStore && store) {
            store.setInitialValues(initialValues);
        }
    }, [initialValues, store, _externalStore]);

    // Subscribe to a specific field value with dot notation
    // dot notation으로 특정 필드 값 구독
    const useValue = useCallback(
        <K extends string>(path: K) => {
            return useFieldValue(store, path);
        },
        [store]
    );

    // Set a specific field value with dot notation
    // dot notation으로 특정 필드 값 설정
    const setValue = useCallback(
        <K extends string>(path: K, value: any) => {
            const currentValues = store.getValues();
            const newValues = setNestedValue(currentValues, path, value);
            store.setValues(newValues);
        },
        [store]
    );

    // Get all current values (non-reactive)
    // 모든 현재 값 가져오기 (반응형 아님)
    const getValues = useCallback(() => {
        return store.getValues();
    }, [store]);

    // Set all values at once
    // 모든 값을 한 번에 설정
    const setValues = useCallback(
        (values: Partial<T>) => {
            const currentValues = store.getValues();
            const newValues = { ...currentValues, ...values };
            store.setValues(newValues as T);
        },
        [store]
    );

    // Reset to initial values
    // 초기값으로 재설정
    const reset = useCallback(() => {
        store.setValues(initialValues);
    }, [store, initialValues]);

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
                    'useFieldState.handleChange: input element must have a "name" attribute'
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

    // Get reactive values using the store's reactive mechanism
    // 스토어의 반응형 메커니즘을 사용하여 반응형 값 가져오기
    const values = useMemo(() => {
        // This creates a reactive subscription to all values
        // 모든 값에 대한 반응형 구독 생성
        return store.getValues();
    }, [store]);

    return {
        useValue,
        setValue,
        getValues,
        setValues,
        reset,
        handleChange,
        _store: store,
        values,
    };
}
