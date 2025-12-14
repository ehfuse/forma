import {
    useRef,
    useState,
    forwardRef,
    useImperativeHandle,
    createContext,
    useContext,
} from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    Chip,
    Divider,
    Alert,
    Stack,
} from "@mui/material";
import { useFormaState } from "@ehfuse/forma";

interface User {
    name: string;
    age: number;
}

interface TestItemRef {
    getRenderCount: () => number;
    resetRenderCount: () => void;
}

// 공유 상태를 위한 Context
const FormaStateContext = createContext<any>(null);

// 개별 필드를 구독하는 테스트 컴포넌트
const TestItem = forwardRef<TestItemRef, { index: number }>(
    ({ index }, ref) => {
        const [renderCount, setRenderCount] = useState(1);
        const { useValue } = useContext(FormaStateContext);

        const user = useValue(`users.${index}`) as User;

        useImperativeHandle(ref, () => ({
            getRenderCount: () => renderCount,
            resetRenderCount: () => setRenderCount(1),
        }));

        // 렌더링될 때마다 카운트 증가
        useState(() => {
            if (renderCount > 1) {
                console.log(
                    `TestItem ${index} rendered ${renderCount} times:`,
                    user
                );
            }
        });

        const handleIncrement = () => {
            setRenderCount((prev) => prev + 1);
        };

        return (
            <Paper
                sx={{
                    p: 2,
                    backgroundColor: renderCount > 1 ? "#ffebee" : "#e8f5e8",
                    border:
                        renderCount > 1
                            ? "2px solid #f44336"
                            : "2px solid #4caf50",
                }}
            >
                <Typography variant="subtitle2" gutterBottom>
                    항목 {index}
                </Typography>
                <Typography variant="body2">
                    이름: {user?.name || "로딩..."}
                </Typography>
                <Typography variant="body2">
                    나이: {user?.age || "로딩..."}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    렌더링 횟수: {renderCount}
                </Typography>
                <Button size="small" onClick={handleIncrement} sx={{ mt: 1 }}>
                    강제 리렌더
                </Button>
            </Paper>
        );
    }
);

