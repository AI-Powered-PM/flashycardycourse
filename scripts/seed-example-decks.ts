import { db } from "../src/db";
import { cardsTable, decksTable } from "../src/db/schema";

const USER_ID = "user_3BXRoKSpx2i0STrxQx0sm0Ldjn0";

const SPANISH_CARDS: { front: string; back: string }[] = [
  { front: "Hello", back: "Hola" },
  { front: "Goodbye", back: "Adiós" },
  { front: "Please", back: "Por favor" },
  { front: "Thank you", back: "Gracias" },
  { front: "Yes", back: "Sí" },
  { front: "No", back: "No" },
  { front: "Water", back: "Agua" },
  { front: "Food", back: "Comida" },
  { front: "House", back: "Casa" },
  { front: "Friend (male)", back: "Amigo" },
  { front: "Good morning", back: "Buenos días" },
  { front: "Good night", back: "Buenas noches" },
  { front: "I don't understand", back: "No entiendo" },
  { front: "How are you?", back: "¿Cómo estás?" },
  { front: "My name is …", back: "Me llamo …" },
];

const BRITISH_HISTORY_CARDS: { front: string; back: string }[] = [
  {
    front: "In what year did William the Conqueror win the Battle of Hastings?",
    back: "1066",
  },
  {
    front: "Who was the first Tudor monarch of England?",
    back: "Henry VII",
  },
  {
    front: "Which English king was forced to seal Magna Carta in 1215?",
    back: "King John",
  },
  {
    front: "In what year did the Great Fire of London occur?",
    back: "1666",
  },
  {
    front: "Who was Prime Minister of the United Kingdom for most of World War II?",
    back: "Winston Churchill",
  },
  {
    front: "Which royal house ruled England immediately before the Tudors?",
    back: "The Plantagenets",
  },
  {
    front: "Who was Henry VIII's first wife?",
    back: "Catherine of Aragon",
  },
  {
    front: "At which battle was Richard III killed in 1485?",
    back: "Battle of Bosworth Field",
  },
  {
    front: "Which English monarch is often called the Virgin Queen?",
    back: "Elizabeth I",
  },
  {
    front: "In what year did the Acts of Union create the Kingdom of Great Britain?",
    back: "1707",
  },
  {
    front: "Which Stuart king was executed in 1649?",
    back: "Charles I",
  },
  {
    front: "What is the common name for the republican period when Oliver Cromwell ruled?",
    back: "The Protectorate (also called the Commonwealth)",
  },
  {
    front: "Who became king of the United Kingdom after Edward VIII abdicated?",
    back: "George VI",
  },
  {
    front:
      "In what year did the Representation of the People Act give women the vote on the same terms as men?",
    back: "1928",
  },
  {
    front: "In which battle was Napoleon decisively defeated in 1815?",
    back: "Battle of Waterloo",
  },
];

async function main() {
  const [spanishDeck] = await db
    .insert(decksTable)
    .values({
      userId: USER_ID,
      title: "English → Spanish vocabulary",
      description: "Common English words and phrases with Spanish translations.",
    })
    .returning();

  if (!spanishDeck) throw new Error("Failed to insert Spanish deck");

  await db.insert(cardsTable).values(
    SPANISH_CARDS.map((c) => ({
      deckId: spanishDeck.id,
      front: c.front,
      back: c.back,
    })),
  );

  const [historyDeck] = await db
    .insert(decksTable)
    .values({
      userId: USER_ID,
      title: "British history Q&A",
      description: "Key people, dates, and events from British history.",
    })
    .returning();

  if (!historyDeck) throw new Error("Failed to insert history deck");

  await db.insert(cardsTable).values(
    BRITISH_HISTORY_CARDS.map((c) => ({
      deckId: historyDeck.id,
      front: c.front,
      back: c.back,
    })),
  );

  console.log(
    `Inserted decks ${spanishDeck.id} (Spanish, ${SPANISH_CARDS.length} cards) and ${historyDeck.id} (British history, ${BRITISH_HISTORY_CARDS.length} cards) for user ${USER_ID}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
