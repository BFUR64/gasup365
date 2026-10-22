import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PixelScene } from '../components/PixelScene';
import { PixelButton } from '../components/ui/PixelButton';
import { PixelIcon } from '../components/ui/PixelIcon';
import { PixelInput } from '../components/ui/PixelInput';
import { auth, db } from '../firebaseservices/firebase';
import { colors, palette } from '../theme/colors';
import { pixel } from '../theme/pixel';
import { shadow, type } from '../theme/tokens';

type AuthMode = 'login' | 'signup';

const EMAIL_PATTERN = /.+@.+\..+/;

// "Game title screen" log in / sign up (DESIGN-002 §7.2).
export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const nameOk = !isSignup || name.trim().length > 0;
  const emailOk = EMAIL_PATTERN.test(email.trim());
  const passwordOk = password.length >= 6;
  const canSubmit = nameOk && emailOk && passwordOk;
  const blocker = !nameOk
    ? 'Add your name to continue.'
    : !emailOk
      ? 'Add your email to continue.'
      : !passwordOk
        ? 'Password needs at least 6 characters.'
        : '';

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      if (isSignup) {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = name.trim();

        await updateProfile(credential.user, { displayName });
        await setDoc(doc(db, 'users', credential.user.uid), {
          displayName,
          email: credential.user.email,
          createdAt: serverTimestamp(),
          points: 0,
          updates: 0,
          role: 'Community Member',
        });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <View style={styles.screen}>
      <PixelScene />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingTop: isSignup ? 60 : 96 }]}>
          <View style={styles.brand}>
            <Image source={require('../../assets/images/Gasup.png')} style={styles.logo} accessibilityLabel="GasUp365" />
            <Text style={[type.displaySm, styles.tagline]}>Find better fuel stops, faster.</Text>
          </View>

          <View style={[pixel.panel, styles.panel, { marginTop: isSignup ? 123 : 159 }]}>
            <View accessibilityRole="tablist" style={styles.tabs}>
              {(['login', 'signup'] as AuthMode[]).map((tab, index) => {
                const on = tab === mode;
                return (
                  <Pressable
                    key={tab}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                    onPress={() => switchMode(tab)}
                    style={[styles.tab, index > 0 && styles.tabDivider, on && styles.tabOn]}
                  >
                    <Text style={[type.displaySm, { color: on ? colors.onAction : colors.textMuted }]}>
                      {tab === 'login' ? 'Log in' : 'Sign up'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View>
              <Text accessibilityRole="header" style={[type.displayLg, { color: colors.text }]}>
                {isSignup ? 'Create your account' : 'Welcome back'}
              </Text>
              <Text style={[type.bodyMd, { color: colors.textMuted }]}>
                {isSignup ? 'Track fuel prices in one place.' : 'Sign in to continue.'}
              </Text>
            </View>

            {isSignup ? (
              <Field label="Full name">
                <PixelInput placeholder="Aira Santos" autoCapitalize="words" autoComplete="name" value={name} onChangeText={setName} />
              </Field>
            ) : null}

            <Field label="Email">
              <PixelInput
                placeholder="you@email.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </Field>

            <Field label="Password" helper="At least 6 characters">
              <View>
                <PixelInput
                  placeholder="Your password"
                  autoCapitalize="none"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleSubmit}
                  inputStyle={styles.passwordInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eye}
                >
                  <PixelIcon name="eye" size={24} />
                </Pressable>
              </View>
            </Field>

            <View style={styles.submit}>
              <PixelButton
                label={isSignup ? 'Create account' : 'Log in'}
                icon="navigate"
                disabled={!canSubmit}
                loading={isSubmitting}
                onPress={handleSubmit}
              />
              {blocker ? <Text style={[type.caption, styles.helper]}>{blocker}</Text> : null}
            </View>

            {error ? (
              <View accessibilityRole="alert" style={styles.error}>
                <PixelIcon name="warning" size={20} color={colors.danger} />
                <Text style={[type.bodyStrong, styles.errorText]}>{error}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const Field: React.FC<{ label: string; helper?: string; children: React.ReactNode }> = ({ label, helper, children }) => (
  <View style={styles.field}>
    <Text style={[type.tag, { color: colors.text }]}>{label}</Text>
    {children}
    {helper ? <Text style={[type.caption, { color: colors.textMuted }]}>{helper}</Text> : null}
  </View>
);

const getAuthMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code.includes('email-already-in-use')) return 'That email is already registered.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Email or password is incorrect.';
  if (code.includes('weak-password')) return 'Use at least 6 characters for your password.';
  if (code.includes('network-request-failed')) return 'No connection. Check your internet and try again.';
  return 'Unable to continue. Please try again.';
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.grass400 },
  flex: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 32, alignItems: 'center' },
  brand: { alignItems: 'center', gap: 10 },
  logo: { width: 312, height: 75 },
  tagline: { color: colors.surfaceTint, backgroundColor: colors.outline, paddingHorizontal: 10, paddingVertical: 4 },
  panel: { width: '100%', maxWidth: 420, padding: 16, gap: 14 },
  tabs: { flexDirection: 'row', borderWidth: 2, borderColor: colors.outline, backgroundColor: colors.surfaceSunken },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  tabDivider: { borderLeftWidth: 2, borderLeftColor: colors.outline },
  tabOn: { backgroundColor: colors.action, boxShadow: shadow.primaryFlat },
  field: { gap: 4 },
  passwordInput: { paddingRight: 56 },
  eye: { position: 'absolute', right: 2, top: 2, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  submit: { gap: 6 },
  helper: { color: colors.textMuted, textAlign: 'center' },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: colors.danger,
    backgroundColor: palette.white,
  },
  errorText: { flex: 1, color: colors.danger },
});
