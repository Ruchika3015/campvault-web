import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EnvironmentProvider } from '@/hooks/useEnvironment';
import { AuthProvider } from '@/context/AuthContext';
import { ProposalProvider } from '@/context/ProposalContext';
import { ScrollRail } from '@/components/primitives/ScrollRail';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/sections/Hero';
import { LiveTicker } from '@/components/sections/LiveTicker';
import { WhatWeOffer } from '@/components/sections/WhatWeOffer';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { LiveGigsPreview } from '@/components/sections/LiveGigsPreview';
import { CategoriesShowcase } from '@/components/sections/CategoriesShowcase';
import { ExchangeEngine } from '@/components/sections/ExchangeEngine';
import { Storytelling } from '@/components/sections/Storytelling';
import { FAQSection } from '@/components/sections/FAQSection';
import { JoinCTA } from '@/components/sections/JoinCTA';
import { Footer } from '@/components/sections/Footer';
import { LoginPage } from '@/components/auth/LoginPage';
import { SignupPage } from '@/components/auth/SignupPage';
import { DashboardLayout } from '@/components/workshop/DashboardLayout';
import { DashboardHome } from '@/components/workshop/pages/DashboardHome';
import { ExploreGigsPage } from '@/components/workshop/pages/ExploreGigsPage';
import { PostGigPage } from '@/components/workshop/pages/PostGigPage';
import { MyGigsPage } from '@/components/workshop/pages/MyGigsPage';
import { ApplicationsPage } from '@/components/workshop/pages/ApplicationsPage';
import { ConversationPage } from '@/components/workshop/pages/ConversationPage';
import { ConversationsListPage } from '@/components/workshop/pages/ConversationsListPage';
import { ProfilePage } from '@/components/workshop/pages/ProfilePage';
import { SettingsPage } from '@/components/workshop/pages/SettingsPage';
import { ProtectedRoute, GuestRoute, RequireAuth } from '@/components/auth/ProtectedRoute';
import { CompleteProfilePage } from '@/components/auth/CompleteProfilePage';
import { InfoPage } from '@/components/pages/InfoPage';

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-bg-0 text-ink-0">
      <ScrollRail />
      <Navigation />
      <main>
        <Hero />
        <LiveTicker />
        <WhatWeOffer />
        <HowItWorks />
        <LiveGigsPreview />
        <CategoriesShowcase />
        <ExchangeEngine />
        <FAQSection />
        <JoinCTA />
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
              {/* /complete-profile — auth required, but NOT profileComplete required */}
              <Route
                path="/complete-profile"
                element={
                  <RequireAuth>
                    <CompleteProfilePage />
                  </RequireAuth>
                }
              />

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

              {/* Protected Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="gigs" element={<ExploreGigsPage />} />
                <Route path="post-gig" element={<PostGigPage />} />
                <Route path="my-gigs" element={<MyGigsPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="messages" element={<ConversationsListPage />} />
                <Route path="messages/:conversationId" element={<ConversationPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />

                {/* Aliases for backwards compatibility */}
                <Route path="find-jugaad" element={<Navigate to="/dashboard/gigs" replace />} />
                <Route path="post-jugaad" element={<Navigate to="/dashboard/post-gig" replace />} />
                <Route path="my-jugaads" element={<Navigate to="/dashboard/my-gigs" replace />} />
                <Route path="requests" element={<Navigate to="/dashboard/applications" replace />} />
                <Route path="my-requests" element={<Navigate to="/dashboard/applications" replace />} />
              </Route>

              {/* Direct root-level convenience aliases */}
              <Route
                path="/gigs"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ExploreGigsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-gig"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <PostGigPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-gigs"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <MyGigsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/applications"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ApplicationsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ProfilePage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Legacy route redirects */}
              <Route path="/find-jugaad" element={<Navigate to="/dashboard/gigs" replace />} />
              <Route path="/post-jugaad" element={<Navigate to="/dashboard/post-gig" replace />} />
              <Route path="/my-jugaads" element={<Navigate to="/dashboard/my-gigs" replace />} />
              <Route path="/requests" element={<Navigate to="/dashboard/applications" replace />} />
              <Route path="/my-requests" element={<Navigate to="/dashboard/applications" replace />} />

              {/* Info Pages */}
              <Route path="/about" element={<InfoPage kind="about" />} />
              <Route path="/campus-program" element={<InfoPage kind="program" />} />
              <Route path="/privacy" element={<InfoPage kind="privacy" />} />
              <Route path="/terms" element={<InfoPage kind="terms" />} />
            </Routes>
          </BrowserRouter>
        </EnvironmentProvider>
      </ProposalProvider>
    </AuthProvider>
  );
}

export default App;
