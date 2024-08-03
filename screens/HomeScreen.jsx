import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Post from "../components/Post";
import { supabase } from "../supabase";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import Comment from "../components/Comment";
import { FontAwesome } from "@expo/vector-icons";

const HomeScreen = () => {
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
    let { data, error } = await supabase
      .from("posts")
      .select("*, user:profiles(*)")
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

    setCurrentPostID(null)
    setShareConvos([])
    setShareVisible(false)
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

  return (
    <SafeAreaView style={styles.container}>
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
                renderItem={({ item, index }) => (
                  <Pressable
                    onPress={() => handleSendPost(item.id)}
                    key={index}
                  >
                    <Image
                      source={{
                        uri:
                          user.id === item.user1.id
                            ? item.user2.avatar_url
                            : item.user1.avatar_url,
                      }}
                      style={{
                        width: 80,
                        aspectRatio: 1 / 1,
                        borderRadius: 50,
                      }}
                    />
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>
      </GestureHandlerRootView>
    </SafeAreaView>
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
