import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { FontAwesome, Feather, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

const MessageScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [visibleOptions, setVisibleOptions] = useState(null);

  const convo_id = route.params.convo_id;

  const fetchConvoAndUser = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    setUser(user);
    const { data: convoData, error: convoError } = await supabase
      .from("conversations")
      .select("*, user1:profiles!user1(*),user2:profiles!user2(*)")
      .eq("id", convo_id)
      .single();
    if (convoError) {
      console.error("Error while fetching convo: ", convoError);
      Alert.alert(
        "Error Occurred!",
        `Error while fetching convo: ${convoError}`
      );
      return;
    }

    console.log("Convo: ", convoData);
    navigation.setOptions({
      headerTitle:
        convoData.user1.id === user.id
          ? convoData.user2.full_name
          : convoData.user1.full_name,
    });

    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convo_id)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error while fetching messages: ", messagesError);
      Alert.alert(
        "Error Occurred!",
        `Error while fetching messages: ${messagesError}`
      );
    } else {
      console.log("Messages: ", messagesData);
      setMessages(messagesData);
    }
  };

  useEffect(() => {
    fetchConvoAndUser();

    const sub = supabase
      .channel("messages-all")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          // console.log("messages table changes, payload:  ", payload);

          switch (payload.eventType) {
            case "INSERT":
              setMessages((currentMessages) => [
                ...currentMessages,
                payload.new,
              ]);
              break;

            case "UPDATE":
              setMessages((currentMessages) =>
                currentMessages.map((msg) =>
                  msg.id === payload.new.id ? payload.new : msg
                )
              );
              break;

            case "DELETE":
              setMessages((currentMessages) =>
                currentMessages.filter((msg) => msg.id !== payload.old.id)
              );
              break;

            default:
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [convo_id]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;

    const { error } = await supabase
      .from("messages")
      .insert([
        {
          conversation_id: convo_id,
          sender_id: user.id,
          content: newMessage,
          message_type: "text",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error sending message: ", error);
      Alert.alert("Error Occurred!", "Error sending message: " + error.message);
    } else {
      setNewMessage("");
    }
  };

  const handleLongPress = (messageId) => {
    setVisibleOptions((prev) => (prev === messageId ? null : messageId));
  };

  const handleCopyMessage = async (message) => {
    await Clipboard.setStringAsync(message);
    setVisibleOptions(null);
  };

  const handleDeleteMessage = async (id) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (error) {
      console.error("Error deleting message: ", error);
      Alert.alert(
        "Error Occurred!",
        "Unable to delete message: " + error.message
      );
    } else {
      setVisibleOptions(null);
    }
  };

  if (!messages) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#EEEEEE" />
      </View>
    );
  } else if (messages.length === 0) {
    return (
      <View
        style={[
          styles.container,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text style={{ color: "#fff", fontSize: 20 }}>Start Chatting!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              onLongPress={() => handleLongPress(item.id)}
              style={[
                styles.messageContainer,
                item.sender_id === user.id
                  ? styles.myMessage
                  : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.content}</Text>
            </TouchableOpacity>
            {visibleOptions === item.id ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent:
                    item.sender_id === user.id ? "flex-end" : "flex-start",
                }}
              >
                <View style={styles.optionsContainer}>
                  <Feather
                    name="copy"
                    onPress={() => handleCopyMessage(item.content)}
                    size={24}
                    color="#ccc"
                  />
                  <MaterialIcons
                    name="delete-outline"
                    onPress={() => handleDeleteMessage(item.id)}
                    size={24}
                    color="#ccc"
                  />
                </View>
              </View>
            ) : null}
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity onPress={sendMessage}>
          <FontAwesome name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  messageContainer: {
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#cf4fe3",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#39323b",
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
    width: "20%",
    margin: 10,
    gap: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    maxHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    color: "#000",
  },
});
