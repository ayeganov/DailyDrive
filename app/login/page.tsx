"use client";

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import Link from 'next/link';
import { BiSolidLogInCircle } from "react-icons/bi";



const LoginPage: React.FC = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (!success)
    {
      setError('Invalid username or password');
    }

  };

  return (
    <div id="login-register" className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-3xl mb-5 lucky-font text-cyan-500" style={{ letterSpacing: "3px", WebkitTextStroke: "1px white" }}>Login</h1>
        <div className="bg-violet-700 shadow w-full rounded-lg border-4 border-white">
          <form onSubmit={handleSubmit} className="px-5 py-7">
            {error && (
              <div role="alert" className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <label className="font-semibold text-sm text-white pb-1 block lucky-font" style={{ letterSpacing: "3px" }}>E-mail</label>
            <input
              type="text"
              className="rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white border-2 border-violet-700 text-indigo-950"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="font-semibold text-sm pb-1 block lucky-font text-white" style={{ letterSpacing: "3px" }}>Password</label>
            <input
              type="password"
              className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white text-indigo-950"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className=" flex justify-center items-center transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-white text-center"
            >
              <span className="inline-block mr-2 lucky-font text-lg" style={{ letterSpacing: '2px', margin: '5px 5px 0 0' }}>Login</span>
              <BiSolidLogInCircle color="white" size={22} />
            </button>
          </form>
          <div className="py-5">
            <div className="grid grid-cols-2 gap-1">
              <div className="text-center sm:text-left whitespace-nowrap">
                <button
                  type="button"
                  className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block"
                >
                  <span className="inline-block ml-1 lucky-font text-zinc-200">Forgot Password?</span>
                </button>
              </div>
              <div className="text-center sm:text-right whitespace-nowrap">
                <Link href="/register" className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset inline-block">
                  <span className="inline-block ml-1 lucky-font text-zinc-200">Register</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
