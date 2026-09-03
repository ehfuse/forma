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

import { getNestedValue, setNestedValue, parsePath } from "../utils/dotNotation";
import { devError } from "../utils/environment";
import { deepEqual } from "../utils/deepEqual";

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

/**
 * hooks 가 사용하는 store 의 명령형 API 묶음 / Imperative store API surface used by hooks
 * 모든 메서드는 pre-bound 이며 store 수명 동안 식별자가 안정적이다.
 * All methods are pre-bound; identities are stable for the store's lifetime.
 */
export interface FieldStoreApi<T extends Record<string, any>> {
    setValue: (fieldName: keyof T | string, value: any) => void; // 필드 값 설정
    setValues: (newValues: Partial<T>) => void; // 여러 값 일괄 설정 (watch 알림 포함)
    getValue: (fieldName: keyof T | string) => any; // 필드 값 조회
    getValues: () => T; // 전체 값 스냅샷 조회 (캐시 공유 객체 — 변형 금지)
    setBatch: (updates: Record<string, any>) => void; // 여러 값 일괄 설정 (배치)
    reset: () => void; // 초기값으로 리셋
    hasField: (path: string) => boolean; // 필드 존재 여부
    removeField: (path: string) => void; // 필드 제거
    subscribe: (
        fieldName: keyof T | string,
        listener: () => void,
    ) => () => void; // 필드 구독 (해제 함수 반환)
    setInitialValues: (newInitialValues: T) => void; // 초기값 재설정
    refreshFields: (prefix: string) => void; // prefix 하위 구독자 강제 새로고침
}

export class FieldStore<T extends Record<string, any>> {
    private fields: Map<keyof T, { value: any; listeners: Set<() => void> }> =
        new Map();
    private dotNotationListeners: Map<string, Set<() => void>> = new Map(); // Dot notation 구독자 / Dot notation subscribers
    private dotPathIndex: Map<string, Set<string>> = new Map(); // 루트필드 → 구독 dot 경로 역인덱스 / root field → subscribed dot paths reverse index
    private initialValues: T;
    private dirtyFields: Set<string> = new Set();
    private isInitialEmpty: boolean;
    private globalListeners = new Set<() => void>();
    private watchers: Map<string, Set<WatchCallback>> = new Map(); // Watch 콜백 관리 / Watch callback management
    private wildcardWatcherPaths: Set<string> = new Set(); // 와일드카드(*) watcher 경로 별도 목록 / separate list of wildcard watcher paths
    private valuesVersion = 0; // 값 변경 세대 카운터 (단조 증가) / monotonically increasing mutation version
    private cachedValues: T | null = null; // getValues() 스냅샷 캐시 / cached getValues() snapshot
    private cachedValuesVersion = -1; // 캐시가 만들어진 세대 / version the cache was built at
    private api: FieldStoreApi<T> | null = null; // getApi() 지연 생성 캐시 / lazily created stable API object

