import { useRef } from "react";
import { useGlobalFormaState } from "@ehfuse/forma";
import { Button, Box, Typography, Paper } from "@mui/material";

/**
 * 배열 .length 구독 테스트 컴포넌트
 *
 * 테스트 시나리오:
 * 1. initialValues에 items: []로 배열 초기화
 * 2. items?.length vs useValue("items.length") 비교
 * 3. 배열이 실제 배열일 때와 undefined일 때 동작 확인
 */
export default function ArrayLengthTest() {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    const state = useGlobalFormaState({
        stateId: "array-length-test",
        initialValues: {
            items: [], // 배열로 초기화
            undefinedArray: undefined, // undefined로 초기화
        },
    });

    // 방법 1: 직접 배열 접근 후 length (옵셔널 체이닝)
    const items = state.useValue("items");
    const directLength = items?.length || 0;

    // 방법 2: .length 구독 (Forma의 특별한 기능)
    const lengthSubscription = state.useValue("items.length");

    // undefined 배열 테스트
    const undefinedArray = state.useValue("undefinedArray");
    const undefinedDirectLength = undefinedArray?.length || 0;
    const undefinedLengthSubscription = state.useValue("undefinedArray.length");

    // 리렌더링 카운터 (useRef 사용하여 무한루프 방지)
    // useRef는 렌더링을 트리거하지 않으므로 안전함

    // 테스트 함수들
    const addItem = () => {
        const currentItems = state.getValues().items || [];
        state.setValue("items", [
            ...currentItems,
            `아이템 ${currentItems.length + 1}`,
        ]);
    };

    const removeItem = () => {
        const currentItems = state.getValues().items || [];
        if (currentItems.length > 0) {
            state.setValue("items", currentItems.slice(0, -1));
        }
    };

    const clearItems = () => {
        state.setValue("items", []);
    };

    const setUndefinedArray = () => {
        state.setValue("undefinedArray", undefined);
    };

    const initializeUndefinedArray = () => {
        state.setValue("undefinedArray", ["첫 번째", "두 번째"]);
    };

    const addToUndefinedArray = () => {
        const current = state.getValues().undefinedArray || [];
        state.setValue("undefinedArray", [
            ...current,
            `새 아이템 ${current.length + 1}`,
        ]);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                배열 .length 구독 테스트
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
                리렌더링 횟수: {renderCountRef.current}
            </Typography>

            {/* 일반 배열 테스트 */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    1. 일반 배열 테스트 (initialValues: items: [])
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography>배열 내용: {JSON.stringify(items)}</Typography>
                    <Typography>
                        직접 접근 길이 (items?.length || 0): {directLength}
                    </Typography>
                    <Typography>
                        구독 길이 (useValue("items.length")):{" "}
                        {lengthSubscription}
                    </Typography>
                    <Typography
                        color={
                            directLength === lengthSubscription
                                ? "success.main"
                                : "error.main"
                        }
                    >
                        결과:{" "}
                        {directLength === lengthSubscription
                            ? "✅ 일치"
                            : "❌ 불일치"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button variant="contained" onClick={addItem}>
                        아이템 추가
                    </Button>
                    <Button variant="outlined" onClick={removeItem}>
                        아이템 제거
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={clearItems}
                    >
                        전체 삭제
                    </Button>
                </Box>
            </Paper>

            {/* undefined 배열 테스트 */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    2. undefined 배열 테스트 (initialValues: undefinedArray:
                    undefined)
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography>
                        배열 내용: {JSON.stringify(undefinedArray)}
                    </Typography>
                    <Typography>
                        직접 접근 길이 (undefinedArray?.length || 0):{" "}
                        {undefinedDirectLength}
                    </Typography>
                    <Typography>
                        구독 길이 (useValue("undefinedArray.length")):{" "}
                        {undefinedLengthSubscription}
                    </Typography>
                    <Typography
                        color={
                            undefinedDirectLength ===
                            undefinedLengthSubscription
                                ? "success.main"
                                : "error.main"
                        }
                    >
                        결과:{" "}
                        {undefinedDirectLength === undefinedLengthSubscription
                            ? "✅ 일치"
                            : "❌ 불일치"}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button
                        variant="contained"
                        onClick={initializeUndefinedArray}
                    >
                        배열 초기화
                    </Button>
                    <Button variant="outlined" onClick={addToUndefinedArray}>
                        아이템 추가
                    </Button>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={setUndefinedArray}
                    >
                        undefined로 설정
                    </Button>
                </Box>
            </Paper>

            {/* 결론 */}
            <Paper sx={{ p: 2, bgcolor: "info.light" }}>
                <Typography variant="h6" gutterBottom>
                    🔍 테스트 결론
                </Typography>
                <Typography variant="body2">
                    • <strong>배열 직접 접근</strong>: items?.length || 0
                    (옵셔널 체이닝 + fallback)
                </Typography>
                <Typography variant="body2">
                    • <strong>Forma .length 구독</strong>:
                    useValue("items.length") (내부적으로 최적화됨)
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>💡 핵심:</strong> Forma의 .length 구독은 배열이
                    undefined여도 0을 반환하므로, 옵셔널 체이닝 없이도 안전하게
                    사용할 수 있습니다.
                </Typography>
            </Paper>
        </Box>
    );
}
