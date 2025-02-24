"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, { email, password }, {
        headers:{
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      if(response.status===200){
        router.push('/hotels')
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("admin", "true")
      }
    } catch (err) {
      console.error("Sign-in failed", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-[#343333]">
      <h1 className="mb-6 text-center text-2xl font-light text-black bg-yellow-300 p-2 w-fit mx-auto rounded-lg">haridwarlive.in</h1>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>
        {error && <div className="mb-4 rounded-lg bg-red-100 p-2 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
              placeholder="Enter your password"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-yellow-300 text-lg text-[#343333] hover:bg-yellow-300/90"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
