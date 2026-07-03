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
export function getNestedValue(obj: any, path: string): any {
    if (obj === null || obj === undefined) {
        return undefined;
    }

    if (!path.includes(".")) {
        if (FORBIDDEN_KEYS.has(path)) {
            return undefined;
        }
        return obj[path];
    }

    const keys = path.split(".");

    // 프로토타입 오염 방지: 위험 키가 포함된 경로는 접근 차단
    // Prevent prototype pollution: block paths containing dangerous keys
    if (keys.some((k) => FORBIDDEN_KEYS.has(k))) {
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
export function setNestedValue(obj: any, path: string, value: any): any {
    if (!path.includes(".")) {
        if (FORBIDDEN_KEYS.has(path)) {
            return obj;
        }
        const result = { ...obj, [path]: value };
        return result;
    }

    const keys = path.split(".");

    // 프로토타입 오염 방지: 위험 키가 포함된 경로는 변경 없이 원본 반환
    // Prevent prototype pollution: return original unchanged if path contains dangerous keys
    if (keys.some((k) => FORBIDDEN_KEYS.has(k))) {
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
