/**
 * deepEqual.ts
 *
 * Forma - 값 동등 비교 유틸 | Value deep-equality utility
 *
 * 기존 `JSON.stringify(a) === JSON.stringify(b)` 비교를 대체한다.
 * Replaces the previous `JSON.stringify(a) === JSON.stringify(b)` comparison.
 *
 * 설계 원칙 | Design principles:
 *  - stringify 동작 보존 | Preserve stringify behavior:
 *      · 값이 undefined / function / symbol 인 키는 "없는 키"로 취급
 *        (keys whose value is undefined/function/symbol are treated as absent)
 *  - 개선 | Improvements:
 *      · 키 순서 무시 (stringify 는 순서 민감) | key order ignored
 *      · Date 는 시간값으로 비교 | Date compared by time value
 *      · 순환참조 안전 (stringify 는 throw) | cyclic-safe (stringify throws)
 *      · NaN === NaN (Object.is 의미) | NaN equals NaN
 *  - 성능 | Performance:
 *      · a === b 또는 Object.is 면 즉시 true | identity fast-path
 *
 * @license MIT License
 * @copyright 2025 KIM YOUNG JIN (ehfuse@gmail.com)
 */

/**
 * 값이 "실재하는" 값인지 확인한다. | Check whether a value is meaningful.
 * stringify 가 직렬화에서 제외하는 값(undefined/function/symbol)은 "없는 값"으로 취급.
 * Values that JSON.stringify would drop (undefined/function/symbol) are treated as absent.
 */
function isMeaningfulValue(v: any): boolean {
    const t = typeof v;
    return v !== undefined && t !== "function" && t !== "symbol";
}

/**
 * 객체의 "실재하는" own key 개수를 센다 (배열 할당 없이). | Count meaningful own keys without allocating arrays.
 */
function countMeaningfulKeys(obj: Record<string, any>): number {
    let count = 0;
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (!isMeaningfulValue(obj[key])) continue;
        count++;
    }
    return count;
}

/**
 * 두 값이 깊은 의미에서 동일한지 비교한다. | Compare two values for deep equality.
 *
 * @param a 비교 대상 A | Value A
 * @param b 비교 대상 B | Value B
 * @returns 동일하면 true | true if deeply equal
 */
export function deepEqual(a: any, b: any): boolean {
    return deepEqualInner(a, b, new WeakMap());
}

function deepEqualInner(a: any, b: any, seen: WeakMap<object, any>): boolean {
    // 1. identity / NaN | Object.is 로 +0/-0, NaN 까지 처리
    if (Object.is(a, b)) return true;

    // 2. 한쪽만 객체이거나 null 이면 다름 | one is non-object/null → not equal
    if (
        a === null ||
        b === null ||
        typeof a !== "object" ||
        typeof b !== "object"
    ) {
        return false;
    }

    // 3. Date | compare by time
    const aIsDate = a instanceof Date;
    const bIsDate = b instanceof Date;
    if (aIsDate || bIsDate) {
        return aIsDate && bIsDate && a.getTime() === b.getTime();
    }

    // 4. 배열 | arrays
    const aIsArr = Array.isArray(a);
    const bIsArr = Array.isArray(b);
    if (aIsArr !== bIsArr) return false;

    // 5. 순환참조 가드 | cyclic guard
    // 이미 (a -> b) 매핑을 본 적이 있으면 동일 경로로 간주
    const prev = seen.get(a);
    if (prev === b) return true;
    seen.set(a, b);

    if (aIsArr) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqualInner(a[i], b[i], seen)) return false;
        }
        return true;
    }

    // 6. plain object — stringify 의미 보존: "실재하는" own key 만 비교 대상
    //    키 배열을 두 번 만들지 않고, b 쪽은 개수만 세고 a 쪽은 순회하며 즉시 비교한다.
    //    (기존 meaningfulKeys 이중 배열 할당 제거 — 결과는 동일)
    //    Compare only meaningful own keys without materializing both key arrays:
    //    count b's keys, then walk a's keys comparing as we go. Same result, fewer allocations.
    const bCount = countMeaningfulKeys(b);

    let aCount = 0;
    for (const key in a) {
        if (!Object.prototype.hasOwnProperty.call(a, key)) continue;
        const av = a[key];
        if (!isMeaningfulValue(av)) continue;
        aCount++;
        // a 의 실재 키가 b 에 없으면 다름 (기존과 동일: own 존재만 확인)
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!deepEqualInner(av, b[key], seen)) return false;
    }
    // 실재 키 개수가 다르면 다름 | key counts must match
    return aCount === bCount;
}
