/**
 * reactShim.mjs — 훅 테스트 전용 미니 React 런타임 (배포/빌드 제외 대상)
 *
 * node:test 프로세스에서 "react" 모듈을 이 파일로 리다이렉트하여
 * React 없이 훅의 슬롯 시맨틱(useRef/useState/useMemo/useCallback/useEffect/
 * useContext/useSyncExternalStore)을 재현한다. 단일 컴포넌트 렌더 루프
 * (createRenderer)로 재렌더 간 식별자 안정성을 검증하는 데 쓴다.
 * 프로덕션 React 의 동시성/배칭은 재현하지 않는다 — 식별자/effect 검증 전용.
 */

// 현재 컴포넌트의 훅 슬롯 배열 / hook slot array of the current component
let slots = [];
// 현재 렌더의 슬롯 커서 / slot cursor of the current render
let cursor = 0;
// 이번 렌더에서 실행 대기 중인 effect 목록 / effects pending after this render
let pendingEffects = [];

// deps 배열 변경 여부 판단 (React 와 동일한 Object.is 비교) / deps comparison like React
function depsChanged(prev, next) {
    if (prev === undefined || next === undefined) return true;
    if (prev.length !== next.length) return true;
    return next.some((d, i) => !Object.is(d, prev[i]));
}

// useRef — 렌더 간 유지되는 가변 컨테이너 / mutable container persisted across renders
export function useRef(initial) {
    const i = cursor++;
    if (slots[i] === undefined) slots[i] = { current: initial };
    return slots[i];
}

// useState — setState 는 값만 갱신 (재렌더는 테스트가 명시적으로 수행) / state slot
export function useState(initial) {
    const i = cursor++;
    if (slots[i] === undefined) {
        const value = typeof initial === "function" ? initial() : initial;
        const slot = { value };
        slot.setState = (next) => {
            slot.value = typeof next === "function" ? next(slot.value) : next;
        };
        slots[i] = slot;
    }
    return [slots[i].value, slots[i].setState];
}

// useMemo — deps 가 바뀔 때만 factory 재실행 / recompute only when deps change
export function useMemo(factory, deps) {
    const i = cursor++;
    if (slots[i] === undefined || depsChanged(slots[i].deps, deps)) {
        slots[i] = { value: factory(), deps };
    }
    return slots[i].value;
}

// useCallback — useMemo 로 함수 identity 유지 / stable function identity via useMemo
export function useCallback(fn, deps) {
    return useMemo(() => fn, deps);
}

// useEffect — 렌더 후 deps 변경 시 cleanup → effect 순으로 실행 / run after render on deps change
export function useEffect(effect, deps) {
    const i = cursor++;
    if (slots[i] === undefined) {
        slots[i] = { kind: "effect", deps: undefined, cleanup: undefined };
    }
    const slot = slots[i];
    if (depsChanged(slot.deps, deps)) {
        slot.pending = effect;
        slot.deps = deps;
        pendingEffects.push(slot);
    }
}

// useContext — Provider 렌더 없이 _currentValue 를 직접 읽는다 / read _currentValue directly
export function useContext(ctx) {
    return ctx ? ctx._currentValue : undefined;
}

// useSyncExternalStore — 첫 렌더에 구독, 매 렌더 스냅샷 반환 / subscribe once, snapshot per render
export function useSyncExternalStore(subscribe, getSnapshot) {
    const i = cursor++;
    if (slots[i] === undefined) {
        slots[i] = { unsubscribe: subscribe(() => {}) };
    }
    return getSnapshot();
}

// createContext — {_currentValue} 만 가진 최소 컨텍스트 / minimal context object
export function createContext(defaultValue) {
    return { _currentValue: defaultValue };
}

// JSX 런타임 최소 스텁 (react/jsx-runtime 겸용) / minimal JSX runtime stubs
export const Fragment = Symbol("Fragment");
// jsx — 엘리먼트 생성 스텁 / element creation stub
export function jsx(type, props) {
    return { type, props };
}
// jsxs — 다중 자식 엘리먼트 생성 스텁 / multi-children element stub
export function jsxs(type, props) {
    return { type, props };
}
// jsxDEV — dev 런타임 스텁 / dev runtime stub
export function jsxDEV(type, props) {
    return { type, props };
}

// 단일 컴포넌트 렌더러 — 재렌더/언마운트 시뮬레이션 / single-component renderer
export function createRenderer(component) {
    slots = [];
    return {
        // 1회 렌더 후 대기 effect 실행 / render once, then flush pending effects
        render(props) {
            cursor = 0;
            pendingEffects = [];
            const out = component(props);
            for (const slot of pendingEffects) {
                if (slot.cleanup) slot.cleanup();
                slot.cleanup = slot.pending();
                slot.pending = undefined;
            }
            return out;
        },
        // 모든 effect cleanup 실행 / run all effect cleanups
        unmount() {
            for (const slot of slots) {
                if (slot && slot.kind === "effect" && slot.cleanup) {
                    slot.cleanup();
                }
            }
        },
    };
}

// default export — hooks 의 `import React from "react"` 호환 / default export compat
export default {
    useRef,
    useState,
    useMemo,
    useCallback,
    useEffect,
    useContext,
    useSyncExternalStore,
    createContext,
    Fragment,
};
