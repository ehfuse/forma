import { useEffect } from "react";
import { useForm } from "@ehfuse/forma";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Divider,
} from "@mui/material";

interface ProductForm {
    items: Array<{ id: number; name: string; price: number }>;
    discount: number;
}

/**
 * useForm의 actions 기능 테스트
 */
export default function ActionsTest() {
    const form = useForm<ProductForm>({
        initialValues: {
            items: [
                { id: 1, name: "Product A", price: 100 },
                { id: 2, name: "Product B", price: 200 },
            ],
            discount: 0,
        },
        actions: {
            // Computed getter - 총합 계산
            getTotal: (context) => {
                return context.values.items.reduce(
                    (sum, item) => sum + item.price,
                    0
                );
            },

            // Computed getter - 할인된 가격 계산
            getDiscountedTotal: (context) => {
                const total = context.actions.getTotal(context);
                return total * (1 - context.values.discount / 100);
            },

            // Computed getter - 비어있는지 확인
            isEmpty: (context) => {
                return context.values.items.length === 0;
            },

            // Handler - 아이템 추가
            addItem: (context, name: string, price: number) => {
                const newId =
                    Math.max(0, ...context.values.items.map((i) => i.id)) + 1;
                const newItems = [
                    ...context.values.items,
                    { id: newId, name, price },
                ];
                context.setValue("items", newItems);
            },

            // Handler - 아이템 제거
            removeItem: (context, id: number) => {
                const filtered = context.values.items.filter(
                    (item) => item.id !== id
                );
                context.setValue("items", filtered);
            },

            // Handler - 모두 제거
            clearAll: (context) => {
                context.setValue("items", []);
            },

            // Handler - 할인 적용
            applyDiscount: (context, discount: number) => {
                context.setValue(
                    "discount",
                    Math.max(0, Math.min(100, discount))
                );
            },

            // Complex workflow - 주문 제출 시뮬레이션
            submitOrder: async (context) => {
                const total = context.actions.getDiscountedTotal(context);

                if (context.actions.isEmpty(context)) {
                    alert("장바구니가 비어있습니다!");
                    return false;
                }

                console.log("📦 주문 제출:", {
                    items: context.values.items,
                    discount: context.values.discount,
                    total: total,
                });

                // API 호출 시뮬레이션
                await new Promise((resolve) => setTimeout(resolve, 1000));

                alert(`주문이 완료되었습니다! 총 금액: ${total}원`);
                context.actions.clearAll(context);
                context.actions.applyDiscount(context, 0);
                return true;
            },
        },
    });

    const items = form.useFormValue("items");
    const discount = form.useFormValue("discount");

    // actions 테스트를 위한 로깅
    useEffect(() => {
        console.log("🔍 Current State:", {
            items,
            discount,
            total: form.actions.getTotal(),
            discountedTotal: form.actions.getDiscountedTotal(),
            isEmpty: form.actions.isEmpty(),
        });
    }, [items, discount]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Actions Test
            </Typography>
            <Typography variant="body1" gutterBottom>
                useForm의 actions 기능을 테스트합니다. computed getter와
                handler를 모두 actions에 정의할 수 있습니다.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Computed Values */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: "primary.50" }}>
                <Typography variant="h6" gutterBottom>
                    📊 Computed Values (Getters)
                </Typography>
                <Typography>
                    <strong>Total:</strong> {form.actions.getTotal()}원
                </Typography>
                <Typography>
                    <strong>Discount:</strong> {discount}%
                </Typography>
                <Typography>
                    <strong>Discounted Total:</strong>{" "}
                    {form.actions.getDiscountedTotal()}원
                </Typography>
                <Typography>
                    <strong>Is Empty:</strong>{" "}
                    {form.actions.isEmpty() ? "Yes ✅" : "No ❌"}
                </Typography>
            </Paper>

            {/* Items List */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    🛒 Shopping Cart
                </Typography>
                {items.length === 0 ? (
                    <Typography color="text.secondary">
                        장바구니가 비어있습니다.
                    </Typography>
                ) : (
                    items.map(
                        (item: { id: number; name: string; price: number }) => (
                            <Box
                                key={item.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1,
                                    p: 1,
                                    bgcolor: "grey.100",
                                    borderRadius: 1,
                                }}
                            >
                                <Box>
                                    <Typography variant="body1">
                                        {item.name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {item.price}원
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                        form.actions.removeItem(item.id)
                                    }
                                >
                                    Remove
                                </Button>
                            </Box>
                        )
                    )
                )}
            </Paper>

            {/* Actions */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    🎬 Actions (Handlers)
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                        variant="contained"
                        onClick={() =>
                            form.actions.addItem(
                                "New Product",
                                Math.floor(Math.random() * 500) + 50
                            )
                        }
                    >
                        Add Random Item
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => form.actions.clearAll()}
                    >
                        Clear All
                    </Button>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <TextField
                        label="Discount (%)"
                        type="number"
                        value={discount}
                        onChange={(e) =>
                            form.actions.applyDiscount(Number(e.target.value))
                        }
                        size="small"
                        sx={{ width: 150 }}
                    />
                    <Button
                        variant="outlined"
                        onClick={() => form.actions.applyDiscount(10)}
                    >
                        Apply 10%
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => form.actions.applyDiscount(20)}
                    >
                        Apply 20%
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    color="success"
                    size="large"
                    fullWidth
                    onClick={() => form.actions.submitOrder()}
                    disabled={form.actions.isEmpty()}
                >
                    Submit Order (Complex Workflow)
                </Button>
            </Paper>

            {/* Console Log Instruction */}
            <Paper sx={{ p: 2, bgcolor: "info.50" }}>
                <Typography variant="body2" color="info.main">
                    💡 브라우저 콘솔을 열어서 actions 호출 로그를 확인하세요!
                </Typography>
            </Paper>
        </Box>
    );
}
