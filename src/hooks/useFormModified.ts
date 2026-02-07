/**
 * useFormModified.ts
 *
 * Forma - subscribe to modified status only where needed
 *
 * @license MIT License
 * @copyright 2025 KIM YOUNG JIN (Kim Young Jin)
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 */

import { useCallback, useSyncExternalStore } from "react";
import { FieldStore } from "../core/FieldStore";
import { UseFormReturn } from "../types/form";

export type FormModifiedSource<T extends Record<string, any>> =
    | FieldStore<T>
    | Pick<UseFormReturn<T>, "_store">;

export function useFormModified<T extends Record<string, any>>(
    source: FormModifiedSource<T>,
): boolean {
    const store = "_store" in source ? source._store : source;

    return useSyncExternalStore(
        useCallback(
            (onStoreChange) => store.subscribeGlobal(onStoreChange),
            [store],
        ),
        useCallback(() => store.isModified(), [store]),
        useCallback(() => store.isModified(), [store]),
    );
}
