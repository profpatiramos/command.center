import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CommandPage from "./pages/CommandPage";
import PersonalPage from "./pages/PersonalPage";
import AdminPage from "./pages/AdminPage";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/comandos/:slug" component={CommandPage} /><Route path="/minha-colecao" component={PersonalPage} /><Route path="/admin" component={AdminPage} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>; }
