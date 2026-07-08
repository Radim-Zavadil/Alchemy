import { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  Animated,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Application from "expo-application";
import { supabase } from "@/utils/supabase";

export default function MeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const HEADER_HEIGHT = insets.top + 52;

  const loadUser = useCallback(async () => {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      router.replace("/onboarding");
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Profile",
      "Are you sure you want to permanently delete your profile? This action cannot be undone and all your data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase.rpc("delete_user_account");
              if (error) throw error;
              await supabase.auth.signOut();
              router.replace("/onboarding");
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to delete account."
              );
            }
          },
        },
      ]
    );
  };

  const handleContactUs = () => {
    Linking.openURL("mailto:support@yourapp.com");
  };

  const handleRateApp = () => {
    Linking.openURL(
      "https://apps.apple.com/app/idYOUR_APP_ID?action=write-review"
    );
  };

  const CARD_RADIUS = 26;
  const CARD_BG = "#181818";

  const MenuItem = ({
    label,
    value,
    onPress,
    showChevron = true,
    isLast = false,
    destructive = false,
  }) => (
    <View style={{ width: "100%" }}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 15,
          paddingHorizontal: 20,
          backgroundColor:
            pressed && onPress ? "rgba(255,255,255,0.04)" : "transparent",
        })}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              color: destructive ? "#FF453A" : "#ffffff",
              fontWeight: "400",
            }}
          >
            {label}
          </Text>
        </View>

        {value && (
          <Text
            style={{
              fontSize: 15,
              color: "#636366",
              marginRight: showChevron ? 6 : 0,
            }}
          >
            {value}
          </Text>
        )}

        {showChevron && onPress && (
          <Text style={{ color: "#3A3A3C", fontSize: 18, lineHeight: 22 }}>
            ›
          </Text>
        )}
      </Pressable>

      {!isLast && (
        <View
          style={{
            height: 0.5,
            backgroundColor: "#2C2C2E",
            marginLeft: 20,
          }}
        />
      )}
    </View>
  );

  const SectionLabel = ({ title }) => (
    <Text
      style={{
        fontSize: 12,
        color: "#636366",
        marginBottom: 8,
        marginLeft: 6,
        fontWeight: "600",
        letterSpacing: 0.8,
        textTransform: "uppercase",
      }}
    >
      {title}
    </Text>
  );

  const appVersion = Application.nativeApplicationVersion ?? "1.0.0";
  const buildNumber = Application.nativeBuildVersion ?? "1";

  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <StatusBar style="light" />

      {/* ── Sticky Header ── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        {/* Title bar */}
        <View
          style={{
            height: HEADER_HEIGHT,
            backgroundColor: "#000000",
            justifyContent: "flex-end",
            paddingBottom: 4,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Me
          </Text>
        </View>

        {/* Gradient shadow — always present, bleeds 60pt below header */}
        <LinearGradient
          colors={["#000000", "transparent"]}
          style={{
            position: "absolute",
            bottom: -60,
            left: 0,
            right: 0,
            height: 60,
          }}
          pointerEvents="none"
        />
      </View>

      {/* ── Scrollable Content ── */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 20,
          paddingBottom: insets.bottom + 120,
          paddingHorizontal: 16,
        }}
      >
        {/* Account */}
        <SectionLabel title="Account" />
        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <MenuItem
            label="Name"
            value={
              user?.user_metadata?.full_name ||
              user?.email?.split("@")[0] ||
              "Guest"
            }
            showChevron={false}
          />
          <MenuItem
            label="Email"
            value={user?.email || "No email"}
            showChevron={false}
            isLast
          />
        </View>

        {/* Library */}
        <SectionLabel title="Library" />
        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <MenuItem
            label="Add Quotes"
            onPress={() => router.push("/me/add-quotes")}
            isLast
          />
        </View>

        {/* Support */}
        <SectionLabel title="Support" />
        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <MenuItem label="Contact Us" onPress={handleContactUs} />
          <MenuItem label="Rate 5 Stars" onPress={handleRateApp} isLast />
        </View>

        {/* Legal */}
        <SectionLabel title="Legal" />
        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            marginBottom: 24,
          }}
        >
          <MenuItem
            label="Data & Privacy"
            onPress={() => router.push("/me/data-privacy")}
          />
          <MenuItem
            label="Terms of Service"
            onPress={() => router.push("/me/terms")}
          />
          <MenuItem
            label="Privacy Policy"
            onPress={() => router.push("/me/privacy")}
            isLast
          />
        </View>

        {/* Delete Profile */}
        <SectionLabel title="Delete Account" />
        <View
          style={{
            backgroundColor: CARD_BG,
            borderRadius: CARD_RADIUS,
            overflow: "hidden",
            marginBottom: 32,
          }}
        >
          <MenuItem
            label="Delete Profile"
            destructive
            onPress={handleDeleteAccount}
            showChevron={false}
            isLast
          />
        </View>

        {/* Version */}
        <Text
          style={{
            fontSize: 13,
            color: "#3A3A3C",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Version {appVersion} ({buildNumber})
        </Text>
      </Animated.ScrollView>

      {/* ── Floating Sign Out ── */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 70,
          left: 16,
          right: 16,
          zIndex: 10,
        }}
      >
        <BlurView
          intensity={80}
          tint="dark"
          style={{ borderRadius: 26, overflow: "hidden" }}
        >
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 18,
              height: 52,
              backgroundColor: pressed
                ? "rgba(255,255,255,0.05)"
                : "rgba(47,43,40,0.15)",
            })}
          >
            <LogOut size={20} color="#828385" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: "#828385" }}>
              Sign out
            </Text>
          </Pressable>
        </BlurView>
      </View>
    </View>
  );
}