# Менеджер сериалов

Консольное приложение для управления базой данных сериалов. Написано на TypeScript с использованием MongoDB.

## Требования
- Node.js (v14+)
- MongoDB (v7.0)
- TypeScript (v4+)

## Установка MongoDB

### Linux (Ubuntu/Debian)
```bash
# Импорт публичного ключа
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
   --dearmor

# Создание файла источника
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Обновление пакетов
sudo apt-get update

# Установка MongoDB
sudo apt-get install -y mongodb-org

# Запуск MongoDB
sudo systemctl start mongod

# Проверка статуса
sudo systemctl status mongod



## Установка приложения
```bash
# Клонирование репозитория
git clone [url-репозитория]
cd [папка-проекта]

# Установка зависимостей
npm install

# Компиляция TypeScript
npm run build
```

## Настройка базы данных
MongoDB создаст базу данных и коллекцию автоматически при первом запуске приложения.

## Подготовка данных
Создайте файл `tvseries.json` в корневой директории проекта:
```json
[
  {
    "title": "Слово пацана",
    "lastTitle": "The Boy's Word",
    "country": "Россия",
    "genre": "Драма",
    "ageLimits": 18,
    "startDate": "2024-01-15",
    "releaseDate": "2024-01-15",
    "rating": 8.4,
    "trailer": "https://...",
    "cover": "https://...",
    "studio": 1
  }
]
```

## Запуск
```bash
npm start
```

## Команды приложения
- `A` - добавить сериалы из файла tvseries.json
- `S название` - найти сериал по названию
- `L` - показать все сериалы
- `D id` - удалить сериал по ID
- `Q` - выход

## Примеры использования

### Добавление сериалов
```bash
> A
Добавлено сериалов: 1
```

### Поиск сериала
```bash
> S слово
Найдены сериалы:
------------------------
ID: 507f1f77bcf86cd799439011
Название: Слово пацана
Жанр: Драма
Рейтинг: 8.4/10
```

### Просмотр всех сериалов
```bash
> L
Список всех сериалов:
------------------------
ID: 507f1f77bcf86cd799439011
Название: Слово пацана
Жанр: Драма
Рейтинг: 8.4/10
```

### Удаление сериала
```bash
> D 507f1f77bcf86cd799439011
Удален сериал:
Название: Слово пацана
Жанр: Драма
```



