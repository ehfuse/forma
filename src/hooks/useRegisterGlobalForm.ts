/**
 * useRegisterGlobalForm.ts
 *
 * Forma - 기존 useForm을 글로벌 폼으로 등록하는 훅 | Hook to register existing useForm as global form
 * 기존에 만든 로컬 폼을 글로벌 상태로 공유할 수 있게 해주는 유틸리티
 * Utility to enable sharing existing local forms as global state
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
import { UseFormReturn } from "../types/form";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";

/**
 * 기존 useForm을 글로벌 폼으로 등록하는 훅 | Hook to register existing useForm as global form
 *
 * 이미 만들어진 로컬 폼을 글로벌 상태로 공유하고 싶을 때 사용합니다.
 * Use this when you want to share an already created local form as global state.
 *
 * @template T 폼 데이터의 타입 | Form data type
 * @param formId 글로벌 폼 식별자 | Global form identifier
 * @param form 등록할 useForm 인스턴스 | useForm instance to register
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const form = useForm({ initialValues: { name: '', email: '' } });
 *
 *   // 로컬 폼을 글로벌로 등록
 *   useRegisterGlobalForm('my-form-id', form);
 *
 *   // 이제 다른 컴포넌트에서 useGlobalForm({ formId: 'my-form-id' })로 접근 가능
 *   return <div>...</div>;
 * }
 * ```
 */
export function useRegisterGlobalForm<T extends Record<string, any>>(
    formId: string,
    form: UseFormReturn<T>
): void {
    const { registerStore } = useContext(GlobalFormaContext);

    useEffect(() => {
        // useForm의 내부 store를 글로벌에 등록 | Register useForm's internal store globally
        if (form._store) {
            registerStore(formId, form._store);
        }
    }, [formId, form._store, registerStore]);
}
