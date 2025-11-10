import { useFormaState } from "@ehfuse/forma";
import { CounterState } from "../types";

export function StateManagementExample() {
    // Zero-Config state management
    const counterState = useFormaState<CounterState>();

    const count = counterState.useValue("count") || 0;
    const message = counterState.useValue("message") || "";

    const increment = () => {
        counterState.setValue("count", count + 1);
        counterState.setValue("message", `Incremented to ${count + 1}!`);
    };

    const decrement = () => {
        counterState.setValue("count", Math.max(0, count - 1));
        counterState.setValue(
            "message",
            `Decremented to ${Math.max(0, count - 1)}!`
        );
    };

    const reset = () => {
        counterState.reset();
    };

    return (
        <div className="example-section">
            <h2>🔄 Zero-Config State Management</h2>
            <p>폼이 아닌 일반 상태도 Zero-Config로 관리</p>

            <div className="counter-display">
                <h3>Count: {count}</h3>
                <p>{message}</p>
            </div>

            <div className="button-group">
                <button onClick={increment}>➕ Increment</button>
                <button onClick={decrement}>➖ Decrement</button>
                <button onClick={reset}>🔄 Reset</button>
                <button
                    onClick={() =>
                        console.log("State:", counterState.getValues())
                    }
                >
                    Log State
                </button>
            </div>

            <div className="form-group">
                <label>Custom Message:</label>
                <input
                    type="text"
                    placeholder="Enter a custom message"
                    value={message}
                    onChange={(e) =>
                        counterState.setValue("message", e.target.value)
                    }
                />
            </div>

            <div className="status">
                <p>
                    Current State:{" "}
                    {JSON.stringify(counterState.getValues(), null, 2)}
                </p>
            </div>
        </div>
    );
}
