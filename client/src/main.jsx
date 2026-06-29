import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { store } from "./store/store.js";
import { configureApiAuth } from "./api/axios.js";
import { clearAuth, setCredentials } from "./store/authSlice.js";
import muiTheme from "./theme/muiTheme.js";
import "./styles.css";

configureApiAuth({
  getAccessToken: () => store.getState().auth.accessToken,
  onRefreshCredentials: (credentials) => store.dispatch(setCredentials(credentials)),
  onUnauthorized: () => store.dispatch(clearAuth())
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
