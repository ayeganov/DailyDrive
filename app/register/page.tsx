"use client";

import React, { useState } from 'react';
import axios from "axios";
import Link from 'next/link';
import validatePassword from 'password-validator';
import { useRouter } from 'next/navigation';
import { BiSolidLogInCircle } from "react-icons/bi";


var schema = new validatePassword();
schema.is().min(8);
schema.is().max(20);
schema.has().uppercase();
schema.has().lowercase();
schema.has().digits();


const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const check_password = (password: string) => {
    const password_validated: any = schema.validate(password);

    setPassword(password);
    if (!password_validated) {
      setError('Password must be at least 8 chars long, at least one upper, one lower, and one digit.');
      return;
    }

    setError('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const password_validated: any = schema.validate(password);

    if (!password_validated) {
      return;
    }

    try {
      await axios.post("/backend/auth/register", { email: email, password: password, name: name });
      setError('');
      router.replace('/');
    }
    catch (error: any) {
      console.error('Error registering:', error);
      const user_exists = error.response.status === 400;
      if (user_exists) {
        setError('User already exists');
      }
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

            <label className="font-semibold text-sm text-white pb-1 block lucky-font" style={{ letterSpacing: "3px" }}>Username</label>
            <input
              type="text"
              className="rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white border-2 border-violet-700 text-indigo-950"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="font-semibold text-sm text-white pb-1 block lucky-font" style={{ letterSpacing: "3px" }}>E-mail</label>
            <input
              type="email"
              className="rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white border-2 border-violet-700 text-indigo-950"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <label className="font-semibold text-sm pb-1 block lucky-font text-white" style={{ letterSpacing: "3px" }}>Confirm Password</label>
            <input
              type="password"
              className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white text-indigo-950"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className=" flex justify-center items-center transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-white text-center"
            >
              <span className="inline-block mr-2 lucky-font text-lg" style={{ letterSpacing: '2px', margin: '5px 5px 0 0' }}>Register</span>
              <BiSolidLogInCircle color="white" size={22} />
            </button>
          </form>
          <div className="pb-4">
            <div className="flex justify-center items-center text-zinc-200 lucky-font">
              <Link href="/login" className=" focus:outline-none focus:bg-orange-400 hover:bg-orange-400 ring-inset transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg focus:ring-2 focus:ring-opacity-5 inline-block">
                <div className="inline-block">Already have an account? </div>
                <div className='text-2xl text-center'>Login</div>
              </Link>
 
            </div>
          </div>
        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
    //   <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
    //     <h1 className="font-bold text-center text-2xl mb-5">Register</h1>
    //     <div className="bg-white shadow w-full rounded-lg divide-y divide-gray-200">
    //       <form onSubmit={handleSubmit} className="px-5 py-7">
    //         {error && (
    //           <div role="alert" className="alert alert-warning">
    //             <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    //             <span>{error}</span>
    //           </div>
    //         )}

    //         <label htmlFor='#name' className="font-semibold text-sm text-gray-600 pb-1 block">Name</label>
    //         <input
    //           type="text"
    //           maxLength={25}
    //           minLength={2}
    //           id="#name"
    //           className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
    //           value={name}
    //           onChange={(e) => setName(e.target.value)}
    //           required
    //         />
    //         <label htmlFor="#email" className="font-semibold text-sm text-gray-600 pb-1 block">E-mail</label>
    //         <input
    //           type="email"
    //           id="#email"
    //           className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //           required
    //         />
    //         <label htmlFor="#password" className="font-semibold text-sm text-gray-600 pb-1 block">Password</label>
    //         <input
    //           type="password"
    //           id="#password"
    //           className="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
    //           value={password}
    //           onChange={(e) => check_password(e.target.value)}
    //           required
    //         />
    //         <button
    //           type="submit"
    //           className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-white text-center inline-block"
    //         >
    //           <span className="inline-block mr-2">Register</span>
    //           <svg
    //             xmlns="http://www.w3.org/2000/svg"
    //             className="w-6 h-6 inline-block"
    //             fill="none"
    //             viewBox="0 0 24 24"
    //             stroke="currentColor"
    //           >
    //             <path
    //               strokeLinecap="round"
    //               strokeLinejoin="round"
    //               strokeWidth="2"
    //               d="M10 16l4-4m0 0l-4-4m4 4H3m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
    //             />
    //           </svg>
    //         </button>
    //       </form>
    //       <div className="py-5">
    //         <div className="grid grid-cols-2 gap-1">
    //           <div className="text-center sm:text-left whitespace-nowrap">
    //             <Link href="/login" className="transition duration-200 mx-5 px-5 py-4 cursor-pointer font-normal text-sm rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 ring-inset inline-block"> 
    //               <span className="inline-block ml-1">Already have an account? Login</span>
    //             </Link>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default RegisterPage;
