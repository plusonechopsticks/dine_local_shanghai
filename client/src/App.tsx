import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Navbar } from "./components/Navbar";
import Home from "./pages/Home";
import HostRegister from "./pages/HostRegister";
import HostListings from "./pages/HostListings";
import HostDetail from "./pages/HostDetail";
import AdminDashboard from "./pages/AdminDashboard";
import HostDashboard from "./pages/HostDashboard";
import GuestDashboard from "./pages/GuestDashboard";
import BookingSuccess from "./pages/BookingSuccess";
import BookingConfirmation from "./pages/BookingConfirmation";
import AdminNewsletter from "./pages/AdminNewsletter";
import { ChatWidget } from "./components/ChatWidget";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/host-register"} component={HostRegister} />
      <Route path={"/hosts"} component={HostListings} />
      <Route path={"/hosts/:id"} component={HostDetail} />
      <Route path={"/host-dashboard"} component={HostDashboard} />
      <Route path={"/guest-dashboard"} component={GuestDashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/newsletter"} component={AdminNewsletter} />
      <Route path="/booking-success" component={BookingSuccess} />      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Navbar />
          <Toaster />
          <Router />
          <ChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
