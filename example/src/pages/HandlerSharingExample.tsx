import { useState } from "react";
import { useGlobalForm } from "../../../hooks/useGlobalForm";

/**
 * 핸들러 공유 예제
 * - 첫 번째 컴포넌트에서 핸들러 등록
 * - 다른 컴포넌트에서 자동으로 핸들러 공유
 */

// 컴포넌트 A: 핸들러를 등록하는 폼
function FormWithHandlers() {
    const [submitCount, setSubmitCount] = useState(0);
    const [validationCount, setValidationCount] = useState(0);

    const form = useGlobalForm({
        formId: "handler-sharing-demo",
        initialValues: { name: "", email: "" },
        onValidate: async (values) => {
            setValidationCount((prev) => prev + 1);
            console.log("🔍 onValidate 실행됨:", values);

            if (!values.name.trim()) {
                alert("이름을 입력해주세요!");
                return false;
            }

            if (!values.email.includes("@")) {
                alert("올바른 이메일을 입력해주세요!");
                return false;
            }

            return true;
        },
        onSubmit: async (values) => {
            setSubmitCount((prev) => prev + 1);
            console.log("✅ onSubmit 실행됨:", values);

            // 가상의 API 호출 시뮬레이션
            await new Promise((resolve) => setTimeout(resolve, 1000));

            alert(`제출 완료!\n이름: ${values.name}\n이메일: ${values.email}`);
            return true;
        },
        onComplete: (values) => {
            console.log("🎉 onComplete 실행됨:", values);
        },
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <div
            style={{
                padding: "20px",
                border: "2px solid #4CAF50",
                borderRadius: "8px",
                marginBottom: "20px",
            }}
        >
            <h3>📝 컴포넌트 A: 핸들러 등록</h3>
            <p style={{ color: "#666", fontSize: "14px" }}>
                이 컴포넌트에서 onValidate, onSubmit, onComplete를 등록합니다.
            </p>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    이름:
                </label>
                <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={form.handleFormChange}
                    placeholder="이름 입력"
                    style={{
                        padding: "8px",
                        width: "100%",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                    }}
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                    이메일:
                </label>
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={form.handleFormChange}
                    placeholder="이메일 입력"
                    style={{
                        padding: "8px",
                        width: "100%",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                    }}
                />
            </div>

            <button
                onClick={form.submit}
                disabled={form.isSubmitting}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: form.isSubmitting ? "not-allowed" : "pointer",
                    opacity: form.isSubmitting ? 0.6 : 1,
                }}
            >
                {form.isSubmitting ? "제출 중..." : "컴포넌트 A에서 제출"}
            </button>

            <div
                style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    fontSize: "13px",
                }}
            >
                <div>🔍 검증 실행 횟수: {validationCount}</div>
                <div>✅ 제출 실행 횟수: {submitCount}</div>
            </div>
        </div>
    );
}

// 컴포넌트 B: 핸들러를 제공하지 않고 자동으로 공유
function FormViewer() {
    const form = useGlobalForm({
        formId: "handler-sharing-demo", // 같은 ID
        // onValidate, onSubmit, onComplete 없음!
        // → 컴포넌트 A에서 등록한 핸들러 자동 사용
    });

    const name = form.useFormValue("name");
    const email = form.useFormValue("email");

    return (
        <div
            style={{
                padding: "20px",
                border: "2px solid #2196F3",
                borderRadius: "8px",
                marginBottom: "20px",
            }}
        >
            <h3>👁️ 컴포넌트 B: 핸들러 자동 공유</h3>
            <p style={{ color: "#666", fontSize: "14px" }}>
                핸들러를 등록하지 않았지만, 컴포넌트 A의 핸들러가 자동으로
                공유됩니다!
            </p>

            <div
                style={{
                    padding: "15px",
                    backgroundColor: "#E3F2FD",
                    borderRadius: "4px",
                    marginBottom: "15px",
                }}
            >
                <div>
                    <strong>현재 이름:</strong> {name || "(비어있음)"}
                </div>
                <div>
                    <strong>현재 이메일:</strong> {email || "(비어있음)"}
                </div>
                <div>
                    <strong>수정됨:</strong> {form.isModified ? "예" : "아니오"}
                </div>
            </div>

            <button
                onClick={form.submit}
                disabled={form.isSubmitting}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: form.isSubmitting ? "not-allowed" : "pointer",
                    opacity: form.isSubmitting ? 0.6 : 1,
                }}
            >
                {form.isSubmitting ? "제출 중..." : "컴포넌트 B에서 제출"}
            </button>

            <p
                style={{
                    marginTop: "15px",
                    fontSize: "13px",
                    color: "#666",
                    fontStyle: "italic",
                }}
            >
                💡 이 버튼도 컴포넌트 A의 onValidate → onSubmit → onComplete를
                실행합니다!
            </p>
        </div>
    );
}

