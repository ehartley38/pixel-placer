import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import Auth from "./components/auth/Auth";
import Account from "./components/profile/Account";
import Canvas2 from "./components/canvas/Canvas2";
import { Route, Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  // const [session, setSession] = useState(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session);
  //     setLoading(false);
  //   });

  //   const {
  //     data: { subscription },
  //   } = supabase.auth.onAuthStateChange((_event, session) => {
  //     setSession(session);
  //     setLoading(false);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  // if (loading) {
  //   return <div>Loading...</div>; // Or a loading spinner
  // }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Canvas2 />} />
        {/* <Route path="/login" element={<Auth session={session} />} /> */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Account />} />
        </Route>
      </Routes>
    </Layout>
  );
}

export default App;
