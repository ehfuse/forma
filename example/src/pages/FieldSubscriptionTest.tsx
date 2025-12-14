import { useFormaState } from "@ehfuse/forma";

/**
 * useFormaState의 필드 구독 테스트
 * - undefined 필드의 구독 동작
 * - .length 구독의 동작
 * - 일반 필드 구독의 동작
 */
export default function FieldSubscriptionTest() {
    // 빈 객체로 시작하여 필드들이 undefined 상태
    const state = useFormaState({});

    // 다양한 필드 구독
    const name = state.useValue("name");
    const age = state.useValue("age");
    const searchResults = state.useValue("searchResults");
    const searchResultsLength = state.useValue("searchResults.length");
    const userProfile = state.useValue("user.profile.name");

    return (
        <div style={{ padding: "20px", maxWidth: "800px" }}>
            <h2>🧪 Field Subscription Test</h2>

            {/* 현재 값 표시 */}
            <div
                style={{
                    marginBottom: "30px",
                    padding: "15px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "8px",
                }}
            >
                <h3>📊 Current Values</h3>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "200px 1fr",
                        gap: "10px",
                        fontFamily: "monospace",
                    }}
                >
                    <strong>name:</strong>
                    <span>{JSON.stringify(name)}</span>

                    <strong>age:</strong>
                    <span>{JSON.stringify(age)}</span>

                    <strong>searchResults:</strong>
                    <span>{JSON.stringify(searchResults)}</span>

                    <strong>searchResults.length:</strong>
                    <span>{JSON.stringify(searchResultsLength)}</span>

                    <strong>user.profile.name:</strong>
                    <span>{JSON.stringify(userProfile)}</span>
                </div>
            </div>

            {/* 테스트 버튼들 */}
            <div style={{ display: "grid", gap: "15px" }}>
                <div>
                    <h3>🔤 String Field Tests</h3>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={() => state.setValue("name", "John")}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set name = "John"
                        </button>
                        <button
                            onClick={() => state.setValue("name", "Jane")}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set name = "Jane"
                        </button>
                        <button
                            onClick={() => state.setValue("name", undefined)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#ff9800",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set name = undefined
                        </button>
                    </div>
                </div>

                <div>
                    <h3>🔢 Number Field Tests</h3>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={() => state.setValue("age", 25)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set age = 25
                        </button>
                        <button
                            onClick={() => state.setValue("age", 30)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set age = 30
                        </button>
                        <button
                            onClick={() => state.setValue("age", null)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#ff9800",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set age = null
                        </button>
                    </div>
                </div>

                <div>
                    <h3>📊 Array Field Tests (.length subscription)</h3>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={() => state.setValue("searchResults", [])}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set searchResults = []
                        </button>
                        <button
                            onClick={() =>
                                state.setValue("searchResults", [1, 2, 3])
                            }
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set searchResults = [1,2,3]
                        </button>
                        <button
                            onClick={() =>
                                state.setValue("searchResults", [1, 2, 3, 4, 5])
                            }
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#9C27B0",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set searchResults = [1,2,3,4,5]
                        </button>
                        <button
                            onClick={() =>
                                state.setValue("searchResults", undefined)
                            }
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#ff9800",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set searchResults = undefined
                        </button>
                    </div>
                </div>

                <div>
                    <h3>🏗️ Nested Object Tests (dot notation)</h3>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={() =>
                                state.setValue("user.profile.name", "Alice")
                            }
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set user.profile.name = "Alice"
                        </button>
                        <button
                            onClick={() =>
                                state.setValue("user.profile.name", "Bob")
                            }
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#2196F3",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set user.profile.name = "Bob"
                        </button>
                        <button
                            onClick={() => state.setValue("user", undefined)}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#ff9800",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Set user = undefined
                        </button>
                    </div>
                </div>

                <div>
                    <h3>🧹 Utility Actions</h3>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                        }}
                    >
                        <button
                            onClick={() => state.reset()}
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#f44336",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Reset All
                        </button>
                        <button
                            onClick={() =>
                                console.log("All values:", state.getValues())
                            }
                            style={{
                                padding: "8px 16px",
                                backgroundColor: "#607D8B",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                            }}
                        >
                            Log All Values
                        </button>
                    </div>
                </div>
            </div>

            {/* 테스트 설명 */}
            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "#e3f2fd",
                    borderRadius: "8px",
                }}
            >
                <h3>🔍 Test Points</h3>
                <ul style={{ lineHeight: "1.6" }}>
                    <li>
                        <strong>undefined 구독 테스트</strong>: 처음에 모든
                        필드가 undefined(실제로는 null)이지만 구독은 정상 작동
                    </li>
                    <li>
                        <strong>.length 구독 테스트</strong>: searchResults가
                        undefined일 때 searchResults.length는 0을 반환
                    </li>
                    <li>
                        <strong>배열 변경 시 .length 알림</strong>: 배열이
                        변경되면 .length 구독자에게 알림
                    </li>
                    <li>
                        <strong>dot notation 구독</strong>: user.profile.name
                        같은 중첩 경로 구독 테스트
                    </li>
                    <li>
                        <strong>실시간 업데이트</strong>: 값 변경 시 즉시 UI
                        업데이트 확인
                    </li>
                </ul>
            </div>
        </div>
    );
}
