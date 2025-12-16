import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./Store/store";
import { PrivyProvider } from "@privy-io/react-auth";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PrivyProvider appId="cmh0cx9up02kolb0cppd1g5bt">
        <App />
      </PrivyProvider>
    </Provider>
  </StrictMode>
);
