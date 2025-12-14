/**
 * SetValueChildNotificationTest.tsx
 *
 * 이미지에서 제시된 버그 재현 및 수정 확인
 * - setValue("customer", data) 호출 시
 * - useValue("customer.name"), useValue("customer.seq") 구독자들이
 * - 제대로 알림을 받는지 테스트
 */

import { useGlobalFormaState } from "@ehfuse/forma";

interface Customer {
    seq: string;
    name: string;
    ceo_name?: string;
}

// customer.seq 구독자
function CustomerSeqDisplay() {
    console.log("🔵 [CustomerSeqDisplay] 렌더링");

    const context = useGlobalFormaState<{ customer?: Customer }>({
        stateId: "test_customer",
    });

    const seq = context.useValue("customer.seq");

    console.log("🔵 [CustomerSeqDisplay] customer.seq:", seq);

    return (
        <div
            style={{
                border: "2px solid blue",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#e3f2fd",
            }}
        >
            <h4>📊 Customer SEQ (구독자 1)</h4>
            <p>
                <strong>customer.seq:</strong>{" "}
                <span
                    style={{ fontSize: "18px", color: seq ? "green" : "red" }}
                >
                    {seq || "undefined"}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                useValue("customer.seq") 구독
            </p>
        </div>
    );
}

// customer.name 구독자
function CustomerNameDisplay() {
    console.log("🟢 [CustomerNameDisplay] 렌더링");

    const context = useGlobalFormaState<{ customer?: Customer }>({
        stateId: "test_customer",
    });

    const name = context.useValue("customer.name");

    console.log("🟢 [CustomerNameDisplay] customer.name:", name);

    return (
        <div
            style={{
                border: "2px solid green",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#e8f5e9",
            }}
        >
            <h4>👤 Customer Name (구독자 2)</h4>
            <p>
                <strong>customer.name:</strong>{" "}
                <span
                    style={{ fontSize: "18px", color: name ? "green" : "red" }}
                >
                    {name || "undefined"}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                useValue("customer.name") 구독
            </p>
        </div>
    );
}

// customer 전체 객체 구독자
function CustomerWholeDisplay() {
    console.log("🟣 [CustomerWholeDisplay] 렌더링");

    const context = useGlobalFormaState<{ customer?: Customer }>({
        stateId: "test_customer",
    });

    const customer = context.useValue("customer");

    console.log("🟣 [CustomerWholeDisplay] customer:", customer);

    return (
        <div
            style={{
                border: "2px solid purple",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#f3e5f5",
            }}
        >
            <h4>📦 Customer Object (구독자 3)</h4>
            <p>
                <strong>customer:</strong>{" "}
                <span style={{ fontSize: "14px", fontFamily: "monospace" }}>
                    {customer ? JSON.stringify(customer) : "undefined"}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                useValue("customer") 구독
            </p>
        </div>
    );
}

// setValue 호출하는 컴포넌트
function SetValueController() {
    console.log("🟠 [SetValueController] 렌더링");

    const context = useGlobalFormaState<{ customer?: Customer }>({
        stateId: "test_customer",
    });

    const handleSetCustomer = () => {
        const data: Customer = {
            seq: "2101",
            name: "테스트회사",
        };

        console.log("🟠 [SetValueController] setValue('customer', data) 호출");
        console.log("🟠 [SetValueController] data:", data);

        context.setValue("customer", data);

        // 확인
        setTimeout(() => {
            console.log("🟠 [SetValueController] getValue 확인:");
            console.log("  - customer:", context.getValue("customer"));
            console.log("  - customer.seq:", context.getValue("customer.seq"));
            console.log(
                "  - customer.name:",
                context.getValue("customer.name")
            );
        }, 100);
    };

    const handleSetCustomerWithCeo = () => {
        const data: Customer = {
            seq: "2102",
            name: "대표님회사",
            ceo_name: "김대표",
        };

        console.log(
            "🟠 [SetValueController] setValue('customer', data) 호출 (CEO 포함)"
        );
        console.log("🟠 [SetValueController] data:", data);

        context.setValue("customer", data);
    };

    const handleReset = () => {
        console.log(
            "🟠 [SetValueController] setValue('customer', undefined) 호출"
        );
        context.setValue("customer", undefined);
    };

    return (
        <div
            style={{
                border: "2px solid orange",
                padding: "15px",
                backgroundColor: "#fff3e0",
            }}
        >
            <h4>🎮 Controller (setValue 호출)</h4>
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                }}
            >
                <button
                    onClick={handleSetCustomer}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#ff9800",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    📝 Set Customer (기본)
                </button>
                <button
                    onClick={handleSetCustomerWithCeo}
                    style={{
                        padding: "10px 20px",
                        fontSize: "16px",
                        backgroundColor: "#2196f3",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    👔 Set Customer (CEO 포함)
                </button>
                <button
                    onClick={handleReset}
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
                    🔄 Reset
                </button>
            </div>
            <p style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>
                setValue("customer", {`{seq, name}`}) 호출
            </p>
        </div>
    );
}

