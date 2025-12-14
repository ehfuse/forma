/**
 * persist.ts
 *
 * Forma - localStorage/sessionStorage 영속성 유틸리티
 * Persistence utilities for localStorage/sessionStorage
 *
 * @license MIT License
 * @copyright 2025 KIM YOUNG JIN (Kim Young Jin)
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 */

import { devWarn } from "./environment";

/**
 * Persist 옵션 타입 | Persist options type
 */
export interface PersistOptions {
    /** localStorage 키 | localStorage key */
    key: string;
    /** 저장 디바운스 시간 (ms, 기본값: 300) | Debounce time for saving (ms, default: 300) */
    debounce?: number;
    /** 저장에서 제외할 필드 | Fields to exclude from saving */
    exclude?: string[];
    /** 스토리지 타입 (기본값: 'localStorage') | Storage type (default: 'localStorage') */
    storage?: "localStorage" | "sessionStorage";
}

/**
 * Persist 설정 타입 (string 또는 옵션 객체)
 * Persist configuration type (string or options object)
 */
export type PersistConfig = string | PersistOptions;

/**
 * 저장된 데이터 구조 | Stored data structure
 */
interface PersistedData<T> {
    /** 저장된 값 | Stored values */
    values: T;
    /** 저장 시간 | Saved timestamp */
    savedAt: number;
}

/**
 * PersistConfig를 PersistOptions로 정규화
 * Normalize PersistConfig to PersistOptions
 */
export function normalizePersistConfig(config: PersistConfig): PersistOptions {
    if (typeof config === "string") {
        return { key: config };
    }
    return config;
}

/**
 * storagePrefix가 적용된 전체 키 생성 | Generate full key with storagePrefix
 */
export function getFullStorageKey(key: string, storagePrefix?: string): string {
    return storagePrefix ? `${storagePrefix}:${key}` : key;
}

/**
 * 스토리지 객체 가져오기 | Get storage object
 */
function getStorage(
    type: "localStorage" | "sessionStorage" = "localStorage"
): Storage | null {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        return type === "sessionStorage"
            ? window.sessionStorage
            : window.localStorage;
    } catch {
        devWarn("Storage is not available");
        return null;
    }
}

/**
 * localStorage에서 데이터 불러오기 | Load data from localStorage
 * @param config persist 설정 | persist configuration
 * @param storagePrefix 스토리지 키 prefix (GlobalFormaProvider에서 제공) | Storage key prefix (from GlobalFormaProvider)
 */
export function loadPersistedData<T extends Record<string, any>>(
    config: PersistConfig,
    storagePrefix?: string
): Partial<T> | null {
    const options = normalizePersistConfig(config);
    const storage = getStorage(options.storage);
    const fullKey = getFullStorageKey(options.key, storagePrefix);

    if (!storage) return null;

    try {
        const stored = storage.getItem(fullKey);
        if (!stored) return null;

        const parsed: PersistedData<T> = JSON.parse(stored);
        return parsed.values;
    } catch (e) {
        devWarn(`Failed to load persisted data for key "${fullKey}":`, e);
        return null;
    }
}

/**
 * localStorage에 데이터 저장 | Save data to localStorage
 * @param config persist 설정 | persist configuration
 * @param values 저장할 값 | values to save
 * @param storagePrefix 스토리지 키 prefix (GlobalFormaProvider에서 제공) | Storage key prefix (from GlobalFormaProvider)
 */
export function savePersistedData<T extends Record<string, any>>(
    config: PersistConfig,
    values: T,
    storagePrefix?: string
): boolean {
    const options = normalizePersistConfig(config);
    const storage = getStorage(options.storage);
    const fullKey = getFullStorageKey(options.key, storagePrefix);

    if (!storage) return false;

    try {
        // exclude 필드 제외
        let dataToSave = values;
        if (options.exclude && options.exclude.length > 0) {
            dataToSave = { ...values };
            for (const field of options.exclude) {
                delete (dataToSave as any)[field];
            }
        }

        const data: PersistedData<T> = {
            values: dataToSave,
            savedAt: Date.now(),
        };

        storage.setItem(fullKey, JSON.stringify(data));
        return true;
    } catch (e) {
        devWarn(`Failed to save persisted data for key "${fullKey}":`, e);
        return false;
    }
}

/**
 * localStorage에서 데이터 삭제 | Clear persisted data from localStorage
 * @param config persist 설정 | persist configuration
 * @param storagePrefix 스토리지 키 prefix (GlobalFormaProvider에서 제공) | Storage key prefix (from GlobalFormaProvider)
 */
export function clearPersistedData(
    config: PersistConfig,
    storagePrefix?: string
): boolean {
    const options = normalizePersistConfig(config);
    const storage = getStorage(options.storage);
    const fullKey = getFullStorageKey(options.key, storagePrefix);

    if (!storage) return false;

    try {
        storage.removeItem(fullKey);
        return true;
    } catch (e) {
        devWarn(`Failed to clear persisted data for key "${fullKey}":`, e);
        return false;
    }
}

/**
 * 저장된 데이터가 있는지 확인 | Check if persisted data exists
 * @param config persist 설정 | persist configuration
 * @param storagePrefix 스토리지 키 prefix (GlobalFormaProvider에서 제공) | Storage key prefix (from GlobalFormaProvider)
 */
export function hasPersistedData(
    config: PersistConfig,
    storagePrefix?: string
): boolean {
    const options = normalizePersistConfig(config);
    const storage = getStorage(options.storage);
    const fullKey = getFullStorageKey(options.key, storagePrefix);

    if (!storage) return false;

    try {
        return storage.getItem(fullKey) !== null;
    } catch {
        return false;
    }
}

/**
 * 디바운스 유틸리티 | Debounce utility
 */
export function debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            fn(...args);
            timeoutId = null;
        }, delay);
    };
}
