import React, { useEffect, useRef } from 'react';

import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

import Txt from '../../components/Txt';

import {
  colors,
  radius,
} from '../../styles/theme';

export default function SplashScreen() {
  const fadeAnim = useRef(
    new Animated.Value(0),
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.88),
  ).current;

  const logoTranslate = useRef(
    new Animated.Value(14),
  ).current;

  const textAnim = useRef(
    new Animated.Value(0),
  ).current;

  const bottomAnim = useRef(
    new Animated.Value(0),
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 48,
        useNativeDriver: true,
      }),

      Animated.timing(logoTranslate, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.timing(textAnim, {
        toValue: 1,
        delay: 300,
        duration: 650,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),

      Animated.timing(bottomAnim, {
        toValue: 1,
        delay: 700,
        duration: 500,
        easing: Easing.out(
          Easing.cubic,
        ),
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    fadeAnim,
    logoScale,
    logoTranslate,
    textAnim,
    bottomAnim,
  ]);

  const textTranslateY =
    textAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 0],
    });

  const bottomTranslateY =
    bottomAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0],
    });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
      />

      {/* Background atmosphere */}
      <View
        pointerEvents="none"
        style={[
          styles.backgroundOrb,
          styles.backgroundOrbTop,
        ]}
      />

      <View
        pointerEvents="none"
        style={[
          styles.backgroundOrb,
          styles.backgroundOrbBottom,
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY:
                  logoTranslate,
              },
            ],
          },
        ]}
      >
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoOuter,
            {
              transform: [
                {
                  scale: logoScale,
                },
              ],
            },
          ]}
        >
          <View style={styles.logoGlow} />

          <View
            style={styles.logoContainer}
          >
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand */}
        <Animated.View
          style={[
            styles.brandSection,
            {
              opacity: textAnim,
              transform: [
                {
                  translateY:
                    textTranslateY,
                },
              ],
            },
          ]}
        >
          <Txt
            variant="h1"
            color={colors.white}
            align="center"
            style={styles.brand}
          >
            مهنتي
          </Txt>

          <Txt
            variant="body"
            color="#D8EBE1"
            align="center"
            style={styles.tagline}
          >
            خدمات محلية، بثقة وذكاء
          </Txt>
        </Animated.View>

        {/* Journey */}
        <Animated.View
          style={[
            styles.journey,
            {
              opacity: bottomAnim,
              transform: [
                {
                  translateY:
                    bottomTranslateY,
                },
              ],
            },
          ]}
        >
          <View style={styles.journeyItem}>
            <View style={styles.journeyDot} />

            <Txt
              variant="labelSm"
              color="#D8EBE1"
            >
              اكتشف
            </Txt>
          </View>

          <View
            style={styles.journeyDivider}
          />

          <View style={styles.journeyItem}>
            <View style={styles.journeyDot} />

            <Txt
              variant="labelSm"
              color="#D8EBE1"
            >
              تواصل
            </Txt>
          </View>

          <View
            style={styles.journeyDivider}
          />

          <View style={styles.journeyItem}>
            <View style={styles.journeyDot} />

            <Txt
              variant="labelSm"
              color="#D8EBE1"
            >
              أنجز
            </Txt>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Bottom statement */}
      <Animated.View
        style={[
          styles.bottomText,
          {
            opacity: bottomAnim,
            transform: [
              {
                translateY:
                  bottomTranslateY,
              },
            ],
          },
        ]}
      >
        <Txt
          variant="small"
          color="#BFDCCD"
          align="center"
        >
          اكتشف المهني المناسب بالقرب منك
        </Txt>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  /* Background */

  backgroundOrb: {
    position: 'absolute',
    borderRadius: 999,
  },

  backgroundOrbTop: {
    width: 360,
    height: 360,
    top: -190,
    right: -150,
    backgroundColor:
      'rgba(255,255,255,0.035)',
  },

  backgroundOrbBottom: {
    width: 310,
    height: 310,
    bottom: -180,
    left: -150,
    backgroundColor:
      'rgba(64,145,108,0.18)',
  },

  /* Main content */

  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  /* Logo */

  logoOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor:
      'rgba(64,145,108,0.20)',
  },

  logoContainer: {
    width: 118,
    height: 118,
    borderRadius: 34,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },

  logo: {
    width: 98,
    height: 98,
  },

  /* Brand */

  brandSection: {
    marginTop: 24,
    alignItems: 'center',
  },

  brand: {
    fontSize: 40,
    lineHeight: 52,
    letterSpacing: 0.2,
  },

  tagline: {
    marginTop: 5,
    fontSize: 15,
  },

  /* Journey */

  journey: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 30,
    backgroundColor:
      'rgba(255,255,255,0.08)',
    borderRadius: radius.full,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  journeyItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  journeyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.mint,
    marginLeft: 5,
  },

  journeyDivider: {
    width: 1,
    height: 14,
    backgroundColor:
      'rgba(255,255,255,0.22)',
    marginHorizontal: 12,
  },

  /* Bottom */

  bottomText: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
  },
});