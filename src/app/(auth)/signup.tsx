import { View, Text, TextInput, TouchableOpacity, Pressable, Image, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import UserAvatarPicker from '@/components/UserAvatarPicker';

interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  fullName?: string;
}

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
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

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url);
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setSignupError('');
      
      // 1. Sign up the user
      console.log('Starting signup process...');
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        Alert.alert('Error', signUpError.message);
        return;
      }

      if (!user) {
        console.error('No user returned from signup');
        Alert.alert('Error', 'Failed to create account');
        return;
      }

      console.log('User created successfully:', user.id);

      // 2. Create the profile
      const profileData = {
        id: user.id,
        username,
        full_name: fullName,
        bio: bio || null,
        website: website || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      console.log('Creating profile with data:', profileData);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        Alert.alert(
          'Error',
          `Failed to create profile: ${profileError.message}. Please try again.`
        );
        return;
      }

      console.log('Profile created successfully');

      Alert.alert(
        'Success',
        'Account created successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );

    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setSignupError('An unexpected error occurred. Please try again.');
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
        <ScrollView 
          className="flex-1 p-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="space-y-8">
            <View className="items-center mb-8">
              <UserAvatarPicker
                currentAvatarUrl={avatarUrl}
                onUpload={handleAvatarUpload}
                size={100}
              />
              <Text className="text-4xl font-bold text-white mb-3 mt-4">Create Account</Text>
              <Text className="text-gray-400 text-center text-base">Join us and start your journey</Text>
            </View>

            {signupError ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <Text className="text-red-500 text-center">{signupError}</Text>
              </View>
            ) : null}

            <View className="space-y-5">
              <View className="space-y-1">
                <Text className="text-gray-400 text-sm ml-1">Full Name</Text>
                <View className={`flex-row items-center bg-gray-800/30 border ${errors.fullName ? 'border-red-500/50' : 'border-gray-700/30'} rounded-2xl px-4`}>
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 px-3 py-4 text-white text-base"
                    placeholder="Enter your full name"
                    placeholderTextColor="#6B7280"
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errors.fullName) {
                        setErrors(prev => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    editable={!isLoading}
                  />
                </View>
                {errors.fullName && (
                  <Text className="text-red-500 text-sm ml-1">{errors.fullName}</Text>
                )}
              </View>

              <View className="space-y-1">
                <Text className="text-gray-400 text-sm ml-1">Username</Text>
                <View className={`flex-row items-center bg-gray-800/30 border ${errors.username ? 'border-red-500/50' : 'border-gray-700/30'} rounded-2xl px-4`}>
                  <Ionicons name="at-outline" size={20} color="#6B7280" />
                  <TextInput
                    className="flex-1 px-3 py-4 text-white text-base"
                    placeholder="Choose a username"
                    placeholderTextColor="#6B7280"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errors.username) {
                        setErrors(prev => ({ ...prev, username: undefined }));
                      }
                    }}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
                {errors.username && (
                  <Text className="text-red-500 text-sm ml-1">{errors.username}</Text>
                )}
              </View>

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

              <View className="space-y-1">
                <Text className="text-gray-400 text-sm ml-1">Bio (Optional)</Text>
                <View className="bg-gray-800/30 border border-gray-700/30 rounded-2xl px-4">
                  <TextInput
                    className="px-3 py-4 text-white text-base"
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#6B7280"
                    value={bio}
                    onChangeText={setBio}
                    multiline
                    numberOfLines={3}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View className="space-y-1">
                <Text className="text-gray-400 text-sm ml-1">Website (Optional)</Text>
                <View className="bg-gray-800/30 border border-gray-700/30 rounded-2xl px-4">
                  <TextInput
                    className="px-3 py-4 text-white text-base"
                    placeholder="Your website URL"
                    placeholderTextColor="#6B7280"
                    value={website}
                    onChangeText={setWebsite}
                    keyboardType="url"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
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
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}
