import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useSession } from "../../context/sessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Account({}) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const { session } = useSession();

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { user } = session;

      const { data, error } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn(error);
        } else if (data) {
          const userData = {
            username: data.username,
            email: user.email,
          };
          setUserData(userData);
        }
      }

      setLoading(false);
    }

    getProfile();

    return () => {
      ignore = true;
    };
  }, [session]);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      username: userData.username,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    userData && (
      <div className="">
        <div className="p-5 space-y-6 sm:px-6">
          <header className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="">
                <h1 className="text-2xl font-bold">Your Profile</h1>
              </div>
            </div>
          </header>
          <div className="">
            <Card className="p-4">
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <input
                    className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm text-black"
                    value={userData.username}
                    onChange={(e) =>
                      setUserData((prevData) => ({
                        ...prevData,
                        username: e.target.value,
                      }))
                    }
                  ></input>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <input
                    className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm shadow-sm text-gray-400 focus:outline-none"
                    value={userData.email}
                    readOnly
                  ></input>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="pt-6" onClick={handleUpdateProfile}>
            <Button disabled={loading}>Save</Button>
          </div>
        </div>
      </div>

      // <form onSubmit={updateProfile} className="form-widget">
      //   <div>
      //     <label htmlFor="email">Email</label>
      //     <input id="email" type="text" value={session.user.email} disabled />
      //   </div>
      //   <div>
      //     <label htmlFor="username">Name</label>
      //     <input
      //       id="username"
      //       type="text"
      //       required
      //       value={username || ""}
      //       onChange={(e) => setUsername(e.target.value)}
      //     />
      //   </div>
      //   <div>
      //     <label htmlFor="website">Website</label>
      //     <input
      //       id="website"
      //       type="url"
      //       value={website || ""}
      //       onChange={(e) => setWebsite(e.target.value)}
      //     />
      //   </div>

      //   <div>
      //     <button
      //       className="button block primary"
      //       type="submit"
      //       disabled={loading}
      //     >
      //       {loading ? "Loading ..." : "Update"}
      //     </button>
      //   </div>

      //   <div>
      //     <button
      //       className="button block"
      //       type="button"
      //       onClick={() => supabase.auth.signOut()}
      //     >
      //       Sign Out
      //     </button>
      //   </div>
      // </form>
    )
  );
}
