/**
 * useModal.ts
 *
 * 모달 상태 관리 및 뒤로가기 처리를 위한 React Hook
 * Modal state management and back navigation handling React Hook
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

import { useEffect, useCallback, useRef, useMemo, useContext } from "react";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";
import { UseModalProps, UseModalReturn } from "../types/modal";
import { useFieldSubscription } from "./useFormaState";

/**
 * 모달 고유 ID 생성 함수
 * Generate unique modal ID
 */
function generateModalId(): string {
    return `modal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * useModal - 모달 상태 관리 및 뒤로가기 처리 훅
 *
 * 모바일 환경에서 모달이 열려있을 때 뒤로가기를 누르면
 * 페이지가 뒤로 가는 것이 아니라 모달이 닫히도록 처리합니다.
 *
 * 같은 modalId를 사용하면 여러 컴포넌트에서 같은 모달 상태를 공유합니다.
 *
 * Handles modal state and back navigation.
 * When a modal is open and user presses back button,
 * the modal closes instead of navigating back.
 *
 * Using the same modalId shares modal state across multiple components.
 *
 * @param props - modalId: 모달 ID (같은 ID면 공유), initialOpen: 초기 열림 상태, onClose: 닫힐 때 콜백
 * @returns isOpen, open, close, toggle, modalId
 *
 * @example
 * ```tsx
 * // 독립적인 모달 (modalId 자동 생성)
 * function MyComponent() {
 *   const modal = useModal({
 *     onClose: () => console.log('Modal closed')
 *   });
 *
 *   return (
 *     <>
 *       <button onClick={modal.open}>Open Modal</button>
 *       <Dialog open={modal.isOpen} onClose={modal.close}>
 *         <DialogTitle>My Modal</DialogTitle>
 *         <DialogContent>Content here</DialogContent>
 *       </Dialog>
 *     </>
 *   );
 * }
 *
 * // 공유 모달 (같은 modalId 사용)
 * function ComponentA() {
 *   const modal = useModal({ modalId: 'shared-modal' });
 *   return <button onClick={modal.open}>Open from A</button>;
 * }
 *
 * function ComponentB() {
 *   const modal = useModal({ modalId: 'shared-modal' });
 *   return (
 *     <Dialog open={modal.isOpen} onClose={modal.close}>
 *       <DialogTitle>Shared Modal</DialogTitle>
 *     </Dialog>
 *   );
 * }
 * ```
 */
export function useModal({
    modalId: providedModalId,
    initialOpen = false,
    onClose: externalOnClose,
}: UseModalProps = {}): UseModalReturn {
    // modalId가 제공되면 사용, 아니면 고유 ID 생성
    const modalId = useMemo(
        () => providedModalId || generateModalId(),
        [providedModalId]
    );

    const context = useContext(GlobalFormaContext);

    // Context가 제대로 설정되지 않았을 때 명확한 에러 표시 (기존 useGlobalFormaState 경유와 동일한 안내)
    // Show clear error when Context is not properly configured
    if (!context || !context.getOrCreateStore) {
        throw new Error(
            `
🚨 GlobalFormaProvider 설정 오류 | Configuration Error

GlobalFormaProvider가 App.tsx에 설정되지 않았습니다!
GlobalFormaProvider is not configured in App.tsx!

해결 방법 | Solution:
1. App.tsx 파일에서 GlobalFormaProvider로 컴포넌트를 감싸주세요.
2. import { GlobalFormaProvider } from '@/forma';
3. <GlobalFormaProvider><YourApp /></GlobalFormaProvider>

Details: GlobalFormaContext must be used within GlobalFormaProvider (modalId: ${modalId})
        `.trim()
        );
    }

    const {
        appendOpenModal,
        removeOpenModal,
        getOrCreateStore,
        incrementRef,
        decrementRef,
        validateAndStoreAutoCleanupSetting,
    } = context;

    // 모달 상태용 글로벌 스토어 ID (같은 modalId 는 같은 스토어 공유) / global store id for the modal state
    const stateId = `__modal_${modalId}__`;

    // autoCleanup 설정 일관성 검증 (기존과 동일하게 항상 true) / autoCleanup consistency (always true, as before)
    validateAndStoreAutoCleanupSetting(stateId, true);

    // 모달 열림 상태 전용 글로벌 스토어 — 전체 useGlobalFormaState 표면 대신
    // 경량 개별 필드 구독만 사용한다 (모달당 렌더 비용 대폭 절감)
    // Global store for the open state — a lightweight single-field subscription
    // instead of the full useGlobalFormaState surface
    const store = getOrCreateStore<{ isOpen: boolean }>(stateId);

    // 초기 열림 상태 시딩 — 컴포넌트당 1회, 스토어가 비어있을 때만 (공유 시 첫 컴포넌트만 수행)
    // Seed the initial open state — once per component, only when the store is empty
    const seededRef = useRef(false);
    if (!seededRef.current) {
        seededRef.current = true;
        if (Object.keys(store.getValues()).length === 0) {
            store.setInitialValues({ isOpen: initialOpen });
            store.setValue("isOpen", initialOpen);
        }
    }

    // isOpen 경량 구독 (isOpen 변경 시에만 리렌더) / lightweight isOpen subscription
    const isOpen = useFieldSubscription<boolean>(store, "isOpen");

    // 참조 카운팅을 통한 자동 정리 관리 (마운트 시 한 번만 실행)
    // Auto cleanup management through reference counting (once on mount)
    useEffect(() => {
        incrementRef(stateId, true);
        return () => {
            decrementRef(stateId, true);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 마운트 시 한 번만 실행 (기존 useGlobalFormaState 와 동일한 시맨틱)

    // 이미 등록된 모달인지 추적
    const isRegisteredRef = useRef(false);

    // 외부 onClose 함수 추적
    const onCloseRef = useRef(externalOnClose);
    useEffect(() => {
        onCloseRef.current = externalOnClose;
    }, [externalOnClose]);

    // 모달 열기
    const open = useCallback(() => {
        if (!isOpen) {
            store.setValue("isOpen", true);
            if (!isRegisteredRef.current) {
                appendOpenModal(modalId);
                isRegisteredRef.current = true;
            }
        }
    }, [isOpen, modalId, appendOpenModal, store]);

    // 모달 닫기
    const close = useCallback(() => {
        if (isOpen) {
            // 모달이 등록되어 있으면 history.back()으로 처리
            if (isRegisteredRef.current) {
                window.history.back();
                // popstate 이벤트가 발생하면 FormContext의 handlePopState가 처리하여
                // closeLastModal -> modal:close 이벤트 발생 -> handleCloseEvent 에서 state.setValue("isOpen", false) 호출
            } else {
                // 등록되지 않은 경우 (open()이 호출되지 않고 직접 닫히는 경우) 직접 닫기
                store.setValue("isOpen", false);
                if (onCloseRef.current) {
                    onCloseRef.current();
                }
            }
        }
    }, [isOpen, store]);

    // 모달 토글
    const toggle = useCallback(() => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    }, [isOpen, open, close]);

    // 컴포넌트 언마운트 시에만 정리
    useEffect(() => {
        return () => {
            if (isRegisteredRef.current) {
                removeOpenModal(modalId);
                isRegisteredRef.current = false;
            }
        };
    }, [modalId, removeOpenModal]);

    // 모달 닫기 이벤트 리스너 등록
    useEffect(() => {
        // 외부에서 모달 닫기 요청을 처리하는 이벤트 리스너
        const handleCloseEvent = () => {
            // 이벤트가 수신될때는 popstate가 발생한 것이므로 히스토리는 이미 삭제된 상태라서 닫기만 실행
            store.setValue("isOpen", false);

            // 모달 제거
            if (isRegisteredRef.current) {
                removeOpenModal(modalId);
                isRegisteredRef.current = false;
            }

            // 외부 onClose 콜백 호출
            if (onCloseRef.current) {
                onCloseRef.current();
            }
        };

        // 모달 닫기 이벤트 리스너 등록
        window.addEventListener(`modal:close:${modalId}`, handleCloseEvent);

        return () => {
            window.removeEventListener(
                `modal:close:${modalId}`,
                handleCloseEvent
            );
        };
    }, [modalId, removeOpenModal, store]);

    return {
        isOpen,
        open,
        close,
        toggle,
        modalId,
    };
}
