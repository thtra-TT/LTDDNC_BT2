import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./navigation/AppNavigator";
import { useEffect } from "react";
import { initSearchHistoryTable } from "./services/searchHistory";
import { initRecentlyViewedTable } from "./services/recentlyViewed";

export default function App() {

  useEffect(() => {
    initSearchHistoryTable();
  }, []);

  useEffect(() => {
    initRecentlyViewedTable();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
