import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../supabase";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import { FontAwesome } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  // const [imageName, setImageName] = useState(null);
  const [email, setEmail] = useState(null);
  const [username, setUsername] = useState(null);
  const [name, setName] = useState(null);
  const [website, setWebsite] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerStyle: {
        backgroundColor: "#000",
      },
      headerTintColor: "#EEEEEE",
      headerTitleStyle: {
        fontWeight: "bold",
      },
      headerShown: true,
      headerRight: () => (
        <FontAwesome
          // style={{ paddingHorizontal: 10 }}
          name="gear"
          size={25}
          color="#EEEEEE"
          onPress={() => navigation.navigate("settings")}
        />
      ),
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
      // setImageName(result.assets[0].fileName);
      updatePFP(result.assets[0].uri, result.assets[0].fileName);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const user = (await supabase.auth.getUser()).data.user;
        setUser(user);
        console.log(user.id);
        let { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id);

        if (error) {
          throw error;
        } else {
          setEmail(user.email);
          setUsername(data[0].username);
          setName(data[0].full_name);
          data[0].avatar_url != null
            ? setImage(data[0].avatar_url)
            : setImage(
                "https://w7.pngwing.com/pngs/505/761/png-transparent-login-computer-icons-avatar-icon-monochrome-black-silhouette-thumbnail.png"
              );
          data[0].website != null ? setWebsite(data[0].website) : null;
        }

        console.log(data);
      } catch (e) {
        Alert.alert(
          "Error Occurred!",
          "Unable to fetch user data, please try again."
        );
        console.log(e);
      }
    };

    fetchDetails().then(() => setLoading(false));
  }, []);

  const updateProfile = async () => {
    try {
      // unoptimized as we update regardless of data change // TODO: Optimize it
      // const user = (await supabase.auth.getUser()).data.user;
      const { data, error } = await supabase
        .from("profiles")
        .update({ full_name: name, username: username, website: website })
        .eq("id", user.id)
        .select();

      if (error) {
        throw error;
      }

      setName(data[0].full_name);
      setUsername(data[0].username);
      setWebsite(data[0].website);
    } catch (e) {
      Alert.alert(
        "Error Occurred!",
        "Unable to update profile detials, please try again."
      );
      console.log(e);
    }
  };

  const updatePFP = async (img_uri, img_name) => {
    var exist = false;
    var pfpName = null;
    try {
      // Check if pfp already exists
      const { data: listData, error: listError } = await supabase.storage
        .from("avatars")
        .list(user.id);

      if (listError) {
        console.log(listError);
        throw listError;
      }

      if (listData.length > 0) {
        exist = true;
        pfpName = listData[0].name;
      }

      // Upload new pfp to Supabase storage
      const base64 = await FileSystem.readAsStringAsync(img_uri, {
        encoding: "base64",
      });
      const filePath = `${user.id}/${img_name}`;
      const contentType = "image";

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, decode(base64), {
          contentType,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Update the URL in profiles table
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(uploadData.path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // If pfp exists, delete the old one
      if (exist) {
        console.log(pfpName);
        console.log(`${user.id}/${pfpName}`);
        const { data: removeData, error: removeError } = await supabase.storage
          .from("avatars")
          .remove([`${user.id}/${pfpName}`]);

        if (removeError) {
          throw removeError;
        }

        console.log("Remove data:", removeData);
      }
    } catch (e) {
      Alert.alert(
        "Error Occurred!",
        "Unable to update profile picture, please try again."
      );
      console.log(e);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#222831",
          justifyContent: "center",
        }}
      >
        <StatusBar translucent backgroundColor="#000" />
        <ActivityIndicator
          style={{ alignSelf: "center" }}
          size={"large"}
          color={"#EEEEEE"}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="#000" style="light" />
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
        editable={false}
      />
      <TextInput
        placeholder="Name"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
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
        <Pressable
          onPress={() => {
            updateProfile();
          }}
          style={styles.shareButton}
        >
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
    backgroundColor: "#000",
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
    color: "#fff",
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
