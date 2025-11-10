import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GlobalFormaProvider } from "../../contexts/GlobalFormaContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <GlobalFormaProvider>
        <App />
    </GlobalFormaProvider>
    // </React.StrictMode>
);
