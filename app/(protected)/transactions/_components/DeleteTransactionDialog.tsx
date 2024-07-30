"use client"

import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteTransaction } from "../_actions/DeleteTransaction";

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
            toast.success(`Transação deletada com sucesso!`, {
                id: transactionId,
            })

            await queryClient.invalidateQueries({
                queryKey: ["transactions"],
            })
        },
        onError: () => {
            toast.error(`Algo deu errado!`, {
                id: transactionId,
            })
        }
    })
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        você tem certeza absoluta?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. isso excluirá permanentemente sua transação
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading(`Deletando transação...`, {
                            id: transactionId,
                        });
                        deleteMutation.mutate(transactionId)
                    }}>
                        Continuar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteTransactionDialog;