import { Image, Pressable, StyleSheet, Text } from "react-native";
import React from "react";

const Chat = ({ chat, user, navigation }) => {
  const otherUser = user.id === chat.user1.id ? chat.user2 : chat.user1;

  console.log("Chat: ", chat);
  return (
    <Pressable
      onPress={() => {
        navigation.navigate("message", {
          convo_id: chat.id,
        });
      }}
      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
    >
      <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
      <Text style={styles.name}>{otherUser.full_name}</Text>
    </Pressable>
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
  },
});
