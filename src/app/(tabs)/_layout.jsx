import { Tabs } from "expo-router";
import { View, Image, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BookOpen } from "lucide-react-native";

/**
 * Tab Layout - Bottom navigation for the app
 * Three main sections: Home (feed), Journal (book entries), Me (profile)
 * Board is accessible via Home top-left button, not in tab bar.
 */
export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopWidth: 0,
          position: "absolute",
          bottom: Platform.OS === "ios" ? 28 : 16,
          left: 16,
          right: 16,
          borderRadius: 24,
          height: 64,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.08)",
          paddingBottom: Platform.OS === "ios" ? 0 : 4,
          paddingTop: 4,
        },
        tabBarBackground: () => (
          <View
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <BlurView
              intensity={80}
              tint="dark"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            <LinearGradient
              colors={["rgba(30, 30, 35, 0.4)", "rgba(10, 10, 15, 0.8)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
          </View>
        ),
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#7a7a85",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
          fontFamily: "Inter",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Future",
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require("../../../assets/images/icons/home.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: color,
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: "Review",
          tabBarIcon: ({ color, focused }) => (
            <BookOpen
              color={color}
              size={24}
              strokeWidth={focused ? 2.5 : 2}
              style={{ opacity: focused ? 1 : 0.6 }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require("../../../assets/images/icons/me.png")}
              style={{
                width: 24,
                height: 24,
                tintColor: color,
                opacity: focused ? 1 : 0.6,
              }}
              resizeMode="contain"
            />
          ),
        }}
      />
      {/* Board is navigated to from Home, not shown in tab bar */}
      <Tabs.Screen
        name="board"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />

    </Tabs>
  );
}
