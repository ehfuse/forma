import { useForm, useFormModified } from "@ehfuse/forma";
import { UserForm } from "../types";

export function PureZeroConfigExample() {
    // 🔥 완전한 Zero-Config - 매개변수 없음
    const form = useForm<UserForm>();

    const handleSubmit = () => {
        const values = form.getFormValues();
        console.log("Pure Zero-Config Form Values:", values);
        alert(
            `Pure Zero-Config Form submitted! Check console for details.\nName: ${
                values.name || "empty"
            }`,
        );
    };

    const handleReset = () => {
        // Pure Zero-Config에서는 수동으로 필드를 클리어
        form.setFormValue("name", "");
        form.setFormValue("email", "");
        form.setFormValue("age", 0);
        form.setFormValue("address.street", "");
        form.setFormValue("address.city", "");
        console.log("Pure Zero-Config form manually reset");
    };

    const isModified = useFormModified(form);

    return (
        <div className="example-section">
            <h2>🔥 Pure Zero-Config useForm</h2>
            <p>완전히 설정 없이 사용하는 폼! Reset은 수동으로 구현됩니다.</p>

            <div className="form-group">
                <label>Name:</label>
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.useFormValue("name") || ""}
                    onChange={(e) => form.setFormValue("name", e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.useFormValue("email") || ""}
                    onChange={(e) => form.setFormValue("email", e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Age:</label>
                <input
                    type="number"
                    placeholder="Enter your age"
                    value={form.useFormValue("age") || ""}
                    onChange={(e) =>
                        form.setFormValue("age", parseInt(e.target.value) || 0)
                    }
                />
            </div>

            <div className="form-group">
                <label>Street Address:</label>
                <input
                    type="text"
                    placeholder="Enter street address"
                    value={form.useFormValue("address.street") || ""}
                    onChange={(e) =>
                        form.setFormValue("address.street", e.target.value)
                    }
                />
            </div>

            <div className="form-group">
                <label>City:</label>
                <input
                    type="text"
                    placeholder="Enter city"
                    value={form.useFormValue("address.city") || ""}
                    onChange={(e) =>
                        form.setFormValue("address.city", e.target.value)
                    }
                />
            </div>

            <div className="button-group">
                <button onClick={handleSubmit}>Submit Form</button>
                <button
                    onClick={() => {
                        console.log("Before reset:", form.getFormValues());
                        form.resetForm();
                        console.log("After reset:", form.getFormValues());
                    }}
                >
                    Reset
                </button>
                <button onClick={handleReset}>Manual Reset</button>
                <button
                    onClick={() =>
                        console.log(
                            "Pure Zero-Config values:",
                            form.getFormValues(),
                        )
                    }
                >
                    Log Values
                </button>
            </div>

            <div className="status">
                <p>Modified: {isModified ? "✅ Yes" : "❌ No"}</p>
                <p>Submitting: {form.isSubmitting ? "⏳ Yes" : "✅ No"}</p>
                <p>
                    <strong>Note:</strong> Pure Zero-Config doesn't have
                    predefined initial values, so reset is done manually.
                </p>
            </div>
        </div>
    );
}
