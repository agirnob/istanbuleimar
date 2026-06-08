import { describe, it, expect } from "vitest";
import { getMunicipality, getDefaultMunicipality } from "./turkishFetch";

describe("turkishFetch utilities", () => {
  describe("getMunicipality", () => {
    it("should find municipality by exact key", () => {
      const result = getMunicipality("eyupsultan");
      expect(result).toBeDefined();
      expect(result?.key).toBe("eyupsultan");
    });

    it("should handle Turkish locale case insensitivity", () => {
      const result1 = getMunicipality("Eyupsultan");
      const result2 = getMunicipality("EYUPSULTAN");
      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should return undefined for unknown municipality", () => {
      expect(getMunicipality("unknown_municipality")).toBeUndefined();
    });

    it("should find pendik municipality", () => {
      const result = getMunicipality("pendik");
      expect(result).toBeDefined();
      expect(result?.key).toBe("pendik");
    });

    it("should find gaziosmanpasa municipality", () => {
      const result = getMunicipality("gaziosmanpasa");
      expect(result).toBeDefined();
      expect(result?.key).toBe("gaziosmanpasa");
    });
  });

  describe("getDefaultMunicipality", () => {
    it("should return eyupsultan as default", () => {
      const defaultMuni = getDefaultMunicipality();
      expect(defaultMuni.key).toBe("eyupsultan");
    });
  });
});
