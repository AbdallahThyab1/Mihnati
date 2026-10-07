const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8',
};

const GEMINI_MODEL = 'gemini-3.5-flash-lite';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';

const fallbackCategories = [
  { id: 'electric', label: 'كهرباء' },
  { id: 'appliances', label: 'صيانة أجهزة' },
  { id: 'cars', label: 'سيارات' },
  { id: 'tech', label: 'هواتف وتقنية' },
  { id: 'plumbing', label: 'سباكة ومياه' },
  { id: 'paint', label: 'دهان وديكور' },
  { id: 'ac', label: 'تكييف وتبريد' },
  { id: 'carpentry', label: 'نجارة وأثاث' },
  { id: 'cleaning', label: 'تنظيف منزلي' },
  { id: 'moving', label: 'نقل وعفش' },
];

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

const getOutputText = (result: any): string | null => {
  if (typeof result?.output_text === 'string' && result.output_text.trim()) {
    return result.output_text.trim();
  }

  const steps = Array.isArray(result?.steps) ? result.steps : [];
  for (const step of steps) {
    const content = Array.isArray(step?.content) ? step.content : [];
    for (const item of content) {
      if (item?.type === 'text' && typeof item?.text === 'string' && item.text.trim()) {
        return item.text.trim();
      }
    }
  }

  return null;
};

