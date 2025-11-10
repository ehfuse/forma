import React, { useState } from "react";
import { useGlobalFormaState } from "../../../hooks/useGlobalFormaState";

interface DialogState {
    tabValue: number;
    activeTabIndex: number;
    scrollToSectionIndex: number;
    isScrolling: boolean;
    autoTabChange: boolean;
    autoScroll: boolean;
    message: string;
}

const GlobalStarSubscriptionTest: React.FC = () => {
    const [stateId] = useState("star-test-dialog");

    const dialogState = useGlobalFormaState<DialogState>({
        stateId,
        initialValues: {
            tabValue: 0,
            activeTabIndex: 0,
            scrollToSectionIndex: 0,
            isScrolling: false,
            autoTabChange: true,
            autoScroll: false,
            message: "Hello World",
        },
    });

    // 🌟 전체 상태를 "*" 패턴으로 구독
    const allValues = dialogState.useValue("*");

    // 개별 필드 구독 (비교용)
    const tabValue = dialogState.useValue("tabValue");
    const message = dialogState.useValue("message");

    // 렌더링 횟수 추적 (useRef 사용으로 무한 루프 방지)
    const renderCountRef = React.useRef(0);
    renderCountRef.current += 1;

    const handleUpdateAll = () => {
        // allValues가 undefined일 경우를 대비한 안전한 접근
        const currentValues = allValues || {
            isScrolling: false,
            autoTabChange: true,
            autoScroll: false,
        };

        // 여러 필드를 한 번에 업데이트
        dialogState.setValues({
            tabValue: Math.floor(Math.random() * 10),
            activeTabIndex: Math.floor(Math.random() * 5),
            scrollToSectionIndex: Math.floor(Math.random() * 3),
            isScrolling: !currentValues.isScrolling,
            autoTabChange: !currentValues.autoTabChange,
            autoScroll: !currentValues.autoScroll,
            message: `Updated at ${new Date().toLocaleTimeString()}`,
        });
    };

    const handleUpdateSingle = () => {
        dialogState.setValue(
            "message",
            `Single update at ${new Date().toLocaleTimeString()}`
        );
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1>🌟 Global "*" Pattern Subscription Test</h1>
            <p>
                이 테스트는 dialogState.useValue("*")로 전체 상태를 한 번에
                구독하는 기능을 테스트합니다.
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
                <h3>📊 렌더링 정보</h3>
                <p>
                    <strong>총 렌더링 횟수:</strong> {renderCountRef.current}
                </p>
                <p>
                    <strong>구독 방식:</strong> dialogState.useValue("*")
                </p>
            </div>

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <button
                    onClick={handleUpdateAll}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    전체 상태 업데이트 (7개 필드)
                </button>

                <button
                    onClick={handleUpdateSingle}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    메시지만 업데이트 (1개 필드)
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
                        }}
                    >
                        <pre>{JSON.stringify(allValues, null, 2)}</pre>
                    </div>
                </div>

                <div>
                    <h3>🎯 개별 필드 구독 (비교용)</h3>
                    <div
                        style={{
                            backgroundColor: "#f8f9fa",
                            padding: "15px",
                            borderRadius: "5px",
                            border: "1px solid #dee2e6",
                        }}
                    >
                        <p>
                            <strong>tabValue:</strong> {tabValue}
                        </p>
                        <p>
                            <strong>message:</strong> {message}
                        </p>
                        <p>
                            <em>
                                개별 필드 구독시 각각이 별도 렌더링을 유발할 수
                                있음
                            </em>
                        </p>
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
                <h4>💡 테스트 가이드</h4>
                <ul>
                    <li>
                        <strong>"전체 상태 업데이트"</strong> 클릭: 7개 필드가
                        동시에 변경되지만 "*" 패턴으로 1회만 렌더링
                    </li>
                    <li>
                        <strong>"메시지만 업데이트"</strong> 클릭: 1개 필드만
                        변경되어도 전체 상태가 구독되므로 렌더링 발생
                    </li>
                    <li>렌더링 횟수를 관찰하여 "*" 패턴의 효율성 확인</li>
                </ul>
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
                <h4>✅ 기대 결과</h4>
                <p>
                    개별 필드를 7번 구독하는 대신 "*" 패턴으로 1번만 구독하여,
                    여러 필드가 동시에 변경되어도 <strong>1회 렌더링</strong>만
                    발생해야 합니다.
                </p>
            </div>
        </div>
    );
};

export default GlobalStarSubscriptionTest;
