import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import Post from "../components/Post";
import { supabase } from "../supabase";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Comment from "../components/Comment";
import { FontAwesome } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

const HomeScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [currentPostID, setCurrentPostID] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [shareVisible, setShareVisible] = useState(false);
  const [shareConvos, setShareConvos] = useState([]);

  const openComments = (fetchedComments, postID) => {
    setComments(fetchedComments);
    setCurrentPostID(postID);
    setModalVisible(true);
  };

  const closeComments = () => {
    setModalVisible(false);
    setComments(null);
    setCurrentPostID(null);
  };

  const openShare = (postID, convos) => {
    setCurrentPostID(postID);
    setShareConvos(convos);
    setShareVisible(true);
  };
  const closeShare = () => {
    setShareVisible(false);
    setCurrentPostID(null);
    setShareConvos([]);
  };

  const postNewComment = async () => {
    if (newComment === "") {
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: currentPostID,
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

  const fetchPosts = async () => {
    // fetch following users' IDs first to view their posts only
    const userID = (await supabase.auth.getUser()).data.user.id;
    let { data: followingData, error: errorFetchFollowers } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userID);

    if (errorFetchFollowers) {
      console.error("Error while fetching followers: ", errorFetchFollowers);
      Alert.alert("Error Occurred!", "Unable to fetch posts, please try again");
      return;
    }

    // followerIDs is an array of objects but we need array of IDs
    // Extract the following IDs into an array
    const followingIDs = followingData.map((entry) => entry.following_id);

    let { data, error } = await supabase
      .from("posts")
      .select("*, user:profiles(*)")
      .in("user_id", followingIDs)
      .order("created_at", { ascending: false });
    if (error) {
      Alert.alert("Error Occurred", error.message);
    }
    setPosts(data);
  };

  const handleSendPost = async (convo_id) => {
    const { error } = await supabase.from("messages").insert({
      conversation_id: convo_id,
      sender_id: user.id,
      message_type: "post",
      post: currentPostID,
    });

    if (error) {
      console.error(error);
      Alert.alert("Error Occurred!", "Unable to share post to user");
    }

    setCurrentPostID(null);
    setShareConvos([]);
    setShareVisible(false);
  };

  useEffect(() => {
    fetchPosts().then(() => setLoading(false));
    supabase.auth.getUser().then((u) => setUser(u.data.user));
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
        }}
      >
        <StatusBar translucent backgroundColor="#000" />
        <ActivityIndicator
          style={{ alignSelf: "center" }}
          size={"large"}
          color={"#EEEEEE"}
        />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#000",
          padding: 20
        }}
      >
        <Text style={{ fontSize: 18, color: "#EEEEEE", textAlign: "center" }}>
          No posts, follow someone to view their posts
        </Text>
      </View>
    );
  }

  const SwipeRight = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => navigation.navigate("chat"))
    .runOnJS(true);

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={SwipeRight}>
        <Animated.View style={styles.container}>
          <StatusBar translucent backgroundColor="#000" />
          <FlatList
            data={posts}
            contentContainerStyle={{ gap: 3 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Post
                key={index}
                post={item}
                openComments={openComments}
                openShare={openShare}
                navigation={navigation}
              />
            )}
          />
          <GestureHandlerRootView>
            {/* Comments Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
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
              onRequestClose={closeShare}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Pressable onPress={closeShare} style={styles.closeButton}>
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
                          <Text style={{ color: "#fff" }}>
                            {otherUser.full_name}
                          </Text>
                        </Pressable>
                      );
                    }}
                  />
                </View>
              </View>
            </Modal>
          </GestureHandlerRootView>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222831",
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

export default HomeScreen;
