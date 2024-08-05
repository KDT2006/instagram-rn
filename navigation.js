import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import NewPostScreen from "./screens/NewPostScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import ProfileScreen from "./screens/ProfileScreen";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Text, View } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import SettingsScreen from "./screens/SettingsScreen";
import AddChatScreen from "./screens/AddChat";
import ChatsScreen from "./screens/ChatsScreen";
import MessageScreen from "./screens/MessageScreen";
import PostScreen from "./screens/PostScreen";
import UpdateProfileScreen from "./screens/UpdateProfileScreen";
import SearchScreen from "./screens/SearchScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="signin" component={SignInScreen} />
      <Stack.Screen name="signup" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

const HomeStackNavigator = ({ navigation }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{
          headerShown: true,
          headerTitle: (props) => (
            <View style={{ flex: 1 }}>
              <Text {...props} style={{ color: "#EEEEEE", fontSize: 23 }}>
                𝓘𝓷𝓼𝓽𝓪𝓰𝓻𝓪𝓶𝓡𝓝
              </Text>
            </View>
          ),
          headerRight: (props) => (
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color="#EEEEEE"
              onPress={() => navigation.navigate("chat")}
            />
          ),
          headerStyle: {
            backgroundColor: "#000",
          },
        }}
      />
      <Stack.Screen
        name="chat"
        component={ChatsScreen}
        options={{
          animation: "slide_from_right",
          headerShown: true,
          headerTitle: "Chat",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerRight: () => (
            <AntDesign
              name="plus"
              onPress={() => navigation.navigate("addChat")}
              size={24}
              color="#EEEEEE"
            />
          ),
        }}
      />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen
        name="message"
        component={MessageScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
        }}
      />
      <Stack.Screen
        name="post"
        component={PostScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerTitle: "Post",
        }}
      />
      <Stack.Screen
        name="addChat"
        component={AddChatScreen}
        options={{
          headerShown: true,
          headerTitle: "Add Chat",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
        }}
      />
    </Stack.Navigator>
  );
};

const SearchStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="search"
        component={SearchScreen}
        options={{
          title: "Search",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen
        name="post"
        component={PostScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerTitle: "Post",
        }}
      />
    </Stack.Navigator>
  );
};

const NewPostStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="newpost"
        component={NewPostScreen}
        options={{
          title: "New Post",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="profile" component={ProfileScreen} />
      <Stack.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          animation: "slide_from_right",
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="post"
        component={PostScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerTitle: "Post",
        }}
      />
      <Stack.Screen
        name="updateProfile"
        component={UpdateProfileScreen}
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000",
          },
          headerTintColor: "#EEEEEE",
          headerTitle: "Update Profile",
        }}
      />
    </Stack.Navigator>
  );
};

const MainTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveBackgroundColor: "#000",
        tabBarInactiveBackgroundColor: "#000",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <Feather
              name="home"
              size={25}
              color={focused ? "#EEEEEE" : "gray"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AntDesign
              name="search1"
              size={26}
              color={focused ? "#EEEEEE" : "gray"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="NewPost"
        component={NewPostStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name="plus-square-o"
              size={26}
              color={focused ? "#EEEEEE" : "gray"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="user"
              size={26}
              color={focused ? "#EEEEEE" : "gray"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const [session, setSession] = useState(supabase.auth.getSession());

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session && session.user ? (
          <Stack.Screen name="Main" component={MainTabsNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
