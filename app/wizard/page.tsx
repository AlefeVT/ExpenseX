import { CurrencyComboBox } from '@/components/currencyComboBox/currencyComboBox';
import { Logo } from '@/components/logo/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@/lib/auth';
import Link from 'next/link';
import { GiHand } from 'react-icons/gi';

async function page() {
  const user = await currentUser();

  const firstName = user?.name ? user.name.split(' ')[0] : 'Visitante';

  return (
    <div className="container flex max-w-2xl flex-col items-center justify-between gap-4">
      <div>
        <h1 className="text-center text-3xl flex justify-center">
          Bem vindo,{' '}
          <span className="ml-2 font-bold flex gap-2">
            {firstName} <GiHand />
          </span>
        </h1>

        <h2 className="mt-4 text-center text-base text-muted-foreground">
          Vamos começar configurando sua moeda
        </h2>

        <h3 className="mt-2 text-center text-sm text-muted-foreground">
          Você pode alterar essas configurações a qualquer momento
        </h3>
      </div>

      <Separator />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Moeda</CardTitle>

          <CardDescription>
            Defina sua moeda padrão para transações
          </CardDescription>
        </CardHeader>

        <CardContent>
          <CurrencyComboBox />
        </CardContent>
      </Card>

      <Separator />

      <Button className="w-full" asChild>
        <Link href={'/dashboard'}>Terminei! Leve-me ao painel</Link>
      </Button>

      <div className="mt-8">
        <Logo />
      </div>
    </div>
  );
}

export default page;
