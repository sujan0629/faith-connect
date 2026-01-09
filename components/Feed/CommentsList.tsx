import { View, Text } from 'react-native'
import { CommentItem } from './CommentItem'
import { Comment } from '../../app/posts/[id]'

interface Props {
  comments: Comment[]
  onLikeComment: (id: string) => void
  onReplyComment?: (id: string) => void
}

export const CommentsList = ({ comments, onLikeComment, onReplyComment }: Props) => {
  return (
    <View className="bg-white">
      <View className="px-4 py-3">
        <Text className="text-base font-bold text-[#111111]">Comments</Text>
      </View>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onLike={onLikeComment}
          onReply={onReplyComment}
        />
      ))}
    </View>
  )
}
