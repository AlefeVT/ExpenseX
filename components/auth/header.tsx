import Image from 'next/image';
import { InitialLogo, Logo } from '../logo/logo';

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <div className="flex flex-col justify-center mx-auto">
        <div className="flex flex-col mx-auto justify-center mb-4">
          <Logo />
        </div>
        <p className="text-muted-foreground text-sm mx-auto">{label}</p>
      </div>
    </div>
  );
};
