import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DeleteTransaction } from '../_actions/DeleteTransaction';
import { Button } from '@/components/ui/button';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    transactionId: string;
}

function DeleteTransactionDialog({ open, setOpen, transactionId }: Props) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: async () => {
            toast.success('Transação deletada com sucesso!', {
                id: transactionId,
            });

            await queryClient.invalidateQueries({
                queryKey: ['transactions'],
            });
        },
        onError: () => {
            toast.error('Algo deu errado!', {
                id: transactionId,
            });
        },
    });

    return (
        <>
            {open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setOpen(false)}>
                    <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold">Você tem certeza absoluta?</h2>
                        </div>
                        <div className="mb-6">
                            <p>Esta ação não pode ser desfeita. Isso excluirá permanentemente sua transação.</p>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <Button variant={'secondary'} onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button
                                variant={'destructive'}
                                onClick={() => {
                                    toast.loading('Deletando transação...', {
                                        id: transactionId,
                                    });
                                    deleteMutation.mutate(transactionId);
                                }}
                            >
                                Continuar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DeleteTransactionDialog;
