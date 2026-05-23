"use client";

import { z } from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { forgotPasswordSchema } from "../schemas";
import { useForgotPassword } from "../api/use-forgot-password";

export const ForgotPasswordCard = () => {
  const { mutate, isPending } = useForgotPassword();

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
    mutate({ json: values });
  };

  return (
    <Card className="w-full h-full md:w-[487px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center p-7">
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
      </CardHeader>
      <CardContent className="p-7">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter your email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isPending} size="lg" className="w-full">
              Send Reset Link
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardContent className="p-7 flex items-center justify-center">
        <p>
          Remember your password?
          <Link href="/sign-in"><span className="text-blue-700">&nbsp;Login</span></Link>
        </p>
      </CardContent>
    </Card>
  );
};
