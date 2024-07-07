import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useLayoutEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase";

const ProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [website, setWebsite] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerStyle: {
        backgroundColor: "#222831",
      },
      headerTintColor: "#EEEEEE",
      headerTitleStyle: {
        fontWeight: "bold",
      },
      headerShown: true,
    });
  }, []);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
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
      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Username"
        placeholderTextColor="#ccc"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Website"
        placeholderTextColor="#ccc"
        value={website}
        onChangeText={setWebsite}
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Pressable style={styles.shareButton}>
          <Text style={{ color: "#fff", fontWeight: "semibold" }}>
            Update Profile
          </Text>
        </Pressable>
        <Pressable
          onPress={() => supabase.auth.signOut()}
          style={styles.shareButton}
        >
          <Text style={{ color: "#fff", fontWeight: "semibold" }}>
            Sign out
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#31363F",
  },
  image: {
    width: "45%",
    height: "24%",
    borderRadius: 100,
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
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginVertical: 10,
  },
  shareButton: {
    width: "90%",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#758694",
    borderRadius: 25,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    marginTop: "auto",
  },
});
