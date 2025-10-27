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

import {
    FormChangeEvent,
    DatePickerChangeHandler,
    UseFormProps,
    UseFormPropsOptional,
    UseFormReturn,
} from "../types/form";
import { useFormaState } from "./useFormaState";
import { devError, mergeActions } from "../utils";

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

// Zero-Config 오버로드: props 없이 사용
export function useForm<
    T extends Record<string, any> = Record<string, any>
>(): UseFormReturn<T>;

// Zero-Config 오버로드: 옵셔널 props를 가진 경우
export function useForm<T extends Record<string, any> = Record<string, any>>(
    props?: UseFormPropsOptional<T>
): UseFormReturn<T>;

// 전체 props를 가진 기본 오버로드
export function useForm<T extends Record<string, any>>(
    props: UseFormProps<T>
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
    props:
        | UseFormProps<T>
        | UseFormPropsOptional<T> = {} as UseFormPropsOptional<T>
): UseFormReturn<T> {
    const {
        initialValues = {} as T,
        onSubmit,
        onValidate,
        onComplete,
        actions: userActions,
        _externalStore,
    } = props;

    // 초기값 안정화: 첫 번째 렌더링에서만 초기값을 고정
    // Stabilize initial values: fix initial values only on first render
    const stableInitialValues = useRef<T | null>(null);
    if (!stableInitialValues.current) {
        stableInitialValues.current = initialValues;
    }

    // useFormaState를 기반으로 사용 / Use useFormaState as foundation
    const fieldState = useFormaState<T>(stableInitialValues.current, {
        _externalStore,
    });

    // 폼 특정 상태 관리 / Form-specific state management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // 폼이 수정되었는지 확인 / Check if form is modified
    // Store의 변경 사항을 추적하여 효율적으로 감지
    const [isModified, setIsModified] = useState(false);

    useEffect(() => {
        const unsubscribe = fieldState._store.subscribeGlobal(() => {
            setIsModified(fieldState._store.isModified());
        });

        // 초기 상태 설정
        setIsModified(fieldState._store.isModified());

        return unsubscribe;
    }, [fieldState._store]);

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

            fieldState.setValue(name, newValue);
        },
        [fieldState.setValue]
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

                fieldState.setValue(fieldName, newValue);
            };
        },
        [fieldState.setValue]
    );

    /**
     * 개별 필드 값 설정 / Set individual field value
     */
    const setFormValue = useCallback(
        (name: keyof T | string, value: any) => {
            let processedValue = value;

            // DatePicker에서 오는 Dayjs 객체 처리 / Handle Dayjs object from DatePicker
            if (value && typeof value === "object" && value.format) {
                processedValue = value.format("YYYY-MM-DD");
            } else if (value === null) {
                processedValue = undefined;
            }

            fieldState.setValue(name as string, processedValue);
        },
        [fieldState.setValue]
    );

    /**
     * 전체 폼 값 설정 / Set all form values
     */
    const setFormValues = useCallback(
        (newValues: Partial<T>) => {
            fieldState.setValues(newValues);
        },
        [fieldState.setValues]
    );

    /**
     * 초기값 재설정 / Reset initial values
     */
    const setInitialFormValues = useCallback(
        (newInitialValues: T) => {
            stableInitialValues.current = newInitialValues;
            fieldState._store.setInitialValues(newInitialValues);
        },
        [fieldState._store]
    );

    /**
     * 구독 없이 현재 값만 가져오기 / Get current value without subscription
     */
    const getFormValue = useCallback(
        (fieldName: keyof T | string): any => {
            return fieldState._store.getValue(fieldName as string);
        },
        [fieldState._store]
    );

    /**
     * 모든 폼 값 가져오기 / Get all form values
     */
    const getFormValues = useCallback((): T => {
        return fieldState.getValues();
    }, [fieldState.getValues]);

    /**
     * 개별 필드 구독 Hook / Individual field subscription hook
     * 해당 필드가 변경될 때만 컴포넌트가 리렌더링됩니다
     * Component re-renders only when the specific field changes
     */
    const useFormValue = useCallback(
        (fieldName: keyof T | string) => {
            const value = fieldState.useValue(fieldName as string);
            // undefined를 빈 문자열로 변환하여 MUI TextField와 호환성 확보
            return value === undefined ? "" : value;
        },
        [fieldState.useValue]
    );

    /**
     * 폼 검증 / Form validation
     */
    const validateForm = useCallback(
        async (valuesToValidate?: T) => {
            if (!onValidate) return true;
            setIsValidating(true);
            const currentValues = valuesToValidate || fieldState.getValues();

            try {
                return await onValidate(currentValues);
            } catch (error) {
                devError("Validation error:", error);
                return false;
            } finally {
                setIsValidating(false);
            }
        },
        [onValidate, fieldState.getValues]
    );

    /**
     * 폼 초기화 / Reset form
     */
    const resetForm = useCallback(() => {
        fieldState.reset();
        setIsSubmitting(false);
        setIsValidating(false);
    }, [fieldState.reset]);

    /**
     * 폼 제출 / Submit form
     */
    const submit = useCallback(
        async (e?: React.FormEvent): Promise<boolean> => {
            if (e) e.preventDefault();

            const currentValues = fieldState.getValues();
            if (!(await validateForm(currentValues))) {
                return false;
            }

            setIsSubmitting(true);

            try {
                if (onSubmit) {
                    const result = await onSubmit(currentValues);
                    // onSubmit이 boolean을 반환하면 해당 값 사용, 아니면 true로 간주
                    if (result === false) {
                        return false;
                    }
                }

                if (onComplete) {
                    onComplete(currentValues);
                }

                return true;
            } catch (error) {
                devError("Form submission error:", error);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [onSubmit, onComplete, validateForm, fieldState.getValues]
    );

    // Actions 바인딩 - context와 함께 사용할 수 있도록 / Actions binding - to use with context
    const boundActions = useMemo(() => {
        if (!userActions) return {} as any;

        // 배열이면 병합, 객체면 그대로 사용
        const mergedActions = mergeActions(userActions);
        if (!mergedActions) return {} as any;

        const bound: any = {};
        const context = {
            get values() {
                return fieldState.getValues();
            },
            getValue: (fieldName: keyof T | string) =>
                fieldState.getValue(fieldName as string),
            setValue: (fieldName: keyof T | string, value: any) =>
                fieldState.setValue(fieldName as string, value),
            setValues: (values: Partial<T>) => fieldState.setValues(values),
            reset: resetForm,
            submit,
            validate: validateForm,
            actions: bound, // 순환 참조 / circular reference
        };

        // 모든 action 함수들을 context와 바인딩 / Bind all action functions with context
        Object.keys(mergedActions).forEach((key) => {
            const action = mergedActions[key];
            if (typeof action === "function") {
                bound[key] = (...args: any[]) => action(context, ...args);
            }
        });

        return bound;
    }, [userActions, fieldState, resetForm, submit, validateForm]);
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

            // Actions
            actions: boundActions, // 사용자 정의 actions / user-defined actions

            // 호환성 / Compatibility
            values: fieldState.getValues(), // 호환성을 위한 values 객체 (비권장) / Values object for compatibility (not recommended)

            // 고급 사용 / Advanced usage
            _store: fieldState._store, // 직접 store 접근용 / direct store access
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
            boundActions, // actions 의존성 추가
            fieldState._store, // Store 의존성으로 대체
        ]
    );
}
