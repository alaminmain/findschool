import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, router, type Href } from "expo-router";
import { getSchoolsByEiins, type School } from "@/db/queries";
import { useLibrary } from "@/state/library";
import { useT } from "@/i18n";
import { SchoolRow, ROW_H } from "@/components/SchoolRow";
import { colors, radius, spacing } from "@/theme";

type Tab = "favorites" | "recents";

export default function LibraryScreen() {
  const lib = useLibrary();
  const t = useT();
  const [tab, setTab] = useState<Tab>("favorites");
  const [items, setItems] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  const eiins = useMemo(
    () => (tab === "favorites" ? Array.from(lib.favorites) : [...lib.recents]),
    [tab, lib.favorites, lib.recents]
  );

  useEffect(() => {
    let cancelled = false;
    if (!lib.ready) return;
    setLoading(true);
    (async () => {
      const rows = await getSchoolsByEiins(eiins);
      if (cancelled) return;
      setItems(rows);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [eiins, lib.ready]);

  const isEmpty = !loading && items.length === 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/settings" as Href)}
              hitSlop={12}
              style={styles.gearBtn}
              accessibilityRole="button"
              accessibilityLabel={t("settingsTitle")}
            >
              <Text style={styles.gearIcon}>⚙</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.tabs}>
        <TabBtn
          label={t("tabFavorites")}
          count={lib.favorites.size}
          active={tab === "favorites"}
          onPress={() => setTab("favorites")}
        />
        <TabBtn
          label={t("tabRecents")}
          count={lib.recents.length}
          active={tab === "recents"}
          onPress={() => setTab("recents")}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand} />
        </View>
      ) : isEmpty ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {tab === "favorites" ? t("noFavoritesTitle") : t("noRecentsTitle")}
          </Text>
          <Text style={styles.emptyText}>
            {tab === "favorites" ? t("noFavoritesText") : t("noRecentsText")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(s) => s.eiin}
          renderItem={({ item }) => <SchoolRow item={item} />}
          getItemLayout={(_, index) => ({
            length: ROW_H,
            offset: ROW_H * index,
            index,
          })}
          ListFooterComponent={
            tab === "recents" && items.length > 0 ? (
              <ClearBtn
                onPress={lib.clearRecents}
                label={t("clearRecents")}
              />
            ) : tab === "favorites" && items.length > 0 ? (
              <ClearBtn
                onPress={lib.clearFavorites}
                label={t("removeAllFavorites")}
              />
            ) : null
          }
        />
      )}
    </View>
  );
}

function TabBtn({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        active && styles.tabActive,
        pressed && { opacity: 0.7 },
      ]}
      android_ripple={{ color: colors.ripple }}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={t("a11yTab", {
        label,
        n: count,
        schools:
          count === 1 ? t("schoolLabelOne") : t("schoolLabelMany"),
      })}
    >
      <Text style={[styles.tabTxt, active && styles.tabTxtActive]}>
        {label}
        {count > 0 ? `  ${count}` : ""}
      </Text>
    </Pressable>
  );
}

function ClearBtn({
  onPress,
  label,
}: {
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.clearBtn, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.clearTxt}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.brand,
  },
  tabTxt: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  tabTxtActive: {
    color: colors.brandDark,
  },
  empty: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  clearBtn: {
    margin: spacing.lg,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  clearTxt: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  gearBtn: { paddingHorizontal: 6 },
  gearIcon: { fontSize: 22, color: "#fff" },
});
