import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/layout/Navbar';
import AppRoutes from './AppRoutes';
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <ThemeProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <AppRoutes />
            </main>
          </div>
          <ToastContainer
            position="top-right"
            autoClose={3000}
          />
        </ThemeProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
