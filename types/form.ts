/**
 * form.ts
 *
 * Forma - 기본 폼 관련 타입 정의 | Basic form-related type definitions
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

// MUI 타입들 (선택적 import) | MUI types (optional import)
type SelectChangeEvent<T = string> = {
    target: { name?: string; value: T };
};
type PickerChangeHandlerContext<T> = any;

/**
 * 폼 이벤트 타입 정의 | Form event type definitions
 * MUI 컴포넌트들의 다양한 이벤트 타입을 통합 | Unified event types for various MUI components
 */
export type FormChangeEvent =
    | React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    | SelectChangeEvent
    | SelectChangeEvent<string | number>
    | {
          target: { name: string; value: any };
          onChange?: (
              value: any,
              context: PickerChangeHandlerContext<any>
          ) => void;
      };

/**
 * DatePicker 전용 핸들러 타입
 * MUI DatePicker 컴포넌트와의 통합을 위한 타입
 */
export type DatePickerChangeHandler = (
    fieldName: string
) => (value: any, context?: PickerChangeHandlerContext<any>) => void;

/**
 * useForm 훅의 Props 타입 | useForm hook Props type
 */
export interface UseFormProps<T extends Record<string, any>> {
    /** 폼의 초기값 | Initial form values */
    initialValues: T;
    /** 폼 제출 핸들러 | Form submission handler */
    onSubmit?: (values: T) => Promise<void> | void;
    /** 폼 검증 핸들러 | Form validation handler */
    onValidate?: (values: T) => Promise<boolean> | boolean;
    /** 폼 제출 완료 후 콜백 | Callback after form submission completion */
    onComplete?: (values: T) => void;
    /** 내부 API - 전역 상태용 외부 스토어 | Internal API - external store for global state */
    _externalStore?: FieldStore<T>;
}

/**
 * useForm 훅의 옵셔널 Props 타입 (Zero-Config용) | useForm hook optional Props type (for Zero-Config)
 */
export interface UseFormPropsOptional<
    T extends Record<string, any> = Record<string, any>
> {
    /** 폼의 초기값 (선택사항) | Initial form values (optional) */
    initialValues?: T;
    /** 폼 제출 핸들러 | Form submission handler */
    onSubmit?: (values: T) => Promise<void> | void;
    /** 폼 검증 핸들러 | Form validation handler */
    onValidate?: (values: T) => Promise<boolean> | boolean;
    /** 폼 제출 완료 후 콜백 | Callback after form submission completion */
    onComplete?: (values: T) => void;
    /** 내부 API - 전역 상태용 외부 스토어 | Internal API - external store for global state */
    _externalStore?: FieldStore<T>;
}

/**
 * useForm 훅의 반환 타입 | useForm hook return type
 */
export interface UseFormReturn<T extends Record<string, any>> {
    /** 개별 필드 값 구독 함수 | Individual field value subscription function */
    useFormValue: (fieldName: keyof T | string) => any;
    /** 폼 변경 핸들러 (MUI 컴포넌트용) | Form change handler (for MUI components) */
    handleFormChange: (event: FormChangeEvent) => void;
    /** DatePicker 변경 핸들러 | DatePicker change handler */
    handleDatePickerChange: DatePickerChangeHandler;
    /** 모든 폼 값 가져오기 | Get all form values */
    getFormValues: () => T;
    /** 특정 필드 값 가져오기 | Get specific field value */
    getFormValue: (fieldName: keyof T | string) => any;
    /** 특정 필드 값 설정 | Set specific field value */
    setFormValue: (fieldName: keyof T | string, value: any) => void;
    /** 모든 폼 값 설정 | Set all form values */
    setFormValues: (values: Partial<T>) => void;
    /** 초기값 재설정 | Reset initial values */
    setInitialFormValues: (newInitialValues: T) => void;
    /** 폼 리셋 | Reset form */
    resetForm: () => void;
    /** 폼 제출 | Submit form */
    submit: () => Promise<boolean>;
    /** 폼 검증 | Validate form */
    validateForm: () => Promise<boolean>;
    /** 수정 여부 | Modified status */
    isModified: boolean;
    /** 제출 중 여부 | Submitting status */
    isSubmitting: boolean;
    /** 검증 중 여부 | Validating status */
    isValidating: boolean;
    /** 호환성을 위한 values 객체 (비권장) | Values object for compatibility (not recommended) */
    values: T;
    /** 내부 스토어 직접 접근 | Direct access to internal store */
    _store: FieldStore<T>;
}

/**
 * 폼 상태 타입 | Form state type
 */
export type FormState =
    | "idle"
    | "submitting"
    | "validating"
    | "error"
    | "success";

/**
 * 폼 검증 결과 타입 | Form validation result type
 */
export interface FormValidationResult {
    /** 검증 성공 여부 | Validation success status */
    isValid: boolean;
    /** 에러 메시지 (필드별) | Error messages (by field) */
    errors?: Record<string, string>;
    /** 전체 에러 메시지 | Overall error message */
    message?: string;
}
