// src/components/FirebaseAuthForm.jsx
import React, { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification 
} from "firebase/auth";
import { auth } from "../firebase";

const FirebaseAuthForm = ({ type = "login", onAuthSuccess = () => {}, onNavigate = () => {} }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const mapFirebaseError = (code) => {
    switch (code) {
      case "auth/email-already-in-use": return "This email is already in use.";
      case "auth/invalid-email": return "Invalid email address.";
      case "auth/weak-password": return "Password is too weak (min 6 characters).";
      case "auth/wrong-password":
      case "auth/user-not-found": return "Invalid email or password.";
      case "auth/too-many-requests": return "Too many attempts. Try again later.";
      default: return code || "An unknown error occurred.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      let userCredential;
      if (type === "signup") {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // send verification email
        await sendEmailVerification(userCredential.user);
        setInfo("Verification email sent. Please check your inbox and click the link. Then return here.");
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      // notify parent (App) about successful auth state (App will handle emailVerified logic)
      onAuthSuccess && onAuthSuccess(userCredential.user);
    } catch (err) {
      setError(mapFirebaseError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
<div
  className="flex items-center justify-center min-h-screen bg-cover bg-center"
  style={{ backgroundImage: "url('/assets/login_bg.jpg')" }}
>
      <div className="bg-white/30 p-8 rounded-lg shadow-lg w-full max-w-md backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center mb-4">{type === "signup" ? "Sign up" : "Login"}</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {info && <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">{info}</div>}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 mb-4 border rounded" />

          <label className="block mb-2 text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required className="w-full p-2 mb-4 border rounded" />

          <button type="submit" disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded">
            {loading ? "Please wait..." : (type === "signup" ? "Create account" : "Login")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          {type === "signup" ? (
            <>Already have an account? <button onClick={() => onNavigate("login")} className="text-blue-600 underline">Login</button></>
          ) : (
            <>Don't have an account? <button onClick={() => onNavigate("signup")} className="text-blue-600 underline">Sign up</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseAuthForm;
