/**
 * globalForm.ts
 *
 * Forma - 전역 폼 상태 관리 관련 TypeScript 타입 정의 | Global form state management related TypeScript type definitions
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

import { ReactNode } from "react";
import { FieldStore } from "../core/FieldStore";
import { UseFormReturn, Actions, ActionContext } from "./form";
import { UseFormaStateReturn } from "../hooks/useFormaState";

/**
 * 글로벌 Forma Provider Props | Global Forma provider props
 */
export interface GlobalFormaProviderProps {
    children: ReactNode;
}

/**
 * useGlobalForm 훅의 Props 타입 | useGlobalForm hook Props type
 * 글로벌 폼은 데이터 공유에만 집중 | Global form focuses only on data sharing
 */
export interface UseGlobalFormProps<T extends Record<string, any>> {
    /** 전역에서 폼을 식별하는 고유 ID | Unique ID to identify form globally */
    formId: string;
    /** 초기값 | Initial values for the form */
    initialValues?: Partial<T>;
    /** 컴포넌트 언마운트 시 자동 정리 여부 | Auto cleanup on component unmount */
    autoCleanup?: boolean;
    /** 폼 제출 핸들러 | Form submission handler */
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
    /** 폼 검증 핸들러 - true 반환 시 검증 통과 | Form validation handler - returns true if validation passes */
    onValidate?: (values: T) => Promise<boolean> | boolean;
    /** 폼 제출 완료 후 콜백 | Callback after form submission completion */
    onComplete?: (values: T) => void;
    /** 커스텀 액션 (computed getter 및 handler) - 객체 또는 배열로 전달 가능 | Custom actions (computed getters and handlers) - can be object or array */
    actions?: Actions<T> | Actions<T>[];
    /** 필드 변경 감시 | Watch field changes */
    watch?: WatchConfig<T>;
}

/**
 * Watch Handler 타입 | Watch handler type
 */
export type WatchHandler<T extends Record<string, any>> = (
    context: ActionContext<T>,
    value: any,
    prevValue: any | undefined
) => void | Promise<void>;

/**
 * Watch Config 타입 | Watch config type
 */
export type WatchConfig<T extends Record<string, any>> = {
    [path: string]: WatchHandler<T>;
};

/**
 * useGlobalFormaState 훅의 Props 타입 (전체 옵션) | useGlobalFormaState hook Props type (full options)
 * 글로벌 FormaState는 개별 필드 구독 기반 전역 상태 관리에 집중 | Global FormaState focuses on global state management with individual field subscriptions
 */
export interface UseGlobalFormaStateProps<T extends Record<string, any>> {
    /** 전역에서 상태를 식별하는 고유 ID | Unique ID to identify state globally */
    stateId: string;
    /** 초기값 | Initial values for the state */
    initialValues?: Partial<T>;
    /** 컴포넌트 언마운트 시 자동 정리 여부 | Auto cleanup on component unmount */
    autoCleanup?: boolean;
    /** 커스텀 액션 (computed getter 및 handler) - 객체 또는 배열로 전달 가능 | Custom actions (computed getters and handlers) - can be object or array */
    actions?: Actions<T> | Actions<T>[];
    /** 필드 변경 감시 | Watch field changes */
    watch?: WatchConfig<T>;
}

/**
 * useGlobalForm 훅의 반환 타입 | useGlobalForm hook return type
 * useForm의 모든 기능에 글로벌 폼 전용 기능 추가 | All useForm features plus global form specific features
 */
export interface UseGlobalFormReturn<T extends Record<string, any>>
    extends UseFormReturn<T> {
    /** 글로벌 폼 ID | Global form ID */
    formId: string;
    /** 글로벌 스토어 직접 접근 | Direct access to global store */
    _store: FieldStore<T>;
}

/**
 * useGlobalFormaState 훅의 반환 타입 | useGlobalFormaState hook return type
 * useFormaState의 모든 기능에 글로벌 FormaState 전용 기능 추가 | All useFormaState features plus global FormaState specific features
 */
