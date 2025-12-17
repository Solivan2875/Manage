import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { TagProvider } from './context/TagContext';
import { Layout } from './components/Layout';
import { Jots } from './pages/Jots';
import { Notes } from './pages/Notes';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { NoteEditor } from './pages/NoteEditor';

function App() {
  return (
    <ThemeProvider>
      <TagProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/jots" replace />} />
              <Route path="/jots" element={<Jots />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/notes/:id" element={<NoteEditor />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/calendar" element={<Calendar />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TagProvider>
    </ThemeProvider>
  );
}

export default App;
