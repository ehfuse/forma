/**
 * FieldStore.test.ts
 *
 * FieldStore 의 구독자 알림 매칭 동작 테스트 | Tests for FieldStore subscriber notification matching
 *
 * 특히 단건 setValue 와 배치 setValues/setBatch 가 "동일한 변경"에 대해
 * "동일한 구독자 집합"을 깨우는지(notification parity)를 고정한다.
 * In particular, locks the notification parity between single setValue and
 * batched setValues/setBatch for an equivalent change.
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { FieldStore } from "./FieldStore";

/**
 * 특정 경로 구독자가 호출된 횟수를 세는 헬퍼 | Helper that counts how many times a path subscriber fires
 */
function trackSubscription(store: FieldStore<any>, path: string) {
    const state = { count: 0 };
    const unsubscribe = store.subscribe(path, () => {
        state.count++;
    });
    return { state, unsubscribe };
}

describe("FieldStore notification matching", () => {
    test("exact dot-path subscriber is notified on setValue", () => {
        const store = new FieldStore<any>({});
        const sub = trackSubscription(store, "user.name");
        store.setValue("user.name", "Jane");
        assert.equal(sub.state.count, 1);
    });

    test("parent subscriber is notified when a child path changes (setValue)", () => {
        const store = new FieldStore<any>({});
        const parent = trackSubscription(store, "user");
        store.setValue("user.name", "Jane");
        assert.ok(
            parent.state.count >= 1,
            "parent 'user' should be notified when 'user.name' changes",
        );
    });

    test("child subscriber is notified when the parent object is replaced (setValue)", () => {
        const store = new FieldStore<any>({});
        store.setValue("user.name", "Jane");
        const child = trackSubscription(store, "user.name");
        store.setValue("user", { name: "Bob" });
        assert.equal(
            child.state.count,
            1,
            "child 'user.name' should fire when 'user' replaced with a changed value",
        );
    });

    test("child subscriber is NOT notified when replaced parent keeps same child value", () => {
        const store = new FieldStore<any>({});
        store.setValue("user", { name: "Jane", age: 1 });
        const child = trackSubscription(store, "user.name");
        // name 은 동일, age 만 변경 → user.name 구독자는 깨우면 안 됨
        store.setValue("user", { name: "Jane", age: 2 });
        assert.equal(child.state.count, 0);
    });

    test("length subscriber fires only when array length changes", () => {
        const store = new FieldStore<any>({});
        store.setValue("items", [1, 2]);
        const len = trackSubscription(store, "items.length");
        store.setValue("items", [1, 2, 3]); // length 2 -> 3
        assert.equal(len.state.count, 1);
        store.setValue("items", [9, 8, 7]); // length unchanged
        assert.equal(len.state.count, 1);
    });

    describe("parity: setValue vs setValues (batch)", () => {
        test("nested set notifies the SAME subscribers via single and batch", () => {
            // 단건 경로 | single
            const single = new FieldStore<any>({});
            const sExact = trackSubscription(single, "a.b.c");
            const sParent = trackSubscription(single, "a");
            single.setValue("a.b.c", 1);

            // 배치 경로 | batch
            const batch = new FieldStore<any>({});
            const bExact = trackSubscription(batch, "a.b.c");
            const bParent = trackSubscription(batch, "a");
            batch.setValues({ "a.b.c": 1 });

            assert.equal(
                bExact.state.count,
                sExact.state.count,
                "exact subscriber parity",
            );
            assert.equal(
                bParent.state.count,
                sParent.state.count,
                "parent subscriber parity",
            );
        });

        test("MULTI-LEVEL parent (a.b) parity: single vs batch on a.b.c change", () => {
            // 다단계 부모 경로 a.b 를 구독한 상태에서 a.b.c 를 변경.
            // 단건 setValue 는 부모 dot-path 구독자(a.b)를 깨우는데(분기 2),
            // 배치 setValues 도 동일하게 깨워야 한다.
            const single = new FieldStore<any>({});
            const sParentDot = trackSubscription(single, "a.b");
            single.setValue("a.b.c", 1);

            const batch = new FieldStore<any>({});
            const bParentDot = trackSubscription(batch, "a.b");
            batch.setValues({ "a.b.c": 1 });

            assert.equal(
                bParentDot.state.count,
                sParentDot.state.count,
                "multi-level parent 'a.b' parity between single and batch",
            );
        });

        test("nested set notifies the SAME subscribers via single and setBatch", () => {
            const single = new FieldStore<any>({});
            const sParent = trackSubscription(single, "a");
            single.setValue("a.b.c", 1);

            const batch = new FieldStore<any>({});
            const bParent = trackSubscription(batch, "a");
            batch.setBatch({ "a.b.c": 1 });

            assert.equal(bParent.state.count, sParent.state.count);
        });
    });

    // ── 일반 필드(점 없는 루트) 전체 교체 시 자식 dot 구독자 알림 5개 분기 ──
    // Plain root field replacement → child dot-subscriber notification (5 branches)
    describe("plain-field replacement: child dot-subscriber notification", () => {
        // 분기3: 객체 교체 - 바뀐 자식만 / object replace - only changed child
        test("object replace notifies only the child whose value changed", () => {
            const store = new FieldStore<any>({});
            store.setValue("user", { name: "Jane", age: 1 });
            const name = trackSubscription(store, "user.name");
            const age = trackSubscription(store, "user.age");
            store.setValue("user", { name: "Jane", age: 2 });
            assert.equal(name.state.count, 0, "name unchanged → no fire");
            assert.equal(age.state.count, 1, "age changed → fire");
        });

        // 분기4: 배열 교체 - 바뀐 인덱스만 / array replace - only changed index
        test("array replace notifies only the index whose value changed", () => {
            const store = new FieldStore<any>({});
            store.setValue("items", [{ v: 1 }, { v: 2 }]);
            const i0 = trackSubscription(store, "items.0.v");
            const i1 = trackSubscription(store, "items.1.v");
            store.setValue("items", [{ v: 1 }, { v: 99 }]);
            assert.equal(i0.state.count, 0);
            assert.equal(i1.state.count, 1);
        });

        // 분기5: undefined→array 또는 array→undefined / array created or removed
        test("array created/removed notifies descendant subscribers", () => {
            const store = new FieldStore<any>({});
            const i0 = trackSubscription(store, "items.0");
            store.setValue("items", [10]); // undefined → array
            assert.ok(i0.state.count >= 1, "creation fires");
            const before = i0.state.count;
            store.setValue("items", undefined); // array → undefined
            assert.ok(i0.state.count > before, "removal fires");
        });

        // 분기6: 객체 → null·undefined·원시값 / object cleared to null-undefined-primitive
        test("object cleared to null notifies descendant subscribers", () => {
            const store = new FieldStore<any>({});
            store.setValue("upload", { progress: 100, index: 1 });
            const progress = trackSubscription(store, "upload.progress");
            const index = trackSubscription(store, "upload.index");
            const missing = trackSubscription(store, "upload.other");
            store.setValue("upload", null); // 업로드 완료 후 통째로 비운다 / cleared as a whole
            assert.equal(progress.state.count, 1, "progress disappeared → fire");
            assert.equal(index.state.count, 1, "index disappeared → fire");
            assert.equal(missing.state.count, 0, "already undefined → no fire");
        });

        test("object replaced by a primitive notifies descendant subscribers", () => {
            const store = new FieldStore<any>({});
            store.setValue("upload", { progress: 50 });
            const progress = trackSubscription(store, "upload.progress");
            store.setValue("upload", 0);
            assert.equal(progress.state.count, 1);
        });

        // 분기2: .length / length subscriber
        test("plain array length subscriber fires on length change only", () => {
            const store = new FieldStore<any>({});
            store.setValue("items", [1]);
            const len = trackSubscription(store, "items.length");
            store.setValue("items", [1, 2]); // 1 -> 2
            assert.equal(len.state.count, 1);
            store.setValue("items", [3, 4]); // same length
            assert.equal(len.state.count, 1);
        });
    });

    // 단건 setValue vs 배치 setValues 가 plain-field 교체에서도 동일 구독자 깨우기
    // Parity for plain-field replacement between single and batch
    describe("parity: plain-field replacement single vs batch", () => {
        const scenarios: Array<{
            name: string;
            seed: any;
            next: any;
            subs: string[];
        }> = [
            {
                name: "object child changed",
                seed: { user: { name: "Jane", age: 1 } },
                next: { user: { name: "Jane", age: 2 } },
                subs: ["user.name", "user.age"],
            },
            {
                name: "object cleared to null",
                seed: { upload: { progress: 100, index: 1 } },
                next: { upload: null },
                subs: ["upload.progress", "upload.index"],
            },
            {
                name: "array index changed",
                seed: { items: [{ v: 1 }, { v: 2 }] },
                next: { items: [{ v: 1 }, { v: 99 }] },
                subs: ["items.0.v", "items.1.v", "items.length"],
            },
            {
                name: "array length changed",
                seed: { items: [1] },
                next: { items: [1, 2] },
                subs: ["items.length", "items.0", "items.1"],
            },
            {
                name: "array removed",
                seed: { items: [1, 2] },
                next: { items: undefined },
                subs: ["items.0", "items.length"],
            },
        ];

        for (const sc of scenarios) {
            test(sc.name, () => {
                const rootKey = Object.keys(sc.next)[0];

                const single = new FieldStore<any>({});
                single.setValue(rootKey, sc.seed[rootKey]);
                const sCounts = sc.subs.map((p) => trackSubscription(single, p));
                single.setValue(rootKey, sc.next[rootKey]);

                const batch = new FieldStore<any>({});
                batch.setValue(rootKey, sc.seed[rootKey]);
                const bCounts = sc.subs.map((p) => trackSubscription(batch, p));
                batch.setValues({ [rootKey]: sc.next[rootKey] });

                sc.subs.forEach((p, i) => {
                    assert.equal(
                        bCounts[i].state.count,
                        sCounts[i].state.count,
                        `'${p}' parity (${sc.name})`,
                    );
                });
            });
        }
    });

    // ── 변경 게이트의 의도적 차이 (운영 결정) ──
    // setValue 일반필드: 빠른 참조비교(field.value !== value) — 새 참조면 항상 진행
    // setValues/setBatch: deepEqual 깊은 비교 — 의미상 같으면 skip
    // 아래 테스트는 이 "의도된 차이"를 고정한다. (변경 시 의식적으로 깨지게)
    // Intentional difference between the change gates (operational decision):
    //  - setValue plain field uses fast reference compare (always proceeds on a new ref)
    //  - setValues/setBatch use deepEqual (skips when deeply equal)
    describe("change-gate semantics (setValue ref-compare vs batch deepEqual)", () => {
        test("setValue with new ref of equal object DOES notify (ref gate)", () => {
            const store = new FieldStore<any>({});
            store.setValue("user", { a: 1, b: 2 });
            const sub = trackSubscription(store, "user");
            store.setValue("user", { b: 2, a: 1 }); // 새 참조, 깊은 값 동일
            assert.equal(
                sub.state.count,
                1,
                "setValue uses reference gate → still notifies",
            );
        });

        test("setValues with deeply-equal value does NOT notify (deepEqual gate)", () => {
            const store = new FieldStore<any>({});
            store.setValue("user", { a: 1, b: 2 });
            const sub = trackSubscription(store, "user");
            store.setValues({ user: { b: 2, a: 1 } }); // 깊은 값 동일
            assert.equal(
                sub.state.count,
                0,
                "setValues uses deepEqual gate → skips",
            );
        });
    });

    test("prototype pollution is blocked via setValue dot-path", () => {
        const store = new FieldStore<any>({});
        store.setValue("__proto__.polluted", true);
        assert.equal(({} as any).polluted, undefined);
        store.setValue("a.__proto__.polluted", true);
        assert.equal(({} as any).polluted, undefined);
    });
});
