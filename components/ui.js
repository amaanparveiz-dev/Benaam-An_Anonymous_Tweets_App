// components/ui.js
// Shared UI kit built around a soft ambient background + frosted glass
// surfaces, so every screen reads as one elegant, modern system.
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { glass, palette, radius, spacing, typography } from '../theme';

// ---------------------------------------------------------------------------
// ScreenBackground â€” ambient gradient wash + soft color blobs, sits behind
// every screen so glass surfaces have something to frost against.
// ---------------------------------------------------------------------------
export function ScreenBackground({ isDark = false, ambient }) {
  const colors = ambient || (isDark ? palette.ambient.dark : palette.ambient.light);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={colors}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.blob,
          {
            width: 260,
            height: 260,
            top: -80,
            right: -60,
            backgroundColor: isDark ? 'rgba(124,111,240,0.22)' : 'rgba(124,111,240,0.16)',
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 220,
            height: 220,
            top: 260,
            left: -90,
            backgroundColor: isDark ? 'rgba(94,234,212,0.14)' : 'rgba(94,234,212,0.16)',
          },
        ]}
      />
      <View
        style={[
          styles.blob,
          {
            width: 200,
            height: 200,
            bottom: -60,
            right: -50,
            backgroundColor: isDark ? 'rgba(244,114,182,0.10)' : 'rgba(244,114,182,0.12)',
          },
        ]}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// GlassSurface â€” the core frosted-glass building block (BlurView + tinted
// translucent fill + hairline border). Everything glassy is built on this.
// ---------------------------------------------------------------------------
export function GlassSurface({
  children,
  isDark = false,
  style,
  radiusSize = radius.lg,
  intensity = 42,
  strong = false,
}) {
  const g = isDark ? glass.dark : glass.light;
  return (
    <View style={[{ borderRadius: radiusSize, overflow: 'hidden' }, style]}>
      <BlurView intensity={intensity} tint={g.tint} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: strong ? g.strongBg : g.bg },
        ]}
      />
      <View style={{ borderRadius: radiusSize, borderWidth: 1, borderColor: g.border }}>
        {children}
      </View>
    </View>
  );
}

// GlassCard â€” GlassSurface with default padding, for content blocks.
export function GlassCard({ children, isDark = false, style, padded = true, ...rest }) {
  return (
    <GlassSurface isDark={isDark} style={style} {...rest}>
      <View style={padded ? { padding: spacing.md } : null}>{children}</View>
    </GlassSurface>
  );
}

// ---------------------------------------------------------------------------
// GlassBar â€” a slim frosted top bar (title + optional left/right slots)
// ---------------------------------------------------------------------------
export function GlassBar({ title, subtitle, isDark = false, leftSlot, rightSlot }) {
  const t = isDark ? palette.dark : palette.light;
  return (
    <GlassSurface isDark={isDark} radiusSize={radius.xl} style={{ marginTop: 6 }}>
      <View style={styles.barRow}>
        <View style={styles.barSide}>{leftSlot}</View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[typography.h1, { color: t.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={{ color: t.textMuted, fontSize: 12, marginTop: 1 }} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.barSide}>{rightSlot}</View>
      </View>
    </GlassSurface>
  );
}

// ---------------------------------------------------------------------------
// BrandMark â€” small gradient logo badge used above auth cards
// ---------------------------------------------------------------------------
export function BrandMark({ size = 64, icon = 'sparkles', colors = palette.gradientPrimary }) {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.brandMark,
        { width: size, height: size, borderRadius: size * 0.32 },
      ]}
    >
      <Ionicons name={icon} size={size * 0.46} color="#fff" />
    </LinearGradient>
  );
}

// ---------------------------------------------------------------------------
// TextField â€” icon-prefixed glass input with animated focus border
// ---------------------------------------------------------------------------
export function TextField({
  icon,
  isDark = false,
  containerStyle,
  rightIcon,
  onRightIconPress,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);
  const t = isDark ? palette.dark : palette.light;
  const g = isDark ? glass.dark : glass.light;

  return (
    <View
      style={[
        styles.fieldWrap,
        {
          backgroundColor: g.strongBg,
          borderColor: focused ? palette.primary : g.border,
          borderWidth: focused ? 1.5 : 1,
        },
        containerStyle,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={focused ? palette.primary : t.textFaint}
          style={{ marginRight: spacing.sm }}
        />
      ) : null}
      <TextInput
        placeholderTextColor={t.textFaint}
        style={[styles.fieldInput, { color: t.text }]}
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        {...inputProps}
      />
      {rightIcon ? (
        <Pressable onPress={onRightIconPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={18} color={t.textFaint} />
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// PrimaryButton â€” gradient pill button with loading + disabled states
// ---------------------------------------------------------------------------
export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  icon,
  colors = palette.gradientPrimary,
  style,
}) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        { opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.primaryButton}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? (
              <Ionicons name={icon} size={17} color="#fff" style={{ marginRight: 8 }} />
            ) : null}
            <Text style={styles.primaryButtonText}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// GhostLink â€” secondary text-link action
// ---------------------------------------------------------------------------
export function GhostLink({ label, onPress, isDark = false }) {
  const t = isDark ? palette.dark : palette.light;
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={[styles.ghostLink, { color: t.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Chip / Pill badge
// ---------------------------------------------------------------------------
export function Pill({ label, tone = 'primary', small = false }) {
  const toneMap = {
    primary: { bg: 'rgba(124,111,240,0.14)', fg: palette.primaryDark },
    accent: { bg: 'rgba(244,114,182,0.16)', fg: '#BE3A79' },
    success: { bg: 'rgba(52,211,153,0.16)', fg: '#0F8F5F' },
  };
  const c = toneMap[tone] || toneMap.primary;
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: c.bg, paddingVertical: small ? 3 : 5 },
      ]}
    >
      <Text style={[styles.pillText, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// GlassIconButton â€” round frosted icon button (settings, back, etc.)
// ---------------------------------------------------------------------------
export function GlassIconButton({ icon, onPress, size = 40, isDark = false, tone = 'default' }) {
  const g = isDark ? glass.dark : glass.light;
  const t = isDark ? palette.dark : palette.light;
  const color = tone === 'danger' ? palette.danger : t.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <GlassSurface isDark={isDark} radiusSize={size / 2} intensity={35}>
        <View
          style={{
            width: size,
            height: size,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={size * 0.48} color={color} />
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
  },
  barSide: {
    width: 40,
    alignItems: 'center',
  },
  brandMark: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#4834D4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15.5,
    height: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: radius.pill,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ghostLink: {
    textAlign: 'center',
    fontSize: 13.5,
    fontWeight: '600',
  },
  pill: {
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
});