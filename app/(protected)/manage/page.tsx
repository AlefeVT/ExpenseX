'use client';

import { CurrencyComboBox } from '@/components/currencyComboBox/currencyComboBox';
import SkeletonWrapper from '@/components/SkeletonWrapper/SkeletonWrapper';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TransactionType } from '@/types/transactionType';
import { useQuery } from '@tanstack/react-query';
import { IoMdTrendingDown } from 'react-icons/io';
import { IoMdTrendingUp } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import { CiSquarePlus } from 'react-icons/ci';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Category } from '@prisma/client';
import { FaRegTrashCan } from 'react-icons/fa6';
import CreateCategoryDiv from '../_components/CreateCategoryDialog';
import DeleteCategoryDialog from './_components/DeleteCategoryDialog';

function page() {
  return (
    <>
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-8">
          <div>
            <p className="text-3xl font-bold">Gerenciar</p>
            <p className="text-muted-foreground">
              Gerencie sua conta e suas categorias
            </p>
          </div>
        </div>
      </div>
      {/* END Header */}
      <div className="container flex flex-col gap-4 p-4">
        <Card>
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
        <CategoryList type="renda" />
        <CategoryList type="despesa" />
      </div>
    </>
  );
}

export default page;

function CategoryList({ type }: { type: TransactionType }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const closeCategoryModal = () => setIsCategoryOpen(false);

  const categoriesQuery = useQuery({
    queryKey: ['categories', type],
    queryFn: () =>
      fetch(`/api/categories?type=${type}`).then((res) => res.json()),
  });

  const openCategoryModal = () => {
    setIsOpen(false);
    setIsCategoryOpen(true);
  };

  const dataAvailable = categoriesQuery.data && categoriesQuery.data.length > 0;

  return (
    <>
      <SkeletonWrapper isLoading={categoriesQuery.isFetching}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {type === 'despesa' ? (
                  <IoMdTrendingDown className="h-12 w-12 items-center rounded-lg bg-red-400/10 p-2 text-red-500" />
                ) : (
                  <IoMdTrendingUp className="h-12 w-12 items-center rounded-lg bg-emerald-400/10 p-2 text-emerald-500" />
                )}

                <div>
                  Categorias de {type === 'renda' ? 'Rendas' : 'Despesas'}{' '}
                  <div className="text-sm text-muted-foreground">
                    Ordenado por nome
                  </div>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  variant={'default'}
                  className="w-full md:w-auto"
                  onClick={openCategoryModal}
                >
                  <CiSquarePlus className="mr-2" /> Criar categoria
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          <Separator />
          {!dataAvailable && (
            <div className="flex h-40 w-full flex-col items-center justify-center">
              <p>
                Nenhuma categoria de{' '}
                {type === 'renda' ? (
                  <span className="text-emerald-500">renda</span>
                ) : (
                  <span className="text-red-500">despesa</span>
                )}{' '}
                encontrada. Clique em "Criar categoria" para adicionar novas.
              </p>
            </div>
          )}
          {dataAvailable && (
            <div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categoriesQuery.data.map((category: Category) => (
                <CategoryCard category={category} key={category.name} />
              ))}
            </div>
          )}
        </Card>
      </SkeletonWrapper>

      {isCategoryOpen && (
        <CreateCategoryDiv
          open={isCategoryOpen}
          onClose={closeCategoryModal}
          type={type}
          successCallback={(category) => {
            closeCategoryModal();
          }}
        />
      )}
    </>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <div className="flex border-separate flex-col justify-between rounded-md border shadow-md shadow-black/[0.1] dark:shadow-white/[0.1]">
      <div className="flex flex-col items-center gap-2 p-4">
        <span className="text-3xl" role="img">
          {category.icon}
        </span>
        <span>{category.name}</span>
      </div>
      <DeleteCategoryDialog
        category={category}
        trigger={
          <Button
            className="flex w-full border-separate items-center gap-2 rounded-t-none text-muted-foreground hover:bg-red-500/20"
            variant={'secondary'}
          >
            <FaRegTrashCan className="h-4 w-4" />
            Remover
          </Button>
        }
      />
    </div>
  );
}
