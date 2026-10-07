import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import * as ImagePicker from 'expo-image-picker';

import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';

import { File } from 'expo-file-system';

import {
  BadgeCheck,
  CircleCheck,
  ImagePlus,
  Info,
  Lightbulb,
  MapPin,
  MessageSquare,
  Mic,
  Rocket,
  ScanFace,
  Send,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  X,
  Zap,
} from 'lucide-react-native';

import AppHeader from '../../components/AppHeader';
import Txt from '../../components/Txt';
import HScroll from '../../components/HScroll';

import {
  aiExamples,
  aiSteps,
  categories,
} from '../../data/mock';

import {
  card,
  colors,
  fontFamilies,
  radius,
  row,
  shadows,
} from '../../styles/theme';

const initialText =
  'الغسالة عندي بتشتغل مي وبتسحب مي، بس لما توصل مرحلة التنشيف بتعصر وطالعة صوت غريب، بدي حدا ثقة يفحصها ويصلحها قريب مني برام الله';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export type AiSearchResult = {
  service: string;
  categoryId: string;
  keywords: string[];
  location: string;
  summary: string;
};

type SelectedImage = {
  uri: string;
  base64: string;
  mimeType: string;
};

function normalizeAiResult(
  value: unknown,
): AiSearchResult {
  if (!value || typeof value !== 'object') {
    throw new Error(
      'استجابة الذكاء الاصطناعي غير صالحة.',
    );
  }

  const result = value as Record<string, unknown>;

  const validCategory = categories.some(
    (item) => item.id === result.categoryId,
  );

  if (
    typeof result.service !== 'string' ||
    !validCategory ||
    !Array.isArray(result.keywords) ||
    typeof result.location !== 'string' ||
    typeof result.summary !== 'string'
  ) {
    throw new Error(
      'الذكاء الاصطناعي أعاد بيانات ناقصة.',
    );
  }

  const keywords = result.keywords
    .filter(
      (item): item is string =>
        typeof item === 'string',
    )
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    service: result.service.trim(),
    categoryId: String(result.categoryId),
    keywords,
    location: result.location.trim(),
    summary: result.summary.trim(),
  };
}

