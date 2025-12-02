/**
 * index.ts
 *
 * Forma - Advanced React form state management library
 * Main entry point and API exports
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

// ===== Core Hooks =====
export { useForm } from "./src/hooks/useForm";
export { useGlobalForm } from "./src/hooks/useGlobalForm";
export { useRegisterGlobalForm } from "./src/hooks/useRegisterGlobalForm";
export { useUnregisterGlobalForm } from "./src/hooks/useUnregisterGlobalForm";
export { useFormaState, useFieldSubscription } from "./src/hooks/useFormaState";
export { useGlobalFormaState } from "./src/hooks/useGlobalFormaState";
export { useRegisterGlobalFormaState } from "./src/hooks/useRegisterGlobalFormaState";
export { useUnregisterGlobalFormaState } from "./src/hooks/useUnregisterGlobalFormaState";
export { useModal } from "./src/hooks/useModal";
export { useBreakpoint } from "./src/hooks/useBreakpoint";

// ===== Context & Providers =====
export {
    GlobalFormaContext,
    GlobalFormaProvider,
} from "./src/contexts/GlobalFormaContext";

// ===== Core Classes =====
export { FieldStore } from "./src/core/FieldStore";

// ===== Utility Functions =====
export { getNestedValue, setNestedValue } from "./src/utils/dotNotation";
export {
    isDevelopment,
    devWarn,
    devError,
    devLog,
} from "./src/utils/environment";

// ===== TypeScript Types =====
// Form Types
export type {
    UseFormProps,
    UseFormReturn,
    FormValidationResult,
    FormChangeEvent,
    ActionContext,
    Actions,
} from "./src/types/form";

// Field State Types
export type {
    UseFormaStateOptions,
    UseFormaStateReturn,
} from "./src/hooks/useFormaState";

// Global Forma Types
export type {
    UseGlobalFormProps,
    UseGlobalFormReturn,
    UseGlobalFormaStateProps,
    UseGlobalFormaStateReturn,
    UseRegisterGlobalFormProps,
    UseRegisterGlobalFormReturn,
    UseRegisterGlobalFormaStateProps,
    UseRegisterGlobalFormaStateReturn,
    UseUnregisterGlobalFormReturn,
    UseUnregisterGlobalFormaStateReturn,
    GlobalFormaProviderProps,
    GlobalFormaContextType,
    GlobalFormStoreMap,
    GlobalFormMetadata,
    GlobalFormEvent,
    GlobalFormEventListener,
    GlobalFormConfig,
    GlobalFormMiddleware,
    ExtendedGlobalFormaProviderProps,
} from "./src/types/globalForm";

// Breakpoint Types
export type {
    BreakpointState,
    UseBreakpointReturn,
} from "./src/types/breakpoint";

/**
 * Forma library version
 */
export const FORMA_VERSION = "1.0.0";

/**
 * Forma library metadata
 */
export const FORMA_METADATA = {
    name: "Forma",
    version: FORMA_VERSION,
    description: "Advanced React form state management library",
    author: "KIM YOUNG JIN (Kim Young Jin)",
    email: "ehfuse@gmail.com",
    license: "MIT",
    features: [
        "Optimized re-rendering with individual field subscriptions",
        "Nested object handling with dot notation support",
        "Full compatibility with MUI components",
        "Global form state management",
        "Complete TypeScript support",
        "Leveraging latest React 19 features",
    ],
} as const;
