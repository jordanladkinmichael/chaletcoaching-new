# Детальный план реализации FAQ страницы

## 📋 Анализ требований из PROMPT_Build_FAQ_Page.md

### Ключевые требования:
1. ✅ **Route:** `/faq` (уже существует, нужно переделать)
2. ✅ **Ширина:** Совпадает с Home (Container с max-w-[1200px])
3. ✅ **Header/Footer:** Идентичны Home (SiteHeader/SiteFooter)
4. ✅ **24 вопроса** с категориями и keywords
5. ✅ **Поиск** с debounce 150ms
6. ✅ **Category chips** (8 категорий)
7. ✅ **2-колоночный layout** на desktop
8. ✅ **Accordion** компонент (уже есть)
9. ✅ **Quick links** и CTA секция
10. ✅ **WCAG 2.2 AA** (focus states, headings order)

---

## 🔍 Анализ текущего состояния

### Существующее:
- ✅ `app/faq/page.tsx` - простая страница (5 вопросов, без поиска)
- ✅ `lib/faq-data.ts` - 10 вопросов без категорий
- ✅ `components/ui/accordion.tsx` - готовый компонент
- ✅ `components/ui/input.tsx` - SearchInput готов
- ✅ `lib/hooks.ts` - useDebounce готов
- ✅ `components/ui/container.tsx` - Container (max-w-[1200px])
- ✅ Страницы `/support`, `/payments-tokens`, `/trust-safety`, `/contact` существуют

### Что нужно изменить:
1. Расширить `lib/faq-data.ts` - добавить EXPANDED_FAQS с 24 вопросами
2. Полностью переделать `app/faq/page.tsx` согласно требованиям

---

## 📝 Детальный план реализации

### **Этап 1: Расширение FAQ данных** (`lib/faq-data.ts`)

**Задачи:**
1. Добавить типы:
   ```typescript
   export type FaqCategory =
     | "getting_started"
     | "coaches"
     | "instant_ai"
     | "tokens_payments"
     | "account"
     | "safety"
     | "refunds";
   
   export interface ExpandedFaqItem {
     id: string;
     category: FaqCategory;
     question: string;
     answer: string;
     keywords: string[];
   }
   ```

2. Создать `EXPANDED_FAQS` с 24 вопросами (точно по промпту):
   - Getting started (3 вопроса)
   - Coaches (4 вопроса)
   - Instant AI (4 вопроса)
   - Tokens & payments (5 вопросов)
   - Account (3 вопроса)
   - Safety (3 вопроса)
   - Refunds (2 вопроса)

3. Сохранить обратную совместимость:
   - Оставить существующие `FAQItem`, `ALL_FAQS`, `MINI_FAQS`, `coachProfileFAQ`
   - Добавить `EXPANDED_FAQS` как отдельный экспорт

4. Добавить ссылки в ответы:
   - Вопрос 23: ссылка на `/legal/refunds` в тексте ответа
   - Вопрос 24: ссылка на `/legal/refunds`

**Файлы:**
- `lib/faq-data.ts` (расширить)

---

### **Этап 2: Создание FAQ страницы** (`app/faq/page.tsx`)

**Структура страницы (сверху вниз):**

#### 2.1 Header
- Использовать `SiteHeader` (как на Home)
- Подключить handlers для auth и navigation

#### 2.2 Hero + Search секция
```tsx
<Container>
  <div className="space-y-6">
    {/* H1 и Subtitle */}
    <H1>Frequently asked questions</H1>
    <Paragraph className="text-lg">
      Quick answers about coaches, Instant AI plans, tokens, and safety.
    </Paragraph>
    
    {/* Search Input */}
    <SearchInput
      placeholder="Search questions..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    
    {/* Helper text */}
    <Paragraph className="text-sm opacity-70">
      Popular: tokens, preview, refunds, dashboard
    </Paragraph>
    
    {/* Quick links row */}
    <div className="flex flex-wrap gap-3">
      <Link href="/support">Support</Link>
      <Link href="/payments-tokens">Payments & tokens</Link>
      <Link href="/trust-safety">Trust & safety</Link>
    </div>
  </div>
</Container>
```

#### 2.3 Category chips
```tsx
const categories = [
  { id: "all", label: "All" },
  { id: "getting_started", label: "Getting started" },
  { id: "coaches", label: "Coaches" },
  { id: "instant_ai", label: "Instant AI" },
  { id: "tokens_payments", label: "Tokens & payments" },
  { id: "account", label: "Account" },
  { id: "safety", label: "Safety" },
  { id: "refunds", label: "Refunds" },
];

// Кнопки-чипсы с активным состоянием
// Использовать Button компонент с variant="outline" или кастомные стили
```

#### 2.4 FAQ content (2-колоночный layout)
```tsx
<Container>
  {filteredFaqs.length === 0 ? (
    // Empty state
    <div>
      <p>No results found</p>
      <Button href="/support">Open support</Button>
      <Button href="/contact">Contact us</Button>
    </div>
  ) : (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Левая колонка */}
      <div>
        <Accordion items={leftColumn} allowMultiple />
      </div>
      {/* Правая колонка */}
      <div>
        <Accordion items={rightColumn} allowMultiple />
      </div>
    </div>
  )}
</Container>
```

#### 2.5 "Still have questions?" CTA
```tsx
<Container>
  <Card>
    <H2>Still have questions?</H2>
    <Paragraph>
      Browse support articles or contact us for help.
    </Paragraph>
    <div className="flex gap-3">
      <Button variant="primary" href="/support">
        Open support
      </Button>
      <Button variant="outline" href="/contact">
        Contact us
      </Button>
    </div>
  </Card>
</Container>
```

