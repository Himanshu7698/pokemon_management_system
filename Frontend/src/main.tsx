import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './assets/css/main.css'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster richColors position="top-center" />
  </QueryClientProvider>
)

