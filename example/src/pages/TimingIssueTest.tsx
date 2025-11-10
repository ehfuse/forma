/**
 * TimingIssueTest.tsx
 *
 * 타이밍 이슈 테스트: setValues() 호출 후 useValue() 업데이트 확인
 * useSyncExternalStore 적용 전후 비교
 */

import { useState } from "react";
import { useFormaState, FieldStore } from "@ehfuse/forma";

interface Address {
    city: string;
    street: string;
    zipCode: string;
}

interface Customer {
    seq: string;
    name: string;
    email: string;
    address: Address;
}

interface Product {
    id: string;
    name: string;
    price: number;
}

interface FormData {
    customer: Customer;
    product: Product;
    orderDate: string;
}

const defaultValues: FormData = {
    customer: {
        seq: "",
        name: "",
        email: "",
        address: {
            city: "",
            street: "",
            zipCode: "",
        },
    },
    product: {
        id: "",
        name: "",
        price: 0,
    },
    orderDate: "",
};

// 전역 스토어 (여러 컴포넌트에서 공유)
let globalStore: FieldStore<FormData> | null = null;

function getOrCreateStore() {
    if (!globalStore) {
        globalStore = new FieldStore<FormData>(defaultValues);
    }
    return globalStore;
}

// 자식 컴포넌트: customer.seq를 구독
function CustomerSeqDisplay() {
    const { useValue, _store } = useFormaState<FormData>(defaultValues, {
        _externalStore: getOrCreateStore(),
    });
    const customer_seq = useValue("customer.seq");

    console.log("🔵 CustomerSeqDisplay render, customer.seq:", customer_seq);
    console.log(
        "🔵 dotNotationListeners.size:",
        (_store as any).dotNotationListeners.size
    );

    return (
        <div
            style={{ padding: "10px", background: "#e3f2fd", margin: "10px 0" }}
        >
            <h4>CustomerSeqDisplay (구독: customer.seq)</h4>
            <p>
                customer.seq = <strong>{customer_seq || "(비어있음)"}</strong>
            </p>
        </div>
    );
}

// 자식 컴포넌트: customer.name을 구독
function CustomerNameDisplay() {
    const { useValue } = useFormaState<FormData>(defaultValues, {
        _externalStore: getOrCreateStore(),
    });
    const customer_name = useValue("customer.name");

    console.log("🟢 CustomerNameDisplay render, customer.name:", customer_name);

    return (
        <div
            style={{ padding: "10px", background: "#f3e5f5", margin: "10px 0" }}
        >
            <h4>CustomerNameDisplay (구독: customer.name)</h4>
            <p>
                customer.name = <strong>{customer_name || "(비어있음)"}</strong>
            </p>
        </div>
    );
}

// 자식 컴포넌트: customer.address.city를 구독 (깊은 중첩)
function CustomerCityDisplay() {
    const { useValue } = useFormaState<FormData>(defaultValues, {
        _externalStore: getOrCreateStore(),
    });
    const city = useValue("customer.address.city");

    console.log("🟡 CustomerCityDisplay render, customer.address.city:", city);

    return (
        <div
            style={{ padding: "10px", background: "#fff9c4", margin: "10px 0" }}
        >
            <h4>
                CustomerCityDisplay (구독: customer.address.city - 깊은 중첩)
            </h4>
            <p>
                customer.address.city = <strong>{city || "(비어있음)"}</strong>
            </p>
        </div>
    );
}

// 자식 컴포넌트: product.name을 구독
function ProductNameDisplay() {
    const { useValue } = useFormaState<FormData>(defaultValues, {
        _externalStore: getOrCreateStore(),
    });
    const product_name = useValue("product.name");

    console.log("🟠 ProductNameDisplay render, product.name:", product_name);

    return (
        <div
            style={{ padding: "10px", background: "#ffe0b2", margin: "10px 0" }}
        >
            <h4>ProductNameDisplay (구독: product.name)</h4>
            <p>
                product.name = <strong>{product_name || "(비어있음)"}</strong>
            </p>
        </div>
    );
}

