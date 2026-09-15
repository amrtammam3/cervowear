# نشر Cervowear على Hostinger (SSH)

## 1) في hPanel قبل السطر الأوامر
- **PHP**: Advanced → PHP Configuration → اختار PHP **8.3** وفعّل: `mbstring, pdo_mysql, fileinfo, gd, curl, zip, bcmath, tokenizer, xml, openssl`.
- **Database**: Databases → MySQL Databases → اعمل قاعدة بيانات + مستخدم، واحتفظ بـ: DB name, username, password, host (غالبًا `localhost`).
- **Domain**: لاحظ اسم الدومين/الساب دومين اللي هتنشر عليه المشروع.

## 2) اتصل بالسيرفر
```bash
ssh -p 65002 USERNAME@YOUR_SERVER_IP
```
(البورت والمستخدم موجودين في hPanel → Advanced → SSH Access)

## 3) اسحب الكود (برّه public_html)
```bash
cd ~
git clone https://github.com/amrtammam3/cervowear.git
cd cervowear
```

## 4) ثبّت الباكدجات
```bash
composer install --no-dev --optimize-autoloader
```
لو `node -v` و `npm -v` شغالين على السيرفر:
```bash
npm ci
npm run build
```
لو مش متاحين على السيرفر (شائع في الاستضافة المشتركة)، ابني الأصول محليًا على جهازك الأول:
```bash
npm ci && npm run build
```
وبعدين ارفع مجلد `public/build` الناتج للسيرفر بـ `scp` أو FTP.

## 5) اضبط البيئة
```bash
cp .env.example .env
nano .env
```
عدّل:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

```bash
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

## 6) اربط الدومين بمجلد public
في hPanel → Websites → الدومين بتاعك → غيّر **Document Root** ليشاور على:
```
/home/USERNAME/cervowear/public
```
(بدل `public_html`)

## 7) صلاحيات
```bash
chmod -R 775 storage bootstrap/cache
```

## تحديث لاحق
```bash
cd ~/cervowear
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
```
(كرر خطوة بناء الأصول لو عدّلت في الفرونت اند)
