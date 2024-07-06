import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Text,
} from "react-native";
import { supabase } from "../supabase";

const AuthScreen = () => {
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
      Alert.alert("Sign In Error", error.message);
    }
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
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
          <Text style={{ color: "#fff", fontWeight: "semibold" }}>Sign in</Text>
        </Pressable>
        <Pressable onPress={signUpWithEmail} style={styles.button}>
          <Text style={{ color: "#fff", fontWeight: "semibold" }}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#222831",
    flex: 1,
    justifyContent: "center",
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
});

export default AuthScreen;
