/**
 * useUnregisterGlobalForm.ts
 *
 * Forma - 글로벌 폼 등록 해제 훅 | Hook to unregister global form
 * 등록된 글로벌 폼을 메모리에서 제거하는 유틸리티
 * Utility to remove registered global form from memory
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

import { useContext } from "react";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";

/**
 * 글로벌 폼 등록 해제 훅 | Hook to unregister global form
 *
 * 등록된 글로벌 폼을 메모리에서 제거합니다.
 * Remove registered global form from memory.
 *
 * @returns 폼 등록 해제 함수들 | Form unregistration functions
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { unregisterForm, clearForms } = useUnregisterGlobalForm();
 *
 *   const handleCleanup = () => {
 *     // 특정 폼 제거
 *     const success = unregisterForm('my-form-id');
 *     console.log(`Form unregistered: ${success}`);
 *   };
 *
 *   const handleReset = () => {
 *     // 모든 폼 제거
 *     clearForms();
 *     console.log('All forms cleared');
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCleanup}>Remove Form</button>
 *       <button onClick={handleReset}>Clear All</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUnregisterGlobalForm() {
    const { unregisterStore, clearStores } = useContext(GlobalFormaContext);

    /**
     * 특정 formId의 글로벌 폼을 등록 해제합니다 | Unregister specific global form
     *
     * @param formId 제거할 폼 식별자 | Form identifier to remove
     * @returns 제거 성공 여부 | Whether removal was successful
     */
    const unregisterForm = (formId: string): boolean => {
        return unregisterStore(formId);
    };

    /**
     * 모든 글로벌 폼을 제거합니다 | Clear all global forms
     */
    const clearForms = (): void => {
        clearStores();
    };

    return {
        unregisterForm,
        clearForms,
    };
}