export default function SetValueChildNotificationTest() {
    return (
        <div style={{ padding: "20px" }}>
            <h1>🐛 setValue 자식 경로 알림 테스트</h1>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
                <strong>버그 재현:</strong> setValue("customer", data) 호출 시
                <br />
                customer.seq, customer.name 구독자들이 알림을 받는지 테스트
            </p>

            <div
                style={{
                    backgroundColor: "#ffebee",
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "4px",
                    border: "1px solid #f44336",
                }}
            >
                <h4>❌ 문제 상황 (수정 전):</h4>
                <pre
                    style={{ fontSize: "14px", margin: "10px 0" }}
                >{`context.setValue("customer", { seq: "2101", name: "테스트" });

// 자식 필드 구독자들이 알림을 받지 못함:
- customer.seq 구독자 ❌ 알림 없음
- customer.name 구독자 ❌ 알림 없음  
- customer 전체 구독자만 ✅ 알림`}</pre>
            </div>

            <div
                style={{
                    backgroundColor: "#e8f5e9",
                    padding: "15px",
                    marginBottom: "20px",
                    borderRadius: "4px",
                    border: "1px solid #4caf50",
                }}
            >
                <h4>✅ 올바른 동작 (최적화됨):</h4>
                <pre
                    style={{ fontSize: "14px", margin: "10px 0" }}
                >{`context.setValue("customer", { seq: "2101", name: "테스트" });

// 실제로 값이 변경된 필드 구독자에게만 알림:
- customer.seq: undefined → "2101" (변경됨) ✅ 알림
- customer.name: undefined → "테스트" (변경됨) ✅ 알림
- customer.ceo_name: undefined → undefined (변경안됨) ❌ 알림 없음
- customer 전체 구독자 ✅ 알림

// 같은 값으로 다시 설정하면:
context.setValue("customer", { seq: "2101", name: "테스트" });
- customer.seq: "2101" → "2101" (변경안됨) ❌ 알림 없음  
- customer.name: "테스트" → "테스트" (변경안됨) ❌ 알림 없음`}</pre>
            </div>

            <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
                📊 구독자들
            </h3>

            <CustomerSeqDisplay />
            <CustomerNameDisplay />
            <CustomerWholeDisplay />

            <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
                🎮 컨트롤러
            </h3>

            <SetValueController />

            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                }}
            >
                <h4>🔍 테스트 방법</h4>
                <ol style={{ fontSize: "14px" }}>
                    <li>브라우저 콘솔을 엽니다</li>
                    <li>"📝 Set Customer" 버튼을 클릭합니다</li>
                    <li>
                        콘솔에서 다음 로그를 확인합니다:
                        <ul>
                            <li>
                                🔵 CustomerSeqDisplay 렌더링 (customer.seq
                                업데이트)
                            </li>
                            <li>
                                🟢 CustomerNameDisplay 렌더링 (customer.name
                                업데이트)
                            </li>
                            <li>
                                🟣 CustomerWholeDisplay 렌더링 (customer 전체
                                업데이트)
                            </li>
                        </ul>
                    </li>
                    <li>모든 구독자가 리렌더링되면 ✅ 수정 성공!</li>
                </ol>
            </div>
        </div>
    );
}
