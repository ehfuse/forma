/**
 * types/index.ts
 *
 * Forma - 타입 정의들 내보내기
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

// 기본 폼 타입들
export type {
    FormChangeEvent,
    DatePickerChangeHandler,
    UseFormProps,
    UseFormReturn,
    FormState,
    FormValidationResult,
} from "./form";

// 전역 Forma 타입들
export type {
    GlobalFormaProviderProps,
    UseGlobalFormProps,
    UseRegisterGlobalFormProps,
    UseRegisterGlobalFormReturn,
    UseRegisterGlobalFormaStateProps,
    UseRegisterGlobalFormaStateReturn,
    UseUnregisterGlobalFormReturn,
    UseUnregisterGlobalFormaStateReturn,
    GlobalFormStoreMap,
    GlobalFormMetadata,
    GlobalFormLifecycleEvent,
    GlobalFormLifecycleHandler,
    GlobalFormConfig,
    GlobalFormStats,
    GlobalFormExtensions,
    GlobalFormIdentifier,
    FormType,
    FormUsageTracker,
    GlobalFormWarning,
    GlobalFormDebugInfo,
    GlobalFormSnapshot,
    GlobalFormDevTools,
    GlobalFormEvent,
    GlobalFormEventListener,
    GlobalFormMiddleware,
    ExtendedGlobalFormaProviderProps,
} from "./globalForm";

// 에러 클래스
export { GlobalFormError } from "./globalForm";

// 모달 관련 타입들
export type { UseModalProps, UseModalReturn } from "./modal";
