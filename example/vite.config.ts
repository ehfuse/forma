import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    server: {
        port: 3000,
    },
    resolve: {
        dedupe: ["@ehfuse/forma", "react", "react-dom"],
        alias: {
            "@ehfuse/forma": "/home/ehfuse/npm/forma/index.ts",
        },
    },
    optimizeDeps: {
        exclude: ["@ehfuse/mui-form-dialog"],
        include: [
            "react-is",
            "prop-types",
            "hoist-non-react-statics",
            "@emotion/react",
            "@emotion/styled",
        ],
        esbuildOptions: {
            preserveSymlinks: true,
        },
    },
    build: {
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
    define: {
        // 개발 모드에서 __DEV__ 전역 변수 정의
        __DEV__: JSON.stringify(mode !== "production"),
        // NODE_ENV를 전역으로 노출
        "process.env.NODE_ENV": JSON.stringify(mode || "development"),
    },
}));
