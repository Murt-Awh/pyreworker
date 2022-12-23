/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";
import {
  PerspectiveResponseData,
  PerspectiveResponse,
  PerspectiveAttribute,
} from "../typings/perspective";

export const perspectiveAttributes = [
  "SEVERE_TOXICITY",
  "IDENTITY_ATTACK",
  "TOXICITY",
  "INSULT",
  "PROFANITY",
  "THREAT",
  "SEXUALLY_EXPLICIT",
  "FLIRTATION",
  "ATTACK_ON_AUTHOR",
  "ATTACK_ON_COMMENTER",
  "INCOHERENT",
  "INFLAMMATORY",
  "LIKELY_TO_REJECT",
  "OBSCENE",
  "SPAM",
  "UNSUBSTANTIAL",
];

export const nytAttributes = [
  "ATTACK_ON_AUTHOR",
  "ATTACK_ON_COMMENTER",
  "INCOHERENT",
  "INFLAMMATORY",
  "LIKELY_TO_REJECT",
  "OBSCENE",
  "SPAM",
  "UNSUBSTANTIAL",
];

export const forcedAttributes = ["SEVERE_TOXICITY", "IDENTITY_ATTACK"];
export const nsfwAttributes = [
  "OBSCENE",
  "SEXUALLY_EXPLICIT",
  "PROFANITY",
  "FLIRTATION",
];

export interface AttributeScoreMapEntry {
  value: number;
  key: string;
}

export async function analyzeText(
  text: string,
  attributes?: PerspectiveAttribute[]
): Promise<PerspectiveResponseData> {
  if (!attributes) {
    attributes = ["PROFANITY", "SPAM", "SEVERE_TOXICITY", "INSULT", "THREAT"]; // DEFAULT ATTRIBUTES
  }
  const client = await google.discoverAPI(
    "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1"
  );
  const requestedAttributes = Object.fromEntries(
    attributes.map((attribute) => [attribute, {}])
  );
  const cleanedText = text
    .toLowerCase()
    .replaceAll(/\b(?:fuck(?:ing)?|shi+t)\b/g, "")
    .trim()
    .replaceAll("$", "s")
    .replaceAll("1", "l")
    .replaceAll("0", "o")
    .replaceAll("&", "and")
    .replaceAll("!", "i")
    .replaceAll("%", "t");

  const analyzeRequest = {
    comment: {
      text: cleanedText.length ? cleanedText : " ",
    },
    requestedAttributes,
    languages: ["en"],
  };

  const comments = client.comments as any;

  return new Promise((resolve, reject) => {
    comments.analyze(
      {
        key: process.env.perspectiveApi,
        resource: analyzeRequest,
      },
      (err: Error | undefined, response: PerspectiveResponse | undefined) => {
        if (err) {
          reject(err);
        }
        if (!response?.data) {
          return reject(response);
        }
        return resolve(response.data);
      }
    );
  });
}
