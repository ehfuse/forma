/// <reference types="vite/client" />

declare global {
    const __DEV__: boolean;

    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production" | "test";
        }
    }
}

export {};
