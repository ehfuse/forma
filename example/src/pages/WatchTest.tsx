import { useRef } from "react";
import { useGlobalFormaState } from "../../../hooks/useGlobalFormaState";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
} from "@mui/material";

interface AuthState {
    logined: boolean;
    token: string | null;
    user: {
        name: string;
        email: string;
    } | null;
    pingLogs: string[];
}

export default function WatchTest() {
    const pingIntervalRef = useRef<ReturnType<typeof setInterval>>();

    const state = useGlobalFormaState<AuthState>({
        stateId: "watchTestState",
        initialValues: {
            logined: false,
            token: null,
            user: null,
            pingLogs: [],
        },
        actions: {
            startPing: (context) => {
                console.log("🟢 startPing 실행");

                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                }

                // 로그 초기화
                context.setValue("pingLogs", []);

                pingIntervalRef.current = setInterval(() => {
                    const timestamp = new Date().toLocaleTimeString();
                    const message = `📡 Ping... ${timestamp}`;
                    console.log(message);

                    // 로그 추가 (최대 10개만 유지)
                    const logs = context.getValue("pingLogs") as string[];
                    const newLogs = [...logs, message].slice(-10);
                    context.setValue("pingLogs", newLogs);
                }, 2000);
            },
            stopPing: (context) => {
                console.log("🔴 stopPing 실행");

                if (pingIntervalRef.current) {
                    clearInterval(pingIntervalRef.current);
                    pingIntervalRef.current = undefined;
                }

                // 종료 로그 추가
                const logs = context.getValue("pingLogs") as string[];
                context.setValue("pingLogs", [...logs, "🔴 Ping 중지됨"]);
            },
            login: (context) => {
                console.log("🔐 로그인 시작");
                console.log(
                    "🔍 로그인 전 logined 값:",
                    context.getValue("logined")
                );
                context.setValues({
                    logined: true,
                    token: "fake-token-" + Date.now(),
                    user: {
                        name: "John Doe",
                        email: "john@example.com",
                    },
                });
                console.log(
                    "🔍 로그인 후 logined 값:",
                    context.getValue("logined")
                );
            },
            logout: (context) => {
                console.log("🚪 로그아웃");
                context.setValues({
                    logined: false,
                    token: null,
                    user: null,
                    pingLogs: [], // 로그아웃 시 로그 초기화
                });
            },
        },
        watch: {
            // logined 필드를 watch하여 자동으로 ping 제어
            logined: (context, value, prevValue) => {
                console.log(
                    `👀 Watch: logined 변경됨 ${prevValue} -> ${value}`
                );

                if (value) {
                    context.actions.startPing(context);
                } else {
                    context.actions.stopPing(context);
                }
            },
            // user.name 변경 감시
            "user.name": (_context, value, prevValue) => {
                console.log(
                    `👀 Watch: user.name 변경됨 "${prevValue}" -> "${value}"`
                );
            },
            // user.email 변경 감시
            "user.email": (_context, value, prevValue) => {
                console.log(
                    `👀 Watch: user.email 변경됨 "${prevValue}" -> "${value}"`
                );
            },
        },
    });

    const logined = state.useValue("logined");
    const token = state.useValue("token");
    const userName = state.useValue("user.name");
    const userEmail = state.useValue("user.email");
    const pingLogs = state.useValue("pingLogs") as string[];

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                🔍 Watch 기능 테스트
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                    <strong>테스트 방법:</strong>
                </Typography>
                <Typography variant="body2">
                    1. "로그인" 버튼 클릭 → watch가 자동으로 ping 시작
                    <br />
                    2. 콘솔에서 2초마다 ping 로그 확인
                    <br />
                    3. 이름/이메일 변경 → watch가 변경 감지
                    <br />
                    4. "로그아웃" 버튼 클릭 → watch가 자동으로 ping 중지
                </Typography>
            </Alert>

            {/* 현재 상태 표시 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    📊 현재 상태
                </Typography>
                <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                    <Typography>
                        <strong>로그인:</strong> {logined ? "✅ Yes" : "❌ No"}
                    </Typography>
                    <Typography>
                        <strong>Token:</strong> {token || "(없음)"}
                    </Typography>
                    <Typography>
                        <strong>이름:</strong> {userName || "(없음)"}
                    </Typography>
                    <Typography>
                        <strong>이메일:</strong> {userEmail || "(없음)"}
                    </Typography>
                </Box>
            </Paper>

            {/* 액션 버튼 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    🎮 액션
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {!logined ? (
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={() => state.actions.login()}
                        >
                            🔐 로그인 (Watch가 ping 자동 시작)
                        </Button>
                    ) : (
                        <>
                            <TextField
                                label="이름"
                                value={userName || ""}
                                onChange={(e) =>
                                    state.setValue("user.name", e.target.value)
                                }
                                fullWidth
                            />
                            <TextField
                                label="이메일"
                                value={userEmail || ""}
                                onChange={(e) =>
                                    state.setValue("user.email", e.target.value)
                                }
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="error"
                                size="large"
                                onClick={() => state.actions.logout()}
                            >
                                🚪 로그아웃 (Watch가 ping 자동 중지)
                            </Button>
                        </>
                    )}
                </Box>
            </Paper>

            {/* Ping 로그 */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    📜 Ping 로그 (최근 10개)
                </Typography>
                <Box
                    sx={{
                        bgcolor: "#1e1e1e",
                        color: "#d4d4d4",
                        p: 2,
                        borderRadius: 1,
                        fontFamily: "monospace",
                        fontSize: 14,
                        minHeight: 200,
                        maxHeight: 300,
                        overflow: "auto",
                    }}
                >
                    {pingLogs && pingLogs.length > 0 ? (
                        pingLogs.map((log, idx) => <div key={idx}>{log}</div>)
                    ) : (
                        <div style={{ color: "#888" }}>
                            로그인하면 ping이 시작됩니다...
                        </div>
                    )}
                </Box>
            </Paper>

            {/* 설명 */}
            <Paper sx={{ p: 3, bgcolor: "grey.50" }}>
                <Typography variant="h6" gutterBottom>
                    💡 Watch 작동 원리
                </Typography>
                <Typography variant="body2" component="div">
                    <ul>
                        <li>
                            <code>
                                watch: &#123; "logined": (context, value,
                                prevValue) =&gt; ... &#125;
                            </code>
                            <br />
                            logined 필드가 변경되면 자동으로 콜백 실행
                        </li>
                        <li>
                            context를 통해 actions 호출 가능
                            <br />
                            <code>context.actions.startPing()</code>
                        </li>
                        <li>
                            Dot notation 지원
                            <br />
                            <code>"user.name"</code>, <code>"user.email"</code>{" "}
                            등
                        </li>
                        <li>등록된 path만 감시하여 성능 최적화</li>
                    </ul>
                </Typography>
            </Paper>
        </Box>
    );
}
