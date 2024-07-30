import { currentUser } from "@/lib/auth";
import { Prisma, PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function GET(request: Request) {
    const prisma = new PrismaClient();
    const user = await currentUser();

    if (!user) {
        return
    }

    let userSettings = await prisma.userSettings.findUnique({
        where: {
            userId: user.id
        }
    })

    if(!userSettings) {
        userSettings = await prisma.userSettings.create({
            data: {
                userId: user.id,
                currency: "BRL",
            }
        })
    }

    revalidatePath("/dashboard");
    return Response.json(userSettings);
}