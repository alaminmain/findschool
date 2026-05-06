import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import * as Clipboard from "expo-clipboard";
import { getSchoolByEiin, type School } from "@/db/queries";
import { useLibrary } from "@/state/library";
import { useT } from "@/i18n";
import { colors, radius, spacing, levelStyle, initialOf } from "@/theme";

const REPORT_EMAIL = "hello@findschool.app";

export default function SchoolDetail() {
  const { eiin } = useLocalSearchParams<{ eiin: string }>();
  const [school, setSchool] = useState<School | null>(null);
  const library = useLibrary();
  const t = useT();
  const isFav = eiin ? library.isFavorite(eiin) : false;

  useEffect(() => {
    if (!eiin) return;
    let cancelled = false;
    getSchoolByEiin(eiin).then((row) => {
      if (!cancelled) setSchool(row);
    });
    return () => {
      cancelled = true;
    };
  }, [eiin]);

  // Record visit only after we've confirmed the school exists in the DB.
  useEffect(() => {
    if (school?.eiin) library.recordRecent(school.eiin);
  }, [school?.eiin, library]);

  if (!school) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  const hasCoords = school.latitude != null && school.longitude != null;
  const lvl = levelStyle(school.level);
  const addressLine = [
    school.address,
    school.upazila,
    school.district,
    school.division,
  ]
    .filter(Boolean)
    .join(", ");

  const openDirections = () => {
    if (!hasCoords) return;
    const lat = school.latitude!;
    const lng = school.longitude!;
    const label = encodeURIComponent(school.name);
    const url = Platform.select({
      ios: `maps://?daddr=${lat},${lng}&q=${label}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    })!;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      );
    });
  };

  const openAddressInMaps = () => {
    if (!addressLine) return;
    const q = encodeURIComponent(addressLine);
    const url = Platform.select({
      ios: `maps://?q=${q}`,
      android: `geo:0,0?q=${q}`,
      default: `https://www.google.com/maps/search/?api=1&query=${q}`,
    })!;
    Linking.openURL(url).catch(() => {
      Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${q}`
      );
    });
  };

  const flash = useCallback((msg: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
  }, []);

  const copy = async (value: string, label: string) => {
    try {
      await Clipboard.setStringAsync(value);
      flash(t("copied", { label }));
    } catch {
      flash(t("copyFailed"));
    }
  };

  const onShare = () => {
    const lines = [
      school.name,
      school.name_bn,
      `EIIN: ${school.eiin}`,
      school.level,
      school.address,
      `${school.upazila}, ${school.district}, ${school.division}`,
    ].filter(Boolean);
    Share.share({ message: lines.join("\n") }).catch(() => {});
  };

  const onReport = () => {
    const subject = encodeURIComponent(
      t("reportSubject", { name: school.name, eiin: school.eiin })
    );
    const body = encodeURIComponent(
      t("reportBody", {
        name: school.name,
        eiin: school.eiin,
        address: addressLine,
      })
    );
    const url = `mailto:${REPORT_EMAIL}?subject=${subject}&body=${body}`;
    Linking.openURL(url).catch(() => flash(t("noMailApp")));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => library.toggleFavorite(school.eiin)}
              hitSlop={12}
              style={styles.favBtn}
              accessibilityRole="button"
              accessibilityLabel={
                isFav ? t("a11yRemoveFavorite") : t("a11yAddFavorite")
              }
              accessibilityState={{ selected: isFav }}
            >
              <Text style={styles.favIcon}>{isFav ? "★" : "☆"}</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.hero}>
        <View style={styles.heroAvatar}>
          <Text style={styles.heroAvatarTxt}>
            {initialOf(school.name || school.name_bn)}
          </Text>
        </View>
        <Text style={styles.name}>{school.name}</Text>
        {school.name_bn ? (
          <Text style={styles.nameBn}>{school.name_bn}</Text>
        ) : null}
        <View style={styles.heroChips}>
          {school.level ? (
            <View style={[styles.chip, { backgroundColor: lvl.bg }]}>
              <Text style={[styles.chipTxt, { color: lvl.fg }]}>
                {school.level}
              </Text>
            </View>
          ) : null}
          <Pressable
            onPress={() => copy(school.eiin, "EIIN")}
            android_ripple={{ color: colors.ripple }}
            style={styles.chip}
            accessibilityRole="button"
            accessibilityLabel={t("a11yEiinCopy", { eiin: school.eiin })}
          >
            <Text style={styles.chipTxt}>EIIN {school.eiin}  ⧉</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t("cardLocation")}</Text>
        {school.address ? (
          <InfoRow
            label={t("rowAddress")}
            value={school.address}
            onCopy={() => copy(addressLine, t("rowAddress"))}
          />
        ) : null}
        <InfoRow label={t("rowUpazila")} value={school.upazila} />
        <InfoRow label={t("rowDistrict")} value={school.district} />
        <InfoRow label={t("rowDivision")} value={school.division} />
      </View>

      {school.total_teachers != null || school.total_students != null ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("cardStats")}</Text>
          <View style={styles.statsRow}>
            {school.total_students != null ? (
              <View style={styles.statsCell}>
                <Text style={styles.statsNum}>
                  {school.total_students.toLocaleString()}
                </Text>
                <Text style={styles.statsLabel}>{t("totalStudents")}</Text>
              </View>
            ) : null}
            {school.total_teachers != null ? (
              <View style={styles.statsCell}>
                <Text style={styles.statsNum}>
                  {school.total_teachers.toLocaleString()}
                </Text>
                <Text style={styles.statsLabel}>{t("totalTeachers")}</Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : null}

      {school.phone || school.email || school.website ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("cardContact")}</Text>
          {school.phone ? (
            <Pressable
              style={({ pressed }) => [
                styles.contactRow,
                pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.ripple }}
              onPress={() =>
                Linking.openURL(`tel:${school.phone}`).catch(() =>
                  flash(t("callFailed"))
                )
              }
              accessibilityRole="button"
              accessibilityLabel={t("a11yCallSchool")}
            >
              <Text style={styles.contactLabel}>{t("callSchool")}</Text>
              <Text style={styles.contactValue}>{school.phone}</Text>
            </Pressable>
          ) : null}
          {school.email ? (
            <Pressable
              style={({ pressed }) => [
                styles.contactRow,
                pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.ripple }}
              onPress={() =>
                Linking.openURL(`mailto:${school.email}`).catch(() =>
                  flash(t("noMailApp"))
                )
              }
              accessibilityRole="button"
              accessibilityLabel={t("a11yEmailSchool")}
            >
              <Text style={styles.contactLabel}>{t("emailSchool")}</Text>
              <Text style={styles.contactValue}>{school.email}</Text>
            </Pressable>
          ) : null}
          {school.website ? (
            <Pressable
              style={({ pressed }) => [
                styles.contactRow,
                pressed && { opacity: 0.7 },
              ]}
              android_ripple={{ color: colors.ripple }}
              onPress={() =>
                Linking.openURL(
                  school.website!.startsWith("http")
                    ? school.website!
                    : `https://${school.website}`
                ).catch(() => {})
              }
              accessibilityRole="link"
              accessibilityLabel={t("a11yVisitWebsite")}
            >
              <Text style={styles.contactLabel}>{t("visitWebsite")}</Text>
              <Text style={styles.contactValue}>{school.website}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {hasCoords ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("cardOnTheMap")}</Text>
          <View style={styles.mapWrap}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: school.latitude!,
                longitude: school.longitude!,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: school.latitude!,
                  longitude: school.longitude!,
                }}
                title={school.name}
                description={school.address}
              />
            </MapView>
          </View>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={openDirections}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
            accessibilityRole="button"
            accessibilityLabel={t("a11yGetDirections")}
          >
            <Text style={styles.ctaText}>{t("getDirections")}</Text>
          </Pressable>
        </View>
      ) : addressLine ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("cardOnTheMap")}</Text>
          <Text style={styles.noCoords}>{t("noCoordsBlurb")}</Text>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={openAddressInMaps}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
            accessibilityRole="button"
            accessibilityLabel={t("a11yOpenAddress")}
          >
            <Text style={styles.ctaText}>{t("openAddressInMaps")}</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.secondaryBtn,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onShare}
        accessibilityRole="button"
        accessibilityLabel={t("a11yShareSchool")}
      >
        <Text style={styles.secondaryBtnTxt}>{t("shareSchool")}</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.reportBtn,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onReport}
        accessibilityRole="link"
        accessibilityLabel={t("a11yReportIncorrect")}
      >
        <Text style={styles.reportBtnTxt}>{t("reportIncorrect")}</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value?: string | null;
  onCopy?: () => void;
}) {
  const t = useT();
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      {onCopy ? (
        <Pressable
          onPress={onCopy}
          style={styles.infoValueWrap}
          android_ripple={{ color: colors.ripple }}
          accessibilityRole="button"
          accessibilityLabel={t("a11yRowCopy", { label, value })}
        >
          <Text style={styles.infoValue}>{value}</Text>
          <Text style={styles.copyHint}>{t("tapToCopy")}</Text>
        </Pressable>
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  heroAvatarTxt: {
    color: colors.brandDark,
    fontSize: 26,
    fontWeight: "700",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  nameBn: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  heroChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: "#F3F4F6",
  },
  chipTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  infoLabel: {
    width: 88,
    fontSize: 13,
    color: colors.textTertiary,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  mapWrap: {
    height: 220,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  map: { flex: 1 },
  cta: {
    backgroundColor: colors.brand,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: radius.md,
  },
  ctaPressed: { backgroundColor: colors.brandDark },
  ctaText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  secondaryBtnTxt: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
  reportBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingVertical: 10,
    alignItems: "center",
  },
  reportBtnTxt: {
    color: colors.textTertiary,
    fontSize: 13,
    textDecorationLine: "underline",
  },
  noCoords: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  infoValueWrap: {
    flex: 1,
  },
  copyHint: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  favBtn: {
    paddingHorizontal: 6,
  },
  favIcon: {
    fontSize: 24,
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  statsCell: {
    flex: 1,
    backgroundColor: colors.brandTint,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  statsNum: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.brandDark,
    fontVariant: ["tabular-nums"],
  },
  statsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  contactLabel: {
    width: 88,
    fontSize: 13,
    color: colors.textTertiary,
  },
  contactValue: {
    flex: 1,
    fontSize: 14,
    color: colors.brand,
    fontWeight: "500",
  },
});
