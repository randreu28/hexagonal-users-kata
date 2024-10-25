import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API route /api/test was called");
  res.status(200).json({ message: "Hello World" });
}
