/**
 * environment.ts
 *
 * Environment detection utilities
 * 환경 감지 유틸리티
 *
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 * @license MIT License
 */

/**
 * Check if the current environment is development
 * 현재 환경이 개발 환경인지 확인
 *
 * @returns {boolean} true if development environment, false otherwise
 */
export function isDevelopment(): boolean {
    try {
        // Node.js environment check
        if (
            typeof (globalThis as any).process !== "undefined" &&
            (globalThis as any).process.env
        ) {
            return (globalThis as any).process.env.NODE_ENV !== "production";
        }

        // Browser environment check
        if (typeof window !== "undefined") {
            // Check for localhost or development hostnames
            const hostname = window.location.hostname;
            const isDev =
                hostname === "localhost" ||
                hostname === "127.0.0.1" ||
                hostname.includes("dev") ||
                hostname.includes("local") ||
                window.location.port !== "";

            return isDev;
        }

        // Default to false for unknown environments
        return false;
    } catch {
        // If any error occurs, assume production
        return false;
    }
}

/**
 * Log a warning message only in development environment
 * 개발 환경에서만 경고 메시지 로그
 *
 * @param message - Warning message to log
 * @param ...args - Additional arguments to log
 */
export function devWarn(message: string, ...args: any[]): void {
    if (isDevelopment()) {
        console.warn(message, ...args);
    }
}

/**
 * Log an error message only in development environment
 * 개발 환경에서만 에러 메시지 로그
 *
 * @param message - Error message to log
 * @param ...args - Additional arguments to log
 */
export function devError(message: string, ...args: any[]): void {
    if (isDevelopment()) {
        console.error(message, ...args);
    }
}

/**
 * Log an info message only in development environment
 * 개발 환경에서만 정보 메시지 로그
 *
 * @param message - Info message to log
 * @param ...args - Additional arguments to log
 */
export function devLog(message: string, ...args: any[]): void {
    if (isDevelopment()) {
        console.log(message, ...args);
    }
}
