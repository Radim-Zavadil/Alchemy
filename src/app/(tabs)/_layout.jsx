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
  const tabBarHeight = Platform.OS === "ios" ? 92 : 74;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: tabBarHeight,
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <LinearGradient
            // Fades from transparent at the very top to solid black where the icons start
            colors={[
              "transparent", 
              "rgba(0,0,0,0.4)", 
              "rgba(0,0,0,0.95)", 
              "rgba(0,0,0,1)"
            ]}
            // 0.0 is the top of the container (-40px above the tab bar). 
            // By 0.4 (roughly where the tab bar actually begins), it becomes fully solid black.
            locations={[0, 0.15, 0.35, 0.4]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -40, // Pulls the gradient up to start fading out *above* the actual tab bar
              bottom: 0,
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
            paddingBottom: Platform.OS === "ios" ? insets.bottom + 8 : 8, 
          },
        }}
      />
    </Tabs>
  );
}