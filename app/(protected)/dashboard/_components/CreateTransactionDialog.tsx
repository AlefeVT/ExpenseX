'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from '@/schemas/transaction';
import { TransactionType } from '@/types/transactionType';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReactNode, useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import CategoryPicker from './CategoryPicker';
import { CiSquarePlus } from 'react-icons/ci';
import { Button } from '@/components/ui/button';
import { MdClose } from 'react-icons/md';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CiCalendar } from 'react-icons/ci';
import { Calendar } from '@/components/ui/calendar';
import { LuLoader2 } from 'react-icons/lu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateTransaction } from '../_actions/transactions';
import { toast } from 'sonner';
import { format, isValid, parseISO, startOfDay } from 'date-fns';
import { DateToUTCDate } from '@/lib/helpers';
import CreateCategoryDiv from '../../_components/CreateCategoryDialog';

interface Props {
  trigger: ReactNode;
  type: TransactionType;
}

export function CreateTransactionDialog({ trigger, type }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const form = useForm<CreateTransactionSchemaType>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type,
      date: new Date(),
    },
  });

  const [open, setOpen] = useState(false);

  const handleCategoryChange = useCallback(
    (value: string) => {
      form.setValue('category', value);
    },
    [form]
  );

  const closeModal = () => setIsOpen(false);
  const openCategoryModal = () => {
    setIsOpen(false);
    setIsCategoryOpen(true);
  };
  const closeCategoryModal = () => setIsCategoryOpen(false);
  const openTransactionModal = () => setIsOpen(true);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: CreateTransaction,
    onSuccess: () => {
      toast.success('Transação criada com sucesso!', {
        id: 'create-transaction',
      });

      form.reset({
        type,
        description: '',
        amount: 0,
        date: new Date(),
        category: undefined,
      });

      queryClient.invalidateQueries({
        queryKey: ['overview'],
      });

      setOpen((prev) => !prev);
    },
  });

  const onSubmit = useCallback(
    (values: CreateTransactionSchemaType) => {
      toast.loading('Criando Transação...', {
        id: 'create-transaction',
      });

      mutate({
        ...values,
        date: DateToUTCDate(values.date),
      });
    },
    [mutate]
  );

  return (
    <>
      <div onClick={openTransactionModal}>{trigger}</div>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40"
          onClick={closeModal}
        >
          <div
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h2>
                Adicione uma nova transação de
                <span
                  className={cn(
                    'm-1',
                    type === 'renda' ? 'text-emerald-500' : 'text-red-500'
                  )}
                >
                  {type}
                </span>
              </h2>
              <Button
                variant={'ghost'}
                className="flex items-center justify-center p-1"
                onClick={closeModal}
              >
                <MdClose className="h-5 w-5" />
              </Button>
            </div>
            <Form {...form}>
              <form
                className="space-y-4 px-4 md:px-8"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Descrição da transação (opcional)
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantia</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormDescription>
                        Quantia da transação (obrigatório)
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem className="w-full flex flex-col">
                        <FormLabel>Categoria </FormLabel>
                        <FormControl>
                          <CategoryPicker
                            type={type}
                            onChange={handleCategoryChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Selecione a categoria dessa transação (obrigatório)
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Data da transação</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full md:w-[200px] pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  <span>
                                    {typeof field.value === 'string'
                                      ? format(
                                          parseISO(field.value),
                                          'dd/MM/yyyy'
                                        )
                                      : format(field.value, 'dd/MM/yyyy')}
                                  </span>
                                ) : (
                                  <span>Escolha uma data</span>
                                )}
                                <CiCalendar className="ml-auto h-4 w-4 opacity-100" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={
                                typeof field.value === 'string' &&
                                isValid(parseISO(field.value))
                                  ? parseISO(field.value)
                                  : field.value
                              }
                              onSelect={(date) => {
                                if (date) {
                                  const formattedDate = format(
                                    date,
                                    'yyyy-MM-dd'
                                  );
                                  field.onChange(formattedDate);
                                } else {
                                  field.onChange('');
                                }
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Selecione a data dessa transação (obrigatório)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <Button
                    type="button"
                    variant={'ghost'}
                    className="w-full md:w-auto"
                    onClick={openCategoryModal}
                  >
                    <CiSquarePlus className="mr-2" /> Criar categoria
                  </Button>
                </div>
              </form>
            </Form>

            <div className="flex justify-end gap-2">
              <div>
                <Button
                  type="button"
                  variant={'secondary'}
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Cancelar
                </Button>
              </div>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isPending}
              >
                {!isPending && 'Criar'}
                {isPending && <LuLoader2 className="animate-spin" />}
              </Button>
            </div>
          </div>
        </div>
      )}
      {isCategoryOpen && (
        <CreateCategoryDiv
          open={isCategoryOpen}
          onClose={closeCategoryModal}
          type={type}
          successCallback={(category) => {
            closeCategoryModal();
            openTransactionModal();
          }}
        />
      )}
    </>
  );
}
