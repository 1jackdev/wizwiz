import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { ColorScheme } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.body}>
        Password reset isn't available yet. Contact support to reset your password.
      </Text>

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.link}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.bg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    color: colors.textMuted,
    marginBottom: 32,
    lineHeight: 22,
  },
  link: {
    color: colors.accent,
    textAlign: 'center',
    fontSize: 14,
  },
});
