"use client";

import { z } from "zod";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { resetPasswordSchema } from "../schemas";
import { useResetPassword } from "../api/use-reset-password";

export const ResetPasswordCard = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "";
  const secret = searchParams.get("secret") || "";

  const { mutate, isPending } = useResetPassword();

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { userId, secret, password: "" },
  });

  const onSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
      </CardHeader>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending || !userId || !secret} size="lg" className="w-full">
              Reset Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
