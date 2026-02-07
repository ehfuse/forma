import { useForm, useFormModified } from "@ehfuse/forma";
import { UserForm } from "../types";

export function ZeroConfigExample() {
    // 🔥 Zero-Config with optional initialValues for better reset behavior
    const form = useForm<UserForm>({
        initialValues: {
            name: "",
            email: "",
            age: 0,
            address: {
                street: "",
                city: "",
            },
        },
    });

    const handleSubmit = () => {
        const values = form.getFormValues();
        console.log("Zero-Config Form Values:", values);
        alert(
            `Form submitted! Check console for details.\nName: ${
                values.name || "empty"
            }`,
        );
    };

    const isModified = useFormModified(form);

    return (
        <div className="example-section">
            <h2>💫 Zero-Config useForm (with initial values)</h2>
            <p>Zero-Config이지만 reset 동작을 위해 초기값을 설정한 폼!</p>

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
                <button
                    onClick={() =>
                        console.log("Current values:", form.getFormValues())
                    }
                >
                    Log Values
                </button>
            </div>

            <div className="status">
                <p>Modified: {isModified ? "✅ Yes" : "❌ No"}</p>
                <p>Submitting: {form.isSubmitting ? "⏳ Yes" : "✅ No"}</p>
            </div>
        </div>
    );
}
