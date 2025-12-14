import { useState, useRef } from "react";
import { useGlobalForm, useModal } from "@ehfuse/forma";
import { FormDialog } from "@ehfuse/mui-form-dialog";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
} from "@mui/material";

interface TestForm {
    firstName: string;
    lastName: string;
    email: string;
    loading: boolean;
}

/**
 * PersonalInfoContent - 별도 컴포넌트로 분리하여 sections 안정화
 */
function PersonalInfoContent({ formId }: { formId: string }) {
    // initialValues 없이 호출하여 기존 store 재사용
    const form = useGlobalForm<TestForm>({
        formId,
        autoCleanup: true, // 지연 cleanup으로 안전하게 사용 가능
        // initialValues 제거 - 부모 컴포넌트에서 이미 설정됨
    });

    console.log(`🔍 [PersonalInfoContent ${formId}] useGlobalForm 호출 완료`);
    console.log(
        `🔍 [PersonalInfoContent ${formId}] form._store.getValues():`,
        form._store.getValues()
    );
    console.log(
        `🔍 [PersonalInfoContent ${formId}] form._store 인스턴스:`,
        form._store
    );

    const firstName = form.useFormValue("firstName") || "";
    const lastName = form.useFormValue("lastName") || "";
    const email = form.useFormValue("email") || "";

    console.log(`🔍 [PersonalInfoContent ${formId}] render:`, {
        firstName,
        lastName,
        email,
    });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
                label="First Name"
                value={firstName}
                onChange={(e) => form.setFormValue("firstName", e.target.value)}
                fullWidth
            />
            <TextField
                label="Last Name"
                value={lastName}
                onChange={(e) => form.setFormValue("lastName", e.target.value)}
                fullWidth
            />
            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => form.setFormValue("email", e.target.value)}
                fullWidth
            />
            <Alert severity="info">
                이 다이얼로그는 form 값을 useFormValue로 구독하고 있습니다.
                (formId: {formId})
            </Alert>
        </Box>
    );
}

/**
 * PersonalInfoDialog - FormDialog를 사용하여 form 값을 구독하는 다이얼로그
 * GlobalFormActionsPage의 PersonalInfoContent와 동일한 구조
 */
function PersonalInfoDialog({
    formId,
    modal,
    loading,
}: {
    formId: string;
    modal: ReturnType<typeof useModal>;
    loading?: boolean;
}) {
    console.log(`🔍 [PersonalInfoDialog ${formId}] render`);

    // sections를 매번 새로 생성하되, PersonalInfoContent는 컴포넌트로 분리
    // React는 같은 컴포넌트 타입이면 리렌더링만 하고 리마운트하지 않음
    // key를 추가하여 modal.isOpen이 변경될 때 리마운트 강제
    const sections = [
        {
            id: "personal-info",
            icon: "�",
            title: "개인 정보",
            children: (
                <PersonalInfoContent
                    formId={formId}
                    key={String(modal.isOpen)}
                />
            ),
        },
    ];

    const actions = {
        left: (
            <Button onClick={() => modal.close()} color="inherit">
                닫기
            </Button>
        ),
        right: (
            <Button
                onClick={() => {
                    console.log(
                        `🔍 [PersonalInfoDialog ${formId}] 저장 버튼 클릭`
                    );
                    modal.close();
                }}
                variant="contained"
                color="primary"
            >
                저장
            </Button>
        ),
    };

    return (
        <FormDialog
            open={modal.isOpen}
            onClose={modal.close}
            title={`개인 정보 수정 (${formId})`}
            sections={sections}
            actions={actions}
            loading={loading}
        />
    );
}

/**
 * 🔴 GlobalFormActionsPage 스타일 (actions 사용)
 * actions 내에서 context.setValue/setValues 사용
 */
