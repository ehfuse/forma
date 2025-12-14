/**
 * useLocalStorage.ts
 *
 * Forma - localStorage 관리 훅 | localStorage management hook
 * useState와 유사한 패턴으로 localStorage 데이터를 관리합니다
 * Manages localStorage data with a pattern similar to useState
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

import { useState, useCallback, useEffect, useContext, useMemo } from "react";
import { GlobalFormaContext } from "../contexts/GlobalFormaContext";
import { isBrowser } from "../utils/environment";

/**
 * useLocalStorage 훅의 반환 타입 | useLocalStorage hook return type
 */
export interface UseLocalStorageReturn<T> {
    /** 현재 값 | Current value */
    value: T;
    /** 값 설정 (함수형 업데이트 지원) | Set value (supports functional updates) */
    setValue: (value: T | ((prev: T) => T)) => void;
    /** 저장된 값 삭제 | Remove stored value */
    remove: () => void;
    /** 값 존재 여부 | Whether value exists */
    has: boolean;
}

/**
 * useLocalStorage 훅 옵션 | useLocalStorage hook options
 */
export interface UseLocalStorageOptions {
    /** sessionStorage 사용 여부 (기본: localStorage) | Use sessionStorage instead (default: localStorage) */
    session?: boolean;
}

/**
 * prefix가 적용된 전체 키를 생성합니다 | Generate full key with prefix applied
 */
function getFullKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
}

/**
 * localStorage에서 값을 읽습니다 | Read value from localStorage
 */
function readFromStorage<T>(
    fullKey: string,
    defaultValue: T,
    useSession: boolean
): T {
    if (!isBrowser()) {
        return defaultValue;
    }

    try {
        const storage = useSession ? sessionStorage : localStorage;
        const item = storage.getItem(fullKey);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item) as T;
    } catch {
        return defaultValue;
    }
}

/**
 * localStorage에 값을 저장합니다 | Write value to localStorage
 */
function writeToStorage<T>(
    fullKey: string,
    value: T,
    useSession: boolean
): void {
    if (!isBrowser()) {
        return;
    }

    try {
        const storage = useSession ? sessionStorage : localStorage;
        storage.setItem(fullKey, JSON.stringify(value));
    } catch (error) {
        console.warn(`[useLocalStorage] Failed to save to storage:`, error);
    }
}

/**
 * localStorage에서 값을 삭제합니다 | Remove value from localStorage
 */
function removeFromStorage(fullKey: string, useSession: boolean): void {
    if (!isBrowser()) {
        return;
    }

    try {
        const storage = useSession ? sessionStorage : localStorage;
        storage.removeItem(fullKey);
    } catch (error) {
        console.warn(`[useLocalStorage] Failed to remove from storage:`, error);
    }
}

/**
 * localStorage에 값이 존재하는지 확인합니다 | Check if value exists in localStorage
 */
function hasInStorage(fullKey: string, useSession: boolean): boolean {
    if (!isBrowser()) {
        return false;
    }

    try {
        const storage = useSession ? sessionStorage : localStorage;
        return storage.getItem(fullKey) !== null;
    } catch {
        return false;
    }
}

