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
 * 객체에서 "실재하는" 키만 추린다. | Collect keys whose value is meaningful.
 * stringify 가 직렬화에서 제외하는 값(undefined/function/symbol)을 가진 키는 제외.
 * Excludes keys whose value would be dropped by JSON.stringify.
 */
function meaningfulKeys(obj: Record<string, any>): string[] {
    const keys: string[] = [];
    for (const key in obj) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        const v = obj[key];
        const t = typeof v;
        if (v === undefined || t === "function" || t === "symbol") continue;
        keys.push(key);
    }
    return keys;
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

    // 6. plain object — stringify 의미를 보존하기 위해 meaningfulKeys 사용
    const aKeys = meaningfulKeys(a);
    const bKeys = meaningfulKeys(b);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
        if (!deepEqualInner(a[key], b[key], seen)) return false;
    }
    return true;
}
