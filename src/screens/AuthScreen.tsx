import { Feather } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { auth, db } from '../firebaseservices/firebase';
import { colors } from '../theme/colors';

type AuthMode = 'login' | 'signup';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';
  const title = isSignup ? 'Create your account' : 'Welcome back';
  const subtitle = isSignup ? 'Track fuel prices in one place.' : 'Sign in to continue.';

  const canSubmit = useMemo(() => {
    const hasBaseFields = email.trim().length > 0 && password.length >= 6;
    return isSignup ? hasBaseFields && name.trim().length > 0 : hasBaseFields;
  }, [email, isSignup, name, password]);

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

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardView} behavior="padding">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <View style={styles.authCard}>
          <View style={styles.brandBlock}>
            <Image
              source={require('../../assets/images/Gasup.png')}
              style={styles.brandLogo}
              resizeMode="contain"
              accessibilityLabel="GasUp"
            />
            <Text style={styles.brandText}>Find better fuel stops, faster.</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.segmentedControl}>
              <Pressable
                style={[styles.segmentButton, !isSignup && styles.segmentButtonActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.segmentText, !isSignup && styles.segmentTextActive]}>Login</Text>
              </Pressable>
              <Pressable
                style={[styles.segmentButton, isSignup && styles.segmentButtonActive]}
                onPress={() => setMode('signup')}
              >
                <Text style={[styles.segmentText, isSignup && styles.segmentTextActive]}>Sign up</Text>
              </Pressable>
            </View>

            <View style={styles.fields}>
              {isSignup && (
                <View style={styles.inputWrap}>
                  <Feather name="user" size={18} color={colors.muted} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor={colors.muted}
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              )}

              <View style={styles.inputWrap}>
                <Feather name="mail" size={18} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.inputWrap}>
                <Feather name="lock" size={18} color={colors.muted} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            {error ? <Text style={styles.errorText} selectable>{error}</Text> : null}

            <Pressable
              style={[styles.submitButton, (!canSubmit || isSubmitting) && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.submitText}>{isSignup ? 'Create account' : 'Login'}</Text>
                  <Feather name="arrow-right" size={18} color="white" />
                </>
              )}
            </Pressable>

            <Pressable style={styles.switchButton} onPress={switchMode}>
              <Text style={styles.switchText}>
                {isSignup ? 'Already have an account? Login' : 'New here? Sign up'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getAuthMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code.includes('email-already-in-use')) return 'That email is already registered.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Email or password is incorrect.';
  if (code.includes('weak-password')) return 'Use at least 6 characters for your password.';
  return 'Unable to continue. Please try again.';
};

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: colors.primarySoft },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(31, 41, 51, 0.08)',
  },
  brandBlock: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  brandLogo: { width: 240, height: 58 },
  brandText: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  formCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    padding: 18,
    gap: 16,
  },
  formHeader: { gap: 6 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  segmentButton: { flex: 1, minHeight: 40, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  segmentButtonActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  segmentTextActive: { color: 'white' },
  fields: { gap: 12 },
  inputWrap: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: colors.text, fontSize: 15 },
  errorText: { color: colors.destructive, fontSize: 13, textAlign: 'center' },
  submitButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: { opacity: 0.55 },
  submitText: { color: 'white', fontSize: 16, fontWeight: '800' },
  switchButton: { alignItems: 'center', paddingVertical: 4 },
  switchText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
