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
    /**
     * 모달의 고유 ID. 같은 ID를 사용하면 같은 모달 인스턴스를 공유합니다.
     * Modal unique ID. Using the same ID shares the same modal instance.
     */
    modalId?: string;

    /**
     * 초기 열림 상태 (기본값: false)
     * Initial open state (default: false)
     */
    initialOpen?: boolean;

    /**
     * 모달이 닫힐 때 호출되는 콜백
     * Callback called when modal closes
     */
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
