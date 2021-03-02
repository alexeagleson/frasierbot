import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Message } from "discord.js";
import { prismaConnection } from "./prisma";
import { ARG_1, ARG_2, ARG_3 } from "./types";

type MessageProcessor = (arg: ARG_3, message: Message) => Promise<void>;

const createError = (e: unknown, message: Message) => {
  if (e instanceof PrismaClientKnownRequestError) {
    if (e.message.includes("unique")) {
      return message.reply(`I already know that one.`);
    }
  }
  return message.reply(`I'm listening... but I don't understand.`);
};

const deleteError = (e: unknown, message: Message) => {
  if (e instanceof PrismaClientKnownRequestError) {
    if (e.message.includes("not found")) {
      return message.reply(`I can't forget something I don't know.`);
    }
  }
  return message.reply(`I'm listening... but I don't understand.`);
};

export const DECISION_TREE: Record<ARG_1, Record<ARG_2, MessageProcessor>> = {
  learn: {
    noun: async (arg, message) => {
      try {
        await prismaConnection.nouns.create({
          data: { content: arg },
        });
        message.channel.send(`My lexicon is growing, I've learned ${arg}.`);
      } catch (e) {
        createError(e, message);
      }
    },
    verb: async (arg, message) => {
      try {
        await prismaConnection.verbs.create({
          data: { content: arg },
        });
        message.channel.send(`My lexicon is growing, I've learned ${arg}.`);
      } catch (e) {
        createError(e, message);
      }
    },
    character: async (arg, message) => {
      try {
        await prismaConnection.characters.create({
          data: { content: arg },
        });
        message.channel.send(`My lexicon is growing, I've learned ${arg}.`);
      } catch (e) {
        createError(e, message);
      }
    },
    adjective: async (arg, message) => {
      try {
        await prismaConnection.adjectives.create({
          data: { content: arg },
        });
        message.channel.send(`My lexicon is growing, I've learned ${arg}`);
      } catch (e) {
        createError(e, message);
      }
    },
    adverb: async (arg, message) => {
      try {
        await prismaConnection.adverbs.create({
          data: { content: arg },
        });
        message.channel.send(`My lexicon is growing, I've learned ${arg}.`);
      } catch (e) {
        createError(e, message);
      }
    },
  },
  forget: {
    noun: async (arg, message) => {
      try {
        await prismaConnection.nouns.delete({
          where: { content: arg },
        });
        message.channel.send(`${arg} forgotten`);
      } catch (e) {
        deleteError(e, message);
      }
    },
    verb: async (arg, message) => {
      try {
        await prismaConnection.verbs.delete({
          where: { content: arg },
        });
        message.channel.send(`${arg} forgotten`);
      } catch (e) {
        deleteError(e, message);
      }
    },
    character: async (arg, message) => {
      try {
        await prismaConnection.characters.delete({
          where: { content: arg },
        });
        message.channel.send(`${arg} forgotten`);
      } catch (e) {
        deleteError(e, message);
      }
    },
    adjective: async (arg, message) => {
      try {
        await prismaConnection.adjectives.delete({
          where: { content: arg },
        });
        message.channel.send(`${arg} forgotten`);
      } catch (e) {
        deleteError(e, message);
      }
    },
    adverb: async (arg, message) => {
      try {
        await prismaConnection.adverbs.delete({
          where: { content: arg },
        });
        message.channel.send(`${arg} forgotten`);
      } catch (e) {
        deleteError(e, message);
      }
    },
  },
  list: {
    noun: async (arg, message) => {
      const results = await prismaConnection.nouns.findMany();
      if (results.length === 0) {
        message.channel.send(`Dear god!  I don't know any`);
      } else {
        message.channel.send(
          results.map((result) => result.content).join(", ")
        );
      }
    },
    verb: async (arg, message) => {
      const results = await prismaConnection.verbs.findMany();
      if (results.length === 0) {
        message.channel.send(`Dear god!  I don't know any`);
      } else {
        message.channel.send(
          results.map((result) => result.content).join(", ")
        );
      }
    },
    character: async (arg, message) => {
      const results = await prismaConnection.characters.findMany();
      if (results.length === 0) {
        message.channel.send(`Dear god!  I don't know any`);
      } else {
        message.channel.send(
          results.map((result) => result.content).join(", ")
        );
      }
    },
    adjective: async (arg, message) => {
      const results = await prismaConnection.adjectives.findMany();
      if (results.length === 0) {
        message.channel.send(`Dear god!  I don't know any`);
      } else {
        message.channel.send(
          results.map((result) => result.content).join(", ")
        );
      }
    },
    adverb: async (arg, message) => {
      const results = await prismaConnection.adverbs.findMany();
      if (results.length === 0) {
        message.channel.send(`Dear god!  I don't know any`);
      } else {
        message.channel.send(
          results.map((result) => result.content).join(", ")
        );
      }
    },
  },
};
