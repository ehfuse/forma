/**
 * useForm.ts
 *
 * Forma - 고급 폼 상태 관리 훅 / Advanced form state management hook
 * 개별 필드 구독과 성능 최적화를 제공하는 핵심 훅
 * Core hook providing individual field subscriptions and performance optimization
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

import { FieldStore } from "../core/FieldStore";
import {
    FormChangeEvent,
    DatePickerChangeHandler,
    UseFormProps,
} from "../types/form";

import React, {
    useEffect,
    useState,
    useCallback,
    useRef,
    useMemo,
} from "react";

// MUI DatePicker 타입 (선택적 import) / MUI DatePicker type (optional import)
type PickerChangeHandlerContext<T> = any;

/**
 * 개별 필드 구독 / Individual field subscription
 * 특정 필드만 구독하여 해당 필드가 변경될 때만 리렌더링
 * Subscribe to specific field only, re-render only when that field changes
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
 * Forma 핵심 폼 관리 훅 / Forma core form management hook
 *
 * 고급 폼 상태 관리와 성능 최적화를 제공합니다
 * Provides advanced form state management and performance optimization
 *
 * Features:
 * - 개별 필드 구독으로 선택적 리렌더링 / Selective re-rendering with individual field subscriptions
 * - Dot notation 지원으로 중첩 객체 처리 / Nested object handling with dot notation support
 * - MUI 컴포넌트 완전 호환 / Full MUI component compatibility
 * - TypeScript 완전 지원 / Complete TypeScript support
 *
 * @template T 폼 데이터의 타입 / Form data type
 * @param props 폼 설정 옵션 / Form configuration options
 * @returns 폼 관리 API 객체 / Form management API object
 */
