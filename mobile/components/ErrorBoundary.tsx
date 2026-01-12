import React, { ReactNode, Component, ErrorInfo } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View className="flex-1 bg-white">
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              className="p-6"
            >
              <View className="items-center gap-4">
                <Ionicons name="alert-circle" size={64} color="#EF4444" />
                <Text className="text-2xl font-bold text-gray-900 text-center">
                  Oops! Something went wrong
                </Text>
                <Text className="text-base text-gray-600 text-center">
                  We encountered an unexpected error. Please try again or contact support if the problem persists.
                </Text>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <View className="mt-4 w-full bg-red-50 rounded-lg p-4">
                    <Text className="font-mono text-xs text-red-900">
                      {this.state.error.toString()}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={this.handleReset}
                  className="mt-6 bg-blue-500 rounded-lg px-6 py-3 flex-row items-center gap-2"
                >
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text className="text-white font-semibold">Try Again</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        )
      );
    }

    return this.props.children
  }
}
