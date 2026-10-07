import React, {
  useEffect,
  useRef,
} from 'react';

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
  const fadeAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  const logoScale =
    useRef(
      new Animated.Value(0.82),
    ).current;

  const logoTranslate =
    useRef(
      new Animated.Value(12),
    ).current;

  const textAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  const bottomAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(
        fadeAnim,
        {
          toValue: 1,
          duration: 650,
          easing:
            Easing.out(
              Easing.cubic,
            ),
          useNativeDriver: true,
        },
      ),

      Animated.spring(
        logoScale,
        {
          toValue: 1,
          friction: 7,
          tension: 55,
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        logoTranslate,
        {
          toValue: 0,
          duration: 700,
          easing:
            Easing.out(
              Easing.cubic,
            ),
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        textAnim,
        {
          toValue: 1,
          delay: 350,
          duration: 650,
          easing:
            Easing.out(
              Easing.cubic,
            ),
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        bottomAnim,
        {
          toValue: 1,
          delay: 650,
          duration: 550,
          easing:
            Easing.out(
              Easing.cubic,
            ),
          useNativeDriver: true,
        },
      ),
    ]).start();
  }, [
    fadeAnim,
    logoScale,
    logoTranslate,
    textAnim,
    bottomAnim,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={
          colors.primary
        }
      />

      {/* Decorative background */}
      <View
        style={[
          styles.circleLarge,
          styles.circleTop,
        ]}
      />

      <View
        style={[
          styles.circleMedium,
          styles.circleBottom,
        ]}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity:
              fadeAnim,
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
                  scale:
                    logoScale,
                },
              ],
            },
          ]}
        >
          <View
            style={
              styles.logoGlow
            }
          />

          <View
            style={
              styles.logoContainer
            }
          >
            <Image
              source={require('../../../assets/images/icon.png')}
              style={
                styles.logo
              }
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand */}
        <Animated.View
          style={[
            styles.brandSection,
            {
              opacity:
                textAnim,
              transform: [
                {
                  translateY:
                    textAnim.interpolate(
                      {
                        inputRange:
                          [
                            0,
                            1,
                          ],
                        outputRange:
                          [
                            10,
                            0,
                          ],
                      },
                    ),
                },
              ],
            },
          ]}
        >
          <Txt
            variant="h1"
            color={
              colors.white
            }
            align="center"
            style={
              styles.brand
            }
          >
            مهنتي
          </Txt>

          <Txt
            variant="body"
            color="#D8EBE1"
            align="center"
            style={
              styles.tagline
            }
          >
            خدمات محلية، بثقة وذكاء
          </Txt>
        </Animated.View>

        {/* Small feature line */}
        <Animated.View
          style={[
            styles.featureLine,
            {
              opacity:
                bottomAnim,

              transform: [
                {
                  translateY:
                    bottomAnim.interpolate(
                      {
                        inputRange:
                          [
                            0,
                            1,
                          ],
                        outputRange:
                          [
                            12,
                            0,
                          ],
                      },
                    ),
                },
              ],
            },
          ]}
        >
          <View
            style={
              styles.feature
            }
          >
            <View
              style={
                styles.featureDot
              }
            />

            <Txt
              variant="labelSm"
              color="#D8EBE1"
            >
              اكتشف
            </Txt>
          </View>

          <View
            style={
              styles.featureDivider
            }
          />

          <View
            style={
              styles.feature
            }
          >
            <View
              style={
                styles.featureDot
              }
            />

            <Txt
              variant="labelSm"
              color="#D8EBE1"
            >
              تواصل
            </Txt>
          </View>

          <View
            style={
              styles.featureDivider
            }
          />

          <View
            style={
              styles.feature
            }
          >
            <View
              style={
                styles.featureDot
              }
            />

            <Txt
              variant="labelSm"
              color="#D8EBE1"
            >
              أنجز
            </Txt>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Bottom brand statement */}
      <Animated.View
        style={[
          styles.bottomText,
          {
            opacity:
              bottomAnim,
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

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        colors.primary,
      alignItems:
        'center',
      justifyContent:
        'center',
      overflow:
        'hidden',
    },

    /* =============================
       BACKGROUND
    ============================== */

    circleLarge: {
      position:
        'absolute',
      borderRadius:
        999,
      backgroundColor:
        'rgba(255,255,255,0.035)',
    },

    circleTop: {
      width:
        340,
      height:
        340,
      top:
        -160,
      right:
        -120,
    },

    circleMedium: {
      position:
        'absolute',
      borderRadius:
        999,
      backgroundColor:
        'rgba(64,145,108,0.20)',
    },

    circleBottom: {
      width:
        290,
      height:
        290,
      bottom:
        -145,
      left:
        -120,
    },

    /* =============================
       CONTENT
    ============================== */

    content: {
      alignItems:
        'center',
      justifyContent:
        'center',
      width:
        '100%',
      paddingHorizontal:
        24,
    },

    /* =============================
       LOGO
    ============================== */

    logoOuter: {
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    logoGlow: {
      position:
        'absolute',
      width:
        142,
      height:
        142,
      borderRadius:
        71,
      backgroundColor:
        'rgba(64,145,108,0.22)',
    },

    logoContainer: {
      width:
        118,
      height:
        118,
      borderRadius:
        34,
      backgroundColor:
        colors.white,
      alignItems:
        'center',
      justifyContent:
        'center',
      padding:
        13,
    },

    logo: {
      width:
        130,
      height:
        140,
    },

    /* =============================
       BRAND
    ============================== */

    brandSection: {
      marginTop:
        24,
      alignItems:
        'center',
    },

    brand: {
      fontSize:
        40,
      lineHeight:
        52,
      letterSpacing:
        0.2,
    },

    tagline: {
      marginTop:
        5,
      fontSize:
        15,
    },

    /* =============================
       FEATURES
    ============================== */

    featureLine: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
      marginTop:
        30,
      backgroundColor:
        'rgba(255,255,255,0.08)',
      borderRadius:
        radius.full,
      paddingHorizontal:
        15,
      paddingVertical:
        8,
    },

    feature: {
      flexDirection:
        'row-reverse',
      alignItems:
        'center',
    },

    featureDot: {
      width:
        5,
      height:
        5,
      borderRadius:
        3,
      backgroundColor:
        colors.mint,
      marginLeft:
        5,
    },

    featureDivider: {
      width:
        1,
      height:
        14,
      backgroundColor:
        'rgba(255,255,255,0.22)',
      marginHorizontal:
        12,
    },

    /* =============================
       BOTTOM
    ============================== */

    bottomText: {
      position:
        'absolute',
      bottom:
        28,
      left:
        24,
      right:
        24,
    },
  });