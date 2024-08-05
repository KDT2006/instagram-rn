import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import { supabase } from "../supabase";
import { Video } from "expo-av";

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ profiles: [], posts: [] });

  const dummyPFP =
    "https://w7.pngwing.com/pngs/505/761/png-transparent-login-computer-icons-avatar-icon-monochrome-black-silhouette-thumbnail.png";

  const search = async (query) => {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", `%${query}%`);

    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .ilike("caption", `%${query}%`);

    if (profilesError || postsError) {
      console.error("Error searching:", profilesError || postsError);
      return { profiles: [], posts: [] };
    }

    return { profiles, posts };
  };

  const handleSearch = async () => {
    const { profiles, posts } = await search(query);
    setResults({ profiles, posts });
  };

  const renderProfileItem = ({ item }) => (
    <Pressable
      style={styles.profileContainer}
      onPress={async () => {
        const user = (await supabase.auth.getUser()).data.user;
        if (user.id === item.id) {
          // User's own profile
          navigation.navigate("Profile");
        } else {
          // Others' profile
          navigation.navigate("profile", {
            userID: item.id,
          });
        }
      }}
    >
      <Image
        source={{ uri: item.avatar_url || dummyPFP }}
        style={styles.profileImage}
      />
      <Text style={styles.username}>{item.username}</Text>
    </Pressable>
  );

  const renderPostItem = ({ item }) => (
    <Pressable
      style={styles.postContainer}
      onPress={() => navigation.navigate("post", { post_id: item.id })}
    >
      {item.media_type === "image" ? (
        <Image source={{ uri: item.media }} style={styles.postImage} />
      ) : item.media_type === "video" ? (
        <Video
          style={{ width: 100, height: 100 }}
          source={{
            uri: item.media,
          }}
          resizeMode="contain"
        />
      ) : null}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users or posts..."
        placeholderTextColor="#ccc"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      <Text style={styles.sectionHeader}>Users</Text>
      {results.profiles.length === 0 ? (
        <Text style={styles.fallbackText}>Search to view users</Text>
      ) : (
        <FlatList
          data={results.profiles}
          keyExtractor={(item) => item.id}
          renderItem={renderProfileItem}
          numColumns={3}
        />
      )}
      <Text style={styles.sectionHeader}>Posts</Text>
      {results.posts.length === 0 ? (
        <Text style={styles.fallbackText}>Search to view posts</Text>
      ) : (
        <FlatList
          data={results.posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostItem}
          numColumns={3}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  searchInput: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    color: "#EEEEEE",
  },
  profileContainer: {
    marginHorizontal: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  username: {
    fontSize: 12,
    textAlign: "center",
    color: "#EEEEEE",
  },
  postContainer: {
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 25,
    overflow: "hidden",
  },
  postImage: {
    width: 100,
    height: 100,
    resizeMode: "cover",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    marginVertical: 20,
    color: "#EEEEEE",
  },
  fallbackText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#EEEEEE",
    margin: 20,
  },
});

export default SearchScreen;
