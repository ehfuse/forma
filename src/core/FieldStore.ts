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
import { devError } from "../utils/environment";

/**
 * 개별 필드 상태 관리 Store / Individual field state management store
 * 선택적 구독과 성능 최적화를 위한 핵심 클래스
 * Core class for selective subscriptions and performance optimization
 *
 * @template T 폼 데이터의 타입 / Form data type
 */
/**
 * Watch 콜백 타입 / Watch callback type
 */
type WatchCallback = (value: any, prevValue: any) => void;

export class FieldStore<T extends Record<string, any>> {
    private fields: Map<keyof T, { value: any; listeners: Set<() => void> }> =
        new Map();
    private dotNotationListeners: Map<string, Set<() => void>> = new Map(); // Dot notation 구독자 / Dot notation subscribers
    private initialValues: T;
    private dirtyFields: Set<string> = new Set();
    private isInitialEmpty: boolean;
    private globalListeners = new Set<() => void>();
    private watchers: Map<string, Set<WatchCallback>> = new Map(); // Watch 콜백 관리 / Watch callback management

    constructor(initialValues: T) {
        this.initialValues = { ...initialValues };
        this.isInitialEmpty = Object.keys(this.initialValues).length === 0;
        // 초기값으로 필드 초기화 / Initialize fields with initial values
        Object.keys(initialValues).forEach((key) => {
            this.fields.set(key, {
                value: initialValues[key],
                listeners: new Set(),
            });
        });
    }

    private areValuesEqual(a: any, b: any): boolean {
        if (a === b) return true;
        if (typeof a === "object" || typeof b === "object") {
            try {
                return JSON.stringify(a) === JSON.stringify(b);
            } catch {
                return false;
            }
        }
        return false;
    }

    private updateDirtyForField(fieldName: string, value: any): void {
        if (this.isInitialEmpty) {
            const hasMeaningfulValue = this.hasMeaningfulValue(value);
            if (hasMeaningfulValue) {
                this.dirtyFields.add(fieldName);
            } else {
                this.dirtyFields.delete(fieldName);
            }
            return;
        }

        const initialValue = (this.initialValues as any)[fieldName];
        if (this.areValuesEqual(initialValue, value)) {
            this.dirtyFields.delete(fieldName);
        } else {
            this.dirtyFields.add(fieldName);
        }
    }

