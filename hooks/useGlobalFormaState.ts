/**
 * useGlobalFormaState.ts
 *
 * Forma - 글로벌 FormaState 관리 훅 / Global FormaState management hook
 * 여러 컴포넌트 간 개별 필드 구독 기반 상태 공유를 위한 확장 훅
 * Extended hook for sharing state across multiple components with individual field subscriptions
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
import { useFormaState } from "./useFormaState";
import {
    UseGlobalFormaStateProps,
    UseGlobalFormaStateReturn,
} from "../types/globalForm";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";

/**
 * 글로벌 FormaState 관리 훅 / Global FormaState management hook
 *
 * 여러 컴포넌트 간 개별 필드 구독 기반 상태를 공유하기 위한 훅입니다
 * Hook for sharing state across multiple components with individual field subscriptions
 *
 * 데이터 공유에만 집중하며, 각 컴포넌트에서 필요한 필드만 구독하여 최적화된 렌더링을 제공합니다
 * Focuses only on data sharing and provides optimized rendering by subscribing only to necessary fields in each component
 *
 * @template T FormaState 데이터의 타입 / FormaState data type
 * @param props 글로벌 FormaState 설정 옵션 / Global FormaState configuration options
 * @returns 글로벌 FormaState 관리 API 객체 / Global FormaState management API object
 *
 * @example
 * ```typescript
 * // 글로벌 상태 정의
 * interface AppState {
 *   user: { name: string; email: string };
 *   settings: { theme: 'light' | 'dark'; notifications: boolean };
 *   cart: { items: any[]; total: number };
 * }
 *
 * // 컴포넌트 A - 사용자 정보만 구독
 * function UserProfile() {
 *   const state = useGlobalFormaState<AppState>({ stateId: 'app-state' });
 *   const userName = state.useValue('user.name');     // name 변경시만 리렌더
 *   const userEmail = state.useValue('user.email');   // email 변경시만 리렌더
 *
 *   return (
 *     <div>
 *       <h1>{userName}</h1>
 *       <p>{userEmail}</p>
 *       <button onClick={() => state.setValue('user.name', 'New Name')}>
 *         Update Name
 *       </button>
 *     </div>
 *   );
 * }
 *
 * // 컴포넌트 B - 설정만 구독
 * function Settings() {
 *   const state = useGlobalFormaState<AppState>({ stateId: 'app-state' });
 *   const theme = state.useValue('settings.theme');              // theme 변경시만 리렌더
 *   const notifications = state.useValue('settings.notifications'); // notifications 변경시만 리렌더
 *
 *   return (
 *     <div>
 *       <select
 *         value={theme}
 *         onChange={(e) => state.setValue('settings.theme', e.target.value)}
 *       >
 *         <option value="light">Light</option>
 *         <option value="dark">Dark</option>
 *       </select>
 *     </div>
 *   );
 * }
 *
 * // 컴포넌트 C - 장바구니만 구독
 * function Cart() {
 *   const state = useGlobalFormaState<AppState>({ stateId: 'app-state' });
 *   const cartItems = state.useValue('cart.items');    // cart.items 변경시만 리렌더
 *   const cartTotal = state.useValue('cart.total');    // cart.total 변경시만 리렌더
 *
 *   return (
 *     <div>
 *       <h2>Cart ({cartItems.length} items)</h2>
 *       <p>Total: ${cartTotal}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGlobalFormaState<T extends Record<string, any>>({
    stateId,
    autoCleanup = true,
}: UseGlobalFormaStateProps<T>): UseGlobalFormaStateReturn<T> {
    const { getOrCreateStore } = useContext(GlobalFormaContext);

    // 글로벌 스토어 가져오기 또는 생성 / Get or create global store
    const store = getOrCreateStore<T>(stateId);

    // useFormaState에 외부 스토어 전달 (빈 초기값으로) / Pass external store to useFormaState (with empty initial values)
    const formaState = useFormaState<T>({} as T, {
        _externalStore: store,
    });

    return {
        ...formaState,
        stateId, // 글로벌 FormaState ID 추가 제공 / Provide additional global FormaState ID
        _store: store, // 글로벌 스토어 직접 접근용 (이미 formaState에 있지만 명시적으로 재정의) / Direct access to global store
    } as UseGlobalFormaStateReturn<T>;
}
