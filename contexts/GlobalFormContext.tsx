/**
 * GlobalFormContext.tsx
 *
 * Forma - 글로벌 폼 상태 관리 컨텍스트 | Global form state management context
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
import { GlobalFormContextType } from "../types/globalForm";

/**
 * 글로벌 폼 상태 관리를 위한 React Context | React Context for global form state management
 */
export const GlobalFormContext = createContext<GlobalFormContextType>({
    getOrCreateStore: () => {
        throw new Error(
            "GlobalFormContext must be used within GlobalFormProvider"
        );
    },
    registerStore: () => {
        throw new Error(
            "GlobalFormContext must be used within GlobalFormProvider"
        );
    },
});

/**
 * 글로벌 폼 상태 관리 Provider | Global form state management provider
 *
 * 애플리케이션 최상단에 배치하여 전역 폼 상태 관리를 활성화합니다. | Place at the top of your application to enable global form state management.
 * 각 formId별로 독립적인 FieldStore 인스턴스를 관리합니다. | Manages independent FieldStore instances for each formId.
 *
 * @param props Provider props
 * @returns 글로벌 폼 컨텍스트 Provider
 *
 * @example
 * ```typescript
 * // App.tsx
 * import { GlobalFormProvider } from '@/forma';
 *
 * function App() {
 *   return (
 *     <GlobalFormProvider>
 *       <Router>
 *         <Routes>
 *           <Route path="/" element={<HomePage />} />
 *           <Route path="/customer" element={<CustomerPage />} />
 *         </Routes>
 *       </Router>
 *     </GlobalFormProvider>
 *   );
 * }
 * ```
 */
export function GlobalFormProvider({ children }: { children: ReactNode }) {
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

    const contextValue: GlobalFormContextType = {
        getOrCreateStore,
        registerStore,
    };

    return (
        <GlobalFormContext.Provider value={contextValue}>
            {children}
        </GlobalFormContext.Provider>
    );
}
