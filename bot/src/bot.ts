import nlp from "compromise";
import Discord from "discord.js";
import { HELP_MESSAGE } from "./constants";
import { DECISION_TREE } from "./decision-tree";
import { closeEnough } from "./levenshtein";
import { prismaConnection } from "./prisma";
import { ARG_0, ARG_1, ARG_1_OPTS, ARG_2, ARG_2_OPTS, ARG_3 } from "./types";
import { pickRandom } from "./utility";

// Login to Discord
if (!process.env.BOT_TOKEN) throw Error("Need to set BOT_TOKEN in .env");
const client = new Discord.Client();
client.login(process.env.BOT_TOKEN);

/** Transforms to uppercase and removes quotation marks */
const clean = <T extends string>(arg: string | undefined) => {
  // return arg?.toLowerCase()?.replace(/"/g, "") as T; // Used to replace double quotes
  return arg?.toLowerCase()?.trim() as T;
};

const BOT_TEST_CHANNEL_ID = "814725540426416129";
const TOSSED_SALADS_CHANNEL_ID = "814624969051865138";

const activeChannels =
  process.env.NODE_ENV === "production"
    ? [BOT_TEST_CHANNEL_ID, TOSSED_SALADS_CHANNEL_ID]
    : [BOT_TEST_CHANNEL_ID];

