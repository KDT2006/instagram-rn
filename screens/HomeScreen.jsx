import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Post from "../components/Post";
import { supabase } from "../supabase";

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    let { data, error } = await supabase
      .from("posts")
      .select("*, user:profiles(*)")
      .order("created_at", { ascending: false });
    if (error) {
      Alert.alert("Error Occurred", error.message);
    }
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts().then(() => setLoading(false));
  }, []);

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
