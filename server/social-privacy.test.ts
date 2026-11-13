import { describe, expect, it } from "vitest";
import { deleteLovedOne, listLovedOnes, upsertLovedOne } from "./db";

describe("private loved-one records", () => {
  it("isolates each account's records and rejects cross-account edits and deletes", async () => {
    const data = {
      name: "Fixture relative", relationship: "friend" as const,
      location: "Test location", latitude: 0, longitude: 0,
      timezone: "UTC", date: "2000-01-01", time: "12:00",
    };
    const alice = await upsertLovedOne("fixture-alice", data);
    expect((await listLovedOnes("fixture-alice")).some(row => row.id === alice.id)).toBe(true);
    expect((await listLovedOnes("fixture-bob")).some(row => row.id === alice.id)).toBe(false);
    expect(await deleteLovedOne("fixture-bob", alice.id)).toBe(false);
    const bob = await upsertLovedOne("fixture-bob", { ...data, id: alice.id, name: "Attempted overwrite" });
    expect(bob.id).not.toBe(alice.id);
    expect((await listLovedOnes("fixture-alice")).find(row => row.id === alice.id)?.name).toBe(data.name);
    expect(await deleteLovedOne("fixture-alice", alice.id)).toBe(true);
    expect(await deleteLovedOne("fixture-bob", bob.id)).toBe(true);
  });
});
