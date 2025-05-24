import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker"
import SupabaseImage from "./SupabaseImage";

export default function UserAvatarPicker({
  currentAvatarUrl,
  onUpload,
}: {
  currentAvatarUrl: string;
  onUpload: (path: string) => void;
}) {
    const [uploading, setUploading] = useState(false)

    async function uploadAvatar() {
        try {
          setUploading(true)
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: false,
            allowsEditing: true,
            quality: 1,
            exif: false,
          })
          if (result.canceled || !result.assets || result.assets.length === 0) {
            console.log('User cancelled image picker.')
            return
          }
          const image = result.assets[0]
          console.log('Got image', image)
          if (!image.uri) {
            throw new Error('No image uri!')
          }
          const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer())
          const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg'
          const path = `${Date.now()}.${fileExt}`
          
          // Delete old avatar if it exists
          if (currentAvatarUrl) {
            const oldPath = currentAvatarUrl.replace(/^.*\/avatars\//, '')
            await supabase.storage.from('avatars').remove([oldPath])
          }

          const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, arraybuffer, {
              contentType: image.mimeType ?? 'image/jpeg',
            })
          if (uploadError) {
            throw uploadError
          }

          // Get the public URL for the uploaded image
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.path)

          // Pass the full URL to the parent component
          onUpload(publicUrl)
        } catch (error) {
          console.error('Upload error:', error)
          if (error instanceof Error) {
            Alert.alert('Error', error.message)
          } else {
            Alert.alert('Error', 'Failed to upload image')
          }
        } finally {
          setUploading(false)
        }
      }
    
  return (
    <Pressable onPress={uploadAvatar} className="self-center">
      {currentAvatarUrl ? (
        <SupabaseImage
          bucket="avatars"
          path={currentAvatarUrl.replace(/^.*\/avatars\//, '')}
          className="w-28 h-28 rounded-full self-center"
        />
      ) : (
        <View className="w-28 h-28 rounded-full bg-neutral-700 items-center justify-center">
          <Text className="text-white text-2xl">?</Text>
        </View>
      )}
    </Pressable>
  );
}
