/**
 * ResetBugTest.tsx
 *
 * context.reset() 버그 테스트
 * initialValues에 배열로 정의된 필드가 reset 후 빈 문자열로 변환되는 이슈 확인
 */

import { useGlobalForm } from "@ehfuse/forma";

interface Customer {
    name: string;
    labels: string[];
    tags: string[];
    metadata: {
        created: string;
        updated: string;
    };
}

const initialValues: Customer = {
    name: "홍길동",
    labels: [], // ✅ 배열로 정의
    tags: ["VIP", "우수고객"], // ✅ 초기값이 있는 배열
    metadata: {
        created: "2025-01-01",
        updated: "2025-01-01",
    },
};

// Actions
const Actions = {
    updateCustomer: (context: any) => {
        context.setValue("name", "김철수");
        context.setValue("labels", ["중요", "긴급"]);
        context.setValue("tags", ["VVIP"]);
        context.setValue("metadata.updated", "2025-01-17");
    },

    resetCustomer: (context: any) => {
        console.log("\n" + "=".repeat(80));
        console.log("🔄 RESET 호출 전:");
        console.log("  - name:", context.getValue("name"));
        console.log(
            "  - labels:",
            context.getValue("labels"),
            "| type:",
            typeof context.getValue("labels"),
            "| isArray:",
            Array.isArray(context.getValue("labels"))
        );
        console.log(
            "  - tags:",
            context.getValue("tags"),
            "| type:",
            typeof context.getValue("tags"),
            "| isArray:",
            Array.isArray(context.getValue("tags"))
        );
        console.log(
            "  - metadata.updated:",
            context.getValue("metadata.updated")
        );

        context.reset();

        console.log("\n🔄 RESET 호출 후:");
        console.log(
            "  - name:",
            context.getValue("name"),
            "| expected: '홍길동'"
        );
        console.log(
            "  - labels:",
            context.getValue("labels"),
            "| type:",
            typeof context.getValue("labels"),
            "| isArray:",
            Array.isArray(context.getValue("labels")),
            "| expected: []"
        );
        console.log(
            "  - tags:",
            context.getValue("tags"),
            "| type:",
            typeof context.getValue("tags"),
            "| isArray:",
            Array.isArray(context.getValue("tags")),
            "| expected: ['VIP', '우수고객']"
        );
        console.log(
            "  - metadata.updated:",
            context.getValue("metadata.updated"),
            "| expected: '2025-01-01'"
        );

        // 검증
        const labelsValue = context.getValue("labels");
        const tagsValue = context.getValue("tags");

        if (labelsValue === "") {
            console.error(
                "❌ BUG: labels가 빈 문자열로 변환됨! 배열 []이어야 함"
            );
        } else if (Array.isArray(labelsValue) && labelsValue.length === 0) {
            console.log("✅ SUCCESS: labels가 올바르게 []로 복원됨");
        }

        if (tagsValue === "") {
            console.error(
                "❌ BUG: tags가 빈 문자열로 변환됨! 배열 ['VIP', '우수고객']이어야 함"
            );
        } else if (Array.isArray(tagsValue) && tagsValue.length === 2) {
            console.log(
                "✅ SUCCESS: tags가 올바르게 ['VIP', '우수고객']로 복원됨"
            );
        }

        console.log("=".repeat(80) + "\n");
    },
};

function DisplayComponent() {
    const form = useCustomerForm();

    const name = form.useFormValue("name");
    const labels = form.useFormValue("labels");
    const tags = form.useFormValue("tags");
    const updated = form.useFormValue("metadata.updated");
    return (
        <div
            style={{
                padding: "15px",
                background: "#f5f5f5",
                margin: "10px 0",
                borderRadius: "8px",
            }}
        >
            <h4>📊 Current Values (useFormValue)</h4>
            <div style={{ fontFamily: "monospace", fontSize: "13px" }}>
                <p>
                    <strong>name:</strong> {name}
                </p>
                <p>
                    <strong>labels:</strong> {JSON.stringify(labels)}
                    <span
                        style={{
                            color: Array.isArray(labels) ? "green" : "red",
                            marginLeft: "10px",
                        }}
                    >
                        [{typeof labels}]{" "}
                        {Array.isArray(labels) ? "✅ Array" : "❌ NOT Array"}
                    </span>
                </p>
                <p>
                    <strong>tags:</strong> {JSON.stringify(tags)}
                    <span
                        style={{
                            color: Array.isArray(tags) ? "green" : "red",
                            marginLeft: "10px",
                        }}
                    >
                        [{typeof tags}]{" "}
                        {Array.isArray(tags) ? "✅ Array" : "❌ NOT Array"}
                    </span>
                </p>
                <p>
                    <strong>metadata.updated:</strong> {updated}
                </p>
            </div>
        </div>
    );
}

