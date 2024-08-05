import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Text,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../supabase";

const SignUpScreen = ({ navigation }) => {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullname,
          username: username
        },
      },
    });

    if (error) {
      console.error("signup error: ", error);
      Alert.alert("Sign Up Error", error.message);
    } else if (!session) {
      Alert.alert(
        "Verification Required",
        "Please check your inbox for email verification!"
      );
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>𝓘𝓷𝓼𝓽𝓪𝓰𝓻𝓪𝓶𝓡𝓝</Text>
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={(text) => setFullname(text)}
          value={fullname}
          placeholder="Full Name"
          autoCapitalize={"none"}
          style={styles.input}
          placeholderTextColor="#EEEEEE"
        />
        <TextInput
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Username"
          autoCapitalize={"none"}
          style={styles.input}
          placeholderTextColor="#EEEEEE"
        />
        <TextInput
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email"
          autoCapitalize={"none"}
          style={styles.input}
          placeholderTextColor="#EEEEEE"
        />
        <TextInput
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
          style={styles.input}
          placeholderTextColor="#EEEEEE"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Pressable onPress={signUpWithEmail} style={styles.button}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign up</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("signin")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#000",
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    color: "#EEEEEE",
    fontSize: 30,
    textAlign: "center",
  },
  inputContainer: {
    padding: 10,
    marginVertical: 20,
    gap: 15,
  },
  input: {
    padding: 10,
    color: "#EEEEEE",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 15,
  },
  buttonContainer: {
    alignItems: "center",
    gap: 10,
  },
  button: {
    width: "90%",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#758694",
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "semibold",
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: "#EEEEEE",
  },
});

export default SignUpScreen;
