import React from 'react';
import { FamilyMember } from '../types';
import DashboardUserStats from './DashboardUserStats';


interface FamilyMembersListProps {
  familyMembers: FamilyMember[];
}

const FamilyMembersList: React.FC<FamilyMembersListProps> = ({ familyMembers }) => {
  const colors = [
    'bg-gradient-to-r from-pink-400 to-purple-500',
    'bg-gradient-to-r from-green-400 to-blue-500',
    'bg-gradient-to-r from-yellow-400 to-orange-500',
    'bg-gradient-to-r from-indigo-400 to-cyan-500',
  ];

  return (
    <div className="w-full max-w-fit mx-auto">
      <div className="bg-white bg-opacity-20 rounded-3xl shadow-lg inline-block">
        {familyMembers.map((member, index) => (
          <div
            key={member.id}
            className={`${colors[index % colors.length]} ${index !== 0 ? 'border-t border-white border-opacity-20' : ''}`}
          >
            <DashboardUserStats
              user={member}
              gameTime={member.gameTime}
              tvTime={member.tvTime}
              stars={member.stars}
              moneyEquivalent={member.moneyEquivalent}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyMembersList;
