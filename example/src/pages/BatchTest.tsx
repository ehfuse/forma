import { useRef, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Alert,
    Chip,
    Paper,
} from "@mui/material";
import { useFormaState } from "@ehfuse/forma";

// 🔥 핵심: 개별 항목을 구독하는 컴포넌트 - 의도적으로 무거운 렌더링
// setValue: 각 필드 변경마다 이 컴포넌트가 리렌더링됨
// setBatch: 모든 필드 변경 후 한 번만 리렌더링됨
const TestItem = ({ state, index }: { state: any; index: number }) => {
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    // 각 항목의 개별 필드들을 구독 - 이것이 핵심!
    const checked = state.useValue(`searchResults.${index}.checked`);
    const name = state.useValue(`searchResults.${index}.name`);
    const category = state.useValue(`searchResults.${index}.category`);
    const complexValue = state.useValue(`searchResults.${index}.complexValue`);
    const description = state.useValue(`searchResults.${index}.description`);

    // 💥 의도적으로 무거운 계산을 추가하여 렌더링 비용 증가
    const heavyCalculation = useMemo(() => {
        let result = 0;
        for (let i = 0; i < 1000; i++) {
            result += Math.sin(i) * Math.cos(i);
        }
        return result;
    }, [checked, name, category, complexValue, description]);

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1,
                mb: 1,
                bgcolor: checked ? "success.light" : "grey.100",
                borderRadius: 1,
                border: checked ? "1px solid green" : "1px solid #ccc",
            }}
        >
            <Box>
                <Typography variant="body2">
                    {name} ({category}) - 렌더: {renderCountRef.current}회
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    계산값: {heavyCalculation.toFixed(3)} |{" "}
                    {description?.substring(0, 30)}...
                </Typography>
            </Box>
            {checked && (
                <Chip
                    label="선택됨"
                    size="small"
                    color="success"
                    variant="outlined"
                />
            )}
        </Box>
    );
};

