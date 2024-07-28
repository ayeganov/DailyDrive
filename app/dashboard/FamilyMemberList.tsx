import React from 'react';
import { FamilyMember, Rewards } from '../types';
import DashboardUserStats from './DashboardUserStats';


interface FamilyMembersListProps {
  familyMembers: FamilyMember[];
  memberRewards: Rewards[];
}

const FamilyMembersList: React.FC<FamilyMembersListProps> = ({ familyMembers, memberRewards }) => {

  const zipped = familyMembers.map((member, index) => {
    return {
      ...member,
      ...memberRewards[index]
    };
  });

  return (
    <div className="w-full max-w-fit mx-auto">
      <div className="rounded-3xl inline-block">
        {zipped.map((member) => (
          <div
            key={member.id}
            className="p-1"
          >
            <DashboardUserStats
              user={member}
              gameTime={member.game_time}
              tvTime={member.tv_time}
              stars={member.star_points}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyMembersList;
