# HASN — منصة الخدمات الرقمية

منصة عربية متكاملة لبيع خدمات شحن الألعاب وتطبيقات الجوال والتسويق الرقمي.

---

## النشر على Railway (الطريقة الموصى بها)

### الخطوات

1. **ارفع المستودع على GitHub** ثم أنشئ مشروعاً جديداً على [railway.app](https://railway.app)
2. **أضف قاعدة بيانات PostgreSQL** من: New → Database → Add PostgreSQL
3. **اضبط متغيرات البيئة** في تبويب Variables بخدمتك:

| المتغير | القيمة |
|---------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (مرجع Railway التلقائي) |
| `SESSION_SECRET` | نص عشوائي طويل (`openssl rand -base64 48`) |
| `NODE_ENV` | `production` |

> **لا تضبط `PORT`** — يضبطه Railway تلقائياً.

4. **الـ Deploy**: Railway يكتشف `railway.json` ويبني باستخدام `Dockerfile`.
   **مخطط قاعدة البيانات يُطبَّق تلقائياً** عند أول إقلاع.

5. **إنشاء أول مستخدم أدمن**: سجّل مستخدماً عادياً ثم شغّل هذا SQL في Railway:

```sql
UPDATE users SET role = 'super_admin' WHERE phone = 'رقم_هاتفك';
```

---

## النشر المحلي (Docker Compose)

```bash
# أنشئ .env من المثال
cp .env.example .env
# عدّل SESSION_SECRET في .env

# ابنِ وشغّل
docker compose up -d --build

# المنصة تعمل على http://localhost
```

---

## هيكل المجلد

```
/
├── Dockerfile              # بناء متعدد المراحل: API + Frontend في صورة واحدة
├── docker-compose.yml      # تشغيل كامل محلياً (PostgreSQL + App)
├── docker-entrypoint.sh    # تهيئة DB + تشغيل Node.js + nginx معاً
├── schema.sql              # مخطط قاعدة البيانات الكامل (IF NOT EXISTS)
├── railway.json            # إعداد Railway (health check + restart policy)
├── .env.example            # متغيرات البيئة المطلوبة
├── lib/                    # مكتبات مشتركة (API spec, DB schema, Zod schemas)
├── artifacts/
│   ├── api-server/         # خادم Express 5 (TypeScript)
│   └── hasn/               # واجهة React + Vite (Arabic RTL)
└── scripts/                # سكريبتات مساعدة
```

---

## المميزات

- **للمستخدمين**: تسجيل بالهاتف + كلمة مرور، محفظة رقمية، شراء خدمات، تتبع الطلبات
- **لوحة الأدمن**: إدارة المستخدمين والخدمات والأقسام والبنرات ومزودي الخدمة والطلبات وطلبات الشحن
- **التنفيذ التلقائي**: عند تعيين مزود وService ID للخدمة، يُنفَّذ الطلب تلقائياً عبر API المزود
- **محفظة ذكية**: الأدمن يتحكم برصيد كل مستخدم مباشرة
- **متصفح خدمات المزود**: تحديد وإخفاء/إظهار خدمات المزود بالجملة

---

## المتغيرات البيئية

انظر `.env.example` لكامل الخيارات المتاحة.

| المتغير | الوصف | مثال |
|---------|-------|------|
| `DATABASE_URL` | رابط PostgreSQL | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | مفتاح تشفير الجلسات | نص عشوائي طويل |
| `NODE_ENV` | بيئة التشغيل | `production` |
| `PORT` | يضبطه Railway تلقائياً | — |

---

## Stack التقني

- **Backend**: Node.js 24 + Express 5 + Drizzle ORM + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS (Arabic RTL — Dark theme)
- **Auth**: express-session + connect-pg-simple + bcrypt
- **Build**: esbuild (API) + Vite (Frontend)
- **Serving**: nginx (SPA + proxy `/api/`) + Node.js (API on port 8080)