export interface UseGlobalFormaStateReturn<T extends Record<string, any>>
    extends UseFormaStateReturn<T> {
    /** 글로벌 FormaState ID | Global FormaState ID */
    stateId: string;
    /** 글로벌 스토어 직접 접근 (UseFormaStateReturn에도 있지만 명시적으로 재정의) | Direct access to global store */
    _store: FieldStore<T>;
}

/**
 * useRegisterGlobalForm Hook Props | useRegisterGlobalForm 훅 Props
 */
export interface UseRegisterGlobalFormProps<T extends Record<string, any>> {
    /** 글로벌 폼 식별자 | Global form identifier */
    formId: string;
    /** 등록할 useForm 인스턴스 | useForm instance to register */
    form: UseFormReturn<T>;
}

/**
 * useRegisterGlobalForm Hook Return | useRegisterGlobalForm 훅 반환값
 */
export interface UseRegisterGlobalFormReturn {
    // void hook - 반환값 없음 | void hook - no return value
}

/**
 * useRegisterGlobalFormaState Hook Props | useRegisterGlobalFormaState 훅 Props
 */
export interface UseRegisterGlobalFormaStateProps<
    T extends Record<string, any>
> {
    /** 글로벌 상태 식별자 | Global state identifier */
    stateId: string;
    /** 등록할 useFormaState 인스턴스 | useFormaState instance to register */
    formaState: UseFormaStateReturn<T>;
}

/**
 * useRegisterGlobalFormaState Hook Return | useRegisterGlobalFormaState 훅 반환값
 */
export interface UseRegisterGlobalFormaStateReturn {
    // void hook - 반환값 없음 | void hook - no return value
}

/**
 * useUnregisterGlobalForm Hook Return | useUnregisterGlobalForm 훅 반환값
 */
export interface UseUnregisterGlobalFormReturn {
    /** 특정 폼 등록 해제 | Unregister specific form */
    unregisterForm: (formId: string) => boolean;
    /** 모든 폼 제거 | Clear all forms */
    clearForms: () => void;
}

/**
 * useUnregisterGlobalFormaState Hook Return | useUnregisterGlobalFormaState 훅 반환값
 */
export interface UseUnregisterGlobalFormaStateReturn {
    /** 특정 상태 등록 해제 | Unregister specific state */
    unregisterState: (stateId: string) => boolean;
    /** 모든 상태 제거 | Clear all states */
    clearStates: () => void;
}

/**
 * 전역 폼 스토어 맵의 타입 | Type for global form store map
 * Key: formId (string)
 * Value: FieldStore 인스턴스
 */
export type GlobalFormStoreMap = Map<string, FieldStore<any>>;

/**
 * 전역 폼 메타데이터
 * 폼의 상태 정보를 추적하는데 사용
 */
export interface GlobalFormMetadata {
    /** 폼 ID */
    id: string;
    /** 생성된 시간 */
    createdAt: Date;
    /** 마지막 수정 시간 */
    lastModified: Date;
    /** 현재 이 폼을 사용 중인 컴포넌트 수 */
    activeComponents: number;
    /** 자동 정리 설정 여부 */
    autoCleanup: boolean;
}

/**
 * 폼 생명주기 이벤트 타입
 */
export type GlobalFormLifecycleEvent =
    | "created"
    | "accessed"
    | "modified"
    | "destroyed";

/**
 * 폼 생명주기 이벤트 핸들러 타입
 */
export type GlobalFormLifecycleHandler = (
    formId: string,
    event: GlobalFormLifecycleEvent,
    metadata?: Partial<GlobalFormMetadata>
) => void;

/**
 * 전역 폼 설정 옵션
 */
export interface GlobalFormConfig {
    /** 최대 동시 활성 폼 수 (기본값: 50) */
    maxActiveForms?: number;
    /** 자동 정리 활성화 여부 (기본값: true) */
    enableAutoCleanup?: boolean;
    /** 디버그 모드 활성화 여부 (기본값: development 환경에서만 true) */
    debugMode?: boolean;
    /** 생명주기 이벤트 핸들러 */
    onLifecycleEvent?: GlobalFormLifecycleHandler;
}

/**
 * 전역 폼 통계 정보
 */