const callGemini = async (body: Record<string, unknown>, apiKey: string) => {
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Gemini error:', result);
    throw new Error(result?.error?.message ?? 'Gemini request failed.');
  }

  return result;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ message: 'Method not allowed' }, 405);
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return jsonResponse({ message: 'GEMINI_API_KEY is not configured.' }, 500);
    }

    const body = await req.json();
    const mode = body.mode === 'transcribe' ? 'transcribe' : 'search';

    const audioBase64 = typeof body.audioBase64 === 'string' ? body.audioBase64 : null;
    const audioMimeType =
      typeof body.audioMimeType === 'string' && body.audioMimeType.trim()
        ? body.audioMimeType
        : 'audio/m4a';

    if (mode === 'transcribe') {
      if (!audioBase64) {
        return jsonResponse({ message: 'No audio was provided for transcription.' }, 400);
      }

      const transcriptionPrompt = `
حوّل التسجيل الصوتي التالي إلى نص عربي واضح.

القواعد:
- اكتب الكلام المنطوق فقط.
- حافظ على اللهجة الفلسطينية والكلمات العامية المهمة.
- صحح التلعثم والتكرار غير المفيد فقط حتى يصبح النص سهل القراءة.
- لا تضف أي معلومة لم يقلها المتحدث.
- لا تشخّص العطل ولا تشرح الحل.
- إذا ذكر المتحدث اسم جهاز أو ماركة أو منطقة، حافظ عليه كما قيل.
- أخرج النص فقط بدون مقدمة وبدون علامات اقتباس.
`.trim();

      try {
        const result = await callGemini(
          {
            model: GEMINI_MODEL,
            input: [
              { type: 'text', text: transcriptionPrompt },
              {
                type: 'audio',
                data: audioBase64,
                mime_type: audioMimeType,
              },
            ],
            store: false,
          },
          geminiApiKey,
        );

        const transcript = getOutputText(result);

        if (!transcript) {
          return jsonResponse({ message: 'Gemini returned an empty transcription.' }, 502);
        }

        return jsonResponse({ transcript });
      } catch (error) {
        return jsonResponse(
          {
            message: 'Gemini transcription failed.',
            details: error instanceof Error ? error.message : 'Unknown Gemini error.',
          },
          502,
        );
      }
    }

    const text = typeof body.text === 'string' ? body.text.trim() : '';
    const location =
      typeof body.location === 'string' && body.location.trim() ? body.location.trim() : 'غير محدد';
    const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : null;
    const imageMimeType =
      typeof body.imageMimeType === 'string' && body.imageMimeType.trim()
        ? body.imageMimeType
        : 'image/jpeg';
    const inputCategories =
      Array.isArray(body.categories) && body.categories.length > 0
        ? body.categories
        : fallbackCategories;

    if (!text && !imageBase64) {
      return jsonResponse({ message: 'No input was provided.' }, 400);
    }

    const categoriesText = inputCategories
      .map((item: { id: string; label: string }) => `- ${item.id}: ${item.label}`)
      .join('\n');

    const prompt = `
أنت محرك فهم الطلبات في تطبيق "مِهنتي" الفلسطيني.
مهمتك فهم طلب المستخدم وتحويله إلى intent منظم للبحث داخل بيانات مِهنتي.

قواعد مهمة:
1) لا تشخّص العطل بشكل قطعي.
2) لا تعطِ تعليمات إصلاح خطرة.
3) لا تخترع أي مهني أو محل.
4) categoryId يجب أن يكون واحدًا من الفئات المتاحة أدناه فقط.
5) service اسم خدمة واضح وقابل للبحث بالعربية.
6) keywords كلمات قصيرة ومفيدة مستخرجة من الطلب، ويفضل من 2 إلى 8 كلمات.
7) location استخرج الموقع من كلام المستخدم إن ذكره؛ وإلا استخدم الموقع الافتراضي.
8) summary جملة قصيرة تصف ما فهمته من الطلب دون ادعاء تشخيص نهائي.
9) إذا وُجدت صورة، استخدمها كمعلومة إضافية لفهم نوع المشكلة أو الخدمة، ولا تستنتج تشخيصًا قطعيًا منها.
10) لا تذكر اسم أي مقدم خدمة من نفسك.

الفئات المتاحة:
${categoriesText}

الموقع الافتراضي:
${location}

نص المستخدم:
${text || '(لا يوجد نص)'}
`.trim();

    const input = [{ type: 'text', text: prompt }] as Array<Record<string, string>>;

    if (imageBase64) {
      input.push({
        type: 'image',
        data: imageBase64,
        mime_type: imageMimeType,
      });
    }

    const schema = {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          description: 'A concise searchable service name in Arabic.',
        },
        categoryId: {
          type: 'string',
          enum: inputCategories.map((item: { id: string }) => item.id),
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
        },
        location: { type: 'string' },
        summary: { type: 'string' },
      },
      required: ['service', 'categoryId', 'keywords', 'location', 'summary'],
      additionalProperties: false,
    };

    let result: any;

    try {
      result = await callGemini(
        {
          model: GEMINI_MODEL,
          input,
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema,
          },
          store: false,
        },
        geminiApiKey,
      );
    } catch (error) {
      return jsonResponse(
        {
          message: 'Gemini request failed.',
          details: error instanceof Error ? error.message : 'Unknown Gemini error.',
        },
        502,
      );
    }

    const outputText = getOutputText(result);

    if (!outputText) {
      return jsonResponse({ message: 'Gemini returned an empty response.' }, 502);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(outputText);
    } catch (parseError) {
      console.error('Invalid Gemini JSON:', outputText, parseError);
      return jsonResponse({ message: 'Gemini returned invalid JSON.' }, 502);
    }

    const validCategoryIds = inputCategories.map((item: { id: string }) => item.id);
    const categoryId = typeof parsed.categoryId === 'string' ? parsed.categoryId : '';
    const keywords = Array.isArray(parsed.keywords)
      ? parsed.keywords
          .filter((item: unknown): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

    if (
      typeof parsed.service !== 'string' ||
      !validCategoryIds.includes(categoryId) ||
      typeof parsed.location !== 'string' ||
      typeof parsed.summary !== 'string' ||
      keywords.length === 0
    ) {
      return jsonResponse(
        { message: 'Gemini response did not match the expected search intent.' },
        502,
      );
    }

    return jsonResponse({
      service: parsed.service.trim(),
      categoryId,
      keywords,
      location: parsed.location.trim(),
      summary: parsed.summary.trim(),
    });
  } catch (error) {
    console.error('mihnati-ai error:', error);
    return jsonResponse(
      {
        message: error instanceof Error ? error.message : 'Unexpected server error.',
      },
      500,
    );
  }
});