// 컴포넌트 C: 로컬 핸들러로 오버라이드
function FormWithCustomHandler() {
    const [customSubmitCount, setCustomSubmitCount] = useState(0);

    const form = useGlobalForm({
        formId: "handler-sharing-demo",
        // 로컬 핸들러로 오버라이드
        onSubmit: async (values) => {
            setCustomSubmitCount((prev) => prev + 1);
            console.log("🔥 커스텀 onSubmit 실행됨:", values);

            alert(
                `커스텀 제출!\n이 컴포넌트만 다른 로직을 사용합니다.\n이름: ${values.name}`
            );
            return true;
        },
    });

    const name = form.useFormValue("name");

    return (
        <div
            style={{
                padding: "20px",
                border: "2px solid #FF9800",
                borderRadius: "8px",
            }}
        >
            <h3>🔥 컴포넌트 C: 로컬 핸들러 오버라이드</h3>
            <p style={{ color: "#666", fontSize: "14px" }}>
                같은 formId를 사용하지만, 로컬에서 onSubmit을 재정의하여 다른
                동작을 합니다.
            </p>

            <div
                style={{
                    padding: "15px",
                    backgroundColor: "#FFF3E0",
                    borderRadius: "4px",
                    marginBottom: "15px",
                }}
            >
                <div>
                    <strong>현재 이름:</strong> {name || "(비어있음)"}
                </div>
            </div>

            <button
                onClick={form.submit}
                disabled={form.isSubmitting}
                style={{
                    padding: "10px 20px",
                    backgroundColor: "#FF9800",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: form.isSubmitting ? "not-allowed" : "pointer",
                    opacity: form.isSubmitting ? 0.6 : 1,
                }}
            >
                {form.isSubmitting
                    ? "제출 중..."
                    : "컴포넌트 C에서 커스텀 제출"}
            </button>

            <div
                style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    fontSize: "13px",
                }}
            >
                <div>🔥 커스텀 제출 횟수: {customSubmitCount}</div>
            </div>

            <p
                style={{
                    marginTop: "15px",
                    fontSize: "13px",
                    color: "#666",
                    fontStyle: "italic",
                }}
            >
                💡 이 버튼은 커스텀 onSubmit을 실행합니다 (글로벌 핸들러 대신)
            </p>
        </div>
    );
}

export default function HandlerSharingExample() {
    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>🎯 핸들러 공유 예제 (Handler Sharing)</h2>

            <div
                style={{
                    padding: "15px",
                    backgroundColor: "#E8F5E9",
                    borderRadius: "8px",
                    marginBottom: "30px",
                }}
            >
                <h4>✨ 핵심 개념</h4>
                <ul style={{ fontSize: "14px", lineHeight: "1.8" }}>
                    <li>
                        <strong>자동 핸들러 공유:</strong> 같은 formId를
                        사용하면 데이터뿐만 아니라 핸들러(onValidate, onSubmit,
                        onComplete)도 자동으로 공유됩니다.
                    </li>
                    <li>
                        <strong>직관적 동작:</strong> 첫 번째로 등록된 핸들러가
                        글로벌하게 공유되어, 다른 컴포넌트에서도 submit()이
                        동작합니다.
                    </li>
                    <li>
                        <strong>유연한 오버라이드:</strong> 특정 컴포넌트에서만
                        다른 핸들러를 사용하고 싶으면 로컬에서 재정의할 수
                        있습니다.
                    </li>
                </ul>
            </div>

            <FormWithHandlers />
            <FormViewer />
            <FormWithCustomHandler />

            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#FFF9C4",
                    borderRadius: "8px",
                }}
            >
                <h4>💡 사용 팁</h4>
                <ul style={{ fontSize: "14px", lineHeight: "1.8" }}>
                    <li>
                        다단계 폼에서 마지막 단계에만 onSubmit을 등록하고, 다른
                        단계에서도 submit() 버튼을 사용할 수 있습니다.
                    </li>
                    <li>
                        폼의 검증 로직과 제출 로직을 한 곳에서 관리하면서, 여러
                        UI에서 접근할 수 있습니다.
                    </li>
                    <li>
                        콘솔을 열어서 onValidate, onSubmit이 어떻게 실행되는지
                        확인해보세요!
                    </li>
                </ul>
            </div>
        </div>
    );
}
