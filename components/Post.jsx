import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather, Ionicons, AntDesign, FontAwesome } from "@expo/vector-icons";
import { supabase } from "../supabase";

const Post = ({ post }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  // console.log(post.image);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      const { data, error } = await supabase
        .from("user_likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", post.id);

      if (error) {
        console.error("Error fetching like status:", error);
      } else {
        setIsLiked(data.length > 0);
      }
    };

    const fetchSaveStatus = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      const { data, error } = await supabase
        .from("user_saves")
        .select("*")
        .eq("user_id", user.id)
        .eq("post_id", post.id);

      if (error) {
        console.error("Error fetching save status:", error);
      } else {
        setIsSaved(data.length > 0);
      }
    };

    fetchLikeStatus();
    fetchSaveStatus();
  }, []);

  const handleLike = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      const { data, error } = await supabase
        .from("user_likes")
        .insert([{ user_id: user.id, post_id: post.id }])
        .select();

      if (error) {
        console.error("Error liking post:", error);
        Alert.alert("Error Occurred!", "Unable to Like Post. " + error.message);
        setIsLiked(!newLikedState);
      } else {
        console.log("Post liked:", data);
      }
    } else {
      // User unliked the post, remove from user_likes table
      const { data, error } = await supabase
        .from("user_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id)
        .select();

      if (error) {
        console.error("Error unliking post:", error);
        Alert.alert(
          "Error Occurred!",
          "Unable to Unlike Post. " + error.message
        );
        setIsLiked(!newLikedState); // Revert state if there was an error
      } else {
        console.log("Post unliked:", data);
      }
    }
  };

  const handleSave = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    if (newSavedState) {
      const { error } = await supabase
        .from("user_saves")
        .insert([{ user_id: user.id, post_id: post.id }]);

      if (error) {
        console.error("Error saving post:", error);
      } else {
        console.log("Post saved");
      }
    } else {
      const { error } = await supabase
        .from("user_saves")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id);

      if (error) {
        console.error("Error unsaving post:", error);
      } else {
        console.log("Post unsaved");
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingBottom: 20 }}>
      <View style={styles.header}>
        <Image
          style={styles.avatar}
          source={{
            uri:
              post.user.avatar_url ||
              "https://w7.pngwing.com/pngs/505/761/png-transparent-login-computer-icons-avatar-icon-monochrome-black-silhouette-thumbnail.png",
          }}
        />
        <Text style={{ color: "#EEEEEE" }}>{post.user.username}</Text>
      </View>
      <Image
        source={{ uri: post.image }}
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
          <Pressable onPress={handleLike}>
            <AntDesign
              name={isLiked ? "heart" : "hearto"}
              size={25}
              color="#EEEEEE"
            />
          </Pressable>
          <Ionicons name="chatbubble-outline" size={25} color="#EEEEEE" />
          <Feather name="send" size={25} color="#EEEEEE" />
        </View>
        <Pressable onPress={handleSave}>
          <FontAwesome
            name={isSaved ? "bookmark" : "bookmark-o"}
            size={25}
            color="#EEEEEE"
          />
        </Pressable>
      </View>
      <View style={{ paddingHorizontal: 10 }}>
        <Text numberOfLines={1} style={styles.caption}>
          {post.caption}
        </Text>
      </View>
    </View>
  );
};

export default Post;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    backgroundColor: "#141414",
    padding: 5,
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  caption: {
    color: "#ccc9",
  },
});
