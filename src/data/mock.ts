export interface Craftsman {
  id: string;
  name: string;
  specialty: string;
  description: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  area: string;
  isOpen: boolean;
  photo: string;
  phone: string;
  priceHint: string;
  priceValue: string;
  fastResponse: boolean;
  keywords: string;
  resultInfo: string;
}

export interface ServiceCategory {
  id: string;
  label: string;
  icon: 'zap' | 'briefcase' | 'car' | 'smartphone' | 'wrench' | 'paint' | 'fan' | 'hammer' | 'brush' | 'truck';
}

export interface PriceService {
  id: string;
  title: string;
  description: string;
  duration: string;
  priceRange: string;
  priceNote: string;
  icon: 'washer' | 'dishes' | 'settings' | 'toolbox';
}

export interface Review {
  id: string;
  author: string;
  meta: string;
  photo?: string;
  initial?: string;
  rating: number;
  text: string;
  tags: string[];
  helpful: number;
  time: string;
  note: string;
}

export interface TopReview {
  id: string;
  craftsmanId: string;
  quote: string;
  author: string;
  footer: string;
}

const photo = (id: string): string => `https://images.unsplash.com/photo-${id}?w=400&q=80&fit=crop`;

export const coverPhoto = photo('1635173317095-17fdb1299476');

export const categories: ServiceCategory[] = [
  { id: 'electric', label: 'كهرباء', icon: 'zap' },
  { id: 'appliances', label: 'صيانة أجهزة', icon: 'briefcase' },
  { id: 'cars', label: 'سيارات', icon: 'car' },
  { id: 'tech', label: 'هواتف وتقنية', icon: 'smartphone' },
  { id: 'plumbing', label: 'سباكة ومياه', icon: 'wrench' },
  { id: 'paint', label: 'دهان وديكور', icon: 'paint' },
  { id: 'ac', label: 'تكييف وتبريد', icon: 'fan' },
  { id: 'carpentry', label: 'نجارة وأثاث', icon: 'hammer' },
  { id: 'cleaning', label: 'تنظيف منزلي', icon: 'brush' },
  { id: 'moving', label: 'نقل وعفش', icon: 'truck' },
];

