import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';
import { Logo } from '@/components/logo/logo';

export default function Home() {
  return (
    <main className="flex h-full flex-col items-center justify-center light:bg-gray-300">
      <div className="w-1/2 h-1/2 items-center flex flex-col my-auto justify-center">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="space-y-6 text-center">
          <p className="text-md font-medium text-gray-900 dark:text-gray-400">
            Um serviço de gerenciamento simples!
          </p>
          <div>
            <LoginButton asChild>
              <Button variant="secondary" size="lg">
                Entrar
              </Button>
            </LoginButton>
          </div>
        </div>
      </div>
    </main>
  );
}
