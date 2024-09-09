import { useEffect, useState } from "react";
import "./App.css";
import axiosInstance from "./services/axios";
import { supabase } from "./services/supabaseClient";
import Auth from "./components/auth/Auth";
import Account from "./components/profile/Account";
import Canvas from "./components/canvas/Canvas";
import { Route, Routes } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const testRequest = async () => {
    try {
      const test = await axiosInstance.get("/test");

      setCount(test.data.msg);
    } catch (err) {
      console.log(err);
    }
  };

  if (!session) return <Auth />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Canvas session={session}/>} />
        <Route
          path="/Account"
          element={<Account key={session.user.id} session={session} />}
        />
      </Routes>
    </>
  );
}

export default App;
