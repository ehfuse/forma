/**
 * PersistTest.tsx
 *
 * Forma persist 기능 테스트 페이지
 * localStorage 영속성 기능 테스트
 */

import { useForm } from "@ehfuse/forma";

export default function PersistTest() {
    // 기본 persist 테스트 (string만 전달)
    const simpleForm = useForm({
        initialValues: {
            title: "",
            content: "",
        },
        persist: "simple-draft",
    });

    // 옵션과 함께 persist 테스트
    const advancedForm = useForm({
        initialValues: {
            username: "",
            email: "",
            password: "",
            rememberMe: false,
        },
        persist: {
            key: "advanced-form",
            debounce: 500,
            exclude: ["password"], // 비밀번호는 저장하지 않음
        },
    });

    const SimpleTitle = () => {
        const title = simpleForm.useFormValue("title");
        return (
            <input
                name="title"
                value={title}
                onChange={simpleForm.handleFormChange}
                placeholder="제목"
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            />
        );
    };

    const SimpleContent = () => {
        const content = simpleForm.useFormValue("content");
        return (
            <textarea
                name="content"
                value={content}
                onChange={simpleForm.handleFormChange}
                placeholder="내용"
                style={{ width: "100%", padding: "8px", minHeight: "100px" }}
            />
        );
    };

    const AdvancedUsername = () => {
        const username = advancedForm.useFormValue("username");
        return (
            <input
                name="username"
                value={username}
                onChange={advancedForm.handleFormChange}
                placeholder="사용자명"
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            />
        );
    };

    const AdvancedEmail = () => {
        const email = advancedForm.useFormValue("email");
        return (
            <input
                name="email"
                type="email"
                value={email}
                onChange={advancedForm.handleFormChange}
                placeholder="이메일"
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            />
        );
    };

    const AdvancedPassword = () => {
        const password = advancedForm.useFormValue("password");
        return (
            <input
                name="password"
                type="password"
                value={password}
                onChange={advancedForm.handleFormChange}
                placeholder="비밀번호 (저장 안 됨)"
                style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            />
        );
    };

    const AdvancedRememberMe = () => {
        const rememberMe = advancedForm.useFormValue("rememberMe");
        return (
            <label
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
                <input
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={advancedForm.handleFormChange}
                />
                로그인 유지
            </label>
        );
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h1>🗂️ Persist 기능 테스트</h1>
            <p style={{ color: "#666" }}>
                입력 후 페이지를 새로고침해보세요. 데이터가 유지됩니다.
            </p>

            {/* 기본 테스트 */}
            <section style={{ marginBottom: "40px" }}>
                <h2>1. 기본 Persist (string만 전달)</h2>
                <code
                    style={{
                        display: "block",
                        background: "#f5f5f5",
                        padding: "10px",
                        marginBottom: "16px",
                    }}
                >
                    {`persist: "simple-draft"`}
                </code>

                <SimpleTitle />
                <SimpleContent />

                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => simpleForm.resetForm()}
                        style={{ padding: "8px 16px" }}
                    >
                        리셋
                    </button>
                    <button
                        onClick={() => simpleForm.clearPersisted()}
                        style={{ padding: "8px 16px" }}
                    >
                        저장 데이터 삭제
                    </button>
                </div>

                <div
                    style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#666",
                    }}
                >
                    hasPersisted:{" "}
                    {simpleForm.hasPersisted ? "✅ 있음" : "❌ 없음"}
                </div>

                <pre
                    style={{
                        marginTop: "16px",
                        background: "#f0f0f0",
                        padding: "10px",
                        fontSize: "12px",
                    }}
                >
                    {JSON.stringify(simpleForm.getFormValues(), null, 2)}
                </pre>
            </section>

            {/* 고급 테스트 */}
            <section style={{ marginBottom: "40px" }}>
                <h2>2. 고급 Persist (옵션)</h2>
                <code
                    style={{
                        display: "block",
                        background: "#f5f5f5",
                        padding: "10px",
                        marginBottom: "16px",
                        whiteSpace: "pre",
                    }}
                >
                    {`persist: {
  key: "advanced-form",
  debounce: 500,
  exclude: ["password"]
}`}
                </code>

                <AdvancedUsername />
                <AdvancedEmail />
                <AdvancedPassword />
                <AdvancedRememberMe />

                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                    <button
                        onClick={() => advancedForm.resetForm()}
                        style={{ padding: "8px 16px" }}
                    >
                        리셋
                    </button>
                    <button
                        onClick={() => advancedForm.clearPersisted()}
                        style={{ padding: "8px 16px" }}
                    >
                        저장 데이터 삭제
                    </button>
                </div>

                <div
                    style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#666",
                    }}
                >
                    hasPersisted:{" "}
                    {advancedForm.hasPersisted ? "✅ 있음" : "❌ 없음"}
                </div>

                <pre
                    style={{
                        marginTop: "16px",
                        background: "#f0f0f0",
                        padding: "10px",
                        fontSize: "12px",
                    }}
                >
                    {JSON.stringify(advancedForm.getFormValues(), null, 2)}
                </pre>
            </section>

            {/* localStorage 확인 */}
            <section>
                <h2>3. localStorage 확인</h2>
                <button
                    onClick={() => {
                        console.log(
                            "simple-draft:",
                            localStorage.getItem("simple-draft")
                        );
                        console.log(
                            "advanced-form:",
                            localStorage.getItem("advanced-form")
                        );
                        alert("콘솔에서 localStorage 내용을 확인하세요!");
                    }}
                    style={{ padding: "8px 16px" }}
                >
                    콘솔에 localStorage 출력
                </button>
            </section>
        </div>
    );
}
