/**
 * NestedSubscriptionTest.tsx
 *
 * 중첩 경로 변경 시 부모 구독자 알림 테스트
 * Test parent subscriber notification when nested path changes
 */

import React from "react";
import { useGlobalFormaState } from "@ehfuse/forma";

interface Checkbox {
    id: number;
    label: string;
    checked: boolean;
}

interface TestState {
    checkboxes: Checkbox[];
    counter: number;
}

export const NestedSubscriptionTest: React.FC = () => {
    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>중첩 경로 구독 테스트</h1>
            <p style={{ color: "#666", marginBottom: "30px" }}>
                checkboxes.0.checked를 변경할 때 checkboxes 전체 구독자가
                리렌더되는지 테스트
            </p>

            <div style={{ display: "grid", gap: "20px" }}>
                <CheckboxController />
                <WholeArraySubscriber />
                <IndividualCheckboxSubscriber index={0} />
                <IndividualCheckboxSubscriber index={1} />
                <IndividualCheckboxSubscriber index={2} />
            </div>
        </div>
    );
};

// 체크박스를 제어하는 컴포넌트 (setValue 호출)
const CheckboxController: React.FC = () => {
    const renderCount = React.useRef(0);
    renderCount.current++;

    const state = useGlobalFormaState<TestState>({
        stateId: "nested-subscription-test",
        initialValues: {
            checkboxes: [
                { id: 1, label: "Option 1", checked: false },
                { id: 2, label: "Option 2", checked: false },
                { id: 3, label: "Option 3", checked: false },
            ],
            counter: 0,
        },
    });

    const handleToggle = (index: number) => {
        const current = state.getValue(`checkboxes.${index}.checked`);
        console.log(
            `[Controller] Toggling checkboxes.${index}.checked:`,
            !current
        );
        state.setValue(`checkboxes.${index}.checked`, !current);
    };

    const handleReplaceArray = () => {
        const newCheckboxes = [
            { id: 1, label: "Option 1", checked: true },
            { id: 2, label: "Option 2", checked: true },
            { id: 3, label: "Option 3", checked: true },
        ];
        console.log("[Controller] Replacing entire checkboxes array");
        state.setValue("checkboxes", newCheckboxes);
    };

    return (
        <div
            style={{
                padding: "15px",
                border: "2px solid #333",
                borderRadius: "8px",
                backgroundColor: "#f5f5f5",
            }}
        >
            <h3>Controller (렌더: {renderCount.current})</h3>
            <p style={{ fontSize: "14px", color: "#666" }}>
                setValue로 체크박스 상태를 변경합니다
            </p>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginTop: "10px",
                }}
            >
                <button
                    onClick={() => handleToggle(0)}
                    style={{ padding: "8px 16px" }}
                >
                    Toggle Index 0
                </button>
                <button
                    onClick={() => handleToggle(1)}
                    style={{ padding: "8px 16px" }}
                >
                    Toggle Index 1
                </button>
                <button
                    onClick={() => handleToggle(2)}
                    style={{ padding: "8px 16px" }}
                >
                    Toggle Index 2
                </button>
                <button
                    onClick={handleReplaceArray}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#ff6b6b",
                        color: "white",
                        border: "none",
                    }}
                >
                    Replace Entire Array
                </button>
            </div>
        </div>
    );
};

// checkboxes 전체 배열을 구독하는 컴포넌트
const WholeArraySubscriber: React.FC = () => {
    const renderCount = React.useRef(0);
    renderCount.current++;

    const state = useGlobalFormaState<TestState>({
        stateId: "nested-subscription-test",
    });
    const checkboxes = state.useValue("checkboxes");

    console.log("[WholeArraySubscriber] Rendered. checkboxes:", checkboxes);

    return (
        <div
            style={{
                padding: "15px",
                border: "2px solid #e03131",
                borderRadius: "8px",
                backgroundColor: "#fff5f5",
            }}
        >
            <h3 style={{ color: "#e03131" }}>
                🔴 전체 배열 구독자 (렌더: {renderCount.current})
            </h3>
            <p style={{ fontSize: "14px", color: "#666" }}>
                useValue('checkboxes') - 자식 변경 시에도 리렌더되어야 함
            </p>

            <div
                style={{
                    marginTop: "10px",
                    fontFamily: "monospace",
                    fontSize: "12px",
                }}
            >
                {checkboxes &&
                    checkboxes.map((cb: Checkbox, idx: number) => (
                        <div key={cb.id} style={{ padding: "4px 0" }}>
                            [{idx}] {cb.label}:{" "}
                            <strong>
                                {cb.checked ? "✅ checked" : "⬜ unchecked"}
                            </strong>
                        </div>
                    ))}
            </div>

            {renderCount.current === 1 && (
                <div
                    style={{
                        marginTop: "10px",
                        padding: "10px",
                        backgroundColor: "#ffe3e3",
                        borderRadius: "4px",
                        fontSize: "13px",
                    }}
                >
                    ⚠️ 만약 개별 체크박스를 토글해도 이 숫자가 증가하지 않으면
                    버그입니다!
                </div>
            )}
        </div>
    );
};

// 개별 체크박스를 구독하는 컴포넌트
const IndividualCheckboxSubscriber: React.FC<{ index: number }> = ({
    index,
}) => {
    const renderCount = React.useRef(0);
    renderCount.current++;

    const state = useGlobalFormaState<TestState>({
        stateId: "nested-subscription-test",
    });
    const checked = state.useValue(`checkboxes.${index}.checked`);

    return (
        <div
            style={{
                padding: "15px",
                border: "2px solid #1971c2",
                borderRadius: "8px",
                backgroundColor: "#e7f5ff",
            }}
        >
            <h4 style={{ color: "#1971c2" }}>
                🔵 개별 구독자 [Index {index}] (렌더: {renderCount.current})
            </h4>
            <p style={{ fontSize: "14px", color: "#666" }}>
                useValue('checkboxes.{index}.checked')
            </p>
            <div style={{ marginTop: "10px", fontSize: "16px" }}>
                상태: <strong>{checked ? "✅ Checked" : "⬜ Unchecked"}</strong>
            </div>
        </div>
    );
};
