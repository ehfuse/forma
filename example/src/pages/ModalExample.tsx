import { useState } from "react";
import { useModal } from "../../../hooks/useModal";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Paper,
    Divider,
} from "@mui/material";

/**
 * useModal 훅 사용 예제
 *
 * 모바일에서 모달이 열려있을 때 뒤로가기를 누르면
 * 페이지가 뒤로 가는 것이 아니라 모달이 닫힙니다.
 *
 * 같은 modalId를 사용하면 여러 컴포넌트에서 같은 모달 상태를 공유합니다 (reactive!)
 */

// 공유 모달을 다른 컴포넌트에서 열기
function SharedModalOpener() {
    const modal = useModal({ modalId: "shared-modal" });

    return (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "#e3f2fd" }}>
            <Typography variant="subtitle1" gutterBottom>
                🔗 컴포넌트 A (opener)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                같은 modalId로 모달을 공유합니다.
            </Typography>
            <Button
                variant="contained"
                size="small"
                onClick={modal.open}
                disabled={modal.isOpen}
            >
                공유 모달 열기
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                상태: <strong>{modal.isOpen ? "열림" : "닫힘"}</strong>
            </Typography>
        </Paper>
    );
}

// 공유 모달의 실제 UI
function SharedModalUI() {
    const modal = useModal({ modalId: "shared-modal" });

    return (
        <>
            <Paper sx={{ p: 2, mb: 2, bgcolor: "#fff3e0" }}>
                <Typography variant="subtitle1" gutterBottom>
                    📱 컴포넌트 B (UI)
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    같은 modalId로 상태를 읽고 Dialog를 렌더링합니다.
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={modal.close}
                    disabled={!modal.isOpen}
                >
                    공유 모달 닫기
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    상태: <strong>{modal.isOpen ? "열림" : "닫힘"}</strong>
                </Typography>
            </Paper>

            <Dialog
                open={modal.isOpen}
                onClose={modal.close}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>공유 모달 (Reactive!)</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        이 모달은 여러 컴포넌트에서 같은 상태를 공유합니다!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ✅ 컴포넌트 A에서 열기 버튼 클릭 → 여기서 열림
                        <br />
                        ✅ 여기서 닫기 → 컴포넌트 A의 상태도 업데이트
                        <br />✅ modal.isOpen이 reactive하게 동작
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={modal.close} color="primary">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
export default function ModalExample() {
    const [logs, setLogs] = useState<string[]>([]);
    const [formData, setFormData] = useState({ name: "", email: "" });

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 10));
    };

    // 첫 번째 모달 (기본 사용)
    const basicModal = useModal({
        onClose: () => addLog("기본 모달 닫힘"),
    });

    // 두 번째 모달 (폼이 있는 모달)
    const formModal = useModal({
        initialOpen: false,
        onClose: () => {
            addLog("폼 모달 닫힘");
            setFormData({ name: "", email: "" });
        },
    });

    // 세 번째 모달 (중첩 테스트용)
    const nestedModal = useModal({
        onClose: () => addLog("중첩 모달 닫힘"),
    });

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addLog(`폼 제출: ${formData.name}, ${formData.email}`);
        formModal.close();
    };

    const clearLogs = () => setLogs([]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                🎭 useModal 훅 예제
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                모바일 환경에서 모달이 열려있을 때 뒤로가기를 누르면 페이지가
                뒤로 가는 것이 아니라 모달이 닫힙니다. 같은 modalId를 사용하면
                여러 컴포넌트에서 상태를 공유합니다 (reactive!).
            </Typography>

            {/* 공유 모달 예제 */}
            <Paper
                sx={{
                    p: 2,
                    mb: 3,
                    bgcolor: "#f3e5f5",
                    border: "2px solid #9c27b0",
                }}
            >
                <Typography variant="h6" gutterBottom>
                    ✨ 새 기능: Reactive 공유 모달
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    같은 modalId를 사용하면 여러 컴포넌트에서 같은 모달 상태를
                    공유합니다!
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <SharedModalOpener />
                    <SharedModalUI />
                </Box>
            </Paper>

            <Divider sx={{ my: 3 }} />

            {/* 기본 사용 예제 */}
            <Typography variant="h6" gutterBottom>
                📋 기본 사용 예제
            </Typography>

            {/* 버튼 그룹 */}
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        basicModal.open();
                        addLog("기본 모달 열림");
                    }}
                >
                    기본 모달 열기
                </Button>

                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                        formModal.open();
                        addLog("폼 모달 열림");
                    }}
                >
                    폼 모달 열기
                </Button>

                <Button
                    variant="outlined"
                    color="info"
                    onClick={() => {
                        basicModal.toggle();
                        addLog(
                            `기본 모달 토글 (현재: ${
                                basicModal.isOpen ? "열림" : "닫힘"
                            })`
                        );
                    }}
                >
                    기본 모달 토글
                </Button>
            </Box>

            {/* 모달 상태 정보 */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: "background.default" }}>
                <Typography variant="h6" gutterBottom>
                    📊 모달 상태
                </Typography>
                <Typography variant="body2">
                    기본 모달:{" "}
                    <strong>{basicModal.isOpen ? "열림" : "닫힘"}</strong> (ID:{" "}
                    {basicModal.modalId.substring(0, 15)}...)
                </Typography>
                <Typography variant="body2">
                    폼 모달:{" "}
                    <strong>{formModal.isOpen ? "열림" : "닫힘"}</strong> (ID:{" "}
                    {formModal.modalId.substring(0, 15)}...)
                </Typography>
                <Typography variant="body2">
                    중첩 모달:{" "}
                    <strong>{nestedModal.isOpen ? "열림" : "닫힘"}</strong> (ID:{" "}
                    {nestedModal.modalId.substring(0, 15)}...)
                </Typography>
            </Paper>

            {/* 로그 */}
            <Paper sx={{ p: 2, bgcolor: "#1e1e1e" }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                    }}
                >
                    <Typography variant="h6" sx={{ color: "#fff" }}>
                        📝 이벤트 로그
                    </Typography>
                    <Button
                        size="small"
                        onClick={clearLogs}
                        sx={{ color: "#fff" }}
                    >
                        클리어
                    </Button>
                </Box>
                <Box
                    sx={{
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                        color: "#00ff00",
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    {logs.length === 0 ? (
                        <Typography sx={{ color: "#888" }}>
                            이벤트 없음
                        </Typography>
                    ) : (
                        logs.map((log, idx) => <div key={idx}>{log}</div>)
                    )}
                </Box>
            </Paper>

            {/* 기본 모달 */}
            <Dialog
                open={basicModal.isOpen}
                onClose={basicModal.close}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>기본 모달</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        이것은 기본 모달입니다. 뒤로가기 버튼을 눌러보세요!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        💡 팁: 모바일에서는 뒤로가기 버튼을 누르면 페이지가 뒤로
                        가지 않고 이 모달이 닫힙니다.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                nestedModal.open();
                                addLog("중첩 모달 열림 (기본 모달 위에)");
                            }}
                        >
                            중첩 모달 열기
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={basicModal.close} color="primary">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 폼 모달 */}
            <Dialog
                open={formModal.isOpen}
                onClose={formModal.close}
                maxWidth="sm"
                fullWidth
            >
                <form onSubmit={handleFormSubmit}>
                    <DialogTitle>폼 모달</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ mb: 2 }}>
                            사용자 정보를 입력하세요:
                        </Typography>
                        <TextField
                            fullWidth
                            label="이름"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="이메일"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                }))
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={formModal.close} color="inherit">
                            취소
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                        >
                            제출
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* 중첩 모달 */}
            <Dialog
                open={nestedModal.isOpen}
                onClose={nestedModal.close}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>중첩 모달</DialogTitle>
                <DialogContent>
                    <Typography>
                        이것은 기본 모달 위에 열린 중첩 모달입니다. 뒤로가기를
                        누르면 이 모달만 닫히고 기본 모달은 그대로 남아있습니다.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={nestedModal.close} color="primary">
                        닫기
                    </Button>
                </DialogActions>
            </Dialog>

            {/* 사용 방법 안내 */}
            <Paper sx={{ p: 2, mt: 3, bgcolor: "#f5f5f5" }}>
                <Typography variant="h6" gutterBottom>
                    📖 사용 방법
                </Typography>
                <Typography variant="body2" component="div">
                    <pre style={{ fontSize: "0.75rem", overflowX: "auto" }}>
                        {`import { useModal } from '@ehfuse/forma';

// 독립적인 모달 (modalId 자동 생성)
function MyComponent() {
  const modal = useModal({
    onClose: () => console.log('Modal closed')
  });

  return (
    <>
      <button onClick={modal.open}>모달 열기</button>
      <Dialog open={modal.isOpen} onClose={modal.close}>
        <DialogTitle>제목</DialogTitle>
        <DialogContent>내용</DialogContent>
      </Dialog>
    </>
  );
}

// 공유 모달 (같은 modalId 사용)
function ComponentA() {
  const modal = useModal({ modalId: 'shared-modal' });
  return <button onClick={modal.open}>열기</button>;
}

function ComponentB() {
  const modal = useModal({ modalId: 'shared-modal' });
  return (
    <Dialog open={modal.isOpen} onClose={modal.close}>
      <DialogTitle>공유 모달</DialogTitle>
    </Dialog>
  );
}`}
                    </pre>
                </Typography>
            </Paper>
        </Box>
    );
}
