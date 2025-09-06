// src/components/Header.jsx
import React from "react";

const Header = ({ currentUser, onLogout = () => {}, onNavigate = () => {}, cartCount = 0 }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 cursor-pointer" onClick={() => onNavigate("products")}>
          Shopify
        </h1>

        <nav className="flex items-center space-x-4">
          {currentUser ? (
            <>
              <span className="text-gray-600">Welcome, {currentUser.email}</span>

              <button
                onClick={() => onNavigate("cart")}
                className="relative p-2 rounded-full text-gray-600 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5H3m4 8a2 2 0 100 4" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onNavigate("login")} className="px-4 py-2 text-gray-800 hover:text-gray-600">
                Login
              </button>
              <button onClick={() => onNavigate("signup")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Signup
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
