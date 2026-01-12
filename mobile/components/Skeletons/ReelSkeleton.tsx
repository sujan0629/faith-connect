import { View } from 'react-native'

interface ReelSkeletonProps {
  screenHeight: number
  screenWidth: number
}

export const ReelSkeleton = ({ screenHeight, screenWidth }: ReelSkeletonProps) => {
  return (
    <View style={{ height: screenHeight, width: screenWidth, backgroundColor: '#000' }}>
      {/* Video placeholder - large black area */}
      <View style={{ flex: 1, backgroundColor: '#111' }} />

      {/* Actions skeleton - right side */}
      <View style={{
        position: 'absolute',
        bottom: 4,
        right: 2,
        zIndex: 20,
        alignItems: 'center',
        gap: 16
      }}>
        {/* Like button */}
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' }} />

        {/* Comment button */}
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' }} />

        {/* Share button */}
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' }} />

        {/* Save button */}
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#333' }} />
      </View>

      {/* User info skeleton - bottom left */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 4,
        right: 60,
        zIndex: 20
      }}>
        {/* Author avatar and name */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#333', marginRight: 8 }} />
          <View style={{ height: 16, width: 100, backgroundColor: '#333', borderRadius: 4 }} />
        </View>

        {/* Post text */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ height: 14, width: '80%', backgroundColor: '#333', borderRadius: 4, marginBottom: 4 }} />
          <View style={{ height: 14, width: '60%', backgroundColor: '#333', borderRadius: 4 }} />
        </View>

        {/* Music/audio indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#333', marginRight: 8 }} />
          <View style={{ height: 12, width: 120, backgroundColor: '#333', borderRadius: 4 }} />
        </View>
      </View>
    </View>
  )
}