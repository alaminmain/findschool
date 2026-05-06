import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initSentry, wrap } from "@/observability/sentry";
import { FilterProvider } from "@/state/filters";
import { LibraryProvider } from "@/state/library";
import { I18nProvider, useT } from "@/i18n";
import { colors } from "@/theme";

initSentry();

function StackWithTitles() {
  const t = useT();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.brand },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700", fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("appTitle") }} />
      <Stack.Screen
        name="school/[eiin]"
        options={{ title: t("schoolDetailsTitle"), headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="filters"
        options={{
          title: t("filtersTitle"),
          presentation: "modal",
          headerBackTitle: "Cancel",
        }}
      />
      <Stack.Screen
        name="library"
        options={{ title: t("libraryTitle"), headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: t("settingsTitle"), headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="map"
        options={{ title: t("mapTitle"), headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="about"
        options={{ title: t("aboutTitle"), headerBackTitle: "Back" }}
      />
    </Stack>
  );
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <I18nProvider>
        <LibraryProvider>
          <FilterProvider>
            <StackWithTitles />
          </FilterProvider>
        </LibraryProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}

export default wrap(RootLayout);
