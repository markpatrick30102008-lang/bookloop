export type QuizOption = {
  label: string
  emoji?: string
  tags: string[]
}

export type QuizQuestion = {
  question: string
  sub: string
  options: QuizOption[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What pulls you into a book first?",
    sub: "There's no wrong answer — this is your reading fingerprint.",
    options: [
      { label: "A whole new world to get lost in", emoji: "🏰", tags: ["fantasy", "escapist"] },
      { label: "Real people, real feelings", emoji: "❤️", tags: ["heart", "literary"] },
      { label: "A mystery I can't put down", emoji: "🕵️", tags: ["mystery", "sleuth"] },
      { label: "A future that feels possible", emoji: "🚀", tags: ["scifi", "escapist"] },
      { label: "Smart ideas that change how I think", emoji: "💡", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "How do you like your endings?",
    sub: "Be honest — this reveals a lot.",
    options: [
      { label: "Happily ever after", emoji: "🌅", tags: ["heart", "cozy"] },
      { label: "Bittersweet and memorable", emoji: "🍂", tags: ["literary", "thinker"] },
      { label: "A twist I never saw coming", emoji: "🌀", tags: ["mystery", "sleuth"] },
      { label: "Endings are for quitters — bring a sequel", emoji: "♾️", tags: ["escapist", "fantasy"] },
    ],
  },
  {
    question: "How deep should the story go?",
    sub: "Light snack or full feast?",
    options: [
      { label: "Light and easy — my brain needs a break", emoji: "🌿", tags: ["cozy", "heart"] },
      { label: "Somewhere in the middle", emoji: "⚖️", tags: ["cozy", "mystery"] },
      { label: "Dive deep — give me the big questions", emoji: "🌊", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "How do you actually read?",
    sub: "Be real — bus rides count.",
    options: [
      { label: "Quick bites, short chapters", emoji: "🥨", tags: ["cozy", "sleuth"] },
      { label: "A chapter or two a night", emoji: "🛋️", tags: ["heart", "mystery"] },
      { label: "I vanish for days inside a saga", emoji: "🔥", tags: ["escapist", "fantasy"] },
    ],
  },
  {
    question: "Pick the reading mood you crave right now",
    sub: "This is the feeling BookLoop will chase for you.",
    options: [
      { label: "Make me laugh out loud", emoji: "😂", tags: ["cozy", "heart"] },
      { label: "Sweep me away somewhere magical", emoji: "✨", tags: ["fantasy", "escapist"] },
      { label: "Keep me on the edge of my seat", emoji: "😱", tags: ["mystery", "sleuth"] },
      { label: "Make me feel understood", emoji: "🤍", tags: ["heart", "literary"] },
      { label: "Blow my mind with ideas", emoji: "🤯", tags: ["thinker", "scifi"] },
    ],
  },
  {
    question: "What's your ideal reading companion?",
    sub: "Paint the scene — it tells us a lot.",
    options: [
      { label: "A coffee that never empties", emoji: "☕", tags: ["cozy", "heart"] },
      { label: "Rain on the window", emoji: "🌧️", tags: ["literary", "thinker"] },
      { label: "A blanket and a couch", emoji: "🛋️", tags: ["cozy", "fantasy"] },
      { label: "A long train ride", emoji: "🚆", tags: ["sleuth", "mystery"] },
      { label: "A quiet library corner", emoji: "📚", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "Pick your dream protagonist",
    sub: "Who do you want to be for 300 pages?",
    options: [
      { label: "The unlikely hero", emoji: "🛡️", tags: ["fantasy", "escapist"] },
      { label: "The genius detective", emoji: "🕵️", tags: ["sleuth", "mystery"] },
      { label: "The rebel against the system", emoji: "✊", tags: ["scifi", "escapist"] },
      { label: "The quiet observer", emoji: "👁️", tags: ["literary", "thinker"] },
      { label: "The hopeless romantic", emoji: "💘", tags: ["heart"] },
    ],
  },
  {
    question: "What makes a five-star read for you?",
    sub: "The real magic ingredient.",
    options: [
      { label: "A twist I never saw coming", emoji: "🌀", tags: ["sleuth", "mystery"] },
      { label: "Characters I'll miss when it ends", emoji: "💔", tags: ["heart", "literary"] },
      { label: "A world I never want to leave", emoji: "🌍", tags: ["escapist", "fantasy"] },
      { label: "It changed how I think", emoji: "🧠", tags: ["thinker", "scifi"] },
      { label: "Pure comfort from page one", emoji: "🧸", tags: ["cozy"] },
    ],
  },
  {
    question: "BookTok chose your next read. What's on the cover?",
    sub: "Judge the book by its cover — just this once.",
    options: [
      { label: "An enchanted forest", emoji: "🌲", tags: ["fantasy", "escapist"] },
      { label: "A flickering streetlight", emoji: "🌃", tags: ["mystery", "sleuth"] },
      { label: "Two people about to kiss", emoji: "💋", tags: ["heart", "cozy"] },
      { label: "A ship heading for the stars", emoji: "🚀", tags: ["scifi", "escapist"] },
      { label: "A desk covered in notes", emoji: "🗒️", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "Your phone dies mid-book. How do you feel?",
    sub: "Be honest.",
    options: [
      { label: "Fine — I know the ending by heart", emoji: "😌", tags: ["cozy", "heart"] },
      { label: "Panic — I need the twist NOW", emoji: "😱", tags: ["sleuth", "mystery"] },
      { label: "Relieved, my eyes needed a break", emoji: "😮‍💨", tags: ["literary", "cozy"] },
      { label: "Annoyed — I was mapping the world", emoji: "🗺️", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "Which shelf do you gravitate to in a bookstore?",
    sub: "Go with your gut.",
    options: [
      { label: "The one with dragons on the covers", emoji: "🐉", tags: ["fantasy", "escapist"] },
      { label: "The crime section", emoji: "🔦", tags: ["sleuth", "mystery"] },
      { label: "The big idea books", emoji: "💡", tags: ["thinker", "literary"] },
      { label: "The cozy front-table bestsellers", emoji: "🛋️", tags: ["cozy", "heart"] },
    ],
  },
  {
    question: "How do you feel about series?",
    sub: "There's no wrong answer.",
    options: [
      { label: "Give me ten books, please", emoji: "📚", tags: ["fantasy", "escapist"] },
      { label: "One and done", emoji: "🏁", tags: ["mystery", "heart"] },
      { label: "A trilogy is the sweet spot", emoji: "⚖️", tags: ["sleuth", "scifi"] },
    ],
  },
  {
    question: "You win a free book. Which format?",
    sub: "Choose wisely.",
    options: [
      { label: "A signed hardcover", emoji: "✒️", tags: ["heart", "literary"] },
      { label: "A floppy paperback for my bag", emoji: "🎒", tags: ["cozy", "sleuth"] },
      { label: "An audiobook for my commute", emoji: "🎧", tags: ["scifi", "thinker"] },
    ],
  },
  {
    question: "What's your ideal chapter length?",
    sub: "Snack or feast?",
    options: [
      { label: "Short — I snack on books", emoji: "🍪", tags: ["cozy", "sleuth"] },
      { label: "Medium — a chapter per coffee", emoji: "☕", tags: ["heart", "mystery"] },
      { label: "Long — I settle in for hours", emoji: "🔥", tags: ["escapist", "fantasy"] },
    ],
  },
  {
    question: "Which cover art would you pause on?",
    sub: "Judging by the cover, just once.",
    options: [
      { label: "A stormy castle on a cliff", emoji: "🏰", tags: ["fantasy", "escapist"] },
      { label: "A shadowed figure in a doorway", emoji: "🚪", tags: ["mystery", "sleuth"] },
      { label: "Two hands almost touching", emoji: "🤝", tags: ["heart", "cozy"] },
      { label: "A minimalist geometric print", emoji: "🔺", tags: ["thinker", "scifi"] },
    ],
  },
  {
    question: "First sentences only — pick your hook.",
    sub: "Which one grabs you?",
    options: [
      { label: "“The dragon was late.”", emoji: "🐲", tags: ["fantasy", "escapist"] },
      { label: "“She was never supposed to die on page one.”", emoji: "🩸", tags: ["mystery", "sleuth"] },
      { label: "“He remembered everything except her name.”", emoji: "💭", tags: ["heart", "literary"] },
      { label: "“The algorithm predicted all of this.”", emoji: "🤖", tags: ["scifi", "thinker"] },
    ],
  },
  {
    question: "Which adaptation would you rather watch?",
    sub: "Movie night is on you.",
    options: [
      { label: "The sweeping fantasy epic", emoji: "🎬", tags: ["fantasy", "escapist"] },
      { label: "The edge-of-seat thriller", emoji: "🍿", tags: ["sleuth", "mystery"] },
      { label: "The quiet indie drama", emoji: "🎞️", tags: ["heart", "literary"] },
      { label: "The cerebral sci-fi puzzle", emoji: "🛸", tags: ["scifi", "thinker"] },
    ],
  },
  {
    question: "Rate your appetite for tragedy.",
    sub: "Honesty appreciated.",
    options: [
      { label: "I cry and I thank the author", emoji: "😭", tags: ["heart", "literary"] },
      { label: "Happy ending or nothing", emoji: "🌈", tags: ["cozy", "fantasy"] },
      { label: "Tragedy is just sequel fuel", emoji: "♾️", tags: ["sleuth", "escapist"] },
    ],
  },
  {
    question: "What do you do when a book slows down?",
    sub: "Every reader has a move.",
    options: [
      { label: "Speed-read to the good part", emoji: "⚡", tags: ["sleuth", "cozy"] },
      { label: "Savor it — slow is good", emoji: "🐢", tags: ["literary", "thinker"] },
      { label: "I never notice, I'm lost in it", emoji: "🌊", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "Your book club picks the next read. Your vote?",
    sub: "Time to influence people.",
    options: [
      { label: "Something light and fun", emoji: "🎈", tags: ["cozy", "heart"] },
      { label: "A conversation starter", emoji: "🗣️", tags: ["thinker", "literary"] },
      { label: "A page-turner nobody can put down", emoji: "📖", tags: ["sleuth", "mystery"] },
    ],
  },
  {
    question: "How many books are in your to-read pile right now?",
    sub: "No judgment here.",
    options: [
      { label: "Two or three", emoji: "😇", tags: ["cozy", "heart"] },
      { label: "A small library", emoji: "🏛️", tags: ["fantasy", "escapist"] },
      { label: "I lost count after 40", emoji: "🤯", tags: ["thinker", "sleuth"] },
    ],
  },
  {
    question: "Which reading snack is calling?",
    sub: "Fuel for the pages.",
    options: [
      { label: "Chocolate and milk", emoji: "🍫", tags: ["cozy", "heart"] },
      { label: "Coffee, black, strong", emoji: "☕", tags: ["sleuth", "thinker"] },
      { label: "Tea in a big mug", emoji: "🍵", tags: ["literary", "cozy"] },
      { label: "Whatever's open — I'm engrossed", emoji: "🫣", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "What's your bedtime reading?",
    sub: "Sweet dreams material.",
    options: [
      { label: "A chapter of something warm", emoji: "🛌", tags: ["cozy", "heart"] },
      { label: "A mystery to solve in my dreams", emoji: "🌙", tags: ["sleuth", "mystery"] },
      { label: "Ideas that keep me up", emoji: "🤔", tags: ["thinker", "scifi"] },
      { label: "A portal to another world", emoji: "🌀", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "Bookmark or dog-ear?",
    sub: "A very serious question.",
    options: [
      { label: "Fancy bookmark, always", emoji: "🎀", tags: ["heart", "cozy"] },
      { label: "Dog-ear, no shame", emoji: "🐶", tags: ["sleuth", "escapist"] },
      { label: "I remember the page by heart", emoji: "🧠", tags: ["literary", "thinker"] },
    ],
  },
  {
    question: "Pick a fictional setting to live in.",
    sub: "Your relocation papers await.",
    options: [
      { label: "A floating library", emoji: "🏰", tags: ["fantasy", "escapist"] },
      { label: "A neon city of the future", emoji: "🌆", tags: ["scifi", "sleuth"] },
      { label: "A small town where everyone knows you", emoji: "🏘️", tags: ["cozy", "heart"] },
      { label: "A grand university of ideas", emoji: "🎓", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "What breaks a book for you?",
    sub: "The unforgivable sins.",
    options: [
      { label: "A predictable ending", emoji: "🙄", tags: ["sleuth", "mystery"] },
      { label: "Flat characters", emoji: "🪵", tags: ["heart", "literary"] },
      { label: "A boring world", emoji: "🫥", tags: ["fantasy", "escapist"] },
      { label: "Nothing — I finish everything", emoji: "🏋️", tags: ["cozy", "thinker"] },
    ],
  },
  {
    question: "Which blurb line excites you most?",
    sub: "Marketing works on readers too.",
    options: [
      { label: "“Hilarious and heartfelt”", emoji: "😂", tags: ["cozy", "heart"] },
      { label: "“You won't guess the ending”", emoji: "🫨", tags: ["sleuth", "mystery"] },
      { label: "“A mind-bending classic”", emoji: "🧠", tags: ["thinker", "scifi"] },
      { label: "“A richly imagined world”", emoji: "🌍", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "Your favorite reading spot?",
    sub: "Location matters.",
    options: [
      { label: "My bed, best position ever", emoji: "🛏️", tags: ["cozy", "heart"] },
      { label: "A café corner", emoji: "☕", tags: ["sleuth", "literary"] },
      { label: "The library", emoji: "📚", tags: ["thinker", "fantasy"] },
      { label: "Anywhere — the book is the place", emoji: "🧭", tags: ["escapist", "scifi"] },
    ],
  },
  {
    question: "What do you do with a book you loved?",
    sub: "The afterlife of a good read.",
    options: [
      { label: "Loan it to a friend immediately", emoji: "🤝", tags: ["heart", "cozy"] },
      { label: "Keep it to reread someday", emoji: "🏠", tags: ["literary", "fantasy"] },
      { label: "Pass it on and find the next one", emoji: "🔄", tags: ["sleuth", "escapist"] },
    ],
  },
  {
    question: "Which character flaw makes you love them more?",
    sub: "Perfect is boring.",
    options: [
      { label: "Clumsy but brave", emoji: "🐣", tags: ["fantasy", "cozy"] },
      { label: "Too sharp for their own good", emoji: "🗡️", tags: ["sleuth", "mystery"] },
      { label: "Reckless romantic", emoji: "💘", tags: ["heart"] },
      { label: "Brilliant and arrogant", emoji: "👑", tags: ["thinker", "scifi"] },
    ],
  },
  {
    question: "Which side character do you want to follow?",
    sub: "The best stories hide in the corners.",
    options: [
      { label: "The sarcastic mentor", emoji: "🧙", tags: ["fantasy", "thinker"] },
      { label: "The best friend with a secret", emoji: "🤫", tags: ["mystery", "heart"] },
      { label: "The spy in the corner", emoji: "🕶️", tags: ["sleuth", "scifi"] },
      { label: "The baker who knows everything", emoji: "🥐", tags: ["cozy", "heart"] },
    ],
  },
  {
    question: "How do you judge a book before page one?",
    sub: "Every reader has a system.",
    options: [
      { label: "The cover", emoji: "🎨", tags: ["cozy", "fantasy"] },
      { label: "The blurb", emoji: "📄", tags: ["sleuth", "thinker"] },
      { label: "The first line", emoji: "✍️", tags: ["literary", "mystery"] },
      { label: "Word of mouth", emoji: "🗣️", tags: ["heart", "escapist"] },
    ],
  },
  {
    question: "Rainy day, no plans. What's the play?",
    sub: "A perfect day.",
    options: [
      { label: "A long book and longer tea", emoji: "🍵", tags: ["cozy", "literary"] },
      { label: "Three short thrillers", emoji: "🌪️", tags: ["sleuth", "mystery"] },
      { label: "One epic saga", emoji: "🗻", tags: ["fantasy", "escapist"] },
      { label: "Essays and a notebook", emoji: "📓", tags: ["thinker", "scifi"] },
    ],
  },
  {
    question: "Which quote would you frame?",
    sub: "Wall art for readers.",
    options: [
      { label: "“Not all those who wander are lost.”", emoji: "🏔️", tags: ["fantasy", "escapist"] },
      { label: "“It does not do to dwell on dreams.”", emoji: "🌫️", tags: ["literary", "heart"] },
      { label: "“The unexamined life is not worth living.”", emoji: "⚖️", tags: ["thinker"] },
      { label: "“The truth is rarely pure and never simple.”", emoji: "🔎", tags: ["sleuth", "mystery"] },
    ],
  },
  {
    question: "What's the best part of finishing a book?",
    sub: "The finish line feeling.",
    options: [
      { label: "That perfect ending feeling", emoji: "🥹", tags: ["heart", "literary"] },
      { label: "Crossing it off my list", emoji: "✅", tags: ["thinker", "cozy"] },
      { label: "Debating it with friends", emoji: "💬", tags: ["sleuth", "scifi"] },
      { label: "Immediately starting the sequel", emoji: "🏃", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "Choose a reading challenge.",
    sub: "Prove yourself.",
    options: [
      { label: "52 books in a year", emoji: "🏆", tags: ["sleuth", "thinker"] },
      { label: "One enormous classic", emoji: "🗿", tags: ["literary", "fantasy"] },
      { label: "A whole series in a month", emoji: "⚔️", tags: ["escapist", "cozy"] },
      { label: "All the award winners", emoji: "🎖️", tags: ["heart", "scifi"] },
    ],
  },
  {
    question: "Which bookstore smell do you love?",
    sub: "A sensory experience.",
    options: [
      { label: "Old paper", emoji: "📜", tags: ["literary", "thinker"] },
      { label: "Fresh ink and new books", emoji: "🖨️", tags: ["sleuth", "cozy"] },
      { label: "Coffee from next door", emoji: "☕", tags: ["heart", "fantasy"] },
      { label: "Rain on the windowsill", emoji: "🌧️", tags: ["escapist", "mystery"] },
    ],
  },
  {
    question: "Your ideal book length?",
    sub: "Size matters to readers.",
    options: [
      { label: "Give me 800 pages", emoji: "🏋️", tags: ["fantasy", "escapist"] },
      { label: "A tight 300", emoji: "🎯", tags: ["sleuth", "mystery"] },
      { label: "A novella I'll finish tonight", emoji: "🌙", tags: ["cozy", "heart"] },
      { label: "200 pages of pure density", emoji: "💎", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "What would your superpower as a reader be?",
    sub: "Pick your reader X-men.",
    options: [
      { label: "Finishing books in one sitting", emoji: "⚡", tags: ["fantasy", "escapist"] },
      { label: "Remembering every plot twist", emoji: "🧠", tags: ["sleuth", "mystery"] },
      { label: "Feeling every emotion the author writes", emoji: "💗", tags: ["heart", "literary"] },
      { label: "Finding the best book in any store", emoji: "🔮", tags: ["cozy", "scifi"] },
    ],
  },
  {
    question: "Which reading era is yours?",
    sub: "Time travel for readers.",
    options: [
      { label: "The golden fantasy sagas", emoji: "🐉", tags: ["fantasy", "escapist"] },
      { label: "The golden age of mysteries", emoji: "🕰️", tags: ["sleuth", "mystery"] },
      { label: "The modern age of big ideas", emoji: "🌐", tags: ["thinker", "scifi"] },
      { label: "The cozy contemporary wave", emoji: "🧶", tags: ["cozy", "heart"] },
    ],
  },
  {
    question: "You're stranded with one book. Which?",
    sub: "Choose your island companion.",
    options: [
      { label: "The one that makes me feel", emoji: "💞", tags: ["heart", "literary"] },
      { label: "The one I never finished", emoji: "⏳", tags: ["sleuth", "fantasy"] },
      { label: "The one with a thousand pages", emoji: "📚", tags: ["escapist", "thinker"] },
    ],
  },
  {
    question: "What do you underline?",
    sub: "The margin question.",
    options: [
      { label: "The pretty sentences", emoji: "🌸", tags: ["literary", "heart"] },
      { label: "The crucial clues", emoji: "🔍", tags: ["sleuth", "mystery"] },
      { label: "The big ideas", emoji: "💡", tags: ["thinker", "scifi"] },
      { label: "Nothing — the book stays pristine", emoji: "🧤", tags: ["cozy", "fantasy"] },
    ],
  },
  {
    question: "Which literary trope do you secretly love?",
    sub: "We all have favorites.",
    options: [
      { label: "Enemies to lovers", emoji: "⚔️", tags: ["heart"] },
      { label: "Found family", emoji: "👨‍👩‍👧‍👦", tags: ["cozy", "heart"] },
      { label: "The chosen one", emoji: "⭐", tags: ["fantasy", "escapist"] },
      { label: "The locked-room mystery", emoji: "🔒", tags: ["sleuth", "mystery"] },
      { label: "The unreliable narrator", emoji: "🎭", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "Your comfort book is…",
    sub: "The one you always return to.",
    options: [
      { label: "Rereadable forever", emoji: "♾️", tags: ["cozy", "heart"] },
      { label: "Short and sweet", emoji: "🍬", tags: ["literary", "fantasy"] },
      { label: "Full of twists I still love", emoji: "🌀", tags: ["sleuth", "mystery"] },
      { label: "The one that made me a reader", emoji: "🌟", tags: ["escapist", "thinker"] },
    ],
  },
  {
    question: "Pick a bookish scent.",
    sub: "For your imaginary candle line.",
    options: [
      { label: "Pine and parchment", emoji: "🌲", tags: ["fantasy", "escapist"] },
      { label: "Coffee and crime scenes", emoji: "🕵️", tags: ["sleuth", "mystery"] },
      { label: "Lavender and tea", emoji: "💜", tags: ["cozy", "heart"] },
      { label: "Ink and circuitry", emoji: "🔌", tags: ["scifi", "thinker"] },
    ],
  },
  {
    question: "How do you pick your next book?",
    sub: "The eternal question.",
    options: [
      { label: "My mood chooses", emoji: "🎭", tags: ["heart", "cozy"] },
      { label: "The algorithm chooses", emoji: "🤖", tags: ["sleuth", "scifi"] },
      { label: "My friends choose", emoji: "👯", tags: ["cozy", "literary"] },
      { label: "The stack itself chooses", emoji: "📚", tags: ["fantasy", "thinker"] },
    ],
  },
  {
    question: "What's a book without?",
    sub: "Fill in the blank.",
    options: [
      { label: "A satisfying ending", emoji: "🎬", tags: ["heart", "literary"] },
      { label: "A twist", emoji: "🌀", tags: ["sleuth", "mystery"] },
      { label: "A world", emoji: "🌍", tags: ["fantasy", "escapist"] },
      { label: "An argument", emoji: "⚖️", tags: ["thinker", "scifi"] },
      { label: "A warm feeling", emoji: "♨️", tags: ["cozy"] },
    ],
  },
  {
    question: "Your dream reading companion is…",
    sub: "Who's on the couch?",
    options: [
      { label: "A cat", emoji: "🐱", tags: ["cozy", "heart"] },
      { label: "A dog", emoji: "🐶", tags: ["heart", "fantasy"] },
      { label: "Nobody — it's sacred", emoji: "🙏", tags: ["literary", "thinker"] },
      { label: "A fellow bookworm", emoji: "🐛", tags: ["sleuth", "escapist"] },
    ],
  },
  {
    question: "Which ending do you replay in your head?",
    sub: "The ones that stick.",
    options: [
      { label: "The bittersweet goodbye", emoji: "🥀", tags: ["heart", "literary"] },
      { label: "The reveal I missed", emoji: "😱", tags: ["sleuth", "mystery"] },
      { label: "The epic battle", emoji: "⚔️", tags: ["fantasy", "escapist"] },
      { label: "The final argument won", emoji: "🏆", tags: ["thinker", "scifi"] },
      { label: "The quiet happy ever after", emoji: "🌅", tags: ["cozy"] },
    ],
  },
  {
    question: "Would you read a book because of its cover?",
    sub: "Confess.",
    options: [
      { label: "Always", emoji: "🎨", tags: ["cozy", "fantasy"] },
      { label: "Sometimes", emoji: "🤷", tags: ["heart", "sleuth"] },
      { label: "Never — content first", emoji: "📖", tags: ["thinker", "literary"] },
      { label: "Only if the title intrigues me", emoji: "🧐", tags: ["escapist", "mystery"] },
    ],
  },
  {
    question: "Choose your fictional job.",
    sub: "Career day in another world.",
    options: [
      { label: "Keeper of a magical library", emoji: "🔮", tags: ["fantasy", "escapist"] },
      { label: "Detective in a noir city", emoji: "🚬", tags: ["sleuth", "mystery"] },
      { label: "Architect of cities on Mars", emoji: "🔴", tags: ["scifi", "thinker"] },
      { label: "Owner of a tiny bookshop", emoji: "🏪", tags: ["cozy", "heart"] },
      { label: "Travel writer", emoji: "🧳", tags: ["literary", "heart"] },
    ],
  },
  {
    question: "Which reading habit is most you?",
    sub: "Own it.",
    options: [
      { label: "Reading the last page first", emoji: "👀", tags: ["sleuth", "mystery"] },
      { label: "Never skipping a word", emoji: "🔤", tags: ["literary", "thinker"] },
      { label: "Reading three books at once", emoji: "🎪", tags: ["fantasy", "escapist"] },
      { label: "Finishing every book no matter what", emoji: "💪", tags: ["cozy", "heart"] },
    ],
  },
  {
    question: "Your favorite kind of literary villain?",
    sub: "Who's the best bad guy?",
    options: [
      { label: "The misunderstood one", emoji: "🥺", tags: ["heart", "literary"] },
      { label: "The brilliant mastermind", emoji: "🧩", tags: ["sleuth", "thinker"] },
      { label: "The ancient evil", emoji: "🐍", tags: ["fantasy", "escapist"] },
      { label: "The corporate one", emoji: "💼", tags: ["scifi", "mystery"] },
    ],
  },
  {
    question: "What makes you put a book down?",
    sub: "The emergency brake.",
    options: [
      { label: "Nothing, ever", emoji: "🛡️", tags: ["cozy", "fantasy"] },
      { label: "A boring middle", emoji: "😴", tags: ["sleuth", "mystery"] },
      { label: "A predictable pattern", emoji: "📉", tags: ["thinker", "scifi"] },
      { label: "Characters I don't care about", emoji: "🪦", tags: ["heart", "literary"] },
    ],
  },
  {
    question: "Audiobook or paper?",
    sub: "The format wars.",
    options: [
      { label: "Paper, always", emoji: "📄", tags: ["literary", "cozy"] },
      { label: "Audiobook on my commute", emoji: "🎧", tags: ["sleuth", "scifi"] },
      { label: "Both — same story", emoji: "🤗", tags: ["fantasy", "heart"] },
      { label: "E-book with a night-light", emoji: "📱", tags: ["thinker", "mystery"] },
    ],
  },
  {
    question: "What do you notice first about a book?",
    sub: "First impressions.",
    options: [
      { label: "The author", emoji: "✒️", tags: ["literary", "heart"] },
      { label: "The genre", emoji: "🏷️", tags: ["sleuth", "fantasy"] },
      { label: "The page count", emoji: "📏", tags: ["cozy", "escapist"] },
      { label: "The awards on the cover", emoji: "🏅", tags: ["thinker", "scifi"] },
    ],
  },
  {
    question: "Your reading pace?",
    sub: "No wrong speed.",
    options: [
      { label: "A book a week", emoji: "🗓️", tags: ["cozy", "sleuth"] },
      { label: "A book a month, savored", emoji: "🍷", tags: ["literary", "heart"] },
      { label: "A book a day when it hits", emoji: "🚀", tags: ["fantasy", "escapist"] },
      { label: "I read in sprints", emoji: "🏃", tags: ["thinker", "mystery"] },
    ],
  },
  {
    question: "Which fictional family would you join?",
    sub: "You've been adopted.",
    options: [
      { label: "A clan of adventurers", emoji: "🗺️", tags: ["fantasy", "escapist"] },
      { label: "A family with secrets", emoji: "🤐", tags: ["mystery", "heart"] },
      { label: "A found family in space", emoji: "🚀", tags: ["scifi", "cozy"] },
      { label: "A dynasty of thinkers", emoji: "🏛️", tags: ["thinker", "literary"] },
    ],
  },
  {
    question: "What's your ideal book night?",
    sub: "Plan the perfect evening.",
    options: [
      { label: "Solo, blanket, snack", emoji: "🛋️", tags: ["cozy", "heart"] },
      { label: "Reading aloud with someone", emoji: "🗣️", tags: ["literary", "heart"] },
      { label: "A reading sprint with friends", emoji: "🏁", tags: ["sleuth", "escapist"] },
      { label: "An all-nighter with a page-turner", emoji: "🌃", tags: ["mystery", "fantasy"] },
    ],
  },
  {
    question: "Which review would you trust?",
    sub: "The verdict is in.",
    options: [
      { label: "“Couldn't put it down”", emoji: "📌", tags: ["sleuth", "mystery"] },
      { label: "“Made me sob in public”", emoji: "😭", tags: ["heart", "literary"] },
      { label: "“A world you'll never forget”", emoji: "🌌", tags: ["fantasy", "escapist"] },
      { label: "“Changed the way I think”", emoji: "🧠", tags: ["thinker", "scifi"] },
      { label: "“Like a hug in book form”", emoji: "🤗", tags: ["cozy"] },
    ],
  },
  {
    question: "Choose your reader's tool.",
    sub: "The essentials.",
    options: [
      { label: "A fountain pen for margin notes", emoji: "🖋️", tags: ["thinker", "literary"] },
      { label: "A highlighter for key lines", emoji: "🖍️", tags: ["heart", "sleuth"] },
      { label: "A beautiful bookmark", emoji: "🎀", tags: ["cozy", "fantasy"] },
      { label: "Nothing — I remember everything", emoji: "🧿", tags: ["escapist", "mystery"] },
    ],
  },
  {
    question: "Which setting gives you book wanderlust?",
    sub: "Pack your bags.",
    options: [
      { label: "An enchanted academy", emoji: "🏫", tags: ["fantasy", "escapist"] },
      { label: "A rain-soaked city", emoji: "🌃", tags: ["mystery", "literary"] },
      { label: "A starship deck", emoji: "🚀", tags: ["scifi", "thinker"] },
      { label: "A sunlit seaside village", emoji: "🏖️", tags: ["cozy", "heart"] },
    ],
  },
  {
    question: "What's the best cure for a reading slump?",
    sub: "We've all been there.",
    options: [
      { label: "A comfort reread", emoji: "🫖", tags: ["cozy", "heart"] },
      { label: "A short thriller", emoji: "⚡", tags: ["sleuth", "mystery"] },
      { label: "A brand-new genre", emoji: "🆕", tags: ["thinker", "escapist"] },
      { label: "A beautiful classic", emoji: "🏛️", tags: ["literary", "fantasy"] },
    ],
  },
  {
    question: "Which side plot do you secretly love?",
    sub: "The B-plot is the best plot.",
    options: [
      { label: "The slow-burn romance", emoji: "🔥", tags: ["heart", "cozy"] },
      { label: "The background conspiracy", emoji: "🕸️", tags: ["sleuth", "scifi"] },
      { label: "The friendship arc", emoji: "🤝", tags: ["literary", "heart"] },
      { label: "The world's secret history", emoji: "📜", tags: ["fantasy", "thinker"] },
    ],
  },
  {
    question: "Pick a reading ritual.",
    sub: "Rituals make it real.",
    options: [
      { label: "Tea first, then chapter one", emoji: "🍵", tags: ["cozy", "heart"] },
      { label: "A walk, then a book", emoji: "🚶", tags: ["literary", "thinker"] },
      { label: "Blanket fort protocol", emoji: "🏕️", tags: ["fantasy", "escapist"] },
      { label: "Late-night only", emoji: "🌙", tags: ["sleuth", "mystery"] },
    ],
  },
  {
    question: "What do you gift a fellow reader?",
    sub: "The reader's dilemma.",
    options: [
      { label: "A book I loved", emoji: "🎁", tags: ["heart", "cozy"] },
      { label: "A signed edition", emoji: "✒️", tags: ["literary", "fantasy"] },
      { label: "A reading journal", emoji: "📓", tags: ["thinker", "sleuth"] },
      { label: "A gift card to the bookstore", emoji: "💳", tags: ["escapist", "scifi"] },
    ],
  },
  {
    question: "Which bookish hill will you die on?",
    sub: "Pick your stance.",
    options: [
      { label: "Ebooks are real books", emoji: "📱", tags: ["thinker", "scifi"] },
      { label: "Cover art matters", emoji: "🎨", tags: ["cozy", "fantasy"] },
      { label: "Series order is sacred", emoji: "⛪", tags: ["sleuth", "escapist"] },
      { label: "Annotations are beautiful", emoji: "💌", tags: ["heart", "literary"] },
    ],
  },
  {
    question: "Your villain origin story?",
    sub: "Every hero has one. You're the villain.",
    options: [
      { label: "The betrayed hero", emoji: "💔", tags: ["heart", "literary"] },
      { label: "The scientist pushed too far", emoji: "🔬", tags: ["scifi", "thinker"] },
      { label: "The one who knew too much", emoji: "🗝️", tags: ["sleuth", "mystery"] },
      { label: "The forgotten youngest sibling", emoji: "🥉", tags: ["fantasy", "escapist"] },
      { label: "The one who just wanted peace", emoji: "🕊️", tags: ["cozy"] },
    ],
  },
  {
    question: "How do you handle hype?",
    sub: "The hype machine.",
    options: [
      { label: "I read it immediately", emoji: "🏃", tags: ["sleuth", "fantasy"] },
      { label: "I wait for the hype to die", emoji: "⏳", tags: ["literary", "thinker"] },
      { label: "I trust my friends' hype", emoji: "🤝", tags: ["heart", "cozy"] },
      { label: "I read it five years later", emoji: "🕰️", tags: ["escapist", "mystery"] },
    ],
  },
  {
    question: "Which magic would you choose?",
    sub: "The magic system question.",
    options: [
      { label: "Teleportation", emoji: "🫧", tags: ["escapist", "scifi"] },
      { label: "Mind reading", emoji: "🧠", tags: ["mystery", "thinker"] },
      { label: "Healing", emoji: "🌿", tags: ["cozy", "heart"] },
      { label: "Time bending", emoji: "⏳", tags: ["sleuth", "fantasy"] },
    ],
  },
  {
    question: "Your favorite part of a story?",
    sub: "The anatomy of a great read.",
    options: [
      { label: "The setup", emoji: "🧱", tags: ["mystery", "literary"] },
      { label: "The midpoint twist", emoji: "🌀", tags: ["sleuth", "fantasy"] },
      { label: "The payoff", emoji: "🎉", tags: ["heart", "escapist"] },
      { label: "The worldbuilding", emoji: "🏗️", tags: ["thinker", "scifi"] },
    ],
  },
  {
    question: "Which snack pairs with a mystery?",
    sub: "Detective fuel.",
    options: [
      { label: "Popcorn", emoji: "🍿", tags: ["sleuth", "mystery"] },
      { label: "Biscuits and tea", emoji: "🍪", tags: ["cozy", "heart"] },
      { label: "Dark chocolate", emoji: "🍫", tags: ["literary", "thinker"] },
      { label: "Midnight instant noodles", emoji: "🍜", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "Which reading gadget tempts you?",
    sub: "Reader tech.",
    options: [
      { label: "An e-reader with a backlight", emoji: "📱", tags: ["scifi", "sleuth"] },
      { label: "A smart book light", emoji: "💡", tags: ["thinker", "cozy"] },
      { label: "A beautiful book sleeve", emoji: "👜", tags: ["heart", "fantasy"] },
      { label: "Nothing — I'm analog", emoji: "📜", tags: ["literary", "mystery"] },
    ],
  },
  {
    question: "What would your reading room look like?",
    sub: "Interior design, reader edition.",
    options: [
      { label: "Floor-to-ceiling shelves", emoji: "🗄️", tags: ["fantasy", "thinker"] },
      { label: "One perfect armchair", emoji: "💺", tags: ["cozy", "heart"] },
      { label: "A desk covered in notes", emoji: "🗒️", tags: ["literary", "sleuth"] },
      { label: "A hammock with a view", emoji: "🌴", tags: ["escapist", "scifi"] },
    ],
  },
  {
    question: "Choose a bookish playlist.",
    sub: "What's playing while you read?",
    options: [
      { label: "Cinematic scores", emoji: "🎻", tags: ["fantasy", "escapist"] },
      { label: "Rain sounds", emoji: "🌧️", tags: ["literary", "cozy"] },
      { label: "Dark electronic", emoji: "🎹", tags: ["mystery", "scifi"] },
      { label: "Indie acoustic", emoji: "🎸", tags: ["heart", "thinker"] },
    ],
  },
  {
    question: "Which ending do you refuse to forgive?",
    sub: "Reader grievances, aired.",
    options: [
      { label: "It was all a dream", emoji: "💤", tags: ["sleuth", "thinker"] },
      { label: "Instant villain redemption", emoji: "😇", tags: ["mystery", "heart"] },
      { label: "The love triangle", emoji: "🔺", tags: ["cozy", "fantasy"] },
      { label: "No ending at all", emoji: "🕳️", tags: ["escapist", "literary"] },
    ],
  },
  {
    question: "Your bookish pet peeve?",
    sub: "Rant time.",
    options: [
      { label: "Spoilers", emoji: "🤐", tags: ["sleuth", "mystery"] },
      { label: "Dog-eared library books", emoji: "🐶", tags: ["literary", "cozy"] },
      { label: "Cliffhangers that take years", emoji: "🪢", tags: ["fantasy", "escapist"] },
      { label: "Misleading blurbs", emoji: "🎣", tags: ["thinker", "heart"] },
    ],
  },
  {
    question: "Which bookish activity sounds fun?",
    sub: "Pick your event.",
    options: [
      { label: "Blind-date-with-a-book shelf", emoji: "💌", tags: ["cozy", "heart"] },
      { label: "A reading marathon", emoji: "🏃", tags: ["sleuth", "escapist"] },
      { label: "An author Q&A", emoji: "🎤", tags: ["thinker", "literary"] },
      { label: "A book swap party", emoji: "🔄", tags: ["fantasy", "mystery"] },
    ],
  },
  {
    question: "Where do you start a new series?",
    sub: "Series etiquette.",
    options: [
      { label: "Book one, obviously", emoji: "1️⃣", tags: ["sleuth", "literary"] },
      { label: "The shortest one first", emoji: "📏", tags: ["cozy", "mystery"] },
      { label: "Wherever the mood takes me", emoji: "🎲", tags: ["escapist", "heart"] },
      { label: "Chronological order, always", emoji: "🗓️", tags: ["thinker", "fantasy"] },
    ],
  },
  {
    question: "Your favorite fictional celebration?",
    sub: "You're invited.",
    options: [
      { label: "The victory feast", emoji: "🏮", tags: ["fantasy", "cozy"] },
      { label: "The quiet proposal", emoji: "💍", tags: ["heart", "literary"] },
      { label: "The team's first success", emoji: "🎊", tags: ["scifi", "thinker"] },
      { label: "The case-solved party", emoji: "🕺", tags: ["sleuth", "mystery"] },
    ],
  },
  {
    question: "What does “a great read” mean to you?",
    sub: "Define the magic.",
    options: [
      { label: "I couldn't stop thinking about it", emoji: "💭", tags: ["thinker", "literary"] },
      { label: "I stayed up till 3am", emoji: "🌙", tags: ["sleuth", "fantasy"] },
      { label: "I told everyone about it", emoji: "📣", tags: ["heart", "cozy"] },
      { label: "I immediately reread it", emoji: "🔁", tags: ["escapist", "mystery"] },
    ],
  },
  {
    question: "Which narrator do you trust?",
    sub: "Reader discretion advised.",
    options: [
      { label: "The honest one", emoji: "😇", tags: ["cozy", "heart"] },
      { label: "The detective", emoji: "🕵️", tags: ["sleuth", "mystery"] },
      { label: "The omniscient one", emoji: "👁️", tags: ["literary", "thinker"] },
      { label: "The one I'm suspicious of", emoji: "🤨", tags: ["scifi", "fantasy"] },
    ],
  },
  {
    question: "Choose your literary landmark.",
    sub: "A reader's pilgrimage.",
    options: [
      { label: "A library with secret rooms", emoji: "🚪", tags: ["fantasy", "sleuth"] },
      { label: "A lighthouse at the world's edge", emoji: "💡", tags: ["literary", "heart"] },
      { label: "A Martian colony", emoji: "🔴", tags: ["scifi", "thinker"] },
      { label: "A village bookshop", emoji: "🏪", tags: ["cozy", "mystery"] },
    ],
  },
  {
    question: "Your perfect bookish holiday?",
    sub: "Plan the getaway.",
    options: [
      { label: "A cabin with no signal", emoji: "🛖", tags: ["literary", "heart"] },
      { label: "A book festival", emoji: "🎪", tags: ["sleuth", "scifi"] },
      { label: "A fantasy-themed park", emoji: "🎢", tags: ["fantasy", "escapist"] },
      { label: "A city of bookshops", emoji: "🏙️", tags: ["thinker", "cozy"] },
    ],
  },
  {
    question: "What's your bedtime story style?",
    sub: "The last page of the day.",
    options: [
      { label: "Something gentle", emoji: "🌜", tags: ["cozy", "heart"] },
      { label: "Something thrilling", emoji: "😨", tags: ["mystery", "sleuth"] },
      { label: "Something strange", emoji: "🌫️", tags: ["scifi", "literary"] },
      { label: "A saga I'll never finish", emoji: "♾️", tags: ["fantasy", "escapist"] },
    ],
  },
  {
    question: "Which reading milestone matters most?",
    sub: "Reader achievements.",
    options: [
      { label: "Finishing a giant classic", emoji: "🗿", tags: ["literary", "thinker"] },
      { label: "A 50-book year", emoji: "🏅", tags: ["sleuth", "escapist"] },
      { label: "Getting a kid hooked on reading", emoji: "🧒", tags: ["heart", "cozy"] },
      { label: "Reading in another language", emoji: "🌐", tags: ["scifi", "fantasy"] },
    ],
  },
  {
    question: "Pick a bookish aesthetic.",
    sub: "Which vibe is yours?",
    options: [
      { label: "Cozy cottagecore", emoji: "🍄", tags: ["cozy", "heart"] },
      { label: "Dark academia", emoji: "🕯️", tags: ["thinker", "mystery"] },
      { label: "Space-age retro", emoji: "🪐", tags: ["scifi", "escapist"] },
      { label: "Fantasy tavern", emoji: "🍺", tags: ["fantasy", "sleuth"] },
    ],
  },
  {
    question: "What's the best book you've been handed by a friend?",
    sub: "The friend-gifted special.",
    options: [
      { label: "One that changed my mind", emoji: "🧠", tags: ["thinker", "literary"] },
      { label: "One that made me laugh", emoji: "😂", tags: ["cozy", "heart"] },
      { label: "One I finished in a day", emoji: "⚡", tags: ["sleuth", "fantasy"] },
      { label: "One I still think about", emoji: "🌌", tags: ["escapist", "mystery"] },
    ],
  },
  {
    question: "Your ideal reading weather?",
    sub: "Weather matters to readers.",
    options: [
      { label: "Storm outside, book inside", emoji: "⛈️", tags: ["cozy", "literary"] },
      { label: "Cool autumn morning", emoji: "🍂", tags: ["heart", "thinker"] },
      { label: "Warm summer night", emoji: "🌙", tags: ["escapist", "fantasy"] },
      { label: "Rainy spring afternoon", emoji: "🌦️", tags: ["sleuth", "mystery"] },
    ],
  },
  {
    question: "Which character arc do you love?",
    sub: "The growth question.",
    options: [
      { label: "The coward who becomes brave", emoji: "🦁", tags: ["fantasy", "heart"] },
      { label: "The cynic who learns to trust", emoji: "🌱", tags: ["literary", "cozy"] },
      { label: "The brilliant one who fails and grows", emoji: "📉", tags: ["thinker", "scifi"] },
      { label: "The one who finally sees the truth", emoji: "🔦", tags: ["sleuth", "mystery"] },
    ],
  },
  {
    question: "Pick a book title style.",
    sub: "Titles are art.",
    options: [
      { label: "“The ___ of ___” epic titles", emoji: "🏰", tags: ["fantasy", "escapist"] },
      { label: "Short and sharp", emoji: "🗡️", tags: ["sleuth", "mystery"] },
      { label: "A quote from the book", emoji: "❝", tags: ["literary", "heart"] },
      { label: "A single evocative word", emoji: "🪶", tags: ["thinker", "scifi"] },
      { label: "Cute and cozy", emoji: "🐻", tags: ["cozy"] },
    ],
  },
  {
    question: "What do you do at the end of a great series?",
    sub: "The series goodbye.",
    options: [
      { label: "Reread the first book", emoji: "🔁", tags: ["fantasy", "heart"] },
      { label: "Mourn and move on", emoji: "🕯️", tags: ["literary", "mystery"] },
      { label: "Find the author's next work", emoji: "🔎", tags: ["sleuth", "scifi"] },
      { label: "Celebrate with a comfort reread", emoji: "🎉", tags: ["cozy", "escapist"] },
    ],
  },
  {
    question: "Which fictional map do you want?",
    sub: "The map question.",
    options: [
      { label: "A fantasy world map", emoji: "🗺️", tags: ["fantasy", "escapist"] },
      { label: "A city of secrets", emoji: "🏙️", tags: ["mystery", "sleuth"] },
      { label: "A star chart", emoji: "✨", tags: ["scifi", "thinker"] },
      { label: "A sleepy town with a bakery", emoji: "🥐", tags: ["cozy", "heart"] },
    ],
  },
  {
    question: "Your signature reading position?",
    sub: "Ergonomics, reader edition.",
    options: [
      { label: "Flat on my back", emoji: "😌", tags: ["cozy", "literary"] },
      { label: "Cross-legged in a chair", emoji: "🧘", tags: ["thinker", "sleuth"] },
      { label: "Curled like a cat", emoji: "🐈", tags: ["heart", "fantasy"] },
      { label: "Walking and reading", emoji: "🚶", tags: ["escapist", "scifi"] },
    ],
  },
  {
    question: "Which book would you bring to a desert island?",
    sub: "The ultimate test.",
    options: [
      { label: "One that makes me laugh", emoji: "😂", tags: ["cozy", "heart"] },
      { label: "One with a hundred lives in it", emoji: "♾️", tags: ["fantasy", "escapist"] },
      { label: "One that explains everything", emoji: "📖", tags: ["thinker", "scifi"] },
      { label: "One with a mystery to solve", emoji: "🔍", tags: ["sleuth", "mystery"] },
      { label: "One of impossible beauty", emoji: "🌺", tags: ["literary"] },
    ],
  },
  {
    question: "Your reading resolution this year?",
    sub: "New year, new pages.",
    options: [
      { label: "Read more than last year", emoji: "📈", tags: ["sleuth", "thinker"] },
      { label: "Finish a giant series", emoji: "⚔️", tags: ["fantasy", "escapist"] },
      { label: "Try a new genre", emoji: "🆕", tags: ["scifi", "heart"] },
      { label: "Read slower and savor", emoji: "🍰", tags: ["literary", "cozy"] },
    ],
  },
  {
    question: "What's your favorite kind of surprise in a book?",
    sub: "The good kind of surprise.",
    options: [
      { label: "A plot twist", emoji: "🌀", tags: ["sleuth", "mystery"] },
      { label: "A tiny moment that breaks me", emoji: "💔", tags: ["heart", "literary"] },
      { label: "A new piece of world", emoji: "🌋", tags: ["fantasy", "escapist"] },
      { label: "An idea I've never met", emoji: "🪄", tags: ["thinker", "scifi"] },
      { label: "An extra cozy scene", emoji: "🫖", tags: ["cozy"] },
    ],
  },
  {
    question: "Which bookish debate would you win?",
    sub: "Choose your battle.",
    options: [
      { label: "“Series or standalone?”", emoji: "⚔️", tags: ["sleuth", "fantasy"] },
      { label: "“Which format is best?”", emoji: "📱", tags: ["thinker", "scifi"] },
      { label: "“Which ending is correct?”", emoji: "🏳️", tags: ["heart", "literary"] },
      { label: "“How fast should you read?”", emoji: "🏎️", tags: ["escapist", "cozy"] },
      { label: "“Are book clubs worth it?”", emoji: "👥", tags: ["mystery", "heart"] },
    ],
  },
  {
    question: "Why do you read?",
    sub: "The last and most important question.",
    options: [
      { label: "To feel things", emoji: "💗", tags: ["heart", "literary"] },
      { label: "To escape", emoji: "🦋", tags: ["fantasy", "escapist"] },
      { label: "To solve things", emoji: "🔎", tags: ["sleuth", "mystery"] },
      { label: "To understand things", emoji: "🌐", tags: ["thinker", "scifi"] },
      { label: "To feel at home", emoji: "🏠", tags: ["cozy"] },
    ],
  },
]

export function pickQuizQuestions(count = 5): QuizQuestion[] {
  const pool = [...QUIZ_QUESTIONS]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, count)
}

// The Book DNA personality now lives in personalityMapper.ts — it is derived
// from the reader's hidden Reader Genome, not scored directly from quiz tags.
// Re-exported here so existing imports keep working.
export { ARCHETYPES, ARCHETYPE_ORDER, scoreQuiz, type Archetype } from "./personalityMapper"
