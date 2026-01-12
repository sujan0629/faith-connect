import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { api } from "../../api/axios";
import { uploadsApi } from "../../api/uploads";
import Toast from 'react-native-toast-message';
import { toastConfig } from '../../components/ToastConfig';
import { useAuthStore } from '../../stores/authStore';

const faiths = ['Christianity', 'Islam', 'Hinduism', 'Buddhism', 'Sikhism', 'Judaism', 'Bahá\'í Faith', 'Jainism', 'Shinto', 'Taoism', 'Others'];

const denominations = {
  'Christianity': ['Catholic', 'Protestant', 'Orthodox', 'Evangelical', 'Pentecostal', 'Anglican', 'Non-denominational', 'Other Christian'],
  'Islam': ['Sunni', 'Shia', 'Ibadi', 'Sufi', 'Ahmadiyya', 'Other Islamic'],
  'Buddhism': ['Theravāda', 'Mahāyāna', 'Vajrayāna', 'Zen', 'Tibetan', 'Pure Land', 'Other Buddhist'],
  'Hinduism': ['Vaishnavism', 'Shaivism', 'Shaktism', 'Smartism', 'ISKCON / Hare Krishna', 'General Hindu'],
  'Sikhism': ['Khalsa', 'Nihang', 'Namdhari', 'General Sikh'],
  'Judaism': ['Orthodox', 'Conservative', 'Reform', 'Reconstructionist', 'Hasidic', 'Secular / Cultural', 'Other Jewish'],
  'Bahá\'í Faith': ['Bahá\'í (General)'],
  'Jainism': ['Digambara', 'Śvētāmbara', 'Sthānakavāsī', 'Terāpanth', 'General Jain'],
  'Shinto': ['Shrine Shinto', 'Sect Shinto', 'Folk Shinto', 'State Shinto', 'General Shinto'],
  'Taoism': ['Zhengyi', 'Quanzhen', 'Shangqing', 'Lingbao', 'Folk Taoism', 'General Taoist'],
  'Others': ['Spiritual / Non-denominational', 'Interfaith', 'Indigenous / Folk belief', 'Prefer not to say']
};

const contentFocusTags = ['Daily devotion', 'Q&A', 'Youth guidance', 'Motivation', 'Scripture explanation'];
const audiencePreferences = ['Youth', 'Adults', 'Families', 'General'];