export default function AiSearchScreen() {
  const router = useRouter();

  const [text, setText] =
    useState<string>(initialText);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [transcribing, setTranscribing] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>('');

  const [selectedImage, setSelectedImage] =
    useState<SelectedImage | null>(null);

  const [voiceTranscribed, setVoiceTranscribed] =
    useState<boolean>(false);

  const recorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
  );

  const recorderState =
    useAudioRecorderState(recorder);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await AudioModule.requestRecordingPermissionsAsync();

        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } catch (err) {
        console.error('Audio setup error:', err);
      }
    };

    void setupAudio();
  }, []);

  useEffect(() => {
    if (
      recorderState.isRecording &&
      recorderState.durationMillis >= 20000
    ) {
      void stopRecording();
    }
  }, [
    recorderState.isRecording,
    recorderState.durationMillis,
  ]);

  const setInputError = (message: string) => {
    setError(message);
  };

  const handleImageResult = (
    result: ImagePicker.ImagePickerResult,
  ) => {
    if (result.canceled) return;

    const asset = result.assets[0];

    if (!asset?.base64) {
      setInputError(
        'تعذر قراءة الصورة. جرّب صورة ثانية.',
      );
      return;
    }

    setSelectedImage({
      uri: asset.uri,
      base64: asset.base64,
      mimeType:
        asset.mimeType ?? 'image/jpeg',
    });

    setError('');
  };

  const pickFromLibrary = async () => {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
          base64: true,
        });

      handleImageResult(result);
    } catch (err) {
      console.error(
        'Library image error:',
        err,
      );

      setInputError(
        'تعذر فتح معرض الصور.',
      );
    }
  };

  const takePhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'صلاحية الكاميرا',
          'لازم تسمح للمِهنتي باستخدام الكاميرا حتى تلتقط صورة للعطل.',
        );

        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
          base64: true,
          cameraType:
            ImagePicker.CameraType.back,
        });

      handleImageResult(result);
    } catch (err) {
      console.error(
        'Camera image error:',
        err,
      );

      setInputError(
        'تعذر فتح الكاميرا.',
      );
    }
  };

  const chooseImage = () => {
    Alert.alert(
      'إضافة صورة للعطل',
      'اختار الطريقة المناسبة:',
      [
        {
          text: 'التقاط صورة',
          onPress: () => void takePhoto(),
        },
        {
          text: 'اختيار من المعرض',
          onPress: () => void pickFromLibrary(),
        },
        {
          text: 'إلغاء',
          style: 'cancel',
        },
      ],
    );
  };

  const transcribeAudio = async (
    base64: string,
    mimeType: string,
  ) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error(
        'إعدادات Supabase غير موجودة. تأكد من EXPO_PUBLIC_SUPABASE_URL وEXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
      );
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/mihnati-ai`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          mode: 'transcribe',
          audioBase64: base64,
          audioMimeType: mimeType,
        }),
      },
    );

    const payload = await response
      .json()
      .catch(() => null);

    if (!response.ok) {
      console.log(
        'TRANSCRIPTION STATUS:',
        response.status,
      );

      console.log(
        'TRANSCRIPTION PAYLOAD:',
        payload,
      );

      throw new Error(
        payload &&
          typeof payload.message === 'string'
          ? payload.message
          : `فشل تحويل التسجيل إلى نص (${response.status}).`,
      );
    }

    if (
      !payload ||
      typeof payload.transcript !== 'string' ||
      !payload.transcript.trim()
    ) {
      throw new Error(
        'لم يتم العثور على نص واضح في التسجيل.',
      );
    }

    return payload.transcript.trim();
  };

  const startRecording = async () => {
    if (loading || transcribing) return;

    try {
      const permission =
        await AudioModule.requestRecordingPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'صلاحية الميكروفون',
          'لازم تسمح للمِهنتي باستخدام الميكروفون حتى نسجل وصفك الصوتي.',
        );

        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setError('');
      setVoiceTranscribed(false);

      // التسجيل الصوتي يصبح بديلًا للنص الحالي.
      setText('');

      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (err) {
      console.error(
        'Start recording error:',
        err,
      );

      setInputError(
        'تعذر تشغيل التسجيل الصوتي.',
      );
    }
  };

  const stopRecording = async () => {
    if (
      !recorderState.isRecording ||
      transcribing
    ) {
      return;
    }

    try {
      await recorder.stop();

      const uri = recorder.uri;

      if (!uri) {
        setInputError(
          'لم يتم حفظ التسجيل الصوتي.',
        );
        return;
      }

      if (!SUPABASE_URL || !SUPABASE_KEY) {
        setInputError(
          'إعدادات Supabase غير موجودة. تأكد من متغيرات البيئة ثم أعد تشغيل Expo.',
        );
        return;
      }

      setTranscribing(true);
      setError('');

      const file = new File(uri);
      const base64 = await file.base64();

      const transcript =
        await transcribeAudio(
          base64,
          'audio/m4a',
        );

      setText(transcript);
      setVoiceTranscribed(true);
    } catch (err) {
      console.error(
        'Stop/transcribe error:',
        err,
      );

      setVoiceTranscribed(false);

      setInputError(
        err instanceof Error
          ? err.message
          : 'تعذر تحويل التسجيل الصوتي إلى نص. جرّب مرة ثانية.',
      );
    } finally {
      setTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (recorderState.isRecording) {
      void stopRecording();
    } else {
      void startRecording();
    }
  };

  const submit = async () => {
    const cleanText = text.trim();

    if (!cleanText && !selectedImage) {
      setInputError(
        'اكتب وصفًا للمشكلة أو أرفق صورة حتى يفهم الذكاء طلبك.',
      );

      return;
    }

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      setInputError(
        'إعدادات Supabase غير موجودة. أضف EXPO_PUBLIC_SUPABASE_URL وEXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ثم أعد تشغيل Expo.',
      );

      return;
    }

    if (
      recorderState.isRecording ||
      transcribing
    ) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/mihnati-ai`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            text: cleanText,
            location: 'الماصيون، رام الله',
            imageBase64:
              selectedImage?.base64 ?? null,
            imageMimeType:
              selectedImage?.mimeType ?? null,
            categories: categories.map(
              ({ id, label }) => ({
                id,
                label,
              }),
            ),
          }),
        },
      );

      const payload = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        console.log(
          'AI STATUS:',
          response.status,
        );

        console.log(
          'AI PAYLOAD:',
          payload,
        );

        const message =
          payload &&
            typeof payload.message === 'string'
            ? payload.details &&
              typeof payload.details ===
              'string'
              ? `${payload.message} ${payload.details}`
              : payload.message
            : `فشل طلب الذكاء الاصطناعي (${response.status}).`;

        throw new Error(message);
      }

      const aiResult =
        normalizeAiResult(payload);

      router.push({
        pathname: '/results',
        params: {
          q: cleanText,
          ai: '1',
          category:
            aiResult.categoryId,
          keywords:
            aiResult.keywords.join(','),
          service: aiResult.service,
          location: aiResult.location,
          summary: aiResult.summary,
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'حدث خطأ أثناء تحليل الطلب. جرّب مرة ثانية.',
      );
    } finally {
      setLoading(false);
    }
  };

  const recording =
    recorderState.isRecording;

  const busy =
    loading || transcribing;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <AppHeader />

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.intro}>
          <View style={styles.sparkCircle}>
            <Sparkles
              size={25}
              color={colors.primary}
            />

            <View style={styles.liveDot} />
          </View>

          <View style={styles.introText}>
            <Txt
              variant="h2"
              style={styles.introTitle}
            >
              احكيلنا شو محتاج
            </Txt>

            <View style={styles.statusRow}>
              <View
                style={styles.statusDot}
              />

              <Txt
                variant="small"
                color={colors.success}
                style={{
                  marginRight: 6,
                }}
              >
                المساعد الذكي جاهز لتحليل طلبك
              </Txt>
            </View>
          </View>
        </View>

        {/* AI explanation */}
        <View
          style={[
            styles.dark,
            shadows.level1,
          ]}
        >
          <View style={styles.darkHeader}>
            <View style={styles.chatCircle}>
              <MessageSquare
                size={19}
                color={colors.mint}
              />
            </View>

            <View
              style={
                styles.darkHeaderText
              }
            >
              <Txt
                variant="h4"
                color={colors.white}
              >
                احكي براحتك وبلهجتك العامية
              </Txt>

              <Txt
                variant="labelSm"
                color="#B9D7C5"
                style={{
                  marginTop: 3,
                }}
              >
                نص، صورة أو تسجيل صوتي
              </Txt>
            </View>
          </View>

          <Txt
            variant="body"
            color="#D2E6DB"
            style={styles.darkBody}
          >
            مش لازم تعرف اسم الخدمة الرسمية أو
            المصطلحات الفنية. احكيلنا المشكلة
            بطريقتك، ومهنتي يحول وصفك إلى طلب
            أوضح ليساعدك في الوصول إلى أنسب
            المهنيين والمحلات من بيانات المنصة.
          </Txt>
        </View>

        {/* Main input */}
        <View
          style={[
            styles.inputCard,
            shadows.level1,
          ]}
        >
          {/* Location */}
          <View style={styles.locationRow}>
            <MapPin
              size={18}
              color={colors.primary}
            />

            <View
              style={
                styles.locationText
              }
            >
              <Txt
                variant="labelSm"
                color={colors.muted}
              >
                الموقع الحالي للبحث
              </Txt>

              <Txt
                variant="label"
                weight="600"
                numberOfLines={1}
              >
                الماصيون، رام الله
              </Txt>
            </View>

            <Pressable
              onPress={() =>
                router.push('/map')
              }
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="تغيير الموقع"
            >
              <Txt
                variant="label"
                color={colors.primary}
                weight="600"
              >
                تغيير
              </Txt>
            </Pressable>
          </View>

          {/* Text box */}
          <View style={styles.textBox}>
            <TextInput
              value={text}
              onChangeText={(value) => {
                setText(value);
                setVoiceTranscribed(
                  false,
                );

                if (error) {
                  setError('');
                }
              }}
              multiline
              maxLength={500}
              textAlign="right"
              textAlignVertical="top"
              placeholder="اكتب مشكلتك هنا..."
              placeholderTextColor={
                colors.muted
              }
              style={styles.textInput}
              editable={
                !busy && !recording
              }
              accessibilityLabel="وصف المشكلة"
            />

            <View
              style={styles.insight}
            >
              <ScanFace
                size={17}
                color={colors.success}
              />

              <Txt
                variant="labelSm"
                weight="500"
                color={colors.success}
                style={
                  styles.insightText
                }
              >
                {transcribing
                  ? 'جاري تحويل التسجيل إلى نص...'
                  : loading
                    ? 'الذكاء الاصطناعي يحلل طلبك الآن...'
                    : 'سيحدد الخدمة والكلمات المفتاحية والموقع'}
              </Txt>

              <Txt
                variant="labelSm"
                weight="400"
                color={colors.muted}
              >
                {text.length}/500
              </Txt>
            </View>
          </View>

          {/* Voice result */}
          {voiceTranscribed && (
            <View
              style={
                styles.voiceSuccess
              }
            >
              <CircleCheck
                size={18}
                color={colors.success}
              />

              <Txt
                variant="labelSm"
                color={colors.success}
                style={
                  styles.feedbackText
                }
              >
                تم تحويل التسجيل إلى نص — عدّل
                النص قبل البحث إذا احتجت
              </Txt>
            </View>
          )}

          {/* Image preview */}
          {selectedImage && (
            <View
              style={
                styles.attachmentPreview
              }
            >
              <Image
                source={{
                  uri: selectedImage.uri,
                }}
                style={
                  styles.previewImage
                }
              />

              <View
                style={
                  styles.attachmentInfo
                }
              >
                <Txt
                  variant="label"
                  weight="600"
                >
                  صورة مرفقة
                </Txt>

                <Txt
                  variant="labelSm"
                  color={colors.muted}
                  numberOfLines={2}
                  style={{
                    marginTop: 2,
                  }}
                >
                  ستُحلَّل الصورة مع وصفك بواسطة
                  Gemini
                </Txt>
              </View>

              <Pressable
                onPress={() =>
                  setSelectedImage(
                    null,
                  )
                }
                hitSlop={8}
                disabled={busy}
                accessibilityRole="button"
                accessibilityLabel="إزالة الصورة"
              >
                <X
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          )}

          {/* Input actions */}
          <View
            style={[
              styles.actionRow,
              { marginTop: 12 },
            ]}
          >
            <Pressable
              style={[
                styles.actionPill,
                recording &&
                styles.recordingPill,
              ]}
              onPress={
                toggleRecording
              }
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={
                recording
                  ? 'إيقاف التسجيل'
                  : 'تسجيل صوتي'
              }
            >
              {recording ||
                transcribing ? (
                <ActivityIndicator
                  size="small"
                  color={
                    colors.primary
                  }
                />
              ) : (
                <Mic
                  size={18}
                  color={
                    colors.primary
                  }
                />
              )}

              <Txt
                variant="label"
                color={colors.primary}
                style={{
                  marginRight: 6,
                }}
              >
                {recording
                  ? `جاري التسجيل ${Math.ceil(
                    recorderState.durationMillis /
                    1000,
                  )}ث`
                  : transcribing
                    ? 'تحويل التسجيل إلى نص...'
                    : 'تسجيل صوتي'}
              </Txt>
            </Pressable>

            <Pressable
              style={
                styles.actionPill
              }
              onPress={chooseImage}
              disabled={
                busy || recording
              }
              accessibilityRole="button"
              accessibilityLabel={
                selectedImage
                  ? 'تغيير الصورة'
                  : 'إرفاق صورة'
              }
            >
              <ImagePlus
                size={18}
                color={colors.primary}
              />

              <Txt
                variant="label"
                color={colors.primary}
                style={{
                  marginRight: 6,
                }}
              >
                {selectedImage
                  ? 'تغيير الصورة'
                  : 'إرفاق صورة'}
              </Txt>
            </Pressable>
          </View>

          {/* Error */}
          {error ? (
            <View
              style={
                styles.errorBox
              }
            >
              <Info
                size={18}
                color={colors.error}
              />

              <Txt
                variant="small"
                color={colors.error}
                style={
                  styles.feedbackText
                }
              >
                {error}
              </Txt>
            </View>
          ) : null}

          {/* Main CTA */}
          <Pressable
            onPress={submit}
            disabled={
              busy || recording
            }
            accessibilityRole="button"
            accessibilityLabel="البحث بالذكاء الاصطناعي"
            accessibilityState={{
              disabled:
                busy || recording,
            }}
            style={({
              pressed,
            }) => [
                styles.cta,
                busy &&
                styles.ctaBusy,
                pressed &&
                !busy &&
                !recording &&
                styles.ctaPressed,
              ]}
          >
            {loading ? (
              <>
                <ActivityIndicator
                  color={
                    colors.white
                  }
                />

                <Txt
                  variant="h3"
                  color={
                    colors.white
                  }
                  align="center"
                  style={
                    styles.ctaText
                  }
                >
                  جاري تحليل طلبك...
                </Txt>
              </>
            ) : (
              <>
                <Sparkles
                  size={21}
                  color={
                    colors.mint
                  }
                />

                <Txt
                  variant="h3"
                  color={
                    colors.white
                  }
                  align="center"
                  style={
                    styles.ctaText
                  }
                >
                  ابحث بالذكاء الاصطناعي
                </Txt>

                <Rocket
                  size={19}
                  color={
                    colors.amber
                  }
                />
              </>
            )}
          </Pressable>
        </View>

        {/* Examples */}
        <View
          style={
            styles.exampleHead
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Lightbulb
              size={19}
              color={
                colors.success
              }
            />
          </View>

          <View
            style={
              styles.exampleTitleWrap
            }
          >
            <Txt
              variant="h4"
              style={
                styles.exampleTitle
              }
            >
              أمثلة شائعة من أهل البلد
            </Txt>

            <Txt
              variant="small"
              color={
                colors.muted
              }
            >
              اضغط لتجربة مثال
            </Txt>
          </View>
        </View>

        <HScroll
          contentStyle={{
            paddingBottom: 4,
          }}
        >
          {aiExamples.map(
            (example) => (
              <Pressable
                key={example.id}
                onPress={() => {
                  setText(
                    example.text,
                  );

                  setVoiceTranscribed(
                    false,
                  );

                  setError('');
                }}
                style={
                  styles.example
                }
                disabled={
                  busy || recording
                }
                accessibilityRole="button"
                accessibilityLabel={`تجربة المثال: ${example.text}`}
              >
                <Zap
                  size={15}
                  color={
                    colors.amber
                  }
                  fill={
                    colors.amber
                  }
                />

                <Txt
                  variant="label"
                  weight="500"
                  style={{
                    marginRight: 8,
                  }}
                >
                  {example.text}
                </Txt>
              </Pressable>
            ),
          )}
        </HScroll>

        {/* How AI works */}
        <View style={styles.how}>
          <View
            style={
              styles.howHeader
            }
          >
            <View
              style={
                styles.infoCircle
              }
            >
              <Info
                size={21}
                color={
                  colors.white
                }
              />
            </View>

            <View
              style={
                styles.howTitleWrap
              }
            >
              <Txt
                variant="h2"
                style={
                  styles.howTitle
                }
              >
                كيف بيشتغل الذكاء في مهنتي؟
              </Txt>

              <Txt
                variant="small"
                color={
                  colors.muted
                }
                style={{
                  marginTop: 2,
                }}
              >
                من وصف المشكلة إلى نتائج مناسبة
              </Txt>
            </View>
          </View>

          {aiSteps.map(
            (step, index) => (
              <View
                key={step.id}
                style={
                  styles.step
                }
              >
                <View
                  style={
                    styles.stepNumber
                  }
                >
                  <Txt
                    variant="h3"
                    color={
                      colors.primary
                    }
                    align="center"
                  >
                    {['١', '٢', '٣'][
                      index
                    ]}
                  </Txt>
                </View>

                <View
                  style={
                    styles.stepText
                  }
                >
                  <Txt
                    variant="h4"
                    style={{
                      fontSize: 16,
                    }}
                  >
                    {step.title}
                  </Txt>

                  <Txt
                    variant="small"
                    color={
                      colors.muted
                    }
                    style={{
                      marginTop: 2,
                      lineHeight: 20,
                    }}
                  >
                    {step.text}
                  </Txt>
                </View>
              </View>
            ),
          )}
        </View>

        {/* Trust / status note */}
        <View
          style={
            styles.footerNote
          }
        >
          <View
            style={
              styles.footerItem
            }
          >
            <ShieldCheck
              size={17}
              color={
                colors.muted
              }
            />

            <Txt
              variant="small"
              color={
                colors.muted
              }
              style={{
                marginRight: 6,
              }}
            >
              الذكاء يساعدك على فهم طلبك
            </Txt>
          </View>

          <View
            style={
              styles.footerItem
            }
          >
            <ThumbsUp
              size={17}
              color={
                colors.muted
              }
            />

            <Txt
              variant="small"
              color={
                colors.muted
              }
              style={{
                marginRight: 6,
              }}
            >
              القرار النهائي لك
            </Txt>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  intro: {
    ...row,
    alignItems: 'center',
    backgroundColor: colors.tintStrong,
    borderRadius: radius.lg,
    padding: 14,
  },

  sparkCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  liveDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.tintStrong,
  },

  introText: {
    flex: 1,
    marginRight: 14,
  },

  introTitle: {
    fontSize: 22,
  },

  statusRow: {
    ...row,
    alignItems: 'center',
    marginTop: 5,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
  },

  dark: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: 16,
    marginTop: 14,
  },

  darkHeader: {
    ...row,
    alignItems: 'center',
  },

  chatCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor:
      'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  darkHeaderText: {
    flex: 1,
    marginRight: 12,
  },

  darkBody: {
    marginTop: 12,
    lineHeight: 23,
  },

  inputCard: {
    ...card,
    padding: 14,
    marginTop: 14,
    borderRadius: radius.xl,
  },

  locationRow: {
    ...row,
    alignItems: 'center',
    backgroundColor: colors.tintStrong,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    minHeight: 48,
  },

  locationText: {
    flex: 1,
    marginHorizontal: 8,
  },

  textBox: {
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 12,
    padding: 12,
  },

  textInput: {
    minHeight: 112,
    fontFamily: fontFamilies['500'],
    fontSize: 16,
    lineHeight: 28,
    color: colors.text,
  },

  insight: {
    ...row,
    alignItems: 'center',
    backgroundColor: colors.tintStrong,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 8,
  },

  insightText: {
    flex: 1,
    marginHorizontal: 6,
  },

  voiceSuccess: {
    ...row,
    alignItems: 'flex-start',
    backgroundColor: colors.tint,
    borderRadius: radius.md,
    padding: 10,
    marginTop: 10,
  },

  feedbackText: {
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },

  attachmentPreview: {
    ...row,
    alignItems: 'center',
    backgroundColor: colors.tintStrong,
    borderRadius: radius.md,
    padding: 8,
    marginTop: 10,
  },

  previewImage: {
    width: 58,
    height: 58,
    borderRadius: 10,
  },

  attachmentInfo: {
    flex: 1,
    marginHorizontal: 10,
  },

  actionRow: {
    ...row,
    gap: 10,
  },

  actionPill: {
    ...row,
    flex: 1,
    justifyContent: 'center',
    height: 46,
    backgroundColor: colors.tintStrong,
    borderRadius: radius.full,
  },

  recordingPill: {
    backgroundColor: colors.mint,
  },

  errorBox: {
    ...row,
    alignItems: 'flex-start',
    backgroundColor:
      'rgba(214,69,69,0.08)',
    borderRadius: radius.md,
    padding: 10,
    marginTop: 12,
  },

  cta: {
    ...row,
    justifyContent: 'center',
    height: 58,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    marginTop: 14,
  },

  ctaBusy: {
    opacity: 0.78,
  },

  ctaPressed: {
    opacity: 0.9,
  },

  ctaText: {
    marginHorizontal: 9,
  },

  exampleHead: {
    ...row,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },

  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exampleTitleWrap: {
    flex: 1,
    marginRight: 10,
  },

  exampleTitle: {
    fontSize: 17,
  },

  example: {
    ...row,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    minHeight: 46,
  },

  how: {
    backgroundColor: colors.tintStrong,
    borderRadius: radius.lg,
    padding: 14,
    marginTop: 24,
  },

  howHeader: {
    ...row,
    alignItems: 'center',
    marginBottom: 12,
  },

  infoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  howTitleWrap: {
    flex: 1,
    marginRight: 10,
  },

  howTitle: {
    fontSize: 21,
  },

  step: {
    ...row,
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
  },

  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stepText: {
    flex: 1,
    marginRight: 12,
  },

  footerNote: {
    ...row,
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },

  footerItem: {
    ...row,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});