export const craftsmen: Craftsman[] = [
  {
    id: 'c1',
    name: 'المهندس أسامة الحلبي',
    specialty: 'فني صيانة غسالات وأجهزة منزلية وكهرباء',
    description: 'فني في صيانة غسالات وأجهزة منزلية معتمدة',
    rating: 4.9,
    reviewCount: 128,
    distanceKm: 1.2,
    area: 'حي الإرسال',
    isOpen: true,
    photo: photo('1624697330553-3a4cca85514c'),
    phone: '+970598765432',
    priceHint: 'معاينة فنية ميدانية',
    priceValue: '30 شيكل (تُخصم عند التصليح)',
    fastResponse: true,
    keywords: 'صيانة غسالات أجهزة كهرباء إل جي سامسونج بوش',
    resultInfo: 'كفالة صيانة 30 يوماً معتمدة',
  },
  {
    id: 'c2',
    name: 'ورشة النور للكهرباء والتمديدات',
    specialty: 'كهرباء عام وتمديدات ذكية للشقق والمحلات',
    description: 'كهربائي عام وتمديدات ذكية للشقق والمحلات',
    rating: 4.8,
    reviewCount: 94,
    distanceKm: 2.1,
    area: 'الماصيون',
    isOpen: true,
    photo: photo('1709381120033-86deda767904'),
    phone: '+970597111222',
    priceHint: 'فحص وتحديد أعطال',
    priceValue: 'كشفية واضحة 40 ₪',
    fastResponse: false,
    keywords: 'كهرباء تمديدات إنارة',
    resultInfo: 'فحص دقيق للأعطال وتقدير مسبق',
  },
  {
    id: 'c3',
    name: 'مركز القدس للتكييف والتبريد',
    specialty: 'تركيب وتنظيف وصيانة أجهزة التكييف المركزي والسبليت',
    description: 'تركيب وتنظيف وصيانة أجهزة التكييف المركزي والسبليت',
    rating: 4.9,
    reviewCount: 210,
    distanceKm: 0.8,
    area: 'عين منجد',
    isOpen: true,
    photo: photo('1600896903045-3d373014baa3'),
    phone: '+970599333444',
    priceHint: 'غسيل وصيانة دورية',
    priceValue: 'تبدأ من 70 ₪',
    fastResponse: false,
    keywords: 'تكييف تبريد سبليت',
    resultInfo: 'صيانة دورية مع ضمان على القطع',
  },
  {
    id: 'c4',
    name: 'ورشة الأمانة لصيانة الأجهزة',
    specialty: 'متخصص صيانة غسالات وماتورات',
    description: 'متخصص صيانة غسالات وماتورات',
    rating: 4.8,
    reviewCount: 89,
    distanceKm: 2.2,
    area: 'شارع القدس',
    isOpen: true,
    photo: photo('1611737716329-69c2bb3056b9'),
    phone: '+970592555666',
    priceHint: 'كشفية',
    priceValue: '40 ₪',
    fastResponse: false,
    keywords: 'صيانة غسالات ماتورات أجهزة',
    resultInfo: 'ضمان على القطع المستبدلة',
  },
  {
    id: 'c5',
    name: 'فادي بركات',
    specialty: 'فني صيانة عامة وأجهزة منزلية',
    description: 'فني صيانة عامة وأجهزة منزلية',
    rating: 4.7,
    reviewCount: 62,
    distanceKm: 3.0,
    area: 'البيرة',
    isOpen: false,
    photo: photo('1748640857970-35c0c1e8413e'),
    phone: '+970594777888',
    priceHint: 'كشفية',
    priceValue: '30 ₪',
    fastResponse: false,
    keywords: 'صيانة عامة أجهزة منزلية',
    resultInfo: 'زيارة منزلية شاملة',
  },
  {
    id: 'c6',
    name: 'مركز الأقصى الفني',
    specialty: 'صيانة عامة للأجهزة الكبيرة، قطع غيار أصلية متوفرة',
    description: 'صيانة عامة للأجهزة الكبيرة، قطع غيار أصلية متوفرة',
    rating: 4.8,
    reviewCount: 76,
    distanceKm: 1.8,
    area: 'شارع الإرسال',
    isOpen: true,
    photo: photo('1647598378432-1aa8fa34f37f'),
    phone: '+970595999000',
    priceHint: 'فحص كمبيوتر',
    priceValue: 'مجاني مع الإصلاح',
    fastResponse: false,
    keywords: 'صيانة غسالات أجهزة كبيرة قطع غيار',
    resultInfo: 'فريق فني مرخص + فحص كمبيوتر دقيق للأعطال',
  },
  {
    id: 'c7',
    name: 'ورشة حسونة للأجهزة',
    specialty: 'تصليح أعطال الكروت الإلكترونية والمحركات وتغيير القطع',
    description: 'تصليح أعطال الكروت الإلكترونية والمحركات وتغيير القطع',
    rating: 4.7,
    reviewCount: 110,
    distanceKm: 2.5,
    area: 'عين مصباح',
    isOpen: true,
    photo: photo('1723295635856-8f34995c78f3'),
    phone: '+970596121212',
    priceHint: 'كشفية',
    priceValue: '35 ₪',
    fastResponse: false,
    keywords: 'صيانة غسالات كروت إلكترونية محركات',
    resultInfo: 'خدمة استلام وإرجاع الغسالة للورشة متاحة',
  },
  {
    id: 'c8',
    name: 'محل السلام لقطع الغيار',
    specialty: 'بيع قطع الغيار الأصلية مع فنيين لتركيبها وفحصها',
    description: 'بيع قطع الغيار الأصلية مع فنيين لتركيبها وفحصها',
    rating: 4.6,
    reviewCount: 45,
    distanceKm: 3.2,
    area: 'بيتونيا',
    isOpen: false,
    photo: photo('1713450604431-fcbfcb4209d3'),
    phone: '+970593343434',
    priceHint: 'قطع',
    priceValue: 'حسب الصنف',
    fastResponse: false,
    keywords: 'صيانة غسالات قطع غيار أجهزة',
    resultInfo: 'قطع أصلية ومضمونة لجميع الماركات',
  },
  {
    id: 'c9',
    name: 'سباكة القدس',
    specialty: 'سباكة وصيانة شبكات المياه',
    description: 'سباكة وصيانة شبكات المياه',
    rating: 4.7,
    reviewCount: 58,
    distanceKm: 2.6,
    area: 'مدينة البيرة',
    isOpen: true,
    photo: photo('1785568485066-cc127f7e8aeb'),
    phone: '+970597454545',
    priceHint: 'معاينة',
    priceValue: '25 ₪',
    fastResponse: false,
    keywords: 'سباكة مياه',
    resultInfo: 'ضمان على التمديدات',
  },
  {
    id: 'c10',
    name: 'المركز الفني',
    specialty: 'صيانة سيارات وفحص كمبيوتر',
    description: 'صيانة سيارات وفحص كمبيوتر',
    rating: 4.6,
    reviewCount: 41,
    distanceKm: 3.4,
    area: 'الماصيون',
    isOpen: true,
    photo: photo('1647598378229-a0ec16456b1d'),
    phone: '+970598565656',
    priceHint: 'فحص',
    priceValue: '30 ₪',
    fastResponse: false,
    keywords: 'سيارات فحص',
    resultInfo: 'فحص شامل قبل الإصلاح',
  },
];

