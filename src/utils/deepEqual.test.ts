/**
 * deepEqual.test.ts
 *
 * deepEqual 의 사양 테스트 | Spec tests for deepEqual
 *
 * 목표: 기존 JSON.stringify 비교의 동작을 "보존"하되, 명시한 부분만 "개선"한다.
 * Goal: preserve the existing JSON.stringify comparison behavior, improving
 * only where explicitly noted (key order, Date, cyclic safety).
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { deepEqual } from "./deepEqual";

// stringify 비교가 내던 결과 (회귀 방지 기준) | What JSON.stringify comparison yielded
const jsonEq = (a: any, b: any) => {
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        return false;
    }
};

describe("deepEqual — primitives", () => {
    test("identical primitives", () => {
        assert.equal(deepEqual(1, 1), true);
        assert.equal(deepEqual("x", "x"), true);
        assert.equal(deepEqual(true, true), true);
        assert.equal(deepEqual(null, null), true);
        assert.equal(deepEqual(undefined, undefined), true);
    });
    test("different primitives", () => {
        assert.equal(deepEqual(1, 2), false);
        assert.equal(deepEqual("x", "y"), false);
        assert.equal(deepEqual(null, undefined), false);
        assert.equal(deepEqual(0, false), false);
        assert.equal(deepEqual("", null), false);
    });
    test("NaN equals NaN (Object.is semantics)", () => {
        assert.equal(deepEqual(NaN, NaN), true);
    });
});

describe("deepEqual — objects/arrays match JSON.stringify outcome", () => {
    const cases: Array<[any, any]> = [
        [{ a: 1, b: 2 }, { a: 1, b: 2 }],
        [{ a: 1 }, { a: 2 }],
        [{ a: { b: { c: 1 } } }, { a: { b: { c: 1 } } }],
        [{ a: { b: { c: 1 } } }, { a: { b: { c: 2 } } }],
        [[1, 2, 3], [1, 2, 3]],
        [[1, 2, 3], [1, 2]],
        [{ a: [1, { x: 2 }] }, { a: [1, { x: 2 }] }],
        [{ a: undefined, b: 1 }, { a: undefined, b: 1 }],
        [{}, {}],
        [[], []],
        [{ a: 1 }, [1]],
    ];
    for (const [a, b] of cases) {
        test(`${JSON.stringify(a)} vs ${JSON.stringify(b)}`, () => {
            assert.equal(
                deepEqual(a, b),
                jsonEq(a, b),
                "should match JSON.stringify comparison",
            );
        });
    }
});

describe("deepEqual — undefined-key semantics (preserve stringify)", () => {
    test("{a:undefined} equals {} (stringify drops undefined)", () => {
        // stringify: '{}' === '{}' → true. deepEqual 도 동일하게.
        assert.equal(jsonEq({ a: undefined }, {}), true);
        assert.equal(deepEqual({ a: undefined }, {}), true);
    });
    test("{a:undefined} differs from {a:1}", () => {
        assert.equal(deepEqual({ a: undefined }, { a: 1 }), false);
    });
    test("function/symbol values are ignored like stringify", () => {
        assert.equal(deepEqual({ a: 1, f: () => {} }, { a: 1 }), true);
    });
});

describe("deepEqual — improvements over stringify", () => {
    test("key order does NOT matter (improvement)", () => {
        // stringify: false, deepEqual: true (의도적 개선)
        assert.equal(jsonEq({ a: 1, b: 2 }, { b: 2, a: 1 }), false);
        assert.equal(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
    });
    test("Date compared by value (stringify also works, but via ISO)", () => {
        const d1 = new Date("2020-01-01T00:00:00Z");
        const d2 = new Date("2020-01-01T00:00:00Z");
        const d3 = new Date("2021-01-01T00:00:00Z");
        assert.equal(deepEqual(d1, d2), true);
        assert.equal(deepEqual(d1, d3), false);
    });
    test("cyclic references do not throw", () => {
        const a: any = { x: 1 };
        a.self = a;
        const b: any = { x: 1 };
        b.self = b;
        assert.doesNotThrow(() => deepEqual(a, b));
        assert.equal(deepEqual(a, b), true);
    });
});
