import React, { useContext, useEffect,useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login/SignIn';
import Register from './Login/SignUp';
import { AuthProvider, AuthContext } from './Authentication';
// import DetailPage from '../old_stuff/detail_page.jsx';
import {KLandingPage} from './Homepage/land';
import MakeAPort from './Create/page.jsx';
import { initGA, trackPageView }  from "./analytics";
import { useLocation } from "react-router-dom";
// import Home from '../old_stuff/home.jsx';
import GDPRComplianceNotice from './privacy/PrivacyPolicy';
import UserProfile from './user_page/userpage.jsx'  
import {Card, DisplayCards, PersonalCard} from './Cards/cardv2';
import {Market, Detail, Pending} from './Home/homev2.jsx';
import Error from './Error.jsx';
import BrowseGuestPage from './Guest/BrowseGuestPage.jsx'
import Loading from './Loading/loading.jsx';
import Game from './Game/game.jsx';

// import Market from './Market/old/market.jsx';
// TODO: i moved market and secret into home bc theyre all essentially the same code so just dont edit line 13
// import Secret from '../old_stuff/home.jsx';
import { getUsers, loginUser, makeAuthenticatedRequest } from './user';
import Settings from './settings/settings'
import { withOneTabEnforcer } from "react-one-tab-enforcer"
import PortfolioManager from './Edit/old/Edit.jsx';
import LeaderBoard from './Leaderboard/leaderboardv2.jsx';
import SecureStorage from 'react-secure-storage';
const MobileRedirectPopup = ({ children }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // useEffect(() => {
  //   const checkScreenSize = () => {
  //     const isMobileWidth = window.innerWidth < 1024; // Breakpoint at 1024px
  //     if (!isDismissed) {
  //       setShowDialog(isMobileWidth);
  //     }
  //   };

  //   // Initial check
  //   checkScreenSize();

  //   // Add event listener for window resize
  //   window.addEventListener('resize', checkScreenSize);

  //   // Cleanup
  //   return () => window.removeEventListener('resize', checkScreenSize);
  // }, [isDismissed]);

  if (!showDialog) {
    return children;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold">Mobile Device Detected</h2>
          </div>

          {/* Content */}
          <p className="text-gray-600 mb-6">
            This website is optimized for desktop viewing. For the best experience, 
            please access our site from a desktop or laptop computer.
          </p>

          {/* Icons */}
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-2xl">→</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Button */}
          <button
            onClick={() => {
              setShowDialog(false);
              setIsDismissed(true); // Mark as dismissed
            }}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
};



// Timer logic
const useSessionTimeout = (timeoutDuration) => {
  const navigate = useNavigate();

  useEffect(() => {
    
    const timer = setTimeout(() => {
      // Redirect to login page with an error message
      navigate('/login', { state: { error: 'Session expired. Please log in again.' } });
      SecureStorage.clear(); 
      
    }, timeoutDuration);

    return () => clearTimeout(timer); // Clear timer on component unmount
  }, [navigate, timeoutDuration]);

};


const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = SecureStorage.getItem('userToken');
  const { logout } = useContext(AuthContext);
  
  useSessionTimeout(900000, logout); // Pass the logout function to the hook

  return token ? <Component {...rest} /> : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App" id="root">
      <AuthProvider>
        <BrowserRouter>

          <RouterContent />


        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

const RouterContent = () => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const location = useLocation();

  useEffect(() => {
    initGA("G-RNE4MCT56P");
  }, []);

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);


  return (
    <>

  <MobileRedirectPopup>

    <Routes>

      <Route path="/" element={<KLandingPage />} />

      <Route path="/login" element={<Login />} />

      <Route path="/loading" element={<Loading />} />

      <Route path="/demo" element={<BrowseGuestPage />} />

      <Route path="/register" element={<Register />} />

      <Route path="/home" element={<Market />} />

      <Route path="/pending" element={<Pending />} />

      <Route path="/port/:id" element={<Detail />} />

      <Route path="/create" element={<MakeAPort />} />

      <Route path="/edit/:id" element={<MakeAPort />} />

      <Route path="/game" element={<Game />} />

      <Route path="/profile/:user_id/:id" element={<UserProfile />} />

      {/* Uncomment and adjust additional routes as needed */}

      {/* <Route path="/privacy" element={<GDPRComplianceNotice />} /> */}

      <Route path="/settings" element={<Settings />} />

      {/* <Route path="/portfolioManager" element={<PortfolioManager />} /> */}

      <Route path="/leaderboard" element={<LeaderBoard />} />

    </Routes>

  </MobileRedirectPopup>

</>
  );
};

const DifferentWarningComponent = () => <div>Sorry! You can only have this application opened in one tab.</div>
export default withOneTabEnforcer({appName: "ports", OnlyOneTabComponent: DifferentWarningComponent})(App)

 





// export default App;