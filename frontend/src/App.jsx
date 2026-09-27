import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import PredictionRunDetails from "./pages/PredictionRunDetails";
import Register from "./pages/Register";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Route */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route 
  path="/register" 
  element={<Register />} 
/>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/projects/:projectId"
            element={<ProjectWorkspace />}
          />

          <Route
            path="/projects/:projectId/predictions/:runId"
            element={<PredictionRunDetails />}
          />

        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* Unknown Route */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;