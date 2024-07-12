import { FlatList, Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

const SettingsScreen = () => {
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
    <View style={styles.post}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.postCaption}>
        {item.caption}
      </Text>
    </View>
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
    marginVertical: 10,
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
  },
});
