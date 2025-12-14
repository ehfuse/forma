import { useState } from "react";
import ZeroConfigDemo from "./pages/ZeroConfigExample";
import AutoCleanupExample from "./pages/AutoCleanupExample";
import FieldSubscriptionTest from "./pages/FieldSubscriptionTest";
import RenderCountTest from "./pages/RenderCountTest";
import MUICheckboxBatchExample from "./pages/MUICheckboxBatchExample";
import ArrayLengthTest from "./pages/ArrayLengthTest";
import ArrayReplaceTest from "./pages/ArrayReplaceTest";
import GlobalStarSubscriptionTest from "./pages/GlobalStarSubscriptionTest";
import EmptyInitialValueTest from "./pages/EmptyInitialValueTest";
import DebugFormaState from "./pages/DebugFormaState";
import WildcardSubscriptionDebug from "./pages/WildcardSubscriptionDebug";
import ModalExample from "./pages/ModalExample";
import SetValueNotificationTest from "./pages/SetValueNotificationTest";
import HandlerSharingExample from "./pages/HandlerSharingExample";
import ModalCloseTest from "./pages/ModalCloseTest";
import ActionsTest from "./pages/ActionsTest";
import FormaStateActionsTest from "./pages/FormaStateActionsTest";
import ActionsContextTest from "./pages/ActionsContextTest";
import WatchTest from "./pages/WatchTest";
import SimpleAccessTest from "./pages/SimpleAccessTest";
import WildcardWatchTest from "./pages/WildcardWatchTest";
import { NestedSubscriptionTest } from "./pages/NestedSubscriptionTest";
import GlobalStateShareTest from "./pages/GlobalStateShareTest";
import SetValueChildNotificationTest from "./pages/SetValueChildNotificationTest";
import SetValuesBugTest from "./pages/SetValuesBugTest";
import TimingIssueTest from "./pages/TimingIssueTest";
import ResetBugTest from "./pages/ResetBugTest";
import WatchParentPathTest from "./pages/WatchParentPathTest";
import PersistTest from "./pages/PersistTest";
import LocalStorageTest from "./pages/LocalStorageTest";
import {
    ZeroConfigExample,
    PureZeroConfigExample,
    TraditionalFormExample,
    StateManagementExample,
} from "./components";
import "./App.css";
import BatchTest from "./pages/BatchTest";

type TabType =
    | "zero-config"
    | "pure-zero"
    | "traditional"
    | "state"
    | "examples"
    | "autocleanup"
    | "field-test"
    | "render-test"
    | "mui-checkbox"
    | "array-length"
    | "batch-test"
    | "array-replace"
    | "star-subscription"
    | "empty-initial"
    | "debug"
    | "wildcard-debug"
    | "modal-example"
    | "setvalue-notification-test"
    | "handler-sharing"
    | "modal-close-test"
    | "actions-test"
    | "formastate-actions-test"
    | "actions-context-test"
    | "watch-test"
    | "simple-access-test"
    | "wildcard-watch-test"
    | "nested-subscription-test"
    | "global-state-share-test"
    | "setvalue-child-notification"
    | "setvalues-bug-test"
    | "timing-issue-test"
    | "reset-bug-test"
    | "watch-parent-path-test"
    | "persist-test"
    | "localstorage-test";

