import { useEffect, useState } from "react";
import { supabase } from "./services/supabaseClient";
import Auth from "./components/auth/Auth";
import Account from "./components/profile/Account";
import Canvas2 from "./components/canvas/Canvas2";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Routes>
      <Route path="/" element={<Canvas2 session={session} />} />
      <Route path="/login" element={<Auth />} />
      <Route element={<ProtectedRoute session={session} />}>
        <Route path="/account" element={<Account session={session} />} />
      </Route>
    </Routes>
  );
}

export default App;