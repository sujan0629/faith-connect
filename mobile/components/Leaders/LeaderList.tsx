import React from 'react';
import { View } from 'react-native';
import { LeaderCard } from './LeaderCard';
import type { Leader } from '@faithconnect/shared'

interface LeaderListProps {
  leaders: Leader[];
  onFollow?: (id: string) => void;
  onUnfollow?: (id: string) => void;
  onOpenProfile?: (id: string) => void;
  hideFollowButton?: boolean;
}

const LeaderList: React.FC<LeaderListProps> = ({ leaders, onFollow, onUnfollow, onOpenProfile, hideFollowButton = false }) => (
  <View>
    {leaders.map((leader) => (
      <LeaderCard
        key={leader.id}
        item={leader}
        onOpenProfile={onOpenProfile}
        onToggleFollow={(id, willFollow) => {
          if (willFollow) {
            onFollow && onFollow(id);
          } else {
            onUnfollow && onUnfollow(id);
          }
        }}
        hideFollowButton={hideFollowButton}
      />
    ))}
  </View>
);

export default LeaderList;
