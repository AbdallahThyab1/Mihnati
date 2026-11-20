import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Mail, Lock, User, Phone, X, LogIn, UserPlus } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import Txt from './Txt';
import { colors, radius, row, shadows } from '../styles/theme';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export default function AuthModal({
  visible,
  onClose,
  initialMode = 'login',
  onSuccess,
}: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'customer' | 'professional'>('customer');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('يرجى ملء البريد الإلكتروني وكلمة المرور.');
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setErrorMsg('يرجى كتابة الاسم الكامل.');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      const res = await signIn(email, password);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        onClose();
        if (onSuccess) onSuccess();
      }
    } else {
      const res = await signUp(email, password, fullName, phone, role);
      setLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        Alert.alert(
          'أهلاً بك في مهنتي 🎉',
          'تم إنشاء حسابك بنجاح. يمكنك الآن استخدام جميع ميزات المنصة.',
        );
        onClose();
        if (onSuccess) onSuccess();
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <View style={[styles.card, shadows.level3]}>
            {/* Header */}
            <View style={[row, styles.header]}>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={colors.muted} />
              </Pressable>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Txt variant="h3" color={colors.primary}>
                  {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
                </Txt>
              </View>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              {/* Tabs */}
              <View style={[row, styles.tabSwitch]}>
                <Pressable
                  style={[styles.tab, mode === 'login' && styles.tabActive]}
                  onPress={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                >
                  <Txt
                    variant="label"
                    color={mode === 'login' ? colors.white : colors.muted}
                    style={{ textAlign: 'center' }}
                  >
                    تسجيل دخول
                  </Txt>
                </Pressable>
                <Pressable
                  style={[styles.tab, mode === 'signup' && styles.tabActive]}
                  onPress={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                >
                  <Txt
                    variant="label"
                    color={mode === 'signup' ? colors.white : colors.muted}
                    style={{ textAlign: 'center' }}
                  >
                    حساب جديد
                  </Txt>
                </Pressable>
              </View>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Txt variant="small" color={colors.error} style={{ textAlign: 'center' }}>
                    {errorMsg}
                  </Txt>
                </View>
              ) : null}

              {mode === 'signup' ? (
                <>
                  {/* Full Name */}
                  <View style={styles.inputWrap}>
                    <Txt variant="small" weight="600" color={colors.text} style={styles.inputLabel}>
                      الاسم الكامل
                    </Txt>
                    <View style={[row, styles.inputBox]}>
                      <User size={18} color={colors.muted} style={{ marginLeft: 8 }} />
                      <TextInput
                        style={styles.input}
                        placeholder="مثال: أحمد الحلبي"
                        placeholderTextColor={colors.muted}
                        value={fullName}
                        onChangeText={setFullName}
                        textAlign="right"
                      />
                    </View>
                  </View>

                  {/* Phone */}
                  <View style={styles.inputWrap}>
                    <Txt variant="small" weight="600" color={colors.text} style={styles.inputLabel}>
                      رقم الهاتف (اختياري)
                    </Txt>
                    <View style={[row, styles.inputBox]}>
                      <Phone size={18} color={colors.muted} style={{ marginLeft: 8 }} />
                      <TextInput
                        style={styles.input}
                        placeholder="059xxxxxxx"
                        placeholderTextColor={colors.muted}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        textAlign="right"
                      />
                    </View>
                  </View>

                  {/* Account Role */}
                  <View style={styles.inputWrap}>
                    <Txt variant="small" weight="600" color={colors.text} style={styles.inputLabel}>
                      نوع الحساب
                    </Txt>
                    <View style={[row, { gap: 10 }]}>
                      <Pressable
                        style={[
                          styles.roleBtn,
                          role === 'customer' && styles.roleBtnActive,
                        ]}
                        onPress={() => setRole('customer')}
                      >
                        <Txt
                          variant="small"
                          weight="600"
                          color={role === 'customer' ? colors.primary : colors.muted}
                        >
                          زبون (طلب خدمات)
                        </Txt>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.roleBtn,
                          role === 'professional' && styles.roleBtnActive,
                        ]}
                        onPress={() => setRole('professional')}
                      >
                        <Txt
                          variant="small"
                          weight="600"
                          color={role === 'professional' ? colors.primary : colors.muted}
                        >
                          مهني / فني (تقديم خدمات)
                        </Txt>
                      </Pressable>
                    </View>
                  </View>
                </>
              ) : null}

              {/* Email */}
              <View style={styles.inputWrap}>
                <Txt variant="small" weight="600" color={colors.text} style={styles.inputLabel}>
                  البريد الإلكتروني
                </Txt>
                <View style={[row, styles.inputBox]}>
                  <Mail size={18} color={colors.muted} style={{ marginLeft: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="name@example.com"
                    placeholderTextColor={colors.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputWrap}>
                <Txt variant="small" weight="600" color={colors.text} style={styles.inputLabel}>
                  كلمة المرور
                </Txt>
                <View style={[row, styles.inputBox]}>
                  <Lock size={18} color={colors.muted} style={{ marginLeft: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={colors.muted}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    textAlign="right"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                style={[styles.submitBtn, loading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <View style={[row, { justifyContent: 'center', gap: 8 }]}>
                    {mode === 'login' ? (
                      <LogIn size={20} color={colors.white} />
                    ) : (
                      <UserPlus size={20} color={colors.white} />
                    )}
                    <Txt variant="label" color={colors.white}>
                      {mode === 'login' ? 'دخول' : 'تسجيل حساب'}
                    </Txt>
                  </View>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 14,
    marginBottom: 16,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingBottom: 20,
  },
  tabSwitch: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  errorBox: {
    backgroundColor: colors.errorSoft,
    padding: 10,
    borderRadius: radius.sm,
    marginBottom: 14,
  },
  inputWrap: {
    marginBottom: 14,
  },
  inputLabel: {
    marginBottom: 6,
    textAlign: 'right',
  },
  inputBox: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontFamily: 'Cairo_500Medium',
    fontSize: 14,
    color: colors.text,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: colors.canvas,
  },
  roleBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.mintSoft,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
});
