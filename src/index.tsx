import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import { TssCacheProvider } from "tss-react";
import { SnackbarProvider } from "notistack";

import createCache from "@emotion/cache";

import { ModalProvider } from "react-declarative";
import { ErrorBoundary } from "react-declarative";

import { createCustomTag } from "react-declarative";

import "./polyfills";

import AlertProvider from "./components/AlertProvider";

import App from "./components/App";

import THEME_DARK from "./config/theme";

import ioc from "./lib/ioc";

const container = document.getElementById("root")!;

const muiCache = createCache({
  key: "mui",
  prepend: true,
});

const tssCache = createCache({
  key: "tss",
});

const handleGlobalError = (error: any) => {
  console.warn("Error caught", { error });
  ioc.routerService.push("/error-page");
};

createCustomTag("bgcolor-red", "color: rgb(255, 0, 0);");

createCustomTag("bgcolor-green", "color: rgb(112, 173, 71);");

createCustomTag(
  "underline-green",
  "display: inline-block; text-decoration: underline; color: rgb(112, 173, 71);"
);

createCustomTag(
  "underline-red",
  "display: inline-block; text-decoration: underline; color: rgb(255, 0, 0);"
);

const wrappedApp = (
  <ErrorBoundary history={ioc.routerService} onError={handleGlobalError}>
    <CacheProvider value={muiCache}>
      <TssCacheProvider value={tssCache}>
        <ThemeProvider theme={THEME_DARK}>
          <SnackbarProvider>
            <ModalProvider>
              <AlertProvider>
                <App />
              </AlertProvider>
            </ModalProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </TssCacheProvider>
    </CacheProvider>
  </ErrorBoundary>
);

const root = createRoot(container);

root.render(wrappedApp);
