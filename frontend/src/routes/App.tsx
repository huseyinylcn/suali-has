import { Navigate, Route, Routes } from 'react-router-dom';
import { PanelLayout } from '../ui/layout/PanelLayout';
import { QuestionAddPage } from './QuestionAddPage';
import { QuestionsPage } from './questions/QuestionsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<PanelLayout />}>
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/questions/add" element={<QuestionAddPage />} />
        <Route path="*" element={<Navigate to="/questions/add" replace />} />
      </Route>
    </Routes>
  );
}

