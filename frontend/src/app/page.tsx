"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";

// User interface matching the backend schema
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

function Home() {
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Custom toast notification system
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Helper to show notifications that auto-dismiss
  const showToast = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<User[]>("http://localhost:3000/users");
      // Sort users by id descending so the newest additions appear at the top
      const sortedUsers = response.data.sort((a, b) => b.id - a.id);
      setUsers(sortedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      showToast(err.response?.data?.message || "Failed to load users from the server.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Run on page load
  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#090b11]" suppressHydrationWarning />;
  }

  // Handle Form Submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Input Validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      showToast("Please enter a valid name.", "error");
      return;
    }

    if (!trimmedEmail) {
      showToast("Please enter an email address.", "error");
      return;
    }

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    try {
      setSaving(true);
      await axios.post("http://localhost:3000/users", {
        name: trimmedName,
        email: trimmedEmail,
      });

      showToast(`User "${trimmedName}" saved successfully!`, "success");
      
      // Reset form fields
      setName("");
      setEmail("");
      
      // Refresh the user list
      await fetchUsers();
    } catch (err: any) {
      console.error("Error saving user:", err);
      const backendMessage = err.response?.data?.message;
      
      // Handle array messages from class-validator
      const errorMessage = Array.isArray(backendMessage) 
        ? backendMessage.join(", ") 
        : backendMessage;
        
      showToast(errorMessage || "Failed to save user. Make sure the email is unique.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#090b11] text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      {/* Floating Notification */}
      {notification && (
        <div 
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 border animate-slide-in ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <span className="text-xl">
            {notification.type === "success" ? "✓" : "⚠"}
          </span>
          <p className="text-sm font-medium">{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="text-zinc-400 hover:text-zinc-100 ml-2 transition-colors font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <header className="border-b border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
              U
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              User Hub
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Live Connection
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 relative z-10">
        
        {/* Dashboard Title */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Workspace Console
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Create new user accounts and monitor active registrations in real-time.
          </p>
        </div>

        {/* Dashboard Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Card (Span 4) */}
          <div className="lg:col-span-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:border-zinc-700/50 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <span className="inline-block w-1.5 h-5 rounded bg-indigo-500" />
              Register User
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label htmlFor="name-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email-input" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={saving}
                  className="w-full bg-zinc-950/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Submit Button */}
              <button
                id="save-button"
                type="submit"
                disabled={saving}
                className="w-full mt-2 relative group overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving User...
                    </>
                  ) : (
                    <>Save User Profile</>
                  )}
                </span>
              </button>

            </form>
          </div>

          {/* Table Container (Span 8) */}
          <div className="lg:col-span-8 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:border-zinc-700/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="inline-block w-1.5 h-5 rounded bg-purple-500" />
                Active Directory
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-zinc-800 text-zinc-300 font-semibold px-2.5 py-1 rounded-full border border-zinc-700/50">
                  {users.length} {users.length === 1 ? "User" : "Users"}
                </span>
                <button
                  onClick={fetchUsers}
                  disabled={loading}
                  className="text-xs bg-zinc-800/60 border border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  <svg 
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
                  </svg>
                  Sync
                </button>
              </div>
            </div>

            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto rounded-xl border border-zinc-800/60 bg-zinc-950/40">
              {loading && users.length === 0 ? (
                // Initial Loading State
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-sm text-zinc-400 font-medium">Fetching directory index...</p>
                </div>
              ) : users.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 text-xl font-bold mb-4">
                    👤
                  </div>
                  <p className="text-zinc-300 font-semibold mb-1">No users registered yet</p>
                  <p className="text-xs text-zinc-500 max-w-xs">
                    Create a new user using the registration card on the left to populate the directory.
                  </p>
                </div>
              ) : (
                // Users Table
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800/80 bg-zinc-900/30">
                      <th className="py-4 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider w-16">
                        ID
                      </th>
                      <th className="py-4 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Full Name
                      </th>
                      <th className="py-4 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="py-4 px-5 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-right">
                        Joined Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60">
                    {users.map((user) => (
                      <tr 
                        key={user.id} 
                        className="group hover:bg-zinc-800/10 transition-colors duration-150"
                      >
                        <td className="py-3.5 px-5 text-sm font-medium text-zinc-500">
                          #{user.id}
                        </td>
                        <td className="py-3.5 px-5 text-sm font-semibold text-white">
                          {user.name}
                        </td>
                        <td className="py-3.5 px-5 text-sm text-zinc-300 font-mono">
                          {user.email}
                        </td>
                        <td className="py-3.5 px-5 text-sm text-zinc-400 text-right">
                          {new Date(user.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/40 py-6 text-center text-xs text-zinc-500 relative z-10 bg-zinc-950/20">
        <p>© {new Date().getFullYear()} User Hub Console. Powered by Next.js & NestJS.</p>
      </footer>
    </div>
  );
}

export default dynamic(() => Promise.resolve(Home), {
  ssr: false,
});
