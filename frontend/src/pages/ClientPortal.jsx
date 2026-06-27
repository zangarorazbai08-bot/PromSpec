import { useState, useMemo } from 'react';
import {
  Search, Filter, Calculator, MessageSquare, Home, Shield, Ruler, MapPin,
  Sparkles, Percent, Calendar, DollarSign, Layers, Sun, Moon, LogOut,
  CheckCircle2, X, ChevronRight, Phone, Mail, Award, Check, AlertTriangle
} from 'lucide-react';
import Logo from '../Logo.jsx';
import './ClientPortal.css';

// ─── 20 UNIQUE RESIDENTIAL COMPLEXES (ЖК) ───
const JK_DATA = [
  {
    id: 1,
    name: 'ЖК "Alatau Premium"',
    city: 'Алматы',
    location: 'Медеу ауданы, әл-Фараби даңғылы',
    priceFrom: 48000000,
    pricePerSqM: 650000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3, 4],
    features: ['Тау көрінісі', 'Биік төбелер 3.1м', 'Жер асты паркингі', 'Ақылды үй жүйесі'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    description: 'Алатау баурайында, Алматының ең беделді ауданында орналасқан премиум санаттағы тұрғын үй кешені. Таза тау ауасы мен инфрақұрылымның тамаша үйлесімі.'
  },
  {
    id: 2,
    name: 'ЖК "Astana Grand Towers"',
    city: 'Астана',
    location: 'Есіл ауданы, Мәңгілік Ел даңғылы',
    priceFrom: 55000000,
    pricePerSqM: 580000,
    completionYear: 2025,
    status: 'Сатылымда',
    roomsAvailable: [2, 3, 4],
    features: ['Панорамалық терезелер', '24/7 консьерж', 'Жеке фитнес залы', 'Жабық аула'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'Елорда орталығындағы зәулім сәулет өнерінің туындысы. Сапалы материалдар, биік төбелер және панорамалық елорда көрінісі.'
  },
  {
    id: 3,
    name: 'ЖК "Shymkent Plaza Residence"',
    city: 'Шымкент',
    location: 'Әл-Фараби ауданы, Тәуке хан даңғылы',
    priceFrom: 32000000,
    pricePerSqM: 420000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3],
    features: ['Орталық парк маңында', 'Автономды жылыту', 'Сауда орталығына жақын', 'Балалар алаңы'],
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'Шымкент қаласының жүрегінде орналасқан жайлылық пен заманауи сәулеттің үлгісі. Жеке жылыту қазандығы мен кең жоспарланған пәтерлер.'
  },
  {
    id: 4,
    name: 'ЖК "Caspian View"',
    city: 'Ақтау',
    location: '14-ші шағын аудан, Теңіз жағалауы',
    priceFrom: 38000000,
    pricePerSqM: 480000,
    completionYear: 2024,
    status: 'Біткен',
    roomsAvailable: [2, 3, 4, 5],
    features: ['Теңіздің бірінші желісі', 'Үлкен террасалар', 'Жеке қазандық', 'Панорамалық лифт'],
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    description: 'Каспий теңізінің жағасында орналасқан бірегей кешен. Әр пәтердің терезесінен теңіздің керемет көрінісі ашылады.'
  },
  {
    id: 5,
    name: 'ЖК "Bayterek Heritage"',
    city: 'Астана',
    location: 'Есіл ауданы, Түркістан көшесі',
    priceFrom: 62000000,
    pricePerSqM: 680000,
    completionYear: 2027,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3, 4],
    features: ['Неоклассикалық стиль', 'Эко-аула', 'Мектеп жанында', 'Дыбыс оқшаулау'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Бәйтерек монументіне жақын орналасқан тарихи стильдегі элитті кешен. Ғимарат қасбеті табиғи гранит пен лаймстоунмен қапталады.'
  },
  {
    id: 6,
    name: 'ЖК "Esentai Green Valley"',
    city: 'Алматы',
    location: 'Бостандық ауданы, Есентай өзенінің бойы',
    priceFrom: 85000000,
    pricePerSqM: 820000,
    completionYear: 2025,
    status: 'Сатылымда',
    roomsAvailable: [3, 4, 5],
    features: ['Таунхаус форматы', 'Жеке бақша', '24/7 қауіпсіздік', 'Экологиялық аймақ'],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    description: 'Есентай өзені бойындағы жасыл желекке оранған виллалар мен клубтық үйлер кешені. Тек жоғары сапалы құрылыс материалдары мен озық технологиялар пайдаланылған.'
  },
  {
    id: 7,
    name: 'ЖК "Aray Towers"',
    city: 'Тараз',
    location: 'Орталық аудан, Абай даңғылы',
    priceFrom: 22000000,
    pricePerSqM: 320000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3],
    features: ['Тиімді баға', 'Сейсмикалық төзімділік', 'Балабақша маңында', 'Ыңғайлы көлік жолы'],
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'Тараз орталығындағы жаңа заманауи биік тұрғын үйлер. Сейсмикалық қауіпсіздігі 9 балға есептелген монолитті темірбетонды қаңқа.'
  },
  {
    id: 8,
    name: 'ЖК "Tobol River Front"',
    city: 'Қостанай',
    location: 'Жағалау көшесі, Тобыл өзенінің маңы',
    priceFrom: 26000000,
    pricePerSqM: 350000,
    completionYear: 2025,
    status: 'Сатылымда',
    roomsAvailable: [1, 2, 3, 4],
    features: ['Өзен көрінісі', 'Жеке серуендеу аллеясы', 'Жүгіру жолдары', 'Автономды жылу'],
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    description: 'Тобыл өзенінің жағалауында бой көтеріп жатқан эко-бағыттағы тұрғын үйлер. Өз тұрғындары үшін жеке саябақ пен спорттық алаңдары қарастырылған.'
  },
  {
    id: 9,
    name: 'ЖК "Batys Elite"',
    city: 'Ақтөбе',
    location: 'Батыс-2 шағын ауданы',
    priceFrom: 29000000,
    pricePerSqM: 370000,
    completionYear: 2024,
    status: 'Біткен',
    roomsAvailable: [2, 3, 4],
    features: ['Кірпіш үй', 'Жабық эко-аула', 'Мектеп-лицей маңында', 'Бейнебақылау'],
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    description: 'Ақтөбе қаласының ең қарқынды дамып келе жатқан ауданындағы кірпіштен салынған сапалы кешен. Қалың әрі жылы қабырғалар мен жоғары дыбыс оқшаулау жүйесі.'
  },
  {
    id: 10,
    name: 'ЖК "Altay Golden Gates"',
    city: 'Өскемен',
    location: 'Ертіс жағалауы даңғылы',
    priceFrom: 27500000,
    pricePerSqM: 360000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3],
    features: ['Ертіс өзені көрінісі', 'Вентиляциялық қасбет', 'Үнсіз лифттер', 'Жер үсті паркингі'],
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    description: 'Ертістің бойындағы панорамалық сұлулыққа ие кешен. Қасбеті керамогранит вентиляциялық жүйесімен қапталып, үйдің ұзақ сақталуын қамтамасыз етеді.'
  },
  {
    id: 11,
    name: 'ЖК "Silk Road Palace"',
    city: 'Түркістан',
    location: 'Мәдени-рухани орталық, Керуен-Сарай маңы',
    priceFrom: 34000000,
    pricePerSqM: 450000,
    completionYear: 2025,
    status: 'Сатылымда',
    roomsAvailable: [2, 3, 4],
    features: ['Ұлттық сәулет', 'Керуен-Сарай маңында', 'Жасыл желек терраса', 'Сәнді холлдар'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    description: 'Түркістанның тарихи орталығында, Керуен-Сарай жанындағы ұлттық нақышта безендірілген сәнді тұрғын үйлер. Заманауи жайлылық пен дәстүрлі нақыш синергиясы.'
  },
  {
    id: 12,
    name: 'ЖК "Kokshetau Breeze"',
    city: 'Көкшетау',
    location: 'Қопа көлінің жағалауы',
    priceFrom: 21000000,
    pricePerSqM: 310000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3],
    features: ['Көл жағасында', 'Таза ауа', 'Жеке спорт залы', 'Балалар ойын аймағы'],
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
    description: 'Қопа көлінің жағалауында орналасқан жайлы да сәулетті үйлер. Күнделікті көл лебі мен таза ауада серуендеу мүмкіндігі.'
  },
  {
    id: 13,
    name: 'ЖК "Zhaiyk Modern"',
    city: 'Орал',
    location: 'Астана шағын ауданы',
    priceFrom: 24500000,
    pricePerSqM: 340000,
    completionYear: 2025,
    status: 'Сатылымда',
    roomsAvailable: [1, 2, 3, 4],
    features: ['Энергия үнемдеу', 'Смарт кілттер', 'Қоршалған аула', 'Жеке қоймалар'],
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'Батыс Қазақстанның экологиялық таза аумағындағы ең заманауи смарт-жоба. Жылу сақтау деңгейі жоғары құрылыс технологиялары қолданылған.'
  },
  {
    id: 14,
    name: 'ЖК "Saryarka Capital"',
    city: 'Қарағанды',
    location: 'Оңтүстік-Шығыс ауданы, Республика даңғылы',
    priceFrom: 31500000,
    pricePerSqM: 410000,
    completionYear: 2024,
    status: 'Біткен',
    roomsAvailable: [2, 3, 4],
    features: ['Биік мұнаралар', 'Дамыған инфрақұрылым', 'Орталық жылыту', 'Жабық паркинг'],
    image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=80',
    description: 'Қарағанды қаласының ең танымал да белсенді ауданындағы зәулім үйлер. Сауда орталықтары мен мектептер бір қадамдық жерде орналасқан.'
  },
  {
    id: 15,
    name: 'ЖК "Caspiy Sun"',
    city: 'Атырау',
    location: 'Жайық өзенінің жағалауы, Сәтбаев көшесі',
    priceFrom: 36000000,
    pricePerSqM: 460000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3, 4],
    features: ['Жайық өзені көрінісі', 'Термо-изоляция', 'IP домофон', 'Жеке серуен жолы'],
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    description: 'Атыраудың ең экологиялық таза аймағындағы Жайық өзені бойындағы жаңа сәнді үйлер. Жазда салқын, қыста жылы ұстайтын арнайы термоқаптама жүйесі.'
  },
  {
    id: 16,
    name: 'ЖК "Kyzylorda Star"',
    city: 'Қызылорда',
    location: 'Сұлтан Бейбарыс көшесі',
    priceFrom: 18500000,
    pricePerSqM: 280000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3],
    features: ['Автономды су жүйесі', 'Жоғары сейсмотөзімділік', 'Кең аула', 'Балалар орталығы'],
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
    description: 'Сырдария өзені маңында бой көтерген заманауи отбасылық кешен. Сапалы құрылыс пен ыңғайлы жоспарлаудың ең жақсы теңгерімі.'
  },
  {
    id: 17,
    name: 'ЖК "Alatau Family Yard"',
    city: 'Алматы',
    location: 'Әуезов ауданы, Сайын көшесі',
    priceFrom: 41000000,
    pricePerSqM: 520000,
    completionYear: 2025,
    status: 'Сатылымда',
    roomsAvailable: [1, 2, 3, 4],
    features: ['1 га жабық саябақ', 'Балалар қауіпсіздігі', 'Жүгіру жолдары', 'Спорт алаңдары'],
    image: 'https://images.unsplash.com/photo-1592595896616-c371b2e992d7?auto=format&fit=crop&w=800&q=80',
    description: 'Алматының орталығында орналасқан, отбасыларға арналған алып жеке саябағы бар жабық кешен. Көліксіз аула қауіпсіздік кепілі.'
  },
  {
    id: 18,
    name: 'ЖК "Khan Shatyr View"',
    city: 'Астана',
    location: 'Тұран даңғылы бойында',
    priceFrom: 49000000,
    pricePerSqM: 550000,
    completionYear: 2024,
    status: 'Біткен',
    roomsAvailable: [2, 3, 4],
    features: ['Смарт-үй технологиясы', 'Хан Шатырға жақын', 'Үш қабатты шыны', 'Шу басу жүйесі'],
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
    description: 'Тұран даңғылындағы сәулетті кешен. Хан Шатыр мен негізгі ойын-сауық орындары қол созым жерде орналасқан.'
  },
  {
    id: 19,
    name: 'ЖК "Petropavl Comfort"',
    city: 'Петропавл',
    location: 'Интернационал көшесі',
    priceFrom: 19500000,
    pricePerSqM: 290000,
    completionYear: 2026,
    status: 'Құрылысы жүріп жатыр',
    roomsAvailable: [1, 2, 3],
    features: ['Термо-панель қаптама', 'Тұрақты су сүзгісі', 'Орталық саябақ маңында', 'Жеке авто-тұрақ'],
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    description: 'Солтүстік суық климатына арнайы дайындалған үш қабатты термо-қабырға жүйесі бар жылы тұрғын үйлер.'
  },
  {
    id: 20,
    name: 'ЖК "Medeu Forest Edge"',
    city: 'Алматы',
    location: 'Медеу ауданы, Керей-Жәнібек хандар көшесі',
    priceFrom: 98000000,
    pricePerSqM: 950000,
    completionYear: 2026,
    status: 'Сатылымда',
    roomsAvailable: [3, 4, 5],
    features: ['Орман ішінде', 'Премиум деңгей', 'Үлкен террасалар', 'Клубтық үй форматы'],
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    description: 'Медеу шатқалына апаратын жолдың жиегінде, қарағайлы орман ішінде орналасқан ең премиум санаттағы тұрғын үй кешені. Жеке клубтық атмосфера.'
  }
];

