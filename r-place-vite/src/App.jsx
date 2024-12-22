import Account from "./components/profile/Account";
import Canvas from "./components/canvas/Canvas";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Canvas />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Account />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
