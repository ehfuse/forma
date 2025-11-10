import { useRef, useState, memo } from "react";
import { useFormaState } from "../../../hooks/useFormaState";

// 렌더링 횟수를 추적하는 컴포넌트 - 개별 필드 구독
const RenderCounter = ({
    label,
    path,
    useValue,
    setValue,
}: {
    label: string;
    path: string;
    useValue: (path: string) => any;
    setValue: (path: string, value: any) => void;
}) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    const value = useValue(path);

    return (
        <div
            style={{
                padding: "8px",
                margin: "4px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "#f9f9f9",
            }}
        >
            <div style={{ fontWeight: "bold", color: "#333" }}>
                {label} (렌더링: {renderCount.current}회)
            </div>
            <input
                type="text"
                value={value || ""}
                onChange={(e) => setValue(path, e.target.value)}
                placeholder={`${label} 입력...`}
                style={{
                    width: "100%",
                    padding: "4px",
                    marginTop: "4px",
                    border: "1px solid #ddd",
                    borderRadius: "2px",
                }}
            />
            <div
                style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "2px",
                }}
            >
                현재 값: "{value || "비어있음"}"
            </div>
        </div>
    );
};

// 주소 섹션 - 개별 필드 구독
const AddressSection = memo(
    ({
        useValue,
        setValue,
    }: {
        useValue: (path: string) => any;
        setValue: (path: string, value: any) => void;
    }) => {
        const renderCount = useRef(0);
        renderCount.current += 1;

        return (
            <div
                style={{
                    border: "2px solid #4CAF50",
                    borderRadius: "8px",
                    padding: "16px",
                    margin: "8px 0",
                    backgroundColor: "#f8fff8",
                }}
            >
                <h3 style={{ margin: "0 0 12px 0", color: "#2E7D32" }}>
                    📍 주소 섹션 (전체 렌더링: {renderCount.current}회)
                </h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                    }}
                >
                    <RenderCounter
                        label="도시"
                        path="address.city"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="거리"
                        path="address.street"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="우편번호"
                        path="address.zipCode"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="국가"
                        path="address.country"
                        useValue={useValue}
                        setValue={setValue}
                    />
                </div>
            </div>
        );
    }
);

// 사용자 정보 섹션 - 개별 필드 구독
const UserSection = memo(
    ({
        useValue,
        setValue,
    }: {
        useValue: (path: string) => any;
        setValue: (path: string, value: any) => void;
    }) => {
        const renderCount = useRef(0);
        renderCount.current += 1;

        return (
            <div
                style={{
                    border: "2px solid #2196F3",
                    borderRadius: "8px",
                    padding: "16px",
                    margin: "8px 0",
                    backgroundColor: "#f3f9ff",
                }}
            >
                <h3 style={{ margin: "0 0 12px 0", color: "#1565C0" }}>
                    👤 사용자 정보 (전체 렌더링: {renderCount.current}회)
                </h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                    }}
                >
                    <RenderCounter
                        label="이름"
                        path="user.name"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="이메일"
                        path="user.email"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="나이"
                        path="user.age"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="전화번호"
                        path="user.phone"
                        useValue={useValue}
                        setValue={setValue}
                    />
                </div>
            </div>
        );
    }
);

// 설정 섹션 - 개별 필드 구독
const SettingsSection = memo(
    ({
        useValue,
        setValue,
    }: {
        useValue: (path: string) => any;
        setValue: (path: string, value: any) => void;
    }) => {
        const renderCount = useRef(0);
        renderCount.current += 1;

        return (
            <div
                style={{
                    border: "2px solid #FF9800",
                    borderRadius: "8px",
                    padding: "16px",
                    margin: "8px 0",
                    backgroundColor: "#fff8f0",
                }}
            >
                <h3 style={{ margin: "0 0 12px 0", color: "#F57C00" }}>
                    ⚙️ 설정 (전체 렌더링: {renderCount.current}회)
                </h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                    }}
                >
                    <RenderCounter
                        label="테마"
                        path="settings.theme"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="언어"
                        path="settings.language"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="알림"
                        path="settings.notifications"
                        useValue={useValue}
                        setValue={setValue}
                    />
                    <RenderCounter
                        label="자동저장"
                        path="settings.autoSave"
                        useValue={useValue}
                        setValue={setValue}
                    />
                </div>
            </div>
        );
    }
);