// 컨트롤러 컴포넌트
function Controller() {
    const { setValues, getValue, reset, _store } = useFormaState<FormData>(
        defaultValues,
        {
            _externalStore: getOrCreateStore(),
        }
    );

    const handleSetValuesImmediate = () => {
        console.log(
            "🔴 [즉시 설정] setValues 호출 전 dotNotationListeners.size:",
            (_store as any).dotNotationListeners.size
        );

        setValues({
            customer: {
                seq: "2101",
                name: "홍길동",
                email: "hong@example.com",
                address: {
                    city: "서울",
                    street: "강남대로 123",
                    zipCode: "06011",
                },
            },
            product: {
                id: "P001",
                name: "노트북",
                price: 1500000,
            },
            orderDate: "2025-01-10",
        });

        console.log("🔴 [즉시 설정] setValues 호출 후:");
        console.log("   - getValue('customer.seq'):", getValue("customer.seq"));
        console.log(
            "   - getValue('customer.name'):",
            getValue("customer.name")
        );
        console.log(
            "   - getValue('customer.address.city'):",
            getValue("customer.address.city")
        );
        console.log("   - getValue('product.name'):", getValue("product.name"));
    };

    const handleSetValuesDelayed = () => {
        console.log("🟡 [지연 설정] 1초 후 setValues 호출 예정...");

        setTimeout(() => {
            console.log(
                "🟡 [지연 설정] setValues 호출 전 dotNotationListeners.size:",
                (_store as any).dotNotationListeners.size
            );

            setValues({
                customer: {
                    seq: "3202",
                    name: "김철수",
                    email: "kim@example.com",
                    address: {
                        city: "부산",
                        street: "해운대로 456",
                        zipCode: "48099",
                    },
                },
                product: {
                    id: "P002",
                    name: "스마트폰",
                    price: 1200000,
                },
                orderDate: "2025-01-11",
            });

            console.log("🟡 [지연 설정] setValues 호출 후:");
            console.log(
                "   - getValue('customer.seq'):",
                getValue("customer.seq")
            );
            console.log(
                "   - getValue('customer.name'):",
                getValue("customer.name")
            );
            console.log(
                "   - getValue('customer.address.city'):",
                getValue("customer.address.city")
            );
            console.log(
                "   - getValue('product.name'):",
                getValue("product.name")
            );
        }, 1000);
    };

    const handleReset = () => {
        reset();
        console.log("♻️ 초기화됨");
    };

    return (
        <div
            style={{ padding: "10px", background: "#fff3e0", margin: "10px 0" }}
        >
            <h4>Controller</h4>
            <button
                onClick={handleSetValuesImmediate}
                style={{ margin: "5px" }}
            >
                즉시 setValues (홍길동/서울/노트북)
            </button>
            <button onClick={handleSetValuesDelayed} style={{ margin: "5px" }}>
                1초 후 setValues (김철수/부산/스마트폰)
            </button>
            <button onClick={handleReset} style={{ margin: "5px" }}>
                Reset
            </button>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                <p>현재 값 (getValue):</p>
                <p>
                    - customer.seq: {getValue("customer.seq") || "(비어있음)"}
                </p>
                <p>
                    - customer.name: {getValue("customer.name") || "(비어있음)"}
                </p>
                <p>
                    - customer.address.city:{" "}
                    {getValue("customer.address.city") || "(비어있음)"}
                </p>
                <p>
                    - product.name: {getValue("product.name") || "(비어있음)"}
                </p>
            </div>
        </div>
    );
}

