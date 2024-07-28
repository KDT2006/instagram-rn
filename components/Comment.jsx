import { Alert, Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { supabase } from "../supabase";
import { MaterialIcons } from "@expo/vector-icons";

const Comment = ({ comment, user_id }) => {
  const deleteComment = async () => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id)
      .eq("user_id", user_id);

    if (error) {
      console.error(error);
      Alert.alert(
        "Error Occurred!",
        "Unable to delete comment, please try again later"
      );
    }
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        marginVertical: 10,
      }}
    >
      <Image
        source={{ uri: comment.user_id.avatar_url }}
        style={{
          width: 35,
          aspectRatio: 1 / 1,
          borderRadius: 25,
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
        <View>
          <Text style={{ color: "#fff", fontWeight: "500", fontSize: 11 }}>
            {comment.user_id.username}
          </Text>
          <Text style={{ color: "#fff", fontSize: 13 }}>{comment.content}</Text>
        </View>
        {comment.user_id.id === user_id ? (
          <MaterialIcons
            name="delete-outline"
            onPress={() => deleteComment()}
            size={20}
            color="#ccc"
          />
        ) : null}
      </View>
    </View>
  );
};

export default Comment;

const styles = StyleSheet.create({});