const SpacesExcludingDoubleQuotes = /(?:[^\s"]+|"[^"]*")+/g;
const TextBetweenCurlyBraces = /\{(.*?)\}/;
const CurlyBraces = /\{|\}/g;

const shorthandTransform = (arg: string): string => {
  if (arg === "n") {
    return "noun";
  } else if (arg === "np") {
    return "noun_plural";
  } else if (arg === "adj") {
    return "adjective";
  } else if (arg === "ad") {
    return "adjective";
  } else if (arg === "a") {
    return "adjective";
  } else if (arg === "adv") {
    return "adverb";
  } else if (arg === "v") {
    return "verb";
  } else if (arg === "vi") {
    return "verb_infinitive";
  } else if (arg === "vg") {
    return "verb_gerund";
  } else if (arg === "vpr") {
    return "verb_present";
  } else if (arg === "vp") {
    return "verb_past";
  } else if (arg === "vpa") {
    return "verb_past";
  } else if (arg === "vf") {
    return "verb_future";
  } else if (arg === "c") {
    return "character";
  } else if (arg === "e") {
    return "exclamation";
  } else if (arg === "q") {
    return "quote";
  } else if (arg === "p") {
    return "place";
  }
  return arg;
};

// const italics = (arg: string) => `*${arg}*`;

client.on("message", async (message) => {
  // Bot does not respond to itself
  if (message.author.bot) return;
  const lowerCaseMessage = message.content.toLowerCase();

  if (
    /!f ignore/i.test(message.content) ||
    /!frasierbot ignore/i.test(message.content)
  )
    return;

  const isDM = message.channel.type === "dm";
  const isPermittedChannel = activeChannels.includes(message.channel.valueOf());

  // Bot only works in test channel and tossed-salads channel
  if (isDM || isPermittedChannel) {
    // const args = message.content.match(SpacesExcludingDoubleQuotes);
    const args = message.content.split(" ");

    const arg0 = clean<ARG_0>(args?.shift());
    const arg1 = clean<ARG_1 | "help">(args?.shift());
    const arg2 = shorthandTransform(clean(args?.shift())) as ARG_2;
    const arg3 = args?.join(" ");

    const errorMessage = (arg: string) =>
      `I'm listening... but I don't understand **${arg}**.  Type **!FRASIERBOT HELP** if I can be of further assistance.  This is Dr. Frasier Crane wishing you good mental health.`;

    if (TextBetweenCurlyBraces.test(message.content)) {
      const story = message.content
        .replace("!frasierbot", "")
        .replace("!f", "")
        .replace("f!", "");

      const nouns = await prismaConnection.nouns.findMany();
      const verbs = await prismaConnection.verbs.findMany();
      const adverbs = await prismaConnection.adverbs.findMany();
      const adjectives = await prismaConnection.adjectives.findMany();
      const characters = await prismaConnection.characters.findMany();
      const exclamations = await prismaConnection.exclamations.findMany();
      const quotes = await prismaConnection.quotes.findMany();
      const places = await prismaConnection.places.findMany();

      // Delete the user's message presuming it contains terms between curlies {} implying it wants the bot to reply
      if (!isDM && process.env.DELETE_MESSAGES?.toUpperCase() === "Y") {
        message.delete();
      }

      const memory: Record<string, string> = {};

      return message.channel.send(
        // italics(
        story
          .split(TextBetweenCurlyBraces)
          .map((word) => {
            // Match anything between curcly braces
            // if (TextBetweenCurlyBraces.test(word)) {
            // const wordNoCurlies = word.replace(CurlyBraces, "");
            const cleanWord = clean(word);

            if (
              closeEnough("noun", cleanWord) ||
              cleanWord === "n" ||
              /(n|noun)[0-9]/i.test(cleanWord)
            ) {
              let noun = pickRandom(nouns)?.content;
              if (/(n|noun)[0-9]/i.test(cleanWord)) {
                noun = memory[cleanWord.replace("noun", "n")] ?? noun;
                memory[cleanWord] = noun;
              }
              return noun;
            } else if (
              closeEnough("noun_plural", cleanWord) ||
              cleanWord === "np"
            ) {
              let noun = pickRandom(nouns)?.content;
              const doc = nlp(noun);
              doc.nouns().toPlural();
              const transformedNoun = doc.text();
              return noun === transformedNoun && !transformedNoun.endsWith("s")
                ? `${noun}s`
                : transformedNoun;
            } else if (
              closeEnough("adjective", cleanWord) ||
              cleanWord === "adj" ||
              cleanWord === "ad" ||
              cleanWord === "a"
            ) {
              return pickRandom(adjectives)?.content;
            } else if (
              closeEnough("adverb", cleanWord) ||
              cleanWord === "adv"
            ) {
              return pickRandom(adverbs)?.content;
            } else if (closeEnough("verb", cleanWord) || cleanWord === "v") {
              return pickRandom(verbs)?.content;
            } else if (
              closeEnough("verb_infinitive", cleanWord) ||
              cleanWord === "vi"
            ) {
              const verb = pickRandom(verbs)?.content;
              const doc = nlp(verb);
              doc.verbs().toInfinitive();
              const transformedVerb = doc.text();
              return transformedVerb;
            } else if (
              closeEnough("verb_gerund", cleanWord) ||
              cleanWord === "vg"
            ) {
              const verb = pickRandom(verbs)?.content;
              const doc = nlp(verb);
              doc.verbs().toGerund();
              const transformedVerb = doc.text();
              return verb === transformedVerb &&
                !transformedVerb.endsWith("ing")
                ? `${verb}ing`
                : transformedVerb;
            } else if (
              closeEnough("verb_present", cleanWord) ||
              cleanWord === "vpr" ||
              cleanWord === "vp"
            ) {
              const verb = pickRandom(verbs)?.content;
              const doc = nlp(verb);
              doc.verbs().toPresentTense();
              const transformedVerb = doc.text();
              return verb === transformedVerb && !transformedVerb.endsWith("s")
                ? `${verb}s`
                : transformedVerb;
            } else if (
              closeEnough("verb_past", cleanWord) ||
              cleanWord === "vpa"
            ) {
              const verb = pickRandom(verbs)?.content;
              const doc = nlp(verb);
              doc.verbs().toPastTense();
              const transformedVerb = doc.text();
              return verb === transformedVerb && !transformedVerb.endsWith("d")
                ? `${verb}'d`
                : transformedVerb;
            } else if (
              closeEnough("verb_future", cleanWord) ||
              cleanWord === "vf"
            ) {
              const verb = pickRandom(verbs)?.content;
              const doc = nlp(verb);
              doc.verbs().toFutureTense();
              const transformedVerb = doc.text();
              return verb === transformedVerb
                ? `will ${verb}`
                : transformedVerb;
            } else if (
              closeEnough("character", cleanWord) ||
              cleanWord === "c" ||
              /(c|character)[0-9]/i.test(cleanWord)
            ) {
              let character = pickRandom(characters)?.content;
              if (/(c|character)[0-9]/i.test(cleanWord)) {
                character = memory[cleanWord.replace("character", "c")] ?? character;
                memory[cleanWord] = character;
              }

              const doc = nlp(character);
              doc.all().toTitleCase();
              return doc.text();
            } else if (
              closeEnough("exclamation", cleanWord) ||
              cleanWord === "e" ||
              /(e|exclamation)[0-9]/i.test(cleanWord)
            ) {
              let exclamation = pickRandom(exclamations)?.content;
              if (/(e|exclamation)[0-9]/i.test(cleanWord)) {
                exclamation = memory[cleanWord.replace("exclamation", "e")] ?? exclamation;
                memory[cleanWord] = exclamation;
              }
              return exclamation;
            } else if (closeEnough("quote", cleanWord) || cleanWord === "q") {
              const quote = pickRandom(quotes)?.content;
              return quote;
            } else if (
              closeEnough("place", cleanWord) ||
              cleanWord === "p" ||
              /(p|place)[0-9]/i.test(cleanWord)
            ) {
              let place = pickRandom(places)?.content;
              if (/(p|place)[0-9]/i.test(cleanWord)) {
                place = memory[cleanWord.replace("place", "p")] ?? place;
                memory[cleanWord] = place;
              }
              return place;
            }
            // }
            return word;
          })
          .join("")
        // )
      );
    } else if (arg0 === "!frasierbot" || arg0 === "!f" || arg0 === "f!") {
      if (arg1 === "help" || !arg1) {
        return message.channel.send(HELP_MESSAGE);
      }

      if (!ARG_1_OPTS.includes(arg1)) return message.reply(errorMessage(arg1));
      if (!ARG_2_OPTS.includes(arg2)) return message.reply(errorMessage(arg2));

      const splitTerms = arg3.split(/&&/);

      splitTerms.forEach((term) => {
        DECISION_TREE[arg1][arg2](term.trim(), message);
      });
    }
  }
});

console.log("connected");
