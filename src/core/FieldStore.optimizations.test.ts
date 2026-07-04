/**
 * FieldStore.optimizations.test.ts
 *
 * FieldStore 성능 최적화(F1~F8) 동작 고정 테스트
 * Tests pinning the behavior of the FieldStore performance optimizations (F1-F8)
 *
 *  - F1: dot 구독 루트필드 역인덱스 (버킷 격리 + 인덱스 기반 매칭 의미 보존)
 *  - F2: dot getValue 전체복사 제거 (참조 안정성)
 *  - F3: 부모 watch 값 수집 게이트
 *  - F6: getValues() 세대 캐시 (모든 mutator 가 무효화)
 *  - F8: 와일드카드 watcher 별도 목록
 *  - getApi(): 안정 식별자 명령형 API
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { FieldStore } from "./FieldStore";

/**
 * 특정 경로 구독자가 호출된 횟수를 세는 헬퍼 | Helper that counts subscriber calls per path
 */
function trackSubscription(store: FieldStore<any>, path: string) {
    const state = { count: 0 };
    const unsubscribe = store.subscribe(path, () => {
        state.count++;
    });
    return { state, unsubscribe };
}

describe("F1: notification reverse index (bucket isolation)", () => {
    test("a change under root A never scans subscribers under root B (scan-count hook)", () => {
        const store = new FieldStore<any>({});
        // 루트 a 아래 2개, 루트 b 아래 2개, 루트 c 아래 1개 구독
        const aX = trackSubscription(store, "a.x");
        const aY = trackSubscription(store, "a.y");
        const bX = trackSubscription(store, "b.x");
        const bY = trackSubscription(store, "b.y");
        const cZ = trackSubscription(store, "c.z");

        store.__debugDotScanCount = 0;
        store.setValue("a.x", 1);

        // 루트 a 버킷(2개 경로)만 검사되어야 한다 — b/c 경로는 스캔 자체가 없다
        assert.equal(
            store.__debugDotScanCount,
            2,
            "only the 2 paths under root 'a' may be scanned",
        );
        assert.equal(aX.state.count, 1, "exact subscriber fires");
        assert.equal(bX.state.count, 0, "root-b subscriber untouched");
        assert.equal(bY.state.count, 0, "root-b subscriber untouched");
        assert.equal(cZ.state.count, 0, "root-c subscriber untouched");
        // aY 는 스캔은 되지만 매칭 규칙상 깨어나지 않는다
        assert.equal(aY.state.count, 0, "sibling path scanned but not notified");
    });

    test("plain-field replacement scans only its own root bucket", () => {
        const store = new FieldStore<any>({});
        store.setValue("user", { name: "Jane" });
        store.setValue("other", { name: "Bob" });
        const userName = trackSubscription(store, "user.name");
        const otherName = trackSubscription(store, "other.name");

        store.__debugDotScanCount = 0;
        store.setValue("user", { name: "Kim" });

        assert.equal(
            store.__debugDotScanCount,
            1,
            "only 'user.name' (root 'user' bucket) may be scanned",
        );
        assert.equal(userName.state.count, 1);
        assert.equal(otherName.state.count, 0);
    });

    test("unsubscribe cleans the index bucket (zero scans afterwards)", () => {
        const store = new FieldStore<any>({});
        const sub = trackSubscription(store, "a.x");
        sub.unsubscribe();

        store.__debugDotScanCount = 0;
        store.setValue("a.x", 1);
        assert.equal(store.__debugDotScanCount, 0, "empty bucket → no scan");
        assert.equal(sub.state.count, 0);

        // 재구독하면 다시 인덱싱되어 알림된다 | resubscribing re-indexes
        const sub2 = trackSubscription(store, "a.x");
        store.setValue("a.x", 2);
        assert.equal(sub2.state.count, 1);
    });

    // ── 인덱스 기반 매칭 의미 보존: 다른 루트 구독자들이 있는 상태에서
    //    기존 매칭 테스트들을 그대로 재검증 (multiple roots present) ──
    describe("matching semantics against the index with multiple roots present", () => {
        /**
         * 잡음용 다른 루트 구독자들을 깔아두는 헬퍼 | Seed noise subscribers under other roots
         */
        function seedOtherRoots(store: FieldStore<any>) {
            return [
                trackSubscription(store, "zz.deep.path"),
                trackSubscription(store, "yy.length"),
                trackSubscription(store, "xx.0.v"),
            ];
        }

        /**
         * 잡음 구독자들이 전혀 깨지 않았는지 확인 | Assert noise subscribers never fired
         */
        function assertOthersSilent(others: Array<{ state: { count: number } }>) {
            others.forEach((o, i) =>
                assert.equal(o.state.count, 0, `other-root subscriber ${i} silent`),
            );
        }

        test("exact dot-path subscriber notified (setValue)", () => {
            const store = new FieldStore<any>({});
            const others = seedOtherRoots(store);
            const sub = trackSubscription(store, "user.name");
            store.setValue("user.name", "Jane");
            assert.equal(sub.state.count, 1);
            assertOthersSilent(others);
        });

        test("parent subscriber notified when a child path changes", () => {
            const store = new FieldStore<any>({});
            const others = seedOtherRoots(store);
            const parent = trackSubscription(store, "user.profile");
            store.setValue("user.profile.name", "Jane");
            assert.ok(parent.state.count >= 1);
            assertOthersSilent(others);
        });

        test("child subscriber notified when parent object replaced (changed child only)", () => {
            const store = new FieldStore<any>({});
            const others = seedOtherRoots(store);
            store.setValue("user", { name: "Jane", age: 1 });
            const name = trackSubscription(store, "user.name");
            const age = trackSubscription(store, "user.age");
            store.setValue("user", { name: "Jane", age: 2 });
            assert.equal(name.state.count, 0, "unchanged child silent");
            assert.equal(age.state.count, 1, "changed child fires");
            assertOthersSilent(others);
        });

        test(".length subscriber fires only on length change", () => {
            const store = new FieldStore<any>({});
            const others = seedOtherRoots(store);
            store.setValue("items", [1, 2]);
            const len = trackSubscription(store, "items.length");
            store.setValue("items", [1, 2, 3]);
            assert.equal(len.state.count, 1);
            store.setValue("items", [9, 8, 7]);
            assert.equal(len.state.count, 1, "same length → no fire");
            assertOthersSilent(others);
        });

        test("array replace notifies only the changed index", () => {
            const store = new FieldStore<any>({});
            const others = seedOtherRoots(store);
            store.setValue("items", [{ v: 1 }, { v: 2 }]);
            const i0 = trackSubscription(store, "items.0.v");
            const i1 = trackSubscription(store, "items.1.v");
            store.setValue("items", [{ v: 1 }, { v: 99 }]);
            assert.equal(i0.state.count, 0);
            assert.equal(i1.state.count, 1);
            assertOthersSilent(others);
        });

        test("array created/removed notifies descendant subscribers", () => {
            const store = new FieldStore<any>({});
            const others = seedOtherRoots(store);
            const i0 = trackSubscription(store, "items.0");
            store.setValue("items", [10]);
            assert.ok(i0.state.count >= 1, "creation fires");
            const before = i0.state.count;
            store.setValue("items", undefined);
            assert.ok(i0.state.count > before, "removal fires");
            assertOthersSilent(others);
        });

        test("batch path (setValues/setBatch) shares the same index-based matching", () => {
            const store = new FieldStore<any>({});
            const others = seedOtherRoots(store);
            const exact = trackSubscription(store, "a.b.c");
            const parent = trackSubscription(store, "a.b");
            store.setValues({ "a.b.c": 1 });
            assert.equal(exact.state.count, 1);
            assert.equal(parent.state.count, 1);
            store.setBatch({ "a.b.c": 2 });
            assert.equal(exact.state.count, 2);
            assertOthersSilent(others);
        });
    });
});

