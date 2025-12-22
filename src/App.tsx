import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TagProvider } from './context/TagContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Jots } from './pages/Jots';
import { Notes } from './pages/Notes';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { NoteEditor } from './pages/NoteEditor';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TagProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                  path="/*"
                  element={
                    <PrivateRoute>
                      <Layout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/jots" replace />} />
                          <Route path="/jots" element={<Jots />} />
                          <Route path="/notes" element={<Notes />} />
                          <Route path="/notes/:id" element={<NoteEditor />} />
                          <Route path="/tasks" element={<Tasks />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
                          <Route path="/settings/:tab" element={<SettingsPage />} />
                        </Routes>
                      </Layout>
                    </PrivateRoute>
                  }
                />
              </Routes>
            </BrowserRouter>
          </SettingsProvider>
        </TagProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
