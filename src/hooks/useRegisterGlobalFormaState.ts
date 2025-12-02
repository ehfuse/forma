/**
 * useRegisterGlobalFormaState.ts
 *
 * Forma - 기존 useFormaState를 글로벌 상태로 등록하는 훅 | Hook to register existing useFormaState as global state
 * 기존에 만든 로컬 FormaState를 글로벌 상태로 공유할 수 있게 해주는 유틸리티
 * Utility to enable sharing existing local FormaState as global state
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

import { useContext, useEffect } from "react";
import { UseFormaStateReturn } from "./useFormaState";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";

/**
 * 기존 useFormaState를 글로벌 상태로 등록하는 훅 | Hook to register existing useFormaState as global state
 *
 * 이미 만들어진 로컬 FormaState를 글로벌 상태로 공유하고 싶을 때 사용합니다.
 * Use this when you want to share an already created local FormaState as global state.
 *
 * @template T FormaState 데이터의 타입 | FormaState data type
 * @param stateId 글로벌 상태 식별자 | Global state identifier
 * @param formaState 등록할 useFormaState 인스턴스 | useFormaState instance to register
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const formaState = useFormaState({ name: '', email: '', settings: { theme: 'light' } });
 *
 *   // 로컬 FormaState를 글로벌로 등록
 *   useRegisterGlobalFormaState('my-state-id', formaState);
 *
 *   // 이제 다른 컴포넌트에서 useGlobalFormaState({ stateId: 'my-state-id' })로 접근 가능
 *   return <div>...</div>;
 * }
 * ```
 */
export function useRegisterGlobalFormaState<T extends Record<string, any>>(
    stateId: string,
    formaState: UseFormaStateReturn<T>
): void {
    const { registerStore } = useContext(GlobalFormaContext);

    useEffect(() => {
        // useFormaState의 내부 store를 글로벌에 등록 | Register useFormaState's internal store globally
        if (formaState._store) {
            registerStore(stateId, formaState._store);
        }
    }, [stateId, formaState._store, registerStore]);
}
