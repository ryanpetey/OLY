import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const prompts = [
  { text: "What small moment made you feel most alive this week?", category: "Presence", intimacyLevel: 22 },
  { text: "What is one thing you're quietly proud of lately?", category: "Growth", intimacyLevel: 28 },
  { text: "Which memory has been replaying in your mind recently?", category: "Memory", intimacyLevel: 35 },
  { text: "What do you wish people understood about your current season?", category: "Life", intimacyLevel: 44 },
  { text: "When did you last feel deeply understood?", category: "Connection", intimacyLevel: 57 },
  { text: "What habit has been grounding you lately?", category: "Wellbeing", intimacyLevel: 20 },
  { text: "What has felt heavier than expected this month?", category: "Life", intimacyLevel: 51 },
  { text: "What is a fear you're learning to befriend?", category: "Courage", intimacyLevel: 73 },
  { text: "What place feels like emotional home to you?", category: "Identity", intimacyLevel: 40 },
  { text: "How do you know when your body needs rest?", category: "Wellbeing", intimacyLevel: 31 },
  { text: "What's a belief you have outgrown in the past year?", category: "Growth", intimacyLevel: 62 },
  { text: "What is something ordinary that brings you comfort?", category: "Presence", intimacyLevel: 18 },
  { text: "What part of your story feels hard to explain?", category: "Identity", intimacyLevel: 76 },
  { text: "Who helped shape your idea of love?", category: "Relationships", intimacyLevel: 67 },
  { text: "What conversation are you avoiding, and why?", category: "Courage", intimacyLevel: 81 },
  { text: "What does friendship look like when it's healthy for you?", category: "Relationships", intimacyLevel: 54 },
  { text: "What has surprised you about yourself recently?", category: "Growth", intimacyLevel: 37 },
  { text: "Which goodbye still echoes for you?", category: "Memory", intimacyLevel: 79 },
  { text: "How do you usually react when you're overwhelmed?", category: "Wellbeing", intimacyLevel: 48 },
  { text: "What is a dream you've been too shy to say out loud?", category: "Future", intimacyLevel: 70 },
  { text: "Where in life are you craving simplicity?", category: "Life", intimacyLevel: 33 },
  { text: "What song has felt like a mirror lately?", category: "Presence", intimacyLevel: 26 },
  { text: "What part of adulthood still feels strange to you?", category: "Identity", intimacyLevel: 42 },
  { text: "What does being cared for look like to you right now?", category: "Connection", intimacyLevel: 60 },
  { text: "When do you feel most like yourself?", category: "Identity", intimacyLevel: 39 },
  { text: "What boundary has protected your peace recently?", category: "Wellbeing", intimacyLevel: 52 },
  { text: "What was a turning point in your life that others might have missed?", category: "Memory", intimacyLevel: 75 },
  { text: "What are you currently grieving, even in a small way?", category: "Life", intimacyLevel: 85 },
  { text: "What is something you're still learning to forgive in yourself?", category: "Growth", intimacyLevel: 88 },
  { text: "What role do you often play in groups, and do you like it?", category: "Relationships", intimacyLevel: 58 },
  { text: "What does success feel like in your body, not on paper?", category: "Future", intimacyLevel: 47 },
  { text: "What question do you wish people asked you more often?", category: "Connection", intimacyLevel: 50 },
  { text: "What memory instantly softens you?", category: "Memory", intimacyLevel: 36 },
  { text: "What are you pretending doesn't matter to you?", category: "Courage", intimacyLevel: 83 },
  { text: "What relationship taught you the most about trust?", category: "Relationships", intimacyLevel: 72 },
  { text: "What gives you hope when you're tired?", category: "Presence", intimacyLevel: 41 },
  { text: "How has your definition of home changed over time?", category: "Identity", intimacyLevel: 63 },
  { text: "What is one thing you need to hear this week?", category: "Connection", intimacyLevel: 46 },
  { text: "Where are you being invited to grow up right now?", category: "Growth", intimacyLevel: 66 },
  { text: "What story about yourself are you ready to retire?", category: "Growth", intimacyLevel: 78 },
  { text: "When did you last feel deeply lonely, and what helped?", category: "Connection", intimacyLevel: 87 },
  { text: "What does joy look like in your current season?", category: "Presence", intimacyLevel: 25 },
  { text: "What kind of support is hardest for you to ask for?", category: "Relationships", intimacyLevel: 68 },
  { text: "What are you carrying that isn't yours?", category: "Courage", intimacyLevel: 91 },
  { text: "What would a gentler week look like for you?", category: "Wellbeing", intimacyLevel: 30 },
  { text: "What are you currently choosing to trust?", category: "Future", intimacyLevel: 55 },
  { text: "What dream feels both exciting and terrifying?", category: "Future", intimacyLevel: 74 },
  { text: "What do you miss about a younger version of yourself?", category: "Memory", intimacyLevel: 64 },
  { text: "What is one truth you've been slow to accept?", category: "Life", intimacyLevel: 82 },
  { text: "What do you want your close friends to remember about this chapter?", category: "Connection", intimacyLevel: 69 }
];

async function main() {
  await prisma.prompt.createMany({
    data: prompts
  });

  console.log(`Seeded ${prompts.length} prompts`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
