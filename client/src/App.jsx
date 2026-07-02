import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "./components/Common/Navbar.jsx";
import { CallProvider } from "./context/CallContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OAuthCallbackPage from "./pages/OAuthCallbackPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";
import MessengerPage from "./pages/MessengerPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

function App() {
  const location = useLocation();
  const accessToken = useSelector((state) => state.auth.accessToken);
  const authPaths = ["/login", "/register", "/forgot-password", "/oauth/callback"];
  const isTokenAuthPath = location.pathname.startsWith("/reset-password/");
  const isAuthScreen = authPaths.includes(location.pathname) || isTokenAuthPath;
  const rootClassName = isAuthScreen
    ? "grid min-h-screen place-items-center bg-[#f0f2f5] px-5 py-8 text-[#050505] max-[560px]:p-4"
    : "min-h-screen bg-[#f0f2f5] text-[#050505]";
  const mainClassName = isAuthScreen
    ? "w-full max-w-[1040px] p-0"
    : "mx-auto w-full max-w-[1460px] px-[clamp(12px,2vw,18px)] py-4 pb-7 max-[560px]:p-3";

  const page = (
    <div className={rootClassName}>
      {isAuthScreen ? null : <Navbar />}
      <main className={mainClassName}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <MessengerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute>
                <PostDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );

  return accessToken && !isAuthScreen ? <CallProvider>{page}</CallProvider> : page;
}

export default App;
