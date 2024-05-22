import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./redux/store.jsx";
import { HelmetProvider } from "react-helmet-async";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<HelmetProvider>
		<BrowserRouter>
		<ReduxProvider store={store}>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>

		</ReduxProvider>
		</BrowserRouter>
		</HelmetProvider>
	</React.StrictMode>
);
