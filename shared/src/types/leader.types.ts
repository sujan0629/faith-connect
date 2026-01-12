export interface Leader {
  id: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  faith?: string;
  denomination?: string;
  followersCount?: number;
  isFollowed?: boolean;
}

export interface Follower {
  id: string;
  name?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  faith?: string;
}

export interface ProfileStats {
  followingCount: number;
  followersCount: number;
}