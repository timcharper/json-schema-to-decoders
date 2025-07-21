// Covers all the test cases from
// https://json-schema.org/understanding-json-schema/reference/object.html

import { createValidator } from "./util/generator";
import * as D from "decoders";

describe("JSON Schema (Object)", () => {
  test("Basic Support", () => {
    // https://json-schema.org/understanding-json-schema/reference/object.html#object
    const dec1 = createValidator({ type: "object" });
    const dec2 = createValidator("object");

    for (const dec of [dec1, dec2]) {
      expect(
        dec.decode({
          key: "value",
          another_key: "another_value",
        }).ok
      ).toBeTruthy();
      expect(
        dec.decode({
          Sun: 1.9891e30,
          Jupiter: 1.8986e27,
          Saturn: 5.6846e26,
          Neptune: 10.243e25,
          Uranus: 8.681e25,
          Earth: 5.9736e24,
          Venus: 4.8685e24,
          Mars: 6.4185e23,
          Mercury: 3.3022e23,
          Moon: 7.349e22,
          Pluto: 1.25e22,
        }).ok
      ).toBeTruthy();
      expect(dec.decode("Not an object").ok).toBeFalsy();
      expect(dec.decode(["An", "array", "not", "an", "object"]).ok).toBeFalsy();

      // NOTE: This is should actually fail (by spec), check the remark [1] in README.md
      expect(
        dec.decode({
          0.01: "cm",
          1: "m",
          1000: "km",
        }).ok
      ).toBeTruthy();
    }
  });

  test("Properties", () => {
    // https://json-schema.org/understanding-json-schema/reference/object.html#properties
    const dec1 = createValidator({
      type: "object",
      properties: {
        number: { type: "number" },
        street_name: { type: "string" },
        street_type: { enum: ["Street", "Avenue", "Boulevard"] },
      },
    });

    const v1 = { number: 1600, street_name: "Pennsylvania", street_type: "Avenue" };
    expect(dec1.decode(v1).ok).toBeTruthy();
    expect(dec1.decode(v1).value).toEqual(v1);

    expect(
      dec1.decode({ number: "1600", street_name: "Pennsylvania", street_type: "Avenue" }).ok
    ).toBeFalsy();

    const v2 = { number: 1600, street_name: "Pennsylvania" };
    expect(dec1.decode(v2).ok).toBeTruthy();
    expect(dec1.decode(v2).value).toEqual(v2);

    const v3 = {};
    expect(dec1.decode(v3).ok).toBeTruthy();
    expect(dec1.decode(v3).value).toEqual(v3);

    const v4 = {
      number: 1600,
      street_name: "Pennsylvania",
      street_type: "Avenue",
      direction: "NW",
    };
    expect(dec1.decode(v4).ok).toBeTruthy();
    expect(dec1.decode(v4).value).toEqual(v4);
  });

  test("Additional Properties", () => {
    // https://json-schema.org/understanding-json-schema/reference/object.html#additional-properties
    const dec1 = createValidator({
      type: "object",
      properties: {
        number: { type: "number" },
        street_name: { type: "string" },
        street_type: { enum: ["Street", "Avenue", "Boulevard"] },
      },
      additionalProperties: false,
    });

    const v1 = { number: 1600, street_name: "Pennsylvania", street_type: "Avenue" };
    expect(dec1.decode(v1).ok).toBeTruthy();
    expect(dec1.decode(v1).value).toEqual(v1);

    expect(
      dec1.decode({
        number: 1600,
        street_name: "Pennsylvania",
        street_type: "Avenue",
        direction: "NW",
      }).ok
    ).toBeFalsy();

    ////////////////////////////////////////////////////////////////////////////////

    const dec2 = createValidator({
      type: "object",
      properties: {
        number: { type: "number" },
        street_name: { type: "string" },
        street_type: { enum: ["Street", "Avenue", "Boulevard"] },
      },
      additionalProperties: { type: "string" },
    });

    const v2 = { number: 1600, street_name: "Pennsylvania", street_type: "Avenue" };
    expect(dec2.decode(v2).ok).toBeTruthy();
    expect(dec2.decode(v2).value).toEqual(v2);

    const v3 = {
      number: 1600,
      street_name: "Pennsylvania",
      street_type: "Avenue",
      direction: "NW",
    };
    expect(dec2.decode(v3).ok).toBeTruthy();
    expect(dec2.decode(v3).value).toEqual(v3);

    expect(
      dec2.decode({
        number: 1600,
        street_name: "Pennsylvania",
        street_type: "Avenue",
        office_number: 201,
      }).ok
    ).toBeFalsy();

    ////////////////////////////////////////////////////////////////////////////////

    const dec3 = createValidator({
      type: "object",
      additionalProperties: {
        enum: ["a", "b"],
      },
    });

    const v4 = { something: "a", another: "b" };
    expect(dec3.decode(v4).ok).toBeTruthy();
    expect(dec3.decode(v4).value).toEqual(v4);

    expect(
      dec3.decode({
        something: "a",
        another: "b",
        invalid: "c",
      }).ok
    ).toBeFalsy();
  });

  test("Size", () => {
    // https://json-schema.org/understanding-json-schema/reference/object.html#size
    const dec1 = createValidator({
      type: "object",
      minProperties: 2,
      maxProperties: 3,
    });

    expect(dec1.decode({}).ok).toBeFalsy();
    expect(dec1.decode({ a: 0 }).ok).toBeFalsy();
    expect(dec1.decode({ a: 0, b: 1 }).ok).toBeTruthy();
    expect(dec1.decode({ a: 0, b: 1, c: 2 }).ok).toBeTruthy();
    expect(dec1.decode({ a: 0, b: 1, c: 2, d: 3 }).ok).toBeFalsy();
  });

  test("Pattern Properties", () => {
    // https://json-schema.org/understanding-json-schema/reference/object.html#size
    const dec1 = createValidator({
      type: "object",
      patternProperties: {
        "^S_": { type: "string" },
        "^I_": { type: "integer" },
      },
    });

    expect(dec1.decode({ S_25: "This is a string" }).ok).toBeTruthy();
    expect(dec1.decode({ I_0: 42 }).ok).toBeTruthy();
    expect(dec1.decode({ S_0: 42 }).ok).toBeFalsy();
    expect(dec1.decode({ I_42: "This is a string" }).ok).toBeFalsy();
    expect(dec1.decode({ keyword: "value" }).ok).toBeTruthy();
  });

  test("Property Names", () => {
    // https://json-schema.org/understanding-json-schema/reference/object.html#property-names
    const dec1 = createValidator({
      type: "object",
      propertyNames: {
        pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
      },
    });

    expect(
      dec1.decode({
        _a_proper_token_001: "value",
      }).ok
    ).toBeTruthy();
    expect(
      dec1.decode({
        "001 invalid": "value",
      }).ok
    ).toBeFalsy();
  });

  test("Refs in Properties", () => {
    const dec1 = createValidator(
      {
        type: "object",
        properties: {
          name: {
            $ref: "#/remote/string",
          },
        },
      },
      {
        resolveRefPointer: (name) => `this.R.${name.split("/").pop()}`,
        globals: {
          R: {
            string: D.string,
            number: D.number,
          },
        },
      }
    );

    const v1 = { name: "works" };
    expect(dec1.decode(v1).ok).toBeTruthy();
    expect(dec1.decode(v1).value).toEqual(v1);

    expect(
      dec1.decode({
        name: 11,
      }).ok
    ).toBeFalsy();
  });

  describe("Object Policies", () => {
    describe("with additionalProperties: false", () => {
      const baseSchema = {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          age: { type: "number" as const },
        },
        additionalProperties: false,
      };
      const strictData = { name: "John", age: 30 };
      const inexactData = { name: "John", age: 30, city: "NYC" };

      test("strict policy (default) - rejects extra properties", () => {
        const strictDecoder = createValidator(baseSchema, {
          policies: { objects: "strict" },
        });

        expect(strictDecoder.decode(strictData).ok).toBeTruthy();
        expect(strictDecoder.decode(strictData).value).toEqual(strictData);

        // rejects - too wide
        expect(strictDecoder.decode(inexactData).ok).toBeFalsy();
      });

      test("default behavior (should be strict) - rejects extra properties", () => {
        const defaultDecoder = createValidator(baseSchema);
        // rejects - too wide
        expect(defaultDecoder.decode(inexactData).ok).toBeFalsy();
      });

      test("loose policy - allows extra properties but discards them", () => {
        const looseDecoder = createValidator(baseSchema, {
          policies: { objects: "loose" },
        });

        expect(looseDecoder.decode(strictData).ok).toBeTruthy();
        expect(looseDecoder.decode(strictData).value).toEqual(strictData);

        expect(looseDecoder.decode(inexactData).ok).toBeTruthy();
        expect(looseDecoder.decode(inexactData).value).toEqual(strictData); // Extra property discarded
      });

      test("inexact policy - allows extra properties and keeps them", () => {
        const inexactDecoder = createValidator(baseSchema, {
          policies: { objects: "inexact" },
        });

        expect(inexactDecoder.decode(strictData).ok).toBeTruthy();
        expect(inexactDecoder.decode(strictData).value).toEqual(strictData);

        expect(inexactDecoder.decode(inexactData).ok).toBeTruthy();
        expect(inexactDecoder.decode(inexactData).value).toEqual(inexactData); // Extra property kept
      });
    });

    describe("with additionalProperties: true", () => {
      const schemaWithAdditionalProps = {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
        },
        additionalProperties: true,
      };

      test("policies should not affect behavior when additionalProperties is true", () => {
        // When additionalProperties is true, policy should not matter - always use inexact
        const strictDecoder = createValidator(schemaWithAdditionalProps, {
          policies: { objects: "strict" },
        });

        const looseDecoder = createValidator(schemaWithAdditionalProps, {
          policies: { objects: "loose" },
        });

        const inexactDecoder = createValidator(schemaWithAdditionalProps, {
          policies: { objects: "inexact" },
        });

        const dataWithExtra = { name: "John", city: "NYC" };

        // All should behave the same (inexact) when additionalProperties is true
        expect(strictDecoder.decode(dataWithExtra).ok).toBeTruthy();
        expect(strictDecoder.decode(dataWithExtra).value).toEqual(dataWithExtra);

        expect(looseDecoder.decode(dataWithExtra).ok).toBeTruthy();
        expect(looseDecoder.decode(dataWithExtra).value).toEqual(dataWithExtra);

        expect(inexactDecoder.decode(dataWithExtra).ok).toBeTruthy();
        expect(inexactDecoder.decode(dataWithExtra).value).toEqual(dataWithExtra);
      });
    });
  });
});
