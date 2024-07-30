import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { CreateTransactionDialog } from './_components/CreateTransactionDialog'
import Overview from "./_components/Overview";
import History from "./_components/History"

async function page() {

  const prisma = new PrismaClient();
  const user = await currentUser();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Visitante';

  if (!user) {
    return
  }

  const userSettings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  if (!userSettings) {
    redirect("/wizard");
  }

  return (
    <div className="h-full bg-background">
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <p className="text-3xl font-bold">
            Olá, {firstName}!
          </p>

          <div className="flex items-center gap-3">

            <CreateTransactionDialog
              trigger={
                <Button variant={"outline"}
                  className="border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white"
                >
                  Nova Renda
                </Button>
              }
              type="renda"
            />

            <CreateTransactionDialog
              trigger={
                <Button variant={"outline"}
                  className="border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white"
                >
                  Nova Despesa
                </Button>
              }
              type="despesa"
            />

          </div>
        </div>
      </div>
      <Overview userSettings={userSettings}/>
      <History userSettings={userSettings}/>
    </div>
  );
};

export default page;
