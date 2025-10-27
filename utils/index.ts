/**
 * utils/index.ts
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

export { getNestedValue, setNestedValue } from "./dotNotation";
export { isDevelopment, devWarn, devError, devLog } from "./environment";

/**
 * Actions 배열을 단일 객체로 병합
 * Merge actions array into single object
 *
 * @param actions - Actions 객체 또는 배열
 * @returns 병합된 Actions 객체
 */
export function mergeActions<T extends Record<string, any>>(
    actions?:
        | import("../types/form").Actions<T>
        | import("../types/form").Actions<T>[]
): import("../types/form").Actions<T> | undefined {
    if (!actions) return undefined;

    // 이미 객체면 그대로 반환
    if (!Array.isArray(actions)) return actions;

    // 배열이면 모든 객체를 병합 (나중 것이 우선순위)
    return Object.assign({}, ...actions);
}