// ─── 15 UNIQUE FACADE CLADDING TYPES (ФАСАДТАР) ───
const FACADE_DATA = [
  {
    id: 1,
    name: 'Алюминий композиттік панель (Алюкобонд)',
    pricePerSqM: 18500,
    material: 'Алюминий / Полимер',
    guaranteeYears: 20,
    thermalIsolation: 'Жоғары',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    description: 'Заманауи ғимараттарға арналған жеңіл әрі иілгіш алюминий композиттер. Жоғары жел өтіне төзімді және өте ұзақ қызмет етеді.'
  },
  {
    id: 2,
    name: 'Травертин табиғи тасы (Сары тас)',
    pricePerSqM: 24000,
    material: 'Табиғи Травертин',
    guaranteeYears: 30,
    thermalIsolation: 'Орташа',
    image: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80',
    description: 'Дәстүрлі сәнділіктің белгісі. Қырғыз және Иран кен орындарынан жеткізілетін, суыққа төзімді және асыл көрініске ие табиғи тас.'
  },
  {
    id: 3,
    name: 'Премиум Гранит қаптамасы',
    pricePerSqM: 32000,
    material: 'Табиғи Гранит',
    guaranteeYears: 50,
    thermalIsolation: 'Орташа',
    image: 'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80',
    description: 'Ең берік және мәңгілік қаптама. Кез келген механикалық зақымдануларға, ылғал мен аязға мінсіз төтеп беретін премиум таңдау.'
  },
  {
    id: 4,
    name: 'Керамогранит плиткалары (Вентфасад)',
    pricePerSqM: 16500,
    material: 'Керамика / Гранит',
    guaranteeYears: 25,
    thermalIsolation: 'Өте жоғары',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
    description: 'Вентиляциялық жүйе арқылы орнатылатын заманауи плиткалар. Үйдің жылуын сақтап, қабырғаның дымқылдануынан қорғайды.'
  },
  {
    id: 5,
    name: 'Фиброцементті плиталар (Эко-декор)',
    pricePerSqM: 14800,
    material: 'Цемент / Фиброталшық',
    guaranteeYears: 15,
    thermalIsolation: 'Жоғары',
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
    description: 'Жеңіл және жанбайтын заманауи материал. Кез келген түс пен текстураны (ағаш, тас, бетон) қайталай алады.'
  },
  {
    id: 6,
    name: 'Сарыарқа лаймстоун (Әктас)',
    pricePerSqM: 28000,
    material: 'Табиғи Лаймстоун',
    guaranteeYears: 35,
    thermalIsolation: 'Орташа',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80',
    description: 'Жылы ақшыл-кремді реңкті табиғи тас. Ғимаратқа ерекше сәнділік пен бедел беретін элитті қаптама материал.'
  },
  {
    id: 7,
    name: 'HPL панельдері (High Pressure Laminate)',
    pricePerSqM: 26500,
    material: 'Композитті Пластик',
    guaranteeYears: 20,
    thermalIsolation: 'Жоғары',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    description: 'Күн сәулесіне күймейтін, сызылмайтын және өзін-өзі тазалайтын ультра-заманауи пластик панельдер.'
  },
  {
    id: 8,
    name: 'Металлосайдинг премиум (Ағаш текстуралы)',
    pricePerSqM: 9500,
    material: 'Мырышталған болат',
    guaranteeYears: 15,
    thermalIsolation: 'Төмен',
    image: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&w=800&q=80',
    description: 'Бюджеттік әрі эстетикалық тиімді нұсқа. Сібір балқарағайының текстурасын айнытпай беретін болат қаптама.'
  },
  {
    id: 9,
    name: 'Сплит кірпіш қаптамасы',
    pricePerSqM: 15000,
    material: 'Гиперпресстелген цемент',
    guaranteeYears: 40,
    thermalIsolation: 'Жоғары',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800&q=80',
    description: 'Жарылған тас текстурасы бар қаптама кірпіш. Үйдің қабырғасын бекітіп, классикалық қорған стилін береді.'
  },
  {
    id: 10,
    name: 'Клинкер плиткасы (Неміс сапасы)',
    pricePerSqM: 22000,
    material: 'Күйдірілген саз балшық',
    guaranteeYears: 40,
    thermalIsolation: 'Жоғары',
    image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=800&q=80',
    description: 'Өте жоғары температурада күйдірілген саздан жасалған тақталар. Суды мүлдем сіңірмейді және түсі ешқашан өшпейді.'
  },
  {
    id: 11,
    name: 'Декоративті сылақ (Травертин эффекті)',
    pricePerSqM: 7500,
    material: 'Минералды / Силиконды негіз',
    guaranteeYears: 10,
    thermalIsolation: 'Орташа',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    description: 'Ең танымал әрі экономикалық тиімді шешім. Құрамында табиғи травертиннің ұнтағы бар сапалы сылақ.'
  },
  {
    id: 12,
    name: 'Шыны витражды фасадтар (Премиум шыны)',
    pricePerSqM: 45000,
    material: 'Шыны / Алюминий профиль',
    guaranteeYears: 25,
    thermalIsolation: 'Өте жоғары',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'Максималды табиғи жарық беретін шыны витраждар. Арнайы энергия үнемдегіш аргон толтырылған шыны пакеттер қолданылады.'
  },
  {
    id: 13,
    name: 'Базальтты термопанельдер (2-де-1)',
    pricePerSqM: 13200,
    material: 'Базальт мақтасы + Декор плитка',
    guaranteeYears: 20,
    thermalIsolation: 'Өте жоғары',
    image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=800&q=80',
    description: 'Жылытқыш базальт плитасы мен декоративті сыртқы қорғаныш бір уақытта орнатылатын тиімді жүйе.'
  },
  {
    id: 14,
    name: 'Ағаш планкен (Сібір балқарағайы)',
    pricePerSqM: 29000,
    material: 'Табиғи Ағаш (Лиственница)',
    guaranteeYears: 15,
    thermalIsolation: 'Жоғары',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    description: 'Эко-дизайнды ұнататындарға арналған табиғи ағаш. Сібір балқарағайы ылғал тиген сайын тастай қатып, шіруге ұшырамайды.'
  },
  {
    id: 15,
    name: 'Жапондық KMEW панельдері',
    pricePerSqM: 35000,
    material: 'Фиброцемент / Фотокерамика',
    guaranteeYears: 30,
    thermalIsolation: 'Өте жоғары',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    description: 'Фотокерамикалық сыртқы қабаты бар жапондық панельдер. Күн сәулесі арқылы кірді ыдыратып, жаңбыр суымен өзін-өзі жуып тұрады.'
  }
];

