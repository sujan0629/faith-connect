import React from 'react';
import { View } from 'react-native';
import { LeaderCard } from './LeaderCard';
import { Leader } from '../../stores/leaderStore';

interface LeaderListProps {
  leaders: Leader[];
  onFollow?: (id: string) => void;
  hideFollowButton?: boolean;
}

const LeaderList: React.FC<LeaderListProps> = ({ leaders, onFollow, hideFollowButton = false }) => (
  <View>
    {leaders.map((leader) => (
      <LeaderCard
        key={leader.id}
        item={leader}
        onToggleFollow={(id, willFollow) => onFollow && onFollow(id)}
        hideFollowButton={hideFollowButton}
      />
    ))}
  </View>
);

export default LeaderList;
