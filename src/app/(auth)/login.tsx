import { View, Text, TextInput, TouchableOpacity, Pressable, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState('');

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

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setLoginError('');
      
      // TODO: Implement your login logic here
      // For example:
      // const response = await loginUser(email, password);
      // if (response.success) {
      //   router.replace('/(tabs)');
      // }
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, let's just navigate
      router.replace('/(tabs)');
      
    } catch (error) {
      setLoginError('Invalid email or password');
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
                <Ionicons name="person" size={40} color="#fff" />
              </View>
              <Text className="text-4xl font-bold text-white mb-3">Welcome Back</Text>
              <Text className="text-gray-400 text-center text-base">Sign in to continue your journey</Text>
            </View>

            {loginError ? (
              <View className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <Text className="text-red-500 text-center">{loginError}</Text>
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
                    placeholder="Enter your password"
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
                className="items-end"
                disabled={isLoading}
              >
                <Text className="text-gray-400 text-sm">Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLogin}
                className="w-full py-4 rounded-2xl overflow-hidden bg-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-black text-center font-semibold text-base">Sign In</Text>
                )}
              </TouchableOpacity>

              <View className="flex-row justify-center mt-8">
                <Text className="text-gray-400">Don't have an account? </Text>
                <Link href="/signup" asChild>
                  <Pressable disabled={isLoading}>
                    <Text className="text-gray-300 font-semibold">Sign Up</Text>
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
