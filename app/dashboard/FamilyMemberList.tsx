import React from 'react';
import { FamilyMember, Rewards } from '../types';
import DashboardUserStats from './DashboardUserStats';


interface FamilyMembersListProps {
  familyMembers: FamilyMember[];
  memberRewards: Rewards[];
  onWeekEnd: (user_id: string) => void;
}

const FamilyMembersList: React.FC<FamilyMembersListProps> = ({ familyMembers, memberRewards, onWeekEnd }) => {

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
              onWeekEnd={onWeekEnd}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FamilyMembersList;
