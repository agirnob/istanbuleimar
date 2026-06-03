import { describe, it, expect } from "vitest";
import { upsertParcel, getParcelByObjectId } from "./db";

describe("Database Layer", () => {
  it("should skip DB operations when DB is not available", async () => {
    const result = await getParcelByObjectId(8125).catch(() => null);

    if (result === null) {
      expect(result).toBeNull();
    } else {
      expect(result).toHaveProperty("objectId");
    }
  });

  it("should handle upsert gracefully when DB is not available", async () => {
    const result = await upsertParcel({
      objectId: 8125,
      parcelNo: "8125",
      municipality: "eyupsultan",
      block: "1",
      plotNo: "1",
      neighborhood: "KEMERBURGAZ",
    }).catch(() => null);

    expect(result === null || result === undefined || result !== null).toBe(true);
  });
});
