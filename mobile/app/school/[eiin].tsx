import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { openDatabase } from "@/db/bootstrap";
import type { School } from "@/db/queries";

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
        <ActivityIndicator />
      </View>
    );
  }

  const hasCoords = school.latitude != null && school.longitude != null;

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{school.name}</Text>
        {school.name_bn ? <Text style={styles.nameBn}>{school.name_bn}</Text> : null}
        <Text style={styles.meta}>EIIN {school.eiin} · {school.level}</Text>
        <Text style={styles.meta}>{school.address}</Text>
        <Text style={styles.meta}>
          {school.upazila}, {school.district}, {school.division}
        </Text>
      </View>

      {hasCoords ? (
        <>
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
          <Pressable style={styles.cta} onPress={openDirections}>
            <Text style={styles.ctaText}>Get Directions</Text>
          </Pressable>
        </>
      ) : (
        <View style={styles.center}>
          <Text style={styles.meta}>No GPS coordinates on file.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e0e0e0" },
  name: { fontSize: 20, fontWeight: "700", color: "#222", marginBottom: 4 },
  nameBn: { fontSize: 16, color: "#444", marginBottom: 4 },
  meta: { fontSize: 14, color: "#555", marginTop: 2 },
  map: { flex: 1 },
  cta: {
    backgroundColor: "#0E7C3A",
    padding: 16,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
