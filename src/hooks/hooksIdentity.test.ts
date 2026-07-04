/**
 * hooksIdentity.test.ts
 *
 * 훅 반환 객체의 재렌더 간 식별자 안정성(= 렌더당 할당 제거) 검증
 * Verifies identity stability of hook return objects across re-renders
 *
 * node:module registerHooks 로 "react" 를 tests/reactShim.mjs 로 리다이렉트하여
 * React 없이 실제 훅 코드를 실행한다. node --test 는 테스트 파일별로 프로세스를
 * 분리하므로 이 리다이렉트는 다른 테스트 파일에 영향을 주지 않는다. (Node >= 22.15)
 * Redirects "react" to the mini runtime via registerHooks; node --test isolates
 * each file in its own process, so the redirect cannot leak into other tests.
 *
 * @license MIT License
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { registerHooks, createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import path from "node:path";

// 미니 React 런타임 경로 / path to the mini React runtime
const shimUrl = pathToFileURL(
    path.join(__dirname, "../../tests/reactShim.mjs"),
).href;

// "react" / "react/jsx-runtime" 를 미니 런타임으로 리다이렉트 / redirect react to the shim
registerHooks({
    resolve(specifier, context, nextResolve) {
        if (
            specifier === "react" ||
            specifier === "react/jsx-runtime" ||
            specifier === "react/jsx-dev-runtime"
        ) {
            return { url: shimUrl, shortCircuit: true };
        }
        return nextResolve(specifier, context);
    },
});

// 리다이렉트 등록 이후에 훅 모듈을 로드해야 한다 (정적 import 금지)
// Hook modules must load after the redirect is registered (no static imports)
const requireAfterShim = createRequire(__filename);
const { createRenderer } = requireAfterShim("react");
const { useFormaState, useStoreValue } = requireAfterShim("./useFormaState");
const { useForm } = requireAfterShim("./useForm");
const { useGlobalFormaState } = requireAfterShim("./useGlobalFormaState");
const { GlobalFormaContext } = requireAfterShim(
    "../contexts/GlobalFormaContext",
);
const { FieldStore } = requireAfterShim("../core/FieldStore");

describe("useFormaState — 재렌더 식별자 안정성 (identity stability)", () => {
    it("재렌더 간 반환 객체와 모든 메서드가 동일 참조를 유지한다", () => {
        const r = createRenderer(() =>
            useFormaState({ a: 1, b: { c: 2 } } as any),
        );
        const s1 = r.render({});
        const s2 = r.render({});
        const s3 = r.render({});

        assert.equal(s1, s2); // 반환 객체 자체가 안정 / the return object itself is stable
        assert.equal(s2, s3);
        assert.equal(s1.setValue, s3.setValue);
        assert.equal(s1.useValue, s3.useValue);
        assert.equal(s1.handleChange, s3.handleChange);
        assert.equal(s1.actions, s3.actions);
        assert.equal(s1._store, s3._store);
    });

    it("setValue/useValue/getValue/getValues 가 동작한다", () => {
        const r = createRenderer(() => useFormaState({ a: 1 } as any));
        const s = r.render({});
        s.setValue("a", 10);
        assert.equal(s.getValue("a"), 10);
        assert.equal(s.useValue("a"), 10);
        assert.equal((s.getValues() as any).a, 10);
    });

    it("watch 는 인라인 객체가 매 렌더 새 참조로 와도 1회만 등록된다 (P0-3)", () => {
        const store = new FieldStore({ a: 1 });
        let watchRegisterCount = 0;
        const originalWatch = store.watch.bind(store);
        (store as any).watch = (p: string, cb: any) => {
            watchRegisterCount++;
            return originalWatch(p, cb);
        };

        const events: any[] = [];
        const r = createRenderer(() =>
            useFormaState({ a: 1 } as any, {
                _externalStore: store,
                // 인라인 watch — 매 렌더 새 객체 / inline watch, new object per render
                watch: {
                    a: (_ctx: any, value: any, prev: any) => {
                        events.push([value, prev]);
                    },
                },
            }),
        );

        r.render({});
        r.render({});
        r.render({});
        assert.equal(watchRegisterCount, 1); // 재등록 없음 / no re-registration

        store.setValue("a", 2);
        assert.deepEqual(events, [[2, 1]]);

        r.unmount();
        store.setValue("a", 3);
        assert.equal(events.length, 1); // 언마운트 시 해제 / unsubscribed on unmount
    });

    it("watch 핸들러는 최신 렌더의 함수 본문을 반영한다", () => {
        const store = new FieldStore({ a: 1 });
        const seen: string[] = [];
        const r = createRenderer((tag: string) =>
            useFormaState({ a: 1 } as any, {
                _externalStore: store,
                watch: {
                    a: () => {
                        seen.push(tag);
                    },
                },
            }),
        );
        r.render("first");
        r.render("second");
        store.setValue("a", 2);
        assert.deepEqual(seen, ["second"]); // 최신 핸들러 반영 / latest handler used
    });

    it("actions 는 식별자가 안정적이면서 최신 정의를 실행하고, ctx.values 는 공유 캐시의 복사본이다", () => {
        const store = new FieldStore({ a: 1 });
        let captured: any = null;
        const r = createRenderer((mult: number) =>
            useFormaState({ a: 1 } as any, {
                _externalStore: store,
                actions: {
                    boost: (ctx: any) => {
                        captured = ctx.values;
                        ctx.setValue("a", ctx.values.a * mult);
                    },
                },
            }),
        );
        const s1 = r.render(2);
        s1.actions.boost();
        assert.equal(store.getValue("a"), 2);
        assert.notEqual(captured, store.getValues()); // 얕은 복사 (공유 캐시 아님) / shallow copy

        const s2 = r.render(10);
        assert.equal(s1.actions, s2.actions); // Proxy identity 안정 / stable proxy identity
        s2.actions.boost();
        assert.equal(store.getValue("a"), 20); // 최신 정의(mult=10) 반영 / latest definition used
        assert.deepEqual(Object.keys(s2.actions), ["boost"]); // ownKeys 열거 동작 / enumeration works
    });
});

describe("useForm — 재렌더 식별자 안정성과 동작 (P2)", () => {
    it("인라인 onSubmit/onValidate 가 와도 반환 객체 참조가 유지된다", () => {
        const r = createRenderer(() =>
            useForm({
                initialValues: { name: "kim" } as any,
                onSubmit: () => true, // 인라인 — 매 렌더 새 참조 / inline, new ref per render
                onValidate: () => true,
            }),
        );
        const f1 = r.render({});
        const f2 = r.render({});
        assert.equal(f1, f2); // useMemo 가 실제로 유지됨 / the memo actually holds
        assert.equal(f1.submit, f2.submit);
        assert.equal(f1.handleFormChange, f2.handleFormChange);
        assert.equal(f1.useFormValue, f2.useFormValue);
        assert.equal(f1.actions, f2.actions);
    });

    it("values 는 접근 시점 최신 스냅샷(복사본)을 반환한다", () => {
        const r = createRenderer(() =>
            useForm({ initialValues: { name: "kim" } as any }),
        );
        const f = r.render({});
        f.setFormValue("name", "lee");
        assert.equal((f.values as any).name, "lee"); // 재렌더 없이도 최신 / fresh without re-render
        assert.notEqual(f.values, f._store.getValues()); // 공유 캐시 노출 아님 / not the shared cache
    });

    it("submit 은 최신 onSubmit 핸들러를 사용한다 (ref 패턴)", async () => {
        const calls: string[] = [];
        const r = createRenderer((tag: string) =>
            useForm({
                initialValues: { name: "kim" } as any,
                onSubmit: () => {
                    calls.push(tag);
                    return true;
                },
            }),
        );
        const f1 = r.render("v1");
        r.render("v2");
        const ok = await f1.submit();
        assert.equal(ok, true);
        assert.deepEqual(calls, ["v2"]); // 최신 핸들러 반영 / latest handler used
    });

    it("useValue/useFormValue 는 undefined 를 빈 문자열로 반환한다 (MUI 호환)", () => {
        const r = createRenderer(() =>
            useForm({ initialValues: { name: "kim" } as any }),
        );
        const f = r.render({});
        assert.equal(f.useFormValue("name"), "kim");
        assert.equal(f.useFormValue("nope"), "");
        assert.equal(f.useValue("nope"), "");
    });
});

describe("useGlobalFormaState — 재렌더 식별자 안정성 (P1)", () => {
    // GlobalFormaProvider 대체용 가짜 컨텍스트 / fake context replacing the provider
    function installFakeContext() {
        const stores = new Map<string, any>();
        const actionsMap = new Map<string, any>();
        const fake = {
            getOrCreateStore: (id: string) => {
                if (!stores.has(id)) stores.set(id, new FieldStore({}));
                return stores.get(id);
            },
            incrementRef: () => {},
            decrementRef: () => {},
            validateAndStoreAutoCleanupSetting: () => {},
            registerActions: (id: string, a: any) => actionsMap.set(id, a),
            getActions: (id: string) => actionsMap.get(id),
            storagePrefix: undefined,
        };
        (GlobalFormaContext as any)._currentValue = fake;
        return fake;
    }

    it("반환 객체와 actions Proxy 가 재렌더 간 동일 참조를 유지한다", () => {
        installFakeContext();
        const r = createRenderer(() =>
            useGlobalFormaState({
                stateId: "identity-test",
                initialValues: { count: 0 } as any,
                // 인라인 actions — 매 렌더 새 참조 / inline actions, new ref per render
                actions: {
                    inc: (ctx: any) => ctx.setValue("count", ctx.values.count + 1),
                },
            }),
        );
        const g1 = r.render({});
        const g2 = r.render({});

        assert.equal(g1, g2); // 반환 객체 안정 / stable return object
        assert.equal(g1.actions, g2.actions); // Proxy 1회 생성 / proxy created once
        assert.equal(g1.setValue, g2.setValue);

        g2.actions.inc();
        assert.equal(g2.getValue("count"), 1); // Proxy 경유 실행 / executes through proxy
    });
});

describe("useStoreValue — 가상목록 셀 경량 구독 (P0-1)", () => {
    it("store 의 특정 경로 값을 구독해 반환한다", () => {
        const store = new FieldStore({ rows: [{ name: "r0" }] });
        const r = createRenderer(() => useStoreValue(store, "rows.0.name"));
        assert.equal(r.render({}), "r0");
        store.setValue("rows.0.name", "r0-edited");
        assert.equal(r.render({}), "r0-edited");
    });
});
