import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";

const app = express();
// instance of prisma client
const prisma = new PrismaClient();

// graphql
import { makeExecutableSchema } from "@graphql-tools/schema";
import { graphqlHTTP } from "express-graphql";

// graphql models
const graphqlModels = `
    type Post{
        id: ID
        text: String
        user: User
        userId: String
    }
    type User{
        id: ID
        name: String
        posts: [Post]
    }
    type Query{
      getPosts: [Post]  
      getUsers: [User]  
    }
`;

// Graphql Resolvers
const resolvers = {
  Query: {
    getPosts: () => {
      return prisma.post.findMany({
        include: {
          user: true,
        },
      });
    },
    getUsers: () => {
      return prisma.user.findMany({
        include: {
          posts: true,
        },
      });
    },
  },
};

// Graphql schema
const schema = makeExecutableSchema({
  resolvers,
  typeDefs: graphqlModels,
});

// using graphqlHTTP middleware
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

// middlewares
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  const posts = await prisma.post.findMany();

  return res.status(200).json({ success: true, posts });
});

app.post("/", async (req: Request, res: Response) => {
  const { text, userId } = req.body;

  const post = await prisma.post.create({
    data: {
      text,
      userId,
    },
  });

  return res.status(201).json({ success: true, post });
});
app.post("/user", async (req: Request, res: Response) => {
    const { name } = req.body;
  
    const post = await prisma.user.create({
      data: {
        name
      },
    });
  
    return res.status(201).json({ success: true, post });
  });
app.listen(3000, () => {
  console.log(`Listening to 3000`);
});