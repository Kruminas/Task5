const express = require('express');
const cors = require('cors');
const { faker } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

app.use(cors());

function getFakerLocale(region) {
  switch (region) {
    case 'en-US':
      return 'en_US';
    case 'fr':
      return 'fr';
    case 'de':
      return 'de';
    default:
      return 'en_US'; // Default to English (US)
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function fractionalValue(avg) {
  const intPart = Math.floor(avg);
  const fraction = avg - intPart;
  let val = intPart;
  if (Math.random() < fraction) {
    val++;
  }
  return val;
}

app.get('/api/books', (req, res) => {
  const {
    seed = 'default',
    page = 1,
    region = 'en-US',
    likes = '0',
    reviews = '0',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page, 10));
  const avgLikes = Math.max(0, parseFloat(likes));
  const avgReviews = Math.max(0, parseFloat(reviews));

  const combinedSeed = `${seed}-${pageNum}`;
  const fakerLocale = getFakerLocale(region);

  // Set Faker locale
  faker.locale = fakerLocale;
  faker.seed(hashCode(combinedSeed));

  console.log(`Locale set to: ${faker.locale}, Seed: ${combinedSeed}`); // Debug log

  const booksPerPage = 20;
  const books = [];

  for (let i = 0; i < booksPerPage; i++) {
    // Generate localized data
    const title = faker.book.title();
    const author = faker.person.fullName();
    const publisher = faker.company.name();
    const numLikes = fractionalValue(avgLikes);
    const numReviews = fractionalValue(avgReviews);
  

    const bookReviews = [];
    for (let r = 0; r < numReviews; r++) {
      bookReviews.push({
        author: faker.person.fullName(),
        text: faker.lorem.paragraph(),
      });
    }

    // Generate unique ISBN
    let isbn;
    try {
      isbn = faker.unique(() => faker.helpers.replaceSymbols('###-##########'), { maxRetries: 100 });
    } catch (error) {
      isbn = faker.helpers.replaceSymbols('###-##########');
    }

    // Generate a cover image URL based on ISBN
    const coverImageUrl = `https://picsum.photos/seed/${isbn}/200/300`;
    const index = i + 1 + (pageNum - 1) * booksPerPage;

    books.push({
      id: uuidv4(),
      index,
      isbn,
      title,
      author,
      publisher,
      likes: numLikes,
      reviews: bookReviews,
      coverImageUrl,
    });
  }

  res.json(books);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