// 메인 컴포넌트
export default function TimingIssueTest() {
    const [showModal, setShowModal] = useState(false);

    const handleOpenModalThenSetValues = () => {
        console.log("\n" + "=".repeat(80));
        console.log(
            "🚀 시나리오: 모달 열기 → 즉시 setValues (타이밍 이슈 재현)"
        );
        console.log("=".repeat(80));

        // 1. 모달 열기 (컴포넌트 마운트 시작)
        setShowModal(true);

        // 2. 즉시 setValues (React 렌더링 사이클과 경쟁)
        const store = getOrCreateStore();
        console.log(
            "📊 setValues 호출 시점의 dotNotationListeners.size:",
            (store as any).dotNotationListeners.size
        );

        store.setValues({
            customer: {
                seq: "1001",
                name: "이영희",
                email: "lee@example.com",
                address: {
                    city: "대전",
                    street: "유성대로 789",
                    zipCode: "34126",
                },
            },
            product: {
                id: "P003",
                name: "태블릿",
                price: 800000,
            },
            orderDate: "2025-01-12",
        });

        console.log("📊 setValues 호출 후 값:", store.getValues());
    };

    const handleCloseModal = () => {
        setShowModal(false);
        globalStore = null; // 스토어 초기화
        console.log("❌ 모달 닫힘, 스토어 초기화됨");
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>⏱️ Timing Issue Test (useSyncExternalStore)</h2>
            <p>
                <strong>테스트 목적:</strong> setValues() 호출 타이밍과
                useValue() 구독 타이밍 확인
            </p>

            <div
                style={{
                    background: "#f5f5f5",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>📌 문제 설명</h3>
                <p>
                    기존 <code>useState + useEffect</code> 방식에서는:
                </p>
                <ol>
                    <li>
                        컴포넌트가 렌더링되면 <code>useState</code>가 즉시 실행
                    </li>
                    <li>
                        <code>useEffect</code>는 렌더링 <strong>완료 후</strong>
                        에 실행
                    </li>
                    <li>
                        그 사이에 <code>setValues()</code>가 호출되면 구독자가
                        없어서 알림 못 받음
                    </li>
                    <li>
                        구독 등록 후에도 이미 값은 변경되어 있어서 업데이트 안
                        됨
                    </li>
                </ol>
                <p
                    style={{
                        color: "#1976d2",
                        fontWeight: "bold",
                        marginTop: "10px",
                    }}
                >
                    ✅ <code>useSyncExternalStore</code>는 구독을 동기적으로
                    등록하여 이 문제 해결!
                </p>
            </div>

            <div
                style={{
                    background: "#e8f5e9",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>🧪 테스트 시나리오</h3>
                <button
                    onClick={handleOpenModalThenSetValues}
                    style={{
                        margin: "5px",
                        padding: "10px 20px",
                        background: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                    }}
                >
                    🚀 모달 열고 즉시 setValues (핵심 테스트)
                </button>
                <button
                    onClick={() => setShowModal(true)}
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
                    모달만 열기 (비교용)
                </button>
                <button
                    onClick={handleCloseModal}
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
                    ❌ 모달 닫기
                </button>
            </div>

            {showModal && (
                <div
                    style={{
                        border: "3px solid #2196f3",
                        padding: "20px",
                        background: "white",
                        margin: "20px 0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3>📋 Modal (Form Components) - 중첩 객체 테스트</h3>
                    <p
                        style={{
                            color: "#666",
                            fontSize: "14px",
                            marginBottom: "15px",
                        }}
                    >
                        🎯 <strong>핵심 테스트:</strong> setValues()로 중첩 객체
                        전체를 교체할 때 각 자식 필드(customer.seq,
                        customer.name, customer.address.city, product.name)의
                        구독자들이 제대로 알림을 받는지 확인합니다.
                    </p>
                    <CustomerSeqDisplay />
                    <CustomerNameDisplay />
                    <CustomerCityDisplay />
                    <ProductNameDisplay />
                    <Controller />
                </div>
            )}

            <div
                style={{
                    background: "#fff3e0",
                    padding: "15px",
                    margin: "20px 0",
                    borderRadius: "8px",
                }}
            >
                <h3>📝 검증 방법</h3>
                <ol>
                    <li>
                        <strong>"모달 열고 즉시 setValues"</strong> 버튼 클릭
                        <ul>
                            <li>
                                콘솔에서 <code>dotNotationListeners.size</code>{" "}
                                확인
                            </li>
                            <li>구독자 등록 전/후 시점 확인</li>
                            <li>
                                <strong>화면에 값이 표시되는지 확인</strong>{" "}
                                (핵심!)
                            </li>
                            <li>
                                <strong style={{ color: "#e91e63" }}>
                                    중첩 객체: customer.address.city = "대전"
                                    확인!
                                </strong>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <strong>"모달만 열기"</strong> 후 Controller의 버튼 클릭
                        <ul>
                            <li>구독자가 이미 등록된 후 setValues 호출</li>
                            <li>정상 업데이트 확인 (기본 케이스)</li>
                            <li>
                                <strong style={{ color: "#e91e63" }}>
                                    즉시: 서울/노트북, 지연: 부산/스마트폰
                                </strong>
                            </li>
                        </ul>
                    </li>
                </ol>

                <h4 style={{ color: "#4caf50" }}>✅ 성공 기준</h4>
                <ul style={{ lineHeight: "1.8" }}>
                    <li>
                        모든 시나리오에서 <code>useValue</code>가 업데이트되어야
                        함
                    </li>
                    <li>타이밍과 상관없이 구독이 동기적으로 등록되어야 함</li>
                    <li>
                        <code>setValues</code> 호출 시 즉시 모든 구독자가
                        알림받아야 함
                    </li>
                    <li>
                        <strong style={{ color: "#1976d2" }}>
                            중첩 객체 모든 레벨 업데이트: customer.seq,
                            customer.address.city, product.name
                        </strong>
                    </li>
                    <li>콘솔에 모든 값이 정확히 표시되어야 함</li>
                </ul>
            </div>
        </div>
    );
}
