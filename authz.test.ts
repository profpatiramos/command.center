import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function context(user?: TrpcContext["user"]): TrpcContext {
  return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: { clearCookie: () => undefined } as TrpcContext["res"] };
}

describe("authorization", () => {
  it("rejects personal data without an authenticated user", async () => {
    await expect(appRouter.createCaller(context()).personal.favorites()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects admin mutations for regular users", async () => {
    await expect(appRouter.createCaller(context({ id: 7, openId: "regular", name: "Regular", email: null, loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() })).admin.setFeatured({ id: 1, featured: true })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
