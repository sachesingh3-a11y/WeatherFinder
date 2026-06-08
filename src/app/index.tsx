import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ==========================================
// 1. WMO WEATHER CODE MAPPING (Level 1)
// ==========================================
const getWeatherDetails = (code: number) => {
  const mapping: { [key: number]: { label: string; emoji: string } } = {
    0: { label: "Cerah", emoji: "☀️" },
    1: { label: "Berawan Sebagian", emoji: "🌤️" },
    2: { label: "Berawan", emoji: "⛅" },
    3: { label: "Mendung", emoji: "☁️" },
    45: { label: "Kabut", emoji: "🌫️" },
    48: { label: "Kabut Rime", emoji: "🌫️" },
    51: { label: "Gerimis Ringan", emoji: "🌦️" },
    53: { label: "Gerimis Sedang", emoji: "🌧️" },
    55: { label: "Gerimis Lebat", emoji: "🌧️" },
    61: { label: "Hujan Ringan", emoji: "💧" },
    63: { label: "Hujan Sedang", emoji: "🌧️" },
    65: { label: "Hujan Lebat", emoji: "⛈️" },
    71: { label: "Salju Ringan", emoji: "🌨️" },
    80: { label: "Hujan Pancaroba Ringan", emoji: "🌦️" },
    95: { label: "Badai Petir", emoji: "⚡" },
  };
  return mapping[code] || { label: "Cuaca Tidak Diketahui", emoji: "🌍" };
};

// ==========================================
// 2. WIND DIRECTION HELPER (Level 2)
// ==========================================
const getWindDirection = (degree: number) => {
  const directions = ["U", "TL", "T", "TG", "S", "BD", "B", "BL"];
  return directions[Math.round(degree / 45) % 8];
};

