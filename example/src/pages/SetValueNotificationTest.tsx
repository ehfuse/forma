import React from "react";
import { useForm } from "@ehfuse/forma";

interface TestForm {
    user: {
        name: string;
        email: string;
        age: number;
    };
}

const SetValueNotificationTest: React.FC = () => {
    const form = useForm<TestForm>({
        initialValues: {
            user: {
                name: "John",
                email: "john@example.com",
                age: 25,
            },
        },
    });

    // 각 하위 필드를 구독하는 컴포넌트들
    const UserNameSubscriber = () => {
        const userName = form.useFormValue("user.name");
        const renderCountRef = React.useRef(0);

        // 렌더링 시마다 카운트 증가
        renderCountRef.current += 1;
        console.log(
            `UserName 구독자 렌더링: ${userName} (렌더링 #${renderCountRef.current})`
        );

        return (
            <div>
                이름: {userName} (렌더링 횟수: {renderCountRef.current})
            </div>
        );
    };

    const UserEmailSubscriber = () => {
        const userEmail = form.useFormValue("user.email");
        const renderCountRef = React.useRef(0);

        // 렌더링 시마다 카운트 증가
        renderCountRef.current += 1;
        console.log(
            `UserEmail 구독자 렌더링: ${userEmail} (렌더링 #${renderCountRef.current})`
        );

        return (
            <div>
                이메일: {userEmail} (렌더링 횟수: {renderCountRef.current})
            </div>
        );
    };

    const UserAgeSubscriber = () => {
        const userAge = form.useFormValue("user.age");
        const renderCountRef = React.useRef(0);

        // 렌더링 시마다 카운트 증가
        renderCountRef.current += 1;
        console.log(
            `UserAge 구독자 렌더링: ${userAge} (렌더링 #${renderCountRef.current})`
        );

        return (
            <div>
                나이: {userAge} (렌더링 횟수: {renderCountRef.current})
            </div>
        );
    };

    const testSetValueOneName = () => {
        console.log("=== user.name만 변경 테스트 ===");
        const newName = `Jane_${Math.random().toString(36).substr(2, 4)}`;
        form.setFormValue("user.name", newName);
        console.log(`🔥 테스트: user.name을 '${newName}'로 변경`);
    };

    const testSetValueWholeUser = () => {
        console.log("=== user 객체 전체 변경 테스트 ===");
        const newUser = {
            name: `Bob_${Math.random().toString(36).substr(2, 4)}`,
            email: `bob${Math.random().toString(36).substr(2, 4)}@example.com`,
            age: Math.floor(Math.random() * 50) + 20,
        };
        form.setFormValue("user", newUser);
        console.log(`🔥 테스트: user 객체 전체를 변경`, newUser);
    };

    const testSetFormValues = () => {
        console.log("=== setFormValues로 전체 변경 테스트 ===");
        const newUser = {
            name: `Alice_${Math.random().toString(36).substr(2, 4)}`,
            email: `alice${Math.random()
                .toString(36)
                .substr(2, 4)}@example.com`,
            age: Math.floor(Math.random() * 50) + 20,
        };
        form.setFormValues({
            user: newUser,
        });
        console.log(`🔥 테스트: setFormValues로 전체 변경`, newUser);
    };

    const testSetValueOneEmail = () => {
        console.log("=== user.email만 변경 테스트 ===");
        const newEmail = `test${Math.random()
            .toString(36)
            .substr(2, 4)}@example.com`;
        form.setFormValue("user.email", newEmail);
        console.log(`🔥 테스트: user.email을 '${newEmail}'로 변경`);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>setValue() 하위 필드 알림 테스트</h2>
            <p>
                이 테스트는 setValue()로 필드를 변경할 때 어떤 구독자들이 알림을
                받는지 확인합니다.
            </p>

            <div
                style={{
                    marginBottom: "20px",
                    padding: "15px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                }}
            >
                <h3>구독자들:</h3>
                <UserNameSubscriber />
                <UserEmailSubscriber />
                <UserAgeSubscriber />
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3>테스트 버튼들:</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    <button
                        onClick={testSetValueOneName}
                        style={{
                            padding: "10px",
                            backgroundColor: "#4CAF50",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        user.name만 변경
                    </button>
                    <button
                        onClick={testSetValueOneEmail}
                        style={{
                            padding: "10px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        user.email만 변경
                    </button>
                    <button
                        onClick={testSetValueWholeUser}
                        style={{
                            padding: "10px",
                            backgroundColor: "#FF9800",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        user 객체 전체 변경
                    </button>
                    <button
                        onClick={testSetFormValues}
                        style={{
                            padding: "10px",
                            backgroundColor: "#9C27B0",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                        }}
                    >
                        setFormValues로 전체 변경
                    </button>
                </div>
            </div>

            <div style={{ marginTop: "20px" }}>
                <h3>현재 폼 값:</h3>
                <pre
                    style={{
                        backgroundColor: "#f5f5f5",
                        padding: "10px",
                        borderRadius: "4px",
                        fontSize: "14px",
                    }}
                >
                    {JSON.stringify(form.getFormValues(), null, 2)}
                </pre>
            </div>

            <div
                style={{
                    marginTop: "20px",
                    padding: "15px",
                    backgroundColor: "#e8f5e8",
                    borderRadius: "8px",
                }}
            >
                <h3>📖 사용 방법:</h3>
                <ol>
                    <li>
                        <strong>개발자 도구의 콘솔을 열어두세요</strong> (F12 →
                        Console 탭)
                    </li>
                    <li>위의 테스트 버튼들을 클릭해보세요</li>
                    <li>콘솔에서 어떤 구독자가 렌더링되는지 확인하세요</li>
                    <li>화면의 렌더링 횟수도 함께 확인하세요</li>
                </ol>

                <h4>🔍 예상 동작:</h4>
                <ul>
                    <li>
                        <strong>"user.name만 변경"</strong> → UserName 구독자만
                        렌더링
                    </li>
                    <li>
                        <strong>"user.email만 변경"</strong> → UserEmail
                        구독자만 렌더링
                    </li>
                    <li>
                        <strong>"user 객체 전체 변경"</strong> → 모든 구독자
                        렌더링 (값이 바뀐 경우에만)
                    </li>
                    <li>
                        <strong>"setFormValues로 전체 변경"</strong> → 모든
                        구독자 렌더링
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default SetValueNotificationTest;
