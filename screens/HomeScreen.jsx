import {
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from "react-native";
import React from "react";
import posts from "../assets/data/posts.json";
import Post from "../components/Post";

const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
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
