import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BaseLayout } from "./components/layout/BaseLayout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { AccountList } from "./features/accounts/AccountList"; // Assuming this is the view for /accounts
import { ReportsPage } from "./features/reports/ReportsPage";
import { SettingsPage } from "./features/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BaseLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/accounts" element={<div className="p-4"><AccountList /></div>} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
