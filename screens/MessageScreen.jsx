import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Message from "../components/Message";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

const MessageScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const convo_id = route.params.convo_id;

  const fetchConvoAndUser = async () => {
    setLoading(true);
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
    setLoading(false);
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

  const uploadMedia = async () => {
    try {
      const userId = (await supabase.auth.getUser()).data.user.id;
      const base64 = await FileSystem.readAsStringAsync(image.uri, {
        encoding: "base64",
      });
      const filePath = `${userId}/${convo_id}/${image.fileName}`;
      contentType = image.mimeType;

      const { data, error } = await supabase.storage
        .from("conversations")
        .upload(filePath, decode(base64), {
          contentType,
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Upload error: ", error);
      Alert.alert("Upload Error occurred!", error.message);
      setLoading(false);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!image && newMessage.trim() === "") return;

    setLoading(true);

    // Check if its an image type
    if (image) {
      // Upload image to supabase storage
      const response = await uploadMedia();
      if (response) {
        // Proceed with sending the message with media

        // Get the public URL of the uploaded image
        const { data: url_data } = supabase.storage
          .from("conversations")
          .getPublicUrl(response.path);

        // INSERT data into messages table
        const { error } = await supabase.from("messages").insert({
          conversation_id: convo_id,
          sender_id: user.id,
          content: newMessage,
          message_type: "image",
          media_url: url_data.publicUrl,
          file_path: response.path,
        });

        setLoading(false);

        if (error) {
          console.log("Unable to send message: ", error);
          Alert.alert(
            "Error occurred!",
            "Unable to send message: " + error.message
          );
        }

        setImage(null);
        newMessage ? setNewMessage(null) : null;
      }
    } else {
      setLoading(true);
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
      setLoading(false);

      if (error) {
        console.error("Error sending message: ", error);
        Alert.alert(
          "Error Occurred!",
          "Error sending message: " + error.message
        );
      } else {
        setNewMessage("");
      }
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.2,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  if (loading) {
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
  } else if (!messages || messages.length === 0) {
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
        renderItem={({ item }) => <Message message={item} user={user} />}
      />
      {image ? (
        <Image
          source={{ uri: image.uri }}
          style={{ width: "100%", aspectRatio: 16 / 9 }}
        />
      ) : null}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          multiline
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          {newMessage === "" ? (
            <TouchableOpacity onPress={pickImage}>
              <Ionicons name="document" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={sendMessage}>
            <FontAwesome name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
