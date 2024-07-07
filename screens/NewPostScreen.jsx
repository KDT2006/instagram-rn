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

const NewPostScreen = ({ navigation }) => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null); // local image uri
  const [imageName, setImageName] = useState("");

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageName(result.assets[0].fileName);
    }
  };

  const uploadImage = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user.id;
      const base64 = await FileSystem.readAsStringAsync(image, {
        encoding: "base64",
      });
      const filePath = `${userId}/${imageName}.png`;
      contentType = "image/png";

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
    if (!image) {
      Alert.alert("Invalid Image", "Please select an image to post", [
        { text: "OK" },
      ]);
    }

    const response = await uploadImage();
    console.log(response);

    if (response) {
      console.log("Image uploaded successfully:", response);
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
      <StatusBar translucent backgroundColor="#222831" style="light" />
      {/* Image Picker */}
      <Image
        source={{
          uri:
            image ||
            "https://ipsf.net/wp-content/uploads/2021/12/dummy-image-square.webp",
        }}
        style={styles.image}
      />
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
    backgroundColor: "#31363F",
  },
  image: {
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
