// src/components/VerifyNotice.jsx
import React, { useState } from "react";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase";

const VerifyNotice = ({ onSignOut = () => {} }) => {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setStatus("");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No signed-in user");
      await sendEmailVerification(user);
      setStatus("Verification email resent. Check your inbox.");
    } catch (err) {
      setStatus("Failed to resend verification email.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    onSignOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verify your email</h2>
        <p className="mb-4">A verification email was sent to your address. Please open it and click the verification link.</p>
        {status && <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded">{status}</div>}
        <div className="flex gap-3 justify-center">
          <button onClick={handleResend} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
            {loading ? "Sending..." : "Resend verification email"}
          </button>
          <button onClick={handleSignOut} className="px-4 py-2 border rounded">Sign out</button>
        </div>
        <p className="mt-4 text-sm text-gray-500">After verifying, come back to this page — the app will detect verification automatically.</p>
      </div>
    </div>
  );
};

export default VerifyNotice;
