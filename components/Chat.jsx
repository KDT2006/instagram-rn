import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { supabase } from "../supabase";

const Chat = ({ chat, user }) => {
  const otherUser = user.id === chat.user1.id ? chat.user2 : chat.user1;

  console.log(chat);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
      <Text style={styles.name}>{otherUser.full_name}</Text>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    color: "#fff",
    fontSize: 15,
  }
});
