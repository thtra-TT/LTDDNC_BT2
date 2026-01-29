import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/index";
import RegisterScreen from "../screens/register";
import ForgotPasswordScreen from "../screens/forgot-password";
import HomeScreen from "../screens/home";
import WelcomeScreen from "../screens/welcome";

// profile
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditInfoScreen from "../screens/profile/EditInfoScreen";
import ChangePasswordScreen from "../screens/profile/ChangePasswordScreen";
import ChangeEmailScreen from "../screens/profile/ChangeEmailScreen";

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
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      {/*profile */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditInfo" component={EditInfoScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="ChangeEmail" component={ChangeEmailScreen} />
    </Stack.Navigator>
  );
}
