import { useApp } from './context/AppContext';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import CustomCursor from './components/CustomCursor';
import GrainOverlay from './components/GrainOverlay';
import LandingPage from './components/LandingPage';
import ChatBot from './components/ChatBot';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Onboarding = lazy(() => import('./components/Onboarding'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const CreditorBoard = lazy(() => import('./components/CreditorBoard'));
const ScenarioSimulator = lazy(() => import('./components/ScenarioSimulator'));
const ActivityTimeline = lazy(() => import('./components/ActivityTimeline'));
const EscrowLedger = lazy(() => import('./components/EscrowLedger'));
const DocumentVault = lazy(() => import('./components/DocumentVault'));
const CreditHealth = lazy(() => import('./components/CreditHealth'));
const Messages = lazy(() => import('./components/Messages'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const { state } = useApp();

  return (
    <>
      <CustomCursor />
      <GrainOverlay />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12162b',
            color: '#faf8f5',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: '#14b8a6', secondary: '#12162b' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#12162b' },
          },
        }}
      />

      {state.currentView === 'landing' && <LandingPage />}
      {state.currentView === 'onboarding' && (
        <Suspense fallback={<PageLoader />}>
          <Onboarding />
        </Suspense>
      )}
      {(state.currentView === 'dashboard' || state.currentView === 'admin' || state.currentView === 'creditors' || state.currentView === 'simulator' || state.currentView === 'activity' || state.currentView === 'escrow' || state.currentView === 'documents' || state.currentView === 'credit' || state.currentView === 'messages') && (
        <Layout>
          <Suspense fallback={<PageLoader />}>
            {state.currentView === 'dashboard' && <Dashboard />}
            {state.currentView === 'admin' && <AdminPanel />}
            {state.currentView === 'creditors' && <CreditorBoard />}
            {state.currentView === 'simulator' && <ScenarioSimulator />}
            {state.currentView === 'activity' && <ActivityTimeline />}
            {state.currentView === 'escrow' && <EscrowLedger />}
            {state.currentView === 'documents' && <DocumentVault />}
            {state.currentView === 'credit' && <CreditHealth />}
            {state.currentView === 'messages' && <Messages />}
          </Suspense>
        </Layout>
      )}

      <ChatBot />
    </>
  );
}

export default App;
