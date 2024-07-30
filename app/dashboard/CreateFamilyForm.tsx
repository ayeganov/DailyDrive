import React, { useState } from 'react';
import axios from 'axios';

interface FamilyNameComponentProps {
  onUpdate: (familyName: string) => void;
}

const CreateFamilyForm: React.FC<FamilyNameComponentProps> = ({ onUpdate }) => {
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');

  // Requirement 4: Stub async function for making the call to backend
  const createFamily = async (name: string) => {
    try {
      // This is a stub - replace with actual API call
      const response = await axios.post('/backend/api/v1/families', { name });
      return response.data.result;
    } catch (error) {
      console.error('Error creating family name:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try
    {
      const fam_result = await createFamily(familyName);
      if(fam_result.ok)
      {
        setFamilyName('');
        onUpdate(fam_result.ok.id);
      }
      else if(fam_result.error)
      {
        setError(fam_result.error.message);
      }
    }
    catch (error: any)
    {
      setError(error.message || 'An error occurred');
    }
  };

  return (
    <div className="flex flex-col justify-center sm:py-12">
      <div className="p-10 xs:p-0 mx-auto md:w-full md:max-w-md">
        <h1 className="font-bold text-center text-3xl mb-5 lucky-font text-cyan-500" style={{ letterSpacing: "3px", WebkitTextStroke: "1px white" }}>Create Your Family</h1>
        <div className="bg-violet-700 shadow w-full rounded-lg border-4 border-white">
          <form onSubmit={handleSubmit} className="px-5 py-7">
            {error && (
              <div role="alert" className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{error}</span>
              </div>
            )}

            {/* Requirement 1: Field asking for Family Name */}
            <label className="font-semibold text-sm text-white pb-1 block lucky-font" style={{ letterSpacing: "3px" }}>Family Name</label>
            <input
              type="text"
              className="rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full bg-white border-2 border-violet-700 text-indigo-950"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
            />

            {/* Requirement 2: Button named "Create" */}
            <button
              type="submit"
              className="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50 w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-white text-center"
            >
              <span className="inline-block mr-2 lucky-font text-lg" style={{ letterSpacing: '2px', margin: '5px 5px 0 0' }}>Create</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFamilyForm;
