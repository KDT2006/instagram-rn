import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Chat from "../components/Chat";

const ChatScreen = () => {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);

  const fetchChats = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    setUser(user);
    const { data, error } = await supabase
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
      console.log("Error occurred while fetching chats: ", error);
      Alert.alert("Error Occurred!", `Unable to fetch chats: ${error}`);
    } else {
      console.log(data);
      setChats(data);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        renderItem={({ item, index }) => (
          <Chat key={index} chat={item} user={user} />
        )}
        contentContainerStyle={{padding: 10}}
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
