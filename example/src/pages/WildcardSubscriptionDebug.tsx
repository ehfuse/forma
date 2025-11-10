import React, { useState, useRef, useCallback } from "react";
import { useGlobalFormaState } from "../../../hooks/useGlobalFormaState";

const WildcardSubscriptionDebug: React.FC = () => {
    const [stateId] = useState("wildcard-debug-test");
    const subscriptionCountRef = useRef(0);
    const renderCountRef = useRef(0);

    // 초기값 없이 생성
    const state = useGlobalFormaState({
        stateId,
    });

    renderCountRef.current += 1;

    // "*" 구독 테스트 - 구독 콜백에서 로깅
    const allValuesResult = React.useMemo(() => {
        const originalUseValue = state.useValue;

        // useValue를 래핑해서 호출 횟수 추적
        const wrappedUseValue = (path: string) => {
            if (path === "*") {
                subscriptionCountRef.current += 1;
                console.log(
                    `[WildcardDebug] useValue("*") 호출 #${subscriptionCountRef.current}`
                );

                const store = (state as any)._store;
                const result = store.getValue("*");

                console.log(
                    `[WildcardDebug] store.getValue("*") 결과:`,
                    result
                );
                console.log(
                    `[WildcardDebug] 현재 Fields Map:`,
                    Array.from(store.fields.entries())
                );
                console.log(
                    `[WildcardDebug] Global Listeners 수:`,
                    store.globalListeners.size
                );

                return result;
            }
            return originalUseValue(path);
        };

        return wrappedUseValue("*");
    }, [state]);

    // 실제 구독 (React 방식)
    const reactSubscriptionResult = state.useValue("*");

    // 개별 필드들도 구독해서 영향 확인
    const field1 = state.useValue("testField1");
    const field2 = state.useValue("testField2");

    React.useEffect(() => {
        console.log(
            `\n[WildcardDebug] ===== 렌더링 #${renderCountRef.current} =====`
        );
        console.log(
            "[WildcardDebug] React 구독 결과:",
            reactSubscriptionResult
        );
        console.log("[WildcardDebug] Manual 구독 결과:", allValuesResult);
        console.log("[WildcardDebug] 개별 필드들:", { field1, field2 });

        const store = (state as any)._store;
        console.log("[WildcardDebug] Fields Map 크기:", store.fields.size);
        console.log(
            "[WildcardDebug] Global Listeners 수:",
            store.globalListeners.size
        );
        console.log("=========================================\n");
    }, [reactSubscriptionResult, allValuesResult, field1, field2]);

    const handleAddField1 = useCallback(() => {
        console.log("\n[액션] field1 추가");
        state.setValue("testField1", "value1");
    }, [state]);

    const handleAddField2 = useCallback(() => {
        console.log("\n[액션] field2 추가");
        state.setValue("testField2", "value2");
    }, [state]);

    const handleAddBoth = useCallback(() => {
        console.log("\n[액션] 두 필드 동시 추가 (setValues)");
        state.setValues({
            testField1: "batch_value1",
            testField2: "batch_value2",
        });
    }, [state]);

    const handleClearAll = useCallback(() => {
        console.log("\n[액션] 모든 필드 초기화");
        state.setValues({
            testField1: undefined,
            testField2: undefined,
        });
    }, [state]);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>🔍 Wildcard Subscription Debug</h1>
            <p style={{ color: "#666", marginBottom: "20px" }}>
                이 페이지는 "*" 구독이 여러 번 트리거되는 문제를 디버깅합니다.
                <br />
                브라우저 콘솔을 열어서 상세한 로그를 확인하세요.
            </p>

            <div style={{ marginBottom: "20px" }}>
                <h3>🎯 현재 상태:</h3>
                <div
                    style={{
                        background: "#f5f5f5",
                        padding: "15px",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                    }}
                >
                    <p>
                        <strong>렌더링 횟수:</strong> {renderCountRef.current}
                    </p>
                    <p>
                        <strong>React 구독 결과:</strong>{" "}
                        <span
                            style={{
                                color:
                                    reactSubscriptionResult === undefined
                                        ? "red"
                                        : reactSubscriptionResult === null
                                        ? "orange"
                                        : "green",
                            }}
                        >
                            {JSON.stringify(reactSubscriptionResult)}
                        </span>
                    </p>
                    <p>
                        <strong>Manual 구독 결과:</strong>{" "}
                        <span
                            style={{
                                color:
                                    allValuesResult === undefined
                                        ? "red"
                                        : allValuesResult === null
                                        ? "orange"
                                        : "green",
                            }}
                        >
                            {JSON.stringify(allValuesResult)}
                        </span>
                    </p>
                    <p>
                        <strong>개별 필드1:</strong>{" "}
                        <span
                            style={{
                                color: field1 === undefined ? "gray" : "blue",
                            }}
                        >
                            {JSON.stringify(field1)}
                        </span>
                    </p>
                    <p>
                        <strong>개별 필드2:</strong>{" "}
                        <span
                            style={{
                                color: field2 === undefined ? "gray" : "blue",
                            }}
                        >
                            {JSON.stringify(field2)}
                        </span>
                    </p>
                    <p>
                        <strong>구독 호출 횟수:</strong>{" "}
                        <span
                            style={{
                                color:
                                    subscriptionCountRef.current >
                                    renderCountRef.current
                                        ? "red"
                                        : "green",
                            }}
                        >
                            {subscriptionCountRef.current}
                        </span>
                    </p>
                </div>
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                }}
            >
                <button
                    onClick={handleAddField1}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#007acc",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    🔧 Field1 추가
                </button>
                <button
                    onClick={handleAddField2}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    ⚡ Field2 추가
                </button>
                <button
                    onClick={handleAddBoth}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#ffc107",
                        color: "black",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    🚀 동시 추가 (Batch)
                </button>
                <button
                    onClick={handleClearAll}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    🗑️ 모두 초기화
                </button>
            </div>

            <div
                style={{
                    background: "#e8f4f8",
                    padding: "15px",
                    borderRadius: "8px",
                    marginTop: "20px",
                }}
            >
                <h3>🔍 디버깅 포인트:</h3>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>
                        <strong>구독 호출 횟수:</strong> 렌더링 횟수와 같아야
                        정상
                    </li>
                    <li>
                        <strong>개별 필드 구독:</strong> 이들이 글로벌 리스너에
                        영향주는지 확인
                    </li>
                    <li>
                        <strong>setValues vs setValue:</strong> 배치 업데이트 시
                        차이점 확인
                    </li>
                    <li>
                        <strong>undefined → null 변화:</strong> 언제 발생하는지
                        추적
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default WildcardSubscriptionDebug;
