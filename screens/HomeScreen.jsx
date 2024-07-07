import {
  Alert,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import Post from "../components/Post";
import { supabase } from "../supabase";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();

  const fetchPosts = async () => {
    let { data, error } = await supabase
      .from("posts")
      .select("*, user:profiles(*)");
    if (error) {
      Alert.alert("Error Occurred", error.message);
    }
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // console.log(posts);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent backgroundColor="#000" />
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
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : null,
  },
});

export default HomeScreen;
