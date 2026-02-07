import { useForm, useFormModified } from "@ehfuse/forma";
import { UserForm } from "../types";

export function TraditionalFormExample() {
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
        onSubmit: async (values: UserForm) => {
            console.log("Traditional Form Submitted:", values);
            alert("Form submitted successfully! Check console for details.");
        },
        onValidate: async (values: UserForm) => {
            if (!values.name || values.name.length < 2) {
                alert("Name must be at least 2 characters");
                return false;
            }
            if (!values.email || !values.email.includes("@")) {
                alert("Please enter a valid email");
                return false;
            }
            return true;
        },
    });

    const isModified = useFormModified(form);

    return (
        <div className="example-section">
            <h2>📝 Traditional useForm</h2>
            <p>완전한 설정과 유효성 검사가 포함된 폼</p>

            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.submit();
                }}
            >
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={form.useFormValue("name")}
                        onChange={form.handleFormChange}
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.useFormValue("email")}
                        onChange={form.handleFormChange}
                    />
                </div>

                <div className="form-group">
                    <label>Age:</label>
                    <input
                        name="age"
                        type="number"
                        placeholder="Enter your age"
                        value={form.useFormValue("age")}
                        onChange={form.handleFormChange}
                    />
                </div>

                <div className="form-group">
                    <label>Street Address:</label>
                    <input
                        name="address.street"
                        type="text"
                        placeholder="Enter street address"
                        value={form.useFormValue("address.street")}
                        onChange={form.handleFormChange}
                    />
                </div>

                <div className="form-group">
                    <label>City:</label>
                    <input
                        name="address.city"
                        type="text"
                        placeholder="Enter city"
                        value={form.useFormValue("address.city")}
                        onChange={form.handleFormChange}
                    />
                </div>

                <div className="button-group">
                    <button type="submit" disabled={form.isSubmitting}>
                        {form.isSubmitting
                            ? "Submitting..."
                            : "Submit with Validation"}
                    </button>
                    <button type="button" onClick={form.resetForm}>
                        Reset
                    </button>
                </div>
            </form>

            <div className="status">
                <p>Modified: {isModified ? "✅ Yes" : "❌ No"}</p>
                <p>Submitting: {form.isSubmitting ? "⏳ Yes" : "✅ No"}</p>
                <p>Validating: {form.isValidating ? "⏳ Yes" : "✅ No"}</p>
            </div>
        </div>
    );
}
