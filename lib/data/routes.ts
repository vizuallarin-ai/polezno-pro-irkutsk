import type { RouteCategory } from "@/types/map";

export type RouteDifficulty = "easy" | "medium" | "hard";
export type RouteFormat = "walking" | "gastro" | "author" | "baikal";

export type RouteFilterId =
  | "all"
  | "free"
  | "paid"
  | "walking"
  | "1-2h"
  | "half-day"
  | "first-visit"
  | "architecture"
  | "history"
  | "gastro"
  | "baikal-nearby"
  | "locals";

export interface RoutePoint {
  id: string;
  order: number;
  title: string;
  description: string;
  whatToNotice: string;
  time?: string;
  coordinates: { lat: number; lng: number };
  image?: string;
}

export interface Route {
  id: string;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  format: RouteFormat;
  mapCategory: RouteCategory;
  type: "free" | "paid";
  price?: number;
  /** minutes */
  duration: number;
  /** km */
  distance: number;
  pointsCount: number;
  difficulty: RouteDifficulty;
  tags: string[];
  filters: RouteFilterId[];
  coverImage?: string;
  /** GeoJSON order: [lng, lat] */
  routeLine: [number, number][];
  points: RoutePoint[];
}

export const ROUTE_DIFFICULTY_LABELS: Record<RouteDifficulty, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
};

export const ROUTE_FORMAT_LABELS: Record<RouteFormat, string> = {
  walking: "Пеший",
  gastro: "Гастро",
  author: "Авторский",
  baikal: "Байкал рядом",
};

export const ROUTE_FILTERS: Array<{ id: RouteFilterId; label: string }> = [
  { id: "all", label: "Все" },
  { id: "free", label: "Бесплатные" },
  { id: "paid", label: "Платные" },
  { id: "walking", label: "Пешие" },
  { id: "1-2h", label: "1–2 ч" },
  { id: "half-day", label: "Полдня" },
  { id: "first-visit", label: "Первое знакомство" },
  { id: "architecture", label: "Архитектура" },
  { id: "history", label: "История" },
  { id: "gastro", label: "Гастро" },
  { id: "baikal-nearby", label: "Байкал рядом" },
  { id: "locals", label: "Для местных" },
];

