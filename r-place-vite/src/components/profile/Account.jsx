import { useState, useEffect } from "react";
import { supabase } from "../../services/supabaseClient";
import { useSession } from "../../context/sessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Account({}) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const { session } = useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

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

    try {
       await supabase.from("profiles").upsert(updates);

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully.",
        variant: "default",
        className: "bg-green-50 border-green-200",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    userData && (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-8">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Your Profile
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </header>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    Username
                  </Label>
                  <input
                    id="username"
                    type="text"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-gray-900"
                    value={userData.username}
                    onChange={(e) =>
                      setUserData((prevData) => ({
                        ...prevData,
                        username: e.target.value,
                      }))
                    }
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 mb-1 block"
                  >
                    Email
                  </Label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                    value={userData.email}
                    readOnly
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4 mt-8">
            <Button variant="outline" onClick={handleBack} className="px-6">
              Back
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    )
  );
}
