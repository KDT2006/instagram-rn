import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";

const AddChatScreen = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    // unoptimized
    const user = (await supabase.auth.getUser()).data.user;

    // Step 1: fetch all users
    const { data: allUsers, error: allUsersError } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user.id);
    if (allUsersError) {
      console.error("Error fetching users: ", error);
      Alert.alert("Error Occurred!", `Error fetching users: ${error}`);
    }

    // Step 2: Get existing convos
    const { data: userConvos, error: userConversationsError } = await supabase
      .from("conversations")
      .select("user1,user2")
      .or(`user1.eq.${user.id},user2.eq.${user.id}`);
    if (userConversationsError) {
      console.error(
        "Error fetching user conversations:",
        userConversationsError
      );
      Alert.alert(
        "Error Occurred!",
        `Error fetching user convos: ${userConversationsError}`
      );
      return;
    }

    // Step 3: Extract user IDs from the conversations
    const userIdsInConversations = userConvos.reduce((acc, conversation) => {
      if (conversation.user1 !== user.id) {
        acc.add(conversation.user1);
      }
      if (conversation.user2 !== user.id) {
        acc.add(conversation.user2);
      }
      return acc;
    }, new Set());

    // Step 4: Filter out users who are already in conversations with the current user
    const filteredUsers = allUsers.filter(
      (u) =>
        !userIdsInConversations.has(u.id) && u.id !== user.id
    );

    setUsers(filteredUsers);
    console.log("Filtered users for adding: ", filteredUsers);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startConvo = async (user2_id) => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user1: user.id,
        user2: user2_id,
      })
      .select();

    if (error) {
      console.log("Error starting convo: ", error);
      Alert.alert(
        "Error Occurred!",
        `Error starting convo, please try again later.`
      );
    } else {
      console.log("Convo created: ", data);
      // TODO: navigation logic
    }
  };

  const User = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => startConvo(item.id)}
      >
        <Text style={styles.username}>
          {item.username}: {item.full_name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select User to add to Chat</Text>
      <FlatList
        data={users}
        renderItem={User}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AddChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  heading: {
    fontSize: 18,
    color: "#EEEEEE",
    textAlign: "center",
    padding: 10,
  },
  userItem: {
    padding: 20,
    borderBottomWidth: 1,
    backgroundColor: "#444",
    borderRadius: 10,
    margin: 10,
  },
  username: {
    color: "#EEE",
  },
});