    /** @internal 테스트 전용: collect 함수가 검사한 구독 경로 수 누적 / test-only counter of scanned subscribed paths */
    public __debugDotScanCount = 0;

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
        return deepEqual(a, b);
    }

    /**
     * 값 변경 세대를 올리고 getValues() 스냅샷 캐시를 무효화한다.
     * Bump the mutation version and invalidate the getValues() snapshot cache.
     * 모든 쓰기 지점(setValue/setValueWithoutNotify/reset/setInitialValues/
     * removeField/refreshFields/subscribe 필드 생성/destroy)에서 호출해야 한다.
     * Must be called from every write site.
     */
    private bumpValuesVersion(): void {
        this.valuesVersion++;
        this.cachedValues = null;
    }

    /**
     * dot 구독 경로를 루트필드 역인덱스에 등록한다.
     * Register a subscribed dot path in the root-field reverse index.
     */
    private indexDotPath(subscribedPath: string): void {
        const root = parsePath(subscribedPath).root;
        let bucket = this.dotPathIndex.get(root);
        if (!bucket) {
            bucket = new Set();
            this.dotPathIndex.set(root, bucket);
        }
        bucket.add(subscribedPath);
    }

    /**
     * dot 구독 경로를 루트필드 역인덱스에서 제거한다 (빈 버킷은 정리).
     * Remove a subscribed dot path from the reverse index (cleaning empty buckets).
     */
    private unindexDotPath(subscribedPath: string): void {
        const root = parsePath(subscribedPath).root;
        const bucket = this.dotPathIndex.get(root);
        if (bucket) {
            bucket.delete(subscribedPath);
            if (bucket.size === 0) {
                this.dotPathIndex.delete(root);
            }
        }
    }

    /**
     * 특정 필드 변경에 의해 깨어나야 할 dot-notation 구독자들을 수집한다.
     * Collect dot-notation subscribers that must be notified for a given field change.
     *
     * setValue(즉시 알림)와 setValueWithoutNotify(배치 수집)가 동일한 매칭 규칙을
     * 공유하도록 단일 진실 원천(single source of truth)으로 추출한 함수.
     * Extracted as a single source of truth so setValue (immediate) and
     * setValueWithoutNotify (batched) share the exact same matching rules,
     * eliminating single-vs-batch notification divergence.
     *
     * @param changedPath 실제로 변경된 경로 / The path that actually changed
     *        - dot 경로 set: 전체 경로 (예: "a.b.c") / full dot path for nested set
     *        - 일반 필드 set: 루트 필드명 (예: "user") / root field name for plain set
     * @param rootFieldStr 루트 필드명 / Root field name (changedPath 의 첫 세그먼트)
     * @param oldValue 변경 전 값 / Previous value
     *        - dot 경로: 루트 필드의 이전 값 / previous root value
     *        - 일반 필드: 필드의 이전 값 / previous field value
     * @param newValue 변경 후 값 / New value (대응되는 범위)
     * @returns 깨워야 할 listener 집합 / Set of listeners to notify
     */
    private collectAffectedDotListeners(
        changedPath: string,
        rootFieldStr: string,
        oldValue: any,
        newValue: any,
    ): Set<() => void> {
        const affected = new Set<() => void>();

        // 역인덱스: 매칭 규칙 1~4 는 모두 subscribedPath 의 루트가 rootFieldStr 와
        // 같아야만 성립하므로, 해당 루트 버킷만 검사하면 전체 스캔과 결과가 동일하다.
        // Reverse index: every matching rule (1-4) requires the subscribed path to
        // share rootFieldStr as its root, so scanning only that bucket is equivalent
        // to scanning the whole map.
        const bucket = this.dotPathIndex.get(rootFieldStr);
        if (!bucket) {
            return affected;
        }

        bucket.forEach((subscribedPath) => {
            this.__debugDotScanCount++;
            const listeners = this.dotNotationListeners.get(subscribedPath);
            if (!listeners) return;
            const add = () =>
                listeners.forEach((listener) => affected.add(listener));

            // 1. 정확히 일치하는 경로 / Exact path match
            if (subscribedPath === changedPath) {
                add();
                return;
            }

            // 2. 자식 경로가 변경되면 부모 경로 구독자에게 알림
            //    Notify parent-path subscribers when a child changes
            //    예: changedPath "a.b.c", subscribedPath "a.b"
            if (changedPath.startsWith(subscribedPath + ".")) {
                add();
                return;
            }

            // 3. .length 구독자: 배열 길이가 바뀐 경우에만 / array length subscribers
            if (subscribedPath === `${rootFieldStr}.length`) {
                const oldLength = Array.isArray(oldValue) ? oldValue.length : 0;
                const newLength = Array.isArray(newValue) ? newValue.length : 0;
                if (oldLength !== newLength || (!oldValue && newValue)) {
                    add();
                }
                return;
            }

            // 4. 부모(또는 changedPath) 가 바뀌어 그 하위 구독자가 영향받는 경우
            //    Parent (or changedPath) changed → notify descendant subscribers,
            //    단, 값이 실제로 바뀐 자식에게만 알림 / only if the child value actually changed.
            //    rootFieldStr 와 정확히 같은 경로는 루트 필드 구독자가 이미 처리하므로 제외.
            if (
                subscribedPath.startsWith(changedPath + ".") &&
                subscribedPath !== rootFieldStr
            ) {
                const childPath = subscribedPath.substring(
                    changedPath.length + 1,
                );
                const oldChildValue = getNestedValue(oldValue, childPath);
                const newChildValue = getNestedValue(newValue, childPath);
                if (!deepEqual(oldChildValue, newChildValue)) {
                    add();
                }
                return;
            }
        });

        return affected;
    }

    /**
     * 점 없는 루트 필드(fieldStr)가 통째로 교체될 때, 그 하위를 구독한
     * dot-notation 구독자들 중 깨어나야 할 listener 들을 수집한다.
     * Collect dot-notation subscribers to notify when a plain root field
     * (fieldStr) is replaced as a whole.
     *
     * setValue(즉시) / setValueWithoutNotify(배치) 가 동일한 매칭 규칙을 공유하도록
     * 단일 진실 원천으로 추출. 분기 규칙은 기존 구현과 byte 단위로 동일.
     * Extracted as a single source of truth so setValue (immediate) and
     * setValueWithoutNotify (batched) share identical matching rules.
     * Branch logic is byte-for-byte identical to the previous inline implementations.
     *
     * 주의: "값이 실제로 변경되었는가" 게이트는 각 호출부에 남겨둔다.
     *   - setValue: field.value !== value (참조 비교)
     *   - setValueWithoutNotify: deepEqual 깊은 비교
     * Note: the "did the value actually change" gate stays at each call site
     * (reference compare for setValue, deep compare for setValueWithoutNotify).
     *
     * @param fieldStr 교체된 루트 필드명 / Replaced root field name
     * @param oldValue 필드의 이전 값 / Previous field value
     * @param value 필드의 새 값 / New field value
     * @returns 깨워야 할 listener 집합 / Set of listeners to notify
     */
    private collectAffectedPlainFieldListeners(
        fieldStr: string,
        oldValue: any,
        value: any,
    ): Set<() => void> {
        const affected = new Set<() => void>();

        // 역인덱스: 매칭 규칙 1~5 는 모두 subscribedPath 가 fieldStr 자체이거나
        // "fieldStr." 로 시작해야만 성립 → 루트가 fieldStr 인 버킷만 검사하면 된다.
        // (일반 필드 "a" 변경이 "a." 하위 dot 구독자에게 닿는 엣지 포함 —
        //  "a.b" 는 루트 "a" 버킷에 들어있다)
        // Reverse index: rules 1-5 all require subscribedPath === fieldStr or a
        // "fieldStr." prefix, so the bucket keyed by fieldStr covers every match,
        // including dot subscribers under "a." for a plain-field "a" change.
        const bucket = this.dotPathIndex.get(fieldStr);
        if (!bucket) {
            return affected;
        }

        bucket.forEach((subscribedPath) => {
            this.__debugDotScanCount++;
            const listeners = this.dotNotationListeners.get(subscribedPath);
            if (!listeners) return;
            const add = () =>
                listeners.forEach((listener) => affected.add(listener));

            // 1. 정확히 일치하는 경로 / Exact path match
            if (subscribedPath === fieldStr) {
                add();
            }
            // 2. 배열 필드나 .length 구독자들에게 알림 / array .length subscribers
            else if (subscribedPath === `${fieldStr}.length`) {
                const oldLength = Array.isArray(oldValue) ? oldValue.length : 0;
                const newLength = Array.isArray(value) ? value.length : 0;
                // 길이가 변경되었거나 undefined에서 배열로 변경된 경우 알림
                if (oldLength !== newLength || (!oldValue && value)) {
                    add();
                }
            }
            // 3. 객체 필드 전체 교체 시 실제로 값이 변경된 개별 필드 구독자들에게만 알림
            else if (
                subscribedPath.startsWith(fieldStr + ".") &&
                typeof value === "object" &&
                value !== null &&
                !Array.isArray(value)
            ) {
                const childPath = subscribedPath.substring(fieldStr.length + 1);
                const oldChildValue =
                    oldValue && typeof oldValue === "object"
                        ? getNestedValue(oldValue, childPath)
                        : undefined;
                const newChildValue = getNestedValue(value, childPath);

                if (!deepEqual(oldChildValue, newChildValue)) {
                    add();
                }
            }
            // 4. 배열 전체 교체 시 실제로 값이 변경된 개별 필드 구독자들에게만 알림
            else if (
                Array.isArray(value) &&
                Array.isArray(oldValue) &&
                subscribedPath.startsWith(`${fieldStr}.`)
            ) {
                // 캐시 파서 사용 (공유 객체 — 변형 금지) / memoized parse (shared, read-only)
                const pathParts = parsePath(subscribedPath).segments;
                if (pathParts.length >= 2 && pathParts[0] === fieldStr) {
                    const index = parseInt(pathParts[1]);
                    if (!isNaN(index) && index >= 0) {
                        const pathAfterIndex = pathParts.slice(1).join(".");
                        const oldItemValue = getNestedValue(
                            oldValue,
                            pathAfterIndex,
                        );
                        const newItemValue = getNestedValue(
                            value,
                            pathAfterIndex,
                        );

                        if (!deepEqual(oldItemValue, newItemValue)) {
                            add();
                        }
                    }
                }
            }
            // 5. 배열이 새로 생성되거나 삭제된 경우 (undefined → array 또는 array → undefined)
            else if (
                subscribedPath.startsWith(`${fieldStr}.`) &&
                ((Array.isArray(value) && !Array.isArray(oldValue)) ||
                    (!Array.isArray(value) && Array.isArray(oldValue)))
            ) {
                add();
            }
            // 6. 객체 필드가 null·undefined·원시값으로 교체된 경우 —
            //    하위 경로의 값은 사라지므로(undefined) 값이 있었던 구독자만 깨운다.
            //    규칙 3·4 는 새 값이 객체/배열일 때만 다뤄서, setValue(field, null) 로 통째로
            //    지우면 하위 leaf 구독자가 옛 값을 계속 들고 있었다.
            //    Rule 6: object field replaced by null/undefined/primitive — descendant paths
            //    become undefined, so wake only subscribers whose value actually disappeared
            //    (rules 3-4 only cover object/array replacements).
            else if (
                subscribedPath.startsWith(`${fieldStr}.`) &&
                (value === null || typeof value !== "object") &&
                oldValue !== null &&
                typeof oldValue === "object"
            ) {
                const childPath = subscribedPath.substring(fieldStr.length + 1);
                if (getNestedValue(oldValue, childPath) !== undefined) {
                    add();
                }
            }
        });

        return affected;
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
        // 전체 스냅샷(getValues, O(전체필드)) 대신 루트 필드 값만 꺼내 하강한다.
        // 루트만 얕은 래퍼로 감싸 기존 getNestedValue 의미(금지키 차단, "a.length"
        // 미존재 시 0 반환 엣지)를 byte 단위로 보존한다. 반환 참조는 저장된 루트 값
        // 내부를 그대로 가리키므로 기존과 동일하다 (getSnapshot 참조 안정성).
        // Instead of building a full O(F) snapshot, descend from the root field value.
        // A shallow one-key wrapper preserves getNestedValue semantics byte-for-byte
        // (forbidden-key block, "a.length" → 0 edge). Returned references point into
        // the stored root value exactly as before (getSnapshot reference stability).
        if (fieldNameStr.includes(".")) {
            const parsed = parsePath(fieldNameStr);
            const field = this.fields.get(parsed.root as keyof T);
            return getNestedValue(
                { [parsed.root]: field?.value },
                fieldNameStr,
                parsed.segments,
            );
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
                // 루트필드 역인덱스 등록 / register in the root-field reverse index
                this.indexDotPath(fieldNameStr);
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
                        // 빈 Set 정리 시 역인덱스에서도 제거 / drop from reverse index on empty-Set cleanup
                        this.unindexDotPath(fieldNameStr);
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
            // 필드 생성도 스냅샷 키 집합을 바꾸는 쓰기다 / field creation changes the snapshot key set
            this.bumpValuesVersion();
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
            // 캐시 파서로 세그먼트/루트/부모체인 재사용 / reuse memoized segments/root/parentChain
            const parsed = parsePath(fieldNameStr);
            const rootFieldStr = parsed.root;
            const rootField = rootFieldStr as keyof T;
            const remainingPath = fieldNameStr.substring(
                rootFieldStr.length + 1,
            );
            // 루트 이하 경로 세그먼트 (캐시 파서 재사용) / segments below the root (memoized)
            const remainingSegments = parsePath(remainingPath).segments;

            let field = this.fields.get(rootField);
            if (!field) {
                field = {
                    value: {},
                    listeners: new Set(),
                };
                this.fields.set(rootField, field);
                // 필드 생성 = 쓰기 → 스냅샷 캐시 무효화 / field creation invalidates snapshot cache
                this.bumpValuesVersion();
            }

            const oldRootValue = field.value;
            const newRootValue = setNestedValue(
                field.value || {},
                remainingPath,
                value,
                remainingSegments,
            );

            if (!deepEqual(field.value, newRootValue)) {
                // 변경 전 자식 필드의 값 (watch용)
                const prevChildValue = getNestedValue(
                    field.value,
                    remainingPath,
                    remainingSegments,
                );

                // ⭐ 변경 전 부모 경로들의 값 저장 (부모 watch용)
                // F3: 부모 체인에 watcher 가 실제로 있을 때만 수집한다.
                // 와일드카드 watcher 가 하나라도 있으면 보수적으로 전부 수집.
                // F3: collect only when a watcher exists for a parent path
                // (conservatively collect all if any wildcard watcher exists).
                let prevParentValues: Map<string, any> | undefined;
                const hasWildcardWatcher =
                    this.wildcardWatcherPaths.size > 0;
                for (const parentPath of parsed.parentChain) {
                    if (
                        hasWildcardWatcher ||
                        this.watchers.has(parentPath)
                    ) {
                        if (!prevParentValues) {
                            prevParentValues = new Map();
                        }
                        prevParentValues.set(
                            parentPath,
                            this.getValue(parentPath),
                        );
                    }
                }

                field.value = newRootValue;
                // 값 변경 = 쓰기 → 스냅샷 캐시 무효화 / value write invalidates snapshot cache
                this.bumpValuesVersion();
                this.updateDirtyForField(rootFieldStr, newRootValue);

                // 루트 필드 구독자들 알림 / Notify root field subscribers
                field.listeners.forEach((listener) => {
                    listener();
                });

                // Dot notation 구독자들 알림 / Notify dot notation subscribers
                // 매칭 규칙은 collectAffectedDotListeners 에 일원화 (배치 경로와 공유)
                // Matching rules unified in collectAffectedDotListeners (shared with batch path)
                this.collectAffectedDotListeners(
                    fieldNameStr,
                    rootFieldStr,
                    oldRootValue,
                    newRootValue,
                ).forEach((listener) => listener());

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
            // 필드 생성 = 쓰기 → 스냅샷 캐시 무효화 / field creation invalidates snapshot cache
            this.bumpValuesVersion();
        }

        // 변경 게이트: setValue 는 의도적으로 빠른 참조비교를 사용한다.
        // (배치 경로 setValueWithoutNotify 는 deepEqual 깊은 비교를 사용 — 의도된 차이)
        // 참조가 같으면 값도 같으므로 안전하게 skip. 새 참조면 진행하여
        // "외부에서 새 참조로 갱신했음"을 구독자에게 그대로 전달한다(참조 동일성 기대 보존).
        // Change gate: setValue intentionally uses a fast reference compare.
        // (the batch path setValueWithoutNotify uses deepEqual — an intentional difference)
        if (field.value !== value) {
            const oldValue = field.value;
            const fieldStr = fieldName as string;
            field.value = value;
            // 값 변경 = 쓰기 → 스냅샷 캐시 무효화 / value write invalidates snapshot cache
            this.bumpValuesVersion();
            this.updateDirtyForField(fieldStr, value);

            // 해당 필드 구독자들 알림 / Notify field subscribers
            field.listeners.forEach((listener) => {
                listener();
            });

            // Dot notation 구독자들 알림 / Notify dot notation subscribers
            // 매칭 규칙은 collectAffectedPlainFieldListeners 에 일원화 (배치 경로와 공유)
            // Matching rules unified in collectAffectedPlainFieldListeners (shared with batch path)
            this.collectAffectedPlainFieldListeners(
                fieldStr,
                oldValue,
                value,
            ).forEach((listener) => listener());

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
     * ⚠ 변경 없으면 같은 캐시 객체를 반환한다 — 호출부는 결과를 읽기 전용으로 다뤄야 한다.
     *   (같은 세대 안에서 참조가 안정적이므로 getSnapshot 용도로 사용 가능)
     * ⚠ Returns the SAME cached object until the next mutation — callers must treat
     *   the result as read-only. Reference is stable within a version (getSnapshot-safe).
     * @returns 모든 필드 값을 포함한 객체 / Object containing all field values
     */
    getValues(): T {
        // 세대가 그대로면 캐시 재사용 / reuse cache while the version is unchanged
        if (
            this.cachedValues !== null &&
            this.cachedValuesVersion === this.valuesVersion
        ) {
            return this.cachedValues;
        }

        const values: any = {};
        this.fields.forEach((field, key) => {
            // 와일드카드 구독을 위해 undefined 값을 그대로 유지
            // Keep undefined values as-is for wildcard subscriptions
            values[key] = field.value;
        });
        this.cachedValues = values as T;
        this.cachedValuesVersion = this.valuesVersion;
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
        // 필드 값 일괄 갱신 = 쓰기 → 스냅샷 캐시 무효화 / bulk write invalidates snapshot cache
        this.bumpValuesVersion();

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
        // getValues() 는 이제 공유 캐시 객체를 반환하므로, 최상위 컨테이너는
        // 얕은 복사로 분리한 뒤 조작한다 (캐시 오염 방지).
        // getValues() now returns a shared cached object; shallow-copy the top-level
        // container before mutating so the cache is never corrupted.
        const currentValues: any = { ...this.getValues() };
        // 캐시 파서 사용 (공유 객체 — 변형 금지) / memoized parse (shared, read-only)
        const pathParts = parsePath(path).segments;
        // 필드 제거 = 쓰기 → 스냅샷 캐시 무효화 / removal invalidates snapshot cache
        this.bumpValuesVersion();

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

        // 해당 필드의 구독자들에게 알림 (정확 일치는 직접 조회로 충분)
        // Notify subscribers of this exact path (direct lookup, no full scan)
        const exactListeners = this.dotNotationListeners.get(path);
        if (exactListeners) {
            exactListeners.forEach((listener) => listener());
        }

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
        // refreshFields 는 setValue 를 우회한 외부 in-place 변형 후 호출되는 API 이므로
        // 스냅샷 캐시도 함께 무효화한다 (신선한 스냅샷 보장).
        // refreshFields is called after external in-place mutations that bypass
        // setValue, so invalidate the snapshot cache to guarantee freshness.
        this.bumpValuesVersion();
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
            // 캐시 파서로 세그먼트/루트 재사용 / reuse memoized segments/root
            const parsed = parsePath(fieldName);
            const rootFieldStr = parsed.root;
            const rootField = rootFieldStr as keyof T;
            const remainingPath = fieldName.substring(rootFieldStr.length + 1);
            // 루트 이하 경로 세그먼트 (캐시 파서 재사용) / segments below the root (memoized)
            const remainingSegments = parsePath(remainingPath).segments;

            let field = this.fields.get(rootField);
            if (!field) {
                field = {
                    value: {},
                    listeners: new Set(),
                };
                this.fields.set(rootField, field);
                // 필드 생성 = 쓰기 → 스냅샷 캐시 무효화 / field creation invalidates snapshot cache
                this.bumpValuesVersion();
            }

            const oldRootValue = field.value;
            const newRootValue = setNestedValue(
                field.value || {},
                remainingPath,
                value,
                remainingSegments,
            );

            if (!deepEqual(field.value, newRootValue)) {
                field.value = newRootValue;
                // 값 변경 = 쓰기 → 스냅샷 캐시 무효화 / value write invalidates snapshot cache
                this.bumpValuesVersion();
                this.updateDirtyForField(rootFieldStr, newRootValue);

                // 루트 필드 구독자들 수집
                field.listeners.forEach((listener) => {
                    affectedListeners.add(listener);
                });

                // Dot notation 구독자들 수집
                // setValue 와 동일한 매칭 규칙을 공유하여 단건/배치 동작 불일치를 제거
                // Shares the exact matching rules with setValue to remove single/batch divergence
                this.collectAffectedDotListeners(
                    fieldName,
                    rootFieldStr,
                    oldRootValue,
                    newRootValue,
                ).forEach((listener) => affectedListeners.add(listener));
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
            // 참조 저장은 deepEqual 게이트와 무관하게 일어나므로 항상 무효화
            // The (new) reference is stored regardless of the deepEqual gate → always invalidate
            this.bumpValuesVersion();

            // 값이 실제로 변경된 경우에만 리스너 수집
            if (!deepEqual(oldValue, value)) {
                this.updateDirtyForField(fieldName, value);
                const field = this.fields.get(fieldName as keyof T);
                if (field) {
                    // 루트 필드 구독자들 수집
                    field.listeners.forEach((listener) => {
                        affectedListeners.add(listener);
                    });
                }

                const fieldStr = fieldName as string;

                // Dot notation 구독자들 수집
                // setValue 와 동일한 매칭 규칙을 공유하여 단건/배치 동작 불일치를 제거
                // Shares the exact matching rules with setValue to remove single/batch divergence
                this.collectAffectedPlainFieldListeners(
                    fieldStr,
                    oldValue,
                    value,
                ).forEach((listener) => affectedListeners.add(listener));
            }
        }
    }

    /**
     * 초기값으로 리셋 / Reset to initial values
     */
    reset() {
        // 리셋은 다수 필드 쓰기 → 스냅샷 캐시 무효화 / reset writes many fields → invalidate snapshot cache
        this.bumpValuesVersion();
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

        // 직접 field.value 를 쓴 뒤이므로 알림 직전에 한 번 더 무효화
        // (중간에 리스너가 캐시를 재구축했을 수 있음)
        // Invalidate again right before notifying — a listener may have rebuilt
        // the cache mid-reset while direct field.value writes were still pending.
        this.bumpValuesVersion();

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

        // 와일드카드 패턴은 별도 목록에도 등록해 비-와일드카드 알림이
        // watchers 전체 스캔을 하지 않게 한다 (F8).
        // Track wildcard patterns separately so non-wildcard notifications
        // never scan the whole watchers map (F8).
        if (path.includes("*")) {
            this.wildcardWatcherPaths.add(path);
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
                // 와일드카드 목록에서도 함께 정리 / drop from the wildcard list as well
                this.wildcardWatcherPaths.delete(path);
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
        // watcher 가 하나도 없으면 즉시 종료 (deepEqual 비용도 절약)
        // Fast exit when no watchers exist at all (also skips the deepEqual below)
        if (this.watchers.size === 0) {
            return;
        }

        // 값이 실제로 변경되지 않았으면 알림하지 않음 / Skip notification if value hasn't actually changed
        if (deepEqual(value, prevValue)) {
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
            // 캐시 파서의 부모체인 재사용 (직전 부모 → 루트 순회) / reuse memoized parent chain (nearest parent → root)
            const parentChain = parsePath(path).parentChain;
            for (let i = parentChain.length - 1; i >= 0; i--) {
                const parentPath = parentChain[i];
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
        // 별도 목록만 순회하므로 와일드카드가 없으면 비용 0 (F8)
        // Iterates only the separate wildcard list — zero cost when none exist (F8)
        this.wildcardWatcherPaths.forEach((watcherPath) => {
            if (this.matchesWildcard(path, watcherPath)) {
                const watcherSet = this.watchers.get(watcherPath);
                if (!watcherSet) return;
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
        });
    }

    /**
     * 와일드카드 패턴 매칭 / Wildcard pattern matching
     * @param path 실제 경로 / Actual path (e.g., "todos.0.completed")
     * @param pattern 와일드카드 패턴 / Wildcard pattern (e.g., "todos.*.completed")
     * @returns 매칭 여부 / Whether path matches pattern
     */
    private matchesWildcard(path: string, pattern: string): boolean {
        // 캐시 파서 사용 (공유 객체 — 변형 금지) / memoized parse (shared, read-only)
        const pathParts = parsePath(path).segments;
        const patternParts = parsePath(pattern).segments;

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
     * store 의 명령형 API 묶음을 반환한다 (지연 생성 후 재사용).
     * Return the store's imperative API surface (lazily created, then reused).
     * 모든 메서드는 화살표 래퍼로 pre-bound 되어 store 수명 동안 식별자가 안정적이다
     * — hooks 의 useCallback/useMemo deps 에 그대로 사용할 수 있다.
     * Every method is pre-bound via arrow wrappers; identities are stable for the
     * store's lifetime, safe for hooks' useCallback/useMemo deps.
     */
    getApi(): FieldStoreApi<T> {
        if (this.api === null) {
            this.api = {
                setValue: (fieldName, value) => this.setValue(fieldName, value), // 필드 값 설정
                setValues: (newValues) => this.setValues(newValues), // 여러 값 일괄 설정
                getValue: (fieldName) => this.getValue(fieldName), // 필드 값 조회
                getValues: () => this.getValues(), // 전체 값 스냅샷 (캐시 공유 — 읽기 전용)
                setBatch: (updates) => this.setBatch(updates), // 배치 설정
                reset: () => this.reset(), // 초기값으로 리셋
                hasField: (path) => this.hasField(path), // 필드 존재 여부
                removeField: (path) => this.removeField(path), // 필드 제거
                subscribe: (fieldName, listener) =>
                    this.subscribe(fieldName, listener), // 필드 구독
                setInitialValues: (newInitialValues) =>
                    this.setInitialValues(newInitialValues), // 초기값 재설정
                refreshFields: (prefix) => this.refreshFields(prefix), // prefix 새로고침
            };
        }
        return this.api;
    }

    /**
     * 리소스 정리 / Clean up resources
     */
    destroy() {
        this.fields.clear();
        this.globalListeners.clear();
        this.dotNotationListeners.clear();
        this.dotPathIndex.clear(); // dot 경로 역인덱스 정리 / clear the dot-path reverse index
        this.watchers.clear();
        this.wildcardWatcherPaths.clear(); // 와일드카드 watcher 목록 정리 / clear the wildcard watcher list
        this.bumpValuesVersion(); // 스냅샷 캐시 무효화 / invalidate the snapshot cache
    }
}
