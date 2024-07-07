import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import NewPostScreen from "./screens/NewPostScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import ProfileScreen from "./screens/ProfileScreen";
import { useEffect, useState } from "react";
import AuthScreen from "./screens/AuthScreen";
import { supabase } from "./supabase";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStackNavigator = () => {
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
            <Ionicons name="chatbubble-outline" size={24} color="#EEEEEE" />
          ),
          headerStyle: {
            backgroundColor: "#000",
          },
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

const MainTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "black",
        tabBarShowLabel: false,
        headerShown: false,
        tabBarActiveBackgroundColor: "#222831",
        tabBarInactiveBackgroundColor: "#000",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          headerTitle: "Feed",
          headerTitleAlign: "center",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name="home"
              size={26}
              color={focused ? "#EEEEEE" : "#ccc"}
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
              color={focused ? "#EEEEEE" : "#ccc"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome
              name="user"
              size={26}
              color={focused ? "#EEEEEE" : "#ccc"}
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
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
