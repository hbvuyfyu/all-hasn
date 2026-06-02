# HASN — منصة الخدمات الرقمية

منصة عربية متكاملة لبيع خدمات شحن الألعاب وتطبيقات الجوال والتسويق الرقمي.

---

## النشر السريع (Docker)

### المتطلبات
- Docker + Docker Compose

### خطوات النشر

```bash
# 1. ابنِ وشغّل كل الخدمات دفعةً واحدة
SESSION_SECRET=اكتب_هنا_سراً_عشوائياً_طويلاً docker compose up -d --build

# 2. المنصة تعمل على
#    http://your-server-ip
```

أو مع ملف `.env`:

```bash
# أنشئ .env بهذه القيم
echo 'POSTGRES_PASSWORD=كلمة_سر_قوية' >> .env
echo 'SESSION_SECRET=سلسلة_عشوائية_طويلة_جداً' >> .env

docker compose up -d --build
```

---

## النشر على Railway

1. أنشئ مشروعاً جديداً على [railway.app](https://railway.app)
2. أضف خدمة **PostgreSQL** من Plugins
3. ارفع مجلد ALL_HASN كمستودع أو استخدم Railway CLI
4. اضبط متغيرات البيئة:
   - `DATABASE_URL` — يُعطيك إياه Railway تلقائياً من خدمة PostgreSQL
   - `SESSION_SECRET` — أي سلسلة عشوائية طويلة
   - `PORT` — يضبطه Railway تلقائياً
5. شغّل `schema.sql` على قاعدة البيانات في أول نشر

---

## هيكل المجلد

```
ALL_HASN/
├── Dockerfile              # بناء API + Frontend في صورة واحدة
├── docker-compose.yml      # تشغيل كامل (PostgreSQL + App)
├── nginx.conf              # إعداد nginx للـ SPA + proxy /api
├── docker-entrypoint.sh    # تشغيل Node.js + nginx معاً
├── schema.sql              # مخطط قاعدة البيانات الكامل
├── railway.json            # إعداد Railway
├── lib/                    # مكتبات مشتركة (API spec, DB schema, ...)
├── artifacts/
│   ├── api-server/         # خادم Express 5
│   └── hasn/               # واجهة React + Vite
└── scripts/                # سكريبتات مساعدة
```

---

## المميزات

- **للمستخدمين**: تسجيل بالهاتف + كلمة مرور، محفظة رقمية، شراء خدمات، تتبع الطلبات
- **لوحة الأدمن**: إدارة المستخدمين والخدمات والأقسام والبنرات ومزودي الخدمة والطلبات وطلبات الشحن
- **التنفيذ التلقائي**: عند تعيين مزود وService ID للخدمة، يُنفَّذ الطلب تلقائياً عبر API المزود
- **محفظة ذكية**: الأدمن يتحكم برصيد كل مستخدم مباشرة (إضافة / خصم)
- **متصفح خدمات المزود**: تحديد وإخفاء/إظهار خدمات المزود بالجملة مع إدخال ID محدد

---

## المتغيرات البيئية

| المتغير | الوصف | مثال |
|---------|-------|------|
| `DATABASE_URL` | رابط PostgreSQL | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | مفتاح تشفير الجلسات | أي نص عشوائي طويل |
| `PORT` | منفذ خادم Node.js | `8080` (nginx يستمع على 80) |
| `NODE_ENV` | بيئة التشغيل | `production` |

---

## Stack التقني

- **Backend**: Node.js 24 + Express 5 + Drizzle ORM + PostgreSQL
- **Frontend**: React + Vite + Tailwind CSS (Arabic RTL — light theme)
- **Auth**: جلسات express-session + connect-pg-simple + bcrypt
- **Build**: esbuild (API) + Vite (Frontend)
- **Serving**: nginx (SPA + proxy) + Node.js (API on port 8080)
