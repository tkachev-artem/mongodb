import { MongoClient, ObjectId } from "mongodb";
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';

/* Интерфейс для хранения информации о сериале */
interface TVSeries {
  _id?: ObjectId;
  title: string;
  lastTitle: string;
  country: string;
  genre: string;
  ageLimits: number;
  startDate: Date;
  releaseDate: Date;
  rating: number;
  trailer: string;
  cover: string;
  studio: number;
}

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const DB_NAME = "tvseriesdb";
const COLLECTION_NAME = "tvseries";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/* Инициализация базы данных и коллекции */
async function initializeDatabase() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Проверяем существование коллекции
    const collections = await db.listCollections({ name: COLLECTION_NAME }).toArray();
    
    if (collections.length === 0) {
      // Создаем коллекцию с валидацией схемы
      await db.createCollection(COLLECTION_NAME, {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["title", "country", "genre", "ageLimits", "releaseDate", "rating"],
            properties: {
              title: { bsonType: "string" },
              lastTitle: { bsonType: "string" },
              country: { bsonType: "string" },
              genre: { bsonType: "string" },
              ageLimits: { bsonType: "int" },
              startDate: { bsonType: "date" },
              releaseDate: { bsonType: "date" },
              rating: { bsonType: "double" },
              trailer: { bsonType: "string" },
              cover: { bsonType: "string" },
              studio: { bsonType: "int" }
            }
          }
        }
      });
      
      // Создаем индексы для оптимизации поиска
      const collection = db.collection(COLLECTION_NAME);
      await collection.createIndex({ title: "text" });
      await collection.createIndex({ releaseDate: 1 });
      await collection.createIndex({ rating: -1 });
      
      console.log("База данных и коллекция успешно созданы");
    } else {
      console.log("База данных и коллекция уже существуют");
    }
  } catch (error) {
    console.error("Ошибка при инициализации базы данных:", error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

/* Поиск сериала по названию */
async function searchTVSeries(searchTitle: string) {
  try {
    await client.connect();
    const db = client.db("tvseriesdb");
    const seriesCollection = db.collection<TVSeries>("tvseries");

    const series = await seriesCollection.find({
      title: { $regex: searchTitle, $options: 'i' }
    }).toArray();

    if (series.length > 0) {
      console.log("\nНайдены сериалы:");
      for (const show of series) {
        console.log("\n------------------------");
        console.log(`ID: ${show._id}`);
        console.log(`Название: ${show.title}`);
        if (show.lastTitle) console.log(`Название (eng): ${show.lastTitle}`);
        console.log(`Жанр: ${show.genre}`);
        console.log(`Страна: ${show.country}`);
        console.log(`Возрастной рейтинг: ${show.ageLimits}+`);
        console.log(`Рейтинг: ${show.rating}/10`);
        console.log(`Дата выхода: ${show.releaseDate.toLocaleDateString('ru-RU')}`);
      }
    } else {
      console.log("Сериал не найден");
    }
  } catch (error) {
    console.error("Ошибка при поиске сериала:", error);
  } finally {
    await client.close();
  }
}

/* Удаление сериала по ID */
async function deleteTVSeries(id: string) {
  try {
    await client.connect();
    const db = client.db("tvseriesdb");
    const seriesCollection = db.collection<TVSeries>("tvseries");

    try {
      const objectId = new ObjectId(id);
      const series = await seriesCollection.findOne({ _id: objectId });
      
      if (!series) {
        console.log("Сериал с указанным ID не найден");
        return;
      }

      const result = await seriesCollection.deleteOne({ _id: objectId });
      
      if (result.deletedCount === 1) {
        console.log(`\nУдален сериал:`);
        console.log(`Название: ${series.title}`);
        console.log(`Жанр: ${series.genre}`);
      } else {
        console.log("Ошибка при удалении сериала");
      }
    } catch (e) {
      console.log("Неверный формат ID");
    }
  } catch (error) {
    console.error("Ошибка при удалении сериала:", error);
  } finally {
    await client.close();
  }
}

/* Добавление новых сериалов из файла */
async function addTVSeries() {
  try {
    await client.connect();
    const db = client.db("tvseriesdb");
    const seriesCollection = db.collection<TVSeries>("tvseries");

    const fileContent = await fs.readFile(path.join(process.cwd(), 'tvseries.json'), 'utf-8');
    const seriesData: TVSeries[] = JSON.parse(fileContent);

    const processedData = seriesData.map(series => ({
      ...series,
      startDate: new Date(series.startDate),
      releaseDate: new Date(series.releaseDate)
    }));

    const result = await seriesCollection.insertMany(processedData);
    console.log(`Добавлено сериалов: ${result.insertedCount}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      console.error("Ошибка: файл tvseries.json не найден");
    } else {
      console.error("Ошибка при добавлении сериалов:", error);
    }
  } finally {
    await client.close();
  }
}

/* Отображение списка всех сериалов */
async function showAllTVSeries() {
  try {
    await client.connect();
    const db = client.db("tvseriesdb");
    const seriesCollection = db.collection<TVSeries>("tvseries");

    const series = await seriesCollection.find().toArray();

    if (series.length > 0) {
      console.log("\nСписок всех сериалов:");
      for (const show of series) {
        console.log("\n------------------------");
        console.log(`ID: ${show._id}`);
        console.log(`Название: ${show.title}`);
        console.log(`Жанр: ${show.genre}`);
        console.log(`Рейтинг: ${show.rating}/10`);
      }
    } else {
      console.log("В базе данных нет сериалов");
    }
  } catch (error) {
    console.error("Ошибка при получении списка сериалов:", error);
  } finally {
    await client.close();
  }
}

/* Отображение доступных команд */
function showCommands() {
  console.log("\nДоступные команды:");
  console.log("A - добавить сериалы из tvseries.json");
  console.log("S <название> - поиск сериала по названию");
  console.log("L - показать все сериалы");
  console.log("D <id> - удалить сериал по ID");
  console.log("Q - выход");
}

async function handleCommand(input: string) {
  const [command, ...args] = input.toLowerCase().trim().split(' ');

  switch (command) {
    case 'a':
      await addTVSeries();
      break;
    case 's':
      const searchTitle = args.join(' ');
      if (!searchTitle) {
        console.log("Введите название сериала (например: 'S Слово пацана')");
      } else {
        await searchTVSeries(searchTitle);
      }
      break;
    case 'l':
      await showAllTVSeries();
      break;
    case 'd':
      const id = args[0];
      if (!id) {
        console.log("Введите ID сериала (например: 'D 507f1f77bcf86cd799439011')");
      } else {
        await deleteTVSeries(id);
      }
      break;
    case 'q':
      console.log("Программа завершена!");
      rl.close();
      process.exit(0);
    default:
      console.log("Неверная команда!");
      showCommands();
  }
}

function askForCommand() {
  rl.question("> ", async (answer) => {
    await handleCommand(answer);
    askForCommand();
  });
}

async function main() {
  try {
    await initializeDatabase();
    console.log("Добро пожаловать в менеджер сериалов!");
    showCommands();
    askForCommand();
  } catch (error) {
    console.error("Ошибка!", error);
    rl.close();
    process.exit(1);
  }
}

main();
