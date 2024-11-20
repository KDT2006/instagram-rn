import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { Feather, Ionicons, AntDesign, FontAwesome } from "@expo/vector-icons";
import { supabase } from "../supabase";
import VideoWrapper from "./VideoWrapper";

const Post = ({ post, openComments, openShare, navigation }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [userID, setUserID] = useState(null);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    const fetchLikeStatus = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      setUserID(user.id);
      const { count, error } = await supabase
        .from("user_likes")
        .select("*", { count: "estimated", head: true })
        .eq("user_id", user.id)
        .eq("post_id", post.id);

      if (error) {
        console.error("Error fetching like status:", error);
        return;
      }

      setIsLiked(count > 0);

      // Fetch total number of likes for the post
      const { count: totalLikesCount, error: totalLikesError } = await supabase
        .from("user_likes")
        .select("*", { count: "estimated", head: true })
        .eq("post_id", post.id);

      if (totalLikesError) {
        console.error("Error fetching total likes count:", totalLikesError);
        return;
      }

      setTotalLikes(totalLikesCount);
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
        console.error("Error liking post(inserting into user_likes): ", error);
        Alert.alert("Error Occurred!", "Unable to Like Post. " + error.message);
        setIsLiked(!newLikedState);
        return;
      }

      console.log("Post liked:", data);
    } else {
      // User unliked the post, remove from user_likes table
      const { data, error } = await supabase
        .from("user_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id)
        .select();

      if (error) {
        console.error("Error unliking post(deleting from user_likes): ", error);
        Alert.alert(
          "Error Occurred!",
          "Unable to Unlike Post. " + error.message
        );
        setIsLiked(!newLikedState);
        return;
      }

      console.log("Post unliked:", data);
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

  const handleOpenComments = async () => {
    // Fetch comments from supabase and pass it to the HomeScreen for rendering it in a modal
    const { data: fetchedComments, error } = await supabase // not optimized, TODO: Use Pagination
      .from("comments")
      .select("*, user_id:profiles(*)")
      .eq("post_id", post.id);

    if (error) {
      console.error(error);
      Alert.alert("Error occurred!", "Unable to fetch comments at the moment.");
      return;
    }

    // console.log("Fetched comments: ", fetchedComments);
    openComments(fetchedComments, post.id);
  };

  const handleOpenShare = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data: convos, error } = await supabase
      .from("conversations")
      .select(
        `
        *,
        user1:profiles!user1(*),
        user2:profiles!user2(*)
      `
      )
      .or(`user1.eq.${user.id},user2.eq.${user.id}`);

    if (error) {
      console.error(error);
      Alert.alert("Error Occurred!", "Unable to fetch convos to share");
      return;
    }

    // console.log("Fetched convos: ", convos);
    openShare(post.id, convos);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingBottom: 20 }}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            const myself = userID === post.user.id;
            navigation.navigate(
              myself ? "Profile" : "profile",
              myself
                ? null
                : {
                    userID: post.user.id,
                  }
            );
          }}
        >
          <Image
            style={styles.avatar}
            source={{
              uri:
                post.user.avatar_url ||
                "https://w7.pngwing.com/pngs/505/761/png-transparent-login-computer-icons-avatar-icon-monochrome-black-silhouette-thumbnail.png",
            }}
          />
        </Pressable>
        <Text style={{ color: "#EEEEEE" }}>{post.user.username}</Text>
      </View>
      {post.media_type === "image" ? (
        <Image
          source={{ uri: post.media }}
          style={{ width: "100%", aspectRatio: 3 / 3.5, resizeMode: "contain" }}
        />
      ) : post.media_type === "video" ? (
        <VideoWrapper
          media={post.media}
          viewStyle={{ width: "100%", aspectRatio: 3 / 3.5 }}
          allowsFullscreen={true}
          allowsPictureInPicture={true}
        />
      ) : null}
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
              color={isLiked ? "red" : "#EEEEEE"}
            />
          </Pressable>
          <Ionicons
            name="chatbubble-outline"
            size={25}
            color="#EEEEEE"
            onPress={handleOpenComments}
          />
          <Feather
            name="send"
            size={25}
            color="#EEEEEE"
            onPress={handleOpenShare}
          />
        </View>
        <FontAwesome
          name={isSaved ? "bookmark" : "bookmark-o"}
          size={25}
          color="#EEEEEE"
          onPress={handleSave}
        />
      </View>
      <View style={{ paddingHorizontal: 10 }}>
        <Text style={{ color: "#ccc" }}>{totalLikes} likes</Text>
        <Text
          numberOfLines={isTextExpanded ? null : 3}
          style={{ color: "#ccc9" }}
          onPress={() => setIsTextExpanded((prev) => !prev)}
        >
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
});