function ControlPanel() {
    const { actions } = useCustomerForm();

    return (
        <div
            style={{
                padding: "15px",
                background: "#e3f2fd",
                margin: "10px 0",
                borderRadius: "8px",
            }}
        >
            <h4>🎮 Controls</h4>
            <button
                onClick={actions.updateCustomer}
                style={{
                    margin: "5px",
                    padding: "10px 20px",
                    background: "#2196f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                📝 Update Customer
            </button>
            <button
                onClick={actions.resetCustomer}
                style={{
                    margin: "5px",
                    padding: "10px 20px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                🔄 Reset (콘솔 확인!)
            </button>
        </div>
    );
}

// Custom Hook
function useCustomerForm() {
    return useGlobalForm({
        formId: "customer-form",
        initialValues,
        actions: Actions,
    });
}

export default function ResetBugTest() {
    return (
        <div style={{ padding: "20px" }}>
            <h2>🐛 Reset Bug Test - Array Fields</h2>
            <p>
                <strong>버그:</strong> <code>context.reset()</code> 호출 시{" "}
                <code>initialValues</code>의 배열 필드가 빈 문자열(
                <code>""</code>)로 변환되는 이슈
            </p>

            <div
                style={{
                    background: "#fff3e0",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>📋 Initial Values</h3>
                <pre
                    style={{
                        background: "#fff",
                        padding: "10px",
                        borderRadius: "4px",
                        overflow: "auto",
                    }}
                >
                    {`{
  name: "홍길동",
  labels: [],              // ✅ 빈 배열
  tags: ["VIP", "우수고객"], // ✅ 값이 있는 배열
  metadata: {
    created: "2025-01-01",
    updated: "2025-01-01"
  }
}`}
                </pre>
            </div>

            <DisplayComponent />
            <ControlPanel />

            <div
                style={{
                    background: "#f3e5f5",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>🧪 테스트 순서</h3>
                <ol>
                    <li>
                        <strong>"Update Customer"</strong> 클릭 - 값들을 변경
                    </li>
                    <li>
                        <strong>"Reset"</strong> 클릭 - 초기값으로 복원 (콘솔
                        확인!)
                    </li>
                    <li>
                        화면에서 labels와 tags가 올바른 타입으로 표시되는지 확인
                    </li>
                </ol>

                <h4 style={{ color: "#4caf50" }}>✅ 성공 기준</h4>
                <ul>
                    <li>
                        <code>labels</code>가 <code>[]</code> (빈 배열)로
                        복원되어야 함
                    </li>
                    <li>
                        <code>tags</code>가 <code>["VIP", "우수고객"]</code>{" "}
                        (초기 배열)로 복원되어야 함
                    </li>
                    <li>
                        <code>name</code>이 "홍길동"으로 복원되어야 함
                    </li>
                    <li>
                        <code>metadata.updated</code>가 "2025-01-01"로
                        복원되어야 함
                    </li>
                    <li>
                        모든 값이 올바른 타입(string, array, object)을 유지해야
                        함
                    </li>
                </ul>

                <h4 style={{ color: "#f44336" }}>❌ 이전 버그</h4>
                <ul>
                    <li>
                        <code>labels</code>가 <code>""</code> (빈 문자열)로
                        변환됨
                    </li>
                    <li>
                        <code>tags</code>가 <code>""</code> (빈 문자열)로 변환됨
                    </li>
                </ul>
            </div>
        </div>
    );
}
