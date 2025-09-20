"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null); // null = loading
  const [dbOk, setDbOk] = useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<{ uid: string; email: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check auth status
    fetch("/api/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setIsAuthed(Boolean(data?.ok));
        setUser(data?.user || null);
        setAuthChecked(true); // Auth check tugadi
      })
      .catch(() => {
        setIsAuthed(false);
        setUser(null);
        setAuthChecked(true);
      });

    fetch("/api/health/db", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setDbOk(Boolean(data?.ok)))
      .catch(() => setDbOk(false));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  return (
    <nav className="flex items-center justify-between  px-6 py-3">
      <Link href="/" className="text-lg font-semibold">
        Universal Auth
      </Link>
      <div className="flex items-center gap-3">
        {!authChecked ? (
          <div className="flex items-center justify-center">
            <div className="flex space-x-1">
              <div 
                className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" 
                style={{ animationDelay: '0s' }}
              ></div>
              <div 
                className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" 
                style={{ animationDelay: '0.3s' }}
              ></div>
              <div 
                className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" 
                style={{ animationDelay: '0.6s' }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${dbOk === null ? "bg-gray-200" : dbOk ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              <span className={`size-3 rounded-full ${dbOk === null ? "bg-gray-400" : dbOk ? "bg-green-600" : "bg-red-600"}`} />
             <b>Status</b> 
            </span>
              {isAuthed ? (
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {user?.email?.charAt(0).toUpperCase() || '👤'}
                    </span>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 top-10 z-50 w-48 rounded-lg border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b dark:border-neutral-700">
                          <div className="font-medium">{user?.email}</div>
                        </div>
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          Profile
                        </Link>
                        <button
                          onClick={async () => {
                            try {
                              await fetch("/api/auth/logout", { method: "POST" });
                              window.location.href = "/login";
                            } catch (e) {
                              console.error("Logout failed:", e);
                            }
                            setShowDropdown(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-700"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </>
          )}
      </div>
    </nav>
  );
}


