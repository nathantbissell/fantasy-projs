const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} = require("@aws-sdk/lib-dynamodb");
const express = require("express");

const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
const CPFFL_TABLE = process.env.CPFFL_TABLE;
const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

app.use(express.json());

app.get("/league/:year", async (req: { params: { year: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; }) => {
  const params = {
    TableName: CPFFL_TABLE,
    Key: {
      PK: "LEAGUE",
      SK: `YEAR#${req.params.year}`,
    },
  };
  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      res.json(Item);
    } else {
      res.status(404).json({ error: 'Could not find league data for year' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve league data" });
  }
});

app.post("/league/:year", async (req: { body: { data: any; }; params: { year: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; json: (arg0: { year: any; data: any; }) => void; }) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: '"data" is required in body' });
  }
  const params = {
    TableName: CPFFL_TABLE,
    Item: {
      PK: "LEAGUE",
      SK: `YEAR#${req.params.year}`,
      data,
    },
  };
  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ year: req.params.year, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create/update league data" });
  }
});

app.get("/users/:userId", async (req: { params: { userId: any; }; }, res: { json: (arg0: { userId: any; name: any; }) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; }) => {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    if (Item) {
      const { userId, name } = Item;
      res.json({ userId, name });
    } else {
      res.status(404).json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retrieve user" });
  }
});

app.post("/users", async (req: { body: { userId: any; name: any; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; json: (arg0: { userId: any; name: any; }) => void; }) => {
  const { userId, name } = req.body;
  if (typeof userId !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } else if (typeof name !== "string") {
    res.status(400).json({ error: '"name" must be a string' });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: { userId, name },
  };

  try {
    const command = new PutCommand(params);
    await docClient.send(command);
    res.json({ userId, name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not create user" });
  }
});

app.use((req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; }, next: any) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports = app;