export const getCraftsman = (id: string): Craftsman => {
  const found = craftsmen.find((item) => item.id === id);
  return found ? found : craftsmen[0];
};

export const topReviews: TopReview[] = [
  {
    id: 't1',
    craftsmanId: 'c9',
    quote: 'زلمة محترم وأمين، إجا بنفس الساعة وصلّح خط المي بدون ما يكسر ولا بلاطة بالحمام.',
    author: 'أحمد من البيرة',
    footer: 'كشفية معاينة واضحة',
  },
  {
    id: 't2',
    craftsmanId: 'c2',
    quote: 'شغلهم نظيف وسريع، ركبوا لنا الإنارة الذكية بالشقة وطلع الشغل ممتاز.',
    author: 'ليلى من الطيرة',
    footer: 'استشارة مجانية',
  },
];

export const priceServices: PriceService[] = [
  {
    id: 's1',
    title: 'صيانة غسالات أوتوماتيك متقدمة',
    description: 'معالجة مشاكل عصر الملابس، تهريب المياه، صيانة أو برمجة البورد الإلكتروني.',
    duration: 'المدة المتوقعة: 45 - 90 دقيقة',
    priceRange: '₪120 - ₪250',
    priceNote: 'حسب العطل والقطع',
    icon: 'washer',
  },
  {
    id: 's2',
    title: 'صيانة نشافات وجلايات صحون',
    description: 'تبديل هيترات التسخين، حساسات الحرارة، مضخات التصريف، وفلاتر الأمان.',
    duration: 'المدة المتوقعة: 60 دقيقة',
    priceRange: '₪100 - ₪180',
    priceNote: 'استرشادي',
    icon: 'dishes',
  },
  {
    id: 's3',
    title: 'فحص محركات وتغيير رولمان بلي (Bearing)',
    description: 'حل مشكلة الصوت العالي والاهتزاز أثناء التنشيف بمعدات سحب المانية وهيدروليكية.',
    duration: 'ضمان 6 شهور على القطع',
    priceRange: '₪180 - ₪320',
    priceNote: 'شامل الصوف والبولنج',
    icon: 'settings',
  },
  {
    id: 's4',
    title: 'كشف منزلي ومعاينة فنية فورية',
    description: 'زيارة ميدانية شاملة فحص حقيقية بالجهاز الإلكتروني داخل رام الله والبيرة وبيتونيا.',
    duration: 'تخصم من قيمة التصليح عند التنفيذ',
    priceRange: '₪50',
    priceNote: 'كشفية استرشادية',
    icon: 'toolbox',
  },
];

