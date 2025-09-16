/**
 * GlobalFormaContext.tsx
 *
 * Forma - 글로벌 Forma 상태 관리 컨텍스트 | Global Forma state management context
 * 여러 컴포넌트 간 폼 상태 공유를 위한 React Context | React Context for sharing form state across multiple components
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

import { createContext, useRef, ReactNode } from "react";
import { FieldStore } from "../core/FieldStore";
import { GlobalFormaContextType } from "../types/globalForm";

/**
 * 글로벌 폼 상태 관리를 위한 React Context | React Context for global form state management
 */
export const GlobalFormaContext = createContext<GlobalFormaContextType>({
    getOrCreateStore: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    registerStore: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    unregisterStore: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    clearStores: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
});

/**
 * 글로벌 Forma 상태 관리 Provider | Global Forma state management provider
 *
 * 애플리케이션 최상단에 배치하여 전역 Forma 상태 관리를 활성화합니다. | Place at the top of your application to enable global Forma state management.
 * 각 stateId/formId별로 독립적인 FieldStore 인스턴스를 관리합니다. | Manages independent FieldStore instances for each stateId/formId.
 *
 * @param props Provider props
 * @returns 글로벌 폼 컨텍스트 Provider
 *
 * @example
 * ```typescript
 * // App.tsx
 * import { GlobalFormaProvider } from '@/forma';
 *
 * function App() {
 *   return (
 *     <GlobalFormaProvider>
 *       <Router>
 *         <Routes>
 *           <Route path="/" element={<HomePage />} />
 *           <Route path="/customer" element={<CustomerPage />} />
 *         </Routes>
 *       </Router>
 *     </GlobalFormaProvider>
 *   );
 * }
 * ```
 */
export function GlobalFormaProvider({ children }: { children: ReactNode }) {
    // formId별 FieldStore 인스턴스들을 관리하는 Map | Map managing FieldStore instances by formId
    const storesRef = useRef<Map<string, FieldStore<any>>>(new Map());

    /**
     * formId에 해당하는 FieldStore를 가져오거나 새로 생성합니다. | Get or create FieldStore for the given formId.
     *
     * @param formId 폼 식별자 | Form identifier
     * @returns FieldStore 인스턴스 | FieldStore instance
     */
    const getOrCreateStore = <T extends Record<string, any>>(
        formId: string
    ): FieldStore<T> => {
        const stores = storesRef.current;

        if (!stores.has(formId)) {
            // 새로운 스토어를 빈 객체로 생성 | Create new store with empty object
            const newStore = new FieldStore<T>({} as T);
            stores.set(formId, newStore);
            return newStore;
        }

        return stores.get(formId) as FieldStore<T>;
    };

    /**
     * 기존 FieldStore를 글로벌 폼에 등록합니다. | Register existing FieldStore to global form.
     *
     * @param formId 폼 식별자 | Form identifier
     * @param store 등록할 FieldStore 인스턴스 | FieldStore instance to register
     */
    const registerStore = <T extends Record<string, any>>(
        formId: string,
        store: FieldStore<T>
    ): void => {
        const stores = storesRef.current;
        stores.set(formId, store);
    };

    /**
     * 글로벌 스토어에서 특정 formId의 FieldStore를 제거합니다. | Remove specific FieldStore from global store.
     *
     * @param formId 제거할 폼 식별자 | Form identifier to remove
     * @returns 제거 성공 여부 | Whether removal was successful
     */
    const unregisterStore = (formId: string): boolean => {
        const stores = storesRef.current;
        return stores.delete(formId);
    };

    /**
     * 모든 글로벌 스토어를 제거합니다. | Clear all global stores.
     * 메모리 정리나 애플리케이션 리셋 시 사용합니다. | Use for memory cleanup or application reset.
     */
    const clearStores = (): void => {
        const stores = storesRef.current;
        stores.clear();
    };

    const contextValue: GlobalFormaContextType = {
        getOrCreateStore,
        registerStore,
        unregisterStore,
        clearStores,
    };

    return (
        <GlobalFormaContext.Provider value={contextValue}>
            {children}
        </GlobalFormaContext.Provider>
    );
}
