/**
 * useGlobalForm.ts
 *
 * Forma - 글로벌 폼 상태 관리 훅 / Global form state management hook
 * 여러 컴포넌트 간 폼 상태 공유를 위한 확장 훅
 * Extended hook for sharing form state across multiple components
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

import { useContext, useEffect, useMemo } from "react";
import { useForm } from "./useForm";
import { UseGlobalFormProps, UseGlobalFormReturn } from "../types/globalForm";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";
import { mergeActions } from "../utils";

/**
 * 글로벌 폼 상태 관리 훅 (오버로드 1: 전체 옵션)
 * Global form state management hook (Overload 1: Full options)
 */
export function useGlobalForm<T extends Record<string, any>>(
    props: UseGlobalFormProps<T>
): UseGlobalFormReturn<T>;

/**
 * 글로벌 폼 상태 관리 훅 (오버로드 2: formId만)
 * Global form state management hook (Overload 2: formId only)
 */
export function useGlobalForm<T extends Record<string, any>>(
    formId: string
): UseGlobalFormReturn<T>;

/**
 * 글로벌 폼 상태 관리 훅 / Global form state management hook
 *
 * 여러 컴포넌트 간 폼 데이터를 공유하기 위한 훅입니다
 * Hook for sharing form data across multiple components
 *
 * 데이터 공유에만 집중하며, 초기값 설정과 제출/검증 로직은 각 컴포넌트에서 직접 처리합니다
 * Focuses only on data sharing; initial values and submission/validation logic handled by individual components
 *
 * @template T 폼 데이터의 타입 / Form data type
 * @param propsOrFormId 글로벌 폼 설정 옵션 또는 formId 문자열 / Global form configuration options or formId string
 * @returns 글로벌 폼 관리 API 객체 / Global form management API object
 */
