import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";

import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const Icons = {
  Clear: "sunny",
  Clouds: "cloudy",
  Rain: "rainy",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Drizzle: "day-rain",
  Thunderstorm: "lightning",
};
export default function App() {
  const [city, setCity] = useState("loading...");
  const [address, setAddress] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const API_KEY = "f79ff78b6d115afb2c171b3d1759d92e";
  const [days, setDays] = useState([]);

  const ask = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("유저가 요청을 거절했습니다.");
      return;
    }
    let location = await Location.getCurrentPositionAsync({ accuracy: 5 });
    setLocation(location);

    const address = await Location.reverseGeocodeAsync(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      {
        useGoogleMaps: false,
      }
    );

    setAddress(address);
    setCity(address[0].region);

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${API_KEY}`
    );
    const json = await res.json();
    setDays(
      json.list.filter((weather) => {
        if (weather.dt_txt.includes("03:00:00")) {
          return weather;
        }
      })
    );

    console.log(json);
  };

  useEffect(() => {
    ask();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator
              color={"white"}
              size={"large"}
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          <>
            {days.map((day, i) => (
              <View key={i} style={styles.day}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.temp}>
                    {(day.main.temp - 273).toFixed(1)}
                  </Text>
                  <Ionicons
                    name={Icons[day.weather[0].main]}
                    size={68}
                    color="white"
                  />
                </View>

                <Text style={styles.description}>{day.weather[0].main}</Text>
                <Text style={styles.tinyText}>
                  {day.weather[0].description}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "skyblue",
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 68,
    fontWeight: "600",
  },

  weather: {},
  day: {
    width: SCREEN_WIDTH,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: "left",
  },
  temp: {
    marginTop: 50,
    fontSize: 130,
  },
  description: {
    marginTop: -30,
    fontSize: 60,
  },
  tinyText: {
    fontSize: 20,
  },
});
