import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome6, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { SolidButton } from "../Buttons/SolidButton";
import { useAuthStore } from "../../stores/authStore";
import {
  KeyboardStickyView,
  KeyboardGestureArea,
  useKeyboardHandler,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { CreateReelModal } from './CreateReelModal';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPost: (content: string, media?: string | null) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onPost,
}) => {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();
  
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [reelUri, setReelUri] = useState<string | null>(null);
  const [showCreateReelModal, setShowCreateReelModal] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);

  const textInputRef = useRef<TextInput>(null);
  const progress = useSharedValue(0);
  const mountedRef = useRef(true);

  useKeyboardHandler({
    onMove: (e) => { "worklet"; progress.value = e.progress; },
    onEnd: (e) => { "worklet"; progress.value = e.progress; },
  }, []);

  const animatedMediaBarStyle = useAnimatedStyle(() => ({
    paddingBottom: interpolate(
      progress.value,
      [0, 1],
      [Math.max(insets.bottom, 20), 16],
      Extrapolation.CLAMP
    ),
  }));

  useEffect(() => {
    if (visible) {
      mountedRef.current = true;
      setContent("");
      setSelectedImage(null);
      setSelectedVideo(null);
      setVideoThumbnail(null);
      setReelUri(null);
      setShowCreateReelModal(false);
      setLoadingImage(false);
      setLoadingVideo(false);
      setTimeout(() => textInputRef.current?.focus(), 300);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [visible]);

  const handlePickImage = async () => {
    console.log('=== IMAGE PICK START ===');
    console.log('mountedRef.current:', mountedRef.current);
    setLoadingImage(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      console.log('Launching image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.7,
      });

      console.log('Result:', result);
      if (!result.canceled && result.assets?.[0] && mountedRef.current) {
        console.log('Setting image:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        setSelectedVideo(null);
        setVideoThumbnail(null);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    } finally {
      setLoadingImage(false);
    }
    console.log('=== IMAGE PICK END ===');
  };

  const handlePickVideo = async () => {
    console.log('=== VIDEO PICK START ===');
    console.log('mountedRef.current:', mountedRef.current);
    setLoadingVideo(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      console.log('Launching video picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: false,
        quality: 0.7,
      });

      console.log('Result:', result);
      if (!result.canceled && result.assets?.[0] && mountedRef.current) {
        const asset = result.assets[0];
        console.log('Asset duration:', asset.duration);
        
        if (asset.duration && asset.duration < 60000) {
          setReelUri(asset.uri);
          setShowCreateReelModal(true);
        } else {
          setSelectedVideo(asset.uri);
          setSelectedImage(null);
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 0 });
            if (mountedRef.current) {
              setVideoThumbnail(uri);
            }
          } catch (e) {
            console.error('Thumbnail error:', e);
          }
        }
      }
    } catch (error) {
      console.error('Video picker error:', error);
    } finally {
      setLoadingVideo(false);
    }
    console.log('=== VIDEO PICK END ===');
  };

  if (!visible) return null;

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      presentationStyle="pageSheet" 
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="px-4 pt-4 pb-3 border-b border-gray-100 bg-white">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={onClose}>
              <Text className="text-base font-medium text-gray-600">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-900">Create Post</Text>
            <View className="w-20">
              <SolidButton
                label="Post"
                onPress={() => onPost(content, selectedImage || selectedVideo)}
                variant="primary"
                style={{ paddingVertical: 6, opacity: (content.trim() || selectedImage || selectedVideo) ? 1 : 0.4 }}
              />
            </View>
          </View>
        </View>

        <KeyboardGestureArea style={{ flex: 1 }}>
          <ScrollView 
            className="flex-1" 
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            <View className="p-4 flex-row gap-3">
              <View className="items-center">
                <Image source={{ uri: user?.avatar }} className="w-10 h-10 rounded-full bg-gray-100" />
                <View style={{ width: 1.5, flex: 1, backgroundColor: "#E5E7EB", marginTop: 8, borderRadius: 1 }} />
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">@{user?.username || "user"}</Text>
                
                <TextInput
                  ref={textInputRef}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#9ca3af"
                  value={content}
                  onChangeText={setContent}
                  multiline
                  className="text-base text-gray-900 min-h-[60px]"
                  style={{ textAlignVertical: 'top' }}
                />

                {selectedImage && (
                  <View className="mt-4 rounded-2xl overflow-hidden bg-gray-100 relative" style={{ width: '100%', aspectRatio: 1 }}>
                    <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    <TouchableOpacity 
                      onPress={() => setSelectedImage(null)}
                      className="absolute top-3 right-3 bg-black/50 rounded-full p-2"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                )}

                {selectedVideo && videoThumbnail && (
                  <View className="mt-4 rounded-2xl overflow-hidden bg-gray-100 relative" style={{ width: '100%', aspectRatio: 1 }}>
                    <Image source={{ uri: videoThumbnail }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View className="absolute inset-0 items-center justify-center">
                      <View className="bg-black/40 rounded-full p-3">
                        <Ionicons name="play" size={24} color="white" />
                      </View>
                    </View>
                    <TouchableOpacity 
                      onPress={() => { 
                        setSelectedVideo(null); 
                        setVideoThumbnail(null); 
                      }}
                      className="absolute top-3 right-3 bg-black/50 rounded-full p-2"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardGestureArea>

        <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
          <Animated.View style={[{ backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 12 }, animatedMediaBarStyle]} className="px-4">
            <View className="flex-row items-center justify-around pb-2" pointerEvents="box-none">
              <TouchableOpacity 
                onPressIn={handlePickImage}
                disabled={loadingImage}
                className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center"
                activeOpacity={loadingImage ? 1 : 0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                delayPressIn={0}
              >
                {loadingImage ? (
                  <ActivityIndicator size="small" color="#4b5563" />
                ) : (
                  <Ionicons name="image-outline" size={22} color="#4b5563" />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                onPressIn={handlePickVideo}
                disabled={loadingVideo}
                className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center"
                activeOpacity={loadingVideo ? 1 : 0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                delayPressIn={0}
              >
                {loadingVideo ? (
                  <ActivityIndicator size="small" color="#4b5563" />
                ) : (
                  <FontAwesome6 name="play-circle" size={20} color="#4b5563" />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center"
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="happy-outline" size={22} color="#4b5563" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center"
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="file-gif-box" size={22} color="#4b5563" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-12 h-12 rounded-full bg-gray-50 items-center justify-center"
                activeOpacity={0.6}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="location-outline" size={22} color="#4b5563" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardStickyView>

        <CreateReelModal 
          visible={showCreateReelModal} 
          onClose={() => setShowCreateReelModal(false)} 
          videoUri={reelUri} 
          onPost={() => { 
            setShowCreateReelModal(false); 
            onClose(); 
          }} 
        />
      </View>
    </Modal>
  );
};