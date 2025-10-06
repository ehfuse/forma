/**
 * MIT License
 *
 * Copyright (c) 2025 KIM YOUNG JIN (ehfuse@gmail.com)
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

import { useState, useEffect } from "react";
import type { UseBreakpointReturn } from "../types/breakpoint";

// 브레이크포인트 정의 (픽셀 단위)
const breakpoints = {
    xs: 0,
    sm: 600,
    md: 900,
    lg: 1200,
    xl: 1536,
    xxl: 1920,
} as const;

/**
 * useBreakpoint Hook
 *
 * Manages responsive breakpoint state for screen size detection.
 * Provides both "down" (below threshold) and "up" (above threshold) states.
 *
 * 화면 크기 감지를 위한 반응형 브레이크포인트 상태를 관리합니다.
 * "down" (임계값 이하) 및 "up" (임계값 이상) 상태를 모두 제공합니다.
 *
 * @returns {UseBreakpointReturn} Breakpoint state object
 *
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const breakpoint = useBreakpoint();
 *
 *   return (
 *     <div>
 *       {breakpoint.smUp ? <DesktopView /> : <MobileView />}
 *       {breakpoint.mdUp && <SidebarNav />}
 *     </div>
 *   );
 * }
 * ```
 */
export const useBreakpoint = (): UseBreakpointReturn => {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 0
    );

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 각 브레이크포인트별 미디어쿼리 결과 (해당 브레이크포인트 이하인지)
    const xs = windowWidth < breakpoints.sm;
    const sm = windowWidth < breakpoints.md;
    const md = windowWidth < breakpoints.lg;
    const lg = windowWidth < breakpoints.xl;
    const xl = windowWidth < breakpoints.xxl;
    const xxl = windowWidth >= breakpoints.xxl;

    const xsUp = windowWidth >= breakpoints.xs;
    const smUp = windowWidth >= breakpoints.sm;
    const mdUp = windowWidth >= breakpoints.md;
    const lgUp = windowWidth >= breakpoints.lg;
    const xlUp = windowWidth >= breakpoints.xl;
    const xxlUp = windowWidth >= breakpoints.xxl;

    // 객체 형태로 반환하여 breakpoint.sm 식으로 접근 가능
    return {
        xs,
        sm,
        md,
        lg,
        xl,
        xxl,
        xsUp,
        smUp,
        mdUp,
        lgUp,
        xlUp,
        xxlUp,
        breakpoint: {
            xs,
            sm,
            md,
            lg,
            xl,
            xxl,
            xsUp,
            smUp,
            mdUp,
            lgUp,
            xlUp,
            xxlUp,
        },
    };
};
