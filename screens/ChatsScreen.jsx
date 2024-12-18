import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { supabase } from "../supabase";
import Chat from "../components/Chat";

const ChatsScreen = ({ navigation }) => {
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
      {chats.length === 0 ? (
        <Text style={{ color: "#EEEEEE", fontSize: 18, textAlign: "center" }}>
          No chats, add one to get started
        </Text>
      ) : (
        <FlatList
          data={chats}
          renderItem={({ item, index }) => (
            <Chat key={index} chat={item} user={user} navigation={navigation} />
          )}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </View>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center"
  },
});
