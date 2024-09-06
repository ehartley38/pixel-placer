import { useEffect, useState } from "react";
import "./App.css";
import axiosInstance from "./services/axios";
import { supabase } from "./services/supabaseClient";
import Auth from "./components/auth/Auth";
import Account from "./components/profile/Account";

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

  return (
    <>
      <div className="container" style={{ padding: "50px 0 100px 0" }}>
        {!session ? (
          <Auth />
        ) : (
          <Account key={session.user.id} session={session} />
        )}
      </div>
    </>
  );
}

export default App;
