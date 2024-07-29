'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAlert } from '../AlertContext';

interface AddMemberFormData {
  email: string;
  password: string;
  name?: string;
  is_parent: boolean;
}

interface AddMemberProps {
  familyId: string;
  onAddMember: (data: any) => void;
}

const AddMemberForm: React.FC<AddMemberProps> = ({ familyId, onAddMember }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddMemberFormData>();

  const { showAlert } = useAlert();

  const onSubmit = async (data: AddMemberFormData) => {
    const payload = {
      family_id: familyId,
      user_create: {
        email: data.email,
        password: data.password,
        name: data.name,
        is_superuser: data.is_parent,
        is_verified: true,
      },
    };

    try
    {
      const response = await axios.post('/backend/api/v1/families/members/', payload);
      onAddMember(response.data);
      reset();
    }
    catch (error)
    {
      if (axios.isAxiosError(error)) {
        console.error('Error adding member:', error.response?.data || error.message);
        showAlert(`Error adding member: ${error.response?.data?.detail || error.message}`, 'error');
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <div className="flex flex-col justify-center sm:py-2">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-3xl mb-5 lucky-font text-cyan-500" style={{ letterSpacing: "3px", WebkitTextStroke: "1px white" }}>Add Family Member</h1>
        <div className="bg-violet-700 shadow w-full rounded-lg border-4 border-white">
          <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-7">
            <label className="font-semibold text-sm text-white pb-1 block lucky-font" style={{ letterSpacing: "3px" }}>Email</label>
            <input
              {...register('email', { required: true })}
              className="rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white border-2 border-violet-700 text-indigo-950"
              placeholder="Email"
            />
            {errors.email && <span className="text-red-300 text-xs">This field is required</span>}

            <label className="font-semibold text-sm text-white pb-1 block lucky-font" style={{ letterSpacing: "3px" }}>Password</label>
            <input
              {...register('password', { required: true })}
              type="password"
              className="rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white border-2 border-violet-700 text-indigo-950"
              placeholder="Password"
            />
            {errors.password && <span className="text-red-300 text-xs">This field is required</span>}

            <label className="font-semibold text-sm text-white pb-1 block lucky-font" style={{ letterSpacing: "3px" }}>Name (optional)</label>
            <input
              {...register('name')}
              className="rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white border-2 border-violet-700 text-indigo-950"
              placeholder="Name (optional)"
            />

            <label className="flex items-center mb-5">
              <input
                {...register('is_parent')}
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm text-white lucky-font" style={{ letterSpacing: "2px" }}>Is Parent</span>
            </label>

            <button
              type="submit"
              className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-white text-center"
            >
              <span className="inline-block mr-2 lucky-font text-lg" style={{ letterSpacing: '2px', margin: '5px 5px 0 0' }}>Add Member</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMemberForm;
