/**
 * storeSurface.test.ts
 *
 * store 수준 훅 표면(hook surface) 검증 테스트
 * Tests for the per-store cached hook surfaces
 *
 * React 런타임 없이(node:test) 표면의 식별자 안정성(= 렌더당 할당 제거)과
 * 위임 동작을 검증한다. useValue/useFormValue 는 순수 위임이므로
 * 가짜 필드 구독 훅을 주입해 동작을 확인한다.
 * Verifies identity stability (i.e. zero per-render closure churn) and
 * delegation behavior without a React runtime by injecting a fake field hook.
 *
 * @license MIT License
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FieldStore } from "../core/FieldStore";
import {
    getStateSurface,
    getFormSurface,
    type FieldValueHook,
} from "./storeSurface";

// 주입용 가짜 필드 구독 훅 — React 없이 현재 값을 그대로 반환한다
// Fake field-subscription hook for injection — returns the current value without React
const fakeFieldHook: FieldValueHook = (store, path) => store.getValue(path);

// 테스트용 스토어 생성 헬퍼 / helper creating a test store
function createStore() {
    return new FieldStore<{ name: string; age: number; done: boolean }>({
        name: "kim",
        age: 30,
        done: false,
    });
}

describe("getStateSurface — 식별자 안정성 (identity stability)", () => {
    it("같은 store 로 재호출(재렌더 시뮬레이션)해도 항상 동일한 객체를 반환한다", () => {
        const store = createStore();
        const first = getStateSurface(store, fakeFieldHook);

        // 1000 회 재렌더를 시뮬레이션 — 매번 같은 참조여야 한다 (렌더당 신규 클로저 0개)
        for (let i = 0; i < 1000; i++) {
            assert.equal(getStateSurface(store, fakeFieldHook), first);
        }

        // 표면 내부 함수들의 식별자도 안정적이다
        const again = getStateSurface(store, fakeFieldHook);
        assert.equal(again.setValue, first.setValue);
        assert.equal(again.useValue, first.useValue);
        assert.equal(again.handleChange, first.handleChange);
        assert.equal(again.setValues, first.setValues);
    });

    it("store 의 getApi() pre-bound 메서드를 그대로 재사용한다", () => {
        const store = createStore();
        const surface = getStateSurface(store, fakeFieldHook);
        const api = store.getApi();

        assert.equal(surface.setValue, api.setValue);
        assert.equal(surface.getValue, api.getValue);
        assert.equal(surface.getValues, api.getValues);
        assert.equal(surface.setBatch, api.setBatch);
        assert.equal(surface.reset, api.reset);
        assert.equal(surface.hasField, api.hasField);
        assert.equal(surface.removeField, api.removeField);
        assert.equal(surface.setInitialValues, api.setInitialValues);
        assert.equal(surface.refreshFields, api.refreshFields);
        assert.equal(surface._store, store);
    });

    it("다른 store 는 다른 표면을 받는다", () => {
        const a = getStateSurface(createStore(), fakeFieldHook);
        const b = getStateSurface(createStore(), fakeFieldHook);
        assert.notEqual(a, b);
    });
});

describe("getStateSurface — 동작 위임 (delegation behavior)", () => {
    it("useValue 는 주입된 필드 훅으로 위임한다", () => {
        const store = createStore();
        const surface = getStateSurface(store, fakeFieldHook);
        assert.equal(surface.useValue("name"), "kim");
        store.setValue("name", "lee");
        assert.equal(surface.useValue("name"), "lee");
    });

    it("setValues 는 병합 설정이며 공유 getValues() 캐시를 변형하지 않는다", () => {
        const store = createStore();
        const surface = getStateSurface(store, fakeFieldHook);

        // 변형 전 공유 스냅샷 확보 / capture the shared snapshot before mutation
        const before = store.getValues();
        assert.equal(before.age, 30);

        surface.setValues({ age: 31 });

        // 기존 스냅샷 객체는 그대로 (in-place 변형 없음) / old snapshot untouched
        assert.equal(before.age, 30);
        // 병합 결과 확인 / merged result
        assert.equal(store.getValue("age"), 31);
        assert.equal(store.getValue("name"), "kim");
    });

    it("handleChange 는 checkbox/number/Dayjs/null 을 정규화한다", () => {
        const store = createStore();
        const surface = getStateSurface(store, fakeFieldHook);

        // checkbox → checked 값 사용
        surface.handleChange({
            target: { name: "done", type: "checkbox", value: "on", checked: true },
        } as any);
        assert.equal(store.getValue("done"), true);

        // number → Number 변환
        surface.handleChange({
            target: { name: "age", type: "number", value: "42" },
        } as any);
        assert.equal(store.getValue("age"), 42);

        // Dayjs 유사 객체 → format("YYYY-MM-DD") 문자열
        surface.handleChange({
            target: {
                name: "name",
                type: "text",
                value: { format: () => "2026-07-04" },
            },
        } as any);
        assert.equal(store.getValue("name"), "2026-07-04");

        // null → undefined
        surface.handleChange({
            target: { name: "name", type: "text", value: null },
        } as any);
        assert.equal(store.getValue("name"), undefined);
    });

    it("handleChange 는 name 없는 이벤트를 무시한다 (경고만)", () => {
        const store = createStore();
        const surface = getStateSurface(store, fakeFieldHook);
        const before = store.getValues();

        // name 없는 이벤트 — 값 변화 없어야 한다 / no mutation for a nameless event
        surface.handleChange({ target: { value: "x" } } as any);
        assert.equal(store.getValues(), before); // 캐시 세대도 그대로 (쓰기 없음)
    });

    it("handleFormChange 는 handleChange 의 별칭이다", () => {
        const store = createStore();
        const surface = getStateSurface(store, fakeFieldHook);
        assert.equal(surface.handleFormChange, surface.handleChange);
    });

    it("subscribe 는 전체 변경 구독을 위임하고 해제 함수를 반환한다", () => {
        const store = createStore();
        const surface = getStateSurface(store, fakeFieldHook);

        let calls = 0;
        const unsubscribe = surface.subscribe(() => {
            calls++;
        });

        store.setValue("name", "park");
        assert.equal(calls, 1);

        unsubscribe();
        store.setValue("name", "choi");
        assert.equal(calls, 1);
    });
});

describe("getFormSurface — 식별자 안정성과 폼 위임 (identity + form delegation)", () => {
    it("같은 store 로 재호출해도 항상 동일한 객체를 반환한다", () => {
        const store = createStore();
        const first = getFormSurface(store, fakeFieldHook);
        for (let i = 0; i < 1000; i++) {
            assert.equal(getFormSurface(store, fakeFieldHook), first);
        }
        assert.equal(first.getFormValue, store.getApi().getValue);
        assert.equal(first.getFormValues, store.getApi().getValues);
    });

    it("useFormValue 는 undefined 를 빈 문자열로 변환한다 (MUI 호환)", () => {
        const store = createStore();
        const surface = getFormSurface(store, fakeFieldHook);
        assert.equal(surface.useFormValue("name"), "kim");
        assert.equal(surface.useFormValue("missing_field"), "");
        // useValue 는 useFormValue 별칭 / useValue aliases useFormValue
        assert.equal(surface.useValue, surface.useFormValue);
    });

    it("handleFormChange 는 (name, value) 직접 호출과 이벤트 객체를 모두 지원한다", () => {
        const store = createStore();
        const surface = getFormSurface(store, fakeFieldHook);

        // (name, value) 직접 호출 / direct (name, value) call
        (surface.handleFormChange as any)("name", "direct");
        assert.equal(store.getValue("name"), "direct");

        // 이벤트 객체 (checkbox) / event object (checkbox)
        (surface.handleFormChange as any)({
            target: { name: "done", type: "checkbox", value: "on", checked: true },
        });
        assert.equal(store.getValue("done"), true);

        // 이벤트 객체 (number) / event object (number)
        (surface.handleFormChange as any)({
            target: { name: "age", type: "number", value: "7" },
        });
        assert.equal(store.getValue("age"), 7);

        // null → undefined 정규화 / null → undefined
        (surface.handleFormChange as any)("name", null);
        assert.equal(store.getValue("name"), undefined);
    });

    it("setFormValue 는 Dayjs 유사 객체와 null 을 정규화한다", () => {
        const store = createStore();
        const surface = getFormSurface(store, fakeFieldHook);

        surface.setFormValue("name", { format: () => "2026-01-01" });
        assert.equal(store.getValue("name"), "2026-01-01");

        surface.setFormValue("name", null);
        assert.equal(store.getValue("name"), undefined);
    });

    it("handleDatePickerChange 는 커링된 핸들러를 반환한다", () => {
        const store = createStore();
        const surface = getFormSurface(store, fakeFieldHook);

        const onChange = surface.handleDatePickerChange("name");
        onChange({ format: () => "2027-12-31" });
        assert.equal(store.getValue("name"), "2027-12-31");

        onChange(null);
        assert.equal(store.getValue("name"), undefined);
    });

    it("setFormValues 는 state 표면의 병합 setValues 를 재사용한다", () => {
        const store = createStore();
        const formSurface = getFormSurface(store, fakeFieldHook);
        const stateSurface = getStateSurface(store, fakeFieldHook);
        assert.equal(formSurface.setFormValues, stateSurface.setValues);

        formSurface.setFormValues({ age: 99 });
        assert.equal(store.getValue("age"), 99);
        assert.equal(store.getValue("name"), "kim"); // 병합 유지 / merge preserved
    });
});
