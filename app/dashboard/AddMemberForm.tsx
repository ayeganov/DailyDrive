'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';


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

    try {
      const response = await axios.post('/backend/api/v1/families/members/', payload);

      onAddMember(response.data);
      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error adding member:', error.response?.data || error.message);
        // Handle error (e.g., show error message to user)
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: true })} placeholder="Email" />
      {errors.email && <span>This field is required</span>}

      <input {...register('password', { required: true })} type="password" placeholder="Password" />
      {errors.password && <span>This field is required</span>}

      <input {...register('name')} placeholder="Name (optional)" />

      <label>
        <input {...register('is_parent')} type="checkbox" />
        Is Parent
      </label>

      <button type="submit">Add Member</button>
    </form>
  );
};

export default AddMemberForm;
