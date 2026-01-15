import React, { useState, useRef } from 'react'
import { View, Text, TextInput, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import { useDebouncedRouter } from '../hooks/useDebounce'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { PostCard } from '../components/Feed/PostCard'
import ReelCard from '../components/Reel/ReelCard'
import { postsApi } from '../api/posts'
import { useFeedStore } from '../stores/feedStore'
import { toastConfig } from '../components/ToastConfig'

export default function SearchScreen() {
  const router = useDebouncedRouter()
  const inputRef = useRef<TextInput>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'post' | 'reel'>('all')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { toggleLike, toggleSave } = useFeedStore()

  useFocusEffect(
    React.useCallback(() => {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }, [])
  )

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Search query required',
        text2: 'Please enter a search term',
      })
      return
    }

    try {
      setIsLoading(true)
      setHasSearched(true)
      
      const type = searchType === 'all' ? undefined : searchType
      const searchResults = await postsApi.searchPosts(
        searchQuery,
        type,
        100,
        0
      )
      
      setResults(searchResults || [])
      
      if (!searchResults || searchResults.length === 0) {
        Toast.show({
          type: 'info',
          text1: 'No results found',
          text2: `No ${searchType} containing "${searchQuery}"`,
        })
      }
    } catch (error: any) {
      console.error('Search failed:', error)
      Toast.show({
        type: 'error',
        text1: 'Search failed',
        text2: error.message || 'Please try again',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async (postId: string) => {
    toggleLike(postId)
  }

  const handleSave = async (postId: string) => {
    toggleSave(postId)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 px-4 py-4 flex-row items-center justify-center relative">
          <Pressable onPress={() => router.back()} className="absolute left-4 p-2">
            <Ionicons name="chevron-back" size={24} color="#111" />
          </Pressable>
          <Text className="text-xl font-bold text-gray-800">Filter</Text>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-4 mt-2 gap-3">
          <View className="flex-row items-center gap-2 bg-gray-100 rounded-full px-4 py-3">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              ref={inputRef}
              className="flex-1 text-base font-normal"
              placeholder="Search posts, reels..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </Pressable>
            )}
          </View>

          {/* Type Filter */}
          <View className="flex-row mt-2 mb-1 gap-2">
            {(['all', 'post', 'reel'] as const).map((type) => (
              <Pressable
                key={type}
                onPress={() => setSearchType(type)}
                className={`px-4 py-2 rounded-full ${
                  searchType === type
                    ? 'bg-black'
                    : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`font-medium capitalize ${
                    searchType === type
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Results */}
        <ScrollView className="flex-1">
          {hasSearched && isLoading && (
            <View className="flex-1 justify-center items-center py-10">
              <ActivityIndicator size="small" color="#222" />
            </View>
          )}

          {hasSearched && !isLoading && results.length === 0 && (
            <View className="flex-1 justify-center items-center py-10">
              <Ionicons name="search" size={48} color="#ccc" />
              <Text className="mt-3 text-gray-600 text-center">
                No results found{'\n'}Try another search
              </Text>
            </View>
          )}

          {results.map((item) => (
            <View key={`${item.type}-${item.id}`}>
              {item.type === 'reel' ? (
                <ReelCard
                  item={item}
                  onLike={() => handleLike(item.id)}
                  onSave={() => handleSave(item.id)}
                  isVisible={false}
                  isScreenFocused={false}
                />
              ) : (
                <PostCard
                  item={item}
                  onLike={() => handleLike(item.id)}
                  onSave={() => handleSave(item.id)}
                  isVisible={false}
                />
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      <Toast config={toastConfig} />
    </SafeAreaView>
  )
}
