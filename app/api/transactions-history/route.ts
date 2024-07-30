import { currentUser } from "@/lib/auth";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { OverviewQuerySchema } from "@/schemas/overview";
import { PrismaClient } from "@prisma/client";

export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        throw new Error(`Usuário não autenticado!`);
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const queryParams = OverviewQuerySchema.safeParse({ from, to });

    if (!queryParams.success) {
        return Response.json(queryParams.error.message, {
            status: 400
        })
    }

    const transactions = await getTransactionsHistory(
        user.id,
        queryParams.data.from,
        queryParams.data.to
    );

    return Response.json(transactions);
}

export type getTransactionsHistoryResponseType = Awaited<
    ReturnType<typeof getTransactionsHistory>
>

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
    const prisma = new PrismaClient();

    const userSettings = await prisma.userSettings.findUnique({
        where: {
            userId
        }
    })
    if (!userSettings) {
        throw new Error("Configurações de usuário não encontradas!")
    }

    const formatter = GetFormatterForCurrency(userSettings.currency);

    const transactions = await prisma.transaction.findMany({
        where: {
            userId,
            date: {
                gte: from,
                lte: to
            }
        },
        orderBy: {
            date: "desc"
        }
    });

    return transactions.map((transaction) => ({
        ...transaction,

        formattedAmount: formatter.format(transaction.amount)
    }))
}