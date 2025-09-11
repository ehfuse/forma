/**
 * FieldStore.ts
 *
 * Forma - 개별 필드 상태 관리 핵심 클래스 / Core class for individual field state management
 * 선택적 구독과 성능 최적화 지원 / Supports selective subscriptions and performance optimization
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

import { getNestedValue, setNestedValue } from "../utils/dotNotation";

/**
 * 개별 필드 상태 관리 Store / Individual field state management store
 * 선택적 구독과 성능 최적화를 위한 핵심 클래스
 * Core class for selective subscriptions and performance optimization
 *
 * @template T 폼 데이터의 타입 / Form data type
 */
export class FieldStore<T extends Record<string, any>> {
    private fields: Map<keyof T, { value: any; listeners: Set<() => void> }> =
        new Map();
    private dotNotationListeners: Map<string, Set<() => void>> = new Map(); // Dot notation 구독자 / Dot notation subscribers
    private initialValues: T;
    private globalListeners = new Set<() => void>();

    constructor(initialValues: T) {
        this.initialValues = { ...initialValues };
        // 초기값으로 필드 초기화 / Initialize fields with initial values
        Object.keys(initialValues).forEach((key) => {
            this.fields.set(key, {
                value: initialValues[key],
                listeners: new Set(),
            });
        });
    }

    /**
     * 특정 필드 값 가져오기 / Get specific field value
     * Dot notation 지원 / Supports dot notation
     * @param fieldName 필드명 또는 dot notation 경로 / Field name or dot notation path
     * @returns 필드 값 / Field value
     */
    getValue(fieldName: keyof T | string): any {
        const fieldNameStr = fieldName as string;

        // dot notation이 포함된 경우 중첩 객체 접근 / Access nested object for dot notation
        if (fieldNameStr.includes(".")) {
            const values = this.getValues();
            return getNestedValue(values, fieldNameStr);
        }

        // 일반 필드 접근 / Regular field access
        const field = this.fields.get(fieldName as keyof T);
        return field?.value;
    }

    /**
     * 특정 필드 구독 / Subscribe to specific field
     * Dot notation 지원 / Supports dot notation
     * @param fieldName 필드명 또는 dot notation 경로 / Field name or dot notation path
     * @param listener 변경 시 호출될 콜백 / Callback to call on change
     * @returns 구독 해제 함수 / Unsubscribe function
     */
    subscribe(fieldName: keyof T | string, listener: () => void) {
        const fieldNameStr = fieldName as string;

        // dot notation이 포함된 경우 정확한 경로로 구독 / Subscribe to exact path for dot notation
        if (fieldNameStr.includes(".")) {
            let listeners = this.dotNotationListeners.get(fieldNameStr);
            if (!listeners) {
                listeners = new Set();
                this.dotNotationListeners.set(fieldNameStr, listeners);
            }
            listeners.add(listener);

            return () => {
                const listeners = this.dotNotationListeners.get(fieldNameStr);
                if (listeners) {
                    listeners.delete(listener);
                    if (listeners.size === 0) {
                        this.dotNotationListeners.delete(fieldNameStr);
                    }
                }
            };
        }

        // 일반 필드 구독 / Regular field subscription
        let field = this.fields.get(fieldName as keyof T);
        if (!field) {
            // 필드가 없으면 생성 / Create field if not exists
            field = {
                value: undefined,
                listeners: new Set(),
            };
            this.fields.set(fieldName as keyof T, field);
        }
        field.listeners.add(listener);
        return () => {
            field?.listeners.delete(listener);
        };
    }

    /**
     * 전역 구독 / Global subscription
     * isModified 등을 위해 사용 / Used for isModified etc.
     * @param listener 변경 시 호출될 콜백 / Callback to call on change
     * @returns 구독 해제 함수 / Unsubscribe function
     */
    subscribeGlobal(listener: () => void) {
        this.globalListeners.add(listener);
        return () => {
            this.globalListeners.delete(listener);
        };
    }

