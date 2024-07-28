'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddMemberForm from './AddMemberForm';
import { useAuth } from '../AuthContext';
import { useAlert } from '../AlertContext';
import { useRouter } from 'next/navigation';
import ColoredText from '../ColoredText';
import { FamilyMember } from '../types';
import FamilyMembersList from './FamilyMemberList';
import { Rewards } from '../types';


const Dashboard: React.FC = () => {
  const [ familyMembers, setFamilyMembers ] = useState<FamilyMember[]>([]);
  const [ memberRewards, setMemberRewards ] = useState<Rewards[]>([]);
  const [ familyId, setFamilyId ] = useState<string | null>(null);
  const { active_user } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  useEffect(() => {
    if (active_user === null) {
      router.push('/');
      return;
    }

    const fetchFamilyData = async () => {
      try {
        const params = { user_id: active_user?.id };
        const response = await axios.get('/backend/api/v1/families', { params });

        const result = response.data.result;

        if (result.ok) {
          const members = result.ok.members;
          const rewards = [];
          for (let member of members)
          {
            const params = { user_id: member.id };
            const response = await axios.get('/backend/api/v1/rewards', { params });
            const member_rewards = response.data;

            rewards.push({
              star_points: member_rewards.star_points,
              tv_time: member_rewards.tv_time_points,
              game_time: member_rewards.game_time_points,
            });
          }

          setFamilyMembers(members);
          setMemberRewards(rewards);
          setFamilyId(result.ok.id);
        } else {
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

  if (active_user === null) {
    return <div>Loading...</div>;
  }

  return (
    <div id="fam-dashboard" className="min-h-screen w-full bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center mb-8">

          <ColoredText
            className="superbubble-font text-8xl p-8 cursor-pointer"
            style={{ WebkitTextStroke: '5px white' }}
            onClick={go_home}
            text="Family 🏠 Board"
          />
        </div>

        <div className="mb-8">
          <FamilyMembersList familyMembers={familyMembers} memberRewards={memberRewards}/>
        </div>

        <div className="card bg-white shadow-xl">
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
    </div>
  );
};

export default Dashboard;
