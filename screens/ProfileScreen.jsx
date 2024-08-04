import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../supabase";
import { FontAwesome } from "@expo/vector-icons";
import { Video } from "expo-av";
import * as WebBrowser from "expo-web-browser";

const ProfileScreen = ({ navigation, route }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Profile",
      headerStyle: {
        backgroundColor: "#000",
      },
      headerTintColor: "#EEEEEE",
      headerTitleStyle: {
        fontWeight: "bold",
      },
      headerShown: true,
      headerRight: () => (
        <View>
          {route.params?.userID ? null : (
            <FontAwesome
              name="gear"
              size={25}
              color="#EEEEEE"
              onPress={() => navigation.navigate("settings")}
            />
          )}
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        let userID = route.params?.userID;

        // Fetch authenticated user ID if userID is not provided
        if (!userID) {
          const user = (await supabase.auth.getUser()).data.user;
          userID = user.id;
        }

        let { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userID);

        if (error) {
          throw error;
        } else {
          setUserInfo(data[0]);
        }

        let { data: posts, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", userID);

        if (postsError) {
          throw postsError;
        } else {
          setPosts(posts);
        }

        if (route.params?.userID) {
          const user = (await supabase.auth.getUser()).data.user;
          const { data, error } = await supabase
            .from("follows")
            .select("*")
            .eq("follower_id", user.id)
            .eq("following_id", userID);
          if (error) {
            console.error("Error fetching follow information: ", error);
          } else if (data.length > 0) {
            setFollowing(true);
          }
        }

        console.log(data);
        console.log(posts);

        // Get followers count
        let { count: fetchedFollowersCount, error: errorGetFollowers } =
          await supabase
            .from("follows")
            .select("*", { count: "estimated", head: true })
            .eq("following_id", userID);
        console.log(fetchedFollowersCount);

        if (errorGetFollowers) {
          throw errorGetFollowers;
        } else if (fetchedFollowersCount > 0) {
          setFollowersCount(fetchedFollowersCount);
        }

        // Get following count
        let { count: fetchedFollowingCount, error: errorGetFollowing } =
          await supabase
            .from("follows")
            .select("*", { count: "estimated", head: true })
            .eq("follower_id", userID);

        if (errorGetFollowing) {
          throw errorGetFollowing;
        } else if (followingCount > 0) {
          setFollowingCount(fetchedFollowingCount);
        }
      } catch (e) {
        Alert.alert(
          "Error Occurred!",
          "Unable to fetch user data, please try again."
        );
        console.error(e);
      }
    };

    fetchDetails().finally(() => setLoading(false));
  }, []);

  const dummyPFP =
    "https://w7.pngwing.com/pngs/505/761/png-transparent-login-computer-icons-avatar-icon-monochrome-black-silhouette-thumbnail.png";

  const openWebpage = async () => {
    await WebBrowser.openBrowserAsync("https://google.com");
  };

  const followUser = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", userInfo.id);
      if (error) {
        console.error("Error unfollowing user: ", error);
      } else {
        console.log("User " + userInfo.id + " unfollowed successfully");
        setFollowing(false);
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: userInfo.id });

      if (error) {
        console.error("Error following user: ", error);
      } else {
        console.log("User " + userInfo.id + " followed successfully");
        setFollowing(true);
      }
    }
  };

  const messageUser = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    const { data: convo, error } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(user1.eq.${userInfo.id},user2.eq.${user.id}),and(user1.eq.${user.id},user2.eq.${userInfo.id})`
      );
    if (error) {
      console.error("Error occurred while fetching chat: ", error);
      Alert.alert("Error Occurred!", `Unable to fetch chat: ${error}`);
      return;
    }

    if (convo.length == 1) {
      navigation.navigate("message", { convo_id: convo[0].id });
    } else {
      alert("Add chat with the user to message them"); // TODO: Add chat here using code
    }
  };

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
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="#000" style="light" />

      {/* PFP and Follow Data View */}
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          justifyContent: "space-between",
        }}
      >
        <View>
          <Image
            source={{
              uri: userInfo?.avatar_url ? userInfo.avatar_url : dummyPFP,
            }}
            style={styles.image}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "space-evenly",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <Text style={styles.count}>{posts.length}</Text>
            <Text style={styles.countLabel}>posts</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.count}>{followersCount}</Text>
            <Text style={styles.countLabel}>followers</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.count}>{followingCount}</Text>
            <Text style={styles.countLabel}>following</Text>
          </View>
        </View>
      </View>

      {/* Info View */}
      <View style={{ paddingHorizontal: 10 }}>
        <Text style={{ color: "#EEEEEE", fontWeight: "500", marginBottom: 3 }}>
          {userInfo.full_name}
        </Text>
        <Text
          numberOfLines={1}
          style={{ color: "#EEEEEE", fontWeight: "400", marginBottom: 5 }}
        >
          Website: {""}
          <Text style={{ color: "#758694" }} onPress={openWebpage}>
            {userInfo.website}
          </Text>
        </Text>
        <Text style={{ color: "#EEEEEE", fontWeight: "400" }}>
          Heyy, I'm using InstagramRN!
        </Text>
      </View>

      {/* Follow and Message buttons */}
      {route.params?.userID ? (
        <View style={{ flexDirection: "row" }}>
          <Text
            onPress={followUser}
            style={[
              styles.actionButton,
              {
                backgroundColor: "#56b0aa",
              },
            ]}
          >
            {following ? "Following" : "Follow"}
          </Text>
          <Text
            onPress={messageUser}
            style={[
              styles.actionButton,
              {
                backgroundColor: "#5d6d6e",
              },
            ]}
          >
            Message
          </Text>
        </View>
      ) : null}

      {/* Posts View */}
      <View style={{ paddingHorizontal: 10, marginTop: "8%", flex: 1 }}>
        {posts.length === 0 ? (
          <Text style={{ color: "#EEEEEE", fontSize: 15, textAlign: "center" }}>
            No posts at the moment, create one!
          </Text>
        ) : (
          <FlatList
            data={posts}
            numColumns={3}
            renderItem={({ item, index }) => {
              return (
                <Pressable
                  key={index}
                  style={{ flex: 1 }}
                  onPress={() =>
                    navigation.navigate("post", { post_id: item.id })
                  }
                >
                  <View
                    style={{
                      width: "100%",
                      aspectRatio: 4 / 3.5,
                      borderWidth: 2,
                      padding: 5,
                      borderWidth: 1,
                      borderColor: "#ccc",
                    }}
                  >
                    {item.media_type === "image" ? (
                      <Image
                        source={{ uri: item.media }}
                        style={{
                          width: "100%",
                          height: "100%",
                          resizeMode: "cover",
                        }}
                      />
                    ) : item.media_type === "video" ? (
                      <Video
                        style={{ width: "100%", height: "100%" }}
                        source={{
                          uri: item.media,
                        }}
                        resizeMode="contain"
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {/* Signout button */}
      {route.params?.userID ? null : (
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => supabase.auth.signOut()}
            style={styles.signOutButton}
          >
            <Text style={{ color: "#fff", fontWeight: "semibold" }}>
              Sign out
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#000",
  },
  image: {
    width: 85,
    aspectRatio: 1 / 1,
    borderRadius: 100,
    marginRight: 20,
    marginBottom: 5,
  },
  count: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#EEEEEE",
  },
  countLabel: {
    color: "#EEEEEE",
    fontSize: 15,
  },
  actionButton: {
    paddingHorizontal: 40,
    paddingVertical: 13,
    marginTop: 20,
    marginLeft: 10,
    color: "#EEEEEE",
    borderRadius: 25,
    fontWeight: "500",
  },
  signOutButton: {
    width: "90%",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#758694",
    borderRadius: 25,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    marginTop: "auto",
  },
});
