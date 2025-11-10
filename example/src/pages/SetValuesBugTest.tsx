/**
 * SetValuesBugTest.tsx
 *
 * Bug: setValues로 중첩 객체 설정 시 useFormValue 구독이 작동하지 않는 문제 재현
 */

import { useForm } from "../../../hooks/useForm";

// customer.seq 구독자
function CustomerSeqDisplay({ form }: { form: any }) {
    console.log("🔵 [CustomerSeqDisplay] 렌더링");

    const seq = form.useFormValue("customer.seq");

    console.log("🔵 [CustomerSeqDisplay] useFormValue('customer.seq'):", seq);

    return (
        <div
            style={{
                border: "2px solid blue",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#e3f2fd",
            }}
        >
            <h4>📊 Customer SEQ (useFormValue 구독)</h4>
            <p>
                <strong>customer.seq:</strong>{" "}
                <span
                    style={{
                        fontSize: "18px",
                        color: seq ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
                    {seq || "undefined"}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                useFormValue("customer.seq") 사용
            </p>
        </div>
    );
}

// customer.name 구독자
function CustomerNameDisplay({ form }: { form: any }) {
    console.log("🟢 [CustomerNameDisplay] 렌더링");

    const name = form.useFormValue("customer.name");

    console.log(
        "🟢 [CustomerNameDisplay] useFormValue('customer.name'):",
        name
    );

    return (
        <div
            style={{
                border: "2px solid green",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#e8f5e9",
            }}
        >
            <h4>👤 Customer Name (useFormValue 구독)</h4>
            <p>
                <strong>customer.name:</strong>{" "}
                <span
                    style={{
                        fontSize: "18px",
                        color: name ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
                    {name || "undefined"}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                useFormValue("customer.name") 사용
            </p>
        </div>
    );
}

// customer 전체 구독자
function CustomerWholeDisplay({ form }: { form: any }) {
    console.log("🟣 [CustomerWholeDisplay] 렌더링");

    const customer = form.useFormValue("customer");

    console.log(
        "🟣 [CustomerWholeDisplay] useFormValue('customer'):",
        customer
    );

    return (
        <div
            style={{
                border: "2px solid purple",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#f3e5f5",
            }}
        >
            <h4>📦 Customer Object (useFormValue 구독)</h4>
            <p>
                <strong>customer:</strong>{" "}
                <span style={{ fontSize: "14px", fontFamily: "monospace" }}>
                    {customer ? JSON.stringify(customer) : "undefined"}
                </span>
            </p>
            <p style={{ fontSize: "12px", color: "#666" }}>
                useFormValue("customer") 사용
            </p>
        </div>
    );
}

// setValues 호출하는 컴포넌트
function SetValuesController({ form }: { form: any }) {
    console.log("🟠 [SetValuesController] 렌더링");

    const handleSetValues = () => {
        const data = {
            customer: { seq: "2101", name: "테스트회사" },
        };

        console.log("🟠 [SetValuesController] setFormValues(data) 호출");
        console.log("🟠 [SetValuesController] data:", data);

        form.setFormValues(data);

        // 확인
        setTimeout(() => {
            console.log("🟠 [SetValuesController] getValue 확인:");
            console.log("  - customer:", form.getFormValue("customer"));
            console.log("  - customer.seq:", form.getFormValue("customer.seq"));
            console.log(
                "  - customer.name:",
                form.getFormValue("customer.name")
            );
        }, 100);
    };

    const handleSetValuesDifferent = () => {
        const data = {
            customer: { seq: "3456", name: "다른회사", ceo: "김대표" },
        };

        console.log(
            "🟠 [SetValuesController] setFormValues(data) 호출 (다른 값)"
        );
        console.log("🟠 [SetValuesController] data:", data);

        form.setFormValues(data);
    };

    const handleReset = () => {
        console.log("🟠 [SetValuesController] resetForm() 호출");
        form.resetForm();
    };

    return (
        <div
            style={{
                border: "2px solid orange",
                padding: "15px",
                backgroundColor: "#fff3e0",
            }}
        >
            <h4>🎮 Controller (setFormValues 호출)</h4>
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "10px",
                    flexWrap: "wrap",
                }}
            >
                <button
                    onClick={handleSetValues}
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
                    📝 setFormValues (기본)
                </button>
                <button
                    onClick={handleSetValuesDifferent}
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
                    📝 setFormValues (다른 값)
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
                setFormValues({`{ customer: { seq, name } }`}) 호출
            </p>
        </div>
    );
}

export default function SetValuesBugTest() {
    // 초기값 설정
    const defaultValues = {
        customer: { seq: "", name: "" },
    };

    const form = useForm({
        initialValues: defaultValues,
    });

    return (
        <div style={{ padding: "20px" }}>
            <h1>🐛 setValues 중첩 객체 버그 테스트</h1>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
                <strong>버그:</strong> setFormValues로 중첩 객체 설정 시<br />
                useFormValue 구독자들이 업데이트되지 않는 문제
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
                >{`form.setFormValues({ customer: { seq: "2101", name: "ABC" } });

// 버그:
- useFormValue("customer.seq") → '' (업데이트 안 됨) ❌
- useFormValue("customer.name") → '' (업데이트 안 됨) ❌
- getFormValue("customer.seq") → '2101' (정상) ✅
- getFormValue("customer.name") → 'ABC' (정상) ✅`}</pre>
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
                <h4>✅ 수정 후 예상 동작:</h4>
                <pre
                    style={{ fontSize: "14px", margin: "10px 0" }}
                >{`form.setFormValues({ customer: { seq: "2101", name: "ABC" } });

// 모든 구독자가 업데이트됨:
- useFormValue("customer.seq") → '2101' ✅
- useFormValue("customer.name") → 'ABC' ✅
- useFormValue("customer") → { seq: '2101', name: 'ABC' } ✅`}</pre>
            </div>

            <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
                📊 구독자들
            </h3>

            <CustomerSeqDisplay form={form} />
            <CustomerNameDisplay form={form} />
            <CustomerWholeDisplay form={form} />

            <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
                🎮 컨트롤러
            </h3>

            <SetValuesController form={form} />

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
                    <li>"📝 setFormValues (기본)" 버튼을 클릭합니다</li>
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
                    <li>
                        모든 구독자가 리렌더링되고 값이 표시되면 ✅ 수정 성공!
                    </li>
                </ol>

                <h4 style={{ marginTop: "20px" }}>🔬 원인 분석</h4>
                <p style={{ fontSize: "14px", margin: "10px 0" }}>
                    <code>setValueWithoutNotify</code> 함수에서 일반 필드 처리
                    시<br />
                    dot notation 구독자들에게 알림을 보내지 않는 문제였습니다.
                </p>
                <p style={{ fontSize: "14px", margin: "10px 0" }}>
                    <code>setValue</code>에는 있는 로직이{" "}
                    <code>setValueWithoutNotify</code>에는 누락되어
                    <br />
                    <code>setValues</code> (배치 처리) 사용 시에만 버그가
                    발생했습니다.
                </p>
            </div>
        </div>
    );
}