export interface GlobalFormStats {
    /** 현재 활성 폼 수 */
    activeForms: number;
    /** 지금까지 생성된 총 폼 수 */
    totalFormsCreated: number;
    /** 지금까지 정리된 총 폼 수 */
    totalFormsDestroyed: number;
    /** 메모리 사용량 (추정치) */
    estimatedMemoryUsage: string;
    /** 가장 오래된 폼의 생성 시간 */
    oldestFormCreatedAt?: Date;
}

/**
 * 전역 폼 훅의 반환 타입에서 추가된 속성들
 */
export interface GlobalFormExtensions {
    /** 전역 폼 ID */
    formId: string;
    /** 전역 폼 상태 수동 정리 함수 */
    clearGlobalForm: () => void;
    /** 전역 폼 여부를 나타내는 플래그 */
    isGlobalForm: true;
}

/**
 * 폼이 전역 폼인지 구분하는 타입 가드용 인터페이스
 */
export interface GlobalFormIdentifier {
    isGlobalForm: true;
    formId: string;
}

/**
 * 로컬 폼과 전역 폼을 구분하는 Union 타입
 */
export type FormType = "local" | "global";

/**
 * 폼 사용량 추적을 위한 타입
 */
export interface FormUsageTracker {
    /** 폼 ID */
    formId: string;
    /** 폼을 사용하는 컴포넌트들의 참조 */
    componentRefs: Set<string>;
    /** 마지막 접근 시간 */
    lastAccessTime: Date;
    /** 총 접근 횟수 */
    accessCount: number;
}

/**
 * 전역 폼 에러 타입
 */
export class GlobalFormError extends Error {
    constructor(
        message: string,
        public formId?: string,
        public operation?: string
    ) {
        super(message);
        this.name = "GlobalFormError";
    }
}

/**
 * 전역 폼 경고 타입
 */
export interface GlobalFormWarning {
    type: "memory_usage" | "stale_form" | "excessive_forms" | "cleanup_failure";
    message: string;
    formId?: string;
    severity: "low" | "medium" | "high";
    timestamp: Date;
}

/**
 * 전역 폼 디버그 정보
 */
export interface GlobalFormDebugInfo {
    /** 모든 활성 폼의 메타데이터 */
    activeForms: Record<string, GlobalFormMetadata>;
    /** 성능 통계 */
    stats: GlobalFormStats;
    /** 최근 경고들 */
    recentWarnings: GlobalFormWarning[];
    /** 메모리 사용량 상세 정보 */
    memoryBreakdown: {
        formStores: number;
        fieldValues: number;
        listeners: number;
        metadata: number;
    };
}

/**
 * 전역 폼 상태 스냅샷
 * 디버깅이나 테스트 용도로 현재 상태를 캡처
 */
export interface GlobalFormSnapshot {
    /** 스냅샷 생성 시간 */
    timestamp: Date;
    /** 모든 폼의 현재 값들 */
    formValues: Record<string, any>;
    /** 폼 메타데이터들 */
    metadata: Record<string, GlobalFormMetadata>;
    /** 스냅샷 생성 이유 */
    reason: "manual" | "auto_cleanup" | "memory_limit" | "test";
}

/**
 * 개발 도구를 위한 전역 폼 인터페이스
 * 브라우저 개발자 도구에서 전역 폼 상태를 검사할 때 사용
 */
export interface GlobalFormDevTools {
    /** 현재 활성 폼 목록 조회 */
    getActiveForms(): string[];
    /** 특정 폼의 상세 정보 조회 */
    getFormDetails(formId: string): GlobalFormMetadata | null;
    /** 폼 값 조회 */
    getFormValues(formId: string): any;
    /** 폼 값 강제 설정 (디버깅용) */
    setFormValues(formId: string, values: any): void;
    /** 폼 강제 정리 */
    destroyForm(formId: string): boolean;
    /** 모든 폼 정리 */
    destroyAllForms(): number;
    /** 성능 통계 조회 */
    getStats(): GlobalFormStats;
    /** 디버그 정보 조회 */
    getDebugInfo(): GlobalFormDebugInfo;
    /** 상태 스냅샷 생성 */
    createSnapshot(reason?: string): GlobalFormSnapshot;
}

