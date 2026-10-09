"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Loader2 } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!res?.ok || res.error) {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password. Please verify and try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border bg-card shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-black tracking-tight">
          {t("signInTitle")}
        </CardTitle>
        <CardDescription>
          {t("signInDesc")}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input
              id="email"
              type="email"
              placeholder="fan@sportsportal.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t("passwordLabel")}</Label>
              <span className="text-xs text-muted-foreground cursor-pointer hover:underline">
                {t("forgotPassword")}
              </span>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full gap-2 font-semibold" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {t("signInButton")}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            {t("dontHaveAccount")}{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              {t("signUpTitle")}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
