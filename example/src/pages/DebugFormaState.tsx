import React, { useState, useRef, useCallback } from "react";
import { useGlobalFormaState } from "@ehfuse/forma";

const DebugFormaState: React.FC = () => {
    const [stateId] = useState("debug-test");
    const renderCountRef = useRef(0);

    // 초기값 없이 생성
    const state = useGlobalFormaState({
        stateId,
    });

    // "*" 구독 테스트
    const allValuesResult = state.useValue("*");

    // 렌더링마다 증가 (useEffect 밖에서)
    renderCountRef.current += 1;

    // 현재 상태 디버깅 (렌더링 시점의 스냅샷)
    const debugInfo = React.useMemo(() => {
        const store = (state as any)._store;
        const fields = (store as any).fields;
        const globalListeners = (store as any).globalListeners;

        return {
            fieldsSize: fields.size,
            fieldsEntries: Array.from(fields.entries()),
            globalListenersSize: globalListeners.size,
            getValuesResult: store.getValues(),
            getValueStarResult: store.getValue("*"),
            storeType: typeof store,
            renderCount: renderCountRef.current,
        };
    }, [state, allValuesResult]); // renderCount 제거

    // 초기 마운트 시에만 로그 출력
    React.useEffect(() => {
        console.log(`[Debug] ===== 렌더링 #${renderCountRef.current} =====`);
        console.log("[Debug] Store Fields Map 크기:", debugInfo.fieldsSize);
        console.log("[Debug] Store Fields 내용:", debugInfo.fieldsEntries);
        console.log(
            "[Debug] store.getValues() 결과:",
            debugInfo.getValuesResult
        );
        console.log(
            "[Debug] store.getValue('*') 결과:",
            debugInfo.getValueStarResult
        );
        console.log("[Debug] state.useValue('*') 결과:", allValuesResult);
        console.log("[Debug] 전역 리스너 수:", debugInfo.globalListenersSize);
        console.log("===================================");
    }, [allValuesResult]); // 의존성을 allValuesResult만으로 제한

    const handleAddField = useCallback(() => {
        console.log("\n[액션] 단일 필드 추가 전:");
        console.log(
            "  Fields Map:",
            Array.from((state as any)._store.fields.entries())
        );
        console.log("  getValues():", (state as any)._store.getValues());
        console.log("  getValue('*'):", (state as any)._store.getValue("*"));

        state.setValue("testField", "test value");

        console.log("[액션] 단일 필드 추가 후:");
        console.log(
            "  Fields Map:",
            Array.from((state as any)._store.fields.entries())
        );
        console.log("  getValues():", (state as any)._store.getValues());
        console.log("  getValue('*'):", (state as any)._store.getValue("*"));
    }, [state]);

    const handleAddMultipleFields = useCallback(() => {
        console.log("\n[액션] 다중 필드 추가 전:");
        console.log("  getValues():", (state as any)._store.getValues());
        console.log("  getValue('*'):", (state as any)._store.getValue("*"));

        state.setValues({
            field1: "value1",
            field2: "value2",
            field3: 123,
        });

        console.log("[액션] 다중 필드 추가 후:");
        console.log("  getValues():", (state as any)._store.getValues());
        console.log("  getValue('*'):", (state as any)._store.getValue("*"));
    }, [state]);

    const handleClearAll = useCallback(() => {
        const currentValues = state.getValues();
        const clearUpdates: Record<string, any> = {};

        Object.keys(currentValues).forEach((key) => {
            clearUpdates[key] = undefined;
        });

        console.log("\n[액션] 모든 필드 초기화:", clearUpdates);
        state.setValues(clearUpdates);
    }, [state]);

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>🔍 Forma State Debug</h1>
            <p style={{ color: "#666", marginBottom: "20px" }}>
                이 페이지는 "*" 구독이 null을 반환하는 문제를 디버깅합니다.
                <br />
                브라우저 콘솔을 열어서 상세한 로그를 확인하세요.
            </p>

            <div style={{ marginBottom: "20px" }}>
                <h3>🔍 현재 상태 정보:</h3>
                <div
                    style={{
                        background: "#f5f5f5",
                        padding: "15px",
                        borderRadius: "8px",
                        fontFamily: "monospace",
                    }}
                >
                    <p>
                        <strong>Fields Map Size:</strong>{" "}
                        <span
                            style={{
                                color:
                                    debugInfo.fieldsSize === 0
                                        ? "red"
                                        : "green",
                            }}
                        >
                            {debugInfo.fieldsSize}
                        </span>
                    </p>
                    <p>
                        <strong>Global Listeners:</strong>{" "}
                        {debugInfo.globalListenersSize}
                    </p>
                    <p>
                        <strong>store.getValues():</strong>{" "}
                        <span
                            style={{
                                color:
                                    Object.keys(debugInfo.getValuesResult)
                                        .length === 0
                                        ? "orange"
                                        : "blue",
                            }}
                        >
                            {JSON.stringify(debugInfo.getValuesResult)}
                        </span>
                    </p>
                    <p>
                        <strong>store.getValue("*"):</strong>{" "}
                        <span
                            style={{
                                color:
                                    debugInfo.getValueStarResult === undefined
                                        ? "red"
                                        : debugInfo.getValueStarResult === null
                                        ? "orange"
                                        : "green",
                            }}
                        >
                            {JSON.stringify(debugInfo.getValueStarResult)}
                        </span>
                    </p>
                    <p>
                        <strong>state.useValue("*"):</strong>{" "}
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
                        <strong>렌더링 횟수:</strong> {debugInfo.renderCount}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3>📋 Fields Map 상세 내용:</h3>
                <div
                    style={{
                        background: "#f0f0f0",
                        padding: "15px",
                        borderRadius: "8px",
                        minHeight: "80px",
                    }}
                >
                    {debugInfo.fieldsEntries.length === 0 ? (
                        <p style={{ color: "red", fontWeight: "bold" }}>
                            ❌ 필드가 없습니다 (이것이 문제의 원인일 수
                            있습니다)
                        </p>
                    ) : (
                        debugInfo.fieldsEntries.map(
                            (entry: any, index: number) => {
                                const [key, field] = entry;
                                return (
                                    <p key={index} style={{ margin: "5px 0" }}>
                                        <strong>{key}:</strong>{" "}
                                        {JSON.stringify(field.value)}
                                        <span
                                            style={{
                                                color: "#888",
                                                fontSize: "0.9em",
                                            }}
                                        >
                                            {" "}
                                            (리스너: {field.listeners.size}개)
                                        </span>
                                    </p>
                                );
                            }
                        )
                    )}
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
                    onClick={handleAddField}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#007acc",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    🔧 단일 필드 추가
                </button>
                <button
                    onClick={handleAddMultipleFields}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    ⚡ 여러 필드 추가
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
                <h3>🧪 테스트 결과 분석:</h3>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>
                        <strong>Fields Map이 비어있음:</strong>{" "}
                        {debugInfo.fieldsSize === 0 ? (
                            <span style={{ color: "red" }}>
                                ❌ 예 - 이것이 문제입니다
                            </span>
                        ) : (
                            <span style={{ color: "green" }}>
                                ✅ 아니요 - 필드가 존재합니다
                            </span>
                        )}
                    </li>
                    <li>
                        <strong>getValues() 빈 객체 반환:</strong>{" "}
                        {Object.keys(debugInfo.getValuesResult).length === 0 ? (
                            <span style={{ color: "orange" }}>
                                ⚠️ 예 - 빈 객체를 반환합니다
                            </span>
                        ) : (
                            <span style={{ color: "green" }}>
                                ✅ 아니요 - 데이터가 있습니다
                            </span>
                        )}
                    </li>
                    <li>
                        <strong>getValue("*") undefined 반환:</strong>{" "}
                        {debugInfo.getValueStarResult === undefined ? (
                            <span style={{ color: "green" }}>
                                ✅ 예 - 수정된 로직이 작동합니다
                            </span>
                        ) : (
                            <span style={{ color: "orange" }}>
                                ⚠️ 아니요 -{" "}
                                {JSON.stringify(debugInfo.getValueStarResult)}를
                                반환합니다
                            </span>
                        )}
                    </li>
                    <li>
                        <strong>useValue("*") 구독 결과:</strong>{" "}
                        {allValuesResult === undefined ? (
                            <span style={{ color: "green" }}>
                                ✅ undefined (초기 상태)
                            </span>
                        ) : allValuesResult === null ? (
                            <span style={{ color: "red" }}>
                                ❌ null (예상치 못한 값)
                            </span>
                        ) : (
                            <span style={{ color: "blue" }}>
                                📊 데이터 존재:{" "}
                                {JSON.stringify(allValuesResult)}
                            </span>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default DebugFormaState;
