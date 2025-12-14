import React, { useState } from "react";
import { useGlobalFormaState } from "@ehfuse/forma";

const EmptyInitialValueTest: React.FC = () => {
    const [stateId] = useState("empty-initial-test");

    // ❗ 초기값을 설정하지 않고 생성
    const state = useGlobalFormaState({
        stateId,
        // initialValues를 의도적으로 설정하지 않음
    });

    // 🌟 초기값 없이 "*" 패턴으로 전체 상태 구독
    const allValues = state.useValue("*");

    // 렌더링 횟수 추적
    const renderCountRef = React.useRef(0);
    renderCountRef.current += 1;

    const handleAddFirstField = () => {
        state.setValue("firstName", "김철수");
    };

    const handleAddMultipleFields = () => {
        state.setValues({
            lastName: "Kim",
            age: 30,
            email: "kim@example.com",
        });
    };

    const handleClearAll = () => {
        const currentValues = state.getValues();
        const clearUpdates: Record<string, any> = {};

        Object.keys(currentValues).forEach((key) => {
            clearUpdates[key] = undefined;
        });

        state.setValues(clearUpdates);
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>🆕 Empty Initial Value Test</h1>
            <p>
                이 테스트는 초기값이 설정되지 않은 상태에서 "*" 패턴 구독이
                어떻게 동작하는지 테스트합니다.
            </p>

            <div
                style={{
                    backgroundColor: "#f0f8ff",
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    border: "2px solid #4a90e2",
                }}
            >
                <h3>📊 상태 정보</h3>
                <p>
                    <strong>렌더링 횟수:</strong> {renderCountRef.current}
                </p>
                <p>
                    <strong>allValues 타입:</strong> {typeof allValues}
                </p>
                <p>
                    <strong>allValues === undefined:</strong>{" "}
                    {String(allValues === undefined)}
                </p>
                <p>
                    <strong>allValues === null:</strong>{" "}
                    {String(allValues === null)}
                </p>
                <p>
                    <strong>Object.keys(allValues || {}).length:</strong>{" "}
                    {Object.keys(allValues || {}).length}
                </p>
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
                    onClick={handleAddFirstField}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    첫 번째 필드 추가 (firstName)
                </button>

                <button
                    onClick={handleAddMultipleFields}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    여러 필드 한 번에 추가
                </button>

                <button
                    onClick={handleClearAll}
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    모든 필드 제거
                </button>

                <button
                    onClick={() =>
                        console.log("Current state:", state.getValues())
                    }
                    style={{
                        padding: "10px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    콘솔에 상태 출력
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                }}
            >
                <div>
                    <h3>🌟 "*" 패턴으로 구독한 전체 상태</h3>
                    <div
                        style={{
                            backgroundColor: "#fff3cd",
                            padding: "15px",
                            borderRadius: "5px",
                            border: "1px solid #ffeaa7",
                            minHeight: "100px",
                        }}
                    >
                        {allValues === undefined ? (
                            <p style={{ color: "#856404" }}>
                                <strong>undefined</strong> - 아직 값이 설정되지
                                않음
                            </p>
                        ) : allValues === null ? (
                            <p style={{ color: "#856404" }}>
                                <strong>null</strong> - null 값
                            </p>
                        ) : (
                            <pre>{JSON.stringify(allValues, null, 2)}</pre>
                        )}
                    </div>
                </div>

                <div>
                    <h3>🔍 getValues() 직접 호출</h3>
                    <div
                        style={{
                            backgroundColor: "#f8f9fa",
                            padding: "15px",
                            borderRadius: "5px",
                            border: "1px solid #dee2e6",
                            minHeight: "100px",
                        }}
                    >
                        <pre>{JSON.stringify(state.getValues(), null, 2)}</pre>
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#e7f3ff",
                    borderRadius: "5px",
                    border: "1px solid #b3d9ff",
                }}
            >
                <h4>🧪 테스트 시나리오</h4>
                <ol>
                    <li>
                        <strong>초기 상태 확인:</strong> allValues가
                        undefined인지 확인
                    </li>
                    <li>
                        <strong>첫 번째 필드 추가:</strong> 값이 설정되면
                        allValues가 업데이트되는지 확인
                    </li>
                    <li>
                        <strong>여러 필드 추가:</strong> 여러 필드가 한 번에
                        추가될 때 구독이 작동하는지 확인
                    </li>
                    <li>
                        <strong>필드 제거:</strong> 필드가 제거되어도 구독이
                        유지되는지 확인
                    </li>
                    <li>
                        <strong>렌더링 카운트:</strong> 각 액션마다 적절히
                        리렌더링되는지 확인
                    </li>
                </ol>
            </div>

            <div
                style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#f0f8f0",
                    borderRadius: "5px",
                    border: "1px solid #90EE90",
                }}
            >
                <h4>✅ 예상 결과</h4>
                <ul>
                    <li>초기에는 allValues가 undefined 또는 빈 객체 {"{}"}</li>
                    <li>
                        첫 번째 필드 추가 시 allValues가 업데이트되고 리렌더링
                        발생
                    </li>
                    <li>이후 모든 필드 변경에 대해 allValues가 반응</li>
                    <li>구독이 계속 유지되어 모든 상태 변경을 감지</li>
                </ul>
            </div>
        </div>
    );
};

export default EmptyInitialValueTest;
