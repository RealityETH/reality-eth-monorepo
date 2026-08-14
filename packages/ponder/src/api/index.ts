import { Hono } from "hono";
import { db } from "ponder:api";
import { graphql } from "ponder";
import schema from "ponder:schema";

const app = new Hono();

app.use("/graphql", graphql({ db, schema }));

export default app;