/**
 * 전역 폼 이벤트 타입
 */
export type GlobalFormEvent = {
    type: GlobalFormLifecycleEvent;
    formId: string;
    timestamp: Date;
    data?: any;
};

/**
 * 전역 폼 이벤트 리스너 타입
 */
export type GlobalFormEventListener = (event: GlobalFormEvent) => void;

/**
 * 전역 폼 미들웨어 타입
 * 폼 생명주기에 커스텀 로직을 추가할 때 사용
 */
export interface GlobalFormMiddleware {
    name: string;
    onFormCreate?: (formId: string, initialValues: any) => void;
    onFormAccess?: (formId: string) => void;
    onFormUpdate?: (formId: string, field: string, value: any) => void;
    onFormDestroy?: (formId: string) => void;
}

/**
 * 전역 Forma Provider에 확장된 Props
 */
export interface ExtendedGlobalFormaProviderProps
    extends GlobalFormaProviderProps {
    /** 전역 폼 설정 */
    config?: GlobalFormConfig;
    /** 미들웨어 목록 */
    middleware?: GlobalFormMiddleware[];
    /** 개발 도구 활성화 여부 */
    enableDevTools?: boolean;
}

/**
 * 글로벌 폼 핸들러 타입 / Global form handlers type
 */
export interface GlobalFormHandlers<T extends Record<string, any>> {
    onSubmit?: (values: T) => Promise<boolean | void> | boolean | void;
    onValidate?: (values: T) => Promise<boolean> | boolean;
    onComplete?: (values: T) => void;
}

/**
 * 글로벌 Forma 컨텍스트 타입 / Global Forma context type
 * 폼 스토어 관리와 모달 스택 관리 기능을 제공
 */
export interface GlobalFormaContextType {
    // ========== FieldStore 관련 ==========
    getOrCreateStore: <T extends Record<string, any>>(
        formId: string
    ) => FieldStore<T>;
    registerStore: <T extends Record<string, any>>(
        formId: string,
        store: FieldStore<T>
    ) => void;
    unregisterStore: (formId: string) => boolean;
    clearStores: () => void;
    /** 스토어 사용 참조를 증가시킵니다 | Increment store usage reference */
    incrementRef: (formId: string, autoCleanup: boolean) => void;
    /** 스토어 사용 참조를 감소시키고, autoCleanup 참조가 0이 되면 자동 정리합니다 | Decrement store usage reference and auto cleanup when autoCleanup refs reach 0 */
    decrementRef: (formId: string, autoCleanup: boolean) => void;
    /** autoCleanup 설정의 일관성을 검증하고 설정을 저장합니다 | Validate and store autoCleanup setting consistency */
    validateAndStoreAutoCleanupSetting: (
        formId: string,
        autoCleanup: boolean
    ) => void;

    // ========== 핸들러 관리 ==========
    /** 글로벌 폼 핸들러 등록 | Register global form handlers */
    registerHandlers: <T extends Record<string, any>>(
        formId: string,
        handlers: GlobalFormHandlers<T>
    ) => void;
    /** 글로벌 폼 핸들러 조회 | Get global form handlers */
    getHandlers: <T extends Record<string, any>>(
        formId: string
    ) => GlobalFormHandlers<T> | undefined;

    // ========== Actions 관리 ==========
    /** 글로벌 actions 등록 | Register global actions */
    registerActions: <T extends Record<string, any>>(
        formId: string,
        actions: any
    ) => void;
    /** 글로벌 actions 조회 | Get global actions */
    getActions: <T extends Record<string, any>>(
        formId: string
    ) => any | undefined;
    /** 글로벌 actions 제거 | Remove global actions */
    unregisterActions: (formId: string) => void;

    // ========== 모달 스택 관리 ==========
    /** 모달을 스택에 추가 | Add modal to stack */
    appendOpenModal: (modalId: string) => void;
    /** 모달을 스택에서 제거 | Remove modal from stack */
    removeOpenModal: (modalId: string) => void;
    /** 마지막 모달 닫기 | Close last modal */
    closeLastModal: () => boolean;
}