/**
 * useState와 유사한 패턴의 localStorage 관리 훅
 * localStorage management hook with useState-like pattern
 *
 * GlobalFormaProvider의 storagePrefix가 설정된 경우 자동으로 키에 prefix가 적용됩니다.
 * If GlobalFormaProvider's storagePrefix is set, it will be automatically applied to keys.
 *
 * @template T 저장할 값의 타입 | Type of value to store
 * @param key localStorage 키 | localStorage key
 * @param defaultValue 기본값 | Default value
 * @param options 옵션 | Options
 * @returns localStorage 관리 API | localStorage management API
 *
 * @example
 * ```typescript
 * // 기본 사용
 * const { value: theme, setValue: setTheme } = useLocalStorage('theme', 'light');
 *
 * // sessionStorage 사용
 * const { value, setValue } = useLocalStorage('session-data', {}, { session: true });
 *
 * // 객체 저장
 * interface UserPrefs {
 *   theme: 'light' | 'dark';
 *   fontSize: number;
 * }
 * const { value: prefs, setValue: setPrefs } = useLocalStorage<UserPrefs>('prefs', {
 *   theme: 'light',
 *   fontSize: 14
 * });
 *
 * // 함수형 업데이트
 * setPrefs(prev => ({ ...prev, theme: 'dark' }));
 *
 * // GlobalFormaProvider와 함께 사용 (자동 prefix)
 * // <GlobalFormaProvider storagePrefix="myapp">
 * // 실제 키: "myapp:theme"
 * ```
 */
export function useLocalStorage<T>(
    key: string,
    defaultValue: T,
    options?: UseLocalStorageOptions
): UseLocalStorageReturn<T> {
    const context = useContext(GlobalFormaContext);
    const storagePrefix = context?.storagePrefix;
    const useSession = options?.session ?? false;

    // storagePrefix가 설정되지 않은 경우 에러 발생
    // Throw error if storagePrefix is not set
    if (!storagePrefix) {
        throw new Error(
            `[useLocalStorage] storagePrefix가 설정되지 않았습니다.
GlobalFormaProvider에 storagePrefix를 설정해주세요.

예시:
<GlobalFormaProvider storagePrefix="myapp">
  <App />
</GlobalFormaProvider>

[useLocalStorage] storagePrefix is not set.
Please set storagePrefix in GlobalFormaProvider.`
        );
    }

    // prefix가 적용된 전체 키 | Full key with prefix applied
    const fullKey = useMemo(
        () => getFullKey(key, storagePrefix),
        [key, storagePrefix]
    );

    // 초기값 읽기 | Read initial value
    const [storedValue, setStoredValue] = useState<T>(() =>
        readFromStorage(fullKey, defaultValue, useSession)
    );

    // 값 존재 여부 | Whether value exists
    const [has, setHas] = useState<boolean>(() =>
        hasInStorage(fullKey, useSession)
    );

    // 값 설정 | Set value
    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((prev) => {
                const newValue =
                    value instanceof Function ? value(prev) : value;
                writeToStorage(fullKey, newValue, useSession);
                setHas(true);
                return newValue;
            });
        },
        [fullKey, useSession]
    );

    // 값 삭제 | Remove value
    const remove = useCallback(() => {
        removeFromStorage(fullKey, useSession);
        setStoredValue(defaultValue);
        setHas(false);
    }, [fullKey, useSession, defaultValue]);

    // 다른 탭/창에서의 변경 감지 | Listen for changes from other tabs/windows
    useEffect(() => {
        if (!isBrowser()) return;

        const handleStorageChange = (e: StorageEvent) => {
            // sessionStorage는 storage 이벤트를 발생시키지 않음
            if (useSession) return;

            if (e.key === fullKey) {
                if (e.newValue === null) {
                    setStoredValue(defaultValue);
                    setHas(false);
                } else {
                    try {
                        const newValue = JSON.parse(e.newValue) as T;
                        setStoredValue(newValue);
                        setHas(true);
                    } catch {
                        // JSON 파싱 실패 시 무시
                    }
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [fullKey, defaultValue, useSession]);

    return {
        value: storedValue,
        setValue,
        remove,
        has,
    };
}

/**
 * storagePrefix를 가져오는 유틸리티 훅 | Utility hook to get storagePrefix
 *
 * @returns storagePrefix 값 | storagePrefix value
 *
 * @example
 * ```typescript
 * const prefix = useStoragePrefix();
 * console.log(prefix); // "myapp" or undefined
 * ```
 */
export function useStoragePrefix(): string | undefined {
    const context = useContext(GlobalFormaContext);
    return context?.storagePrefix;
}