describe("F2: dot getValue without full snapshot copy", () => {
    test("two consecutive getValue('a.b') calls return Object.is-equal references", () => {
        const store = new FieldStore<any>({});
        store.setValue("a", { b: { c: 1 } });
        const first = store.getValue("a.b");
        const second = store.getValue("a.b");
        assert.ok(
            Object.is(first, second),
            "reference must be stable with no change in between (getSnapshot contract)",
        );
        assert.equal(first.c, 1);
    });

    test("returned object leaf is the same reference stored in the root value", () => {
        const store = new FieldStore<any>({});
        const inner = { c: 1 };
        store.setValue("a", { b: inner });
        assert.ok(
            Object.is(store.getValue("a.b"), inner),
            "dot getValue points into the stored root value",
        );
    });

    test("'.length' of a missing field still returns 0 (legacy edge preserved)", () => {
        const store = new FieldStore<any>({});
        assert.equal(store.getValue("missing.length"), 0);
    });

    test("forbidden keys in dot paths still return undefined", () => {
        const store = new FieldStore<any>({});
        store.setValue("a", { b: 1 });
        assert.equal(store.getValue("__proto__.polluted"), undefined);
        assert.equal(store.getValue("a.constructor.prototype"), undefined);
    });

    test("deep paths and array indices resolve as before", () => {
        const store = new FieldStore<any>({});
        store.setValue("list", [{ name: "x" }, { name: "y" }]);
        assert.equal(store.getValue("list.1.name"), "y");
        assert.equal(store.getValue("list.length"), 2);
        assert.equal(store.getValue("list.9.name"), undefined);
    });
});

