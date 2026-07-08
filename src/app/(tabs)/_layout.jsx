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
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: Platform.OS === "ios" ? 92 : 74,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={[
              "rgba(0,0,0,1)",
              "rgba(0,0,0,0.96)",
              "rgba(0,0,0,1)",
              "rgba(0,0,0,0.45)",
              "transparent",
            ]}
            locations={[0, 0.25, 0.55, 0.8, 1]}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 0.5, y: 0 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: -40,
            }}
          />
        ),
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#7a7a85",
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
          fontWeight: "500",
          opacity: 0.85,
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
          tabBarStyle: { 
            display: 'none',
            paddingBottom:
              Platform.OS === "ios"
                  ? insets.bottom + 8
                  : 8, },
        }}
      />

    </Tabs>
  );
}
