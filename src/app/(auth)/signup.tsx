import { View, Text, TextInput, TouchableOpacity, Pressable, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [signupError, setSignupError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSignUp = async () => {
    if (!validateForm()) return;

    if (!email || !password) {
      setSignupError('Please enter your email and password')
      return
    }

    try {
      setIsLoading(true);
      setSignupError('');
      
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) Alert.alert(error.message)
      if (!session) Alert.alert('Please check your inbox for email verification!')
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.error('Login error', error)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.9)', 'rgba(26,26,26,0.9)', 'rgba(42,42,42,0.9)']}
        className="flex-1"
      >
        <View className="flex-1 p-6 justify-center">
          <View className="space-y-8">
            <View className="items-center mb-8">
              <View className="w-20 h-20 bg-gray-800/50 rounded-full items-center justify-center mb-4">
                <Ionicons name="person-add" size={40} color="#fff" />
              </View>
              <Text className="text-4xl font-bold text-white mb-3">Create Account</Text>
              <Text className="text-gray-400 text-center text-base">Join us and start your journey</Text>
            </View>

            {signupError ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <Text className="text-red-500 text-center">{signupError}</Text>
              </View>
            ) : null}

            <View className="space-y-5 gap-4">
              <View className="space-y-1">
                <Text className="text-gray-400 text-sm ml-1">Email</Text>
                <View className={`flex-row items-center bg-gray-800/30 border ${errors.email ? 'border-red-500/50' : 'border-gray-700/30'} rounded-2xl px-4`}>
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 px-3 py-4 text-white text-base"
                    placeholder="Enter your email"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {errors.email && (
                  <Text className="text-red-500 text-sm ml-1">{errors.email}</Text>
                )}
              </View>

              <View className="space-y-1">
                <Text className="text-gray-400 text-sm ml-1">Password</Text>
                <View className={`flex-row items-center bg-gray-800/30 border ${errors.password ? 'border-red-500/50' : 'border-gray-700/30'} rounded-2xl px-4`}>
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 px-3 py-4 text-white text-base"
                    placeholder="Create a password"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: undefined }));
                      }
                    }}
                    secureTextEntry={!isPasswordVisible}
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#6B7280" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text className="text-red-500 text-sm ml-1">{errors.password}</Text>
                )}
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                className="w-full py-4 rounded-2xl overflow-hidden bg-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black text-center font-semibold text-base">Create Account</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-8">
                <Text className="text-gray-400">Already have an account? </Text>
                <Link href="/login" asChild>
                  <Pressable disabled={isLoading}>
                    <Text className="text-gray-300 font-semibold">Sign In</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
