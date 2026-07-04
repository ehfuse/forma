/**
 * dotNotation.ts
 *
 * Forma - Dot notation 관련 유틸리티 함수들 | Dot notation utility functions
 * 중첩 객체의 값을 안전하게 가져오고 설정하는 기능 제공 | Provides safe getting and setting of nested object values
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

/**
 * 프로토타입 오염을 유발할 수 있는 위험 키 | Dangerous keys that can cause prototype pollution
 * (CWE-1321) setNestedValue/getNestedValue 경로에서 차단 | Blocked in setNestedValue/getNestedValue paths
 */
const FORBIDDEN_KEYS = new Set(["__proto__", "prototype", "constructor"]);

/**
 * dot 경로 파싱 결과 | Parsed dot-notation path
 * 주의: 캐시로 공유되는 객체이므로 호출부에서 절대 변형하지 말 것 (읽기 전용)
 * Note: shared via cache — callers must treat it as read-only.
 */
export interface ParsedPath {
    segments: string[]; // 경로 세그먼트 배열 (예: "a.b.c" → ["a","b","c"]) | path segments
    root: string; // 첫 세그먼트(루트 필드명) | first segment (root field)
    parentChain: string[]; // 루트부터 직전 부모까지의 경로 목록 (예: ["a","a.b"]) | ancestor paths from root to direct parent
}

/**
 * 경로 파싱 캐시 상한 | Hard cap for the path-parse cache
 * 가상화 인덱스 경로(list.4321 등)는 무한히 늘어날 수 있어 상한을 두고,
 * 상한 초과 시에는 캐시 없이 매번 파싱한다.
 * Virtualized index paths (e.g. list.4321) are unbounded, so past the cap we parse without caching.
 */
const PATH_CACHE_MAX = 2048;

/**
 * path → ParsedPath 메모 캐시 (모듈 전역, 상한 있음) | Bounded module-level memo cache
 */
const pathCache = new Map<string, ParsedPath>();

/**
 * dot 경로를 세그먼트/루트/부모체인으로 파싱한다 (상한 있는 캐시 사용)
 * Parse a dot path into segments/root/parentChain using a bounded memo cache.
 * @param path dot notation 경로 | Dot notation path
 * @returns 파싱 결과 (캐시 공유 객체 — 변형 금지) | Parsed result (shared, read-only)
 */
export function parsePath(path: string): ParsedPath {
    const cached = pathCache.get(path);
    if (cached) return cached;

    const segments = path.split(".");
    const root = segments[0];
    const parentChain: string[] = [];
    // 루트("a")부터 직전 부모("a.b")까지 누적 경로 생성 | build cumulative ancestor paths
    let acc = "";
    for (let i = 0; i < segments.length - 1; i++) {
        acc = i === 0 ? segments[0] : acc + "." + segments[i];
        parentChain.push(acc);
    }

    const parsed: ParsedPath = { segments, root, parentChain };
    // 상한 초과 시 캐시하지 않고 결과만 반환 | past the cap, return without caching
    if (pathCache.size < PATH_CACHE_MAX) {
        pathCache.set(path, parsed);
    }
    return parsed;
}

/**
 * 세그먼트 배열에 프로토타입 오염 위험 키가 있는지 확인 | Check segments for prototype-pollution keys
 * @param keys 경로 세그먼트 | Path segments
 * @returns 위험 키 포함 여부 | Whether a forbidden key exists
 */
function hasForbiddenKey(keys: readonly string[]): boolean {
    for (let i = 0; i < keys.length; i++) {
        if (FORBIDDEN_KEYS.has(keys[i])) return true;
    }
    return false;
}

/**
 * dot notation으로 중첩 객체의 값을 가져오는 함수 | Function to get nested object values using dot notation
 * @param obj 대상 객체 | Target object
 * @param path dot notation 경로 (예: "user.profile.name") | Dot notation path (e.g., "user.profile.name")
 * @returns 해당 경로의 값 또는 undefined | Value at the path or undefined
 *
 * @example
 * ```typescript
 * const data = { user: { profile: { name: 'John' } } };
 * const name = getNestedValue(data, 'user.profile.name'); // 'John'
 * ```
 */
export function getNestedValue(
    obj: any,
    path: string,
    presplitKeys?: readonly string[], // 미리 분할된 세그먼트(있으면 split 생략) | pre-split segments (skips split)
): any {
    if (obj === null || obj === undefined) {
        return undefined;
    }

    if (!path.includes(".")) {
        if (FORBIDDEN_KEYS.has(path)) {
            return undefined;
        }
        return obj[path];
    }

    // 미리 분할된 세그먼트가 있으면 재사용, 없으면 캐시 파서 사용
    // Reuse pre-split segments if given, otherwise use the memoized parser
    const keys = presplitKeys ?? parsePath(path).segments;

    // 프로토타입 오염 방지: 위험 키가 포함된 경로는 접근 차단
    // Prevent prototype pollution: block paths containing dangerous keys
    if (hasForbiddenKey(keys)) {
        return undefined;
    }

    let current = obj;

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (current === null || current === undefined) {
            // 마지막 키가 'length'이고 이전 값이 undefined인 경우 0 반환
            if (key === "length" && i === keys.length - 1) {
                return 0;
            }
            return undefined;
        }

        current = current[key];
    }

    return current;
}

/**
 * dot notation으로 중첩 객체의 값을 설정하는 함수 | Function to set nested object values using dot notation
 * 불변성을 유지하면서 새로운 객체를 반환 | Returns a new object while maintaining immutability
 * @param obj 대상 객체 | Target object
 * @param path dot notation 경로 | Dot notation path
 * @param value 설정할 값 | Value to set
 * @returns 새로운 객체 | New object
 *
 * @example
 * ```typescript
 * const data = { user: { profile: { name: 'John' } } };
 * const newData = setNestedValue(data, 'user.profile.name', 'Jane');
 * // { user: { profile: { name: 'Jane' } } }
 * ```
 */
export function setNestedValue(
    obj: any,
    path: string,
    value: any,
    presplitKeys?: readonly string[], // 미리 분할된 세그먼트(있으면 split 생략) | pre-split segments (skips split)
): any {
    if (!path.includes(".")) {
        if (FORBIDDEN_KEYS.has(path)) {
            return obj;
        }
        const result = { ...obj, [path]: value };
        return result;
    }

    // 미리 분할된 세그먼트가 있으면 재사용, 없으면 캐시 파서 사용
    // Reuse pre-split segments if given, otherwise use the memoized parser
    const keys = presplitKeys ?? parsePath(path).segments;

    // 프로토타입 오염 방지: 위험 키가 포함된 경로는 변경 없이 원본 반환
    // Prevent prototype pollution: return original unchanged if path contains dangerous keys
    if (hasForbiddenKey(keys)) {
        return obj;
    }

    const result = Array.isArray(obj) ? [...obj] : { ...obj }; // 배열 타입 보존 | Preserve array type
    let current = result;

    // 마지막 키 전까지 객체 생성/복사 | Create/copy objects until the last key
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (
            current[key] === null ||
            current[key] === undefined ||
            typeof current[key] !== "object"
        ) {
            current[key] = {};
        } else {
            // 배열 타입 보존하면서 복사 | Copy while preserving array type
            current[key] = Array.isArray(current[key])
                ? [...current[key]]
                : { ...current[key] };
        }
        current = current[key];
    }

    // 마지막 키에 값 설정 | Set value to the last key
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    return result;
}
