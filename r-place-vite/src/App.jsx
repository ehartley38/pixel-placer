import Account from "./components/profile/Account";
import Canvas2 from "./components/canvas/Canvas2";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Canvas2 />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Account />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
