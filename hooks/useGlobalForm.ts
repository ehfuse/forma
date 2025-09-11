/**
 * useGlobalForm.ts
 *
 * Forma - 글로벌 폼 상태 관리 훅 / Global form state management hook
 * 여러 컴포넌트 간 폼 상태 공유를 위한 확장 훅
 * Extended hook for sharing form state across multiple components
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
import { useForm } from "./useForm";
import { UseGlobalFormProps, UseGlobalFormReturn } from "../types/globalForm";
import { GlobalFormContext } from "../contexts/GlobalFormContext";

/**
 * 글로벌 폼 상태 관리 훅 / Global form state management hook
 *
 * 여러 컴포넌트 간 폼 데이터를 공유하기 위한 훅입니다
 * Hook for sharing form data across multiple components
 *
 * 데이터 공유에만 집중하며, 초기값 설정과 제출/검증 로직은 각 컴포넌트에서 직접 처리합니다
 * Focuses only on data sharing; initial values and submission/validation logic handled by individual components
 *
 * @template T 폼 데이터의 타입 / Form data type
 * @param props 글로벌 폼 설정 옵션 / Global form configuration options
 * @returns 글로벌 폼 관리 API 객체 / Global form management API object
 */
export function useGlobalForm<T extends Record<string, any>>({
    formId,
}: UseGlobalFormProps<T>): UseGlobalFormReturn<T> {
    const { getOrCreateStore } = useContext(GlobalFormContext);

    // 글로벌 스토어 가져오기 또는 생성 / Get or create global store
    const store = getOrCreateStore<T>(formId);

    // useForm에 외부 스토어 전달 (빈 초기값으로) / Pass external store to useForm (with empty initial values)
    const form = useForm<T>({
        initialValues: {} as T,
        _externalStore: store,
    });

    return {
        ...form,
        formId, // 글로벌 폼 ID 추가 제공 / Provide additional global form ID
        _store: store, // 글로벌 스토어 직접 접근용 / Direct access to global store
    } as UseGlobalFormReturn<T>;
}
