import nlp from "compromise";
import Discord from "discord.js";
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
  return arg?.toLowerCase()?.replace(/"/g, "") as T;
};

const BOT_TEST_CHANNEL_ID = "814725540426416129";
const TOSSED_SALADS_CHANNEL_ID = "814624969051865138";

const SpacesExcludingDoubleQuotes = /(?:[^\s"]+|"[^"]*")+/g;
const TextBetweenCurlyBraces = /\{(.*?)\}/;
const CurlyBraces = /\{|\}/g;

client.on("message", async (message) => {
  // Bot does not respond to itself
  if (message.author.bot) return;

  // Bot only works in test channel and tossed-salads channel
  if (
    ![BOT_TEST_CHANNEL_ID, TOSSED_SALADS_CHANNEL_ID].includes(
      message.channel.valueOf()
    )
  )
    return;

  const args = message.content.match(SpacesExcludingDoubleQuotes);

  const arg0 = clean<ARG_0>(args?.[0]);
  const arg1 = clean<ARG_1 | "help">(args?.[1]);
  const arg2 = clean<ARG_2>(args?.[2]);
  const arg3 = clean<ARG_3>(args?.[3]);

  const errorMessage = (arg: string) =>
    `I'm listening... but I don't understand **${arg}**.  Type **!FRASIERBOT HELP** if I can be of further assistance.  This is Dr. Frasier Crane wishing you good mental health.`;

  if (arg0 === "!frasierbot" || arg0 === "!f") {
    if (arg1 === "help" || !arg1) {
      return message.channel.send(HELP_MESSAGE);
    }

    if (!ARG_1_OPTS.includes(arg1)) return message.reply(errorMessage(arg1));
    if (!ARG_2_OPTS.includes(arg2)) return message.reply(errorMessage(arg2));

    DECISION_TREE[arg1][arg2](arg3, message);
  } else if (TextBetweenCurlyBraces.test(message.content)) {
    const story = message.content.replace("!frasierbot", "").replace("!f", "");
    const nouns = await prismaConnection.nouns.findMany();
    const verbs = await prismaConnection.verbs.findMany();
    const adverbs = await prismaConnection.adverbs.findMany();
    const adjectives = await prismaConnection.adjectives.findMany();
    const characters = await prismaConnection.characters.findMany();

    // Delete the user's message presuming it contains terms between curlies {} implying it wants the bot to reply
    message.delete();

    return message.channel.send(
      story
        .split(" ")
        .map((word) => {
          // Match anything between curcly braces
          if (TextBetweenCurlyBraces.test(word)) {
            const wordNoCurlies = word.replace(CurlyBraces, "");

            if (closeEnough("noun", clean(wordNoCurlies))) {
              return pickRandom(nouns)?.content;
            }

            if (closeEnough("noun_plural", clean(wordNoCurlies))) {
              const noun = pickRandom(nouns)?.content;
              const doc = nlp(noun);
              doc.nouns().toPlural();
              return doc.text();
            }

            if (closeEnough("verb", clean(wordNoCurlies))) {
              return pickRandom(verbs)?.content;
            }

            if (closeEnough("adjective", clean(wordNoCurlies))) {
              return pickRandom(adjectives)?.content;
            }

            if (closeEnough("adverb", clean(wordNoCurlies))) {
              return pickRandom(adverbs)?.content;
            }

            if (closeEnough("verb_past", clean(wordNoCurlies))) {
              const verb = pickRandom(verbs)?.content;
              const doc = nlp(verb);
              doc.verbs().toPastTense();
              return doc.text();
            }

            if (closeEnough("verb_future", clean(wordNoCurlies))) {
              const verb = pickRandom(verbs)?.content;
              const doc = nlp(verb);
              doc.verbs().toFutureTense();
              return doc.text();
            }

            if (closeEnough("character", clean(wordNoCurlies))) {
              const character = pickRandom(characters)?.content;
              const doc = nlp(character);
              doc.all().toTitleCase();
              return doc.text();
            }
          }
          return word;
        })
        .join(" ")
    );
  }
});

console.log("connected");
