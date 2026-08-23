import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EnvironmentProvider } from '@/hooks/useEnvironment';
import { AuthProvider } from '@/context/AuthContext';
import { ProposalProvider } from '@/context/ProposalContext';
import { ScrollRail } from '@/components/primitives/ScrollRail';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/sections/Hero';
import { LiveTicker } from '@/components/sections/LiveTicker';
import { JugaadEngine } from '@/components/sections/JugaadEngine';
import { Storytelling } from '@/components/sections/Storytelling';
import { Footer } from '@/components/sections/Footer';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignupPage } from '@/components/auth/SignupPage';
import { DashboardLayout } from '@/components/workshop/DashboardLayout';
import { DashboardHome } from '@/components/workshop/pages/DashboardHome';
import { FindJugaadPage } from '@/components/workshop/pages/FindJugaadPage';
import { PostJugaadPage } from '@/components/workshop/pages/PostJugaadPage';
import { MyJugaadsPage } from '@/components/workshop/pages/MyJugaadsPage';
import { RequestsPage } from '@/components/workshop/pages/RequestsPage';
import { MyRequestsPage } from '@/components/workshop/pages/MyRequestsPage';
import { ConversationPage } from '@/components/workshop/pages/ConversationPage';
import { ConversationsListPage } from '@/components/workshop/pages/ConversationsListPage';
import { ProfilePage } from '@/components/workshop/pages/ProfilePage';
import { SettingsPage } from '@/components/workshop/pages/SettingsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GuestRoute } from '@/components/auth/ProtectedRoute';
import { InfoPage } from '@/components/pages/InfoPage';

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-bg-0 text-ink-0">
      <ScrollRail />
      <Navigation />
      <main>
        <Hero />
        <LiveTicker />
        <JugaadEngine />
        <Storytelling />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProposalProvider>
      <EnvironmentProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <GuestRoute>
                  <SignupPage />
                </GuestRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="find-jugaad" element={<FindJugaadPage />} />
              <Route path="post-jugaad" element={<PostJugaadPage />} />
              <Route path="my-jugaads" element={<MyJugaadsPage />} />
              <Route path="requests" element={<RequestsPage />} />
              <Route path="my-requests" element={<MyRequestsPage />} />
              <Route path="messages" element={<ConversationsListPage />} />
              <Route path="messages/:conversationId" element={<ConversationPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/about" element={<InfoPage kind="about" />} />
            <Route path="/campus-program" element={<InfoPage kind="program" />} />
            <Route path="/privacy" element={<InfoPage kind="privacy" />} />
            <Route path="/terms" element={<InfoPage kind="terms" />} />
            <Route path="/find-jugaad" element={<ProtectedRoute><DashboardLayout><FindJugaadPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/post-jugaad" element={<ProtectedRoute><DashboardLayout><PostJugaadPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/my-jugaads" element={<ProtectedRoute><DashboardLayout><MyJugaadsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/requests" element={<ProtectedRoute><DashboardLayout><RequestsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><DashboardLayout><MyRequestsPage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </EnvironmentProvider>
      </ProposalProvider>
    </AuthProvider>
  );
}

export default App;