function App() {
    const [activeTab, setActiveTab] = useState<TabType>("zero-config");

    return (
        <div className="App">
            <h1>🎯 Forma Testing Playground</h1>

            <div className="tabs">
                <button
                    className={activeTab === "zero-config" ? "active" : ""}
                    onClick={() => setActiveTab("zero-config")}
                >
                    💫 Zero-Config
                </button>
                <button
                    className={activeTab === "pure-zero" ? "active" : ""}
                    onClick={() => setActiveTab("pure-zero")}
                >
                    🔥 Pure Zero-Config
                </button>
                <button
                    className={activeTab === "traditional" ? "active" : ""}
                    onClick={() => setActiveTab("traditional")}
                >
                    📝 Traditional Form
                </button>
                <button
                    className={activeTab === "state" ? "active" : ""}
                    onClick={() => setActiveTab("state")}
                >
                    🔄 State Management
                </button>
                <button
                    className={activeTab === "examples" ? "active" : ""}
                    onClick={() => setActiveTab("examples")}
                >
                    📚 Examples
                </button>
                <button
                    className={activeTab === "autocleanup" ? "active" : ""}
                    onClick={() => setActiveTab("autocleanup")}
                >
                    🧪 AutoCleanup
                </button>
                <button
                    className={activeTab === "field-test" ? "active" : ""}
                    onClick={() => setActiveTab("field-test")}
                >
                    🔍 Field Subscription
                </button>
                <button
                    className={activeTab === "render-test" ? "active" : ""}
                    onClick={() => setActiveTab("render-test")}
                >
                    🎯 Render Count Test
                </button>
                <button
                    className={activeTab === "mui-checkbox" ? "active" : ""}
                    onClick={() => setActiveTab("mui-checkbox")}
                >
                    🚀 MUI Checkbox Batch
                </button>
                <button
                    className={activeTab === "array-length" ? "active" : ""}
                    onClick={() => setActiveTab("array-length")}
                >
                    📏 Array Length Test
                </button>
                <button
                    className={activeTab === "batch-test" ? "active" : ""}
                    onClick={() => setActiveTab("batch-test")}
                >
                    ⚡ Batch Test
                </button>
                <button
                    className={activeTab === "array-replace" ? "active" : ""}
                    onClick={() => setActiveTab("array-replace")}
                >
                    🔄 Array Replace Test
                </button>
                <button
                    className={
                        activeTab === "star-subscription" ? "active" : ""
                    }
                    onClick={() => setActiveTab("star-subscription")}
                >
                    🌟 "*" Subscription Test
                </button>
                <button
                    className={activeTab === "empty-initial" ? "active" : ""}
                    onClick={() => setActiveTab("empty-initial")}
                >
                    🆕 Empty Initial Test
                </button>
                <button
                    className={activeTab === "debug" ? "active" : ""}
                    onClick={() => setActiveTab("debug")}
                >
                    🔍 Debug State
                </button>
                <button
                    className={activeTab === "wildcard-debug" ? "active" : ""}
                    onClick={() => setActiveTab("wildcard-debug")}
                >
                    🔥 Wildcard Debug
                </button>
                <button
                    className={activeTab === "modal-example" ? "active" : ""}
                    onClick={() => setActiveTab("modal-example")}
                >
                    🎭 Modal Example
                </button>
                <button
                    className={
                        activeTab === "setvalue-notification-test"
                            ? "active"
                            : ""
                    }
                    onClick={() => setActiveTab("setvalue-notification-test")}
                >
                    🔔 setValue 알림 테스트
                </button>
                <button
                    className={activeTab === "handler-sharing" ? "active" : ""}
                    onClick={() => setActiveTab("handler-sharing")}
                >
                    🤝 핸들러 공유
                </button>
                <button
                    className={activeTab === "modal-close-test" ? "active" : ""}
                    onClick={() => setActiveTab("modal-close-test")}
                >
                    🧪 Modal Close Test
                </button>
                <button
                    className={activeTab === "actions-test" ? "active" : ""}
                    onClick={() => setActiveTab("actions-test")}
                >
                    🎬 Actions Test
                </button>
                <button
                    className={
                        activeTab === "formastate-actions-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("formastate-actions-test")}
                >
                    🎬 FormaState Actions
                </button>
                <button
                    className={
                        activeTab === "actions-context-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("actions-context-test")}
                >
                    🔍 Actions Context Test
                </button>
                <button
                    className={activeTab === "watch-test" ? "active" : ""}
                    onClick={() => setActiveTab("watch-test")}
                >
                    👀 Watch Test
                </button>
                <button
                    className={
                        activeTab === "simple-access-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("simple-access-test")}
                >
                    ⚡ Simple Access
                </button>
                <button
                    className={
                        activeTab === "wildcard-watch-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("wildcard-watch-test")}
                >
                    🌟 Wildcard Watch
                </button>
                <button
                    className={
                        activeTab === "nested-subscription-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("nested-subscription-test")}
                >
                    🔴 Nested Subscription
                </button>
                <button
                    className={
                        activeTab === "global-state-share-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("global-state-share-test")}
                >
                    🌐 Global State Share
                </button>
                <button
                    className={
                        activeTab === "setvalue-child-notification"
                            ? "active"
                            : ""
                    }
                    onClick={() => setActiveTab("setvalue-child-notification")}
                >
                    🐛 setValue Child Bug
                </button>
                <button
                    className={
                        activeTab === "setvalues-bug-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("setvalues-bug-test")}
                >
                    🔴 setValues Bug Test
                </button>
                <button
                    className={
                        activeTab === "timing-issue-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("timing-issue-test")}
                >
                    ⏱️ Timing Issue Test
                </button>
                <button
                    className={activeTab === "reset-bug-test" ? "active" : ""}
                    onClick={() => setActiveTab("reset-bug-test")}
                >
                    🔄 Reset Bug Test
                </button>
                <button
                    className={
                        activeTab === "watch-parent-path-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("watch-parent-path-test")}
                >
                    📍 Watch Parent Path Test
                </button>
                <button
                    className={activeTab === "persist-test" ? "active" : ""}
                    onClick={() => setActiveTab("persist-test")}
                >
                    💾 Persist Test
                </button>
                <button
                    className={
                        activeTab === "localstorage-test" ? "active" : ""
                    }
                    onClick={() => setActiveTab("localstorage-test")}
                >
                    🗄️ LocalStorage Test
                </button>
            </div>

            <div className="content">
                {activeTab === "zero-config" && <ZeroConfigExample />}
                {activeTab === "pure-zero" && <PureZeroConfigExample />}
                {activeTab === "traditional" && <TraditionalFormExample />}
                {activeTab === "state" && <StateManagementExample />}
                {activeTab === "examples" && <ZeroConfigDemo />}
                {activeTab === "autocleanup" && <AutoCleanupExample />}
                {activeTab === "field-test" && <FieldSubscriptionTest />}
                {activeTab === "render-test" && <RenderCountTest />}
                {activeTab === "mui-checkbox" && <MUICheckboxBatchExample />}
                {activeTab === "array-length" && <ArrayLengthTest />}
                {activeTab === "batch-test" && <BatchTest />}
                {activeTab === "array-replace" && <ArrayReplaceTest />}
                {activeTab === "star-subscription" && (
                    <GlobalStarSubscriptionTest />
                )}
                {activeTab === "empty-initial" && <EmptyInitialValueTest />}
                {activeTab === "debug" && <DebugFormaState />}
                {activeTab === "wildcard-debug" && (
                    <WildcardSubscriptionDebug />
                )}
                {activeTab === "modal-example" && <ModalExample />}
                {activeTab === "setvalue-notification-test" && (
                    <SetValueNotificationTest />
                )}
                {activeTab === "handler-sharing" && <HandlerSharingExample />}
                {activeTab === "modal-close-test" && <ModalCloseTest />}
                {activeTab === "actions-test" && <ActionsTest />}
                {activeTab === "formastate-actions-test" && (
                    <FormaStateActionsTest />
                )}
                {activeTab === "actions-context-test" && <ActionsContextTest />}
                {activeTab === "watch-test" && <WatchTest />}
                {activeTab === "simple-access-test" && <SimpleAccessTest />}
                {activeTab === "wildcard-watch-test" && <WildcardWatchTest />}
                {activeTab === "nested-subscription-test" && (
                    <NestedSubscriptionTest />
                )}
                {activeTab === "global-state-share-test" && (
                    <GlobalStateShareTest />
                )}
                {activeTab === "setvalue-child-notification" && (
                    <SetValueChildNotificationTest />
                )}
                {activeTab === "setvalues-bug-test" && <SetValuesBugTest />}
                {activeTab === "timing-issue-test" && <TimingIssueTest />}
                {activeTab === "reset-bug-test" && <ResetBugTest />}
                {activeTab === "watch-parent-path-test" && (
                    <WatchParentPathTest />
                )}
                {activeTab === "persist-test" && <PersistTest />}
                {activeTab === "localstorage-test" && <LocalStorageTest />}
            </div>
        </div>
    );
}

export default App;
