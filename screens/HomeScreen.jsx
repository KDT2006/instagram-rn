import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import posts from "../assets/data/posts.json";
import Post from "../components/Post";
import { supabase } from "../supabase";

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    let { data, error } = await supabase.from("posts").select("*, user:profiles(*)");
    if (error) {
      Alert.alert("Error Occurred", error.message);
    }
    setPosts(data)
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  console.log(posts);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="#ccc1" />
      <FlatList
        data={posts}
        contentContainerStyle={{ gap: 3 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <Post key={index} post={item} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222831",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : null,
  },
});

export default HomeScreen;
