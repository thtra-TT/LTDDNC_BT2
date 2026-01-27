import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { logout, selectUser } from '../../store/slices/authSlice';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

export default function WelcomeScreen() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon chào mừng */}
        <Text style={styles.emoji}>🎉</Text>

        <Text style={styles.title}>Chào mừng!</Text>
        <Text style={styles.subtitle}>Đăng nhập thành công</Text>

        {user?.username && (
          <View style={styles.infoBox}>
            <Text style={styles.label}>Xin chào,</Text>
            <Text style={styles.username}>{user.username}</Text>
          </View>
        )}

        {user?.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📧 Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.message}>
          Bạn đã đăng nhập thành công vào ứng dụng. Chúc bạn có trải nghiệm tuyệt vời!
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius * 1.2,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
    ...SHADOWS.large,
  },
  emoji: {
    fontSize: 64,
    marginBottom: SIZES.margin,
  },
  title: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SIZES.margin * 0.5,
  },
  subtitle: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray,
    marginBottom: SIZES.margin * 1.5,
  },
  infoBox: {
    backgroundColor: COLORS.infoBg,
    borderRadius: SIZES.radius * 0.8,
    padding: SIZES.padding,
    width: '100%',
    alignItems: 'center',
    marginBottom: SIZES.margin,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
  },
  username: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.secondary,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.margin * 0.5,
  },
  infoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    marginRight: SIZES.margin * 0.5,
  },
  infoValue: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: FONTS.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: SIZES.margin * 1.25,
  },
  message: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.margin * 1.5,
  },
  button: {
    backgroundColor: COLORS.danger,
    paddingVertical: SIZES.padding * 0.7,
    paddingHorizontal: SIZES.padding * 1.5,
    borderRadius: SIZES.radius * 0.6,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.bold,
  },
});