describe("F3: parent-watch value collection gate", () => {
    test("parent watcher receives the correct previous parent value", () => {
        const store = new FieldStore<any>({});
        store.setValue("user.name", "Jane");

        const calls: Array<{ value: any; prev: any }> = [];
        store.watch("user", (value, prev) => calls.push({ value, prev }));

        store.setValue("user.name", "Kim");

        assert.equal(calls.length, 1, "parent watcher fired once");
        assert.equal(calls[0].value.name, "Kim");
        assert.equal(calls[0].prev.name, "Jane", "prev parent value preserved");
    });

    test("mid-chain parent watcher also receives its previous value", () => {
        const store = new FieldStore<any>({});
        store.setValue("a.b.c", 1);

        const calls: Array<{ value: any; prev: any }> = [];
        store.watch("a.b", (value, prev) => calls.push({ value, prev }));

        store.setValue("a.b.c", 2);

        assert.equal(calls.length, 1);
        assert.equal(calls[0].value.c, 2);
        assert.equal(calls[0].prev.c, 1);
    });

    test("dot setValue with zero watchers still notifies subscribers normally", () => {
        const store = new FieldStore<any>({});
        const sub = trackSubscription(store, "a.b.c");
        store.setValue("a.b.c", 1); // watcher 없음 → 수집 게이트가 전부 skip 해도 알림은 정상
        assert.equal(sub.state.count, 1);
        assert.equal(store.getValue("a.b.c"), 1);
    });
});

describe("F6: getValues() version cache", () => {
    test("returns the SAME cached object while nothing changed (shared, read-only)", () => {
        const store = new FieldStore<any>({ a: 1 });
        const v1 = store.getValues();
        const v2 = store.getValues();
        assert.ok(Object.is(v1, v2), "no mutation → same cached reference");
    });

    test("setValue (plain) invalidates the snapshot", () => {
        const store = new FieldStore<any>({ a: 1 });
        const before = store.getValues();
        store.setValue("a", 2);
        const after = store.getValues();
        assert.notEqual(before, after, "new snapshot object after mutation");
        assert.equal(after.a, 2);
    });

    test("setValue (dot) invalidates the snapshot", () => {
        const store = new FieldStore<any>({});
        store.setValue("u.name", "Jane");
        const before = store.getValues();
        store.setValue("u.name", "Kim");
        const after = store.getValues();
        assert.notEqual(before, after);
        assert.equal(after.u.name, "Kim");
    });

    test("setValues invalidates the snapshot", () => {
        const store = new FieldStore<any>({ a: 1 });
        const before = store.getValues();
        store.setValues({ a: 5 });
        const after = store.getValues();
        assert.notEqual(before, after);
        assert.equal(after.a, 5);
    });

    test("setBatch invalidates the snapshot", () => {
        const store = new FieldStore<any>({ a: 1 });
        const before = store.getValues();
        store.setBatch({ a: 7 });
        const after = store.getValues();
        assert.notEqual(before, after);
        assert.equal(after.a, 7);
    });

    test("setInitialValues invalidates the snapshot", () => {
        const store = new FieldStore<any>({ a: 1 });
        const before = store.getValues();
        store.setInitialValues({ a: 9 });
        const after = store.getValues();
        assert.notEqual(before, after);
        assert.equal(after.a, 9);
    });

    test("reset invalidates the snapshot", () => {
        const store = new FieldStore<any>({ a: 1 });
        store.setValue("a", 2);
        const before = store.getValues();
        store.reset();
        const after = store.getValues();
        assert.notEqual(before, after);
        assert.equal(after.a, 1);
    });

    test("removeField invalidates the snapshot and does not corrupt the old one", () => {
        const store = new FieldStore<any>({ a: 1, b: 2 });
        const before = store.getValues();
        store.removeField("a");
        const after = store.getValues();
        assert.notEqual(before, after);
        assert.equal(after.a, undefined);
        assert.equal(after.b, 2);
        // 이전 스냅샷(캐시였던 객체)은 오염되지 않아야 한다
        assert.equal(before.a, 1, "previously returned snapshot untouched");
    });

    test("subscribing to a brand-new plain field appears in the next snapshot", () => {
        const store = new FieldStore<any>({ a: 1 });
        const before = store.getValues();
        store.subscribe("newField", () => {});
        const after = store.getValues();
        assert.notEqual(before, after, "field creation invalidates the cache");
        assert.ok("newField" in after, "created field key present");
    });

    test("reset with listeners reading getValues mid-way still yields a fresh snapshot", () => {
        const store = new FieldStore<any>({});
        // Pure Zero-Config: dot 구독 필드는 "" 로, 나머지 일반 필드도 "" 로 리셋된다
        store.subscribe("form.name", () => {
            // 리셋 도중 리스너가 캐시를 재구축하는 상황 재현
            store.getValues();
        });
        store.setValue("form.name", "Jane");
        store.setValue("plain", "x");
        store.reset();
        const after = store.getValues();
        assert.equal(after.plain, "", "direct field.value writes visible after reset");
    });
});

