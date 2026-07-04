/**
 * storeSurface.ts
 *
 * Forma - store 수준 훅 표면(hook surface) 캐시
 * Per-store cached hook surfaces shared by useFormaState / useForm
 *
 * store 하나당 한 번만 생성되는 안정(stable) 메서드 묶음을 제공하여,
 * 렌더마다 useCallback 래퍼 ~13개 + 대형 반환 리터럴을 만들던 비용을 제거한다.
 * useValue/useFormValue 같은 훅 위임도 순수 위임(`(path) => useFieldValue(store, path)`)이라
 * store 수준 함수로 캐시할 수 있다. (React 를 런타임 import 하지 않아 node:test 로 직접 검증 가능)
 *
 * @license MIT License
 * @copyright 2025 KIM YOUNG JIN (Kim Young Jin)
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 */

import type { FieldStore } from "../core/FieldStore";
import type { FormChangeEvent, FormChangeHandler } from "../types/form";
import type { UseFormaStateReturn } from "./useFormaState";
import type { UseFormReturn } from "../types/form";
import { devWarn } from "../utils/environment";

/**
 * 개별 필드 구독 훅 시그니처 (React 훅 — 표면 생성 시 주입받아 사용)
 * Field-subscription hook signature (a React hook, injected at surface creation)
 */
export type FieldValueHook = (store: FieldStore<any>, path: string) => any;

/**
 * useFormaState 반환값 중 store 수준에서 안정적으로 캐시 가능한 부분
 * The store-level (identity-stable) portion of UseFormaStateReturn
 */
export type StateSurface<T extends Record<string, any>> = Omit<
    UseFormaStateReturn<T>,
    "actions" | "clearPersisted" | "hasPersisted"
>;

/**
 * useForm 반환값 중 store 수준에서 안정적으로 캐시 가능한 부분
 * The store-level (identity-stable) portion of UseFormReturn
 */
export type FormSurface<T extends Record<string, any>> = Pick<
    UseFormReturn<T>,
    | "useValue"
    | "useFormValue"
    | "getFormValue"
    | "getFormValues"
    | "setFormValue"
    | "setFormValues"
    | "setInitialFormValues"
    | "handleFormChange"
    | "handleDatePickerChange"
    | "_store"
>;

// store → StateSurface 캐시 (store 수명과 함께 GC) | per-store StateSurface cache
const stateSurfaceCache = new WeakMap<FieldStore<any>, StateSurface<any>>();

// store → FormSurface 캐시 (store 수명과 함께 GC) | per-store FormSurface cache
const formSurfaceCache = new WeakMap<FieldStore<any>, FormSurface<any>>();

/**
 * Dayjs 유사 객체(.format 보유)를 날짜 문자열로, null 을 undefined 로 정규화한다
 * Normalize Dayjs-like objects (with .format) to date strings and null to undefined
 */
function normalizeDateOrNull(value: any): any {
    if (value && typeof value === "object" && typeof value.format === "function") {
        return value.format("YYYY-MM-DD");
    }
    if (value === null) {
        return undefined;
    }
    return value;
}

/**
 * store 수준 useFormaState 훅 표면을 반환한다 (store 당 1회 생성 후 재사용, 식별자 안정)
 * Return the store-level useFormaState hook surface (created once per store, identity-stable)
 */
