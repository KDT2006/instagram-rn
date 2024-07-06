import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./screens/HomeScreen";
import NewPostScreen from "./screens/NewPostScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome } from "@expo/vector-icons";
import ProfileScreen from "./screens/ProfileScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" component={HomeScreen} />
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
            backgroundColor: "#222831",
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

const Navigation = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "black",
          tabBarShowLabel: false,
          headerShown: false,
          tabBarActiveBackgroundColor: "#222831",
          tabBarInactiveBackgroundColor: "#31363F",
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
    </NavigationContainer>
  );
};

export default Navigation;
