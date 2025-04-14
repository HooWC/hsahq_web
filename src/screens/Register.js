import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Animated,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, SIZES, SHADOWS, RADIUS } from '../constants/theme';
import CONFIG from '../constants/config';

// 获取平台信息
const isWeb = Platform.OS === 'web';
const { width, height } = Dimensions.get('window');

const WebContainer = isWeb ? ({ children }) => (
  <View style={styles.webContainer}>{children}</View>
) : View;

const WebFormCard = isWeb ? ({ children }) => (
  <View style={styles.webFormCard}>{children}</View>
) : View;

const RegisterBackground = () => (
  <LinearGradient
    colors={['#0F172A', '#334155', '#475569']}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={StyleSheet.absoluteFill}
  />
);

const Register = () => {
  // Form fields
  const [title, setTitle] = useState('Male');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  
  // 动画值
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-width)).current;
  
  useEffect(() => {
    // 启动进入动画
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // 添加闪光效果动画
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: width,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
    
  }, []);

  // 检查用户名是否已经存在
  const checkUsernameExists = async (username) => {
    // 后端注册API已经包含用户名检查，不需要单独请求
    return false;
  };

  // 表单验证
  const validate = async () => {
    const newErrors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    // 移除用户名检查，注册API会处理
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (companyCode !== 'hsgonline') {
      newErrors.companyCode = 'Company code is incorrect';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showAlert = (title, message, buttons = []) => {
    if (Platform.OS === 'web') {
      // Web 版本
      window.alert(`${title}\n${message}`);
      // 如果有按钮回调，执行第一个按钮的回调
      if (buttons.length > 0 && buttons[0].onPress) {
        buttons[0].onPress();
      }
    } else {
      // Mobile 版本
      Alert.alert(title, message, buttons);
    }
  };

  // 导航到登录页面
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  // 处理注册
  const handleRegister = async () => {
    const isValid = await validate();
    if (!isValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${CONFIG.API_URL}users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title,
          firstName,
          lastName,
          email,
          username,
          password,
          role: 'User'
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showAlert(
          'Success',
          'Registration successful! Please login.',
          [{ text: 'OK', onPress: navigateToLogin }]
        );
      } else {
        // 处理后端返回的错误，特别是用户名已存在的情况
        if (data.message && data.message.includes('Username') && data.message.includes('already taken')) {
          setErrors(prev => ({ ...prev, username: 'Username already exists' }));
          // 也可以显示一个更明显的提示
          showAlert('Registration Failed', 'Username already exists');
        } else {
          showAlert('Registration Failed', data.message || 'Something went wrong');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      showAlert('Error', 'Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  // 切换密码可见性
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  
  // 切换确认密码可见性
  const toggleConfirmSecureEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        
        <RegisterBackground />
        
        {/* 闪光效果 */}
        <Animated.View 
          style={[
            styles.shine,
            {
              transform: [{ translateX: shineAnim }]
            }
          ]}
        />

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo区域 */}
          <Animated.View 
            style={[
              styles.logoContainer,styles.logoContainerSmall,
              {
                opacity: logoAnim,
                transform: [
                  { 
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={[
              styles.logoWrapper,styles.logoWrapperSmall
            ]}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={[
                  styles.logo,styles.logoSmall
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.welcomeText,styles.welcomeTextSmall
            ]}>HONG SENG</Text>
            <Text style={[
              styles.subtitleText,styles.subtitleTextSmall
            ]}>Create a new account</Text>
          </Animated.View>

          {/* 表单区域 */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formContainer}
          >
            <Animated.View 
              style={[
                styles.formCard,
                {
                  opacity: formAnim,
                  transform: [
                    { 
                      translateY: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              {/* Gender Selection */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Title</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity 
                    style={styles.radioOption} 
                    onPress={() => setTitle('Male')}
                  >
                    <View style={[styles.radioCircle, title === 'Male' && styles.radioSelected]}>
                      {title === 'Male' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioText}>Male</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption} 
                    onPress={() => setTitle('Female')}
                  >
                    <View style={[styles.radioCircle, title === 'Female' && styles.radioSelected]}>
                      {title === 'Female' && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.radioText}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* First Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>First Name</Text>
                <View style={[styles.inputWrapper, errors.firstName && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      if (errors.firstName) {
                        setErrors({...errors, firstName: null});
                      }
                    }}
                    placeholder="Enter your first name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              
              {/* Last Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <View style={[styles.inputWrapper, errors.lastName && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      if (errors.lastName) {
                        setErrors({...errors, lastName: null});
                      }
                    }}
                    placeholder="Enter your last name"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                  <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errors.email) {
                        setErrors({...errors, email: null});
                      }
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
              
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                  <Ionicons name="at-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      if (errors.username) {
                        setErrors({...errors, username: null});
                      }
                    }}
                    placeholder="Enter your username"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                  />
                </View>
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>
              
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password (6 digits)</Text>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={(text) => {
                      const alphanumericText = text.replace(/[^a-zA-Z0-9]/g, '');
                      setPassword(alphanumericText);
                      if (errors.password) {
                        setErrors({...errors, password: null});
                      }
                    }}
                    secureTextEntry={secureTextEntry}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={12}
                    minLength={6} 
                  />
                  <TouchableOpacity onPress={toggleSecureEntry} style={styles.visibilityIcon}>
                    <Ionicons 
                      name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#64748B" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
              
              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      // 允许字母和数字输入
                      const alphanumericText = text.replace(/[^a-zA-Z0-9]/g, '');
                      setConfirmPassword(alphanumericText);
                      if (errors.confirmPassword) {
                        setErrors({...errors, confirmPassword: null});
                      }
                    }}
                    secureTextEntry={confirmSecureTextEntry}
                    placeholder="Confirm your password"
                    placeholderTextColor="#94A3B8"
                    autoCorrect={false}    // 禁用自动修正
                    maxLength={12}
                  />
                  <TouchableOpacity onPress={toggleConfirmSecureEntry} style={styles.visibilityIcon}>
                    <Ionicons 
                      name={confirmSecureTextEntry ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#64748B" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
              
              {/* Company Code Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Company Code</Text>
                <View style={[styles.inputWrapper, errors.companyCode && styles.inputError]}>
                  <Ionicons name="business-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={companyCode}
                    onChangeText={(text) => {
                      setCompanyCode(text);
                      if (errors.companyCode) {
                        setErrors({...errors, companyCode: null});
                      }
                    }}
                    placeholder="Enter company code"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                {errors.companyCode && <Text style={styles.errorText}>{errors.companyCode}</Text>}
              </View>
              
              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>REGISTER</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.footerTextContainer}>
                <Text style={styles.footerText}>© {new Date().getFullYear()} Hong Seng Group</Text>
                <Text style={styles.footerVersion}>v1.0.0</Text>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    height:'100vh',
    overflowX: 'hidden', 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  shine: {
    position: 'absolute',
    width: 50,
    height: height,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ skewX: '-25deg' }],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.05,
    paddingHorizontal: 20,
  },
  logoContainerSmall: {
    marginTop: Platform.OS === 'ios' ? 10 : 5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  logoWrapper: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 16,
  },
  logoWrapperSmall: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    marginBottom: 8,
  },
  logo: {
    width: width * 0.15,
    height: width * 0.15,
  },
  logoSmall: {
    width: width * 0.1,
    height: width * 0.1,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeTextSmall: {
    fontSize: 18,
    marginBottom: 4,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 16,
  },
  subtitleTextSmall: {
    fontSize: 14,
    marginBottom: 5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 10,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 52,
    position: 'relative', 
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1E293B',
    fontSize: 15,
    paddingVertical: 12,
    paddingRight: 40, // ✅ 增加右边内边距
    outlineStyle: 'none',
    backgroundColor: 'transparent',
  },
  visibilityIcon: {
    position: 'absolute',
    right: 12,
    padding: 8,
    zIndex: 1, // 保证在上层
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  radioContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#2563EB',
  },
  radioDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  radioText: {
    color: '#1E293B',
    fontSize: 14,
  },
  registerButton: {
    height: 52,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#64748B',
    fontSize: 14,
  },
  loginButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  footerTextContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  footerVersion: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  }
});

export default Register; 