export function GlobalFormActionsStyle() {
    const [log, setLog] = useState<string[]>([]);
    const modal = useModal();

    const addLog = (message: string) => {
        console.log("� [GlobalFormActionsStyle]", message);
        setLog((prev) =>
            [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(
                0,
                15
            )
        );
    };

    const form = useGlobalForm<TestForm>({
        formId: "globalFormActionsTest",
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            loading: false,
        },
        actions: {
            // 🔴 actions 패턴: context.setValue 사용
            openDialog: (context, userId?: string) => {
                console.log("🔴 [Action] openDialog 시작, userId:", userId);
                addLog(`📂 다이얼로그 열기 시작 (userId: ${userId || "new"})`);

                modal.open();
                addLog("🎭 다이얼로그 열림");

                // loading 시작
                context.setValue("loading", true);
                addLog("⏳ loading = true (context.setValue)");

                // setTimeout으로 비동기 데이터 로딩 시뮬레이션
                setTimeout(() => {
                    const mockData = {
                        firstName: userId === "123" ? "Jane" : "New",
                        lastName: userId === "123" ? "Smith" : "User",
                        email:
                            userId === "123"
                                ? "jane.smith@example.com"
                                : "new.user@example.com",
                    };

                    console.log("🔴 [Action] setValues 호출:", mockData);
                    context.setValues({
                        ...mockData,
                        loading: false,
                    });
                    addLog(
                        `✅ 데이터 로드 완료 (context.setValues): ${mockData.firstName} ${mockData.lastName}`
                    );
                }, 1500);
            },

            submitForm: (context) => {
                console.log("🔴 [Action] submitForm 시작");
                addLog("💾 폼 저장 시작");

                context.setValue("loading", true);
                addLog("⏳ loading = true");

                setTimeout(() => {
                    context.setValue("loading", false);
                    addLog("✅ 폼 저장 완료");
                    console.log("🔴 [Action] submitForm 완료", context.values);
                }, 1000);
            },

            resetAll: (context) => {
                console.log("🔴 [Action] resetAll");
                context.setValues({
                    firstName: "",
                    lastName: "",
                    email: "",
                    loading: false,
                });
                addLog("🔄 모든 값 리셋 (context.setValues)");
            },
        },
    });

    const firstName = form.useFormValue("firstName");
    const lastName = form.useFormValue("lastName");
    const email = form.useFormValue("email");
    const loading = Boolean(form.useFormValue("loading"));

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3, bgcolor: "error.50" }}>
                <Typography variant="h6" color="error" gutterBottom>
                    🔴 GlobalFormActionsPage 스타일
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    actions 내에서 context.setValue/setValues 사용
                </Typography>
            </Paper>

            {/* 현재 값 표시 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    📊 현재 값
                </Typography>
                <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                    <Typography>
                        <strong>First Name:</strong> "{firstName}"
                    </Typography>
                    <Typography>
                        <strong>Last Name:</strong> "{lastName}"
                    </Typography>
                    <Typography>
                        <strong>Email:</strong> "{email}"
                    </Typography>
                    <Typography>
                        <strong>Loading:</strong> {loading ? "true" : "false"}
                        {loading && (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                        )}
                    </Typography>
                </Box>
            </Paper>

            {/* Actions 버튼 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    🔴 actions 내에서 <strong>context.setValue</strong>와{" "}
                    <strong>context.setValues</strong>를 사용합니다
                </Alert>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => form.actions.openDialog("123")}
                        disabled={loading}
                    >
                        📂 기존 사용자 불러오기 (userId: 123)
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={() => form.actions.openDialog()}
                        disabled={loading}
                    >
                        ➕ 새 사용자 생성
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => form.actions.submitForm()}
                        disabled={loading}
                    >
                        💾 폼 저장
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => form.actions.resetAll()}
                        disabled={loading}
                    >
                        🔄 모두 리셋
                    </Button>
                </Box>
            </Paper>

            {/* 로그 */}
            <Paper sx={{ p: 3, bgcolor: "grey.900" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ color: "white" }}>
                        📝 활동 로그 (Actions)
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        sx={{ color: "white", borderColor: "white" }}
                        onClick={() => setLog([])}
                    >
                        Clear
                    </Button>
                </Box>
                <Box
                    sx={{
                        maxHeight: 200,
                        overflow: "auto",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        color: "#ff6b6b",
                    }}
                >
                    {log.length === 0 ? (
                        <Typography sx={{ color: "grey.500" }}>
                            활동 내역이 없습니다
                        </Typography>
                    ) : (
                        log.map((line, i) => <div key={i}>{line}</div>)
                    )}
                </Box>
            </Paper>

            <PersonalInfoDialog
                formId="globalFormActionsTest"
                modal={modal}
                loading={loading}
            />
        </Box>
    );
}

