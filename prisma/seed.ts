import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const testCases = [
  {
    problemId: 1,
    testCases: [
      { input: "[3, 0, 1]", output: "2" },
      { input: "[0, 1]", output: "2" },
      { input: "[9,6,4,2,3,5,7,0,1]", output: "8" },
      { input: "[0]", output: "1" },
      { input: "[1]", output: "0" },
      { input: "[1,2,3,4,5,6,7,8,9,10]", output: "0" },
    ],
  },
  {
    problemId: 2,
    testCases: [
      { input: "['h','e','l','l','o']", output: "['o','l','l','e','h']" },
      {
        input: "['H','a','n','n','a','h']",
        output: "['h','a','n','n','a','H']",
      },
      { input: "['A']", output: "['A']" },
      { input: "['a','b']", output: "['b','a']" },
      { input: "['A','B','C','D','E']", output: "['E','D','C','B','A']" },
      {
        input: "['r','a','c','e','c','a','r']",
        output: "['r','a','c','e','c','a','r']",
      },
    ],
  },
  {
    problemId: 3,
    testCases: [
      { input: "()", output: "true" },
      { input: "()[]{}", output: "true" },
      { input: "(]", output: "false" },
      { input: "([)]", output: "false" },
      { input: "{[]}", output: "true" },
      { input: "(((", output: "false" },
    ],
  },
  {
    problemId: 4,
    testCases: [
      { input: "[1,2,3,1]", output: "2" },
      { input: "[1,2,1,3,5,6,4]", output: "5" },
      { input: "[1]", output: "0" },
      { input: "[1,2]", output: "1" },
      { input: "[2,1]", output: "0" },
      { input: "[1,2,3,4,5]", output: "4" },
    ],
  },
  {
    problemId: 5,
    testCases: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true" },
      { input: "head = [1,2], pos = 0", output: "true" },
      { input: "head = [1], pos = -1", output: "false" },
      { input: "head = [], pos = -1", output: "false" },
      { input: "head = [1,2,3,4,5], pos = 2", output: "true" },
      { input: "head = [1,2,3,4,5], pos = -1", output: "false" },
    ],
  },
  {
    problemId: 6,
    testCases: [
      { input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]" },
      { input: "nums = [-1,-100,3,99], k = 2", output: "[3,99,-1,-100]" },
      { input: "nums = [1,2], k = 1", output: "[2,1]" },
      { input: "nums = [1,2], k = 2", output: "[1,2]" },
      { input: "nums = [1,2,3,4,5], k = 0", output: "[1,2,3,4,5]" },
      { input: "nums = [1], k = 0", output: "[1]" },
    ],
  },
  {
    problemId: 7,
    testCases: [
      { input: "[-2,1,-3,4,-1,2,1,-5,4]", output: "6" },
      { input: "[1]", output: "1" },
      { input: "[5,4,-1,7,8]", output: "23" },
      { input: "[-1]", output: "-1" },
      { input: "[-2,-1]", output: "-1" },
      { input: "[1,2,3,4,5]", output: "15" },
    ],
  },
  {
    problemId: 8,
    testCases: [
      { input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "[1]", output: "[[1]]" },
      { input: "[]", output: "[]" },
      { input: "[1,2,3,4,5]", output: "[[1],[2,3],[4,5]]" },
      { input: "[1,2,3,4,null,null,5]", output: "[[1],[2,3],[4,5]]" },
      { input: "[1,2,null,3,null,4,null,5]", output: "[[1],[2],[3],[4],[5]]" },
    ],
  },
  {
    problemId: 9,
    testCases: [
      { input: "[1,2,3,4]", output: "[24,12,8,6]" },
      { input: "[-1,1,0,-3,3]", output: "[0,0,9,0,0]" },
      { input: "[2,3,4,5]", output: "[60,40,30,24]" },
      { input: "[1,1,1,1]", output: "[1,1,1,1]" },
      { input: "[0,0]", output: "[0,0]" },
      { input: "[1,0]", output: "[0,1]" },
    ],
  },
  {
    problemId: 10,
    testCases: [
      { input: "[100,4,200,1,3,2]", output: "4" },
      { input: "[0,3,7,2,5,8,4,6,0,1]", output: "9" },
      { input: "[]", output: "0" },
      { input: "[1]", output: "1" },
      { input: "[1,2,0,1]", output: "3" },
      { input: "[9,1,4,7,3,-1,0,5,8,-2,6,2]", output: "12" },
    ],
  },
  {
    problemId: 11,
    testCases: [
      {
        input: "[[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
      },
      { input: "[[1,4],[4,5]]", output: "[[1,5]]" },
      { input: "[[1,4],[0,4]]", output: "[[0,4]]" },
      { input: "[[1,4],[2,3]]", output: "[[1,4]]" },
      { input: "[[1,4],[0,2],[3,5]]", output: "[[0,5]]" },
      { input: "[[1,10],[2,6],[8,10],[15,18]]", output: "[[1,10],[15,18]]" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding test cases...");

  for (const entry of testCases) {
    const problem = await prisma.problem.findUnique({
      where: { number: entry.problemId },
    });

    if (!problem) {
      console.warn(`⚠️ Problem #${entry.problemId} not found, skipping...`);
      continue;
    }

    await prisma.runTestCase.upsert({
      where: { problemId: problem.id },
      update: {
        cases: entry.testCases,
      },
      create: {
        cases: entry.testCases,
        problemId: problem.id,
      },
    });

    console.log(`✅ Seeded test cases for Problem #${entry.problemId}`);
  }

  console.log("🎉 All test cases seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding test cases:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
