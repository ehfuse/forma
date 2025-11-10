/**
 * ZeroConfigExample.tsx
 *
 * Forma Zero-Config 기능 예제
 * Examples demonstrating Forma's Zero-Config capabilities
 *
 * @author KIM YOUNG JIN (ehfuse@gmail.com)
 * @license MIT License
 */

import { useForm } from "../../../hooks/useForm";
import { useFormaState } from "../../../hooks/useFormaState";

interface UserData {
    name: string;
    email: string;
    age: number;
}

/**
 * Zero-Config useForm 예제
 * useForm without any configuration
 */
export function ZeroConfigFormExample() {
    // Zero-Config: 매개변수 없이 사용
    const form1 = useForm<UserData>();

    // Zero-Config: 빈 객체로 시작
    const form2 = useForm<UserData>({});

    // Zero-Config: onSubmit만 설정
    const form3 = useForm<UserData>({
        onSubmit: async (values: UserData) => {
            console.log("Form submitted:", values);
        },
    });

    return (
        <div>
            <h2>Zero-Config useForm Examples</h2>

            <div>
                <h3>Form 1: Completely Zero-Config</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={form1.useFormValue("name")}
                    onChange={(e) => form1.setFormValue("name", e.target.value)}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={form1.useFormValue("email")}
                    onChange={(e) =>
                        form1.setFormValue("email", e.target.value)
                    }
                />
                <input
                    type="number"
                    placeholder="Age"
                    value={form1.useFormValue("age")}
                    onChange={(e) =>
                        form1.setFormValue("age", parseInt(e.target.value) || 0)
                    }
                />
                <button
                    onClick={() =>
                        console.log("Form1 values:", form1.getFormValues())
                    }
                >
                    Log Values
                </button>
            </div>

            <div>
                <h3>Form 2: Empty Object Config</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={form2.useFormValue("name")}
                    onChange={(e) => form2.setFormValue("name", e.target.value)}
                />
                <button
                    onClick={() =>
                        console.log("Form2 values:", form2.getFormValues())
                    }
                >
                    Log Values
                </button>
            </div>

            <div>
                <h3>Form 3: Only onSubmit Config</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={form3.useFormValue("name")}
                    onChange={(e) => form3.setFormValue("name", e.target.value)}
                />
                <button onClick={form3.submit}>Submit</button>
            </div>
        </div>
    );
}

/**
 * Zero-Config useFormaState 예제
 * useFormaState without any configuration
 */
export function ZeroConfigStateExample() {
    // Zero-Config: 매개변수 없이 사용
    const state1 = useFormaState<UserData>();

    // Zero-Config: 빈 객체로 시작
    const state2 = useFormaState<UserData>(undefined, {});

    // Zero-Config: options만 설정
    const state3 = useFormaState<UserData>(undefined, {
        onChange: (values: UserData) => {
            console.log("State changed:", values);
        },
    });

    return (
        <div>
            <h2>Zero-Config useFormaState Examples</h2>

            <div>
                <h3>State 1: Completely Zero-Config</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={state1.useValue("name") || ""}
                    onChange={(e) => state1.setValue("name", e.target.value)}
                />
                <button
                    onClick={() =>
                        console.log("State1 values:", state1.getValues())
                    }
                >
                    Log Values
                </button>
            </div>

            <div>
                <h3>State 2: Empty Object Initial Values</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={state2.useValue("name") || ""}
                    onChange={(e) => state2.setValue("name", e.target.value)}
                />
                <button
                    onClick={() =>
                        console.log("State2 values:", state2.getValues())
                    }
                >
                    Log Values
                </button>
            </div>

            <div>
                <h3>State 3: With onChange Callback</h3>
                <input
                    type="text"
                    placeholder="Name"
                    value={state3.useValue("name") || ""}
                    onChange={(e) => state3.setValue("name", e.target.value)}
                />
                <p>Check console for onChange logs</p>
            </div>
        </div>
    );
}

/**
 * Zero-Config vs Traditional 비교 예제
 * Comparison between Zero-Config and traditional usage
 */
export function ZeroConfigVsTraditionalExample() {
    // Traditional way (여전히 지원됨)
    const traditionalForm = useForm<UserData>({
        initialValues: {
            name: "",
            email: "",
            age: 0,
        },
        onSubmit: async (values: UserData) => {
            console.log("Traditional form submitted:", values);
        },
    });

    // Zero-Config way (새로운 방식)
    const zeroConfigForm = useForm<UserData>();

    return (
        <div>
            <h2>Zero-Config vs Traditional Comparison</h2>

            <div style={{ display: "flex", gap: "2rem" }}>
                <div>
                    <h3>Traditional Form</h3>
                    <p>Requires initialValues to be explicitly set</p>
                    <input
                        type="text"
                        placeholder="Name"
                        value={traditionalForm.useFormValue("name")}
                        onChange={(e) =>
                            traditionalForm.setFormValue("name", e.target.value)
                        }
                    />
                    <button onClick={traditionalForm.submit}>
                        Submit Traditional
                    </button>
                </div>

                <div>
                    <h3>Zero-Config Form</h3>
                    <p>No configuration needed - just start using!</p>
                    <input
                        type="text"
                        placeholder="Name"
                        value={zeroConfigForm.useFormValue("name")}
                        onChange={(e) =>
                            zeroConfigForm.setFormValue("name", e.target.value)
                        }
                    />
                    <button
                        onClick={() =>
                            console.log(
                                "Zero-config values:",
                                zeroConfigForm.getFormValues()
                            )
                        }
                    >
                        Log Values
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * 메인 Zero-Config 데모 컴포넌트
 * Main Zero-Config demo component
 */
export default function ZeroConfigDemo() {
    return (
        <div style={{ padding: "2rem" }}>
            <h1>Forma Zero-Config Examples</h1>
            <p>
                Forma now supports true Zero-Config usage! You can start using
                forms and state without any initial configuration.
            </p>

            <ZeroConfigFormExample />
            <hr />
            <ZeroConfigStateExample />
            <hr />
            <ZeroConfigVsTraditionalExample />
        </div>
    );
}
