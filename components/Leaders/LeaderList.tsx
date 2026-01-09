import React from 'react';
import { View } from 'react-native';
import { LeaderCard } from './LeaderCard';
import { Leader } from '../../stores/leaderStore';

interface LeaderListProps {
  leaders: Leader[];
  onFollow?: (id: string) => void;
}

const LeaderList: React.FC<LeaderListProps> = ({ leaders, onFollow }) => (
  <View>
    {leaders.map((leader) => (
      <LeaderCard
        key={leader.id}
        item={leader}
        onToggleFollow={(id, willFollow) => onFollow && onFollow(id)}
      />
    ))}
  </View>
);

export default LeaderList;
