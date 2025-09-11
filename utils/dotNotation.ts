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
    if (!path.includes(".")) {
        return obj[path];
    }

    const keys = path.split(".");
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined) {
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
        const result = { ...obj, [path]: value };
        return result;
    }

    const keys = path.split(".");
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
            console.log(
                `📝 새 객체 생성: ${key} | Creating new object: ${key}`
            );
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
