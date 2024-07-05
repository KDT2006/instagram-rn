import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import posts from "../assets/data/posts.json";
import Post from "../components/Post";

const HomeScreen = () => {
  const post1 = posts[0];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        contentContainerStyle={{gap: 3}}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => <Post key={index} post={item} />}
      />
    </View>
  );
};

export default HomeScreen;
