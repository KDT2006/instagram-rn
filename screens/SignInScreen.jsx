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
import { StatusBar } from "expo-status-bar";

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("signin error: ", error);
      Alert.alert("Sign In Error", error.message);
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.logo}>𝓘𝓷𝓼𝓽𝓪𝓰𝓻𝓪𝓶𝓡𝓝</Text>
      <View style={styles.inputContainer}>
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
        <Pressable onPress={signInWithEmail} style={styles.button}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("signup")}
          style={styles.link}
        >
          <Text style={styles.linkText}>Don't have an account? Sign up</Text>
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

export default SignInScreen;
