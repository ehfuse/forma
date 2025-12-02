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
 * Breakpoint state object
 * 브레이크포인트 상태 객체
 */
export interface BreakpointState {
    /** Extra small: < 600px */
    xs: boolean;
    /** Small: < 900px */
    sm: boolean;
    /** Medium: < 1200px */
    md: boolean;
    /** Large: < 1536px */
    lg: boolean;
    /** Extra large: < 1920px */
    xl: boolean;
    /** Extra extra large: >= 1920px */
    xxl: boolean;
    /** >= 0px */
    xsUp: boolean;
    /** >= 600px */
    smUp: boolean;
    /** >= 900px */
    mdUp: boolean;
    /** >= 1200px */
    lgUp: boolean;
    /** >= 1536px */
    xlUp: boolean;
    /** >= 1920px */
    xxlUp: boolean;
}

/**
 * Return type of useBreakpoint hook
 * useBreakpoint 훅의 반환 타입
 */
export interface UseBreakpointReturn extends BreakpointState {
    /** Breakpoint state object (same as root level) */
    breakpoint: BreakpointState;
}