export default function App() {
  // States
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  // Animation Ref (Level 3 Bonus)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ==========================================
  // 3. DEBOUNCE IMPLEMENTATION (Level 1)
  // ==========================================
  useEffect(() => {
    if (!searchInput.trim()) {
      setDebouncedQuery("");
      setWeatherData(null);
      setError(null);
      return;
    }

    const handler = setTimeout(() => {
      setDebouncedQuery(searchInput);
    }, 500); // 500ms Debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchInput]);

  // ==========================================
  // 4. FETCH 2-STEP WITH ABORT CONTROLLER (Level 1)
  // ==========================================
  const fetchWeather = async (query: string, signal: AbortSignal) => {
    if (!query) return;

    setLoading(true);
    setError(null);

    try {
      // Langkah 1: Geocoding API
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        query,
      )}&count=1&language=id`;
      const geoResponse = await fetch(geoUrl, { signal });
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        setError("Kota tidak ditemukan. Coba nama kota lain.");
        setWeatherData(null);
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Langkah 2: Forecast API (Termasuk current_weather & is_day)
      const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`;
      const forecastResponse = await fetch(forecastUrl, { signal });
      const forecastData = await forecastResponse.json();

      if (!forecastData.current_weather) {
        setError("Gagal memuat data cuaca untuk kota ini.");
        setWeatherData(null);
        setLoading(false);
        return;
      }

      // Set data ke state
      setWeatherData({
        cityName: name,
        country: country,
        temperature: forecastData.current_weather.temperature,
        weathercode: forecastData.current_weather.weathercode,
        windspeed: forecastData.current_weather.windspeed,
        winddirection: forecastData.current_weather.winddirection,
        isDay: forecastData.current_weather.is_day, // 1 = Siang, 0 = Malam
      });

      // Trigger Fade-in Animation
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Terjadi kesalahan jaringan. Periksa koneksi internet Anda.");
        setWeatherData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    if (debouncedQuery) {
      fetchWeather(debouncedQuery, controller.signal);
    }

    return () => {
      controller.abort(); // Cleanup & cancel previous pending request
    };
  }, [debouncedQuery]);

  // ==========================================
  // 5. REFRESH BUTTON HANDLER (Level 2)
  // ==========================================
  const handleRefresh = () => {
    if (debouncedQuery) {
      const controller = new AbortController();
      fetchWeather(debouncedQuery, controller.signal);
    }
  };

  // UI Helpers untuk Status IsDay (Level 2)
  const isDaytime = weatherData?.isDay === 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Title */}
        <Text style={styles.title}>
          Weather<Text style={styles.goldText}>Finder</Text>
        </Text>
        <Text style={styles.subtitle}>Informasi Cuaca Real-Time & Akurat</Text>

        {/* TextInput Section (Level 1 Controlled Component) */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ketik nama kota (misal: Medan, Jakarta)..."
            placeholderTextColor="#888"
            value={searchInput}
            onChangeText={setSearchInput}
          />
        </View>

        {/* 4 KONDISI UI STATUS */}

        {/* KONDISI 1: KOSONG / HINT */}
        {!searchInput && !loading && !weatherData && !error && (
          <View style={styles.centerInfo}>
            <Text style={styles.hintText}>
              🔍 Silakan ketik nama kota untuk memulai pencarian.
            </Text>
          </View>
        )}

        {/* KONDISI 2: LOADING */}
        {loading && (
          <View style={styles.centerInfo}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>
              Mencari lokasi & data cuaca...
            </Text>
          </View>
        )}

        {/* KONDISI 3: ERROR */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* KONDISI 4: SUKSES (KARTU CUACA DENGAN ANIMASI FADE-IN) */}
        {weatherData && !loading && !error && (
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                backgroundColor: isDaytime ? "#1E2530" : "#121620",
              },
            ]}
          >
            {/* Tag Siang / Malam - Level 2 Indikator */}
            <View
              style={[
                styles.dayNightBadge,
                { backgroundColor: isDaytime ? "#D4AF37" : "#3A4454" },
              ]}
            >
              <Text style={styles.dayNightText}>
                {isDaytime ? "☀️ SIANG" : "🌙 MALAM"}
              </Text>
            </View>

            <Text style={styles.cityName}>{weatherData.cityName}</Text>
            <Text style={styles.countryName}>{weatherData.country}</Text>

            <View style={styles.weatherConditionContainer}>
              <Text style={styles.weatherEmoji}>
                {getWeatherDetails(weatherData.weathercode).emoji}
              </Text>
              <Text style={styles.weatherLabel}>
                {getWeatherDetails(weatherData.weathercode).label}
              </Text>
            </View>

            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>

            {/* Level 2 Fitur: Arah & Kecepatan Angin */}
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <View style={styles.detailBox}>
                <Text style={styles.detailTitle}>💨 Kec. Angin</Text>
                <Text style={styles.detailValue}>
                  {weatherData.windspeed} km/h
                </Text>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailTitle}>🧭 Arah Angin</Text>
                <Text style={styles.detailValue}>
                  {weatherData.winddirection}° (
                  {getWindDirection(weatherData.winddirection)})
                </Text>
              </View>
            </View>

            {/* Level 2 Fitur: Tombol Refresh */}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshButtonText}>🔄 Perbarui Data</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F121A", // Dark mode premium
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 20,
    letterSpacing: 1,
  },
  goldText: {
    color: "#D4AF37", // Aksen Emas Luxury
  },
  subtitle: {
    fontSize: 14,
    color: "#AAA",
    marginBottom: 25,
    marginTop: 5,
  },
  searchContainer: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1A1F2C",
    color: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2A3347",
  },
  centerInfo: {
    marginTop: 50,
    alignItems: "center",
  },
  hintText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
  },
  loadingText: {
    color: "#D4AF37",
    marginTop: 12,
    fontSize: 15,
  },
  errorContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#3A1616",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#8A2525",
    width: "100%",
  },
  errorText: {
    color: "#FF8A8A",
    textAlign: "center",
    fontSize: 14,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A3347",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginTop: 10,
  },
  dayNightBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginBottom: -10,
  },
  dayNightText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  cityName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 10,
  },
  countryName: {
    fontSize: 14,
    color: "#AAA",
    marginBottom: 15,
  },
  weatherConditionContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  weatherEmoji: {
    fontSize: 64,
  },
  weatherLabel: {
    fontSize: 18,
    color: "#D4AF37",
    fontWeight: "600",
    marginTop: 5,
  },
  temperature: {
    fontSize: 48,
    fontWeight: "300",
    color: "#FFF",
    marginVertical: 10,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#2A3347",
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  detailBox: {
    flex: 1,
    alignItems: "center",
  },
  detailTitle: {
    fontSize: 13,
    color: "#AAA",
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFF",
  },
  refreshButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D4AF37",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },
  refreshButtonText: {
    color: "#D4AF37",
    fontWeight: "600",
    fontSize: 14,
  },
});
