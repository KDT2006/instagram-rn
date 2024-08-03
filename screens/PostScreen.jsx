import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { React, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Video } from "expo-av";
import { AntDesign, Ionicons, Feather, FontAwesome } from "@expo/vector-icons";
import Comment from "../components/Comment";

const PostScreen = ({ navigation, route }) => {
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState(null);
  const [shareConvos, setShareConvos] = useState([]);
  const [shareVisible, setShareVisible] = useState(false);

  const post_id = route.params.post_id;

  const fetchPost = async () => {
    const { data: postData, error } = await supabase
      .from("posts")
      .select("*, user:profiles(*)")
      .eq("id", post_id)
      .single();
    if (error) {
      console.error(error);
      Alert.alert("Error Occurred!", "Unable to fetch post");
      return;
    }
    console.log(postData);
    setPost(postData);
    setUser((await supabase.auth.getUser()).data.user);
    setLoading(false);
  };

  const fetchLikeStatus = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { count, error } = await supabase
      .from("user_likes")
      .select("*", { count: "estimated", head: true })
      .eq("user_id", user.id)
      .eq("post_id", post_id);

    if (error) {
      console.error("Error fetching like status:", error);
    } else {
      setIsLiked(count > 0);
    }
  };

  const fetchSaveStatus = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { count, error } = await supabase
      .from("user_saves")
      .select("*", { count: "estimated", head: true })
      .eq("user_id", user.id)
      .eq("post_id", post_id);

    if (error) {
      console.error("Error fetching save status:", error);
    } else {
      setIsSaved(count > 0);
    }
  };

  const handleLike = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      const { error } = await supabase
        .from("user_likes")
        .insert([{ user_id: user.id, post_id: post.id }]);

      const { error: err2 } = await supabase
        .from("posts")
        .update({ likes: post.likes + 1 })
        .eq("id", post.id);

      if (error || err2) {
        console.error("Error liking post:", error);
        Alert.alert("Error Occurred!", "Unable to Like Post. " + error.message);
        setIsLiked(!newLikedState);
      } else {
        console.log("Post liked");
      }
    } else {
      // User unliked the post, remove from user_likes table
      const { error } = await supabase
        .from("user_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", post.id);

      const currentLikes = post.likes > 0 ? post.likes - 1 : 0;
      const { error: err2 } = await supabase
        .from("posts")
        .update({ likes: currentLikes })
        .eq("id", post.id);

      if (error || err2) {
        console.error("Error unliking post:", error);
        Alert.alert(
          "Error Occurred!",
          "Unable to Unlike Post. " + error.message
        );
        setIsLiked(!newLikedState); // Revert state if there was an error
      } else {
        console.log("Post unliked");
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

  const handleOpenComments = async () => {
    const { data: fetchedComments, error } = await supabase
      .from("comments")
      .select("*, user_id:profiles(*)")
      .eq("post_id", post_id);

    if (error) {
      console.error(error);
      Alert.alert("Error occurred!", "Unable to fetch comments at the moment.");
      return;
    }

    setComments(fetchedComments);
    setCommentsVisible(true);
  };

  const closeComments = () => {
    setCommentsVisible(false);
    setComments([]);
  };

  const postNewComment = async () => {
    if (newComment === "") {
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: post_id,
      user_id: user.id,
      content: newComment,
    });

    if (error) {
      console.error(error);
      Alert.alert(
        "Error occurred!",
        "Unable to create new comment, please try again."
      );
    }

    setNewComment("");
    Keyboard.dismiss();
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

    console.log("Opening share, convos: ", convos);
    setShareConvos(convos);
    setShareVisible(true);
  };

  const handleCloseShare = async () => {
    setShareVisible(false);
    setShareConvos([]);
  };

  useEffect(() => {
    fetchPost();
    fetchLikeStatus();
    fetchSaveStatus();
  }, [post_id]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#EEEEEE" />
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: "#000" }}>
      <View style={styles.container}>
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
        <View>
          {post.media_type === "image" ? (
            <Image
              source={{ uri: post.media }}
              style={{
                width: "100%",
                aspectRatio: 3 / 3.5,
                resizeMode: "contain",
              }}
            />
          ) : post.media_type === "video" ? (
            <Video
              style={{ width: "100%", aspectRatio: 3 / 3.5 }}
              source={{
                uri:
                  post.media ||
                  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
              }}
              useNativeControls
              resizeMode="contain"
            />
          ) : null}
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 10,
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", gap: 10 }}>
            <AntDesign
              name={isLiked ? "heart" : "hearto"}
              size={25}
              color={isLiked ? "red" : "#EEEEEE"}
              onPress={handleLike}
            />
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
          <Text style={{ color: "#ccc" }}>{post.likes} likes</Text>
          <Text style={{ color: "#ccc9" }}>{post.caption}</Text>
        </View>
      </View>

      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentsVisible}
        onRequestClose={closeComments}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable onPress={closeComments} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
            {!comments || comments.length === 0 ? (
              <Text style={{ color: "#fff", alignSelf: "center" }}>
                No comments here!
              </Text>
            ) : (
              <FlatList
                data={comments}
                renderItem={({ item, index }) => (
                  <Comment comment={item} user_id={user.id} key={index} />
                )}
              />
            )}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                alignSelf: "center",
                marginTop: 10,
              }}
            >
              <TextInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Add a comment..."
                placeholderTextColor="#000"
                style={{
                  backgroundColor: "#EEEEEE",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  color: "#000",
                  flex: 1,
                }}
              />
              <TouchableOpacity onPress={postNewComment}>
                <FontAwesome name="send" size={21} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={shareVisible}
        onRequestClose={handleCloseShare}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable onPress={handleCloseShare} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
            <FlatList
              data={shareConvos}
              numColumns={3}
              renderItem={({ item, index }) => {
                const otherUser =
                  item.user1.id === user.id ? item.user2 : item.user1;
                return (
                  <Pressable
                    onPress={() => handleSendPost(item.id)}
                    key={index}
                    style={{ gap: 5 }}
                  >
                    <Image
                      source={{
                        uri: otherUser.avatar_url,
                      }}
                      style={{
                        width: 80,
                        aspectRatio: 1 / 1,
                        borderRadius: 50,
                      }}
                    />
                    <Text style={{ color: "#fff" }}>{otherUser.full_name}</Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default PostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 5,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingBottom: 5,
    backgroundColor: "#141414",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderTopEndRadius: 25,
    borderTopStartRadius: 25,
  },
  modalContent: {
    width: "100%",
    maxHeight: "80%",
    height: "70%",
    backgroundColor: "#222831",
    borderRadius: 10,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  closeButtonText: {
    color: "#007BFF",
  },
});
