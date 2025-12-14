import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GlobalFormaProvider } from "@ehfuse/forma";

ReactDOM.createRoot(document.getElementById("root")!).render(
    // <React.StrictMode>
    <GlobalFormaProvider storagePrefix="forma-example">
        <App />
    </GlobalFormaProvider>
    // </React.StrictMode>
);