/**
 * 🟢 GlobalFormPage 스타일 (직접 호출)
 * form.setFormValue 직접 호출
 */
export function GlobalFormPageStyle() {
    const [log, setLog] = useState<string[]>([]);
    const modal = useModal();

    const addLog = (message: string) => {
        console.log("🟢 [GlobalFormPageStyle]", message);
        setLog((prev) =>
            [`${new Date().toLocaleTimeString()}: ${message}`, ...prev].slice(
                0,
                15
            )
        );
    };

    // initialValues는 첫 렌더링에만 사용
    const initialValuesRef = useRef<TestForm>({
        firstName: "",
        lastName: "",
        email: "",
        loading: false,
    });

    const form = useGlobalForm<TestForm>({
        formId: "globalFormPageTest",
        initialValues: initialValuesRef.current,
        autoCleanup: true, // 지연 cleanup으로 리렌더링 시에도 안전
        // 🟢 actions 없음!
    });

    console.log(`🟢 [GlobalFormPageStyle] form._store 인스턴스:`, form._store);

    const firstName = form.useFormValue("firstName");
    const lastName = form.useFormValue("lastName");
    const email = form.useFormValue("email");
    const loading = Boolean(form.useFormValue("loading"));

    console.log(
        `🟢 [GlobalFormPageStyle] form._store.getValues():`,
        form._store.getValues()
    );

    // 🟢 직접 정의하는 함수들 (actions 대신)
    const openDialog = (userId?: string) => {
        console.log("🟢 [직접 호출] openDialog 시작, userId:", userId);
        addLog(`📂 다이얼로그 열기 시작 (userId: ${userId || "new"})`);

        modal.open();
        addLog("🎭 다이얼로그 열림");

        // loading 시작
        form.setFormValue("loading", true);
        addLog("⏳ loading = true (form.setFormValue)");

        // setTimeout으로 비동기 데이터 로딩 시뮬레이션
        setTimeout(() => {
            const mockData = {
                firstName: userId === "123" ? "John" : "Brand New",
                lastName: userId === "123" ? "Doe" : "Person",
                email:
                    userId === "123"
                        ? "john.doe@example.com"
                        : "brand.new@example.com",
            };

            console.log("🟢 [직접 호출] 개별 setFormValue 호출");
            form.setFormValue("firstName", mockData.firstName);
            form.setFormValue("lastName", mockData.lastName);
            form.setFormValue("email", mockData.email);
            form.setFormValue("loading", false);
            addLog(
                `✅ 데이터 로드 완료 (form.setFormValue): ${mockData.firstName} ${mockData.lastName}`
            );
        }, 1500);
    };

    const submitForm = () => {
        console.log("🟢 [직접 호출] submitForm 시작");
        addLog("💾 폼 저장 시작");

        form.setFormValue("loading", true);
        addLog("⏳ loading = true");

        setTimeout(() => {
            form.setFormValue("loading", false);
            addLog("✅ 폼 저장 완료");
            console.log("🟢 [직접 호출] submitForm 완료", form.values);
        }, 1000);
    };

    const resetAll = () => {
        console.log("🟢 [직접 호출] resetAll");
        form.setFormValue("firstName", "");
        form.setFormValue("lastName", "");
        form.setFormValue("email", "");
        form.setFormValue("loading", false);
        addLog("🔄 모든 값 리셋 (form.setFormValue)");
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3, bgcolor: "success.50" }}>
                <Typography variant="h6" color="success.dark" gutterBottom>
                    🟢 GlobalFormPage 스타일
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    form.setFormValue 직접 호출 (actions 없음)
                </Typography>
            </Paper>

            {/* 현재 값 표시 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    📊 현재 값
                </Typography>
                <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                    <Typography>
                        <strong>First Name:</strong> "{firstName}"
                    </Typography>
                    <Typography>
                        <strong>Last Name:</strong> "{lastName}"
                    </Typography>
                    <Typography>
                        <strong>Email:</strong> "{email}"
                    </Typography>
                    <Typography>
                        <strong>Loading:</strong> {loading ? "true" : "false"}
                        {loading && (
                            <CircularProgress size={16} sx={{ ml: 1 }} />
                        )}
                    </Typography>
                </Box>
            </Paper>

            {/* 직접 호출 버튼 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                    🟢 일반 함수에서 <strong>form.setFormValue</strong>를 직접
                    호출합니다
                </Alert>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => openDialog("123")}
                        disabled={loading}
                    >
                        📂 기존 사용자 불러오기 (userId: 123)
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={() => openDialog()}
                        disabled={loading}
                    >
                        ➕ 새 사용자 생성
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={() => submitForm()}
                        disabled={loading}
                    >
                        💾 폼 저장
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => resetAll()}
                        disabled={loading}
                    >
                        🔄 모두 리셋
                    </Button>
                </Box>
            </Paper>

            {/* 로그 */}
            <Paper sx={{ p: 3, bgcolor: "grey.900" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6" sx={{ color: "white" }}>
                        📝 활동 로그 (Direct Call)
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        sx={{ color: "white", borderColor: "white" }}
                        onClick={() => setLog([])}
                    >
                        Clear
                    </Button>
                </Box>
                <Box
                    sx={{
                        maxHeight: 200,
                        overflow: "auto",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        color: "#51cf66",
                    }}
                >
                    {log.length === 0 ? (
                        <Typography sx={{ color: "grey.500" }}>
                            활동 내역이 없습니다
                        </Typography>
                    ) : (
                        log.map((line, i) => <div key={i}>{line}</div>)
                    )}
                </Box>
            </Paper>

            {modal.isOpen && (
                <PersonalInfoDialog
                    formId="globalFormPageTest"
                    modal={modal}
                    loading={loading}
                />
            )}
        </Box>
    );
}

/**
 * 메인 비교 페이지
 */
export default function ActionsContextTest() {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                🆚 Actions vs Direct Call 비교
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                GlobalFormActionsPage (actions) vs GlobalFormPage (직접 호출)
                구조를 동일하게 구현하여 비교
            </Typography>

            <Alert severity="warning" sx={{ mb: 4 }}>
                <Typography variant="body2" gutterBottom>
                    <strong>테스트 방법:</strong>
                </Typography>
                <Typography variant="body2">
                    1. 각 스타일에서 "기존 사용자 불러오기" 버튼 클릭
                    <br />
                    2. 현재 값이 업데이트되는지 확인
                    <br />
                    3. 다이얼로그를 열어서 값이 동기화되는지 확인
                    <br />
                    4. 콘솔 로그와 활동 로그를 비교
                    <br />• 🔴 빨간색: Actions 패턴 (context.setValue/setValues)
                    <br />• 🟢 초록색: Direct Call 패턴 (form.setFormValue)
                </Typography>
            </Alert>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 4,
                }}
            >
                <GlobalFormActionsStyle />
                <GlobalFormPageStyle />
            </Box>
        </Box>
    );
}
