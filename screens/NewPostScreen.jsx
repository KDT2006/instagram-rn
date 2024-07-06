import {
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

const NewPostScreen = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);

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
      setImage(result.assets[0].uri);
    }
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
      <Pressable style={styles.shareButton}>
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
    backgroundColor: "#76ABAE",
    borderRadius: 25,
    position: "absolute",
    bottom: "5%",
  },
});