export const DEMO_ROUTES: Route[] = [
  {
    id: "route-irkutsk-first-morning",
    slug: "irkutsk-first-morning",
    title: "Иркутск за первое утро",
    description:
      "Короткий маршрут для первого знакомства с городом: центр, деревянные дома, набережная и несколько мест для кофе.",
    fullDescription:
      "Два часа без спешки: от площади Кирова к набережной Ангары. Увидите, как устроен центр, где спрятаны деревянные фасады и куда зайти за кофе, пока город просыпается.",
    format: "walking",
    mapCategory: "history",
    type: "free",
    duration: 120,
    distance: 3.2,
    pointsCount: 7,
    difficulty: "easy",
    tags: ["первое знакомство", "центр", "набережная"],
    filters: ["free", "walking", "1-2h", "first-visit", "history"],
    coverImage: "/images/map-preview.svg",
    routeLine: [
      [104.2802, 52.2891],
      [104.2835, 52.2912],
      [104.2878, 52.2935],
      [104.2921, 52.2958],
      [104.2968, 52.2972],
      [104.3012, 52.2985],
      [104.3045, 52.2998],
    ],
    points: [
      {
        id: "ifm-1",
        order: 1,
        title: "Площадь Кирова",
        description:
          "Стартовая точка: отсюда видно, как центр связан с Ангарой и где проходит главная ось города.",
        whatToNotice: "Фонтан, вид на реку и здание администрации — ориентир на весь маршрут.",
        time: "15 мин",
        coordinates: { lat: 52.2891, lng: 104.2802 },
      },
      {
        id: "ifm-2",
        order: 2,
        title: "Улица Ленина",
        description:
          "Купеческая застройка и витрины: здесь чувствуется ритм будничного центра, не туристическая витрина.",
        whatToNotice: "Смотрите на вторые этажи — там часто сохранились старые вывески и балконы.",
        time: "20 мин",
        coordinates: { lat: 52.2912, lng: 104.2835 },
      },
      {
        id: "ifm-3",
        order: 3,
        title: "Дом-усадьба Шастина",
        description:
          "Один из узнаваемых деревянных домов центра — хороший пример того, как город выглядел до массовой застройки.",
        whatToNotice: "Резные наличники на угловых окнах и высокий цоколь.",
        time: "10 мин",
        coordinates: { lat: 52.2935, lng: 104.2878 },
      },
      {
        id: "ifm-4",
        order: 4,
        title: "Спасская церковь",
        description:
          "Белокаменный акцент среди деревянных линий — точка, где история города читается сразу.",
        whatToNotice: "Контраст материалов и масштаб относительно соседних домов.",
        time: "15 мин",
        coordinates: { lat: 52.2958, lng: 104.2921 },
      },
      {
        id: "ifm-5",
        order: 5,
        title: "Набережная Ангары",
        description:
          "Прогулка вдоль воды: здесь понятно, почему Иркутск всегда жил лицом к реке.",
        whatToNotice: "Скамейки у воды и вид на правый берег — удобная пауза.",
        time: "25 мин",
        coordinates: { lat: 52.2972, lng: 104.2968 },
      },
      {
        id: "ifm-6",
        order: 6,
        title: "130-й квартал (вход)",
        description:
          "Короткий заход в квартал: деревянная застройка, кафе и атмосфера «нового старого» центра.",
        whatToNotice: "Арки между домами и мелкие дворики — не проходите только по главной аллее.",
        time: "20 мин",
        coordinates: { lat: 52.2985, lng: 104.3012 },
      },
      {
        id: "ifm-7",
        order: 7,
        title: "Кофе на финише",
        description:
          "Завершение у локальной кофейни: время сверить впечатления и спланировать второй день.",
        whatToNotice: "Спросите бариста про десерт с брусникой — частый местный выбор.",
        time: "15 мин",
        coordinates: { lat: 52.2998, lng: 104.3045 },
      },
    ],
  },
  {
    id: "route-wooden-irkutsk",
    slug: "wooden-irkutsk",
    title: "Деревянный Иркутск",
    description:
      "Маршрут по домам, резьбе, дворам и деталям, которые легко пройти мимо без пояснений.",
    fullDescription:
      "Девять точек в историческом квартале и соседних улицах. Разбираем, как читать деревянный дом: карниз, наличник, двор, легенды — без сухого музейного тона.",
    format: "walking",
    mapCategory: "wooden",
    type: "paid",
    price: 490,
    duration: 150,
    distance: 3.8,
    pointsCount: 9,
    difficulty: "medium",
    tags: ["деревянное зодчество", "резьба", "дворы"],
    filters: ["paid", "walking", "1-2h", "architecture"],
    coverImage: "/images/map-preview.svg",
    routeLine: [
      [104.2785, 52.2875],
      [104.282, 52.2895],
      [104.286, 52.2918],
      [104.2905, 52.2942],
      [104.2945, 52.2965],
      [104.2985, 52.2988],
      [104.302, 52.3005],
      [104.3055, 52.3018],
      [104.308, 52.303],
    ],
    points: [
      {
        id: "wi-1",
        order: 1,
        title: "Вход в 130-й квартал",
        description: "С чего начинается «деревянный» Иркутск в глазах горожанина.",
        whatToNotice: "Сравните высоту домов и шаг крыш — ритм квартала.",
        time: "10 мин",
        coordinates: { lat: 52.2875, lng: 104.2785 },
      },
      {
        id: "wi-2",
        order: 2,
        title: "Дом с резным крыльцом",
        description: "Классический наличник и крыльцо — эталон для сравнения дальше.",
        whatToNotice: "Узор на наличниках не повторяется случайно — ищите парные мотивы.",
        time: "15 мин",
        coordinates: { lat: 52.2895, lng: 104.282 },
      },
      {
        id: "wi-3",
        order: 3,
        title: "Тихий двор-колодец",
        description: "Двор, куда редко заходят прохожие с главной улицы.",
        whatToNotice: "Старые сараи, лестницы и линии проводов как часть истории.",
        time: "15 мин",
        coordinates: { lat: 52.2918, lng: 104.286 },
      },
      {
        id: "wi-4",
        order: 4,
        title: "Дом Шастина",
        description: "Один из самых фотографируемых деревянных домов — разберём, почему.",
        whatToNotice: "Угловое окно и обрамление портала.",
        time: "12 мин",
        coordinates: { lat: 52.2942, lng: 104.2905 },
      },
      {
        id: "wi-5",
        order: 5,
        title: "Улица Декабристов",
        description: "Линия домов с разными эпохами ремонта — урок честности фасада.",
        whatToNotice: "Где дерево под штукатуркой, а где — настоящая доска.",
        time: "18 мин",
        coordinates: { lat: 52.2965, lng: 104.2945 },
      },
      {
        id: "wi-6",
        order: 6,
        title: "Музей «Суконный ситец»",
        description: "Контекст купечества и торговли — зачем строили такие дома.",
        whatToNotice: "Высота потолков и ширина окон в соседних зданиях.",
        time: "15 мин",
        coordinates: { lat: 52.2988, lng: 104.2985 },
      },
      {
        id: "wi-7",
        order: 7,
        title: "Дом с башенкой",
        description: "Редкий силуэт для Иркутска — обсудим, откуда взялась форма.",
        whatToNotice: "Масштаб башенки относительно основного объёма.",
        time: "12 мин",
        coordinates: { lat: 52.3005, lng: 104.302 },
      },
      {
        id: "wi-8",
        order: 8,
        title: "Переулок с граффити",
        description: "Как современный слой соседствует с деревом, не споря с ним.",
        whatToNotice: "Контраст цвета на стенах сараев и тени от карнизов.",
        time: "10 мин",
        coordinates: { lat: 52.3018, lng: 104.3055 },
      },
      {
        id: "wi-9",
        order: 9,
        title: "Финиш у Ангары",
        description: "Выход к набережной — время собрать любимый дом маршрута.",
        whatToNotice: "Вид на реку как награда за внимательную прогулку.",
        time: "15 мин",
        coordinates: { lat: 52.303, lng: 104.308 },
      },
    ],
  },
  {
    id: "route-not-for-postcards",
    slug: "not-for-postcards",
    title: "Иркутск не для открыток",
    description:
      "Маршрут по местам, где город становится живым: дворы, старые фасады, тихие улицы и неожиданные истории.",
    fullDescription:
      "Авторский маршрут без «открыточных» ракурсов. Восемь точек — про дворы, рабочие улицы и детали, которые не попадают в путеводители, но формируют характер города.",
    format: "author",
    mapCategory: "hidden",
    type: "paid",
    price: 590,
    duration: 180,
    distance: 4.5,
    pointsCount: 8,
    difficulty: "medium",
    tags: ["дворы", "локальный взгляд", "авторский"],
    filters: ["paid", "walking", "locals", "history"],
    coverImage: "/images/map-preview.svg",
    routeLine: [
      [104.275, 52.291],
      [104.279, 52.2935],
      [104.2835, 52.2955],
      [104.288, 52.297],
      [104.2925, 52.2985],
      [104.297, 52.2995],
      [104.301, 52.3008],
      [104.305, 52.302],
    ],
    points: [
      {
        id: "np-1",
        order: 1,
        title: "Двор за гостиницей",
        description: "Точка, где центр внезапно становится тихим и бытовым.",
        whatToNotice: "Звук города меняется за один проём арки.",
        time: "15 мин",
        coordinates: { lat: 52.291, lng: 104.275 },
      },
      {
        id: "np-2",
        order: 2,
        title: "Складской переулок",
        description: "Следы торговли и логистики в каменных и деревянных стенах.",
        whatToNotice: "Ширина проезда и старые ворота.",
        time: "20 мин",
        coordinates: { lat: 52.2935, lng: 104.279 },
      },
      {
        id: "np-3",
        order: 3,
        title: "Фасад без рекламы",
        description: "Редкий случай, когда здание говорит само за себя.",
        whatToNotice: "Патина дерева и следы старых вывесок.",
        time: "15 мин",
        coordinates: { lat: 52.2955, lng: 104.2835 },
      },
      {
        id: "np-4",
        order: 4,
        title: "Лестница во двор",
        description: "Иркутск любит высоту: лестницы как отдельный жанр.",
        whatToNotice: "Перила и ступени из разных эпох.",
        time: "12 мин",
        coordinates: { lat: 52.297, lng: 104.288 },
      },
      {
        id: "np-5",
        order: 5,
        title: "Стена с историей",
        description: "Граффити, трещины и штукатурка — хроника без таблички.",
        whatToNotice: "Слои краски как слои времени.",
        time: "18 мин",
        coordinates: { lat: 52.2985, lng: 104.2925 },
      },
      {
        id: "np-6",
        order: 6,
        title: "Окно в чужой сад",
        description: "Момент, когда город делится зеленью, а не только фасадами.",
        whatToNotice: "Как дворики держат микроклимат в жару.",
        time: "15 мин",
        coordinates: { lat: 52.2995, lng: 104.297 },
      },
      {
        id: "np-7",
        order: 7,
        title: "Трамвайная линия",
        description: "Ритм улицы, который чувствуешь телом, не из фото.",
        whatToNotice: "Остановка и звук рельсов как часть маршрута.",
        time: "20 мин",
        coordinates: { lat: 52.3008, lng: 104.301 },
      },
      {
        id: "np-8",
        order: 8,
        title: "Тихий выход к Ангаре",
        description: "Финал без толпы — награда за внимательный маршрут.",
        whatToNotice: "Последний взгляд на воду перед возвратом в центр.",
        time: "15 мин",
        coordinates: { lat: 52.302, lng: 104.305 },
      },
    ],
  },
  {
    id: "route-gastro-center",
    slug: "gastro-center",
    title: "Гастро-прогулка по центру",
    description:
      "Куда зайти за кофе, локальной кухней, десертом и атмосферой после прогулки по центру.",
    fullDescription:
      "Шесть остановок — не рейтинг «топ-10», а связный день: кофе, сытная точка, десерт и место, куда вернуться вечером. Всё в пешей доступности от центра.",
    format: "gastro",
    mapCategory: "gastronomy",
    type: "free",
    duration: 120,
    distance: 2.4,
    pointsCount: 6,
    difficulty: "easy",
    tags: ["еда", "кофе", "центр"],
    filters: ["free", "gastro", "1-2h", "walking"],
    coverImage: "/images/map-preview.svg",
    routeLine: [
      [104.281, 52.2888],
      [104.2855, 52.2905],
      [104.29, 52.2928],
      [104.2945, 52.295],
      [104.299, 52.2975],
      [104.303, 52.2992],
    ],
    points: [
      {
        id: "gc-1",
        order: 1,
        title: "Утренний кофе",
        description: "Старт с обжарки местного зерна — без очереди туристов, если прийти рано.",
        whatToNotice: "Меню на русском и английском — смотрите сезонные напитки.",
        time: "20 мин",
        coordinates: { lat: 52.2888, lng: 104.281 },
      },
      {
        id: "gc-2",
        order: 2,
        title: "Булочная у рынка",
        description: "Проверка, как город ест на бегу: выпечка, пироги, быстрый перекус.",
        whatToNotice: "Витрина меняется к обеду — приходите до 12:00.",
        time: "15 мин",
        coordinates: { lat: 52.2905, lng: 104.2855 },
      },
      {
        id: "gc-3",
        order: 3,
        title: "Центральный рынок",
        description: "Сезонные продукты: ягоды, сыр, рыба — ориентир по вкусу региона.",
        whatToNotice: "Сравните цены у разных рядов, не берите первое.",
        time: "25 мин",
        coordinates: { lat: 52.2928, lng: 104.29 },
      },
      {
        id: "gc-4",
        order: 4,
        title: "Обед: локальная кухня",
        description: "Сытная точка с сибирскими акцентами в меню.",
        whatToNotice: "Спросите про дневное меню — часто выгоднее а-ля carte.",
        time: "40 мин",
        coordinates: { lat: 52.295, lng: 104.2945 },
      },
      {
        id: "gc-5",
        order: 5,
        title: "Десерт в 130-м",
        description: "Сладкая пауза в квартале — удобно совместить с короткой прогулкой.",
        whatToNotice: "Окна второго этажа — хороший ракурс на крыши.",
        time: "20 мин",
        coordinates: { lat: 52.2975, lng: 104.299 },
      },
      {
        id: "gc-6",
        order: 6,
        title: "Вечерний бар у воды",
        description: "Завершение у Ангары: коктейль или чай с видом на реку.",
        whatToNotice: "Закат летом — после 20:00, займите место у окна заранее.",
        time: "30 мин",
        coordinates: { lat: 52.2992, lng: 104.303 },
      },
    ],
  },
  {
    id: "route-irkutsk-to-baikal",
    slug: "irkutsk-to-baikal",
    title: "Из Иркутска к Байкалу",
    description:
      "Маршрут для тех, кто хочет связать Иркутск и Байкал в один понятный день без хаоса и лишних переездов.",
    fullDescription:
      "Полдня: выезд из центра, остановки по дороге и прибытие к воде с понятным планом. Пять точек — логистика, виды и время на берегу без гонки.",
    format: "baikal",
    mapCategory: "history",
    type: "paid",
    price: 790,
    duration: 300,
    distance: 72,
    pointsCount: 5,
    difficulty: "easy",
    tags: ["Байкал", "выезд", "день"],
    filters: ["paid", "half-day", "baikal-nearby"],
    coverImage: "/images/map-preview.svg",
    routeLine: [
      [104.2964, 52.2978],
      [104.35, 52.32],
      [104.55, 52.38],
      [104.85, 52.42],
      [105.08, 52.52],
    ],
    points: [
      {
        id: "itb-1",
        order: 1,
        title: "Сбор в центре Иркутска",
        description: "Старт: проверка транспорта, воды и плана — без лишних кругов по городу.",
        whatToNotice: "Выезжайте до 9:00, чтобы не терять свет у воды.",
        time: "20 мин",
        coordinates: { lat: 52.2978, lng: 104.2964 },
      },
      {
        id: "itb-2",
        order: 2,
        title: "Смотровая на выезде",
        description: "Первая остановка: Иркутск остаётся позади, открывается сибирский масштаб.",
        whatToNotice: "Ветер усиливается — возьмите слой теплее, чем в городе.",
        time: "15 мин",
        coordinates: { lat: 52.32, lng: 104.35 },
      },
      {
        id: "itb-3",
        order: 3,
        title: "Придорожный привал",
        description: "Короткая пауза: кофе и разминка перед основным участком.",
        whatToNotice: "Заправки с хорошей выпечкой — отмечены в полной версии маршрута.",
        time: "20 мин",
        coordinates: { lat: 52.38, lng: 104.55 },
      },
      {
        id: "itb-4",
        order: 4,
        title: "Въезд в Листвянку",
        description: "Понимаете, как устроен посёлок у воды: что смотреть, куда идти пешком.",
        whatToNotice: "Парковки у набережной заполняются к полудню в сезон.",
        time: "30 мин",
        coordinates: { lat: 52.42, lng: 104.85 },
      },
      {
        id: "itb-5",
        order: 5,
        title: "Берег Байкала",
        description: "Финал у воды: время на прогулку, фото и решение — остаться или вернуться.",
        whatToNotice: "Камни скользкие у кромки — обувь с рифленой подошвой.",
        time: "90 мин",
        coordinates: { lat: 52.52, lng: 105.08 },
      },
    ],
  },
];

export function getDemoRouteBySlug(slug: string): Route | undefined {
  return DEMO_ROUTES.find((r) => r.slug === slug);
}

export function filterRoutes(
  routes: Route[],
  filterId: RouteFilterId
): Route[] {
  if (filterId === "all") return routes;
  return routes.filter((r) => r.filters.includes(filterId));
}