export function getStateSurface<T extends Record<string, any>>(
    store: FieldStore<T>,
    useFieldValueHook: FieldValueHook,
): StateSurface<T> {
    let surface = stateSurfaceCache.get(store) as StateSurface<T> | undefined;
    if (surface) return surface;

    const api = store.getApi(); // pre-bound, store 수명 동안 안정 / stable for the store's lifetime

    // 전체 값 병합 설정 — getValues() 는 공유 캐시 객체이므로 병합 전에 얕은 복사한다
    // Merge-set all values — getValues() returns a shared cached object, so shallow-copy before merging
    const setValues = (values: Partial<T>): void => {
        const newValues = { ...api.getValues(), ...values };
        api.setValues(newValues as T);
    };

    // 표준 입력 변경 이벤트 처리 (DatePicker/checkbox/number/null 정규화 포함)
    // Handle standard input change events (normalizes DatePicker/checkbox/number/null)
    const handleChange = (event: FormChangeEvent): void => {
        const target = event.target;
        if (!target || !target.name) {
            devWarn(
                'useFormaState.handleChange: input element must have a "name" attribute',
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

        api.setValue(name, processedValue);
    };

    surface = {
        // 개별 필드 구독 훅 — 순수 위임이라 store 수준에서 안정 / pure delegation, stable per store
        useValue: <K extends string>(path: K) => useFieldValueHook(store, path),
        setValue: api.setValue, // 필드 값 설정 / set field value
        getValues: api.getValues, // 전체 값 스냅샷 (공유 캐시 — 변형 금지) / shared cached snapshot (read-only)
        setValues, // 병합 설정 / merge-set values
        setBatch: api.setBatch, // 배치 설정 / batch set
        reset: api.reset, // 초기값 리셋 / reset to initial values
        setInitialValues: api.setInitialValues, // 초기값 재설정 / set new initial values
        handleChange, // 입력 이벤트 핸들러 / input change handler
        handleFormChange: handleChange, // handleChange 별칭 / alias of handleChange
        hasField: api.hasField, // 필드 존재 여부 / field existence
        removeField: api.removeField, // 필드 제거 / remove field
        getValue: api.getValue, // 단일 값 조회 / get single value
        subscribe: (callback: (values: T) => void) =>
            store.subscribeToAll(callback), // 전체 변경 구독 (콜백 인자는 공유 캐시 객체) / subscribe to all changes
        refreshFields: api.refreshFields, // prefix 구독자 새로고침 / refresh subscribers by prefix
        _store: store, // 내부 스토어 직접 접근 / direct store access
    };

    stateSurfaceCache.set(store, surface);
    return surface;
}

/**
 * store 수준 useForm 훅 표면을 반환한다 (store 당 1회 생성 후 재사용, 식별자 안정)
 * Return the store-level useForm hook surface (created once per store, identity-stable)
 */
export function getFormSurface<T extends Record<string, any>>(
    store: FieldStore<T>,
    useFieldValueHook: FieldValueHook,
): FormSurface<T> {
    let surface = formSurfaceCache.get(store) as FormSurface<T> | undefined;
    if (surface) return surface;

    const api = store.getApi(); // pre-bound, store 수명 동안 안정 / stable for the store's lifetime
    const stateSurface = getStateSurface<T>(store, useFieldValueHook);

    // 개별 필드 구독 훅 (undefined → "" 변환으로 MUI TextField 호환) / field hook with undefined→"" for MUI
    const useFormValue = (fieldName: keyof T | string) => {
        const value = useFieldValueHook(store, fieldName as string);
        return value === undefined ? "" : value;
    };

    // 통합 폼 변경 핸들러 — 이벤트 또는 (name, value) 직접 전달 모두 지원
    // Unified form change handler — supports both event object and direct (name, value)
    const handleFormChange: FormChangeHandler = ((
        eventOrName: FormChangeEvent | string,
        directValue?: any,
    ) => {
        let name: string;
        let value: any;

        // (name, value) 형태로 직접 호출된 경우 / called directly with (name, value)
        if (typeof eventOrName === "string") {
            name = eventOrName;
            value = directValue;
        } else {
            // 이벤트 객체로 호출된 경우 / called with an event object
            const target = eventOrName.target;
            if (!target || !target.name) return;

            const { type, checked } = target as any;
            name = target.name;
            value = target.value;

            // 체크박스 처리 / Checkbox handling
            if (type === "checkbox") {
                value = checked;
            }
            // 숫자 타입 처리 / Number type handling
            else if (type === "number") {
                value = Number(value);
            }
        }

        // DatePicker(Dayjs)/null 정규화 / normalize DatePicker(Dayjs)/null
        value = normalizeDateOrNull(value);

        api.setValue(name, value);
    }) as FormChangeHandler;

    // DatePicker 전용 커링 핸들러 / curried DatePicker-specific handler
    const handleDatePickerChange = (fieldName: string) => {
        return (value: any, _context?: any) => {
            api.setValue(fieldName, normalizeDateOrNull(value));
        };
    };

    // 개별 필드 값 설정 (Dayjs/null 정규화 포함) / set individual field value (with Dayjs/null normalization)
    const setFormValue = (name: keyof T | string, value: any): void => {
        api.setValue(name as string, normalizeDateOrNull(value));
    };

    surface = {
        useValue: useFormValue, // useGlobalFormaState 호환 별칭 / compatible alias
        useFormValue, // 개별 필드 구독 훅 / field subscription hook
        getFormValue: api.getValue, // 단일 값 조회 / get single value
        getFormValues: api.getValues, // 전체 값 스냅샷 (공유 캐시 — 변형 금지) / shared cached snapshot (read-only)
        setFormValue, // 개별 필드 설정 / set individual field
        setFormValues: stateSurface.setValues, // 병합 설정 재사용 / reuse merge-set
        setInitialFormValues: api.setInitialValues, // 초기값 재설정 / set new initial values
        handleFormChange, // 폼 변경 핸들러 / form change handler
        handleDatePickerChange, // DatePicker 핸들러 / DatePicker handler
        _store: store, // 내부 스토어 직접 접근 / direct store access
    };

    formSurfaceCache.set(store, surface);
    return surface;
}
