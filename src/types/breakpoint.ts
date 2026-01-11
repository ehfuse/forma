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

/**
 * Breakpoint state object (width-based)
 * 브레이크포인트 상태 객체 (가로 기준)
 */
export interface BreakpointState {
    /** 4x Extra small: < 256px (14rem) */
    xxxxs: boolean;
    /** 3x Extra small: < 288px (16rem) */
    xxxs: boolean;
    /** 2x Extra small: < 352px (18rem) */
    xxs: boolean;
    /** Extra small: < 640px (22rem) */
    xs: boolean;
    /** Small: < 768px (40rem) */
    sm: boolean;
    /** Medium: < 1024px (48rem) */
    md: boolean;
    /** Large: < 1280px (64rem) */
    lg: boolean;
    /** Extra large: < 1536px (80rem) */
    xl: boolean;
    /** Extra extra large: >= 1536px (96rem) */
    xxl: boolean;
    /** >= 224px (14rem) */
    xxxxsUp: boolean;
    /** >= 256px (16rem) */
    xxxsUp: boolean;
    /** >= 288px (18rem) */
    xxsUp: boolean;
    /** >= 352px (22rem) */
    xsUp: boolean;
    /** >= 640px (40rem) */
    smUp: boolean;
    /** >= 768px (48rem) */
    mdUp: boolean;
    /** >= 1024px (64rem) */
    lgUp: boolean;
    /** >= 1280px (80rem) */
    xlUp: boolean;
    /** >= 1536px (96rem) */
    xxlUp: boolean;
}

/**
 * Height breakpoint state object (height-based)
 * 세로 브레이크포인트 상태 객체 (높이 기준)
 */
export interface HeightBreakpointState {
    /** Height < 400px */
    hxxs: boolean;
    /** Height < 500px */
    hxs: boolean;
    /** Height < 600px */
    hsm: boolean;
    /** Height < 768px */
    hmd: boolean;
    /** Height < 900px */
    hlg: boolean;
    /** Height < 1080px */
    hxl: boolean;
    /** Height >= 1080px */
    hxxl: boolean;
    /** Height >= 400px */
    hxxsUp: boolean;
    /** Height >= 500px */
    hxsUp: boolean;
    /** Height >= 600px */
    hsmUp: boolean;
    /** Height >= 768px */
    hmdUp: boolean;
    /** Height >= 900px */
    hlgUp: boolean;
    /** Height >= 1080px */
    hxlUp: boolean;
    /** Height >= 1080px (same as hxlUp) */
    hxxlUp: boolean;
}

/**
 * Return type of useBreakpoint hook
 * useBreakpoint 훅의 반환 타입
 */
export interface UseBreakpointReturn
    extends BreakpointState,
        HeightBreakpointState {
    /** Width breakpoint state object (same as root level) */
    breakpoint: BreakpointState;
    /** Height breakpoint state object */
    heightBreakpoint: HeightBreakpointState;
    /** Current window width in pixels */
    width: number;
    /** Current window height in pixels */
    height: number;
    /** Whether the screen is in landscape mode (width > height) */
    /** 화면이 가로모드인지 여부 (width > height) */
    landscape: boolean;
    /** Whether the screen is in portrait mode (height >= width) */
    /** 화면이 세로모드인지 여부 (height >= width) */
    portrait: boolean;
}
