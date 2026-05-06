import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { getDbMetadata, type DbMetadata } from "@/db/queries";
import { useT } from "@/i18n";
import { colors, radius, spacing } from "@/theme";

const SUPPORT_EMAIL = "hello@findschool.app";

export default function AboutScreen() {
  const t = useT();
  const [meta, setMeta] = useState<DbMetadata | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDbMetadata().then((m) => {
      if (!cancelled) setMeta(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const version = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.dataAsOf}>
          {meta?.dataAsOf
            ? t("dataAsOf", { date: meta.dataAsOf })
            : t("dataAsOfUnknown")}
        </Text>
        {meta?.rowCount != null ? (
          <Text style={styles.metaLine}>
            {t("aboutRowCount", { n: meta.rowCount.toLocaleString() })}
          </Text>
        ) : null}
        {meta?.geocodedCount != null ? (
          <Text style={styles.metaLine}>
            {t("aboutGeocoded", { n: meta.geocodedCount.toLocaleString() })}
          </Text>
        ) : null}
      </View>

      <Text style={styles.body}>{t("aboutBlurb")}</Text>

      <Text style={styles.cardTitle}>{t("aboutSourcesTitle")}</Text>
      <Text style={styles.body}>{t("aboutSources")}</Text>

      <Text style={styles.cardTitle}>{t("aboutFreshnessTitle")}</Text>
      <Text style={styles.body}>{t("aboutFreshness")}</Text>

      <Text style={styles.cardTitle}>{t("aboutContact")}</Text>
      <Pressable
        onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
        accessibilityRole="link"
        accessibilityLabel={t("aboutContactEmail")}
      >
        <Text style={styles.link}>{t("aboutContactEmail")}</Text>
      </Pressable>

      <Text style={styles.versionLine}>
        {t("appVersion", { v: version })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  headerCard: {
    backgroundColor: colors.brandTint,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  dataAsOf: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.brandDark,
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  link: {
    fontSize: 14,
    color: colors.brand,
    textDecorationLine: "underline",
  },
  versionLine: {
    marginTop: spacing.xl,
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: "center",
  },
});
