/**
 * modal.ts
 *
 * 모달 관련 타입 정의 | Modal-related type definitions
 *
 * @license MIT License
 * @copyright 2025 KIM YOUNG JIN (Kim Young Jin)
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 */

/**
 * useModal 훅의 속성 인터페이스 | useModal hook properties interface
 */
export interface UseModalProps {
    initialOpen?: boolean;
    onClose?: () => void;
}

/**
 * useModal 훅의 반환 타입 | useModal hook return type
 */
export interface UseModalReturn {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
    modalId: string;
}
