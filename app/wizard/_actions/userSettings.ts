"use server";

import { currentUser } from "@/lib/auth";
import { UpdateUserCurrencySchema } from "@/schemas/userSettings";
import { PrismaClient } from "@prisma/client";

export async function UpdateUserCurrency(currency: string): Promise<{ userId: string; currency: string; }> {
    const prisma = new PrismaClient();

    const parsedBody = UpdateUserCurrencySchema.safeParse({
        currency,
    });

    if (!parsedBody.success) {
        throw new Error(parsedBody.error.message);
    }

    const user = await currentUser();

    if (!user) {
        throw new Error('Usuário não autenticado.');
    }

    const userSettings = await prisma.userSettings.update({
        where: {
            userId: user.id,
        },
        data: {
            currency,
        },
    });

    return { userId: userSettings.userId, currency: userSettings.currency };
}