    /**
     * 필드 값 설정 / Set field value
     * Dot notation 지원 / Supports dot notation
     * @param fieldName 필드명 또는 dot notation 경로 / Field name or dot notation path
     * @param value 설정할 값 / Value to set
     */
    setValue(fieldName: keyof T | string, value: any) {
        const fieldNameStr = fieldName as string;

        // dot notation이 포함된 경우 / For dot notation
        if (fieldNameStr.includes(".")) {
            const rootField = fieldNameStr.split(".")[0] as keyof T;
            const rootFieldStr = String(rootField);
            const remainingPath = fieldNameStr.substring(
                rootFieldStr.length + 1
            );

            let field = this.fields.get(rootField);
            if (!field) {
                field = {
                    value: {},
                    listeners: new Set(),
                };
                this.fields.set(rootField, field);
            }

            const newRootValue = setNestedValue(
                field.value || {},
                remainingPath,
                value
            );

            if (JSON.stringify(field.value) !== JSON.stringify(newRootValue)) {
                field.value = newRootValue;

                // 루트 필드 구독자들 알림 / Notify root field subscribers
                field.listeners.forEach((listener) => {
                    listener();
                });

                // Dot notation 경로 구독자들 알림 / Notify dot notation path subscribers
                this.dotNotationListeners.forEach(
                    (listeners, subscribedPath) => {
                        if (subscribedPath === fieldNameStr) {
                            listeners.forEach((listener) => listener());
                        }
                    }
                );

                // 전역 구독자들 알림 / Notify global subscribers
                this.globalListeners.forEach((listener) => listener());
            }
            return;
        }

        // 일반 필드 설정 / Regular field setting
        let field = this.fields.get(fieldName as keyof T);
        if (!field) {
            field = {
                value: undefined,
                listeners: new Set(),
            };
            this.fields.set(fieldName as keyof T, field);
        }

        if (field.value !== value) {
            field.value = value;
            const fieldStr = fieldName as string;

            // 해당 필드 구독자들 알림 / Notify field subscribers
            field.listeners.forEach((listener) => {
                listener();
            });

            // Dot notation 구독자들 알림 / Notify dot notation subscribers
            this.dotNotationListeners.forEach((listeners, subscribedPath) => {
                if (subscribedPath === fieldStr) {
                    listeners.forEach((listener) => listener());
                }
            });

            // 전역 구독자들 알림 / Notify global subscribers
            if (this.globalListeners.size > 0) {
                this.globalListeners.forEach((listener) => listener());
            }
        }
    }

    /**
     * 모든 값 가져오기 / Get all values
     * @returns 모든 필드 값을 포함한 객체 / Object containing all field values
     */
    getValues(): T {
        const values: any = {};
        this.fields.forEach((field, key) => {
            // undefined 값을 null로 변환하여 API 전송 시 필드가 누락되지 않도록 함
            // Convert undefined to null to prevent field omission during API transmission
            values[key] = field.value === undefined ? null : field.value;
        });
        return values as T;
    }

    /**
     * 모든 값 설정 / Set all values
     * @param newValues 설정할 값들 / Values to set
     */
    setValues(newValues: Partial<T>) {
        Object.keys(newValues).forEach((key) => {
            this.setValue(key as keyof T, newValues[key]);
        });
    }

    /**
     * 초기값 재설정 / Reset initial values
     * @param newInitialValues 새로운 초기값 / New initial values
     */
    setInitialValues(newInitialValues: T) {
        this.initialValues = { ...newInitialValues };

        // 기존 리스너를 보존하면서 값만 업데이트 / Update values while preserving existing listeners
        Object.keys(newInitialValues).forEach((key) => {
            const existingField = this.fields.get(key);
            if (existingField) {
                // 기존 필드가 있으면 값만 업데이트 / Update value only if field exists
                existingField.value = newInitialValues[key];
            } else {
                // 새 필드면 생성 / Create new field
                this.fields.set(key, {
                    value: newInitialValues[key],
                    listeners: new Set(),
                });
            }
        });

        // 모든 리스너에게 알림 / Notify all listeners
        this.fields.forEach((field) => {
            field.listeners.forEach((listener) => listener());
        });
        this.globalListeners.forEach((listener) => listener());
    }

    /**
     * 수정 여부 확인 / Check if modified
     * @returns 초기값에서 변경되었는지 여부 / Whether changed from initial values
     */
    isModified(): boolean {
        const currentValues = this.getValues();
        return (
            JSON.stringify(currentValues) !== JSON.stringify(this.initialValues)
        );
    }

    /**
     * 초기값으로 리셋 / Reset to initial values
     */
    reset() {
        this.setValues(this.initialValues);
    }

    /**
     * 리소스 정리 / Clean up resources
     */
    destroy() {
        this.fields.clear();
        this.globalListeners.clear();
    }
}
