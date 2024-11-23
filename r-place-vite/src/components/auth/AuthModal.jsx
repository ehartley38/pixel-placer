import { useCallback, useEffect, useState } from "react";
import { supabase } from "../../services/supabaseClient";
import { InboxSVG } from "../ui/InboxSVG";
import { PencilSquare } from "../ui/PencilSquare";
import { axiosInstance } from "../../services/axios";
import Turnstile from "./Turnstyle";

export const AuthModal = ({
  setShowLoginModal,
  setShowSuccessModal,
  showSuccessModal,
  setEmail,
  email,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleLogin = async (event) => {
    event.preventDefault();

    setIsLoading(true);

    const turnstileToken = window.turnstile.getResponse();

    if (!turnstileToken) {
      alert("Please complete the CAPTCHA");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/verify-turnstile", {
        turnstileToken: turnstileToken,
      });

      if (response.status == 200) {
        await supabase.auth.signInWithOtp({ email });
      } else {
        alert(response.message || "Login failed");
      }
    } catch (err) {
      alert(err.error_description || err.message);
    } finally {
      setIsLoading(false);
      setShowSuccessModal(true);
    }
  };

  const handlePencilSquareClick = (event) => {
    event.preventDefault();

    setShowSuccessModal(false);
    setEmail("");
  };

  const handleOuterClick = (event) => {
    if (event.target === event.currentTarget) {
      setShowLoginModal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]"
      onClick={handleOuterClick}
    >
      <div
        className="bg-white p-4 rounded shadow-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full  max-w-md mx-auto p-6">
          <div className="mt-7 bg-white rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 border-2 border-indigo-300">
            {showSuccessModal ? (
              <div className="flex flex-col justify-center items-center p-5">
                <InboxSVG />
                <h1 className="text-3xl mt-5 font-semibold">
                  Check your email
                </h1>
                <div>We emailed a magic link to</div>
                <div className="flex items-center">
                  <span className="font-bold mx-1">{email}</span>{" "}
                  <PencilSquare
                    handlePencilSquareClick={handlePencilSquareClick}
                  />
                </div>
                <div className="mt-7">Click the link to log in or sign up.</div>
              </div>
            ) : (
              <>
                <div className="p-4 sm:p-7">
                  <div className="text-center">
                    <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">
                      Please Login or Sign-Up to Continue
                    </h1>
                  </div>

                  <div className="mt-3">
                    <form>
                      <div className="grid gap-y-4">
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-bold ml-1 mb-2 text-black"
                          >
                            Email address
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              className="py-3 px-4 block w-full border-2 border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm text-black"
                              required
                              aria-describedby="email-error"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            ></input>
                          </div>
                        </div>
                        <Turnstile
                          siteKey={siteKey}
                          onVerify={setTurnstileToken}
                        />
                        <button
                          type="submit"
                          className="py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800"
                          onClick={handleLogin}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <span>Loading</span>
                          ) : (
                            <span>Send Magic Link</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* View github */}
          <p className="mt-3 flex justify-center items-center text-center divide-x divide-gray-300 dark:divide-gray-700">
            <a
              className="pr-3.5 inline-flex items-center gap-x-2 text-sm text-gray-600 decoration-2 hover:underline hover:text-blue-600 dark:text-gray-500 dark:hover:text-gray-200"
              href="https://github.com/ehartley38"
              target="_blank"
            >
              <svg
                className="w-3.5 h-3.5"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View Github
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
