import { currentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

export async function GET(request: Request) {
    const user = await currentUser();
    const prisma = new PrismaClient();
    if (!user) return;

    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get("type");

    const validator = z.enum(["despesa", "renda"]).nullable();

    const queryParams = validator.safeParse(paramType);
    if(!queryParams.success) {
        return Response.json(queryParams.error, {
            status: 400,
        });
    }

    const type = queryParams.data;
    const categories = await prisma.category.findMany( {
        where: {
            userId: user.id,
            ...(type && { type }),
        },
        orderBy: {
            name: "asc",
        },
    });

    return Response.json(categories);
}