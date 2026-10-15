import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassButton } from '@/components/ui/GlassButton';
import { colors, spacing, typography } from '@/theme/tokens';
import { useAuthStore } from '@/store/useAuthStore';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithGuest,
    isLoading,
  } = useAuthStore();

  const handleEmailAuth = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const { error } = isSignUp
      ? await signUpWithEmail(email.trim(), password.trim())
      : await signInWithEmail(email.trim(), password.trim());

    if (error && error.message) {
      setErrorMsg(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    const { error } = await signInWithGoogle();
    if (error) {
      if (error.message?.includes('provider is not enabled')) {
        setErrorMsg('⚠️ Google OAuth is not enabled in your Supabase project. Enable Google in Supabase Dashboard -> Authentication -> Providers, or use Email / Guest Login below.');
      } else {
        setErrorMsg(error.message || 'Google Authentication failed. Please try Email or Guest Login.');
      }
    }
  };

  const handleLinkedInAuth = async () => {
    setErrorMsg('');
    const { error } = await signInWithLinkedIn();
    if (error) {
      if (error.message?.includes('provider is not enabled')) {
        setErrorMsg('⚠️ LinkedIn OAuth is not enabled in your Supabase project. Enable LinkedIn in Supabase Dashboard -> Authentication -> Providers, or use Email / Guest Login below.');
      } else {
        setErrorMsg(error.message || 'LinkedIn Authentication failed. Please try Email or Guest Login.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background Decorative Ambient Glow Orbs */}
      <View style={styles.ambientGlowTopLeft} pointerEvents="none" />
      <View style={styles.ambientGlowBottomRight} pointerEvents="none" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Premium Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoBadgeContainer}>
            <View style={styles.brandIconBox}>
              <Text style={styles.brandIconText}>S</Text>
            </View>
            <View style={styles.proPill}>
              <Text style={styles.proPillText}>PRO OS</Text>
            </View>
          </View>
          <Text style={styles.logoTitle}>Stud Career OS</Text>
          <Text style={styles.subtitle}>
            Personalized Career Operating System for Tech Professionals
          </Text>
        </View>

        {/* Main Auth Card */}
        <GlassCard style={styles.card}>
          <View style={styles.cardHeaderGroup}>
            <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.cardSubtitle}>
              {isSignUp
                ? 'Start your personalized career preparation journey today'
                : 'Sign in to access your custom career roadmap & resources'}
            </Text>
          </View>

          {/* Mode Segmented Tab Selector */}
          <View style={styles.segmentContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, !isSignUp && styles.segmentBtnActive]}
              onPress={() => {
                setIsSignUp(false);
                setErrorMsg('');
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentText, !isSignUp && styles.segmentTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentBtn, isSignUp && styles.segmentBtnActive]}
              onPress={() => {
                setIsSignUp(true);
                setErrorMsg('');
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentText, isSignUp && styles.segmentTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

          {/* Social SSO Buttons */}
          <View style={styles.ssoContainer}>
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleAuth}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <View style={styles.googleIconBadge}>
                <Text style={styles.googleIconText}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkedInBtn}
              onPress={handleLinkedInAuth}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <View style={styles.linkedInIconBadge}>
                <Text style={styles.linkedInIconText}>in</Text>
              </View>
              <Text style={styles.linkedInBtnText}>Continue with LinkedIn</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR WITH EMAIL</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email / Password Form */}
          <GlassInput
            label="Email Address"
            placeholder="you@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <GlassInput
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <GlassButton
            title={isSignUp ? 'Create Account →' : 'Sign In with Email →'}
            variant="primary"
            onPress={handleEmailAuth}
            loading={isLoading}
            style={{ marginTop: spacing.sm }}
          />

          {/* Switch Sign In / Sign Up */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchLink}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
            </TouchableOpacity>
          </View>

          {/* Guest Mode */}
          <View style={styles.guestBox}>
            <TouchableOpacity onPress={signInWithGuest} style={styles.guestBtn} activeOpacity={0.8}>
              <View style={styles.guestPill}>
                <Text style={styles.guestBtnText}>⚡ Try Guest Mode (Offline Sandbox)</Text>
              </View>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Footer info */}
        <Text style={styles.footerNote}>
          🔒 Secure 256-bit Encrypted Authentication & User Data Isolation
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7F9',
    position: 'relative',
  },
  ambientGlowTopLeft: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(13, 110, 110, 0.08)',
  },
  ambientGlowBottomRight: {
    position: 'absolute',
    bottom: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  brandIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#0D6E6E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D6E6E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  brandIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 24,
  },
  proPill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  proPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    padding: spacing.xl,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  cardHeaderGroup: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 9,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#0D6E6E',
    fontWeight: '800',
  },
  errorBanner: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E11D48',
    backgroundColor: '#FFF1F2',
    padding: spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDA4AF',
    marginBottom: spacing.md,
  },
  ssoContainer: {
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  googleIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  linkedInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#0A66C2',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
  },
  linkedInIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkedInIconText: {
    color: '#0A66C2',
    fontWeight: '900',
    fontSize: 12,
  },
  linkedInBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  switchText: { fontSize: 13, color: '#64748B' },
  switchLink: { fontSize: 13, color: '#0D6E6E', fontWeight: '800' },

  guestBox: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  guestBtn: {
    width: '100%',
  },
  guestPill: {
    backgroundColor: '#F0FAFA',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    alignItems: 'center',
  },
  guestBtnText: { fontSize: 13, color: '#0D6E6E', fontWeight: '700' },
  footerNote: {
    marginTop: spacing.lg,
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '500',
  },
});
