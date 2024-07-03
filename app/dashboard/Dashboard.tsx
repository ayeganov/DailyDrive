'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddMemberForm from './AddMemberForm';
import { useAuth } from '../AuthContext';
import { useAlert } from '../AlertContext';
import { useRouter } from 'next/navigation';


interface FamilyMember {
  id: string;
  name: string;
  email: string;
  is_parent: boolean;
}


const Dashboard: React.FC = () => {
  const [ familyMembers, setFamilyMembers ] = useState<FamilyMember[]>([]);
  const [ familyId, setFamilyId ] = useState<string | null>(null);
  const { active_user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        console.log('Fetching family data for user:', active_user);
        const params = { user_id: active_user?.id};
        const response = await axios.get('/backend/api/v1/families', { params });

        const result = response.data.result;

        if(result.ok)
        {
          const members = result.ok.members;
          const family_members = members.map((member: any) => {
            return {
              id: member.id,
              name: member.name,
              email: member.email,
              is_parent: member.is_superuser,
            };
          });

          setFamilyMembers(family_members);
          setFamilyId(result.ok.id);
        }
        else
        {
          console.error('Error fetching family data:', result);
          showAlert('Error fetching family data', 'error');
        }
      } catch (error) {
        console.error('Error fetching family data:', error);
        showAlert('Error fetching family data', 'error');
      }
    };

    fetchFamilyData();
  }, [active_user]);

  const handleAddMember = (newMember: FamilyMember) => {
    setFamilyMembers([...familyMembers, newMember]);
  };

  const go_home = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6" onClick={go_home}>Family Dashboard</h1>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title mb-4">Family Members</h2>
          {familyMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {familyMembers.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>{member.is_parent ? 'Parent' : 'Child'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No family members found.</p>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Add New Family Member</h2>
          {familyId ? (
            <AddMemberForm familyId={familyId} onAddMember={handleAddMember} />
          ) : (
            <p>Loading family information...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
