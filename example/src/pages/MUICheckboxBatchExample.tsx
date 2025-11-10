import React from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    Paper,
    Typography,
    Divider,
    Alert,
    Stack,
} from "@mui/material";
import { useFormaState } from "../../../hooks/useFormaState";

interface FormData {
    items: Array<{
        checked: boolean;
        name: string;
    }>;
    selectAll: boolean;
}

// 개별 체크박스 컴포넌트 (useValue 훅 사용)
interface CheckboxItemProps {
    index: number;
    useValue: (path: string) => any;
    onItemCheck: (index: number, checked: boolean) => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
    index,
    useValue,
    onItemCheck,
}) => {
    const itemChecked = useValue(`items.${index}.checked`);
    const itemName = useValue(`items.${index}.name`);

    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={itemChecked}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onItemCheck(index, e.target.checked)
                    }
                    size="small"
                />
            }
            label={<Typography variant="body2">{itemName}</Typography>}
            sx={{
                "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                },
            }}
        />
    );
};

// 300개의 초기 데이터 생성
const generateInitialData = (): FormData => {
    const items = Array.from({ length: 300 }, (_, index) => ({
        checked: false,
        name: `항목 ${index + 1}`,
    }));

    return {
        items,
        selectAll: false,
    };
};

const MUICheckboxBatchExample: React.FC = () => {
    const { getValue, setValue, refreshFields, useValue } =
        useFormaState<FormData>(generateInitialData());

    // 현재 상태 조회 (useValue로 구독)
    const items = getValue("items");
    const selectAll = useValue("selectAll"); // useValue로 변경하여 구독

    // 개별 체크박스 변경 핸들러
    const handleItemCheck = (index: number, checked: boolean) => {
        const startTime = performance.now();

        setValue(`items.${index}.checked`, checked);

        const endTime = performance.now();
        console.log(
            `개별 체크박스 업데이트 시간: ${(endTime - startTime).toFixed(2)}ms`
        );

        // 전체선택 상태 업데이트 (모든 항목이 선택되었는지 확인)
        const currentItems = getValue("items");
        const allChecked = currentItems.every((item: any, i: number) =>
            i === index ? checked : item.checked
        );
        setValue("selectAll", allChecked);
    };

    // 전체선택/해제 핸들러 (refreshFields 사용 - 진짜 배치 처리)
    const handleSelectAll = (checked: boolean) => {
        const startTime = performance.now();

        // 🚀 배치 처리: 데이터를 직접 수정하고 한 번에 알림
        const currentItems = getValue("items");
        const updatedItems = currentItems.map((item: any) => ({
            ...item,
            checked: checked,
        }));

        // 한 번에 전체 배열 업데이트
        setValue("items", updatedItems);
        setValue("selectAll", checked);

        // items prefix로 한 번에 새로고침
        refreshFields("items");
        refreshFields("selectAll");

        const endTime = performance.now();
        console.log(
            `🚀 refreshFields 배치 처리 시간: ${(endTime - startTime).toFixed(
                2
            )}ms`
        );
    };

    // 개별 업데이트 방식 (성능 비교용 - 진짜 개별 처리)
    const handleSelectAllSlow = (checked: boolean) => {
        const startTime = performance.now();

        // 🐌 개별 처리: 각 필드마다 개별 setValue + 강제 리렌더링
        for (let index = 0; index < items.length; index++) {
            setValue(`items.${index}.checked`, checked);
        }
        setValue("selectAll", checked);

        const endTime = performance.now();
        console.log(
            `🐌 개별 업데이트 방식 시간: ${(endTime - startTime).toFixed(2)}ms`
        );
    };

    // 통계 계산
    const checkedCount = items.filter((item: any) => item.checked).length;
    const totalCount = items.length;

    // 전체선택 체크박스 상태 계산
    const isAllSelected = checkedCount === totalCount;
    const isIndeterminate = checkedCount > 0 && checkedCount < totalCount;

    return (
        <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto" }}>
            <Typography variant="h4" gutterBottom>
                🚀 MUI Checkbox 배치 처리 성능 테스트
            </Typography>

            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>성능 테스트:</strong> 브라우저 개발자 도구 콘솔에서
                    실행 시간을 확인하세요!
                    <br />
                    • refreshFields 배치 처리: ~0.1-0.5ms ⚡
                    <br />• 개별 업데이트 방식: ~10-100ms+ (20-200배 느림) 🐌
                    <br />
                    <strong>💡 팁:</strong> 300개 체크박스를 배치 vs 개별 처리
                    성능 비교!
                </Typography>
            </Alert>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isAllSelected}
                                indeterminate={isIndeterminate}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => handleSelectAll(e.target.checked)}
                                color="primary"
                            />
                        }
                        label={
                            <Typography variant="h6">
                                전체 선택 ({checkedCount}/{totalCount})
                            </Typography>
                        }
                    />

                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleSelectAllSlow(checkedCount === 0)}
                        size="small"
                    >
                        개별 업데이트 방식 (느림)
                    </Button>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>
                    체크박스 목록 (300개)
                </Typography>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "repeat(1, 1fr)",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(4, 1fr)",
                        },
                        gap: 1,
                        maxHeight: "600px",
                        overflow: "auto",
                    }}
                >
                    {items.map((_: any, index: number) => (
                        <CheckboxItem
                            key={index}
                            index={index}
                            useValue={useValue}
                            onItemCheck={handleItemCheck}
                        />
                    ))}
                </Box>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                <Typography variant="h6" gutterBottom>
                    📊 실시간 상태
                </Typography>
                <Typography variant="body2">
                    선택된 항목: <strong>{checkedCount}개</strong> / 전체:{" "}
                    <strong>{totalCount}개</strong>
                </Typography>
                <Typography variant="body2">
                    전체선택 상태:{" "}
                    <strong>{selectAll ? "선택됨" : "해제됨"}</strong>
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                >
                    💡 팁: 전체선택 버튼을 여러 번 클릭하여 성능 차이를
                    체감해보세요!
                </Typography>
            </Paper>
        </Box>
    );
};

export default MUICheckboxBatchExample;
