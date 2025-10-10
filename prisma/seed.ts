import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tagPool = [
    "arrays","strings","math","dp","trees",
    "graphs","linked-list","binary-search","hash-table",
    "recursion","stack","queue","sliding-window",
    "trie","greedy","heap"
  ];

  const difficulties = ["Easy","Medium","Hard"];

  // Generate 60 dummy problems
  const problems = Array.from({ length: 60 }, (_, i) => {
    const num = i + 1;

    // Pick 2-4 random tags
    const randomTags: string[] = [];
    const count = Math.floor(Math.random() * 3) + 2;
    while (randomTags.length < count) {
      const t = tagPool[Math.floor(Math.random() * tagPool.length)];
      if (!randomTags.includes(t)) randomTags.push(t);
    }

    return {
      number: num,
      title: `Dummy Problem ${num}`,
      description: `This is the description for Dummy Problem ${num}.`,
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
      tags: randomTags
    };
  });

  // Create tags in advance to ensure they exist
  for (const tagName of tagPool) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName },
    });
  }

  // Create problems and connect tags
  for (const problem of problems) {
    const createdProblem = await prisma.problem.create({
      data: {
        number: problem.number,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
      },
    });

    for (const tagName of problem.tags) {
      // Find the tag first
      const tag = await prisma.tag.findUnique({ where: { name: tagName } });
      if (!tag) continue;

      // Connect the problem with tag via ProblemTag
      await prisma.problemTag.create({
        data: {
          problemId: createdProblem.id,
          tagId: tag.id,
        },
      });
    }
  }

  console.log("Seeded 60 dummy problems with tags successfully!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
