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

import {
    useState,
    useEffect,
    useCallback,
    useRef,
    useMemo,
    useContext,
} from "react";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";
import { UseModalProps, UseModalReturn } from "../types/modal";

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
 * Handles modal state and back navigation.
 * When a modal is open and user presses back button,
 * the modal closes instead of navigating back.
 *
 * @param props - initialOpen: 초기 열림 상태, onClose: 닫힐 때 콜백
 * @returns isOpen, open, close, toggle, modalId
 *
 * @example
 * ```tsx
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
 * ```
 */
export function useModal({
    initialOpen = false,
    onClose: externalOnClose,
}: UseModalProps = {}): UseModalReturn {
    // 고유 ID 생성
    const modalId = useMemo(() => generateModalId(), []);

    // 모달 상태 관리
    const [isOpen, setIsOpen] = useState(initialOpen);

    const { appendOpenModal, removeOpenModal } = useContext(GlobalFormaContext);

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
            setIsOpen(true);
            if (!isRegisteredRef.current) {
                appendOpenModal(modalId);
                isRegisteredRef.current = true;
            }
        }
    }, [isOpen, modalId, appendOpenModal]);

    // 모달 닫기
    const close = useCallback(() => {
        if (isOpen) {
            // 1. 뒤로 가기로 모달 닫음
            window.history.back();

            // 여기서 setIsOpen(false)를 호출하지 않아도 됨
            // popstate 이벤트가 발생하면 FormContext의 handlePopState가 처리하여
            // closeLastModal -> modal:close 이벤트 발생 -> handleCloseEvent 에서 setIsOpen(false) 호출
        }
    }, [isOpen]);

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
            setIsOpen(false);

            // 모달 제거 - 이 부분이 누락되어 있었습니다!
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
    }, [modalId, removeOpenModal]);

    return {
        isOpen,
        open,
        close,
        toggle,
        modalId,
    };
}
