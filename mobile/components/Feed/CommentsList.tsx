import { View, Text } from 'react-native'
import { CommentItem } from './CommentItem'
import { Comment } from '../../stores/commentStore'

interface Props {
  comments: Comment[]
  onLikeComment: (commentId: string, postId: string) => void
  onReplyComment?: (id: string) => void
  postId: string
}

export const CommentsList = ({ comments, onLikeComment, onReplyComment, postId }: Props) => {
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
          postId={postId}
        />
      ))}
    </View>
  )
}