#### 2.6 Footer
- Использовать `SiteFooter` (как на Home)

**Логика:**
- `useState` для `searchQuery`
- `useState` для `selectedCategory` ("all" по умолчанию)
- `useDebounce(searchQuery, 150)` для поиска
- `useMemo` для фильтрации FAQ:
  - По категории (если не "all")
  - По поисковому запросу (question, answer, keywords)
- Разделение на 2 колонки: `Math.ceil(filtered.length / 2)`

**Файлы:**
- `app/faq/page.tsx` (полностью переделать)

---

### **Этап 3: Стилизация и UX**

**Category chips:**
- Активное состояние: `bg-primary text-on-primary`
- Неактивное: `bg-surface border border-border text-text`
- Hover эффекты
- Focus states (ring-2 ring-focus)

**Empty state:**
- Центрированный текст
- Две кнопки (Support, Contact us)
- Иконка (опционально)

**Spacing:**
- Padding-top для ответов в Accordion (чтобы не касались вопроса)
- Правильные отступы между секциями

**Адаптивность:**
- Mobile: 1 колонка, полная ширина
- Desktop (md+): 2 колонки

**Файлы:**
- `app/faq/page.tsx` (стили)

---

## 🎨 Дизайн-решения

### Category chips стиль:
```tsx
// Кастомные кнопки-чипсы (не Badge)
<button
  className={cn(
    "px-4 py-2 rounded-full text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
    isActive
      ? "bg-primary text-on-primary"
      : "bg-surface border border-border text-text hover:bg-surface-hover"
  )}
>
  {label}
</button>
```

### Accordion items формат:
```tsx
const accordionItems = filteredFaqs.map((faq) => ({
  id: faq.id,
  title: faq.question,
  content: (
    <div className="pt-2"> {/* Padding-top для ответа */}
      <p className="text-sm text-text-muted">
        {faq.answer}
        {/* Ссылки для refund вопросов */}
        {faq.id === "can-i-get-refund" && (
          <> {' '}
            <Link href="/legal/refunds" className="text-primary hover:underline">
              refund policy
            </Link>
          </>
        )}
        {faq.id === "where-read-refund-policy" && (
          <> {' '}
            <Link href="/legal/refunds" className="text-primary hover:underline">
              refunds page
            </Link>
          </>
        )}
      </p>
    </div>
  ),
}));
```

---

## ❓ Вопросы для уточнения

1. **Существующие FAQ:**
   - Сохранить текущие `ALL_FAQS` (10 вопросов) или они будут заменены новыми 24?
   - Нужно ли обновить `MINI_FAQS` на Home странице новыми вопросами?

2. **Стили category chips:**
   - Использовать кастомные кнопки (как в плане) или есть готовый компонент для chips?
   - Какой стиль предпочтительнее (как на Support странице или уникальный)?

3. **Quick links:**
   - Стиль: простые текстовые ссылки или кнопки?
   - Размещение: под поиском или рядом с ним?

4. **Контент:**
   - Нужны ли дополнительные ссылки в ответах (кроме refund policy)?
   - Нужна ли поддержка других языков или только EN?

5. **Интеграция:**
   - Нужна ли синхронизация поискового запроса с URL (как на Support) или только client-side?

---

## ✅ Критерии готовности

- [ ] Страница `/faq` доступна
- [ ] 24 вопроса отображаются
- [ ] Поиск работает (фильтрация по question, answer, keywords)
- [ ] Debounce 150ms работает
- [ ] Фильтрация по категориям работает
- [ ] Category chips с активным состоянием
- [ ] 2-колоночный layout на desktop (md:grid-cols-2)
- [ ] 1 колонка на mobile
- [ ] Accordion работает плавно (180-220ms)
- [ ] Padding-top для ответов (не касаются вопроса)
- [ ] Quick links ведут на правильные страницы
- [ ] CTA секция с кнопками работает
- [ ] Empty state показывается при отсутствии результатов
- [ ] Ширина страницы совпадает с Home (Container)
- [ ] Header и Footer идентичны Home
- [ ] WCAG 2.2 AA соблюдено (focus states, headings order)
- [ ] Ссылки на `/legal/refunds` работают
- [ ] Нет упоминаний delivery time
- [ ] Нет em dashes в тексте

---

## 📦 Файлы для изменения

1. **`lib/faq-data.ts`** - расширить:
   - Добавить типы `FaqCategory` и `ExpandedFaqItem`
   - Создать `EXPANDED_FAQS` с 24 вопросами
   - Сохранить существующие экспорты

2. **`app/faq/page.tsx`** - полностью переделать:
   - Hero + Search секция
   - Category chips
   - 2-колоночный FAQ content
   - CTA секция
   - Логика фильтрации

---

## 🚨 Важные замечания

1. **Обратная совместимость:**
   - Сохранить `MINI_FAQS` для Home страницы
   - Сохранить `coachProfileFAQ` для профилей коучей
   - Добавить `EXPANDED_FAQS` как новый экспорт

2. **Производительность:**
   - Client-side фильтрация (быстро)
   - Debounce для поиска (150ms)
   - useMemo для фильтрованных результатов

3. **Доступность:**
   - Правильный порядок заголовков (h1 → h2 → h3)
   - Focus states на всех интерактивных элементах
   - ARIA labels где нужно
   - Keyboard navigation

4. **Контент:**
   - Избегать em dashes (использовать обычные дефисы или запятые)
   - Нет упоминаний delivery time
   - Ссылки на `/legal/refunds` для refund вопросов

---

**Готов к реализации после вашего одобрения!**



