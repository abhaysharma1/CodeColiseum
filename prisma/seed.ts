import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const testCases = [
  {
    problemNumber: 1,
    cases: [
      { "input": "[3, 0, 1]", "output": "2" },
      { "input": "[0, 1]", "output": "2" },
      { "input": "[9,6,4,2,3,5,7,0,1]", "output": "8" },
      { "input": "[0]", "output": "1" },
      { "input": "[1]", "output": "0" },
      { "input": "[1,2,3,4,5,6,7,8,9,10]", "output": "0" },
      { "input": "[0,2,3,4,5,6,7,8,9,10]", "out\put": "1" },
      { "input": "[0,1,2,3,4,5,6,7,8,9]", "output": "10" },
      { "input": "[45,35,38,13,12,23,48,29,25,33,19,0,42,4,1,44,20,8,49,5,30,14,34,43,37,46,2,17,32,15,22,47,40,24,18,11,6,26,21,39,31,28,3,41,27,9,7,16,36]", "output": "10" },
      { "input": "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,0]", "output": "21" }
    ]
  },
  {
    problemNumber: 2,
    cases: [
      { "input": "['h','e','l','l','o']", "output": "['o','l','l','e','h']" },
      { "input": "['H','a','n','n','a','h']", "output": "['h','a','n','n','a','H']" },
      { "input": "['A']", "output": "['A']" },
      { "input": "['a','b']", "output": "['b','a']" },
      { "input": "['A','B','C','D','E']", "output": "['E','D','C','B','A']" },
      { "input": "['r','a','c','e','c','a','r']", "output": "['r','a','c','e','c','a','r']" },
      { "input": "['1','2','3','4','5','6','7','8','9']", "output": "['9','8','7','6','5','4','3','2','1']" },
      { "input": "['!','@','#','$']", "output": "['$','#','@','!']" },
      { "input": "['a','b','c','d','e','f','g','h','i','j']", "output": "['j','i','h','g','f','e','d','c','b','a']" },
      { "input": "['T','e','s','t']", "output": "['t','s','e','T']" }
    ]
  },
  {
    problemNumber: 3,
    cases: [
      { "input": "()", "output": "true" },
      { "input": "()[]{}", "output": "true" },
      { "input": "(]", "output": "false" },
      { "input": "([)]", "output": "false" },
      { "input": "{[]}", "output": "true" },
      { "input": "", "output": "true" },
      { "input": "(((", "output": "false" },
      { "input": ")))", "output": "false" },
      { "input": "{[()]}", "output": "true" },
      { "input": "(([]){()})", "output": "true" },
      { "input": "[({})]", "output": "true" },
      { "input": "[(])", "output": "false" }
    ]
  },
  {
    problemNumber: 4,
    cases: [
      { "input": "[1,2,3,1]", "output": "2" },
      { "input": "[1,2,1,3,5,6,4]", "output": "5" },
      { "input": "[1]", "output": "0" },
      { "input": "[1,2]", "output": "1" },
      { "input": "[2,1]", "output": "0" },
      { "input": "[1,2,3,4,5]", "output": "4" },
      { "input": "[5,4,3,2,1]", "output": "0" },
      { "input": "[1,3,2,1]", "output": "1" },
      { "input": "[1,2,1,2,1]", "output": "1" },
      { "input": "[1,5,3,4,2]", "output": "1" }
    ]
  },
  {
    problemNumber: 5,
    cases: [
      { "input": "head = [3,2,0,-4], pos = 1", "output": "true" },
      { "input": "head = [1,2], pos = 0", "output": "true" },
      { "input": "head = [1], pos = -1", "output": "false" },
      { "input": "head = [], pos = -1", "output": "false" },
      { "input": "head = [1,2,3,4,5], pos = 2", "output": "true" },
      { "input": "head = [1,2,3,4,5], pos = -1", "output": "false" },
      { "input": "head = [1,2,3,4,5,6,7,8,9,10], pos = 5", "output": "true" },
      { "input": "head = [1,2,3], pos = 0", "output": "true" },
      { "input": "head = [1,2,3,4], pos = 3", "output": "true" },
      { "input": "head = [-1,-7,7,-4,19,6,-9,-5,-2,-5], pos = 6", "output": "true" }
    ]
  },
  {
    problemNumber: 6,
    cases: [
      { "input": "nums = [1,2,3,4,5,6,7], k = 3", "output": "[5,6,7,1,2,3,4]" },
      { "input": "nums = [-1,-100,3,99], k = 2", "output": "[3,99,-1,-100]" },
      { "input": "nums = [1,2], k = 1", "output": "[2,1]" },
      { "input": "nums = [1,2], k = 2", "output": "[1,2]" },
      { "input": "nums = [1,2,3,4,5], k = 0", "output": "[1,2,3,4,5]" },
      { "input": "nums = [1], k = 0", "output": "[1]" },
      { "input": "nums = [1], k = 1", "output": "[1]" },
      { "input": "nums = [1,2,3,4,5,6], k = 4", "output": "[3,4,5,6,1,2]" },
      { "input": "nums = [1,2,3], k = 4", "output": "[3,1,2]" },
      { "input": "nums = [1,2,3,4,5,6,7,8,9], k = 11", "output": "[8,9,1,2,3,4,5,6,7]" }
    ]
  },
  {
    problemNumber: 7,
    cases: [
      { "input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6" },
      { "input": "[1]", "output": "1" },
      { "input": "[5,4,-1,7,8]", "output": "23" },
      { "input": "[-1]", "output": "-1" },
      { "input": "[-2,-1]", "output": "-1" },
      { "input": "[1,2,3,4,5]", "output": "15" },
      { "input": "[-1,-2,-3,-4]", "output": "-1" },
      { "input": "[8,-19,5,-4,20]", "output": "21" },
      { "input": "[1,-1,1,-1,1,-1,1]", "output": "1" },
      { "input": "[-2,1,-3,4,-1,2,1,-5,4]", "output": "6" }
    ]
  },
  {
    problemNumber: 8,
    cases: [
      { "input": "[3,9,20,null,null,15,7]", "output": "[[3],[9,20],[15,7]]" },
      { "input": "[1]", "output": "[[1]]" },
      { "input": "[]", "output": "[]" },
      { "input": "[1,2,3,4,5]", "output": "[[1],[2,3],[4,5]]" },
      { "input": "[1,2,3,4,null,null,5]", "output": "[[1],[2,3],[4,5]]" },
      { "input": "[1,2,null,3,null,4,null,5]", "output": "[[1],[2],[3],[4],[5]]" },
      { "input": "[5,3,8,1,4,7,9]", "output": "[[5],[3,8],[1,4,7,9]]" },
      { "input": "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]", "output": "[[1],[2,3],[4,5,6,7],[8,9,10,11,12,13,14,15]]" },
      { "input": "[10,5,15,null,null,6,20]", "output": "[[10],[5,15],[6,20]]" },
      { "input": "[1,null,2,null,3,null,4,null,5]", "output": "[[1],[2],[3],[4],[5]]" }
    ]
  },
  {
    problemNumber: 9,
    cases: [
      { "input": "[1,2,3,4]", "output": "[24,12,8,6]" },
      { "input": "[-1,1,0,-3,3]", "output": "[0,0,9,0,0]" },
      { "input": "[2,3,4,5]", "output": "[60,40,30,24]" },
      { "input": "[1,1,1,1]", "output": "[1,1,1,1]" },
      { "input": "[0,0]", "output": "[0,0]" },
      { "input": "[1,0]", "output": "[0,1]" },
      { "input": "[3,0,2]", "output": "[0,6,0]" },
      { "input": "[-1,-2,-3,-4]", "output": "[-24,-12,-8,-6]" },
      { "input": "[2,2,2,2,2]", "output": "[16,16,16,16,16]" },
      { "input": "[5,9,2,6,1]", "output": "[108,60,270,90,540]" }
    ]
  },
  {
    problemNumber: 10,
    cases: [
      { "input": "[100,4,200,1,3,2]", "output": "4" },
      { "input": "[0,3,7,2,5,8,4,6,0,1]", "output": "9" },
      { "input": "[]", "output": "0" },
      { "input": "[1]", "output": "1" },
      { "input": "[1,2,0,1]", "output": "3" },
      { "input": "[9,1,4,7,3,-1,0,5,8,-2,6,2]", "output": "12" },
      { "input": "[1,2,3,4,5,6,7,8,9,10]", "output": "10" },
      { "input": "[10,5,100,11,12,13,1,2,3]", "output": "4" },
      { "input": "[0,0,0,0]", "output": "1" },
      { "input": "[-1,-2,0,1,2,3,4,5]", "output": "8" }
    ]
  },
  {
    problemNumber: 11,
    cases: [
      { "input": "[[1,3],[2,6],[8,10],[15,18]]", "output": "[[1,6],[8,10],[15,18]]" },
      { "input": "[[1,4],[4,5]]", "output": "[[1,5]]" },
      { "input": "[[1,4],[0,4]]", "output": "[[0,4]]" },
      { "input": "[[1,4],[2,3]]", "output": "[[1,4]]" },
      { "input": "[[1,4],[0,2],[3,5]]", "output": "[[0,5]]" },
      { "input": "[[1,10],[2,6],[8,10],[15,18]]", "output": "[[1,10],[15,18]]" },
      { "input": "[[1,2],[3,4],[5,6]]", "output": "[[1,2],[3,4],[5,6]]" },
      { "input": "[[1,4],[0,5]]", "output": "[[0,5]]" },
      { "input": "[[1,5],[2,3],[4,6]]", "output": "[[1,6]]" },
      { "input": "[[1,4],[5,6]]", "output": "[[1,4],[5,6]]" }
    ]
  }
]

async function main() {
  console.log("🌱 Seeding test cases...");

  for (const entry of testCases) {
    const problem = await prisma.problem.findUnique({
      where: { number: entry.problemNumber },
    });

    if (!problem) {
      console.warn(`⚠️ Problem #${entry.problemNumber} not found, skipping...`);
      continue;
    }

    await prisma.testCase.upsert({
      where: { problemId: problem.id },
      update: {
        cases: entry.cases,
      },
      create: {
        cases: entry.cases,
        problemId: problem.id,
      },
    });

    console.log(`✅ Seeded test cases for Problem #${entry.problemNumber}`);
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