export default function ClientPortal({ user, onLogout, theme, toggleTheme, notify }) {
  const [activeTab, setActiveTab] = useState('jks'); // 'jks' | 'facades'

  // Search & Filters for JKs
  const [jkSearch, setJkSearch] = useState('');
  const [jkCity, setJkCity] = useState('Барлығы');
  const [jkStatus, setJkStatus] = useState('Барлығы');
  const [jkMaxPrice, setJkMaxPrice] = useState(100000000);

  // Search & Filters for Facades
  const [facadeSearch, setFacadeSearch] = useState('');
  const [facadeMaxPrice, setFacadeMaxPrice] = useState(50000);

  // Selected Items for Details Modal & Calculators
  const [selectedJk, setSelectedJk] = useState(null);
  const [selectedFacade, setSelectedFacade] = useState(null);

  // Interactive Mortgage Calculator State
  const [mortgageDownPaymentPercent, setMortgageDownPaymentPercent] = useState(20);
  const [mortgageTermYears, setMortgageTermYears] = useState(15);
  const [mortgageInterestRate, setMortgageInterestRate] = useState(7); // 7-9-20%

  // Facade Cost Calculator State
  const [calcArea, setCalcArea] = useState(150);
  const [calcExtraIsolation, setCalcExtraIsolation] = useState(false);
  const [calcIncludeLabor, setCalcIncludeLabor] = useState(true);

  // Contact Manager Modal
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  // Form info
  const [clientPhone, setClientPhone] = useState(user.phone || '');
  const [clientEmail, setClientEmail] = useState(user.email || '');

  // --- Filtering ЖК ---
  const filteredJks = useMemo(() => {
    return JK_DATA.filter(jk => {
      const matchSearch = jk.name.toLowerCase().includes(jkSearch.toLowerCase()) || 
                          jk.location.toLowerCase().includes(jkSearch.toLowerCase());
      const matchCity = jkCity === 'Барлығы' || jk.city === jkCity;
      const matchStatus = jkStatus === 'Барлығы' || jk.status === jkStatus;
      const matchPrice = jk.priceFrom <= jkMaxPrice;
      return matchSearch && matchCity && matchStatus && matchPrice;
    });
  }, [jkSearch, jkCity, jkStatus, jkMaxPrice]);

  // --- Filtering Facades ---
  const filteredFacades = useMemo(() => {
    return FACADE_DATA.filter(f => {
      const matchSearch = f.name.toLowerCase().includes(facadeSearch.toLowerCase()) ||
                          f.material.toLowerCase().includes(facadeSearch.toLowerCase());
      const matchPrice = f.pricePerSqM <= facadeMaxPrice;
      return matchSearch && matchPrice;
    });
  }, [facadeSearch, facadeMaxPrice]);

  // --- Mortgage Calculation helper ---
  const mortgageCalculations = useMemo(() => {
    if (!selectedJk) return null;
    const price = selectedJk.priceFrom;
    const downPayment = Math.round(price * (mortgageDownPaymentPercent / 100));
    const loanAmount = price - downPayment;
    const monthlyRate = (mortgageInterestRate / 100) / 12;
    const totalPaymentsCount = mortgageTermYears * 12;

    let monthlyPayment = 0;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / totalPaymentsCount;
    } else {
      monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPaymentsCount)) / 
                       (Math.pow(1 + monthlyRate, totalPaymentsCount) - 1);
    }

    const totalRepayment = monthlyPayment * totalPaymentsCount;
    const overpayment = totalRepayment - loanAmount;

    return {
      downPayment,
      loanAmount,
      monthlyPayment: Math.round(monthlyPayment),
      totalRepayment: Math.round(totalRepayment),
      overpayment: Math.round(overpayment)
    };
  }, [selectedJk, mortgageDownPaymentPercent, mortgageTermYears, mortgageInterestRate]);

  // --- Facade Cost Calculation helper ---
  const facadeCalculations = useMemo(() => {
    if (!selectedFacade) return null;
    const basePrice = selectedFacade.pricePerSqM;
    let pricePerSq = basePrice;
    
    if (calcExtraIsolation) {
      pricePerSq += 3000; // Extra isolation + 3000 KZT/sqm
    }
    if (calcIncludeLabor) {
      pricePerSq += 4500; // Installation work + 4500 KZT/sqm
    }

    const materialTotal = basePrice * calcArea;
    const isolationTotal = calcExtraIsolation ? 3000 * calcArea : 0;
    const laborTotal = calcIncludeLabor ? 4500 * calcArea : 0;
    const totalCost = pricePerSq * calcArea;

    return {
      materialTotal,
      isolationTotal,
      laborTotal,
      pricePerSq,
      totalCost
    };
  }, [selectedFacade, calcArea, calcExtraIsolation, calcIncludeLabor]);

  const openContact = (subject) => {
    setContactSubject(subject);
    setContactMessage(`Сәлеметсіз бе! Мені ${subject} қызықтырады. Толық ақпарат алу үшін маған хабарласуыңызды өтінемін.`);
    setContactSuccess(false);
    setIsContactOpen(true);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    notify('success', 'Сұранысыңыз сәтті қабылданды! Менеджер жақын арада хабарласады.');
  };

  const formattedPrice = (price) => {
    return new Intl.NumberFormat('kk-KZ', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="client-portal-wrapper">
      {/* ─── HEADER ─── */}
      <header className="client-header">
        <div className="client-header-brand">
          <div className="brand-logo-glow">
            <Logo width={28} height={28} hideText={true} style={{ backgroundColor: 'transparent' }} pillarColor="#ffffff" />
          </div>
          <div>
            <h1 className="brand-main">PROM SPEC STROY</h1>
            <span className="brand-sub">PREMIUM CLIENT PLATFORM</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="client-nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'jks' ? 'active' : ''}`}
            onClick={() => setActiveTab('jks')}
          >
            <Home size={18} />
            <span>ЖК пәтерлері</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'facades' ? 'active' : ''}`}
            onClick={() => setActiveTab('facades')}
          >
            <Layers size={18} />
            <span>Сыртқы фасадтар</span>
          </button>
        </div>

        {/* User profile controls */}
        <div className="client-header-user">
          <button className="client-theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div className="user-profile-badge">
            <div className="user-avatar-initial">
              {user.fullName ? user.fullName[0].toUpperCase() : 'Қ'}
            </div>
            <div className="user-text-details">
              <span className="user-name">{user.fullName || user.full_name}</span>
              <span className="user-role-lbl">Қолданушы</span>
            </div>
          </div>

          <button className="client-logout-btn" onClick={onLogout} title="Жүйеден шығу">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* ─── HERO PROMOTIONAL PANEL ─── */}
      <section className="client-hero-promo">
        <div className="promo-overlay" />
        <div className="promo-content">
          <span className="promo-badge"><Sparkles size={14} /> Өзіңізге лайықты пәтер мен сәнді фасадты таңдаңыз</span>
          <h2>Тұрғын үйлер сату және премиум қаптамалар</h2>
          <p>
            Prom Spec Stroy — біз тек үй салмаймыз, біз жайлылық пен сұлулықты қалыптастырамыз. 
            Қазақстанның ірі қалаларындағы ең сапалы тұрғын үй кешендері мен ғимараттарды 
            сыртқы сәнді қаптауға арналған фасадтық шешімдер бір жерде.
          </p>
          <div className="promo-stats">
            <div className="stat-card">
              <h3>20+</h3>
              <span>Бірегей ЖК жобалары</span>
            </div>
            <div className="stat-card">
              <h3>15+</h3>
              <span>Премиум фасад түрлері</span>
            </div>
            <div className="stat-card">
              <h3>100%</h3>
              <span>Сапа мен кепілдік</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN PORTAL BODY ─── */}
      <main className="client-portal-main">

        {/* ======================================================== */}
        {/* ================= ЖК ПӘТЕРЛЕРІ SECTION ================= */}
        {/* ======================================================== */}
        {activeTab === 'jks' && (
          <div className="portal-section-jks fade-in">
            {/* Search and Filters Bar */}
            <div className="client-filters-bar">
              <div className="search-box-wrap">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="ЖК аты немесе мекен-жайы бойынша іздеу..."
                  value={jkSearch}
                  onChange={(e) => setJkSearch(e.target.value)}
                />
              </div>

              <div className="filters-selectors">
                <div className="filter-item">
                  <label><MapPin size={14} /> Қала:</label>
                  <select value={jkCity} onChange={(e) => setJkCity(e.target.value)}>
                    <option value="Барлығы">Барлығы</option>
                    <option value="Алматы">Алматы</option>
                    <option value="Астана">Астана</option>
                    <option value="Шымкент">Шымкент</option>
                    <option value="Ақтау">Ақтау</option>
                    <option value="Атырау">Атырау</option>
                  </select>
                </div>

                <div className="filter-item">
                  <label><Calendar size={14} /> Мәртебесі:</label>
                  <select value={jkStatus} onChange={(e) => setJkStatus(e.target.value)}>
                    <option value="Барлығы">Барлығы</option>
                    <option value="Сатылымда">Сатылымда</option>
                    <option value="Құрылысы жүріп жатыр">Құрылысы жүріп жатыр</option>
                    <option value="Біткен">Біткен</option>
                  </select>
                </div>

                <div className="filter-item price-range">
                  <label><DollarSign size={14} /> Макс баға: <span>{formattedPrice(jkMaxPrice)}</span></label>
                  <input 
                    type="range" 
                    min="15000000" 
                    max="120000000" 
                    step="5000000"
                    value={jkMaxPrice} 
                    onChange={(e) => setJkMaxPrice(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="results-info">
              Табылды: <strong>{filteredJks.length}</strong> тұрғын үй кешені
            </div>

            {/* Complexes Grid */}
            <div className="client-grid-layout">
              {filteredJks.map(jk => (
                <div key={jk.id} className="client-product-card hover-glow">
                  <div className="card-image-wrap">
                    <img src={jk.image} alt={jk.name} loading="lazy" />
                    <div className="status-floating-badge" data-status={jk.status}>
                      {jk.status}
                    </div>
                    <div className="city-floating-badge">
                      {jk.city}
                    </div>
                  </div>

                  <div className="card-body-details">
                    <h3 className="card-title">{jk.name}</h3>
                    
                    <p className="card-location">
                      <MapPin size={14} /> {jk.location}
                    </p>

                    <p className="card-desc-short">
                      {jk.description.substring(0, 100)}...
                    </p>

                    <div className="card-specs-grid">
                      <div className="spec-indicator">
                        <DollarSign size={14} />
                        <div>
                          <span>Бастапқы баға</span>
                          <strong>{formattedPrice(jk.priceFrom)}</strong>
                        </div>
                      </div>
                      <div className="spec-indicator">
                        <Ruler size={14} />
                        <div>
                          <span>1 кв.м бағасы</span>
                          <strong>{formattedPrice(jk.pricePerSqM)}</strong>
                        </div>
                      </div>
                      <div className="spec-indicator">
                        <Calendar size={14} />
                        <div>
                          <span>Аяқталу жылы</span>
                          <strong>{jk.completionYear} жыл</strong>
                        </div>
                      </div>
                      <div className="spec-indicator">
                        <Home size={14} />
                        <div>
                          <span>Пәтерлер</span>
                          <strong>{jk.roomsAvailable.join(', ')} бөлмелі</strong>
                        </div>
                      </div>
                    </div>

                    <div className="features-tags-row">
                      {jk.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="feature-tag">{f}</span>
                      ))}
                    </div>

                    <div className="card-actions-row">
                      <button 
                        className="btn-card-secondary"
                        onClick={() => setSelectedJk(jk)}
                      >
                        Мәлімет & Калькулятор
                      </button>
                      <button 
                        className="btn-card-primary"
                        onClick={() => openContact(`ЖК "${jk.name}" бойынша пәтер сатып алу`)}
                      >
                        Менеджермен байланысу
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredJks.length === 0 && (
              <div className="empty-results-box">
                <AlertTriangle size={48} />
                <h3>Тұрғын үй кешендері табылмады</h3>
                <p>Басқа сүзу немесе іздеу сұранысын енгізіп көріңіз.</p>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ================== ФАСАДТАР SECTION ==================== */}
        {/* ======================================================== */}
        {activeTab === 'facades' && (
          <div className="portal-section-facades fade-in">
            {/* Search and Filters Bar */}
            <div className="client-filters-bar">
              <div className="search-box-wrap">
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Фасад материалы немесе түрі бойынша іздеу..."
                  value={facadeSearch}
                  onChange={(e) => setFacadeSearch(e.target.value)}
                />
              </div>

              <div className="filters-selectors" style={{ justifyContent: 'flex-end' }}>
                <div className="filter-item price-range" style={{ minWidth: 280 }}>
                  <label><DollarSign size={14} /> Макс баға: <span>{formattedPrice(facadeMaxPrice)} / кв.м</span></label>
                  <input 
                    type="range" 
                    min="7000" 
                    max="50000" 
                    step="2000"
                    value={facadeMaxPrice} 
                    onChange={(e) => setFacadeMaxPrice(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="results-info">
              Табылды: <strong>{filteredFacades.length}</strong> премиум фасад қаптамасы
            </div>

            {/* Facades Grid */}
            <div className="client-grid-layout">
              {filteredFacades.map(facade => (
                <div key={facade.id} className="client-product-card hover-glow facade-card">
                  <div className="card-image-wrap">
                    <img src={facade.image} alt={facade.name} loading="lazy" />
                    <div className="guarantee-floating-badge">
                      {facade.guaranteeYears} жыл кепілдік
                    </div>
                  </div>

                  <div className="card-body-details">
                    <h3 className="card-title">{facade.name}</h3>

                    <p className="card-desc-short">
                      {facade.description}
                    </p>

                    <div className="card-specs-grid cols-2">
                      <div className="spec-indicator">
                        <DollarSign size={14} />
                        <div>
                          <span>Кв.м бағасы</span>
                          <strong style={{ color: '#8b5cf6', fontSize: '1.1rem' }}>{formattedPrice(facade.pricePerSqM)} / кв.м</strong>
                        </div>
                      </div>
                      <div className="spec-indicator">
                        <Layers size={14} />
                        <div>
                          <span>Негізгі материалы</span>
                          <strong>{facade.material}</strong>
                        </div>
                      </div>
                      <div className="spec-indicator">
                        <Shield size={14} />
                        <div>
                          <span>Кепілдік мерзімі</span>
                          <strong>{facade.guaranteeYears} жыл</strong>
                        </div>
                      </div>
                      <div className="spec-indicator">
                        <Sparkles size={14} />
                        <div>
                          <span>Жылу оқшаулауы</span>
                          <strong>{facade.thermalIsolation}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions-row">
                      <button 
                        className="btn-card-secondary"
                        onClick={() => setSelectedFacade(facade)}
                      >
                        Бағасын есептеу (Калькулятор)
                      </button>
                      <button 
                        className="btn-card-primary"
                        onClick={() => openContact(`"${facade.name}" бойынша фасад қаптауға тапсырыс`)}
                      >
                        Тапсырыс беру
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFacades.length === 0 && (
              <div className="empty-results-box">
                <AlertTriangle size={48} />
                <h3>Фасад қаптамалары табылмады</h3>
                <p>Басқа іздеу сұранысын енгізіп көріңіз.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* ─── SECTION 3: INFORMATION & QUALITY ADVANTAGES ─── */}
      <section className="client-advantages-section">
        <h2 className="section-title-decor">Біздің артықшылықтарымыз</h2>
        <p className="section-sub-title">Неліктен 15,000-нан астам клиент бізді таңдады?</p>
        <div className="advantages-grid">
          <div className="advantage-card">
            <Award size={36} className="adv-icon" />
            <h4>Жоғары Сейсмотөзімділік</h4>
            <p>Жапондық озық технологияларды қолдана отырып, 9 балдық жер сілкінісіне төзімді ғимараттар саламыз.</p>
          </div>
          <div className="advantage-card">
            <Shield size={36} className="adv-icon" />
            <h4>Құрылыс Кепілдігі</h4>
            <p>Әрбір тұрғын үй кешенінің сапасына заңды түрде ұзақ мерзімді кепілдік береміз.</p>
          </div>
          <div className="advantage-card">
            <Ruler size={36} className="adv-icon" />
            <h4>Орнату Шеберлігі</h4>
            <p>Кез келген қиындықтағы фасадтық қаптауларды білікті құрылысшылар бригадасы жылдам орындайды.</p>
          </div>
          <div className="advantage-card">
            <Layers size={36} className="adv-icon" />
            <h4>Сертификатталған Материалдар</h4>
            <p>Тек экологиялық таза және Еуропалық сапа сертификаты бар қаптама шикізаттарын қолданамыз.</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="client-footer">
        <div className="footer-top-row">
          <div>
            <h3>PROM SPEC STROY</h3>
            <p>Сапалы құрылыс және сәнді сәулет орталығы.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>Қызметтер</h4>
              <ul>
                <li>ЖК Квартира сату</li>
                <li>Вентиляциялық фасадтар</li>
                <li>Табиғи тас қаптау</li>
                <li>Менеджер кеңесі</li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Байланыс</h4>
              <ul>
                <li><Phone size={14} /> +7 (777) 123-4567</li>
                <li><Mail size={14} /> info@promspec.kz</li>
                <li>Мекен-жай: Алматы қ., Абай 52</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom-row">
          <p>© 2026 Prom Spec Stroy. Барлық құқықтар қорғалған. Бағдарламаның премиум клиеттер нұсқасы.</p>
        </div>
      </footer>


      {/* ======================================================== */}
      {/* ========== MODAL: ЖК DETAIL & MORTGAGE CALC ============ */}
      {/* ======================================================== */}
      {selectedJk && (
        <div className="client-modal-overlay" onClick={() => setSelectedJk(null)}>
          <div className="client-modal-body xl" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedJk(null)}><X size={20} /></button>
            
            <div className="modal-grid-container">
              {/* Product preview and details */}
              <div className="modal-info-panel">
                <img src={selectedJk.image} alt={selectedJk.name} className="modal-preview-img" />
                <span className="modal-city-badge">{selectedJk.city}</span>
                <h2 className="modal-title-main">{selectedJk.name}</h2>
                <p className="modal-location-text"><MapPin size={16} /> {selectedJk.location}</p>
                <p className="modal-description-full">{selectedJk.description}</p>
                
                <h4 style={{ marginTop: 20, marginBottom: 10 }}>Жоба артықшылықтары:</h4>
                <ul className="modal-features-list">
                  {selectedJk.features.map((f, i) => (
                    <li key={i}><Check size={16} /> {f}</li>
                  ))}
                </ul>
              </div>

              {/* Mortgage Calculator Panel */}
              <div className="modal-calc-panel">
                <div className="calc-header-badge">
                  <Calculator size={16} />
                  <span>Ипотекалық Калькулятор (7-20-25 және т.б.)</span>
                </div>

                <div className="calc-inputs-group">
                  <div className="calc-input-item">
                    <div className="input-label-row">
                      <span>Пәтердің құны:</span>
                      <strong>{formattedPrice(selectedJk.priceFrom)}</strong>
                    </div>
                  </div>

                  <div className="calc-input-item">
                    <div className="input-label-row">
                      <span>Алғашқы жарна:</span>
                      <strong>{mortgageDownPaymentPercent}% ({formattedPrice(mortgageCalculations.downPayment)})</strong>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="80" 
                      step="5"
                      value={mortgageDownPaymentPercent} 
                      onChange={(e) => setMortgageDownPaymentPercent(Number(e.target.value))}
                    />
                  </div>

                  <div className="calc-input-item">
                    <div className="input-label-row">
                      <span>Несие мерзімі:</span>
                      <strong>{mortgageTermYears} жыл ({mortgageTermYears * 12} ай)</strong>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="30" 
                      step="1"
                      value={mortgageTermYears} 
                      onChange={(e) => setMortgageTermYears(Number(e.target.value))}
                    />
                  </div>

                  <div className="calc-input-item">
                    <div className="input-label-row">
                      <span>Жылдық пайыздық мөлшерлеме (%):</span>
                      <strong>{mortgageInterestRate}%</strong>
                    </div>
                    <div className="interest-presets">
                      <button className={mortgageInterestRate === 7 ? 'active' : ''} onClick={() => setMortgageInterestRate(7)}>7% (7-20-25)</button>
                      <button className={mortgageInterestRate === 12 ? 'active' : ''} onClick={() => setMortgageInterestRate(12)}>12% (Баспана хит)</button>
                      <button className={mortgageInterestRate === 18 ? 'active' : ''} onClick={() => setMortgageInterestRate(18)}>18% (Коммерциялық)</button>
                    </div>
                    <input 
                      type="range" 
                      min="3" 
                      max="24" 
                      step="0.5"
                      value={mortgageInterestRate} 
                      onChange={(e) => setMortgageInterestRate(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="calc-results-panel">
                  <div className="result-row">
                    <span>Несие сомасы:</span>
                    <strong>{formattedPrice(mortgageCalculations.loanAmount)}</strong>
                  </div>
                  <div className="result-row highlight">
                    <span>Ай сайынғы төлем:</span>
                    <strong>{formattedPrice(mortgageCalculations.monthlyPayment)} / ай</strong>
                  </div>
                  <div className="result-row">
                    <span>Артық төлем (переплата):</span>
                    <span style={{ color: '#ea580c', fontWeight: 600 }}>{formattedPrice(mortgageCalculations.overpayment)}</span>
                  </div>
                  <div className="result-row">
                    <span>Жалпы қайтарылатын сома:</span>
                    <strong>{formattedPrice(mortgageCalculations.totalRepayment)}</strong>
                  </div>
                </div>

                <button 
                  className="btn-card-primary full-width"
                  onClick={() => {
                    const subj = `ЖК "${selectedJk.name}" бойынша ипотека есептеу сұранысы`;
                    setSelectedJk(null);
                    openContact(subj);
                  }}
                  style={{ marginTop: 16 }}
                >
                  Осы шарттармен өтінім беру
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ========= MODAL: FACADE DETAIL & COST CALC ============= */}
      {/* ======================================================== */}
      {selectedFacade && (
        <div className="client-modal-overlay" onClick={() => setSelectedFacade(null)}>
          <div className="client-modal-body xl" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedFacade(null)}><X size={20} /></button>
            
            <div className="modal-grid-container">
              {/* Product preview and details */}
              <div className="modal-info-panel">
                <img src={selectedFacade.image} alt={selectedFacade.name} className="modal-preview-img" />
                <span className="modal-city-badge" style={{ background: '#8b5cf6' }}>{selectedFacade.material}</span>
                <h2 className="modal-title-main">{selectedFacade.name}</h2>
                <p className="modal-location-text"><Shield size={16} /> {selectedFacade.guaranteeYears} жыл ресми кепілдік</p>
                <p className="modal-description-full">{selectedFacade.description}</p>
                
                <div className="facade-specs-box">
                  <div className="spec-unit">
                    <strong>{formattedPrice(selectedFacade.pricePerSqM)}</strong>
                    <span>Базалық баға (1 кв.м)</span>
                  </div>
                  <div className="spec-unit">
                    <strong>{selectedFacade.thermalIsolation}</strong>
                    <span>Жылу изоляциясы</span>
                  </div>
                  <div className="spec-unit">
                    <strong>{selectedFacade.guaranteeYears} жыл</strong>
                    <span>Кепілдік</span>
                  </div>
                </div>
              </div>

              {/* Facade Cladding Calculator Panel */}
              <div className="modal-calc-panel">
                <div className="calc-header-badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                  <Calculator size={16} />
                  <span>Фасад шығындарын есептеу</span>
                </div>

                <div className="calc-inputs-group">
                  <div className="calc-input-item">
                    <div className="input-label-row">
                      <span>Қапталатын аудан (кв.м):</span>
                      <strong style={{ fontSize: '1.2rem', color: '#8b5cf6' }}>{calcArea} м²</strong>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="2000" 
                      step="10"
                      value={calcArea} 
                      onChange={(e) => setCalcArea(Number(e.target.value))}
                    />
                    <div className="calc-manual-input">
                      <input 
                        type="number" 
                        value={calcArea} 
                        onChange={(e) => setCalcArea(Math.max(1, Number(e.target.value)))} 
                        style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', marginTop: 6 }}
                      />
                    </div>
                  </div>

                  <div className="calc-input-item checkbox-style">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={calcExtraIsolation} 
                        onChange={(e) => setCalcExtraIsolation(e.target.checked)} 
                      />
                      <div className="chk-text">
                        <strong>Қосымша жылыту (базальт мақтасы 50мм)</strong>
                        <span>+3,000 тг / м² қосылады</span>
                      </div>
                    </label>
                  </div>

                  <div className="calc-input-item checkbox-style">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={calcIncludeLabor} 
                        onChange={(e) => setCalcIncludeLabor(e.target.checked)} 
                      />
                      <div className="chk-text">
                        <strong>Құрылыс-монтаж жұмыстары (жинақтау)</strong>
                        <span>+4,500 тг / м² (кәсіби орнату)</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="calc-results-panel">
                  <div className="result-row">
                    <span>Материал құны:</span>
                    <strong>{formattedPrice(facadeCalculations.materialTotal)}</strong>
                  </div>
                  {calcExtraIsolation && (
                    <div className="result-row">
                      <span>Жылытқыш сомасы:</span>
                      <strong>{formattedPrice(facadeCalculations.isolationTotal)}</strong>
                    </div>
                  )}
                  {calcIncludeLabor && (
                    <div className="result-row">
                      <span>Орнату жұмыстары:</span>
                      <strong>{formattedPrice(facadeCalculations.laborTotal)}</strong>
                    </div>
                  )}
                  <div className="result-row">
                    <span>Орташа баға (1 кв.м үшін):</span>
                    <strong>{formattedPrice(facadeCalculations.pricePerSq)} / м²</strong>
                  </div>
                  <div className="result-row highlight" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(59,130,246,0.1) 100%)' }}>
                    <span>Жалпы шығын (шамамен):</span>
                    <strong style={{ color: '#8b5cf6', fontSize: '1.4rem' }}>{formattedPrice(facadeCalculations.totalCost)}</strong>
                  </div>
                </div>

                <button 
                  className="btn-card-primary full-width"
                  onClick={() => {
                    const subj = `"${selectedFacade.name}" фасадын қаптау сұранысы (${calcArea} м²)`;
                    setSelectedFacade(null);
                    openContact(subj);
                  }}
                  style={{ marginTop: 16 }}
                >
                  Осы есептеу бойынша тапсырыс беру
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ================= MODAL: CONTACT FORM ================== */}
      {/* ======================================================== */}
      {isContactOpen && (
        <div className="client-modal-overlay" onClick={() => setIsContactOpen(false)}>
          <div className="client-modal-body sm" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsContactOpen(false)}><X size={20} /></button>
            
            {!contactSuccess ? (
              <form onSubmit={handleContactSubmit} className="contact-manager-form">
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <MessageSquare size={36} style={{ color: '#8b5cf6', marginBottom: 8 }} />
                  <h2>Менеджермен байланысу</h2>
                  <p style={{ color: 'var(--text-soft)', fontSize: '0.88rem' }}>Мәліметтерді толтырыңыз, маман 15 минут ішінде хабарласады.</p>
                </div>

                <div className="form-group">
                  <label>Хабарлама тақырыбы:</label>
                  <input type="text" value={contactSubject} readOnly className="readonly-input" />
                </div>

                <div className="form-group">
                  <label>Аты-жөніңіз:</label>
                  <input type="text" value={user.fullName || user.full_name} readOnly className="readonly-input" />
                </div>

                <div className="form-group">
                  <label>Телефон нөміріңіз:</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+7 700 000 0000" 
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Электронды поштаңыз (Email):</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="example@mail.com" 
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Сұрақ немесе пікір:</label>
                  <textarea 
                    rows="3" 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn-card-primary full-width" style={{ marginTop: 10 }}>
                  Сұранысты жіберу
                </button>
              </form>
            ) : (
              <div className="contact-success-screen fade-in">
                <CheckCircle2 size={64} style={{ color: '#059669', marginBottom: 16 }} />
                <h2>Өтініміңіз қабылданды!</h2>
                <p>
                  Құрметті <strong>{user.fullName || user.full_name}</strong>, сіздің сұранысыңыз 
                  біздің базамызға сәтті сақталды. Жоба менеджері сіз көрсеткен 
                  <strong> {clientPhone}</strong> нөміріне немесе <strong>{clientEmail}</strong> поштасына 
                  жуық арада хабарласады.
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', marginTop: 10 }}>
                  Сұраныс нөмірі: #RQ-{Math.floor(100000 + Math.random() * 900000)}
                </p>
                <button 
                  className="btn-card-secondary"
                  onClick={() => setIsContactOpen(false)}
                  style={{ marginTop: 24 }}
                >
                  Жабу
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
