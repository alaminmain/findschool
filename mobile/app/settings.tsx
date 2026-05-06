import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { useI18n, type LocalePref } from "@/i18n";
import { colors, radius, spacing } from "@/theme";

export default function SettingsScreen() {
  const { pref, setPref, t } = useI18n();

  const options: { key: LocalePref; label: string }[] = [
    { key: "system", label: t("langSystemDefault") },
    { key: "en", label: t("langEnglish") },
    { key: "bn", label: t("langBangla") },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.cardTitle}>{t("language")}</Text>
      <View style={styles.card}>
        {options.map((o, i) => {
          const active = pref === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => setPref(o.key)}
              android_ripple={{ color: colors.ripple }}
              style={({ pressed }) => [
                styles.row,
                i > 0 && styles.rowDivider,
                active && styles.rowActive,
                pressed && { opacity: 0.7 },
              ]}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={o.label}
            >
              <Text style={[styles.label, active && styles.labelActive]}>
                {o.label}
              </Text>
              {active ? <Text style={styles.check}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push("/about" as Href)}
        android_ripple={{ color: colors.ripple }}
        style={({ pressed }) => [
          styles.aboutBtn,
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("a11yOpenAbout")}
      >
        <Text style={styles.aboutBtnTxt}>{t("aboutTitle")} ›</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowActive: {
    backgroundColor: colors.brandTint,
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  labelActive: {
    color: colors.brandDark,
    fontWeight: "700",
  },
  check: {
    fontSize: 16,
    color: colors.brand,
    fontWeight: "700",
  },
  aboutBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  aboutBtnTxt: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
