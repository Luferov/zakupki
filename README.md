# НеМаркеплейс (Next.js + MUI + Prisma + PostgreSQL)

MVP маркетплейса с:
- регистрацией и авторизацией пользователей;
- товарами из PostgreSQL через Prisma;
- корзиной пользователя и checkout;
- загрузкой изображений товаров в файловую систему (`public/uploads/products`).

## Требования
- Node.js 20+
- Docker + Docker Compose

## Быстрый старт
1. Установить зависимости:
```bash
npm install
```

2. Создать `.env`:
```bash
cp .env.example .env
```

3. Поднять PostgreSQL:
```bash
npm run db:up
```

4. Выполнить миграции и сиды:
```bash
npm run prisma:migrate -- --name init
npm run prisma:seed
```

5. Запустить приложение:
```bash
npm run dev
```

## Полезные команды
- `npm run lint`
- `npm run build`
- `npm run db:down`
- `npm run prisma:generate`

## Демо-аккаунты (после seed)
- `demo-user@zakupki.local` / `demo12345`
- `demo-seller@zakupki.local` / `demo12345`
