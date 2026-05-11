import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import PredictionPage from './pages/PredictionPage';
import ExplainableAIPage from './pages/ExplainableAIPage';
import FairPricePage from './pages/FairPricePage';
import AppreciationPage from './pages/AppreciationPage';
import AreaRecommendationPage from './pages/AreaRecommendationPage';
import MapPage from './pages/MapPage';
//import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import { Page } from './types';

const pageConfig: Record<Page, { title: string; subtitle: string }> = {
  home: { title: 'AI Real Estate Intelligence', subtitle: 'Powered by advanced machine learning' },
  prediction: { title: 'Price Prediction', subtitle: 'AI-powered property valuation' },
  'explainable-ai': { title: 'Explainable AI', subtitle: 'SHAP-based feature analysis' },
  'fair-price': { title: 'Fair Price Analyzer', subtitle: 'Compare market vs AI prediction' },
  appreciation: { title: 'Appreciation Forecast', subtitle: '6-year investment projection' },
  'area-recommendation': { title: 'Area Recommender', subtitle: 'Find your perfect neighborhood' },
  map: { title: 'Property Map', subtitle: 'Interactive real estate heatmap' },
  //dashboard: { title: 'Analytics Dashboard', subtitle: 'Live market intelligence' },
  profile: { title: 'User Profile', subtitle: 'Manage your data and preferences' }
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [requestedPage, setRequestedPage] = useState<Page | null>(null);

  const config = pageConfig[currentPage];

  // Check for authentication token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    // Deep clean: Remove ALL user traces from the browser
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_profile');
    
    setIsAuthenticated(false);
    setCurrentPage('home');
    setRequestedPage(null);
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleNavigate = (page: Page) => {
    // If trying to access a feature without auth, show login modal and remember the page
    if (!isAuthenticated && page !== 'home') {
      setRequestedPage(page);
      setShowLoginModal(true);
      return;
    }
    setCurrentPage(page);
  };

  if (isInitializing) {
    return <div className="min-h-screen gradient-bg flex items-center justify-center text-white">Loading...</div>;
  }

  // Show HomePage for everyone (authenticated or not)
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen gradient-bg">
        <HomePage onNavigate={handleNavigate} onSignIn={handleLoginClick} isAuthenticated={isAuthenticated} />
        {showLoginModal && (
          <LoginPage 
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              setShowLoginModal(false);
              // Navigate to the requested page or default to prediction
              if (requestedPage) {
                setCurrentPage(requestedPage);
                setRequestedPage(null);
              } else {
                setCurrentPage('prediction');
              }
            }}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </div>
    );
  }

  // Redirect to home if trying to access a feature without authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg">
        <HomePage onNavigate={handleNavigate} onSignIn={handleLoginClick} isAuthenticated={isAuthenticated} />
        {showLoginModal && (
          <LoginPage 
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              setShowLoginModal(false);
              // Navigate to the requested page or default to prediction
              if (requestedPage) {
                setCurrentPage(requestedPage);
                setRequestedPage(null);
              } else {
                setCurrentPage('prediction');
              }
            }}
            onClose={() => setShowLoginModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onCollapsedChange={setSidebarCollapsed}
      />

      <div
        className="min-h-screen flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '80px' : '256px' }}
      >
        <div className="flex justify-between items-center pr-6 pt-4">
          <div className="flex-1">
            {currentPage !== 'home' && (
              <Header
                title={config.title}
                subtitle={config.subtitle}
                onNavigate={setCurrentPage}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>

        <main className="flex-1">
          {currentPage === 'prediction' && <PredictionPage />}
          {currentPage === 'explainable-ai' && <ExplainableAIPage />}
          {currentPage === 'fair-price' && <FairPricePage />}
          {currentPage === 'appreciation' && <AppreciationPage />}
          {currentPage === 'area-recommendation' && <AreaRecommendationPage />}
          {currentPage === 'map' && <MapPage />}
          {/*{currentPage === 'dashboard' && <DashboardPage />}*/}
          {currentPage === 'profile' && <ProfilePage />}
        </main>
      </div>

      {/* Floating AI Assistant Widget */}
      <Chatbot />
    </div>
  );
}

export default App;