export function useGlobalForm<T extends Record<string, any>>(
    propsOrFormId: UseGlobalFormProps<T> | string
): UseGlobalFormReturn<T> {
    // 문자열로 전달된 경우 props 객체로 변환
    const props: UseGlobalFormProps<T> =
        typeof propsOrFormId === "string"
            ? { formId: propsOrFormId }
            : propsOrFormId;

    const {
        formId,
        initialValues,
        autoCleanup = true,
        onSubmit,
        onValidate,
        onComplete,
        actions,
        watch,
        persist,
    } = props;
    const context = useContext(GlobalFormaContext);

    // Context가 제대로 설정되지 않았을 때 명확한 에러 표시
    // Show clear error when Context is not properly configured
    if (!context || !context.getOrCreateStore) {
        // 페이지에 에러가 표시되도록 컴포넌트 렌더링을 방해하는 에러를 던짐
        // Throw error that prevents component rendering so error shows on page
        const errorMessage = `
🚨 GlobalFormaProvider 설정 오류 | Configuration Error

GlobalFormaProvider가 App.tsx에 설정되지 않았습니다!
GlobalFormaProvider is not configured in App.tsx!

해결 방법 | Solution:
1. App.tsx 파일에서 GlobalFormaProvider로 컴포넌트를 감싸주세요.
2. import { GlobalFormaProvider } from '@/forma';
3. <GlobalFormaProvider><YourApp /></GlobalFormaProvider>

Details: GlobalFormaContext must be used within GlobalFormaProvider (formId: ${formId})
        `.trim();

        throw new Error(errorMessage);
    }

    const {
        getOrCreateStore,
        incrementRef,
        decrementRef,
        validateAndStoreAutoCleanupSetting,
        registerHandlers,
        getHandlers,
        registerActions,
        getActions,
    } = context;

    // autoCleanup 설정 일관성 검증
    validateAndStoreAutoCleanupSetting(formId, autoCleanup);

    // 글로벌 스토어 가져오기 또는 생성 / Get or create global store
    const store = getOrCreateStore<T>(formId);

    // 핸들러가 제공되면 글로벌에 동기적으로 등록 / Register handlers to global synchronously if provided
    if (onSubmit || onValidate || onComplete) {
        registerHandlers<T>(formId, {
            onSubmit,
            onValidate,
            onComplete,
        });
    }

    // actions가 제공되면 글로벌에 동기적으로 등록 / Register actions to global synchronously if provided
    if (actions) {
        const mergedActions = mergeActions(actions);
        if (mergedActions) {
            registerActions(formId, mergedActions);
        }
    }

    // 글로벌 핸들러 가져오기 / Get global handlers
    const globalHandlers = getHandlers<T>(formId);

    // 글로벌 actions 가져오기 / Get global actions
    const globalActions = getActions(formId);

    // 로컬 핸들러가 없으면 글로벌 핸들러 사용 / Use global handlers if local handlers are not provided
    const effectiveOnSubmit = onSubmit || globalHandlers?.onSubmit;
    const effectiveOnValidate = onValidate || globalHandlers?.onValidate;
    const effectiveOnComplete = onComplete || globalHandlers?.onComplete;

    // 로컬 actions가 없으면 글로벌 actions 사용 / Use global actions if local actions are not provided
    const effectiveActions = actions || globalActions;

    // useForm에 외부 스토어와 핸들러들 전달 / Pass external store and handlers to useForm
    const form = useForm<T>({
        initialValues: (initialValues as T) || ({} as T),
        _externalStore: store,
        onSubmit: effectiveOnSubmit,
        onValidate: effectiveOnValidate,
        onComplete: effectiveOnComplete,
        actions: effectiveActions,
        persist, // persist 옵션 전달
    });

    // 초기값이 있고 스토어가 비어있다면 초기값 설정 (올바른 방법으로)
    // Set initial values if provided and store is empty (using proper method)
    useEffect(() => {
        if (initialValues && Object.keys(store.getValues()).length === 0) {
            form.setInitialFormValues(initialValues as T);
        }
    }, [formId, initialValues, store, form.setInitialFormValues]); // form 전체 대신 setInitialFormValues만 의존성으로

    // 참조 카운팅을 통한 자동 정리 관리
    // Auto cleanup management through reference counting
    useEffect(() => {
        if (autoCleanup) {
            // 컴포넌트 마운트 시 참조 카운트 증가
            // Increment reference count on component mount
            incrementRef(formId, autoCleanup);

            return () => {
                // 컴포넌트 언마운트 시 참조 카운트 감소 (마지막 참조자면 자동 정리)
                // Decrement reference count on unmount (auto cleanup if last reference)
                decrementRef(formId, autoCleanup);
            };
        }

        return undefined;
    }, [formId, autoCleanup, incrementRef, decrementRef]);

    // Watch 등록 / Register watchers
    useEffect(() => {
        if (!watch) return;

        const unsubscribers: Array<() => void> = [];

        Object.entries(watch).forEach(([path, handler]) => {
            const actionContext = {
                getValue: (p: keyof T | string) => store.getValue(p as string),
                setValue: (p: keyof T | string, value: any) =>
                    store.setValue(p as string, value),
                getValues: () => store.getValues(),
                setValues: (values: Partial<T>) => store.setValues(values),
                reset: () => store.reset(),
                submit: form.submit,
                values: store.getValues(),
                actions: globalActions || {},
            };

            const unsubscribe = store.watch(path, (value, prevValue) => {
                // context 업데이트 (최신 값) / Update context with latest values
                actionContext.values = store.getValues();
                actionContext.actions = getActions(formId) || {};

                handler(actionContext, value, prevValue);
            });

            unsubscribers.push(unsubscribe);
        });

        // cleanup
        return () => {
            unsubscribers.forEach((unsub) => unsub());
        };
    }, [formId, watch, store, globalActions, getActions, form.submit]);

    // actions를 동적으로 가져오는 getter 생성 / Create getter to dynamically fetch actions
    const actionsGetter = useMemo(() => {
        return new Proxy({} as any, {
            get: (_target, prop) => {
                // 항상 최신 글로벌 actions를 가져옴 / Always get the latest global actions
                const currentGlobalActions = getActions(formId);
                const currentEffectiveActions =
                    actions || currentGlobalActions || {};

                const action = currentEffectiveActions[prop];
                if (typeof action === "function") {
                    // context를 바인딩하여 반환 / Return with context binding
                    return (...args: any[]) => {
                        const context = {
                            values: store.getValues(),
                            getValue: (field: string | keyof T) =>
                                store.getValue(field as string),
                            setValue: (field: string | keyof T, value: any) =>
                                store.setValue(field as string, value),
                            setValues: (values: Partial<T>) => {
                                const currentValues = store.getValues();
                                const newValues = {
                                    ...currentValues,
                                    ...values,
                                };
                                store.setValues(newValues as T);
                            },
                            reset: () => store.reset(),
                            submit: form.submit,
                            actions: {} as any, // Will be filled after
                        };
                        context.actions = actionsGetter;
                        return action(context, ...args);
                    };
                }
                return action;
            },
            has: (_target, prop) => {
                const currentGlobalActions = getActions(formId);
                const currentEffectiveActions =
                    actions || currentGlobalActions || {};
                return prop in currentEffectiveActions;
            },
            ownKeys: (_target) => {
                const currentGlobalActions = getActions(formId);
                const currentEffectiveActions =
                    actions || currentGlobalActions || {};
                return Reflect.ownKeys(currentEffectiveActions);
            },
            getOwnPropertyDescriptor: (_target, prop) => {
                const currentGlobalActions = getActions(formId);
                const currentEffectiveActions =
                    actions || currentGlobalActions || {};
                if (prop in currentEffectiveActions) {
                    return {
                        enumerable: true,
                        configurable: true,
                    };
                }
                return undefined;
            },
        });
    }, [formId, actions, getActions, store, form.submit]);

    return {
        ...form,
        actions: actionsGetter, // 동적 actions getter로 교체 / Replace with dynamic actions getter
        formId, // 글로벌 폼 ID 추가 제공 / Provide additional global form ID
        _store: store, // 글로벌 스토어 직접 접근용 / Direct access to global store
    } as UseGlobalFormReturn<T>;
}