export default function BatchTest() {
    // 리렌더링 추적
    const renderCountRef = useRef(0);
    renderCountRef.current += 1;

    // 성능 측정 상태
    const [lastUpdateTime, setLastUpdateTime] = useState(0);
    const [lastUpdateMethod, setLastUpdateMethod] = useState("없음");
    const [performanceHistory, setPerformanceHistory] = useState<
        Array<{
            method: string;
            time: number;
            renderCount: number;
            timestamp: number;
        }>
    >([]);

    const state = useFormaState({
        initialValues: {
            // 테스트용 데이터 - 처음에는 적게 시작
            searchResults: Array.from({ length: 50 }, (_, i) => ({
                id: i + 1,
                name: `테스트 항목 ${i + 1}`,
                checked: false,
                priority: Math.floor(Math.random() * 5) + 1,
                category: i % 5 === 0 ? "important" : "normal",
                lastModified: Date.now(),
            })),
            // 전체 상태
            isAllSelected: false,
            selectedCount: 0,
            checkToggleCounter: 0,
            lastUpdateTime: 0,
            totalOperations: 0,
        },
    });

    // 현재 값들 구독
    const searchResults = state.useValue("searchResults") || [];

    // 🔥 적절한 테스트용 대량 데이터 생성
    const createLargeDataset = () => {
        const startTime = performance.now();

        // 현재 검색 결과를 복사하고 2000개 더 추가
        const currentResults = [...searchResults];
        const newItems = Array.from({ length: 2000 }, (_, i) => ({
            id: currentResults.length + i + 1,
            name: `적절한 테스트 데이터 ${i + 1}`,
            checked: false, // 모두 선택되지 않은 상태로 시작
            category: Math.random() > 0.7 ? "important" : "normal",
            priority: Math.floor(Math.random() * 5) + 1,
            lastModified: Date.now(),
            // 💥 의도적으로 복잡한 계산 추가
            complexValue: Math.sin(i) * Math.cos(i) * Math.random(),
            description: `복잡한 설명 텍스트 ${i} - ${Math.random()
                .toString(36)
                .substring(7)}`,
        }));

        // 전체 배열을 새로 설정
        state.setValue("searchResults", [...currentResults, ...newItems]);

        const endTime = performance.now();
        setLastUpdateTime(endTime - startTime);
        setLastUpdateMethod(`적절한 데이터 생성 (2000개 추가)`);
    };

    // 🐌 개별 setValue: 각 setValue마다 즉시 리스너 실행 → N번 리렌더링
    const selectAllWithIndividualSetValue = () => {
        const startRenderCount = renderCountRef.current;
        const startTime = performance.now();

        console.log(
            `🐌 개별 setValue 시작 - 예상: ${
                searchResults.length
            }개 항목 × 5필드 = ${searchResults.length * 5}번 리렌더링`
        );

        // 핵심: 각 setValue마다 해당 TestItem이 즉시 리렌더링됨
        searchResults.forEach((_item: any, index: number) => {
            const isChecked =
                state.getValue(`searchResults.${index}.checked`) === true;
            if (!isChecked) {
                state.setValue(`searchResults.${index}.checked`, true); // TestItem 1번째 리렌더링
                state.setValue(
                    `searchResults.${index}.lastModified`,
                    Date.now()
                ); // TestItem 2번째 리렌더링
                state.setValue(`searchResults.${index}.category`, "selected"); // TestItem 3번째 리렌더링
                // 💥 더 많은 필드 업데이트로 렌더링 횟수 증가
                state.setValue(
                    `searchResults.${index}.complexValue`,
                    Math.random()
                ); // TestItem 4번째 리렌더링
                state.setValue(
                    `searchResults.${index}.description`,
                    `업데이트됨 ${Date.now()}`
                ); // TestItem 5번째 리렌더링
            }
        });

        // 전체 상태 업데이트
        state.setValue("isAllSelected", true);
        state.setValue("selectedCount", searchResults.length);

        const currentCounter = state.getValue("checkToggleCounter") || 0;
        state.setValue("checkToggleCounter", currentCounter + 1);

        // 정확한 측정을 위해 다음 프레임에서 측정
        setTimeout(() => {
            const endTime = performance.now();
            const endRenderCount = renderCountRef.current;
            const duration = endTime - startTime;
            const renderDiff = endRenderCount - startRenderCount;

            console.log(
                `🐌 개별 setValue 완료 - 실제 리렌더링: ${renderDiff}회`
            );

            setLastUpdateTime(duration);
            setLastUpdateMethod(`개별 setValue (${renderDiff}회 리렌더링)`);

            setPerformanceHistory((prev) =>
                [
                    ...prev,
                    {
                        method: "개별 setValue",
                        time: duration,
                        renderCount: renderDiff,
                        timestamp: Date.now(),
                    },
                ].slice(-10)
            );
        }, 0);
    };

    // 🚀 setBatch: 모든 변경사항을 모아서 마지막에 한 번만 리스너 실행 → 1번 리렌더링
    const selectAllWithBatch = () => {
        const startRenderCount = renderCountRef.current;
        const startTime = performance.now();

        console.log(
            `🚀 setBatch 시작 - 예상: 1번 리렌더링 (모든 TestItem이 동시에)`
        );

        // 배치 업데이트를 위한 변경 사항 수집
        const updates: Record<string, any> = {};

        // 모든 변경사항을 먼저 수집 (리스너 실행 안함)
        searchResults.forEach((_item: any, index: number) => {
            const isChecked =
                state.getValue(`searchResults.${index}.checked`) === true;
            if (!isChecked) {
                updates[`searchResults.${index}.checked`] = true;
                updates[`searchResults.${index}.lastModified`] = Date.now();
                updates[`searchResults.${index}.category`] = "selected";
                // 💥 동일한 필드 수 업데이트
                updates[`searchResults.${index}.complexValue`] = Math.random();
                updates[
                    `searchResults.${index}.description`
                ] = `배치업데이트됨 ${Date.now()}`;
            }
        });

        updates["isAllSelected"] = true;
        updates["selectedCount"] = searchResults.length;

        const currentCounter = state.getValue("checkToggleCounter") || 0;
        updates["checkToggleCounter"] = currentCounter + 1;

        // 핵심: 한 번에 모든 변경사항 적용 → 모든 TestItem이 동시에 1번 리렌더링
        state.setBatch(updates);

        // 정확한 측정을 위해 다음 프레임에서 측정
        setTimeout(() => {
            const endTime = performance.now();
            const endRenderCount = renderCountRef.current;
            const duration = endTime - startTime;
            const renderDiff = endRenderCount - startRenderCount;

            console.log(`🚀 setBatch 완료 - 실제 리렌더링: ${renderDiff}회`);

            setLastUpdateTime(duration);
            setLastUpdateMethod(`setBatch (${renderDiff}회 리렌더링)`);

            setPerformanceHistory((prev) =>
                [
                    ...prev,
                    {
                        method: "setBatch",
                        time: duration,
                        renderCount: renderDiff,
                        timestamp: Date.now(),
                    },
                ].slice(-10)
            );
        }, 0);
    };

    // 통계 계산
    const totalChecked = searchResults.filter(
        (item: any) => item.checked
    ).length;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                🔥 setBatch vs 개별 setValue 실제 차이점
            </Typography>

            {/* 대량 데이터 추가 버튼 */}
            <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="h6">⚠️ 테스트 준비</Typography>
                <Typography sx={{ mb: 2 }}>
                    이제 적당한 테스트 데이터(2000개)를 추가하고, 아래 버튼들로
                    차이를 확인하세요! 무거운 렌더링 계산이 포함되어 있어 차이가
                    명확하게 보입니다.
                </Typography>
                <Button
                    variant="contained"
                    color="info"
                    size="large"
                    onClick={createLargeDataset}
                    sx={{ fontSize: "1.1rem" }}
                >
                    📦 테스트 데이터 추가 (2000개)
                </Button>
            </Alert>

            {/* 좌우 레이아웃 */}
            <Box sx={{ display: "flex", gap: 3 }}>
                {/* 왼쪽: 테스트 패널 */}
                <Box sx={{ flex: 1, minWidth: 400 }}>
                    {/* 실시간 통계 */}
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="h6">📊 실시간 통계</Typography>
                        <Typography>
                            • 현재 리렌더링 횟수:{" "}
                            <strong>{renderCountRef.current}</strong>
                        </Typography>
                        <Typography>
                            • 마지막 업데이트 소요시간:{" "}
                            <strong>{lastUpdateTime.toFixed(3)}ms</strong>
                        </Typography>
                        <Typography>
                            • 마지막 업데이트 방법:{" "}
                            <strong>{lastUpdateMethod}</strong>
                        </Typography>
                        <Typography>
                            • 체크된 항목: <strong>{totalChecked}</strong> /{" "}
                            {searchResults.length}
                        </Typography>
                    </Alert>

                    {/* 성능 히스토리 */}
                    {performanceHistory.length > 0 && (
                        <Card sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📈 성능 비교 히스토리
                                </Typography>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {performanceHistory.map((record, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                p: 2,
                                                border: "1px solid #e0e0e0",
                                                borderRadius: 1,
                                                minWidth: 200,
                                                bgcolor: record.method.includes(
                                                    "setBatch"
                                                )
                                                    ? "success.light"
                                                    : "warning.light",
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                gutterBottom
                                            >
                                                {record.method}
                                            </Typography>
                                            <Typography variant="body2">
                                                ⏱️ 소요시간:{" "}
                                                <strong>
                                                    {record.time.toFixed(3)}ms
                                                </strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                🔄 리렌더링:{" "}
                                                <strong>
                                                    {record.renderCount}회
                                                </strong>
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* 메인 테스트 버튼들 */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexWrap: "wrap",
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                onClick={selectAllWithBatch}
                                sx={{ minWidth: 200, fontSize: "1.1rem" }}
                            >
                                🚀 전체 선택 (setBatch)
                                <br />
                                <small>1번 리렌더링 - 효율적</small>
                            </Button>
                            <Button
                                variant="outlined"
                                color="warning"
                                size="large"
                                onClick={selectAllWithIndividualSetValue}
                                sx={{ minWidth: 200, fontSize: "1.1rem" }}
                            >
                                🐌 전체 선택 (개별 setValue)
                                <br />
                                <small>
                                    {searchResults.length * 5}번 리렌더링 - 매우
                                    비효율적
                                </small>
                            </Button>
                        </Box>
                    </Box>

                    {/* 핵심 설명 */}
                    <Paper
                        sx={{
                            p: 3,
                            bgcolor: "info.light",
                            border: "2px solid",
                            borderColor: "info.main",
                            mt: 3,
                        }}
                    >
                        <Typography variant="h6" gutterBottom>
                            🔍 핵심 차이점
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            • <strong>개별 setValue:</strong> 각 setValue마다
                            즉시 리스너 실행 → 각 TestItem이 개별 리렌더링
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            • <strong>setBatch:</strong> 모든 변경사항을 모은 후
                            마지막에 한 번만 리스너 실행 → 모든 TestItem이
                            동시에 1번 리렌더링
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            • <strong>결과:</strong> {searchResults.length}개
                            항목 × 5필드 = {searchResults.length * 5}번 vs 1번
                            리렌더링
                        </Typography>
                        <Typography variant="body2">
                            • <strong>확인 방법:</strong> 오른쪽 목록에서 각
                            항목의 "렌더: X회" 숫자 변화 관찰
                        </Typography>
                    </Paper>
                </Box>

                {/* 오른쪽: 테스트 목록 - 각 항목이 개별 구독 */}
                <Box sx={{ flex: 1, minWidth: 400 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                📋 테스트 목록 ({searchResults.length}개)
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                            >
                                각 항목은 개별 구독 중 - "렌더: X회" 숫자 변화를
                                주목하세요!
                            </Typography>
                            <Box
                                sx={{
                                    maxHeight: 600,
                                    overflow: "auto",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: 1,
                                    p: 2,
                                }}
                            >
                                {searchResults.map((_: any, index: number) => (
                                    <TestItem
                                        key={index}
                                        state={state}
                                        index={index}
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
