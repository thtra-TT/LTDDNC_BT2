import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/index";
import RegisterScreen from "../screens/register";
import ForgotPasswordScreen from "../screens/forgot-password";
// import HomeScreen from "../screens/home";
import WelcomeScreen from "../screens/welcome";

import TabNavigator from "./TabNavigator";

// profile
// import ProfileScreen from "../screens/profile/ProfileScreen";
import EditInfoScreen from "../screens/profile/EditInfoScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";
import ChangeEmailScreen from "../screens/profile/ChangeEmailScreen";

import BookDetailScreen from "../screens/BookDetail";
import SearchResultScreen from "../screens/SearchResultScreen";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      <Stack.Screen name="MainTabs" component={TabNavigator} />

      {/*profile */}
      <Stack.Screen name="EditInfo" component={EditInfoScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />

      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="SearchResult" component={SearchResultScreen} />

    </Stack.Navigator>
  );
}
