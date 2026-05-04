import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initSentry, wrap } from "@/observability/sentry";
import { colors } from "@/theme";

initSentry();

function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.brand },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "700", fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Find School BD" }} />
        <Stack.Screen
          name="school/[eiin]"
          options={{ title: "School details", headerBackTitle: "Back" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

export default wrap(RootLayout);
