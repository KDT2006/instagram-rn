import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { supabase } from "../supabase";

const Message = ({ message, user, navigation }) => {
  const [visibleOptions, setVisibleOptions] = useState(null);

  const handleLongPress = (messageId) => {
    setVisibleOptions((prev) => (prev === messageId ? null : messageId));
  };

  const handleCopyMessage = async (message) => {
    await Clipboard.setStringAsync(message);
    setVisibleOptions(null);
  };

  const handleDeleteMessage = async (id) => {
    if (message.message_type === "text") {
      const { error } = await supabase.from("messages").delete().eq("id", id);

      if (error) {
        console.error("Error deleting text message: ", error);
        Alert.alert(
          "Error Occurred!",
          "Unable to delete message: " + error.message
        );
      } else {
        setVisibleOptions(null);
      }
    } else if (message.message_type === "image") {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) {
        console.error("Error deleting image message: ", error);
        Alert.alert(
          "Error Occurred!",
          "Unable to delete message: " + error.message
        );
      } else {
        // delete the image from the storage bucket
        const { error: deleteImageError } = await supabase.storage
          .from("conversations")
          .remove([message.file_path]);

        if (deleteImageError) {
          console.error(
            "Unable to delete image from storage: " + deleteImageError.message
          );
        }
      }
    }
  };

  if (message.message_type === "post") {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("post", { post_id: message.post.id })
        }
        style={[
          styles.messageContainer,
          message.sender_id === user.id
            ? styles.myMessage
            : styles.theirMessage,
          { padding: 2 },
        ]}
      >
        <Image source={{ uri: message.post.media }} style={styles.postImage} />
      </TouchableOpacity>
    );
  }

  return (
    <View>
      <TouchableOpacity
        onLongPress={() => handleLongPress(message.id)}
        style={[
          styles.messageContainer,
          message.sender_id === user.id
            ? styles.myMessage
            : styles.theirMessage,
          { padding: message.message_type === "image" ? 2 : 15 },
        ]}
      >
        {message.message_type === "text" ? (
          <Text style={styles.messageText}>{message.content}</Text>
        ) : null}
        {message.message_type === "image" ? (
          <View style={{ width: "70%" }}>
            <Image
              source={{ uri: message.media_url }}
              style={[styles.imageMessage]}
            />
            {message.content !== "" ? (
              <Text style={{ color: "#EEEEEE" }}>{message.content}</Text>
            ) : null}
          </View>
        ) : null}
      </TouchableOpacity>
      {visibleOptions === message.id ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent:
              message.sender_id === user.id ? "flex-end" : "flex-start",
          }}
        >
          <View style={styles.optionsContainer}>
            <Feather
              name="copy"
              onPress={() => handleCopyMessage(message.content)}
              size={24}
              color="#ccc"
            />
            {message.sender_id === user.id ? (
              <MaterialIcons
                name="delete-outline"
                onPress={() => handleDeleteMessage(message.id)}
                size={24}
                color="#ccc"
              />
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  messageContainer: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#b151e8",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#39323b",
  },
  messageText: {
    color: "#fff",
    fontSize: 13.5,
  },
  imageMessage: {
    width: "100%",
    aspectRatio: 16 / 9,
    resizeMode: "cover",
    borderRadius: 10,
  },
  postImage: {
    width: "70%",
    aspectRatio: 3 / 3.5,
    resizeMode: "stretch",
    borderRadius: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    width: "20%",
    margin: 10,
    gap: 10,
  },
});
