import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import type { School } from "@/db/queries";
import { colors, levelStyle, initialOf, radius, spacing } from "@/theme";

export const ROW_H = 88;

export const SchoolRow = memo(function SchoolRow({ item }: { item: School }) {
  const lvl = levelStyle(item.level);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push(`/school/${item.eiin}`)}
      android_ripple={{ color: colors.ripple }}
      accessibilityRole="button"
      accessibilityLabel={`${item.name || item.name_bn}, ${item.upazila}${
        item.district ? `, ${item.district}` : ""
      }${item.level ? `, ${item.level}` : ""}`}
      accessibilityHint="Opens school details"
    >
      <View style={styles.avatar}>
        <Text
          style={styles.avatarTxt}
          accessibilityElementsHidden
          importantForAccessibility="no"
        >
          {initialOf(item.name || item.name_bn)}
        </Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || item.name_bn}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.upazila}
          {item.district ? `, ${item.district}` : ""}
        </Text>
        <View style={styles.rowFoot}>
          {item.level ? (
            <View style={[styles.badge, { backgroundColor: lvl.bg }]}>
              <Text
                style={[styles.badgeTxt, { color: lvl.fg }]}
                numberOfLines={1}
              >
                {item.level}
              </Text>
            </View>
          ) : null}
          <Text style={styles.eiin}>EIIN {item.eiin}</Text>
        </View>
      </View>
      <Text
        style={styles.chevron}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        ›
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    height: ROW_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.brandTint },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarTxt: {
    color: colors.brandDark,
    fontSize: 18,
    fontWeight: "700",
  },
  rowBody: { flex: 1, justifyContent: "center" },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rowFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    maxWidth: 160,
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: "600",
  },
  eiin: {
    fontSize: 11,
    color: colors.textTertiary,
    fontVariant: ["tabular-nums"],
  },
  chevron: {
    fontSize: 24,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
});