export function useForm<T extends Record<string, any>>({
    initialValues,
    onSubmit,
    onValidate,
    onComplete,
    _externalStore,
}: UseFormProps<T>) {
    // Store 인스턴스 (외부 스토어가 있으면 사용, 없으면 로컬 생성)
    // Store instance (use external store if provided, otherwise create local one)
    const storeRef = useRef<FieldStore<T> | null>(null);
    if (_externalStore) {
        storeRef.current = _externalStore;
    } else if (!storeRef.current) {
        storeRef.current = new FieldStore(initialValues);
    }
    const store = storeRef.current;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isModified, setIsModified] = useState(false);

    // 전역 상태 구독 (isModified 추적) / Global state subscription (isModified tracking)
    useEffect(() => {
        const checkModified = () => {
            const modified = store.isModified();
            setIsModified(modified);
        };

        checkModified();
        const unsubscribe = store.subscribeGlobal(checkModified);
        return unsubscribe;
    }, [store]);

    // 호환성을 위한 values 객체 (비권장) / Values object for compatibility (not recommended)
    const [valuesSnapshot, setValuesSnapshot] = useState(() =>
        store.getValues()
    );

    useEffect(() => {
        const unsubscribe = store.subscribeGlobal(() => {
            setValuesSnapshot(store.getValues());
        });
        return unsubscribe;
    }, [store]);

    const values = valuesSnapshot;

    /**
     * 통합 폼 변경 핸들러 / Unified form change handler
     * MUI Select, TextField, DatePicker 등 모든 컴포넌트 지원
     * Supports all components: MUI Select, TextField, DatePicker, etc.
     */
    const handleFormChange = useCallback(
        (e: FormChangeEvent) => {
            const target = e.target;
            if (!target || !target.name) return;

            const { name, type, value, checked } = target as any;
            let newValue = value;

            // DatePicker 처리 (Dayjs 객체) / DatePicker handling (Dayjs object)
            if (value && typeof value === "object" && value.format) {
                newValue = value.format("YYYY-MM-DD");
            }
            // 체크박스 처리 / Checkbox handling
            else if (type === "checkbox") {
                newValue = checked;
            }
            // 숫자 타입 처리 / Number type handling
            else if (type === "number") {
                newValue = Number(value);
            }
            // null 값 처리 / Null value handling
            else if (value === null) {
                newValue = undefined;
            }

            store.setValue(name, newValue);
        },
        [store]
    );

    /**
     * DatePicker 전용 변경 핸들러 / DatePicker-specific change handler
     * 간편한 사용을 위한 커링 함수 / Curried function for convenient usage
     */
    const handleDatePickerChange: DatePickerChangeHandler = useCallback(
        (fieldName: string) => {
            return (value: any, _context?: PickerChangeHandlerContext<any>) => {
                let newValue = value;

                // DatePicker 처리 (Dayjs 객체) / DatePicker handling (Dayjs object)
                if (value && typeof value === "object" && value.format) {
                    newValue = value.format("YYYY-MM-DD");
                } else if (value === null) {
                    newValue = undefined;
                }

                store.setValue(fieldName, newValue);
            };
        },
        [store]
    );

    /**
     * 개별 필드 값 설정 / Set individual field value
     */
    const setFormValue = useCallback(
        (name: string, value: any) => {
            let processedValue = value;

            // DatePicker에서 오는 Dayjs 객체 처리 / Handle Dayjs object from DatePicker
            if (value && typeof value === "object" && value.format) {
                processedValue = value.format("YYYY-MM-DD");
            } else if (value === null) {
                processedValue = undefined;
            }

            store.setValue(name, processedValue);
        },
        [store]
    );

    /**
     * 전체 폼 값 설정 / Set all form values
     */
    const setFormValues = useCallback(
        (newValues: Partial<T>) => {
            store.setValues(newValues);
        },
        [store]
    );

    /**
     * 초기값 재설정 / Reset initial values
     */
    const setInitialFormValues = useCallback(
        (newInitialValues: T) => {
            store.setInitialValues(newInitialValues);
        },
        [store]
    );

    /**
     * 구독 없이 현재 값만 가져오기 / Get current value without subscription
     */
    const getFormValue = useCallback(
        (fieldName: string): any => {
            return store.getValue(fieldName);
        },
        [store]
    );

    /**
     * 모든 폼 값 가져오기 / Get all form values
     */
    const getFormValues = useCallback((): T => {
        return store.getValues();
    }, [store]);

    /**
     * 개별 필드 구독 Hook / Individual field subscription hook
     * 해당 필드가 변경될 때만 컴포넌트가 리렌더링됩니다
     * Component re-renders only when the specific field changes
     */
    const useFormValue = useCallback(
        (fieldName: string) => {
            return useFieldValue(store, fieldName);
        },
        [store]
    );

    /**
     * 폼 검증 / Form validation
     */
    const validateForm = useCallback(
        async (valuesToValidate?: T) => {
            if (!onValidate) return true;
            setIsValidating(true);
            const currentValues = valuesToValidate || store.getValues();

            try {
                return await onValidate(currentValues);
            } catch (error) {
                console.error("Validation error:", error);
                return false;
            } finally {
                setIsValidating(false);
            }
        },
        [onValidate, store]
    );

    /**
     * 폼 초기화 / Reset form
     */
    const resetForm = useCallback(() => {
        store.reset();
        setIsSubmitting(false);
        setIsValidating(false);
    }, [store]);

    /**
     * 폼 제출 / Submit form
     */
    const submit = useCallback(
        async (e?: React.FormEvent): Promise<boolean> => {
            if (e) e.preventDefault();

            const currentValues = store.getValues();
            if (!(await validateForm(currentValues))) {
                return false;
            }

            setIsSubmitting(true);

            try {
                if (onSubmit) {
                    await onSubmit(currentValues);
                }

                if (onComplete) {
                    onComplete(currentValues);
                }

                return true;
            } catch (error) {
                console.error("Form submission error:", error);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSubmit, onComplete, validateForm, store]
    );

    return useMemo(
        () => ({
            // 상태 / State
            isSubmitting,
            isValidating,
            isModified,

            // 값 가져오기 / Get values
            useFormValue, // Hook - 구독 있음 (성능 최적화) / with subscription (performance optimized)
            getFormValue, // 함수 - 구독 없음 (현재 값만) / function - no subscription (current value only)
            getFormValues, // 함수 - 모든 값 / function - all values

            // 값 설정 / Set values
            setFormValue, // 개별 필드 설정 / set individual field
            setFormValues, // 전체 값 설정 / set all values
            setInitialFormValues, // 초기값 재설정 / reset initial values

            // 이벤트 핸들러 / Event handlers
            handleFormChange, // 폼 요소 onChange (MUI 완전 호환) / form element onChange (fully MUI compatible)
            handleDatePickerChange, // DatePicker 전용 onChange / DatePicker-specific onChange

            // 폼 액션 / Form actions
            submit, // 폼 제출 / submit form
            resetForm, // 폼 초기화 / reset form
            validateForm, // 폼 검증 / validate form

            // 호환성 / Compatibility
            values, // 비권장: 전체 리렌더링 발생 / not recommended: causes full re-renders

            // 고급 사용 / Advanced usage
            _store: store, // 직접 store 접근용 / direct store access
        }),
        [
            isSubmitting,
            isValidating,
            isModified,
            useFormValue,
            getFormValue,
            getFormValues,
            setFormValue,
            setFormValues,
            setInitialFormValues,
            handleFormChange,
            handleDatePickerChange,
            submit,
            resetForm,
            validateForm,
            values,
        ]
    );
}
