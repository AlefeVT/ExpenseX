"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CreateCategorySchema, CreateCategorySchemaType } from "@/schemas/categories";
import { TransactionType } from "@/types/transactionType";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { TbCircleOff } from "react-icons/tb";
import { MdClose } from "react-icons/md";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category } from "@prisma/client";
import { toast } from "sonner";
import { FiLoader } from "react-icons/fi";
import { useTheme } from "next-themes";
import { CreateCategory } from "../dashboard/_actions/categories";

interface Props {
    type: TransactionType;
    successCallback: (category: Category) => void;
    open: boolean;
    onClose: () => void;
}

function CreateCategoryDiv({ type, successCallback, open, onClose }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);
    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type,
            icon: ""
        }
    });

    const queryClient = useQueryClient();
    const theme = useTheme();

    const { mutate, isPending } = useMutation({
        mutationFn: CreateCategory,
        onSuccess: async (data: Category) => {
            form.reset({
                name: "",
                icon: "",
                type
            });

            toast.success(`Categoria ${data.name} criada com sucesso!`, {
                id: "create-category",
            });

            successCallback(data);

            await queryClient.invalidateQueries({
                queryKey: ["categories"]
            });

            onClose(); 
        },
        onError: () => {
            toast.error("Algo deu errado!", {
                id: "create-category"
            });
        }
    });

    const onSubmit = useCallback(
        (values: CreateCategorySchemaType) => {
            toast.loading("Criando categoria...", {
                id: "create-category",
            });
            mutate(values);
        }, [mutate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                // Removido o fechamento automático ao clicar fora do modal
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalRef]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50"></div>
            <div ref={modalRef} className="relative bg-background border p-6 shadow-lg sm:rounded-lg">
                <div className="flex justify-between">
                    <div>
                        <div>
                            Criar categoria de <span className={cn(
                                "m-1",
                                type === "renda" ? "text-emerald-500" :
                                    "text-red-500"
                            )}>
                                {type}
                            </span>
                        </div>
                        <div>
                            Categorias são usadas para agrupar suas transações
                        </div>
                    </div>
                    <Button variant={"ghost"} className="flex items-center justify-center p-1" onClick={onClose}>
                        <MdClose className="h-5 w-5" />
                    </Button>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Categoria" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        É assim que sua categoria aparecerá no aplicativo
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ícone</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className="h-[100px] w-full"
                                                >
                                                    {form.watch("icon") ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="text-5xl" role="img">
                                                                {form.watch("icon")}
                                                            </span>
                                                            <p className="text-xs text-muted-foreground">
                                                                Clique para alterar
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <TbCircleOff className="h-[48px] w-[48px]" />
                                                            <p className="text-xs text-muted-foreground">Clique para selecionar</p>
                                                        </div>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full" onClick={(e) => e.stopPropagation()}>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <Picker
                                                        data={data}
                                                        theme={theme.resolvedTheme}
                                                        onEmojiSelect={(emoji: { native: string }) => {
                                                            form.setValue("icon", emoji.native);
                                                        }}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormDescription>
                                        É assim que sua categoria aparecerá no aplicativo (opcional)
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
                <div className="flex justify-end">
                    <Button type="button" variant={"secondary"} onClick={() => {
                        form.reset();
                    }}>
                        Cancelar
                    </Button>

                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending} className="ml-4">
                        {!isPending && "Salvar"}
                        {isPending && <FiLoader className="animate-spin" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default CreateCategoryDiv;
