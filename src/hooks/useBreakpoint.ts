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

// 가로 브레이크포인트 정의 (픽셀 단위)
const breakpoints = {
    xxxxs: 224, // 14rem
    xxxs: 256, // 16rem
    xxs: 288, // 18rem
    xs: 352, // 22rem
    sm: 640, // 40rem
    md: 768, // 48rem
    lg: 1024, // 64rem
    xl: 1280, // 80rem
    xxl: 1536, // 96rem
} as const;

// 세로 브레이크포인트 정의 (픽셀 단위)
const heightBreakpoints = {
    hxxs: 400,
    hxs: 500,
    hsm: 600,
    hmd: 768,
    hlg: 900,
    hxl: 1080,
    hxxl: 1080, // hxl과 동일
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
    const [windowHeight, setWindowHeight] = useState(
        typeof window !== "undefined" ? window.innerHeight : 0
    );

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 가로 브레이크포인트별 미디어쿼리 결과 (해당 브레이크포인트 이하인지)
    const xxxxs = windowWidth < breakpoints.xxxs;
    const xxxs = windowWidth < breakpoints.xxs;
    const xxs = windowWidth < breakpoints.xs;
    const xs = windowWidth < breakpoints.sm;
    const sm = windowWidth < breakpoints.md;
    const md = windowWidth < breakpoints.lg;
    const lg = windowWidth < breakpoints.xl;
    const xl = windowWidth < breakpoints.xxl;
    const xxl = windowWidth >= breakpoints.xxl;

    const xxxxsUp = windowWidth >= breakpoints.xxxxs;
    const xxxsUp = windowWidth >= breakpoints.xxxs;
    const xxsUp = windowWidth >= breakpoints.xxs;
    const xsUp = windowWidth >= breakpoints.xs;
    const smUp = windowWidth >= breakpoints.sm;
    const mdUp = windowWidth >= breakpoints.md;
    const lgUp = windowWidth >= breakpoints.lg;
    const xlUp = windowWidth >= breakpoints.xl;
    const xxlUp = windowWidth >= breakpoints.xxl;

    // 세로 브레이크포인트별 미디어쿼리 결과 (해당 브레이크포인트 이하인지)
    const hxxs = windowHeight < heightBreakpoints.hxs;
    const hxs = windowHeight < heightBreakpoints.hsm;
    const hsm = windowHeight < heightBreakpoints.hmd;
    const hmd = windowHeight < heightBreakpoints.hlg;
    const hlg = windowHeight < heightBreakpoints.hxl;
    const hxl = windowHeight < heightBreakpoints.hxxl;
    const hxxl = windowHeight >= heightBreakpoints.hxxl;

    const hxxsUp = windowHeight >= heightBreakpoints.hxxs;
    const hxsUp = windowHeight >= heightBreakpoints.hxs;
    const hsmUp = windowHeight >= heightBreakpoints.hsm;
    const hmdUp = windowHeight >= heightBreakpoints.hmd;
    const hlgUp = windowHeight >= heightBreakpoints.hlg;
    const hxlUp = windowHeight >= heightBreakpoints.hxl;
    const hxxlUp = windowHeight >= heightBreakpoints.hxxl;

    // 객체 형태로 반환하여 breakpoint.sm 식으로 접근 가능
    return {
        // 가로 브레이크포인트
        xxxxs,
        xxxs,
        xxs,
        xs,
        sm,
        md,
        lg,
        xl,
        xxl,
        xxxxsUp,
        xxxsUp,
        xxsUp,
        xsUp,
        smUp,
        mdUp,
        lgUp,
        xlUp,
        xxlUp,
        // 세로 브레이크포인트
        hxxs,
        hxs,
        hsm,
        hmd,
        hlg,
        hxl,
        hxxl,
        hxxsUp,
        hxsUp,
        hsmUp,
        hmdUp,
        hlgUp,
        hxlUp,
        hxxlUp,
        // 현재 크기
        width: windowWidth,
        height: windowHeight,
        // 객체 형태
        breakpoint: {
            xxxxs,
            xxxs,
            xxs,
            xs,
            sm,
            md,
            lg,
            xl,
            xxl,
            xxxxsUp,
            xxxsUp,
            xxsUp,
            xsUp,
            smUp,
            mdUp,
            lgUp,
            xlUp,
            xxlUp,
        },
        heightBreakpoint: {
            hxxs,
            hxs,
            hsm,
            hmd,
            hlg,
            hxl,
            hxxl,
            hxxsUp,
            hxsUp,
            hsmUp,
            hmdUp,
            hlgUp,
            hxlUp,
            hxxlUp,
        },
    };
};
