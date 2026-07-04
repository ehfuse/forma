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
    UseFormProps,
    UseFormPropsOptional,
    UseFormReturn,
} from "../types/form";
import { useFormaState, useFieldSubscription } from "./useFormaState";
import { getFormSurface } from "./storeSurface";
import { devError, mergeActions } from "../utils";
import { loadPersistedData, normalizePersistConfig } from "../utils/persist";

import React, {
    useState,
    useCallback,
    useRef,
    useMemo,
    useContext,
} from "react";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";

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
    T extends Record<string, any> = Record<string, any>,
>(): UseFormReturn<T>;

// Zero-Config 오버로드: 옵셔널 props를 가진 경우
export function useForm<T extends Record<string, any> = Record<string, any>>(
    props?: UseFormPropsOptional<T>,
): UseFormReturn<T>;

// 전체 props를 가진 기본 오버로드
export function useForm<T extends Record<string, any>>(
    props: UseFormProps<T>,
): UseFormReturn<T>;
export function useForm<T extends Record<string, any>>(
    props:
        | UseFormProps<T>
        | UseFormPropsOptional<T> = {} as UseFormPropsOptional<T>,
): UseFormReturn<T> {
    const {
        initialValues = {} as T,
        onSubmit,
        onValidate,
        onComplete,
        actions: userActions,
        watch,
        _externalStore,
        persist,
    } = props;

    // GlobalFormaContext에서 storagePrefix 가져오기 | Get storagePrefix from GlobalFormaContext
    const context = useContext(GlobalFormaContext);
    const storagePrefix = context?.storagePrefix;

    // 초기값 안정화: 첫 번째 렌더링에서만 초기값을 고정
    // Stabilize initial values: fix initial values only on first render
    // persist가 있으면 localStorage에서 복원 시도 (외부 스토어 시딩에도 병합값이 쓰이도록 여기서 병합)
    const stableInitialValues = useRef<T | null>(null);
    if (!stableInitialValues.current) {
        let mergedInitialValues = initialValues;

        // persist 설정이 있으면 저장된 데이터 복원 시도
        if (persist) {
            const persisted = loadPersistedData<T>(
                normalizePersistConfig(persist),
                storagePrefix,
            );
            if (persisted) {
                mergedInitialValues = { ...initialValues, ...persisted };
            }
        }

        stableInitialValues.current = mergedInitialValues;
    }

    // useFormaState를 기반으로 사용 — persist 저장/flush(언마운트·pagehide·visibilitychange)와
    // clearPersisted/hasPersisted 도 useFormaState 의 통합 persist 기계를 그대로 재사용한다.
    // Built on useFormaState — the persist save/flush (unmount/pagehide/visibilitychange)
    // and clearPersisted/hasPersisted reuse useFormaState's integrated persist machinery.
    const fieldState = useFormaState<T>(stableInitialValues.current, {
        _externalStore,
        watch,
        persist,
    });

    // 내부 스토어 (수명 동안 안정) / internal store (stable for lifetime)
    const store = fieldState._store;

    // store 수준 폼 표면 — store 당 1회 생성되어 렌더 간 동일 참조 유지
    // Store-level form surface — created once per store, identical reference across renders
    const formSurface = getFormSurface<T>(store, useFieldSubscription);

    // 폼 특정 상태 관리 / Form-specific state management
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // 최신 제출/검증/완료 핸들러를 ref 로 추적 — 인라인 함수가 렌더마다 새 참조로 와도
    // submit/validateForm 의 식별자가 안정적으로 유지된다 (호출 시점에 최신 핸들러 반영)
    // Track the latest handlers via refs — inline handler props no longer churn
    // submit/validateForm identities; the latest handler is resolved at call time
    const onSubmitRef = useRef(onSubmit);
    onSubmitRef.current = onSubmit;
    const onValidateRef = useRef(onValidate);
    onValidateRef.current = onValidate;
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    /**
     * 폼 검증 / Form validation
     */
    const validateForm = useCallback(
        async (valuesToValidate?: T) => {
            const validate = onValidateRef.current;
            if (!validate) return true;
            setIsValidating(true);
            // getValues() 는 공유 캐시 객체라 사용자 콜백에는 얕은 복사본을 전달
            // getValues() returns the shared cached object; hand a shallow copy to user callbacks
            const currentValues =
                valuesToValidate || ({ ...store.getValues() } as T);

            try {
                return await validate(currentValues);
            } catch (error) {
                devError("Validation error:", error);
                return false;
            } finally {
                setIsValidating(false);
            }
        },
        [store],
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

            // 사용자 콜백(onValidate/onSubmit/onComplete)에는 얕은 복사 스냅샷을 전달 (공유 캐시 보호)
            // Hand user callbacks a shallow-copied snapshot (protects the shared cache)
            const currentValues = { ...store.getValues() } as T;
            if (!(await validateForm(currentValues))) {
                return false;
            }

            setIsSubmitting(true);

            try {
                const submitHandler = onSubmitRef.current;
                if (submitHandler) {
                    const result = await submitHandler(currentValues);
                    // onSubmit이 boolean을 반환하면 해당 값 사용, 아니면 true로 간주
                    if (result === false) {
                        return false;
                    }
                }

                const completeHandler = onCompleteRef.current;
                if (completeHandler) {
                    completeHandler(currentValues);
                }

                return true;
            } catch (error) {
                devError("Form submission error:", error);
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [store, validateForm],
    );

    // 최신 actions 정의를 ref 로 추적 — 인라인 객체가 와도 재바인딩하지 않는다
    // Track the latest user actions via ref — inline objects no longer cause re-binding
    const userActionsRef = useRef(userActions);
    userActionsRef.current = userActions;

    // Actions 바인딩 - context와 함께 사용할 수 있도록. store 당 1회 생성되는 동적 Proxy 로
    // 식별자는 안정적이면서 접근 시점에 항상 최신 actions 정의(키 집합 포함)를 실행한다.
    // Actions binding — a dynamic Proxy created once: stable identity while always
    // executing the latest actions definition (including its key set) at access time
    const boundActions = useMemo(() => {
        // 접근 시점의 병합된 actions 정의 조회 / resolve the merged actions definition at access time
        const resolveMerged = (): Record<string, any> =>
            (userActionsRef.current
                ? mergeActions(userActionsRef.current)
                : null) || {};

        const bound: any = new Proxy({} as any, {
            get: (_target, prop) => {
                const action = resolveMerged()[prop as any];
                if (typeof action !== "function") return action;

                // 호출 시점에 컨텍스트를 구성해 실행하는 래퍼 / wrapper building a per-call context
                return (...args: any[]) => {
                    // action 호출용 컨텍스트 / per-call action context
                    const context = {
                        // values 는 접근 시점 최신 스냅샷 (공유 캐시 보호를 위한 얕은 복사)
                        // values: latest snapshot at access time (shallow copy protects shared cache)
                        get values() {
                            return { ...store.getValues() } as T;
                        },
                        getValue: (fieldName: keyof T | string) =>
                            store.getValue(fieldName as string),
                        setValue: (fieldName: keyof T | string, value: any) =>
                            store.setValue(fieldName as string, value),
                        setValues: formSurface.setFormValues,
                        reset: resetForm,
                        submit,
                        validate: validateForm,
                        actions: bound, // 순환 참조 / circular reference
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
    }, [store, formSurface, resetForm, submit, validateForm]);

    // 반환 객체 — store 수준 표면 + 컴포넌트 수준 조각의 합성.
    // deps 가 안정적이라 제출/검증 상태가 바뀔 때만 새 참조가 된다 (P2: memo 가 실제로 유지됨).
    // Return object — store-level surface + per-component pieces.
    // Deps are stable, so a new reference appears only when submit/validate state changes.
    return useMemo(
        () => ({
            // 상태 / State
            isSubmitting,
            isValidating,

            // store 수준 표면 (값 구독/조회/설정 + 이벤트 핸들러) / store-level surface
            ...formSurface,

            // 폼 액션 / Form actions
            submit, // 폼 제출 / submit form
            resetForm, // 폼 초기화 / reset form
            validateForm, // 폼 검증 / validate form

            // Actions
            actions: boundActions, // 사용자 정의 actions / user-defined actions

            // Persist (useFormaState 의 통합 persist 재사용) / reuse useFormaState's persist
            clearPersisted: fieldState.clearPersisted, // 저장된 데이터 삭제 / clear persisted data
            hasPersisted: fieldState.hasPersisted, // 저장된 데이터 있는지 / has persisted data

            // 호환성 / Compatibility — 항상 최신 스냅샷을 반환하는 getter (얕은 복사, 비권장)
            // getter returning a fresh shallow-copied snapshot on access (not recommended)
            get values() {
                return { ...store.getValues() } as T;
            },

            // 고급 사용 / Advanced usage
            _store: store, // 직접 store 접근용 / direct store access
        }),
        [
            isSubmitting,
            isValidating,
            formSurface,
            submit,
            resetForm,
            validateForm,
            boundActions,
            fieldState.clearPersisted,
            fieldState.hasPersisted,
            store,
        ],
    );
}