export default function FaithConnectOnboarding() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const rolePreference = useAuthStore((s) => s.rolePreference);
  const updateUser = useAuthStore((s) => s.updateUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const isLeader = (user?.role === 'leader') || (rolePreference === 'leader');
  const totalSteps = isLeader ? 6 : 4; // Leaders have faith+denomination combined in step 3

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [faith, setFaith] = useState(user?.faith || 'Christianity'); // Default to Christianity
  const [denomination, setDenomination] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<any | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [contentFocus, setContentFocus] = useState<string[]>([]);
  const [audiencePrefs, setAudiencePrefs] = useState<string[]>([]);

  // If already onboarded, block entry
  React.useEffect(() => {
    if (isAuthenticated && user?.onboardingCompleted) {
      router.replace('/(tabs)/home')
    }
  }, [isAuthenticated, user?.onboardingCompleted])

  const pickImage = async () => {
    setIsPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setAvatar(asset.uri);
        setAvatarFile(asset);
      }
    } finally {
      setIsPickingImage(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      if (username.length < 3) {
        Toast.show({ type: 'error', text1: 'Username too short', text2: 'Please enter at least 3 characters' });
        return;
      }
    }
    if (currentStep === 2) {
      if (!name.trim()) {
        Toast.show({ type: 'error', text1: 'Name is required', text2: 'Please enter your full name' });
        return;
      }
    }
    if (isLeader && currentStep === 3) {
      if (!denomination) {
        Toast.show({ type: 'error', text1: 'Denomination required', text2: 'Please select a denomination' });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      setCurrentStep(currentStep + 1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    // Validate all required fields before completing
    if (username.length < 3) {
      Toast.show({ type: 'error', text1: 'Username too short', text2: 'Please enter at least 3 characters' });
      return;
    }
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name is required', text2: 'Please enter your full name' });
      return;
    }
    if (isLeader && !denomination) {
      Toast.show({ type: 'error', text1: 'Denomination required', text2: 'Please select a denomination' });
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedAvatar = avatar;

      if (avatar && avatarFile) {
        const uploadRes = await uploadsApi.uploadFile(
          avatarFile.uri,
          avatarFile.fileName || `avatar-${Date.now()}.jpg`,
          avatarFile.mimeType || 'image/jpeg',
          'avatars'
        );
        uploadedAvatar = uploadRes.url;
      }

      const profileData: any = { username, name, faith, bio, avatar: uploadedAvatar || undefined, onboardingCompleted: true };

      if (isLeader) {
        profileData.denomination = denomination;
        profileData.contentFocus = contentFocus;
        profileData.audiencePrefs = audiencePrefs;
      }

      const res = await api.patch('/users/me', profileData);
      updateUser(res.data);
      Toast.show({ type: 'success', text1: 'Profile saved', text2: 'Welcome to FaithConnect' });
      router.replace('/(tabs)/home?from=onboarding');
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error saving profile', text2: error?.response?.data?.message || 'Please try again' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- STEP 1: USERNAME (Insta style) ---
  const renderStep1 = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-gray-900">Choose a username</Text>
      <Text className="mt-2 text-sm text-gray-600">You can always change this later.</Text>
      
 <View className="flex-row mt-2 items-center bg-white rounded-2xl px-4 border border-gray-200" style={{ height: 56 }}>
                <Text className="text-gray-400 text-lg font-medium mr-1">@</Text>
<TextInput
          placeholder="user_name"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          value={username}
          onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
            style={{
                      flex: 1,
                      color: "#222",
                      fontSize: 12,
                      textAlignVertical: "center",
                    }}
        />
        
      </View>
    </View>
  );

  // --- STEP 2: NAME & BIO ---
  const renderStep2 = () => (
    <View className="mt-8">
      <View>
        <Text className="text-xl font-bold text-gray-900">Tell us about you</Text>
        <Text className="mt-2 text-sm text-gray-600">How should the community address you?</Text>
      </View>
      
      <View>
        <Text className="text-sm mt-4 text-gray-700 font-medium">Full name</Text>
         <View className="flex-row mt-2 items-center bg-white rounded-2xl px-4 border border-gray-200" style={{ height: 56 }}>
<TextInput
          placeholder="Your name"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
            style={{
                      flex: 1,
                      color: "#222",
                      fontSize: 12,
                      textAlignVertical: "center",
                    }}
        />
        
      </View>
      </View>
     

      <View>
        <Text className="text-sm mt-4 text-gray-700 font-medium">Short bio</Text>
        <TextInput
          className="mt-2 text-sm min-h-[120px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900"
          placeholder="Share a line about you or your community"
          placeholderTextColor="#9CA3AF"
          multiline
          textAlignVertical="top"
          value={bio}
          onChangeText={setBio}
        />
      </View>
    </View>
  );

  // --- STEP 3: FAITH (for both users and leaders) ---
  const renderStep3 = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-gray-900">Your faith</Text>
      <Text className="mt-2 text-sm text-gray-600">Select the path you follow.</Text>
      
      <View className="mt-8 flex-row flex-wrap gap-6">
        {faiths.map((item) => (
          <Pressable
            key={item}
            onPress={() => {
              setFaith(item);
              // Reset denomination when faith changes
              setDenomination('');
            }}
            className={`rounded-full px-6 py-3 border ${
              faith === item ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
            }`}
          >
            <Text className={`text-sm font-medium ${faith === item ? 'text-white' : 'text-gray-700'}`}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Denomination selection for leaders */}
      {isLeader && (
        <View className="mt-8">
          <Text className="text-xl font-bold text-gray-900">Your denomination</Text>
          <Text className="mt-2 text-sm text-gray-600">
            Select your specific tradition within <Text className="font-medium">{faith || 'your faith'}</Text>.
          </Text>
          
          <View className="mt-6 flex-row flex-wrap gap-4">
            {(denominations[faith as keyof typeof denominations] || []).map((item) => (
              <Pressable
                key={item}
                onPress={() => setDenomination(item)}
                className={`rounded-full px-4 py-2 border ${
                  denomination === item ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
                }`}
              >
                <Text className={`text-sm font-medium ${denomination === item ? 'text-white' : 'text-gray-700'}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // --- STEP 4: DENOMINATION (leaders only) ---
  const renderStep4Leader = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-gray-900">Your denomination</Text>
      <Text className="mt-2 text-sm text-gray-600">
        Select your specific tradition within <Text className="font-medium">{faith}</Text>.
      </Text>
      
      <View className="mt-8 flex-row flex-wrap gap-4">
        {(denominations[faith as keyof typeof denominations] || []).map((item) => (
          <Pressable
            key={item}
            onPress={() => setDenomination(item)}
            className={`rounded-full px-4 py-2 border ${
              denomination === item ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
            }`}
          >
            <Text className={`text-sm font-medium ${denomination === item ? 'text-white' : 'text-gray-700'}`}>
              {item}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  // --- STEP 4: AVATAR (regular users) ---
  const renderStep4Regular = () => renderStep4();

  // --- STEP 5: AVATAR (leaders) ---
  const renderStep5Leader = () => renderStep4();

  // --- STEP 6: CONTENT FOCUS (leaders) ---
  const renderStep6Leader = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-gray-900">Content Focus</Text>
      <Text className="mt-2 text-sm text-gray-600">
        Pick 1–3 areas you focus on <Text className="font-medium">(optional)</Text>.
      </Text>
      
      <View className="mt-8 flex-row flex-wrap gap-4">
        {contentFocusTags.map((tag) => {
          const isSelected = contentFocus.includes(tag);
          return (
            <Pressable
              key={tag}
              onPress={() => {
                if (isSelected) {
                  setContentFocus(contentFocus.filter(t => t !== tag));
                } else if (contentFocus.length < 3) {
                  setContentFocus([...contentFocus, tag]);
                }
              }}
              className={`rounded-full px-4 py-2 border ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-200'
              }`}
            >
              <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                {tag}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="mt-4 text-xs text-gray-500">
        Selected: {contentFocus.length}/3
      </Text>
    </View>
  );

  // --- STEP 7: AUDIENCE PREFERENCE (leaders) ---
  const renderStep7Leader = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-gray-900">Audience Preference</Text>
      <Text className="mt-2 text-sm text-gray-600">Who do you primarily serve?</Text>
      
      <View className="mt-8">
        {audiencePreferences.map((pref) => {
          const isSelected = audiencePrefs.includes(pref);
          return (
            <Pressable
              key={pref}
              onPress={() => {
                if (isSelected) {
                  setAudiencePrefs(audiencePrefs.filter(p => p !== pref));
                } else {
                  setAudiencePrefs([...audiencePrefs, pref]);
                }
              }}
              className="flex-row items-center p-3 rounded-xl border border-gray-100 mb-4"
            >
              <View className={`w-6 h-6 rounded-lg border-2 mr-4 flex items-center justify-center ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-200 bg-white'
              }`}>
                {isSelected && (
                  <Text className="text-white text-sm font-bold">✓</Text>
                )}
              </View>
              <Text className={`text-sm ml-4 font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                {pref}
              </Text>
            </Pressable>
          );
        })}
      </View>
      
      <Text className="mt-6 text-xs text-gray-500 text-center">
        Select all that apply
      </Text>
    </View>
  );

  // --- STEP 4: AVATAR ---
  const renderStep4 = () => (
    <View className="mt-8">
      <Text className="text-xl font-bold text-gray-900">Profile Picture</Text>
      <Text className="mt-2 text-sm text-gray-600 mb-10">
        A photo helps people connect with you personally.
      </Text>
      
      <View className="items-center mt-12">
        <Pressable 
          onPress={pickImage}
          className="w-44 h-44 bg-gray-50 mt-4 rounded-full items-center justify-center border border-gray-200 overflow-hidden shadow-sm"
          disabled={isPickingImage}
        >
          {avatar ? (
            <Image source={{ uri: avatar }} className="w-full h-full" />
          ) : (
            <View className="items-center">
              {isPickingImage ? (
                <ActivityIndicator size="large" color="#6b7280" />
              ) : (
               <Entypo name="images" size={48} color="#444" />
              )}
            </View>
          )}
        </Pressable>
      </View>
      
            <View className="items-center mt-2">

{avatar && (
        <Pressable onPress={pickImage} className="mt-6 p-3 rounded-full bg-gray-100 items-center justify-center" disabled={isPickingImage}>
          {isPickingImage ? (
            <ActivityIndicator size="small" color="#374151" />
          ) : (
            <MaterialCommunityIcons name="camera-outline" size={24} color="#374151" />
          )}
        </Pressable>
      )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        
        {/* Simple Top Progress Bar */}
        <View className="h-1 bg-gray-100 mt-4 w-full">
          <View 
            className="h-full bg-blue-500" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }} 
          />
        </View>

        <ScrollView className="flex-1 px-6 pt-2">
          {currentStep === 1 ? renderStep1() : null}
          {currentStep === 2 ? renderStep2() : null}
          {currentStep === 3 ? renderStep3() : null}
          {isLeader && currentStep === 4 ? renderStep5Leader() : null}
          {isLeader && currentStep === 5 ? renderStep6Leader() : null}
          {isLeader && currentStep === 6 ? renderStep7Leader() : null}
          {!isLeader && currentStep === 4 ? renderStep4Regular() : null}
        </ScrollView>

        <View className="p-6 border-t border-gray-50">
          <View className="flex-row gap-3">
            {currentStep > 1 && (
              <Pressable 
                className="flex-1 py-4 rounded-2xl bg-gray-100" 
                onPress={() => setCurrentStep(currentStep - 1)}
                disabled={isSubmitting}
              >
                <Text className="text-gray-700 text-center font-semibold text-sm">Back</Text>
              </Pressable>
            )}
            
            <Pressable 
              className="flex-[2] py-4 rounded-2xl bg-blue-500 shadow-sm shadow-blue-200 flex-row items-center justify-center" 
              onPress={currentStep === totalSteps ? handleFinish : handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-sm">
                  {currentStep === totalSteps ? "Complete" : "Next"}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      <Toast config={toastConfig} topOffset={80} />
    </SafeAreaView>
  );
}