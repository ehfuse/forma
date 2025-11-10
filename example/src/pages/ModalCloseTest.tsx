import { useEffect } from "react";
import { useModal } from "../../../hooks/useModal";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
} from "@mui/material";

/**
 * useModal의 close() 호출 시 isOpen 상태 변경 테스트
 */
export default function ModalCloseTest() {
    const modal = useModal({
        onClose: () => {
            console.log("✅ onClose callback called");
        },
    });

    // isOpen 상태 변경 추적
    useEffect(() => {
        console.log(`🔄 modal.isOpen changed to: ${modal.isOpen}`);
    }, [modal.isOpen]);

    const handleOpenClick = () => {
        console.log("📖 Opening modal...");
        modal.open();
    };

    const handleCloseClick = () => {
        console.log("🔒 Closing modal via modal.close()...");
        modal.close();
    };

    const handleToggleClick = () => {
        console.log("🔄 Toggling modal...");
        modal.toggle();
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Modal Close Test
            </Typography>
            <Typography variant="body1" gutterBottom>
                modal.close() 호출 시 isOpen 상태가 제대로 변경되는지
                테스트합니다.
                <br />
                브라우저 콘솔을 열어서 로그를 확인하세요.
            </Typography>

            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                <Button variant="contained" onClick={handleOpenClick}>
                    Open Modal
                </Button>
                <Button variant="outlined" onClick={handleCloseClick}>
                    Close Modal (via modal.close())
                </Button>
                <Button variant="outlined" onClick={handleToggleClick}>
                    Toggle Modal
                </Button>
            </Box>

            <Box
                sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                }}
            >
                <Typography variant="h6">Current State:</Typography>
                <Typography>
                    <strong>modal.isOpen:</strong>{" "}
                    {modal.isOpen ? "true ✅" : "false ❌"}
                </Typography>
                <Typography>
                    <strong>modal.modalId:</strong> {modal.modalId}
                </Typography>
            </Box>

            <Dialog open={modal.isOpen} onClose={modal.close}>
                <DialogTitle>Test Modal</DialogTitle>
                <DialogContent>
                    <Typography>
                        이 모달은 useModal을 사용하여 관리됩니다.
                        <br />
                        <br />
                        <strong>현재 상태:</strong> modal.isOpen ={" "}
                        {modal.isOpen ? "true" : "false"}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={modal.close}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
