import { useEffect } from "react";
import { useLocalStorage, useStoragePrefix } from "@ehfuse/forma";

interface UserPreferences {
    theme: "light" | "dark";
    fontSize: number;
    notifications: boolean;
}

const defaultPrefs: UserPreferences = {
    theme: "light",
    fontSize: 14,
    notifications: true,
};

/**
 * useLocalStorage 훅 테스트 페이지
 */
export default function LocalStorageTest() {
    // storagePrefix 확인
    const prefix = useStoragePrefix();

    // 기본 문자열 값
    const {
        value: username,
        setValue: setUsername,
        remove: removeUsername,
        has: hasUsername,
    } = useLocalStorage<string>("username", "");

    // 객체 값
    const {
        value: prefs,
        setValue: setPrefs,
        remove: removePrefs,
        has: hasPrefs,
    } = useLocalStorage<UserPreferences>("preferences", defaultPrefs);

    // 숫자 값
    const {
        value: counter,
        setValue: setCounter,
        remove: removeCounter,
        has: hasCounter,
    } = useLocalStorage<number>("counter", 0);

    // sessionStorage 테스트
    const {
        value: sessionData,
        setValue: setSessionData,
        remove: removeSessionData,
        has: hasSessionData,
    } = useLocalStorage<string>("session-temp", "initial", { session: true });

    // 콘솔 로그로 localStorage 값 확인
    useEffect(() => {
        console.log("=== LocalStorage Test Debug ===");
        console.log("storagePrefix:", prefix);
        console.log("---");
        console.log("username:", username, "(has:", hasUsername, ")");
        console.log("preferences:", prefs, "(has:", hasPrefs, ")");
        console.log("counter:", counter, "(has:", hasCounter, ")");
        console.log("sessionData:", sessionData, "(has:", hasSessionData, ")");
        console.log("---");
        console.log("Raw localStorage keys:", Object.keys(localStorage));
        console.log("Raw sessionStorage keys:", Object.keys(sessionStorage));
        console.log("================================");
    }, [
        username,
        prefs,
        counter,
        sessionData,
        hasUsername,
        hasPrefs,
        hasCounter,
        hasSessionData,
        prefix,
    ]);

    // 전체 localStorage 내용 출력
    const logAllStorage = () => {
        console.log("=== All LocalStorage Contents ===");
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                console.log(`${key}:`, localStorage.getItem(key));
            }
        }
        console.log("=== All SessionStorage Contents ===");
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
                console.log(`${key}:`, sessionStorage.getItem(key));
            }
        }
        console.log("=================================");
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>🗄️ useLocalStorage 테스트</h2>

            <div
                style={{
                    background: "#f0f0f0",
                    padding: "10px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                }}
            >
                <strong>Storage Prefix:</strong>{" "}
                <code>{prefix || "(없음)"}</code>
                <br />
                <small>
                    실제 키 예시: <code>{prefix}:username</code>
                </small>
            </div>

            {/* 문자열 테스트 */}
            <section
                style={{
                    marginBottom: "30px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                }}
            >
                <h3>📝 문자열 (username)</h3>
                <p>
                    현재 값: <strong>{username || "(비어있음)"}</strong>
                </p>
                <p>저장됨: {hasUsername ? "✅ Yes" : "❌ No"}</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="사용자 이름 입력..."
                        style={{ padding: "8px", flex: 1, minWidth: "200px" }}
                    />
                    <button
                        onClick={removeUsername}
                        style={{ padding: "8px 16px" }}
                    >
                        🗑️ 삭제
                    </button>
                </div>
            </section>

            {/* 객체 테스트 */}
            <section
                style={{
                    marginBottom: "30px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                }}
            >
                <h3>⚙️ 객체 (preferences)</h3>
                <p>저장됨: {hasPrefs ? "✅ Yes" : "❌ No"}</p>
                <pre
                    style={{
                        background: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "4px",
                        overflow: "auto",
                    }}
                >
                    {JSON.stringify(prefs, null, 2)}
                </pre>
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "10px",
                    }}
                >
                    <button
                        onClick={() =>
                            setPrefs((p) => ({
                                ...p,
                                theme: p.theme === "light" ? "dark" : "light",
                            }))
                        }
                        style={{ padding: "8px 16px" }}
                    >
                        🌓 테마 토글 ({prefs.theme})
                    </button>
                    <button
                        onClick={() =>
                            setPrefs((p) => ({
                                ...p,
                                fontSize: p.fontSize + 2,
                            }))
                        }
                        style={{ padding: "8px 16px" }}
                    >
                        🔠 폰트 증가 ({prefs.fontSize}px)
                    </button>
                    <button
                        onClick={() =>
                            setPrefs((p) => ({
                                ...p,
                                notifications: !p.notifications,
                            }))
                        }
                        style={{ padding: "8px 16px" }}
                    >
                        🔔 알림 토글 ({prefs.notifications ? "ON" : "OFF"})
                    </button>
                    <button
                        onClick={removePrefs}
                        style={{ padding: "8px 16px" }}
                    >
                        🗑️ 삭제
                    </button>
                </div>
            </section>

            {/* 숫자 테스트 */}
            <section
                style={{
                    marginBottom: "30px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                }}
            >
                <h3>🔢 숫자 (counter)</h3>
                <p>
                    현재 값:{" "}
                    <strong style={{ fontSize: "24px" }}>{counter}</strong>
                </p>
                <p>저장됨: {hasCounter ? "✅ Yes" : "❌ No"}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={() => setCounter((c) => c - 1)}
                        style={{ padding: "8px 16px" }}
                    >
                        ➖ 감소
                    </button>
                    <button
                        onClick={() => setCounter((c) => c + 1)}
                        style={{ padding: "8px 16px" }}
                    >
                        ➕ 증가
                    </button>
                    <button
                        onClick={() => setCounter(0)}
                        style={{ padding: "8px 16px" }}
                    >
                        🔄 리셋
                    </button>
                    <button
                        onClick={removeCounter}
                        style={{ padding: "8px 16px" }}
                    >
                        🗑️ 삭제
                    </button>
                </div>
            </section>

            {/* sessionStorage 테스트 */}
            <section
                style={{
                    marginBottom: "30px",
                    padding: "15px",
                    border: "1px solid #e0c080",
                    borderRadius: "8px",
                    background: "#fffbe6",
                }}
            >
                <h3>📦 SessionStorage (session-temp)</h3>
                <p>
                    <small>⚠️ 브라우저 탭을 닫으면 사라집니다</small>
                </p>
                <p>
                    현재 값: <strong>{sessionData}</strong>
                </p>
                <p>저장됨: {hasSessionData ? "✅ Yes" : "❌ No"}</p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input
                        type="text"
                        value={sessionData}
                        onChange={(e) => setSessionData(e.target.value)}
                        placeholder="세션 데이터 입력..."
                        style={{ padding: "8px", flex: 1, minWidth: "200px" }}
                    />
                    <button
                        onClick={removeSessionData}
                        style={{ padding: "8px 16px" }}
                    >
                        🗑️ 삭제
                    </button>
                </div>
            </section>

            {/* 디버그 버튼 */}
            <section
                style={{
                    padding: "15px",
                    border: "1px solid #007bff",
                    borderRadius: "8px",
                    background: "#e7f3ff",
                }}
            >
                <h3>🔍 디버그</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        onClick={logAllStorage}
                        style={{
                            padding: "8px 16px",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        📋 콘솔에 전체 Storage 출력
                    </button>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.reload();
                        }}
                        style={{
                            padding: "8px 16px",
                            background: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        ⚠️ 전체 Storage 초기화 (새로고침)
                    </button>
                </div>
                <p
                    style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#666",
                    }}
                >
                    💡 개발자 도구(F12) → Console 탭에서 로그를 확인하세요
                </p>
            </section>
        </div>
    );
}
