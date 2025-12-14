/**
 * SimpleAccessTest.tsx
 *
 * useGlobalFormaState("stateId") 및 useGlobalForm("formId") 간단 접근 테스트
 */

import { useGlobalFormaState, useGlobalForm } from "@ehfuse/forma";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

interface UserState {
    name: string;
    email: string;
    age: number;
}

// 첫 번째 컴포넌트: 초기 설정 및 등록
function StateRegistration() {
    const state = useGlobalFormaState<UserState>({
        stateId: "simple-user-state",
        initialValues: {
            name: "John Doe",
            email: "john@example.com",
            age: 30,
        },
        actions: {
            incrementAge: (ctx) => {
                const currentAge = ctx.getValue("age");
                ctx.setValue("age", (currentAge || 0) + 1);
            },
            resetUser: (ctx) => {
                ctx.setValues({
                    name: "John Doe",
                    email: "john@example.com",
                    age: 30,
                });
            },
        },
    });

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                컴포넌트 A: State 등록 및 설정
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                stateId: "simple-user-state"로 초기값과 actions 등록
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => state.actions.incrementAge(state)}
                    sx={{ mr: 1 }}
                >
                    나이 증가
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => state.actions.resetUser(state)}
                >
                    리셋
                </Button>
            </Box>
        </Paper>
    );
}

// 두 번째 컴포넌트: 간단 접근으로 사용
function SimpleStateAccess() {
    // ✅ 간단 접근: stateId만으로 바로 사용
    const state = useGlobalFormaState<UserState>("simple-user-state");

    const name = state.useValue("name");
    const email = state.useValue("email");
    const age = state.useValue("age");

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                컴포넌트 B: 간단 접근 (stateId만 사용)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                useGlobalFormaState("simple-user-state") 로 바로 접근
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography>Name: {name}</Typography>
                <Typography>Email: {email}</Typography>
                <Typography>Age: {age}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
                <TextField
                    label="이름 변경"
                    size="small"
                    value={name}
                    onChange={(e) => state.setValue("name", e.target.value)}
                    sx={{ mr: 1 }}
                />
                <Button
                    variant="contained"
                    onClick={() => state.actions.incrementAge(state)}
                >
                    나이 증가
                </Button>
            </Box>
        </Paper>
    );
}

// 세 번째 컴포넌트: 다른 컴포넌트에서도 간단 접근
function AnotherSimpleAccess() {
    const state = useGlobalFormaState<UserState>("simple-user-state");

    const name = state.useValue("name");
    const age = state.useValue("age");

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                컴포넌트 C: 또 다른 간단 접근
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                같은 stateId로 어디서든 접근 가능
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="body1">
                    {name}님은 {age}세입니다.
                </Typography>
            </Box>
        </Paper>
    );
}

// Form 테스트
interface LoginForm {
    username: string;
    password: string;
}

function FormRegistration() {
    const form = useGlobalForm<LoginForm>({
        formId: "simple-login-form",
        initialValues: {
            username: "",
            password: "",
        },
        onSubmit: async (values) => {
            console.log("로그인:", values);
        },
    });

    const username = form.useFormValue("username");
    const password = form.useFormValue("password");

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                폼 등록 컴포넌트
            </Typography>
            <TextField
                label="Username"
                fullWidth
                size="small"
                value={username || ""}
                onChange={(e) => form.setFormValue("username", e.target.value)}
                sx={{ mb: 1 }}
            />
            <TextField
                label="Password"
                type="password"
                fullWidth
                size="small"
                value={password || ""}
                onChange={(e) => form.setFormValue("password", e.target.value)}
                sx={{ mb: 1 }}
            />
            <Button variant="contained" onClick={() => form.submit()}>
                로그인
            </Button>
        </Paper>
    );
}

function SimpleFormAccess() {
    // ✅ 간단 접근: formId만으로 바로 사용
    const form = useGlobalForm<LoginForm>("simple-login-form");

    const username = form.useFormValue("username");
    const password = form.useFormValue("password");

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
                폼 간단 접근
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                useGlobalForm("simple-login-form")으로 바로 접근
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography>Username: {username || "(empty)"}</Typography>
                <Typography>
                    Password: {password ? "******" : "(empty)"}
                </Typography>
            </Box>
        </Paper>
    );
}

export default function SimpleAccessTest() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Simple Access Test
            </Typography>
            <Typography variant="body1" gutterBottom color="text.secondary">
                useGlobalFormaState("stateId") 및 useGlobalForm("formId") 간단
                접근 테스트
            </Typography>

            <Box sx={{ mt: 3 }}>
                <Typography variant="h5" gutterBottom>
                    1. FormaState 테스트
                </Typography>
                <StateRegistration />
                <SimpleStateAccess />
                <AnotherSimpleAccess />
            </Box>

            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    2. Form 테스트
                </Typography>
                <FormRegistration />
                <SimpleFormAccess />
            </Box>
        </Box>
    );
}
