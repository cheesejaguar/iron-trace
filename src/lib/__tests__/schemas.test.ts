import { describe, it, expect } from "vitest";
import { RawOrefAlertSchema, OrefAlertsResponseSchema } from "../schemas";

describe("schemas", () => {
  describe("RawOrefAlertSchema", () => {
    it("parses a valid alert", () => {
      const result = RawOrefAlertSchema.parse({
        id: "123",
        cat: "1",
        title: "Test",
        data: ["Region A", "Region B"],
        desc: "Description",
      });
      expect(result.id).toBe("123");
      expect(result.data).toEqual(["Region A", "Region B"]);
    });

    it("defaults desc to empty string", () => {
      const result = RawOrefAlertSchema.parse({
        id: "1",
        cat: "1",
        title: "T",
        data: [],
      });
      expect(result.desc).toBe("");
    });

    it("rejects missing required fields", () => {
      expect(() => RawOrefAlertSchema.parse({ id: "1" })).toThrow();
      expect(() => RawOrefAlertSchema.parse({})).toThrow();
    });

    it("rejects wrong data type", () => {
      expect(() =>
        RawOrefAlertSchema.parse({
          id: "1",
          cat: "1",
          title: "T",
          data: "not an array",
        })
      ).toThrow();
    });
  });

  describe("OrefAlertsResponseSchema", () => {
    it("parses array of alerts", () => {
      const result = OrefAlertsResponseSchema.parse([
        { id: "1", cat: "1", title: "T", data: [], desc: "" },
        { id: "2", cat: "2", title: "T", data: ["A"], desc: "" },
      ]);
      expect(result).toHaveLength(2);
    });

    it("transforms empty string to empty array", () => {
      const result = OrefAlertsResponseSchema.parse("");
      expect(result).toEqual([]);
    });

    it("transforms null to empty array", () => {
      const result = OrefAlertsResponseSchema.parse(null);
      expect(result).toEqual([]);
    });

    it("parses empty array", () => {
      const result = OrefAlertsResponseSchema.parse([]);
      expect(result).toEqual([]);
    });
  });
});
