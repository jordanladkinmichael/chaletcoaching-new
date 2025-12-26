# План разработки сайта (Coach-first + Instant AI) — чек-лист задач

> Документ для ведения проекта: отмечай статус, добавляй комментарии и даты.  
> Формат: **[ ]** не сделано, **[x]** сделано, **[~]** в работе.

---

## 0) Быстрые вводные (контекст)
- 2 флоу:
  - **Курс от тренера**: доставка **48–96 часов**
  - **Instant AI**: результат **в течение минут**
- Токеномика:
  - **100 токенов = 1.00 EUR / 0.87 GBP / 1.35 USD**
  - Основная валюта: **EUR**
- Пакеты:
  - Starter Spark — **1000 tokens**
  - Momentum Pack — **5000 tokens**
  - Elite Performance — **15000 tokens**
  - Custom Load — ввод суммы → токены

---

## 1) Этапы разработки (рекомендуемая последовательность)

### Этап 1 — Каркас проекта + дизайн-система (Foundation)
Цель: стабильная база, чтобы дальше не “перекраивать”.

- [ ] Репозиторий / окружения (dev/prod), переменные окружения
- [ ] Базовый layout (Header / Footer), контейнеры, сетка, типографика
- [ ] Токены дизайна (цвета/радиусы/тени/spacing), WCAG фокус-стейты
- [ ] Компоненты UI-kit (Button, Card, Badge, Avatar, Tabs, Accordion, Switch, Skeleton, Drawer/Sheet, Toast)
- [ ] Навигация на Next.js routes (без setActive для страниц)
- [ ] SEO базовый: мета, OG, sitemap/robots (минимум)
- [ ] Перфоманс база: poster-first для 3D, reduced motion

**Критерий готовности:** можно собрать любые страницы быстро, не ломая стили.

---

### Этап 2 — Public страницы (контент + доверие)
Цель: запустить публичную часть и начать тестировать конверсию.

#### 2.1 Home (главная)
- [x] Hero (3D: poster-first, lazy-load 3D, reduced motion)
- [x] 2 CTA: Find a Coach / Generate Instantly (AI)
- [x] Live Feed (не ticker, есть Pause)
- [x] The Hybrid Protocol (инфо-блок)
- [x] Coach Spotlight (свайпер → профили)
- [x] Quality Promise (F3) без модалок
- [x] Tokens & Pricing (segmented Coach/AI + currency toggle + 4 пакета + custom)
- [x] Mini FAQ (под новый проект)
- [x] Footer: ссылки на policies + support

#### 2.2 Coaches (список)
- [x] Страница списка коучей `/coaches`
- [x] Карточки коучей (минимум: фото, имя, теги, “48–96h delivery”, кнопка Profile)
- [x] Пустое состояние (если нет коучей)
- [x] Лёгкий поиск/фильтр по тегам (если нужно, не обязательно)

#### 2.3 Coach Profile (динамическая)
- [x] `/coaches/[slug]`
- [x] Блоки: hero (аватар/имя/теги), about, credentials, delivery window, CTA “Request coach course”
- [x] Блок “Как это работает” (коротко) + ссылка на How it works
- [x] FAQ мини (опционально, 3 вопроса)

#### 2.4 Generator (публично видно, запуск — только авториз.)
- [x] `/generate` (страница доступна всем)
- [x] Если не авторизован: показать превью + CTA “Sign in to generate”
- [x] Если авторизован: форма brief + запуск генерации
- [x] Обработка статусов генерации (loading/success/error)

#### 2.5 Pricing
- [x] `/pricing` (полная страница)
- [x] Повтор токеномики + пакеты + custom
- [x] Ссылки на Refund Policy + Tokens explained

#### 2.6 How it Works
- [x] `/how-it-works`
- [x] Разделение 2 флоу: Coach (48–96h) vs Instant AI (minutes)
- [x] Таймлайн шагов + “что вы получаете”
- [x] Ссылки на Tokens и Refund Policy

#### 2.7 What You Receive
- [x] `/what-you-receive`
- [x] Пример структуры результата (modules/weeks/sessions/resources)
- [x] Чётко: что входит в Coach-flow и что в Instant AI
- [x] CTA: Find a Coach / Generate Instantly

#### 2.8 Trust & Safety / Disclaimer
- [x] `/trust-safety`
- [x] Медицинский дисклеймер, безопасность, кому не подходит, ответственность
- [x] Линк в Footer и в FAQ

#### 2.9 Payments & Tokens Explained
- [x] `/tokens` (или `/payments-tokens`)
- [x] Объяснение валют, пересчёта, custom load
- [x] Примеры: “сколько стоит типичный заказ” (без точных обещаний)
- [x] FAQ по токенам (коротко)

