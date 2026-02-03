export const quotes = [
  {
    id: 1,
    text: "The only way to do great work is to love what you do.",
    source: "Steve Jobs",
    category: "inspiration"
  },
  {
    id: 2,
    text: "In the middle of difficulty lies opportunity.",
    source: "Albert Einstein",
    category: "inspiration"
  },
  {
    id: 3,
    text: "Life is what happens when you're busy making other plans.",
    source: "John Lennon",
    category: "life"
  },
  {
    id: 4,
    text: "The journey of a thousand miles begins with a single step.",
    source: "Lao Tzu",
    category: "wisdom"
  },
  {
    id: 5,
    text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.",
    source: "Ralph Waldo Emerson",
    category: "inspiration"
  },
  {
    id: 6,
    text: "I have not failed. I've just found ten thousand ways that won't work.",
    source: "Thomas Edison",
    category: "perseverance"
  },
  {
    id: 7,
    text: "The future belongs to those who believe in the beauty of their dreams.",
    source: "Eleanor Roosevelt",
    category: "inspiration"
  },
  {
    id: 8,
    text: "It does not matter how slowly you go as long as you do not stop.",
    source: "Confucius",
    category: "wisdom"
  },
  {
    id: 9,
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    source: "Winston Churchill",
    category: "perseverance"
  },
  {
    id: 10,
    text: "The only thing we have to fear is fear itself.",
    source: "Franklin D. Roosevelt",
    category: "courage"
  },
  {
    id: 11,
    text: "Do what you can, with what you have, where you are.",
    source: "Theodore Roosevelt",
    category: "action"
  },
  {
    id: 12,
    text: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.",
    source: "Albert Einstein",
    category: "creativity"
  },
  {
    id: 13,
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    source: "Nelson Mandela",
    category: "perseverance"
  },
  {
    id: 14,
    text: "You must be the change you wish to see in the world.",
    source: "Mahatma Gandhi",
    category: "inspiration"
  },
  {
    id: 15,
    text: "Stay hungry, stay foolish.",
    source: "Steve Jobs",
    category: "inspiration"
  },
  {
    id: 16,
    text: "The best time to plant a tree was twenty years ago. The second best time is now.",
    source: "Chinese Proverb",
    category: "wisdom"
  },
  {
    id: 17,
    text: "Whether you think you can or you think you can't, you're right.",
    source: "Henry Ford",
    category: "mindset"
  },
  {
    id: 18,
    text: "I gotta catch them all because they're Pokemon!",
    source: "Pokemon Theme Song",
    category: "pokemon"
  },
  {
    id: 19,
    text: "A Pokemon that has just been caught is wild and hard to handle, but with patience it grows to love its trainer.",
    source: "Pokemon Red/Blue",
    category: "pokemon"
  },
  {
    id: 20,
    text: "Strong Pokemon. Weak Pokemon. That is only the selfish perception of people. Truly skilled trainers should try to win with their favorites.",
    source: "Karen, Pokemon Gold/Silver",
    category: "pokemon"
  },
  {
    id: 21,
    text: "It's not always about winning or losing. Sometimes it's about making new friends!",
    source: "Pokemon",
    category: "pokemon"
  },
  {
    id: 22,
    text: "The important thing is not how long you live. It is what you accomplish with your life.",
    source: "Grovyle, Pokemon Mystery Dungeon",
    category: "pokemon"
  },
  {
    id: 23,
    text: "In this world, is the destiny of mankind controlled by some transcendental entity or law?",
    source: "Berserk",
    category: "anime"
  },
  {
    id: 24,
    text: "Whatever you do, enjoy it to the fullest. That is the secret of life.",
    source: "Rider, Fate/Zero",
    category: "anime"
  },
  {
    id: 25,
    text: "The world isn't perfect. But it's there for us, doing the best it can. That's what makes it so beautiful.",
    source: "Roy Mustang, Fullmetal Alchemist",
    category: "anime"
  },
  {
    id: 26,
    text: "People's lives don't end when they die. It ends when they lose faith.",
    source: "Itachi Uchiha, Naruto",
    category: "anime"
  },
  {
    id: 27,
    text: "All we can do is live until the day we die. Control what we can and fly free.",
    source: "Deneil Young, Carole & Tuesday",
    category: "anime"
  },
  {
    id: 28,
    text: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger.",
    source: "Gildarts, Fairy Tail",
    category: "anime"
  },
  {
    id: 29,
    text: "A lesson without pain is meaningless. That's because no one can gain without sacrificing something.",
    source: "Edward Elric, Fullmetal Alchemist",
    category: "anime"
  },
  {
    id: 30,
    text: "The moment you think of giving up, think of the reason why you held on so long.",
    source: "Natsu Dragneel, Fairy Tail",
    category: "anime"
  }
]

export function getRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
}

export function getQuoteById(id) {
  return quotes.find(quote => quote.id === id)
}
