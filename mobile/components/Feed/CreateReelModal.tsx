import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SolidButton } from "../Buttons/SolidButtonTwo";
import { useAuthStore } from "../../stores/authStore";
import { VideoView, useVideoPlayer } from 'expo-video';

interface CreateReelModalProps {
  visible: boolean;
  onClose: () => void;
  videoUri: string | null;
  onPost: (caption: string, videoUri: string) => void;
}

export const CreateReelModal: React.FC<CreateReelModalProps> = ({
  visible,
  onClose,
  videoUri,
  onPost,
}) => {
  const user = useAuthStore((s) => s.user);
  const [caption, setCaption] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  // 1. Initialize Player with Loop enabled
  const player = useVideoPlayer(videoUri || '', (p) => {
    p.loop = true;
    p.muted = false;
    p.play(); // Initial attempt to play
  });

  // 2. Manage Lifecycle: Play on open, Pause on close
  useEffect(() => {
    if (visible && videoUri) {
      // Small delay helps the native view mount before the video starts
      const timer = setTimeout(() => {
        player.replace(videoUri);
        player.play();
      }, 100);

      // Auto-focus the keyboard
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 400);

      return () => clearTimeout(timer);
    } else {
      player.pause();
      setCaption("");
    }
  }, [visible, videoUri, player]);

  const handleMuteToggle = () => {
    player.muted = !player.muted;
    setIsMuted(player.muted);
  };

  const handlePost = () => {
    if (caption.trim() && videoUri) {
      onPost(caption.trim(), videoUri);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        {/* --- Header --- */}
        <View className="px-4 pt-4 pb-3 border-b border-gray-800 bg-black">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base font-medium text-white">Cancel</Text>
            </TouchableOpacity>

            <Text className="text-lg font-bold text-white">Create Reel</Text>

            <View className="w-20">
              <SolidButton
                label="Post"
                onPress={handlePost}
                variant="primary"
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 16,
                  opacity: caption.trim() ? 1 : 0.4,
                }}
              />
            </View>
          </View>
        </View>

        {/* --- Content Area --- */}
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-4">
            {/* User Info & Caption Row */}
            <View className="flex-row gap-3 mb-6">
              <View className="items-center">
                <Image
                  source={{
                    uri: user?.avatar || "https://cdn.jumpshare.com/preview/n4cDyccgwamUidVDSBH6TUAs1n9_gpa-rBTcqzbDAX8O8G17kFotg9f8A_9scjA-c26Fs5dRhPPIsaiM61dz1RVfgEFiqK-XSAZ9q3uZfTY",
                  }}
                  className="w-10 h-10 rounded-full bg-gray-800"
                />
                <View 
                  style={{ width: 1.5, flex: 1, backgroundColor: "#374151", marginTop: 8, opacity: 0.8 }} 
                />
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-white mb-1">
                  @{user?.username || "s.u.jan_02"}
                </Text>

                <TextInput
                  ref={textInputRef}
                  placeholder="Add a caption..."
                  placeholderTextColor="#6b7280"
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  className="text-base text-white min-h-[60px]"
                  style={{ lineHeight: 22 }}
                />
              </View>
            </View>

            {/* Video Preview - Strict 9:16 */}
            {videoUri && (
              <View 
                className="w-full bg-[#111] rounded-3xl overflow-hidden border border-gray-800 self-center"
                style={{ aspectRatio: 9 / 16, width: '90%' }}
              >
                <VideoView
                  player={player}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                  nativeControls={false}
                  fullscreenOptions={{ enable: false }}
                />
                
                {/* Mute Overlay */}
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={handleMuteToggle}
                  className="absolute bottom-4 right-4 bg-black/60 w-10 h-10 rounded-full items-center justify-center"
                >
                  <Ionicons 
                    name={isMuted ? "volume-mute" : "volume-high"} 
                    size={20} 
                    color="white" 
                  />
                </TouchableOpacity>

                {/* Preview Badge */}
                <View className="absolute top-4 left-4 bg-black/40 px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-bold tracking-widest">PREVIEW</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};