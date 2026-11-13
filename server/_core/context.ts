import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { HttpError } from "../../shared/_core/errors";
import { TRPCError } from "@trpc/server";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  authError?: TRPCError;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let authError: TRPCError | undefined;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Missing/expired credentials are anonymous; infrastructure failures must
    // not masquerade as a successful sign-out and remap private profiles to guest.
    if (error instanceof HttpError && (error.statusCode === 401 || error.statusCode === 403)) user = null;
    else authError = new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Your account connection is temporarily unavailable. Your saved profiles have not been changed. Please retry." });
  }


  return {
    req: opts.req,
    res: opts.res,
    user,
    authError,
  };
}
