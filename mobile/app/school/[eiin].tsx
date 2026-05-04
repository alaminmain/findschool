import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { openDatabase } from "@/db/bootstrap";
import type { School } from "@/db/queries";
import { colors, radius, spacing, levelStyle, initialOf } from "@/theme";

export default function SchoolDetail() {
  const { eiin } = useLocalSearchParams<{ eiin: string }>();
  const [school, setSchool] = useState<School | null>(null);

  useEffect(() => {
    (async () => {
      const db = await openDatabase();
      const row = await db.getFirstAsync<School>(
        `SELECT eiin, name, name_bn, level, address, division, district, upazila,
                latitude, longitude
         FROM Schools WHERE eiin = ?`,
        [eiin]
      );
      setSchool(row ?? null);
    })();
  }, [eiin]);

  if (!school) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  const hasCoords = school.latitude != null && school.longitude != null;
  const lvl = levelStyle(school.level);

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
          <View style={styles.chip}>
            <Text style={styles.chipTxt}>EIIN {school.eiin}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Location</Text>
        {school.address ? (
          <InfoRow label="Address" value={school.address} />
        ) : null}
        <InfoRow label="Upazila" value={school.upazila} />
        <InfoRow label="District" value={school.district} />
        <InfoRow label="Division" value={school.division} />
      </View>

      {hasCoords ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>On the map</Text>
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
          >
            <Text style={styles.ctaText}>Get Directions</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.secondaryBtn,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onShare}
      >
        <Text style={styles.secondaryBtnTxt}>Share school details</Text>
      </Pressable>
    </ScrollView>
  );
}

const InfoRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  ) : null;

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
});