describe("F8: wildcard watchers kept in a separate list", () => {
    test("wildcard watcher still fires on matching path changes", () => {
        const store = new FieldStore<any>({});
        store.setValue("todos", [{ done: false }]);

        const calls: any[] = [];
        const cleanup = store.watch("todos.*.done", (value) => calls.push(value));

        store.setValue("todos.0.done", true);
        assert.equal(calls.length, 1);
        assert.equal(calls[0], true);

        // cleanup 후에는 더 이상 깨어나지 않는다
        cleanup();
        store.setValue("todos.0.done", false);
        assert.equal(calls.length, 1, "no fire after cleanup");
    });

    test("hasWatcher/getWatchedPaths still report wildcard paths", () => {
        const store = new FieldStore<any>({});
        const cleanup = store.watch("items.*.qty", () => {});
        assert.equal(store.hasWatcher("items.*.qty"), true);
        assert.ok(store.getWatchedPaths().includes("items.*.qty"));
        cleanup();
        assert.equal(store.hasWatcher("items.*.qty"), false);
    });

    test("exact watcher unaffected by the wildcard split", () => {
        const store = new FieldStore<any>({});
        const calls: any[] = [];
        store.watch("count", (v) => calls.push(v));
        store.setValue("count", 1);
        assert.deepEqual(calls, [1]);
    });
});

describe("getApi(): stable pre-bound imperative surface", () => {
    test("returns the SAME object across calls (per-instance cached)", () => {
        const store = new FieldStore<any>({});
        assert.ok(Object.is(store.getApi(), store.getApi()));
    });

    test("methods are pre-bound: destructured calls work", () => {
        const store = new FieldStore<any>({ a: 1 });
        const { setValue, getValue, getValues, setBatch, hasField, subscribe } =
            store.getApi();

        setValue("a", 2);
        assert.equal(getValue("a"), 2);

        setBatch({ "b.c": 3 });
        assert.equal(getValue("b.c"), 3);
        assert.equal(hasField("b.c"), true);

        let fired = 0;
        const unsub = subscribe("a", () => fired++);
        setValue("a", 5);
        assert.equal(fired, 1);
        unsub();

        assert.equal(getValues().a, 5);
    });

    test("reset/removeField/setInitialValues/refreshFields exposed and functional", () => {
        const store = new FieldStore<any>({ a: 1 });
        const api = store.getApi();

        api.setValue("a", 2);
        api.reset();
        assert.equal(api.getValue("a"), 1);

        api.setInitialValues({ a: 7 } as any);
        assert.equal(api.getValue("a"), 7);

        api.setValue("b", 1);
        api.removeField("b");
        assert.equal(api.getValue("b"), undefined);

        // refreshFields 는 예외 없이 동작해야 한다 (마이크로태스크 알림)
        assert.doesNotThrow(() => api.refreshFields("a"));
    });

    test("different store instances get different api objects", () => {
        const s1 = new FieldStore<any>({});
        const s2 = new FieldStore<any>({});
        assert.notEqual(s1.getApi(), s2.getApi());
    });
});

describe("F4: bounded path-parse cache (functional smoke)", () => {
    test("thousands of distinct virtualized index paths keep working past the cap", () => {
        const store = new FieldStore<any>({});
        // 캐시 상한(2048)을 넘는 고유 경로 — 상한 이후는 비캐시 파싱으로 동작해야 한다
        for (let i = 0; i < 3000; i += 500) {
            store.setValue(`list.${i}.name`, `item-${i}`);
        }
        store.setValue("list.2999.name", "last");
        assert.equal(store.getValue("list.2999.name"), "last");
        assert.equal(store.getValue("list.0.name"), "item-0");
        assert.equal(store.getValue("list.1000.name"), "item-1000");
    });

    test("prototype pollution stays blocked with the parse cache in place", () => {
        const store = new FieldStore<any>({});
        store.setValue("__proto__.polluted", true);
        assert.equal(({} as any).polluted, undefined);
        store.setValue("a.__proto__.polluted", true);
        assert.equal(({} as any).polluted, undefined);
        store.setValue("a.constructor.prototype.polluted", true);
        assert.equal(({} as any).polluted, undefined);
    });
});
