import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, Image, Text, View } from "react-native";

const downloadImage = async (bucket: string, path: string): Promise<string> => {
  try {
    // If the path is already a full URL, return it directly
    if (path.startsWith('http')) {
      return path;
    }

    // Extract just the filename from the full URL if it's a Supabase URL
    const filename = path.split('/').pop();
    if (!filename) {
      throw new Error('Invalid path: could not extract filename');
    }

    const { data, error } = await supabase.storage.from(bucket).download(filename);
    
    if (error) {
      console.error('Storage error:', error.message);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data received from storage');
    }

    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result as string);
      };
      fr.onerror = () => {
        reject(fr.error);
      };
      fr.readAsDataURL(data);
    });
  } catch (error) {
    console.error('Image download error:', error.message);
    throw error;
  }
};

export default function SupabaseImage({
  bucket,
  path,
  className,
}: {
  bucket: string;
  path: string;
  className: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["supabaseImage", bucket, path],
    queryFn: () => downloadImage(bucket, path),
    retry: 2,
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return (
      <View className={`${className} bg-neutral-700 items-center justify-center`}>
        <Text className="text-red-500 text-xs">Error loading image</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View className={`${className} bg-neutral-700 items-center justify-center`}>
        <Text className="text-white text-xs">No image</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: data }}
      className={className}
      onError={(e) => console.error('Image render error:', e.nativeEvent.error)}
    />
  );
}
