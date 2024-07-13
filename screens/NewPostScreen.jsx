import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { Video } from "expo-av";

const NewPostScreen = ({ navigation }) => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null); // local image uri
  // const [imageName, setImageName] = useState("");
  const [video, setVideo] = useState(null); // local video uri
  // const [videoName, setVideoName] = useState("");
  const [uploadImage, setUploadImage] = useState(true);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    console.log(result);

    if (!result.canceled) {
      console.log(result.assets[0]);
      if (result.assets[0].type === "image") {
        setImage(result.assets[0]);
        setUploadImage(true);
        // setImageName(result.assets[0].fileName);
      } else if (result.assets[0].type === "video") {
        setVideo(result.assets[0]);
        setUploadImage(false);
        // setVideoName(result.assets[0].fileName);
      }
    }
  };

  const uploadMedia = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user.id;
      const base64 = await FileSystem.readAsStringAsync(
        uploadImage ? image.uri : video.uri,
        {
          encoding: "base64",
        }
      );
      const filePath = `${userId}/${
        uploadImage ? image.fileName : video.fileName
      }`;
      contentType = uploadImage ? image.mimeType : video.mimeType;

      const { data, error } = await supabase.storage
        .from("posts")
        .upload(filePath, decode(base64), {
          contentType,
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      Alert.alert("Error occurred!", error.message);
      return null;
    }
  };

  const createPost = async () => {
    if ((uploadImage && !image) || (!uploadImage && !video)) {
      Alert.alert("Invalid Media", "Please select an image/video to post", [
        { text: "OK" },
      ]);
    }

    const response = await uploadMedia();
    console.log(response);

    if (response) {
      console.log("Media uploaded successfully:", response);
      // Proceed with creating the post using the response data if needed
    }

    const { data: url_data } = supabase.storage
      .from("posts")
      .getPublicUrl(response.path);

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          caption,
          image: url_data.publicUrl,
          user_id: (await supabase.auth.getSession()).data.session.user.id,
          media_type: uploadImage ? "image" : "video",
        },
      ])
      .select();

    if (error) {
      Alert.alert("Error occurred", error.message, [{ text: "OK" }]);
    }

    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="#000" style="light" />
      {/* Image/Video Picker */}
      {uploadImage && image ? (
        <Image
          source={{
            uri:
              image.uri ||
              "https://ipsf.net/wp-content/uploads/2021/12/dummy-image-square.webp",
          }}
          style={styles.media}
        />
      ) : !uploadImage && video ? (
        <Video
          style={styles.media}
          source={{
            uri:
              video.uri ||
              "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
          }}
          useNativeControls
          resizeMode="contain"
          isLooping
          shouldPlay
        />
      ) : null}

      <Text style={styles.change} onPress={pickImage}>
        Change
      </Text>

      {/* TextInput for caption */}
      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="What's on your mind"
        style={styles.input}
        placeholderTextColor="#ccc"
        numberOfLines={1}
        multiline
        maxLength={100}
      />

      {/* Button */}
      <Pressable onPress={createPost} style={styles.shareButton}>
        <Text style={{ color: "#fff", fontWeight: "semibold" }}>Share</Text>
      </Pressable>
    </View>
  );
};

export default NewPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#000",
  },
  media: {
    width: "90%",
    aspectRatio: 4 / 3,
    borderRadius: 25,
    marginTop: "10%",
  },
  change: {
    color: "#76ABAE",
    fontWeight: "semibold",
    fontSize: 15,
    marginTop: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    color: "#ccc",
  },
  shareButton: {
    width: "90%",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#758694",
    borderRadius: 25,
    position: "absolute",
    bottom: "5%",
  },
});
