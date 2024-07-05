import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Feather, Ionicons, AntDesign } from "@expo/vector-icons";

const Post = ({ post }) => {
  console.log(post);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.header}>
        <Image style={styles.avatar} source={{ uri: post.user.image_url }} />
        <Text>{post.user.username}</Text>
      </View>
      <Image
        source={{ uri: post.image_url }}
        style={{ width: "100%", aspectRatio: 4 / 3 }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 10,
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <AntDesign name="hearto" size={25} color="black" />
          <Ionicons name="chatbubble-outline" size={25} color="black" />
          <Feather name="send" size={25} color="black" />
        </View>
        <Feather name="bookmark" size={25} color="black" />
      </View>
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    backgroundColor: "#ccc1",
    padding: 2,
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
});