    /**
     * 특정 필드 값 가져오기 / Get specific field value
     * Dot notation 지원 / Supports dot notation
     * @param fieldName 필드명 또는 dot notation 경로 또는 "*" (전체) / Field name or dot notation path or "*" (all)
     * @returns 필드 값 / Field value
     */
    getValue(fieldName: keyof T | string): any {
        const fieldNameStr = fieldName as string;

        // "*" 패턴: 전체 상태 반환 / "*" pattern: return all state
        if (fieldNameStr === "*") {
            const allValues = this.getValues();
            // 빈 객체이거나 모든 값이 undefined/null인 경우 undefined 반환
            // Return undefined for empty objects or when all values are undefined/null
            const hasValidData = Object.values(allValues).some(
                (value) =>
                    value !== undefined && value !== null && value !== "",
            );

            if (!hasValidData) {
                return undefined;
            }

            return allValues;
        }

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
     * @param fieldName 필드명 또는 dot notation 경로 또는 "*" (전체) / Field name or dot notation path or "*" (all)
     * @param listener 변경 시 호출될 콜백 / Callback to call on change
     * @returns 구독 해제 함수 / Unsubscribe function
     */
    subscribe(fieldName: keyof T | string, listener: () => void) {
        const fieldNameStr = fieldName as string;

        // "*" 패턴: 전체 상태 변경 구독 / "*" pattern: subscribe to all state changes
        if (fieldNameStr === "*") {
            this.globalListeners.add(listener);
            return () => {
                this.globalListeners.delete(listener);
            };
        }

        // dot notation이 포함된 경우 정확한 경로로 구독 / Subscribe to exact path for dot notation
        if (fieldNameStr.includes(".")) {
            let listeners = this.dotNotationListeners.get(fieldNameStr);
            if (!listeners) {
                listeners = new Set();
                this.dotNotationListeners.set(fieldNameStr, listeners);
            }
            listeners.add(listener);

            // dot notation 필드가 구독될 때 기본값 생성 / Create default value when dot notation field is subscribed
            const currentValue = this.getValue(fieldNameStr);
            if (currentValue === undefined) {
                // 기본값은 undefined로 유지 (필요시에만 설정)
                // Keep default value as undefined (set only when needed)
                // this.setValue(fieldNameStr, undefined); // 주석 처리: 불필요한 초기화 방지
            }

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
                value: undefined, // 초기값은 undefined로 설정
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
                rootFieldStr.length + 1,
            );

            let field = this.fields.get(rootField);
            if (!field) {
                field = {
                    value: {},
                    listeners: new Set(),
                };
                this.fields.set(rootField, field);
            }

            const oldRootValue = field.value;
            const newRootValue = setNestedValue(
                field.value || {},
                remainingPath,
                value,
            );

            if (JSON.stringify(field.value) !== JSON.stringify(newRootValue)) {
                // 변경 전 자식 필드의 값 (watch용)
                const prevChildValue = getNestedValue(
                    field.value,
                    remainingPath,
                );

                // ⭐ 변경 전 부모 경로들의 값 저장 (부모 watch용)
                const prevParentValues = new Map<string, any>();
                if (fieldNameStr.includes(".")) {
                    const parts = fieldNameStr.split(".");
                    for (let i = 1; i < parts.length; i++) {
                        const parentPath = parts.slice(0, i).join(".");
                        prevParentValues.set(
                            parentPath,
                            this.getValue(parentPath),
                        );
                    }
                }

                field.value = newRootValue;
                this.updateDirtyForField(rootFieldStr, newRootValue);

                // 루트 필드 구독자들 알림 / Notify root field subscribers
                field.listeners.forEach((listener) => {
                    listener();
                });

                // Dot notation 구독자들 알림 / Notify dot notation subscribers
                this.dotNotationListeners.forEach(
                    (listeners, subscribedPath) => {
                        // 1. 정확히 일치하는 경로
                        if (subscribedPath === fieldNameStr) {
                            listeners.forEach((listener) => listener());
                        }
                        // 2. 자식 경로가 변경되면 부모 경로 구독자에게 알림
                        // 예: fieldNameStr이 "checkboxes.0.checked", subscribedPath가 "checkboxes"
                        else if (
                            fieldNameStr.startsWith(subscribedPath + ".")
                        ) {
                            listeners.forEach((listener) => listener());
                        }
                        // 3. 부모 경로가 변경되면 자식 경로 구독자에게 알림 (중복 제거 필요)
                        // 예: fieldNameStr이 "checkboxes", subscribedPath가 "checkboxes.0"
                        // 단, rootFieldStr와 정확히 같은 경로는 루트 필드 구독자가 이미 처리
                        else if (
                            subscribedPath.startsWith(fieldNameStr + ".") &&
                            subscribedPath !== rootFieldStr
                        ) {
                            listeners.forEach((listener) => listener());
                        }
                        // 배열 필드나 .length 구독자들에게 알림
                        // Notify array field or .length subscribers
                        else if (subscribedPath === `${rootFieldStr}.length`) {
                            // 이전 길이와 새 길이 계산
                            const oldLength = Array.isArray(oldRootValue)
                                ? oldRootValue.length
                                : 0;
                            const newLength = Array.isArray(newRootValue)
                                ? newRootValue.length
                                : 0;
                            // 길이가 변경되었거나 undefined에서 배열로 변경된 경우 알림
                            if (
                                oldLength !== newLength ||
                                (!oldRootValue && newRootValue)
                            ) {
                                listeners.forEach((listener) => listener());
                            }
                        }
                    },
                );

                // 전역 구독자들 알림 / Notify global subscribers
                this.globalListeners.forEach((listener) => listener());

                // Watcher 실행 (와일드카드 매칭 포함) / Execute watcher (including wildcard matching)
                this.notifyWatchers(
                    fieldNameStr,
                    value,
                    prevChildValue,
                    prevParentValues,
                );
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
            const oldValue = field.value;
            const fieldStr = fieldName as string;
            field.value = value;
            this.updateDirtyForField(fieldStr, value);

            // 해당 필드 구독자들 알림 / Notify field subscribers
            field.listeners.forEach((listener) => {
                listener();
            });

            // Dot notation 구독자들 알림 / Notify dot notation subscribers
            this.dotNotationListeners.forEach((listeners, subscribedPath) => {
                // 1. 정확히 일치하는 경로
                if (subscribedPath === fieldStr) {
                    listeners.forEach((listener) => listener());
                }
                // 2. 배열 필드나 .length 구독자들에게 알림
                // Notify array field or .length subscribers
                else if (subscribedPath === `${fieldStr}.length`) {
                    // 이전 길이와 새 길이 계산
                    const oldLength = Array.isArray(oldValue)
                        ? oldValue.length
                        : 0;
                    const newLength = Array.isArray(value) ? value.length : 0;
                    // 길이가 변경되었거나 undefined에서 배열로 변경된 경우 알림
                    if (oldLength !== newLength || (!oldValue && value)) {
                        listeners.forEach((listener) => listener());
                    }
                }
                // 3. 객체 필드 전체 교체 시 실제로 값이 변경된 개별 필드 구독자들에게만 알림
                // Notify individual field subscribers only if their actual values changed when entire object is replaced
                else if (
                    subscribedPath.startsWith(fieldStr + ".") &&
                    typeof value === "object" &&
                    value !== null &&
                    !Array.isArray(value)
                ) {
                    // customer.name, customer.seq 등의 자식 경로
                    const childPath = subscribedPath.substring(
                        fieldStr.length + 1,
                    );
                    const oldChildValue =
                        oldValue && typeof oldValue === "object"
                            ? getNestedValue(oldValue, childPath)
                            : undefined;
                    const newChildValue = getNestedValue(value, childPath);

                    // 실제로 값이 변경된 경우에만 알림
                    if (
                        JSON.stringify(oldChildValue) !==
                        JSON.stringify(newChildValue)
                    ) {
                        listeners.forEach((listener) => listener());
                    }
                }
                // 🔥 배열 전체 교체 시 실제로 값이 변경된 개별 필드 구독자들에게만 알림
                // Notify individual field subscribers only if their actual values changed when entire array is replaced
                else if (
                    Array.isArray(value) &&
                    Array.isArray(oldValue) &&
                    subscribedPath.startsWith(`${fieldStr}.`)
                ) {
                    const pathParts = subscribedPath.split(".");
                    if (pathParts.length >= 2 && pathParts[0] === fieldStr) {
                        const index = parseInt(pathParts[1]);
                        if (!isNaN(index) && index >= 0) {
                            // 해당 인덱스의 값을 비교 (전체 객체 또는 특정 속성)
                            const pathAfterIndex = pathParts.slice(1).join(".");
                            const oldItemValue = getNestedValue(
                                oldValue,
                                pathAfterIndex,
                            );
                            const newItemValue = getNestedValue(
                                value,
                                pathAfterIndex,
                            );

                            // 실제로 값이 변경된 경우에만 알림
                            if (
                                JSON.stringify(oldItemValue) !==
                                JSON.stringify(newItemValue)
                            ) {
                                listeners.forEach((listener) => listener());
                            }
                        }
                    }
                }
                // 배열이 새로 생성되거나 삭제된 경우 (undefined → array 또는 array → undefined)
                else if (
                    subscribedPath.startsWith(`${fieldStr}.`) &&
                    ((Array.isArray(value) && !Array.isArray(oldValue)) ||
                        (!Array.isArray(value) && Array.isArray(oldValue)))
                ) {
                    listeners.forEach((listener) => listener());
                }
            });

            // 전역 구독자들 알림 / Notify global subscribers
            if (this.globalListeners.size > 0) {
                this.globalListeners.forEach((listener) => listener());
            }

            // Watcher 실행 (와일드카드 매칭 포함) / Execute watcher (including wildcard matching)
            this.notifyWatchers(fieldStr, value, oldValue);
        }
    }

    /**
     * 모든 값 가져오기 / Get all values
     * @returns 모든 필드 값을 포함한 객체 / Object containing all field values
     */
    getValues(): T {
        const values: any = {};
        this.fields.forEach((field, key) => {
            // 와일드카드 구독을 위해 undefined 값을 그대로 유지
            // Keep undefined values as-is for wildcard subscriptions
            values[key] = field.value;
        });
        return values as T;
    }

    /**
     * 모든 값 설정 / Set all values
     * @param newValues 설정할 값들 / Values to set
     */
    setValues(newValues: Partial<T>) {
        if (!newValues || Object.keys(newValues).length === 0) {
            return;
        }

        // 성능 최적화: 영향받는 리스너들을 먼저 수집
        const affectedListeners = new Set<() => void>();
        const watcherNotifications: Array<{
            path: string;
            value: any;
            prevValue: any;
        }> = [];

        // 각 업데이트를 개별적으로 처리하되, 리스너 실행은 마지막에 일괄 처리
        Object.entries(newValues).forEach(([fieldName, value]) => {
            // 이전 값 저장 (watch 알림용)
            const prevValue = this.getValue(fieldName);

            this.setValueWithoutNotify(fieldName, value, affectedListeners);

            // watch 알림 예약
            watcherNotifications.push({ path: fieldName, value, prevValue });
        });

        // 글로벌 리스너들도 추가
        this.globalListeners.forEach((listener) =>
            affectedListeners.add(listener),
        );

        // 배치로 모든 영향받는 리스너들 실행
        affectedListeners.forEach((listener) => {
            try {
                listener();
            } catch (error) {
                devError("setValues 리스너 실행 중 오류:", error);
            }
        });

        // watch 알림 실행
        watcherNotifications.forEach(({ path, value, prevValue }) => {
            this.notifyWatchers(path, value, prevValue);
        });
    }

    /**
     * 초기값 재설정 / Reset initial values
     * @param newInitialValues 새로운 초기값 / New initial values
     */
    setInitialValues(newInitialValues: T) {
        this.initialValues = { ...newInitialValues };
        this.isInitialEmpty = Object.keys(this.initialValues).length === 0;
        this.dirtyFields.clear();

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
        return this.dirtyFields.size > 0;
    }

    /**
     * 객체에 비어있지 않은 값이 있는지 확인 / Check if object has non-empty values
     */
    private hasNonEmptyValues(obj: any): boolean {
        for (const key in obj) {
            const value = obj[key];
            if (
                value !== undefined &&
                value !== null &&
                value !== "" &&
                value !== 0
            ) {
                if (typeof value === "object" && value !== null) {
                    if (Array.isArray(value)) {
                        if (value.length > 0) return true;
                    } else {
                        if (this.hasNonEmptyValues(value)) return true;
                    }
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    private hasMeaningfulValue(value: any): boolean {
        if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === 0
        ) {
            return false;
        }

        if (typeof value === "object") {
            if (Array.isArray(value)) {
                return value.length > 0;
            }
            return this.hasNonEmptyValues(value);
        }

        return true;
    }

    /**
     * 특정 필드가 존재하는지 확인 / Check if a specific field exists
     * @param path 필드 경로 (dot notation 지원) / Field path (supports dot notation)
     * @returns 필드 존재 여부 / Whether the field exists
     */
    hasField(path: string): boolean {
        const currentValues = this.getValues();
        try {
            const value = getNestedValue(currentValues, path);
            return value !== undefined;
        } catch {
            return false;
        }
    }

    /**
     * 특정 필드를 제거 / Remove a specific field
     * @param path 필드 경로 (dot notation 지원) / Field path (supports dot notation)
     */
    removeField(path: string): void {
        const currentValues = this.getValues();
        const pathParts = path.split(".");

        if (pathParts.length === 1) {
            // 루트 레벨 필드 제거 / Remove root level field
            delete currentValues[pathParts[0]];
            this.fields.delete(pathParts[0]);
        } else {
            // 중첩된 필드 제거 / Remove nested field
            const parentPath = pathParts.slice(0, -1).join(".");
            const fieldName = pathParts[pathParts.length - 1];
            const parent = getNestedValue(currentValues, parentPath);

            if (parent && typeof parent === "object") {
                if (Array.isArray(parent)) {
                    const index = parseInt(fieldName, 10);
                    if (!isNaN(index) && index >= 0 && index < parent.length) {
                        parent.splice(index, 1);
                    }
                } else {
                    delete parent[fieldName];
                }
            }
        }

        this.setValues(currentValues);

        // 해당 필드의 구독자들에게 알림 / Notify subscribers of this field
        this.dotNotationListeners.forEach((listeners, subscribedPath) => {
            if (subscribedPath === path) {
                listeners.forEach((listener) => listener());
            }
        });

        // 전역 구독자들 알림 / Notify global subscribers
        if (this.globalListeners.size > 0) {
            this.globalListeners.forEach((listener) => listener());
        }
    }

    /**
     * 전역 상태 변경에 구독 / Subscribe to global state changes
     * @param callback 상태 변경 시 실행될 콜백 / Callback to execute on state change
     * @returns 구독 해제 함수 / Unsubscribe function
     */
    subscribeToAll(callback: (values: T) => void): () => void {
        const wrappedCallback = () => {
            callback(this.getValues());
        };

        this.globalListeners.add(wrappedCallback);

        return () => {
            this.globalListeners.delete(wrappedCallback);
        };
    }

    /**
     * 특정 prefix를 가진 모든 필드 구독자들을 새로고침합니다
     * Refresh all field subscribers with specific prefix
     * @param prefix 새로고침할 필드 prefix (예: "address")
     */
    refreshFields(prefix: string): void {
        const prefixWithDot = prefix + ".";

        // 성능 최적화: 리스너들을 먼저 수집한 후 배치 실행
        const listenersToNotify = new Set<() => void>();

        // 일반 필드 구독자들 중 prefix와 일치하는 경우 수집
        this.fields.forEach((field, key) => {
            const keyStr = String(key);
            if (keyStr === prefix || keyStr.startsWith(prefixWithDot)) {
                field.listeners.forEach((listener) => {
                    listenersToNotify.add(listener);
                });
            }
        });

        // Dot notation 구독자들 중 prefix와 일치하는 경우 수집
        this.dotNotationListeners.forEach((listeners, subscribedPath) => {
            if (
                subscribedPath === prefix ||
                subscribedPath.startsWith(prefixWithDot)
            ) {
                listeners.forEach((listener) => {
                    listenersToNotify.add(listener);
                });
            }
        });

        // 배치 실행: 중복 제거된 리스너들을 한 번에 실행
        // 마이크로태스크로 실행하여 동기 작업 완료 후 리렌더링 수행
        if (listenersToNotify.size > 0) {
            Promise.resolve().then(() => {
                listenersToNotify.forEach((listener) => {
                    try {
                        listener();
                    } catch (error) {
                        devError("refreshFields 리스너 실행 중 오류:", error);
                    }
                });
            });
        }
    }

    /**
     * Batch update multiple fields efficiently
     * 여러 필드를 효율적으로 일괄 업데이트
     * @param updates - 업데이트할 필드들의 키-값 쌍
     */
    setBatch(updates: Record<string, any>): void {
        if (!updates || Object.keys(updates).length === 0) {
            return;
        }

        // 성능 최적화: 영향받는 리스너들을 먼저 수집
        const affectedListeners = new Set<() => void>();

        // 각 업데이트를 개별적으로 처리하되, 리스너 실행은 마지막에 일괄 처리
        Object.entries(updates).forEach(([fieldName, value]) => {
            this.setValueWithoutNotify(fieldName, value, affectedListeners);
        });

        // 글로벌 리스너들도 추가
        this.globalListeners.forEach((listener) =>
            affectedListeners.add(listener),
        );

        // 배치로 모든 영향받는 리스너들 실행
        affectedListeners.forEach((listener) => {
            try {
                listener();
            } catch (error) {
                devError("setBatch 리스너 실행 중 오류:", error);
            }
        });
    }

    /**
     * Set value without immediately notifying listeners (for batch operations)
     * 리스너 알림 없이 값 설정 (배치 작업용)
     */
    private setValueWithoutNotify(
        fieldName: string,
        value: any,
        affectedListeners: Set<() => void>,
    ) {
        // dot notation이 포함된 경우
        if (fieldName.includes(".")) {
            const rootField = fieldName.split(".")[0] as keyof T;
            const rootFieldStr = String(rootField);
            const remainingPath = fieldName.substring(rootFieldStr.length + 1);

            let field = this.fields.get(rootField);
            if (!field) {
                field = {
                    value: {},
                    listeners: new Set(),
                };
                this.fields.set(rootField, field);
            }

            const oldRootValue = field.value;
            const newRootValue = setNestedValue(
                field.value || {},
                remainingPath,
                value,
            );

            if (JSON.stringify(field.value) !== JSON.stringify(newRootValue)) {
                field.value = newRootValue;
                this.updateDirtyForField(rootFieldStr, newRootValue);

                // 루트 필드 구독자들 수집
                field.listeners.forEach((listener) => {
                    affectedListeners.add(listener);
                });

                // Dot notation 구독자들 수집
                this.dotNotationListeners.forEach(
                    (listeners, subscribedPath) => {
                        if (subscribedPath === fieldName) {
                            listeners.forEach((listener) =>
                                affectedListeners.add(listener),
                            );
                        }
                        // 배열 필드나 .length 구독자들에게 알림
                        else if (subscribedPath === `${rootFieldStr}.length`) {
                            const oldLength = Array.isArray(oldRootValue)
                                ? oldRootValue.length
                                : 0;
                            const newLength = Array.isArray(newRootValue)
                                ? newRootValue.length
                                : 0;

                            if (oldLength !== newLength) {
                                listeners.forEach((listener) =>
                                    affectedListeners.add(listener),
                                );
                            }
                        }
                        // 부모 경로가 변경된 경우 하위 구독자들도 알림
                        else if (subscribedPath.startsWith(`${fieldName}.`)) {
                            listeners.forEach((listener) =>
                                affectedListeners.add(listener),
                            );
                        }
                    },
                );
            }
        } else {
            // 일반 필드 처리
            const oldValue = this.fields.has(fieldName as keyof T)
                ? this.fields.get(fieldName as keyof T)!.value
                : undefined;

            if (!this.fields.has(fieldName as keyof T)) {
                this.fields.set(fieldName as keyof T, {
                    value: value,
                    listeners: new Set(),
                });
            } else {
                const field = this.fields.get(fieldName as keyof T);
                if (field) {
                    field.value = value;
                }
            }

            // 값이 실제로 변경된 경우에만 리스너 수집
            if (JSON.stringify(oldValue) !== JSON.stringify(value)) {
                this.updateDirtyForField(fieldName, value);
                const field = this.fields.get(fieldName as keyof T);
                if (field) {
                    // 루트 필드 구독자들 수집
                    field.listeners.forEach((listener) => {
                        affectedListeners.add(listener);
                    });
                }

                const fieldStr = fieldName as string;

                // Dot notation 구독자들 수집 (setValue와 동일한 로직)
                this.dotNotationListeners.forEach(
                    (listeners, subscribedPath) => {
                        // 1. 정확히 일치하는 경로
                        if (subscribedPath === fieldStr) {
                            listeners.forEach((listener) =>
                                affectedListeners.add(listener),
                            );
                        }
                        // 2. 배열 필드나 .length 구독자들에게 알림
                        else if (subscribedPath === `${fieldStr}.length`) {
                            const oldLength = Array.isArray(oldValue)
                                ? oldValue.length
                                : 0;
                            const newLength = Array.isArray(value)
                                ? value.length
                                : 0;
                            if (
                                oldLength !== newLength ||
                                (!oldValue && value)
                            ) {
                                listeners.forEach((listener) =>
                                    affectedListeners.add(listener),
                                );
                            }
                        }
                        // 3. 객체 필드 전체 교체 시 실제로 값이 변경된 개별 필드 구독자들에게만 알림
                        else if (
                            subscribedPath.startsWith(fieldStr + ".") &&
                            typeof value === "object" &&
                            value !== null &&
                            !Array.isArray(value)
                        ) {
                            const childPath = subscribedPath.substring(
                                fieldStr.length + 1,
                            );
                            const oldChildValue =
                                oldValue && typeof oldValue === "object"
                                    ? getNestedValue(oldValue, childPath)
                                    : undefined;
                            const newChildValue = getNestedValue(
                                value,
                                childPath,
                            );

                            if (
                                JSON.stringify(oldChildValue) !==
                                JSON.stringify(newChildValue)
                            ) {
                                listeners.forEach((listener) =>
                                    affectedListeners.add(listener),
                                );
                            }
                        }
                        // 4. 배열 전체 교체 시 실제로 값이 변경된 개별 필드 구독자들에게만 알림
                        else if (
                            Array.isArray(value) &&
                            Array.isArray(oldValue) &&
                            subscribedPath.startsWith(`${fieldStr}.`)
                        ) {
                            const pathParts = subscribedPath.split(".");
                            if (
                                pathParts.length >= 2 &&
                                pathParts[0] === fieldStr
                            ) {
                                const index = parseInt(pathParts[1]);
                                if (!isNaN(index) && index >= 0) {
                                    const pathAfterIndex = pathParts
                                        .slice(1)
                                        .join(".");
                                    const oldItemValue = getNestedValue(
                                        oldValue,
                                        pathAfterIndex,
                                    );
                                    const newItemValue = getNestedValue(
                                        value,
                                        pathAfterIndex,
                                    );

                                    if (
                                        JSON.stringify(oldItemValue) !==
                                        JSON.stringify(newItemValue)
                                    ) {
                                        listeners.forEach((listener) =>
                                            affectedListeners.add(listener),
                                        );
                                    }
                                }
                            }
                        }
                        // 5. 배열이 새로 생성되거나 삭제된 경우
                        else if (
                            subscribedPath.startsWith(`${fieldStr}.`) &&
                            ((Array.isArray(value) &&
                                !Array.isArray(oldValue)) ||
                                (!Array.isArray(value) &&
                                    Array.isArray(oldValue)))
                        ) {
                            listeners.forEach((listener) =>
                                affectedListeners.add(listener),
                            );
                        }
                    },
                );
            }
        }
    }

    /**
     * 초기값으로 리셋 / Reset to initial values
     */
    reset() {
        // Pure Zero-Config 모드인지 확인 (초기값이 빈 객체)
        const isPureZeroConfig = Object.keys(this.initialValues).length === 0;

        if (isPureZeroConfig) {
            // Pure Zero-Config 모드: 먼저 구독된 dot notation 필드들의 기본값 설정
            this.dotNotationListeners.forEach((listeners, path) => {
                if (listeners.size > 0) {
                    // 구독자가 있는 dot notation 필드는 빈 문자열로 설정
                    this.setValue(path, "");
                }
            });

            // 일반 필드들 중에서 dot notation과 충돌하지 않는 것들만 기본값으로 설정
            this.fields.forEach((field, key) => {
                const keyStr = String(key);
                // dot notation 필드의 부모가 아닌 경우에만 null로 설정
                let hasChildDotNotation = false;
                for (const dotPath of this.dotNotationListeners.keys()) {
                    if (dotPath.startsWith(keyStr + ".")) {
                        hasChildDotNotation = true;
                        break;
                    }
                }

                if (!hasChildDotNotation) {
                    field.value = "";
                }
            });
        } else {
            // 일반 모드: initialValues로 복원
            // Normal mode: Restore to initialValues
            Object.keys(this.initialValues).forEach((key) => {
                const field = this.fields.get(key as keyof T);
                if (field) {
                    field.value = this.initialValues[key as keyof T];
                }
            });

            // 2. 누락된 초기값 필드들 추가
            Object.keys(this.initialValues).forEach((key) => {
                if (!this.fields.has(key)) {
                    this.fields.set(key, {
                        value: this.initialValues[key as keyof T],
                        listeners: new Set(),
                    });
                }
            });

            // 3. dot notation 구독자가 있는 필드들도 초기값으로 재설정
            // 이는 중첩된 필드 (예: labels, items 등)가 배열/객체일 때 중요
            this.dotNotationListeners.forEach((listeners, path) => {
                if (listeners.size > 0 && !path.includes(".")) {
                    // 최상위 레벨 필드만 (dot이 없는 경로)
                    const initialValue = this.initialValues[path as keyof T];
                    if (initialValue !== undefined) {
                        // setValue가 아닌 직접 설정 (무한 루프 방지)
                        if (!this.fields.has(path as keyof T)) {
                            this.fields.set(path as keyof T, {
                                value: initialValue,
                                listeners: new Set(),
                            });
                        } else {
                            const field = this.fields.get(path as keyof T);
                            if (field) {
                                field.value = initialValue;
                            }
                        }
                    }
                }
            });
        }

        this.dirtyFields.clear();

        // 모든 필드 리스너들에게 알림
        this.fields.forEach((field) => {
            field.listeners.forEach((listener) => listener());
        });

        // dot notation 리스너들에게도 알림
        this.dotNotationListeners.forEach((listeners) => {
            listeners.forEach((listener) => listener());
        });

        // 글로벌 리스너들에게도 알림
        this.globalListeners.forEach((listener) => listener());
    }

    /**
     * 필드 변경 감시 / Watch field changes
     * @param path 감시할 필드 경로 (dot notation 지원) / Field path to watch (supports dot notation)
     * @param callback 변경 시 실행할 콜백 / Callback to execute on change
     * @param options 옵션 / Options
     * @returns cleanup 함수 / Cleanup function
     */
    watch(
        path: string,
        callback: WatchCallback,
        options?: { immediate?: boolean },
    ): () => void {
        if (!this.watchers.has(path)) {
            this.watchers.set(path, new Set());
        }

        const watcherSet = this.watchers.get(path)!;
        watcherSet.add(callback);

        // immediate: true면 현재 값으로 즉시 실행 / Execute immediately with current value if immediate: true
        if (options?.immediate) {
            const currentValue = this.getValue(path);
            callback(currentValue, undefined);
        }

        // cleanup 함수 반환 / Return cleanup function
        return () => {
            watcherSet.delete(callback);
            if (watcherSet.size === 0) {
                this.watchers.delete(path);
            }
        };
    }

    /**
     * Watcher 알림 실행 / Notify watchers
     * @param path 변경된 필드 경로 / Changed field path
     * @param value 새 값 / New value
     * @param prevValue 이전 값 / Previous value
     * @param prevParentValues 부모 경로들의 이전 값 맵 / Map of previous values for parent paths
     */
    private notifyWatchers(
        path: string,
        value: any,
        prevValue: any,
        prevParentValues?: Map<string, any>,
    ): void {
        // 값이 실제로 변경되지 않았으면 알림하지 않음 / Skip notification if value hasn't actually changed
        if (JSON.stringify(value) === JSON.stringify(prevValue)) {
            return;
        }

        // 1. 정확한 경로 매칭 / Exact path match
        const exactWatchers = this.watchers.get(path);
        if (exactWatchers && exactWatchers.size > 0) {
            exactWatchers.forEach((callback) => {
                try {
                    callback(value, prevValue);
                } catch (error) {
                    console.error(
                        `Error in watcher for path "${path}":`,
                        error,
                    );
                }
            });
        }

        // 2. 부모 경로들에게도 알림 / Notify parent paths
        // 예: filters.interval 변경 시 filters watcher도 트리거
        if (path.includes(".")) {
            const parts = path.split(".");
            for (let i = parts.length - 1; i > 0; i--) {
                const parentPath = parts.slice(0, i).join(".");
                const parentWatchers = this.watchers.get(parentPath);

                if (parentWatchers && parentWatchers.size > 0) {
                    // 부모 객체의 현재 값
                    const parentValue = this.getValue(parentPath);

                    // 부모 객체의 이전 값 (미리 저장된 값 사용)
                    const parentPrevValue =
                        prevParentValues?.get(parentPath) || parentValue;

                    parentWatchers.forEach((callback) => {
                        try {
                            callback(parentValue, parentPrevValue);
                        } catch (error) {
                            console.error(
                                `Error in parent watcher for path "${parentPath}" (triggered by "${path}"):`,
                                error,
                            );
                        }
                    });
                }
            }
        }

        // 3. 와일드카드 패턴 매칭 / Wildcard pattern matching
        // todos.0.completed 변경 시 "todos.*.completed" 패턴도 트리거
        this.watchers.forEach((watcherSet, watcherPath) => {
            if (watcherPath.includes("*")) {
                if (this.matchesWildcard(path, watcherPath)) {
                    watcherSet.forEach((callback) => {
                        try {
                            callback(value, prevValue);
                        } catch (error) {
                            console.error(
                                `Error in wildcard watcher for pattern "${watcherPath}" (triggered by "${path}"):`,
                                error,
                            );
                        }
                    });
                }
            }
        });
    }

    /**
     * 와일드카드 패턴 매칭 / Wildcard pattern matching
     * @param path 실제 경로 / Actual path (e.g., "todos.0.completed")
     * @param pattern 와일드카드 패턴 / Wildcard pattern (e.g., "todos.*.completed")
     * @returns 매칭 여부 / Whether path matches pattern
     */
    private matchesWildcard(path: string, pattern: string): boolean {
        const pathParts = path.split(".");
        const patternParts = pattern.split(".");

        if (pathParts.length !== patternParts.length) {
            return false;
        }

        for (let i = 0; i < patternParts.length; i++) {
            if (patternParts[i] === "*") {
                continue; // 와일드카드는 모든 값과 매칭 / Wildcard matches any value
            }
            if (patternParts[i] !== pathParts[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * 특정 path에 watcher가 등록되어 있는지 확인 / Check if watcher is registered for specific path
     * @param path 확인할 경로 / Path to check
     * @returns watcher 등록 여부 / Whether watcher is registered
     */
    hasWatcher(path: string): boolean {
        return this.watchers.has(path);
    }

    /**
     * 등록된 모든 watcher path 목록 반환 (디버깅용) / Return all registered watcher paths (for debugging)
     * @returns watcher path 배열 / Array of watcher paths
     */
    getWatchedPaths(): string[] {
        return Array.from(this.watchers.keys());
    }

    /**
     * 리소스 정리 / Clean up resources
     */
    destroy() {
        this.fields.clear();
        this.globalListeners.clear();
        this.dotNotationListeners.clear();
        this.watchers.clear();
    }
}