export default function RenderCountTest() {
    const [logs, setLogs] = useState<string[]>([]);

    // 하나의 공유 상태
    const state = useFormaState({
        user: { name: "", email: "", age: "", phone: "" },
        address: { city: "", street: "", zipCode: "", country: "" },
        settings: {
            theme: "light",
            language: "ko",
            notifications: "enabled",
            autoSave: "true",
        },
    });

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
    };

    const handleRefreshFields = (prefix: string) => {
        addLog(
            `🔄 refreshFields("${prefix}") 실행 - ${prefix} 이하 모든 필드 새로고침`
        );
        state.refreshFields(prefix);
    };

    const handleSetRandomValues = () => {
        const randomCity = ["서울", "부산", "대구", "인천", "광주"][
            Math.floor(Math.random() * 5)
        ];
        const randomName = ["김철수", "이영희", "박민수", "최지은", "정다솜"][
            Math.floor(Math.random() * 5)
        ];

        state.setValue("address.city", randomCity);
        state.setValue("user.name", randomName);
        addLog(`🎲 랜덤 값 설정: 도시="${randomCity}", 이름="${randomName}"`);
    };

    const handleReset = () => {
        state.reset();
        addLog("🔄 전체 초기화 완료");
    };

    return (
        <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1
                style={{
                    color: "#333",
                    borderBottom: "2px solid #333",
                    paddingBottom: "8px",
                }}
            >
                🔍 렌더링 횟수 & refreshFields 테스트
            </h1>

            <div
                style={{
                    marginBottom: "20px",
                    padding: "16px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                }}
            >
                <h3 style={{ margin: "0 0 8px 0" }}>📋 테스트 방법</h3>
                <ol style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>
                        각 필드에 값을 입력하면서 <strong>개별 필드</strong>만
                        리렌더링되는지 확인
                    </li>
                    <li>
                        <code>refreshFields()</code> 버튼을 클릭해서{" "}
                        <strong>특정 prefix</strong> 이하 모든 필드가
                        새로고침되는지 확인
                    </li>
                    <li>
                        렌더링 횟수가 각 컴포넌트별로 독립적으로 증가하는지 관찰
                    </li>
                    <li>
                        브라우저 개발자 도구 콘솔에서 refreshFields 로그도 확인
                    </li>
                </ol>
            </div>

            {/* 제어 버튼들 */}
            <div
                style={{
                    marginBottom: "20px",
                    padding: "16px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                }}
            >
                <button
                    onClick={() => handleRefreshFields("address")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#4CAF50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🔄 refreshFields("address")
                </button>

                <button
                    onClick={() => handleRefreshFields("user")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🔄 refreshFields("user")
                </button>

                <button
                    onClick={() => handleRefreshFields("settings")}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#FF9800",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🔄 refreshFields("settings")
                </button>

                <button
                    onClick={handleSetRandomValues}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#9C27B0",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🎲 랜덤 값 설정
                </button>

                <button
                    onClick={handleReset}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🔄 전체 초기화
                </button>
            </div>

            {/* 상태 섹션들 */}
            <AddressSection
                useValue={state.useValue}
                setValue={state.setValue}
            />
            <UserSection useValue={state.useValue} setValue={state.setValue} />
            <SettingsSection
                useValue={state.useValue}
                setValue={state.setValue}
            />

            {/* 로그 섹션 */}
            <div
                style={{
                    marginTop: "20px",
                    padding: "16px",
                    backgroundColor: "#263238",
                    color: "#fff",
                    borderRadius: "8px",
                    fontFamily: "monospace",
                }}
            >
                <h3 style={{ margin: "0 0 12px 0", color: "#4CAF50" }}>
                    📝 액션 로그
                </h3>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {logs.length === 0 ? (
                        <div style={{ color: "#888" }}>
                            아직 액션이 없습니다...
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} style={{ marginBottom: "4px" }}>
                                {log}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 현재 상태 표시 */}
            <div
                style={{
                    marginTop: "20px",
                    padding: "16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "8px",
                    fontSize: "14px",
                }}
            >
                <h3 style={{ margin: "0 0 8px 0" }}>🔍 현재 전체 상태</h3>
                <pre
                    style={{
                        backgroundColor: "#fff",
                        padding: "12px",
                        borderRadius: "4px",
                        overflow: "auto",
                        border: "1px solid #ddd",
                    }}
                >
                    {JSON.stringify(state.getValues(), null, 2)}
                </pre>
            </div>
        </div>
    );
}
