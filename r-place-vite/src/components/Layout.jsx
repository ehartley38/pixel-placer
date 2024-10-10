import { useEffect, useState } from "react";
import { UserNav } from "./profile/User-Nav";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useSession } from "../context/sessionProvider";

const Layout = ({ children }) => {
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  const { session } = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      const { user } = session;

      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (profileData) {
          const userData = {
            email: user.email,
            username: profileData.username,
          };

          setUserData(userData);
        }
      }
    };

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const handleLogOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
    } else {
      setUserData(null);
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <>
      <div className="fixed top-0 right-0 z-[1000] m-2">
        {userData && (
          <UserNav userData={userData} handleLogOut={handleLogOut} />
        )}
      </div>
      <main>{children}</main>
    </>
  );
};

export default Layout;
