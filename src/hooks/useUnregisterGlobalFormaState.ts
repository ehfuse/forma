/**
 * useUnregisterGlobalFormaState.ts
 *
 * Forma - 글로벌 FormaState 등록 해제 훅 | H    /**
   
 * 등록된 글로벌 FormaState를 메모리에서 제거하는 유틸리티
 * Utility to remove registered global FormaState from memory
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
 * 글로벌 FormaState 등록 해제 훅 | Hook to unregister global FormaState
 *
 * 등록된 글로벌 FormaState를 메모리에서 제거합니다.
 * Remove registered global FormaState from memory.
 *
 * @returns FormaState 등록 해제 함수들 | FormaState unregistration functions
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { unregisterState, clearStates } = useUnregisterGlobalFormaState();
 *
 *   const handleCleanup = () => {
 *     // 특정 상태 제거
 *     const success = unregisterState('my-state-id');
 *     console.log(`State unregistered: ${success}`);
 *   };
 *
 *   const handleReset = () => {
 *     // 모든 상태 제거
 *     clearStates();
 *     console.log('All states cleared');
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCleanup}>Remove State</button>
 *       <button onClick={handleReset}>Clear All</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUnregisterGlobalFormaState() {
    const { unregisterStore, clearStores } = useContext(GlobalFormaContext);

    /**
     * 특정 stateId의 글로벌 FormaState를 등록 해제합니다 | Unregister specific global FormaState
     *
     * @param stateId 제거할 상태 식별자 | State identifier to remove
     * @returns 제거 성공 여부 | Whether removal was successful
     */
    const unregisterState = (stateId: string): boolean => {
        return unregisterStore(stateId);
    };

    /**
     * 모든 글로벌 FormaState를 제거합니다 | Clear all global FormaStates
     */
    const clearStates = (): void => {
        clearStores();
    };

    return {
        unregisterState,
        clearStates,
    };
}
