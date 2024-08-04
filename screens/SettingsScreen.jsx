import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

const SettingsScreen = ({ navigation }) => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    fetchLikedPosts();
    fetchSavedPosts();
  }, []);

  const fetchLikedPosts = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from("user_likes")
      .select("posts(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching liked posts:", error);
    } else {
      setLikedPosts(data.map((entry) => entry.posts));
    }
  };

  const fetchSavedPosts = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from("user_saves")
      .select("posts(*)")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching saved posts:", error);
    } else {
      setSavedPosts(data.map((entry) => entry.posts));
    }
  };

  const renderPost = ({ item }) => (
    <Pressable
      onPress={() => navigation.navigate("post", { post_id: item.id })}
      style={styles.post}
    >
      <Image source={{ uri: item.media }} style={styles.postImage} />
      <Text numberOfLines={1} style={styles.postCaption}>
        {item.caption}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Liked Posts</Text>
      <FlatList
        data={likedPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        horizontal
      />
      <Text style={styles.header}>Saved Posts</Text>
      <FlatList
        data={savedPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        horizontal
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("updateProfile")}
      >
        <Text style={{color: "#EEEEEE"}}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  header: {
    color: "#EEEEEE",
    fontSize: 18,
    marginBottom: 10,
  },
  post: {
    marginRight: 10,
  },
  postImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
  },
  postCaption: {
    color: "#EEEEEE",
    marginTop: 5,
    width: 150,
  },
  button: {
    backgroundColor: "#758694",
    padding: 10,
    borderRadius: 25,
    width: "50%",
    alignItems: "center",
  },
});
