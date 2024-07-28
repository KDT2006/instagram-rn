import {
  ActivityIndicator,
  Alert,
  FlatList,
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
  const [userID, setUserID] = useState("");

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

  const postNewComment = async () => {
    if (newComment === "") {
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: currentPostID,
      user_id: userID,
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

  useEffect(() => {
    fetchPosts().then(() => setLoading(false));
    supabase.auth.getUser().then((u) => setUserID(u.data.user.id));
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
            newComment={newComment}
          />
        )}
      />
      <GestureHandlerRootView>
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
                    <Comment comment={item} user_id={userID} key={index} />
                  )}
                />
              )}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  alignSelf: "center",
                  marginTop: 10
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
    height: "50%",
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
