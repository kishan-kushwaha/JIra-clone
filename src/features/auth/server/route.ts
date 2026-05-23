import { Hono } from "hono";
import { ID, AppwriteException, Client, Account } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";

import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";

import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas";

const app = new Hono()
  .get(
    "/current",
    sessionMiddleware,
    (c) => {
      const user = c.get("user");

      return c.json({ data: user });
    }
  )
  .post(
    "/login",
    zValidator("json", loginSchema),
    async (c) => {
      const { email, password } = c.req.valid("json");

      const { account } = await createAdminClient();
      const session = await account.createEmailPasswordSession(
        email,
        password,
      );

      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });

      return c.json({ success: true });
    }
  )
  .post(
    "/register",
    zValidator("json", registerSchema),
    async (c) => {
      const { name, email, password } = c.req.valid("json");

      const { account } = await createAdminClient();
      
      try {
        await account.create(
          ID.unique(),
          email,
          password,
          name,
        );
      } catch (error) {
        if (error instanceof AppwriteException && error.code === 409) {
          return c.json({ error: "Email is already registered" }, 409);
        }
        throw error;
      }

      const session = await account.createEmailPasswordSession(
        email,
        password,
      );

      setCookie(c, AUTH_COOKIE, session.secret, {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
      });

      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
          .setSession(session.secret);
        const userAccount = new Account(client);
        
        await userAccount.createVerification(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify`
        );
      } catch (error) {
        console.error("Failed to send verification email", error);
      }

      return c.json({ success: true });
    }
  )
  .get(
    "/verify",
    async (c) => {
      const userId = c.req.query("userId");
      const secret = c.req.query("secret");

      if (!userId || !secret) {
        return c.redirect("/sign-in?error=invalid-verification-link");
      }

      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
        const account = new Account(client);

        await account.updateVerification(userId, secret);

        return c.redirect("/?verified=true");
      } catch {
        return c.redirect("/sign-in?error=verification-failed");
      }
    }
  )
  .post(
    "/forgot-password",
    zValidator("json", forgotPasswordSchema),
    async (c) => {
      const { email } = c.req.valid("json");

      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
        const account = new Account(client);

        await account.createRecovery(
          email,
          `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
        );
        return c.json({ success: true });
      } catch (error) {
        console.error("Failed to send recovery email", error);
        return c.json({ error: "Failed to send recovery email" }, 500);
      }
    }
  )
  .post(
    "/reset-password",
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { userId, secret, password } = c.req.valid("json");

      try {
        const client = new Client()
          .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
          .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
        const account = new Account(client);

        await account.updateRecovery(userId, secret, password);
        return c.json({ success: true });
      } catch (error) {
        console.error("Failed to reset password", error);
        return c.json({ error: "Failed to reset password" }, 500);
      }
    }
  )
  .post("/logout", sessionMiddleware, async (c) => {
    const account = c.get("account");

    deleteCookie(c, AUTH_COOKIE);
    await account.deleteSession("current");

    return c.json({ success: true });
  });

export default app;
