import { NextApiRequest, NextApiResponse } from "next";
import { UserTable } from "@/lib/types";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { id, email, password } = req.body as UserTable;
  }

  
}
