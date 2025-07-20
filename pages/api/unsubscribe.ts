import type { NextApiRequest, NextApiResponse } from "next";
import getDBClient from "../../lib/mongodb";
import validateMiddleware from "../../lib/validate-middleware";
import { check, validationResult } from "express-validator";
import { sendAdminEmail } from "../../utils/email-helper";
import { Player } from "../../types";

const validateBody = validateMiddleware(
  [check("email").isEmail().trim()],
  validationResult
);

export default async function Unsubscribe(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await validateBody(req, res);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const email = (req.body.email as string).toLowerCase();
  let name = "unknown";

  try {
    const date = new Date();
    const client = await getDBClient();
    const db = client.db("softball").collection<Player>("players");
    const response = await db.findOne(
      { email },
      { projection: { _id: 0, name: 1, email: 1 } }
    );
    if (response) {
      name = response.name;
      await db.updateOne(
        {
          email,
        },
        {
          $set: {
            unsubscribed: true,
            updated_at: date,
          },
        }
      );
    } else {
      await db.insertOne({
        email,
        unsubscribed: true,
        name,
        created_at: date,
        updated_at: date,
      });
    }

    await sendAdminEmail(name, email, date.toDateString(), "unsubscribe");

    res.send({ status: "ok" });
  } catch (err) {
    // some other errors
    return res.status(500).json({ message: JSON.stringify(err.message) });
  }
}
