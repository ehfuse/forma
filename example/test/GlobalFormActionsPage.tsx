import { useMemo } from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useGlobalForm, useModal } from "@ehfuse/forma";
import { FormDialog, FormDialogSection } from "../../../src/index";
import { PersonalInfoContent } from "../forms/PersonalInfoSection";
import { PersonalData } from "../forms/types";

interface PersonalDataWithLoading extends PersonalData {
    loading?: boolean;
}

export default function GlobalFormActionsPage() {
    const modal = useModal();

    // useGlobalForm 사용 with actions
    const form = useGlobalForm<PersonalDataWithLoading>({
        formId: "personal-form-actions",
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
            loading: false, // loading 상태 추가
        },
        actions: {
            openDialog: async (context, userId?: string) => {
                modal.open();
                // loading 시작
                context.setValue("loading", true);

                // 2초 후 데이터 로드 (context와 userId 사용)
                setTimeout(() => {
                    context.setValues({
                        firstName: userId ? "User" : "Jane",
                        lastName: userId || "Smith",
                        email: `${userId || "jane.smith"}@example.com`,
                        phone: "+9876543210",
                        address: "456 Oak Avenue, City, State",
                        notes: `Loaded via actions after 2 seconds${
                            userId ? ` for user: ${userId}` : ""
                        }`,
                        loading: false, // loading 종료
                    });
                    console.log("loading completed");
                }, 2000);
            },
        },
    });

    // Hook을 컴포넌트 최상위에서 호출
    const firstName = form.useFormValue("firstName") || "";
    const lastName = form.useFormValue("lastName") || "";
    const email = form.useFormValue("email") || "";
    const phone = form.useFormValue("phone") || "";
    const address = form.useFormValue("address") || "";
    const notes = form.useFormValue("notes") || "";
    const loading = form.useFormValue("loading") || false;

    const sections: FormDialogSection[] = useMemo(
        () => [
            {
                id: "personal",
                title: "Personal Information",
                icon: <PersonIcon />,
                children: (
                    <PersonalInfoContent
                        readonly={false}
                        formId="personal-form-actions"
                    />
                ),
            },
        ],
        []
    );

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    useGlobalForm Actions Test
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    actions.openDialog를 호출하면 모달이 열리고 2초 후 데이터가
                    로드됩니다.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => form.actions.openDialog()}
                        startIcon={<PersonIcon />}
                    >
                        Open Dialog (No User)
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => form.actions.openDialog("john.doe")}
                        startIcon={<PersonIcon />}
                    >
                        Open Dialog (User: john.doe)
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() =>
                            form.setFormValues({
                                firstName: "",
                                lastName: "",
                                email: "",
                                phone: "",
                                address: "",
                                notes: "",
                            })
                        }
                    >
                        Clear
                    </Button>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Current Form Values:
                    </Typography>
                    <pre
                        style={{
                            background: "#f5f5f5",
                            padding: "16px",
                            borderRadius: "4px",
                            overflow: "auto",
                        }}
                    >
                        {JSON.stringify(
                            {
                                firstName,
                                lastName,
                                email,
                                phone,
                                address,
                                notes,
                            },
                            null,
                            2
                        )}
                    </pre>
                </Box>

                <FormDialog
                    open={modal.isOpen}
                    onClose={() => modal.close()}
                    title="Personal Information (Actions)"
                    sections={sections}
                    loading={loading}
                    actions={{
                        right: (
                            <Button
                                variant="contained"
                                onClick={() => {
                                    alert(
                                        `Saved:\n${firstName} ${lastName}\n${email}`
                                    );
                                    modal.close();
                                }}
                            >
                                Save
                            </Button>
                        ),
                    }}
                />
            </Paper>
        </Container>
    );
}