export default function ArrayReplaceTest() {
    const formaState = useFormaState<{ users: User[] }>({ users: [] });
    const { getValue, setValue } = formaState;
    const testItemRefs = useRef<(TestItemRef | null)[]>([]);

    // 초기 데이터 설정
    const [isInitialized, setIsInitialized] = useState(false);

    const initializeData = () => {
        if (!isInitialized) {
            const initialUsers = [
                { name: "Alice", age: 25 },
                { name: "Bob", age: 30 },
                { name: "Charlie", age: 35 },
                { name: "David", age: 40 },
                { name: "Eve", age: 45 },
            ];
            setValue("users", initialUsers);
            setIsInitialized(true);
        }
    };

    // 컴포넌트 마운트 시 데이터 초기화
    useState(() => {
        initializeData();
    });

    const users = (getValue("users") as User[]) || [];

    // 배열 전체 교체 (0번만 변경)
    const handleReplaceArray = () => {
        console.log("=== 배열 전체 교체 (0번만 변경) ===");
        resetRenderCounts();

        const newUsers = [
            { name: "Alice_Updated", age: 26 }, // 0번만 변경
            { name: "Bob", age: 30 }, // 동일
            { name: "Charlie", age: 35 }, // 동일
            { name: "David", age: 40 }, // 동일
            { name: "Eve", age: 45 }, // 동일
        ];

        setValue("users", newUsers);
        console.log("새 배열 설정 완료");
    };

    // 배열 전체 교체 (모두 변경)
    const handleReplaceAllDifferent = () => {
        console.log("=== 배열 전체 교체 (모든 값 변경) ===");
        resetRenderCounts();

        const newUsers = [
            { name: "Alice_New", age: 26 },
            { name: "Bob_New", age: 31 },
            { name: "Charlie_New", age: 36 },
            { name: "David_New", age: 41 },
            { name: "Eve_New", age: 46 },
        ];

        setValue("users", newUsers);
        console.log("새 배열 설정 완료 (모든 값 변경)");
    };

    // 렌더링 카운트 리셋
    const resetRenderCounts = () => {
        testItemRefs.current.forEach((ref) => {
            if (ref) {
                ref.resetRenderCount();
            }
        });
    };

    // 로그 초기화
    const handleClearLogs = () => {
        console.clear();
        resetRenderCounts();
    };

    return (
        <FormaStateContext.Provider value={formaState}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    배열 교체 로직 테스트
                </Typography>

                <Typography variant="body1" paragraph>
                    이 테스트는 배열을 통째로 교체할 때 개별 필드 구독자들이
                    적절히 알림을 받는지 확인합니다. 각 항목은{" "}
                    <code>users.{"{index}"}</code> 경로를 개별적으로 구독하고
                    있습니다.
                </Typography>

                <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        테스트 방법:
                    </Typography>
                    <ol style={{ margin: 0, paddingLeft: "1.5rem" }}>
                        <li>
                            "0번만 변경" 버튼 클릭 → 0번 항목만
                            빨간색(리렌더링)이 되어야 함
                        </li>
                        <li>
                            "모두 변경" 버튼 클릭 → 모든 항목이
                            빨간색(리렌더링)이 되어야 함
                        </li>
                        <li>
                            녹색은 리렌더링이 안 된 상태, 빨간색은 리렌더링된
                            상태
                        </li>
                    </ol>
                </Alert>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <Box
                        sx={{
                            flex: "0 0 auto",
                            minWidth: { xs: "100%", md: "350px" },
                        }}
                    >
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                테스트 컨트롤
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleReplaceArray}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    배열 전체 교체 (0번만 변경)
                                </Button>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    첫 번째 요소만 변경하고 나머지는 동일한
                                    값으로 배열 교체
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleReplaceAllDifferent}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    배열 전체 교체 (모두 변경)
                                </Button>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    모든 요소를 다른 값으로 배열 교체
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleClearLogs}
                                    fullWidth
                                >
                                    로그 초기화
                                </Button>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle1" gutterBottom>
                                현재 배열 상태:
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                {users.map((user, index) => (
                                    <Chip
                                        key={index}
                                        label={`${index}: ${user.name}`}
                                        variant="outlined"
                                        size="small"
                                    />
                                ))}
                            </Box>

                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{ mt: 2 }}
                            >
                                총 렌더링 횟수:
                            </Typography>

                            <Box
                                sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 1,
                                }}
                            >
                                {Array.from({ length: 5 }, (_, index) => {
                                    const renderCount =
                                        testItemRefs.current[
                                            index
                                        ]?.getRenderCount() || 1;
                                    return (
                                        <Chip
                                            key={index}
                                            label={`${index}: ${renderCount}회`}
                                            color={
                                                renderCount > 1
                                                    ? "warning"
                                                    : "success"
                                            }
                                            size="small"
                                        />
                                    );
                                })}
                            </Box>

                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{ mt: 2 }}
                            >
                                기대 결과:
                            </Typography>
                            <Alert
                                severity="info"
                                sx={{ fontSize: "0.875rem" }}
                            >
                                "0번만 변경" 버튼: 0번 항목만 리렌더링되어야 함
                                <br />
                                "모두 변경" 버튼: 모든 항목이 리렌더링되어야 함
                            </Alert>
                        </Paper>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                테스트 항목들 (개별 구독)
                            </Typography>

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: 2,
                                }}
                            >
                                {Array.from({ length: 5 }, (_, index) => (
                                    <TestItem
                                        key={index}
                                        index={index}
                                        ref={(ref) => {
                                            testItemRefs.current[index] = ref;
                                        }}
                                    />
                                ))}
                            </Box>
                        </Paper>
                    </Box>
                </Stack>
            </Box>
        </FormaStateContext.Provider>
    );
}
