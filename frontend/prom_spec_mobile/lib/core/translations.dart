import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/language_provider.dart';

class T {
  static const Map<String, Map<String, String>> _dict = {
    // ----------------------------------------------------
    // MAIN WRAPPER
    // ----------------------------------------------------
    'nav_home': {
      'kk': 'Басты бет',
      'ru': 'Главная',
      'en': 'Home'
    },
    'nav_requests': {
      'kk': 'Өтінімдер',
      'ru': 'Заявки',
      'en': 'Requests'
    },
    'nav_materials': {
      'kk': 'Материалдар',
      'ru': 'Материалы',
      'en': 'Materials'
    },
    'nav_profile': {
      'kk': 'Профиль',
      'ru': 'Профиль',
      'en': 'Profile'
    },

    // ----------------------------------------------------
    // DASHBOARD
    // ----------------------------------------------------
    'dash_greeting': {
      'kk': 'Қайырлы күн',
      'ru': 'Добрый день',
      'en': 'Good afternoon'
    },
    'dash_project': {
      'kk': 'Green Park құрылыс алаңы',
      'ru': 'Строительная площадка Green Park',
      'en': 'Green Park Construction Site'
    },
    'dash_active_reqs': {
      'kk': 'Белсенді өтінімдер',
      'ru': 'Активные заявки',
      'en': 'Active requests'
    },
    'dash_active_badge': {
      'kk': 'Белсенді',
      'ru': 'Активно',
      'en': 'Active'
    },
    'dash_project_name': {
      'kk': 'Green Park жобасы',
      'ru': 'Проект Green Park',
      'en': 'Green Park Project'
    },
    'dash_pending': {
      'kk': 'Мақұлдау күтуде',
      'ru': 'Ожидают одобрения',
      'en': 'Pending approval'
    },
    'dash_urgent_reqs': {
      'kk': 'өтінім шұғыл',
      'ru': 'заявок срочно',
      'en': 'urgent requests'
    },
    'dash_all_approved': {
      'kk': 'Барлығы мақұлданды',
      'ru': 'Все одобрены',
      'en': 'All approved'
    },
    'dash_low_stock': {
      'kk': 'Төмен қор',
      'ru': 'Низкий запас',
      'en': 'Low stock'
    },
    'dash_critical_items': {
      'kk': 'позиция критикалық',
      'ru': 'позиций критично',
      'en': 'critical items'
    },
    'dash_stock_ok': {
      'kk': 'Қор жеткілікті',
      'ru': 'Запас достаточен',
      'en': 'Stock is sufficient'
    },
    'dash_quick_actions': {
      'kk': 'Жылдам әрекеттер',
      'ru': 'Быстрые действия',
      'en': 'Quick actions'
    },
    'dash_ai_scanner': {
      'kk': 'AI сканер',
      'ru': 'AI сканер',
      'en': 'AI Scanner'
    },
    'dash_ai_scanner_sub': {
      'kk': 'Материалды суреттен тану',
      'ru': 'Распознавание материалов по фото',
      'en': 'Material recognition from photo'
    },
    'dash_new_req': {
      'kk': 'Өтінім жасау',
      'ru': 'Создать заявку',
      'en': 'Create request'
    },
    'dash_new_req_sub': {
      'kk': '2 минутта толтыру',
      'ru': 'Заполнение за 2 минуты',
      'en': 'Fill out in 2 mins'
    },
    'dash_prom_ai': {
      'kk': 'Prom AI Көмекші',
      'ru': 'Prom AI Помощник',
      'en': 'Prom AI Assistant'
    },
    'dash_prom_ai_sub': {
      'kk': 'Қоймадан ақпарат сұрау',
      'ru': 'Запрос информации со склада',
      'en': 'Request warehouse info'
    },
    'dash_recent_tx': {
      'kk': 'Соңғы қозғалыстар',
      'ru': 'Последние движения',
      'en': 'Recent transactions'
    },
    'dash_alert_title': {
      'kk': 'Аз қорлы материалдар!',
      'ru': 'Материалы с низким запасом!',
      'en': 'Low stock materials!'
    },
    'dash_alert_view': {
      'kk': 'Қарау',
      'ru': 'Смотреть',
      'en': 'View'
    },

    // ----------------------------------------------------
    // MATERIALS
    // ----------------------------------------------------
    'mat_title': {
      'kk': 'Материалдар',
      'ru': 'Материалы',
      'en': 'Materials'
    },
    'mat_subtitle': {
      'kk': 'GREEN PARK • ҚОЙМА 01',
      'ru': 'GREEN PARK • СКЛАД 01',
      'en': 'GREEN PARK • WAREHOUSE 01'
    },
    'mat_search_hint': {
      'kk': 'Материал немесе санат бойынша іздеу',
      'ru': 'Поиск по материалу или категории',
      'en': 'Search by material or category'
    },
    'mat_total_value': {
      'kk': 'Қойма құны',
      'ru': 'Стоимость склада',
      'en': 'Warehouse Value'
    },
    'mat_total_items': {
      'kk': 'Позициялар',
      'ru': 'Позиции',
      'en': 'Items'
    },
    'mat_empty': {
      'kk': 'Материалдар жоқ',
      'ru': 'Нет материалов',
      'en': 'No materials'
    },
    'mat_not_found': {
      'kk': 'бойынша ештеме табылмады',
      'ru': 'ничего не найдено по',
      'en': 'not found for'
    },
    'mat_clear': {
      'kk': 'Тазарту',
      'ru': 'Очистить',
      'en': 'Clear'
    },
    'mat_min': {
      'kk': 'мин',
      'ru': 'мин',
      'en': 'min'
    },
    'status_out': {
      'kk': 'Таусылды',
      'ru': 'Закончился',
      'en': 'Out of stock'
    },
    'status_normal': {
      'kk': 'Норма',
      'ru': 'Норма',
      'en': 'Normal'
    },
    'status_critical': {
      'kk': 'Критикалық',
      'ru': 'Критично',
      'en': 'Critical'
    },
    'status_low': {
      'kk': 'Аз қалды',
      'ru': 'Мало',
      'en': 'Low'
    },
    'status_sufficient': {
      'kk': 'Жеткілікті',
      'ru': 'Достаточно',
      'en': 'Sufficient'
    },

    // ----------------------------------------------------
    // REQUESTS
    // ----------------------------------------------------
    'req_title': {
      'kk': 'Өтінімдер',
      'ru': 'Заявки',
      'en': 'Requests'
    },
    'req_filter_all': {
      'kk': 'Барлығы',
      'ru': 'Все',
      'en': 'All'
    },
    'req_filter_pending': {
      'kk': 'Күтуде',
      'ru': 'Ожидание',
      'en': 'Pending'
    },
    'req_filter_approved': {
      'kk': 'Мақұлданды',
      'ru': 'Одобрены',
      'en': 'Approved'
    },
    'req_filter_rejected': {
      'kk': 'Қабылданбады',
      'ru': 'Отклонены',
      'en': 'Rejected'
    },
    'req_search_hint': {
      'kk': 'Өтінім немесе материал іздеу',
      'ru': 'Поиск заявки или материала',
      'en': 'Search request or material'
    },
    'req_empty': {
      'kk': 'Өтінімдер жоқ',
      'ru': 'Нет заявок',
      'en': 'No requests'
    },
    'req_create_btn': {
      'kk': 'Жаңа өтінім жасау',
      'ru': 'Создать новую заявку',
      'en': 'Create new request'
    },
    'req_new_title': {
      'kk': 'Жаңа өтінім',
      'ru': 'Новая заявка',
      'en': 'New request'
    },
    'req_input_title': {
      'kk': 'Өтінім тақырыбы',
      'ru': 'Тема заявки',
      'en': 'Request title'
    },
    'req_input_mat': {
      'kk': 'Материал атауы',
      'ru': 'Название материала',
      'en': 'Material name'
    },
    'req_input_qty': {
      'kk': 'Саны',
      'ru': 'Количество',
      'en': 'Quantity'
    },
    'req_input_priority': {
      'kk': 'Басымдық',
      'ru': 'Приоритет',
      'en': 'Priority'
    },
    'req_btn_send': {
      'kk': 'Өтінім жіберу',
      'ru': 'Отправить заявку',
      'en': 'Send request'
    },
    'req_status_issued': {
      'kk': 'Берілді',
      'ru': 'Выдано',
      'en': 'Issued'
    },
    'req_status_confirmed': {
      'kk': 'Расталды',
      'ru': 'Подтверждено',
      'en': 'Confirmed'
    },
    'req_prio_high': {
      'kk': 'Шұғыл',
      'ru': 'Срочно',
      'en': 'Urgent'
    },
    'req_prio_low': {
      'kk': 'Кейін',
      'ru': 'Позже',
      'en': 'Low'
    },
    'req_prio_normal': {
      'kk': 'Орташа',
      'ru': 'Средний',
      'en': 'Normal'
    },

    // ----------------------------------------------------
    // PROFILE
    // ----------------------------------------------------
    'prof_account': {
      'kk': 'АККАУНТ',
      'ru': 'АККАУНТ',
      'en': 'ACCOUNT'
    },
    'prof_verified': {
      'kk': 'РАСТАЛҒАН',
      'ru': 'ПОДТВЕРЖДЕН',
      'en': 'VERIFIED'
    },
    'prof_sec_personal': {
      'kk': 'Жеке мәліметтер',
      'ru': 'Личные данные',
      'en': 'Personal details'
    },
    'prof_name': {
      'kk': 'Аты-жөні',
      'ru': 'ФИО',
      'en': 'Full name'
    },
    'prof_phone': {
      'kk': 'Телефон',
      'ru': 'Телефон',
      'en': 'Phone'
    },
    'prof_sec_security': {
      'kk': 'Қауіпсіздік',
      'ru': 'Безопасность',
      'en': 'Security'
    },
    'prof_pass': {
      'kk': 'Құпия сөзді өзгерту',
      'ru': 'Изменить пароль',
      'en': 'Change password'
    },
    'prof_pin': {
      'kk': 'PIN-код орнату',
      'ru': 'Установить PIN-код',
      'en': 'Set PIN code'
    },
    'prof_bio': {
      'kk': 'Биометриялық кіру',
      'ru': 'Биометрический вход',
      'en': 'Biometric login'
    },
    'prof_sec_notifs': {
      'kk': 'Хабарламалар',
      'ru': 'Уведомления',
      'en': 'Notifications'
    },
    'prof_push': {
      'kk': 'Push-хабарламалар',
      'ru': 'Push-уведомления',
      'en': 'Push notifications'
    },
    'prof_alerts': {
      'kk': 'Аз қор туралы ескертпе',
      'ru': 'Оповещения о низком запасе',
      'en': 'Low stock alerts'
    },
    'prof_sec_general': {
      'kk': 'Жалпы',
      'ru': 'Общие',
      'en': 'General'
    },
    'prof_lang': {
      'kk': 'Тіл',
      'ru': 'Язык',
      'en': 'Language'
    },
    'prof_dark': {
      'kk': 'Қараңғы режим',
      'ru': 'Темный режим',
      'en': 'Dark mode'
    },
    'prof_support': {
      'kk': 'Қолдау орталығы',
      'ru': 'Центр поддержки',
      'en': 'Support center'
    },
    'prof_logout': {
      'kk': 'Жүйеден шығу',
      'ru': 'Выйти из системы',
      'en': 'Log out'
    },

    // ----------------------------------------------------
    // ROLES
    // ----------------------------------------------------
    'role_admin': {
      'kk': 'Әкімші',
      'ru': 'Администратор',
      'en': 'Admin'
    },
    'role_director': {
      'kk': 'Бас Директор',
      'ru': 'Генеральный директор',
      'en': 'Director'
    },
    'role_foreman': {
      'kk': 'Прораб',
      'ru': 'Прораб',
      'en': 'Foreman'
    },
    'role_storekeeper': {
      'kk': 'Қоймашы',
      'ru': 'Кладовщик',
      'en': 'Storekeeper'
    },
    'role_supplier': {
      'kk': 'Жеткізуші',
      'ru': 'Поставщик',
      'en': 'Supplier'
    },
    'role_client': {
      'kk': 'Клиент',
      'ru': 'Клиент',
      'en': 'Client'
    },


    // ----------------------------------------------------
    // COMMON
    // ----------------------------------------------------
    'cancel': {
      'kk': 'Болдырмау',
      'ru': 'Отмена',
      'en': 'Cancel'
    },
    'save': {
      'kk': 'Сақтау',
      'ru': 'Сохранить',
      'en': 'Save'
    },
  };

  static String get(BuildContext context, String key) {
    final lang = context.watch<LanguageProvider>().currentLang;
    if (_dict.containsKey(key)) {
      return _dict[key]![lang] ?? _dict[key]!['kk'] ?? key;
    }
    return key;
  }
}

// Extension to make it easier to use in widgets
extension TranslateExt on String {
  String tr(BuildContext context) {
    return T.get(context, this);
  }
}
