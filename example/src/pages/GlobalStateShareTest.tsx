/**
 * GlobalStateShareTest.tsx
 *
 * 이미지에서 제시된 문제를 재현하는 테스트
 * - FilterDialogMobile: useValue("isAllSelected")로 구독
 * - CheckboxContent: setValue("isAllSelected", true) 호출
 * - 예상: FilterDialogMobile이 리렌더링되어야 함
 */

import { useState } from "react";
import { useGlobalFormaState } from "@ehfuse/forma";

// FilterDialogMobile 역할 (구독자)
function FilterDialogMobile() {
    console.log("🔵 [FilterDialogMobile] 렌더링");

    const buttonState = useGlobalFormaState<{ isAllSelected?: boolean }>({
        stateId: "mobileFilter_department",
    });

    const isAllSelected = buttonState.useValue("isAllSelected");

    console.log("🔵 [FilterDialogMobile] isAllSelected:", isAllSelected);

    return (
        <div
            style={{
                border: "2px solid blue",
                padding: "20px",
                marginBottom: "20px",
                backgroundColor: "#e3f2fd",
            }}
        >
            <h3>📱 FilterDialogMobile (구독자)</h3>
            <p>
                <strong>isAllSelected 값:</strong>{" "}
                <span
                    style={{
                        fontSize: "20px",
                        color: isAllSelected === true ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
                    {String(isAllSelected)}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                ℹ️ useValue("isAllSelected")로 구독 중
            </p>
        </div>
    );
}

// CheckboxContent 역할 (값 설정자)
function CheckboxContent() {
    console.log("🟢 [CheckboxContent] 렌더링");

    const buttonState = useGlobalFormaState<{ isAllSelected?: boolean }>({
        stateId: "mobileFilter_department",
    });

    const handleSetTrue = () => {
        console.log(
            "🟢 [CheckboxContent] setValue('isAllSelected', true) 호출"
        );
        buttonState.setValue("isAllSelected", true);

        // 값이 제대로 설정되었는지 확인
        setTimeout(() => {
            const currentValue = buttonState.getValue("isAllSelected");
            console.log("🟢 [CheckboxContent] getValue 확인:", currentValue);
        }, 0);
    };

    const handleSetFalse = () => {
        console.log(
            "🟢 [CheckboxContent] setValue('isAllSelected', false) 호출"
        );
        buttonState.setValue("isAllSelected", false);

        setTimeout(() => {
            const currentValue = buttonState.getValue("isAllSelected");
            console.log("🟢 [CheckboxContent] getValue 확인:", currentValue);
        }, 0);
    };

    const handleSetUndefined = () => {
        console.log(
            "🟢 [CheckboxContent] setValue('isAllSelected', undefined) 호출"
        );
        buttonState.setValue("isAllSelected", undefined);

        setTimeout(() => {
            const currentValue = buttonState.getValue("isAllSelected");
            console.log("🟢 [CheckboxContent] getValue 확인:", currentValue);
        }, 0);
    };

    return (
        <div
            style={{
                border: "2px solid green",
                padding: "20px",
                backgroundColor: "#e8f5e9",
            }}
        >
            <h3>☑️ CheckboxContent (값 설정자)</h3>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                    onClick={handleSetTrue}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    ✅ Set TRUE
                </button>
                <button
                    onClick={handleSetFalse}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    ❌ Set FALSE
                </button>
                <button
                    onClick={handleSetUndefined}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#9e9e9e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    ⚪ Set UNDEFINED
                </button>
            </div>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                ℹ️ setValue("isAllSelected", value) 호출
            </p>
        </div>
    );
}

// 독립적인 제3의 컴포넌트 (같은 stateId 사용)
function ThirdComponent() {
    console.log("🟣 [ThirdComponent] 렌더링");

    const buttonState = useGlobalFormaState<{ isAllSelected?: boolean }>({
        stateId: "mobileFilter_department",
    });

    const isAllSelected = buttonState.useValue("isAllSelected");

    return (
        <div
            style={{
                border: "2px solid purple",
                padding: "20px",
                marginTop: "20px",
                backgroundColor: "#f3e5f5",
            }}
        >
            <h3>🎯 Third Component (또 다른 구독자)</h3>
            <p>
                <strong>isAllSelected 값:</strong>{" "}
                <span
                    style={{
                        fontSize: "20px",
                        color: isAllSelected === true ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
                    {String(isAllSelected)}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                ℹ️ 이 컴포넌트도 useValue("isAllSelected")로 구독 중
            </p>
        </div>
    );
}

export default function GlobalStateShareTest() {
    const [showThird, setShowThird] = useState(false);

    return (
        <div style={{ padding: "20px" }}>
            <h1>🧪 글로벌 상태 공유 테스트</h1>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
                이미지에서 제시된 문제를 재현합니다:
                <br />• FilterDialogMobile이{" "}
                <code>useValue("isAllSelected")</code>로 구독
                <br />• CheckboxContent가{" "}
                <code>setValue("isAllSelected", true)</code> 호출
                <br />• 예상: FilterDialogMobile이 자동으로 리렌더링되어야 함
            </p>

            <div
                style={{
                    backgroundColor: "#fff3cd",
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "4px",
                    border: "1px solid #ffc107",
                }}
            >
                <strong>📝 테스트 방법:</strong>
                <ol style={{ marginTop: "10px", marginBottom: "0" }}>
                    <li>CheckboxContent에서 버튼을 클릭하여 값을 변경</li>
                    <li>
                        FilterDialogMobile의 값이 자동으로 업데이트되는지 확인
                    </li>
                    <li>콘솔 로그를 확인하여 리렌더링 여부 확인</li>
                </ol>
            </div>

            <FilterDialogMobile />
            <CheckboxContent />

            <div style={{ marginTop: "20px" }}>
                <button
                    onClick={() => setShowThird(!showThird)}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#9c27b0",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    {showThird
                        ? "🙈 Third Component 숨기기"
                        : "👁️ Third Component 보기"}
                </button>
            </div>

            {showThird && <ThirdComponent />}

            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                }}
            >
                <h4>🔍 디버깅 정보</h4>
                <p style={{ fontSize: "14px", marginBottom: "10px" }}>
                    모든 컴포넌트가 같은{" "}
                    <code>stateId: "mobileFilter_department"</code>를
                    사용합니다.
                </p>
                <p style={{ fontSize: "14px", margin: "0" }}>
                    브라우저 콘솔을 열어 다음 로그를 확인하세요:
                    <br />
                    • 🔵 FilterDialogMobile 렌더링
                    <br />
                    • 🟢 CheckboxContent setValue 호출
                    <br />• 🟣 ThirdComponent 렌더링
                </p>
            </div>
        </div>
    );
}
