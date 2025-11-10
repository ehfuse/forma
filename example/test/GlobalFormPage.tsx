import { useState, useMemo } from "react";
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    TextField,
} from "@mui/material";
import { Person as PersonIcon } from "@mui/icons-material";
import { useGlobalForm } from "@ehfuse/forma";
import { FormDialog, FormDialogSection } from "../../../src/index";
import { PersonalInfoContent } from "../forms/PersonalInfoSection";
import { PersonalData } from "../forms/types";

export default function GlobalFormPage() {
    const [open, setOpen] = useState(false);

    // useGlobalForm 사용
    const form = useGlobalForm<PersonalData>({
        formId: "personal-form",
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            notes: "",
        },
    });

    const sections: FormDialogSection[] = useMemo(
        () => [
            {
                id: "personal",
                title: "Personal Information",
                icon: <PersonIcon />,
                children: (
                    <PersonalInfoContent
                        readonly={false}
                        formId="personal-form"
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
                    useGlobalForm Test
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    페이지의 입력값과 FormDialog의 입력값이 동기화됩니다.
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <TextField
                        name="firstName"
                        fullWidth
                        label="First Name (Page)"
                        value={form.useFormValue("firstName") || ""}
                        onChange={(e) =>
                            form.setFormValue("firstName", e.target.value)
                        }
                    />
                    <TextField
                        name="lastName"
                        fullWidth
                        label="Last Name (Page)"
                        value={form.useFormValue("lastName") || ""}
                        onChange={(e) =>
                            form.setFormValue("lastName", e.target.value)
                        }
                    />
                    <TextField
                        name="email"
                        fullWidth
                        label="Email (Page)"
                        type="email"
                        value={form.useFormValue("email") || ""}
                        onChange={(e) =>
                            form.setFormValue("email", e.target.value)
                        }
                    />
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() => setOpen(true)}
                        startIcon={<PersonIcon />}
                    >
                        Open FormDialog
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

                <FormDialog
                    open={open}
                    onClose={() => setOpen(false)}
                    title="Personal Information"
                    sections={sections}
                    actions={{
                        right: (
                            <Button
                                variant="contained"
                                onClick={() => {
                                    const firstName =
                                        form.useFormValue("firstName");
                                    const lastName =
                                        form.useFormValue("lastName");
                                    const email = form.useFormValue("email");
                                    alert(
                                        `Saved:\n${firstName} ${lastName}\n${email}`
                                    );
                                    setOpen(false);
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