export const ratingBars: { stars: number; percent: number }[] = [
  { stars: 5, percent: 90 },
  { stars: 4, percent: 8 },
  { stars: 3, percent: 2 },
  { stars: 2, percent: 0 },
  { stars: 1, percent: 0 },
];

export const reviews: Review[] = [
  {
    id: 'r1',
    author: 'أحمد البرغوثي',
    meta: 'رام الله • خدمة صيانة غسالة LG',
    photo: photo('1647598378432-1aa8fa34f37f'),
    rating: 5,
    text: 'إنسان محترم ومتقن لعمله جداً. الغسالة كانت بتعمل صوت طحن وما بتعصر، فحص البرود والماتور وغير قطعة التنشيف بنفس اليوم. التكلفة كانت واضحة ومنصفة وما أخذ كشفية زيادة.',
    tags: ['سعر منصف', 'إتقان وسرعة'],
    helpful: 14,
    time: 'منذ يومين',
    note: 'تم التحقق من الفاتورة الرقمية',
  },
  {
    id: 'r2',
    author: 'أم تامر',
    meta: 'حي الإرسال • البيرة • إصلاح جلاية',
    initial: 'ت',
    rating: 5,
    text: 'بارك الله فيه، ملتزم بالميعاد بالضبط. اتصلنا فيه الصبح وإجا بعد الظهر وحل مشكلة تسريب المي من الجلاية، ورجع المكان أنظف مما كان. يعطيه ألف عافية.',
    tags: ['دقة في الموعد', 'شغل نظيف'],
    helpful: 8,
    time: 'منذ أسبوع',
    note: 'طلب مكتمل ومؤكد',
  },
  {
    id: 'r3',
    author: 'طارق ناصر الدين',
    meta: 'الماصيون • رام الله • تبديل مضخة غسالة',
    photo: photo('1709381120033-86deda767904'),
    rating: 4.5,
    text: 'شغل ممتاز ونظيف، الكشفية معقولة وقطع الغيار أصلية مع فاتورة وضمانة لمدة ستة أشهر. تأخر حوالي ربع ساعة عن الموعد بسبب أزمة حاجز سردا لكنه اتصل واعتذر مسبقاً.',
    tags: ['قطع أصلية', 'أمين ومحترم'],
    helpful: 19,
    time: 'منذ أسبوعين',
    note: 'ضمانة مهنتي 6 شهور سارية',
  },
];

export const reviewQualityTags: string[] = ['سريع وملتزم', 'سعر منصف', 'شغل نظيف', 'أمين ومحترم'];

export const aiExamples: { id: string; text: string }[] = [
  { id: 'e1', text: 'عندي عطل كهرباء بالقواطع الرئيسية' },
  { id: 'e2', text: 'ماسورة مي مكسورة بالمطبخ' },
  { id: 'e3', text: 'التكييف ما بيبرد وبطلع ريحة' },
  { id: 'e4', text: 'بدي حدا يركب خزانة غرفة نوم' },
];

export const aiSteps: { id: string; title: string; text: string }[] = [
  {
    id: '1',
    title: 'فهم المشكلة تلقائياً بدون تعقيد',
    text: 'الذكاء الاصطناعي بيقرأ حكيك العامي ويحدد التخصص الفني والقطع التقريبية المحتاجة.',
  },
  {
    id: '2',
    title: 'فحص سجل ومهارات المهنيين القريبين',
    text: 'بتراجع خبرات الصنايعية والمحلات القريبة منك جغرافياً في الضفة وغزة لسرعة الوصول.',
  },
  {
    id: '3',
    title: 'ترشيح أفضل 3 مطابقات مع تقييماتهم الحقيقية',
    text: 'تحصل على أدق 3 خيارات موثوقة من جيرانك بدون وساطة وبدون أي تلاعب بالأسعار والتقييم.',
  },
];
