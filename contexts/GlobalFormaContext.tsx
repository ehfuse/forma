/**
 * GlobalFormaContext.tsx
 *
 * Forma - 글로벌 Forma 상태 관리 컨텍스트 | Global Forma state management context
 * 여러 컴포넌트 간 폼 상태 공유를 위한 React Context | React Context for sharing form state across multiple components
 *
 * @license MIT License
 * @copyright 2025 KIM YOUNG JIN (ehfuse@gmail.com)
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

import {
    createContext,
    useRef,
    ReactNode,
    useState,
    useEffect,
    useCallback,
} from "react";
import { FieldStore } from "../core/FieldStore";
import { GlobalFormaContextType } from "../types/globalForm";

/**
 * 글로벌 폼 상태 관리를 위한 React Context | React Context for global form state management
 */
export const GlobalFormaContext = createContext<GlobalFormaContextType>({
    // FieldStore 관련
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
    incrementRef: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    decrementRef: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    validateAndStoreAutoCleanupSetting: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    // 모달 스택 관리
    appendOpenModal: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    removeOpenModal: () => {
        throw new Error(
            "GlobalFormaContext must be used within GlobalFormaProvider"
        );
    },
    closeLastModal: () => {
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
    // formId별 참조 카운트를 관리하는 Map | Map managing reference count by formId
    const refCountsRef = useRef<Map<string, number>>(new Map());
    // formId별 autoCleanup 컴포넌트 참조 카운트를 관리하는 Map | Map managing autoCleanup component reference count by formId
    const autoCleanupRefCountsRef = useRef<Map<string, number>>(new Map());
    // formId별 autoCleanup 설정을 추적하는 Map | Map tracking autoCleanup settings by formId
    const autoCleanupSettingsRef = useRef<Map<string, boolean>>(new Map());

    // ========== 모달 스택 관리 상태 ==========
    const [openModalIds, setOpenModalIds] = useState<string[]>([]);
    const openModalIdsRef = useRef<string[]>([]);
    const modalTrackingRef = useRef<string[]>([]);

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
     * autoCleanup 설정의 일관성을 검증하고 설정을 저장합니다. | Validate and store autoCleanup setting consistency.
     *
     * @param formId 폼 식별자 | Form identifier
     * @param autoCleanup 현재 autoCleanup 설정 | Current autoCleanup setting
     */
    const validateAndStoreAutoCleanupSetting = (
        formId: string,
        autoCleanup: boolean
    ): void => {
        const autoCleanupSettings = autoCleanupSettingsRef.current;
        const existingSetting = autoCleanupSettings.get(formId);

        if (existingSetting !== undefined && existingSetting !== autoCleanup) {
            console.warn(
                `⚠️ Conflicting autoCleanup settings for stateId "${formId}": ` +
                    `existing=${existingSetting}, new=${autoCleanup}. ` +
                    `All components using the same stateId should have consistent autoCleanup settings.`
            );
        }

        autoCleanupSettings.set(formId, autoCleanup);
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
     * 참조 카운트를 무시하고 강제로 제거합니다. | Force remove ignoring reference count.
     *
     * @param formId 제거할 폼 식별자 | Form identifier to remove
     * @returns 제거 성공 여부 | Whether removal was successful
     */
    const unregisterStore = (formId: string): boolean => {
        const stores = storesRef.current;
        const refCounts = refCountsRef.current;
        const autoCleanupRefCounts = autoCleanupRefCountsRef.current;
        const autoCleanupSettings = autoCleanupSettingsRef.current;
        const store = stores.get(formId);

        // 스토어가 존재하면 리소스 정리 후 제거 | Clean up resources before removal if store exists
        if (store) {
            store.destroy();
            stores.delete(formId);
            refCounts.delete(formId); // 참조 카운트도 함께 제거 | Remove reference count as well
            autoCleanupRefCounts.delete(formId); // autoCleanup 참조 카운트도 제거 | Remove autoCleanup reference count as well
            autoCleanupSettings.delete(formId); // autoCleanup 설정도 제거 | Remove autoCleanup settings as well
            return true;
        }

        return false;
    };

    /**
     * 모든 글로벌 스토어를 제거합니다. | Clear all global stores.
     * 메모리 정리나 애플리케이션 리셋 시 사용합니다. | Use for memory cleanup or application reset.
     */
    const clearStores = (): void => {
        const stores = storesRef.current;
        const refCounts = refCountsRef.current;
        const autoCleanupRefCounts = autoCleanupRefCountsRef.current;
        const autoCleanupSettings = autoCleanupSettingsRef.current;

        // 모든 스토어의 리소스 정리 후 제거 | Clean up all store resources before clearing
        stores.forEach((store) => {
            store.destroy();
        });

        stores.clear();
        refCounts.clear();
        autoCleanupRefCounts.clear();
        autoCleanupSettings.clear();
    };

    /**
     * 스토어 사용 참조를 증가시킵니다 | Increment store usage reference
     *
     * @param formId 폼 식별자 | Form identifier
     * @param autoCleanup autoCleanup 설정 | autoCleanup setting
     */
    const incrementRef = (formId: string, autoCleanup: boolean): void => {
        const refCounts = refCountsRef.current;
        const autoCleanupRefCounts = autoCleanupRefCountsRef.current;

        // 전체 참조 카운트 증가 (모든 컴포넌트)
        const currentCount = refCounts.get(formId) || 0;
        const newCount = currentCount + 1;
        refCounts.set(formId, newCount);

        // autoCleanup 참조 카운트 증가 (autoCleanup: true인 컴포넌트만)
        if (autoCleanup) {
            const currentAutoCleanupCount =
                autoCleanupRefCounts.get(formId) || 0;
            const newAutoCleanupCount = currentAutoCleanupCount + 1;
            autoCleanupRefCounts.set(formId, newAutoCleanupCount);
        }
    };

    /**
     * 스토어 사용 참조를 감소시키고, autoCleanup 참조가 0이 되면 자동 정리합니다 | Decrement store usage reference and auto cleanup when autoCleanup refs reach 0
     *
     * @param formId 폼 식별자 | Form identifier
     * @param autoCleanup autoCleanup 설정 | autoCleanup setting
     */
    const decrementRef = (formId: string, autoCleanup: boolean): void => {
        const refCounts = refCountsRef.current;
        const autoCleanupRefCounts = autoCleanupRefCountsRef.current;
        const stores = storesRef.current;

        // 전체 참조 카운트가 없는 경우 (이미 수동으로 제거됨) 무시 | Ignore if no reference count (already manually removed)
        if (!refCounts.has(formId)) {
            return;
        }

        const currentCount = refCounts.get(formId) || 0;
        const currentAutoCleanupCount = autoCleanupRefCounts.get(formId) || 0;

        // 전체 참조 카운트 감소
        const newCount = Math.max(0, currentCount - 1);
        refCounts.set(formId, newCount);

        if (autoCleanup) {
            // autoCleanup 참조 카운트 감소
            const newAutoCleanupCount = Math.max(
                0,
                currentAutoCleanupCount - 1
            );
            autoCleanupRefCounts.set(formId, newAutoCleanupCount);

            // autoCleanup 참조가 0이 되면 스토어 정리 (autoCleanup: false 컴포넌트가 있어도)
            if (newAutoCleanupCount === 0) {
                const store = stores.get(formId);
                if (store) {
                    store.destroy();
                    stores.delete(formId);
                    refCounts.delete(formId);
                    autoCleanupRefCounts.delete(formId);
                    autoCleanupSettingsRef.current.delete(formId);
                }
            }
        }

        // 전체 참조가 0이 되면 카운트 정리 (스토어는 이미 정리되었거나 영구 참조만 남음)
        if (newCount === 0) {
            refCounts.delete(formId);
            if (autoCleanupRefCounts.get(formId) === 0) {
                autoCleanupRefCounts.delete(formId);
            }
        }
    };

    // ========== 모달 및 네비게이션 관련 함수 ==========

    /**
     * 모달 등록
     */
    const appendOpenModal = useCallback((modalId: string) => {
        if (modalTrackingRef.current.includes(modalId)) return;
        modalTrackingRef.current.push(modalId);

        setOpenModalIds((prevIds) => {
            const newOpenIds = [...prevIds, modalId];
            return newOpenIds;
        });

        window.history.pushState(
            { modalOpen: modalId },
            "",
            window.location.href
        );
    }, []);

    /**
     * 모달 등록 해제
     */
    const removeOpenModal = useCallback((modalId: string) => {
        setOpenModalIds((prevIds) => {
            if (prevIds.includes(modalId)) {
                const newOpenIds = prevIds.filter((id) => id !== modalId);
                modalTrackingRef.current = modalTrackingRef.current.filter(
                    (id) => id !== modalId
                );
                return newOpenIds;
            }
            return prevIds;
        });
    }, []);

    /**
     * 마지막으로 열린 모달 닫기
     */
    const closeLastModal = useCallback((): boolean => {
        if (openModalIds.length === 0) return false;

        const lastModalId = openModalIds[openModalIds.length - 1];
        window.dispatchEvent(new CustomEvent(`modal:close:${lastModalId}`));

        return true;
    }, [openModalIds]);

    // 모달 ID 추적을 위해 ref 업데이트
    useEffect(() => {
        openModalIdsRef.current = openModalIds;
    }, [openModalIds]);

    // popstate 이벤트 핸들러 (뒤로가기 시 모달 닫기)
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            // 열린 모달이 있으면 모달을 닫기
            if (openModalIdsRef.current.length > 0) {
                e.preventDefault();
                closeLastModal();
                return;
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [closeLastModal]);

    const contextValue: GlobalFormaContextType = {
        // FieldStore 관련
        getOrCreateStore,
        registerStore,
        unregisterStore,
        clearStores,
        incrementRef,
        decrementRef,
        validateAndStoreAutoCleanupSetting,
        // 모달 스택 관리
        appendOpenModal,
        removeOpenModal,
        closeLastModal,
    };

    return (
        <GlobalFormaContext.Provider value={contextValue}>
            {children}
        </GlobalFormaContext.Provider>
    );
}