#### 2.10 Support / Help Center
- [x] `/support`
- [x] Категории: payments, login, delivery times, refunds, technical issues
- [x] Контактная форма + ожидание ответа
- [x] Ссылки на policies и FAQ

#### 2.11 About Us / Contact Us / FAQ
- [x] `/about`
- [x] `/contact`
- [x] `/faq` (расширенная версия, отдельная от mini FAQ)

**Критерий готовности этапа:** пользователь без логина может понять продукт, выбрать flow, увидеть токены и доверять.

---

### Этап 3 — Авторизация + закрытые зоны
Цель: сделать покупку/доступ/кабинет безопасными и понятными.

- [ ] Авторизация (sign in / sign up / reset password)
- [ ] Guards:
  - `/dashboard` — только авторизованные
  - `/generate` — запуск только авторизованные (просмотр всем)
- [ ] Dashboard `/dashboard`:
  - [ ] Статусы заказов (coach course / instant AI)
  - [ ] История токенов / top-ups
  - [ ] Ссылки на support
- [ ] Профиль пользователя `/account` (минимум: email, пароль, настройки)

---

### Этап 4 — Coach onboarding (Become a Coach) + админ-процесс
Цель: начать наполнение коучами и обработку заявок.

#### 4.1 Become a Coach (application)
- [ ] `/become-a-coach`
- [ ] Мультишаговая форма (stepper):
  - [ ] Step 1: базовые данные
  - [ ] Step 2: специализация/опыт/языки
  - [ ] Step 3: документы/ссылки (uploads)
  - [ ] Step 4: review + согласия
- [ ] Success screen + email confirmation

#### 4.2 Обработка заявок (внутренняя часть)
- [ ] Простая админ-панель (может быть минимальная)
- [ ] Статусы заявки: received → reviewing → approved/rejected
- [ ] Публикация профиля коуча

---

### Этап 5 — Оплата, токены, рефанды (коммерция)
Цель: довести монетизацию до “боевого” состояния.

- [ ] Top-up checkout (Visa/Mastercard)
- [ ] Транзакции токенов: списание/начисление/логирование
- [ ] Refund flow (по политике):
  - [ ] Страница `/refund-policy`
  - [ ] Линк из Home (F3), FAQ, Pricing, Footer
- [ ] Email уведомления:
  - [ ] успешная оплата
  - [ ] заказ создан
  - [ ] курс доставлен (coach) / готов (AI)
  - [ ] refund decision

---

### Этап 6 — Политики + юридические страницы
Цель: закрыть доверие и комплаенс.

- [ ] `/terms`
- [ ] `/privacy`
- [ ] `/refund-policy`
- [ ] `/cookies`
- [ ] Cookie banner + preferences (если нужно)

---

### Этап 7 — Финальная полировка (QA + Analytics)
Цель: стабильность, метрики, улучшение конверсии.

- [ ] Аналитика событий:
  - [ ] клики по 2 CTA
  - [ ] старт flow
  - [ ] checkout start / purchase
- [ ] Lighthouse прогон (LCP/CLS/INP)
- [ ] WCAG чек:
  - [ ] фокус-стейты
  - [ ] reduced motion
  - [ ] клавиатура
- [ ] Тест пустых/ошибочных состояний
- [ ] Контент-проверка (тональность, обещания, сроки)

---

## 2) Список страниц (финальный)

### Public
- [ ] Home `/`
- [ ] Coaches `/coaches`
- [ ] Coach Profile `/coaches/[slug]`
- [ ] Generator `/generate` (просмотр всем, запуск — auth)
- [ ] Pricing `/pricing`
- [ ] How it Works `/how-it-works`
- [ ] What You Receive `/what-you-receive`
- [ ] Trust & Safety `/trust-safety`
- [ ] Tokens Explained `/tokens`
- [ ] Support `/support`
- [ ] About Us `/about`
- [ ] Contact Us `/contact`
- [ ] FAQ `/faq`

### Auth-only
- [ ] Dashboard `/dashboard`
- [ ] Account `/account` (минимум)
- [ ] (опционально) Orders `/orders` если нужен отдельный список

### Coach onboarding
- [ ] Become a Coach `/become-a-coach`

### Policies
- [ ] Terms `/terms`
- [ ] Privacy `/privacy`
- [ ] Refund Policy `/refund-policy`
- [ ] Cookies `/cookies`

---

## 3) Быстрые заметки/риски
- 3D в Hero: обязательно **poster-first**, иначе убьём LCP.
- “Курс от тренера” с delivery 48–96h: нужно везде держать одинаковую формулировку.
- Refund policy: должна быть связана с токенами и двумя флоу (coach vs AI).
- Генератор `/generate`: публично видим, но запуск только после логина.

---

## 4) Поле для моих заметок (впиши своё)
- Дата старта: ___________
- Целевая дата MVP: ___________
- Самые критичные страницы: ______________________
- Что блокирует релиз сейчас: _____________________
