import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { CardWrapper } from '@/components/auth/card-wrapper';

export const ErrorCard = () => {
  return (
    <CardWrapper
      headerLabel="Oops! Algo deu errado!"
      backButtonHref="/auth/login"
      backButtonLabel="Volte ao login"
    >
      <div className="w-full flex items-center justify-center">
        <ExclamationTriangleIcon className="text-destructive" />
      </div>
    </CardWrapper>
  );
};
