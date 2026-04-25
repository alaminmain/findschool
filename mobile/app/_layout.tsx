import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initSentry, wrap } from "@/observability/sentry";

initSentry();

function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0E7C3A" },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Find School" }} />
        <Stack.Screen name="school/[eiin]" options={{ title: "School" }} />
      </Stack>
    </SafeAreaProvider>
  );
}

export default wrap(RootLayout);
