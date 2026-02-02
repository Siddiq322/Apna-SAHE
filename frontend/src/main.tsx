
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  
  // Import Firebase connection test for development
  if (import.meta.env.DEV) {
    import("./utils/firebase-test").then(module => {
      module.testFirebaseConnection();
    }).catch(err => {
      console.error("Failed to load Firebase test:", err);
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
  