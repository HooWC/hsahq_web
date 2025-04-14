import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, RADIUS, SHADOWS } from '../constants/theme';

/**
 * 专业的按钮组件，支持渐变背景和加载状态
 */
const Button = ({ 
  label, 
  onPress, 
  variant = 'primary', 
  isLoading = false,
  style = {},
  textStyle = {},
  leftIcon,
  rightIcon,
  disabled = false
}) => {
  // 基于variant确定按钮样式
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'gray':
        return styles.grayButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  // 基于variant确定文本颜色
  const getTextStyle = () => {
    if (variant === 'outline') {
      return styles.outlineButtonText;
    }
    return styles.buttonText;
  };

  // 基于variant确定渐变颜色
  const getGradientColors = () => {
    switch (variant) {
      case 'secondary':
        return [COLORS.secondary, COLORS.accent];
      case 'gray':
        return [COLORS.gray, COLORS.darkGray];
      case 'outline':
        return [COLORS.white, COLORS.white];
      default:
        return [COLORS.primary, COLORS.accent];
    }
  };

  const buttonContent = (
    <>
      {isLoading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? COLORS.primary : COLORS.white} />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{label}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </>
  );

  // 轮廓按钮不使用渐变
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[styles.button, getButtonStyle(), style]}
        onPress={onPress}
        disabled={isLoading || disabled}
        activeOpacity={0.7}
      >
        {buttonContent}
      </TouchableOpacity>
    );
  }

  // 其他按钮使用渐变背景
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.7}
      style={[styles.button, style, disabled && styles.disabledButton]}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, getButtonStyle()]}
      >
        {buttonContent}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  gradient: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.round,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  grayButton: {
    backgroundColor: COLORS.gray,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  }
});

export default Button; 