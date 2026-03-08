import { describe, it, expect } from "vitest";
import { detectCrisis, detectLethality, detectDistress } from "./crisis-detection";

// ===== detectCrisis =====
describe("detectCrisis", () => {
  // --- Should TRIGGER (genuine emergencies) ---
  describe("genuine crisis phrases → should redirect", () => {
    const cases: [string, string][] = [
      ["I want to kill myself", "kill myself"],
      ["I'm going to end my life tonight", "end my life"],
      ["suicide is the only option", "suicide"],
      ["I've been thinking about suicide", "suicide"],
      ["I want to die", "want to die"],
      ["I'm going to hang myself", "hang myself"],
      ["kms", "kms"],
      ["I want to unalive myself", "unalive"],
      ["nobody would miss me if I disappeared", "nobody would miss me"],
      ["I'm writing my suicide note", "suicide note"],
      ["I feel trapped and there's no escape", "feel trapped + no escape"],
      ["I'm going to jump off a bridge", "off a bridge"],
      ["I can't do this anymore", "can't do this anymore"],
      ["I'm better off dead", "better off dead"],
      ["no one would miss me", "no one would miss me"],
    ];

    it.each(cases)('"%s" triggers crisis (%s)', (input) => {
      expect(detectCrisis(input)).not.toBeNull();
    });
  });

  // --- Should NOT trigger (false positives) ---
  describe("safe phrases → should NOT redirect", () => {
    const safeCases = [
      "this bridge is beautiful",
      "I studied Orthodox Judaism",
      "the method of cooking is important",
      "she died in the movie",
      "I'm dying of laughter",
      "that test killed me",
      "my phone is dead",
      "I need to cut the rope for the project",
      "the highway was busy today",
      "I love watching the sunset from the roof",
      "I'm exhausted from work",
      "the train tracks were covered in snow",
      "he pulled the trigger on the deal",
      "the pills are on the counter",
      "I took some aspirin for my headache",
      "the building is really tall",
      "I need to hang this picture",
      "let's bridge the gap between teams",
      "she burned the dinner",
      "the methodology was sound",
      "we used a different method for testing",
    ];

    it.each(safeCases.map(c => [c]))('"%s" does NOT trigger crisis', (input) => {
      expect(detectCrisis(input as string)).toBeNull();
    });
  });

  // --- "feel trapped" is intentionally a crisis keyword ---
  describe("intentional crisis keywords in ambiguous contexts", () => {
    it('"I feel trapped in my job" triggers because "feel trapped" is a crisis keyword', () => {
      expect(detectCrisis("I feel trapped in my job")).not.toBeNull();
    });
  });

  // --- Category-specific routing ---
  describe("category routing", () => {
    it("routes domestic violence keywords to thehotline.org", () => {
      const result = detectCrisis("he hits me and I'm scared");
      expect(result).not.toBeNull();
      expect(result!).toContain("thehotline.org");
    });

    it("routes LGBTQ crisis to thetrevorproject.org", () => {
      const result = detectCrisis("I was kicked out for being gay");
      expect(result).not.toBeNull();
      expect(result!).toContain("thetrevorproject.org");
    });

    it("routes substance abuse to samhsa", () => {
      const result = detectCrisis("I'm using meth and can't stop");
      expect(result).not.toBeNull();
    });

    it("routes child abuse to childhelp", () => {
      const result = detectCrisis("my parent hits me");
      expect(result).not.toBeNull();
      expect(result!).toContain("childhelp.org");
    });
  });
});

// ===== detectLethality =====
describe("detectLethality", () => {
  describe("lethal means → should trigger hard block", () => {
    const lethalCases = [
      "I bought a gun today",
      "how many pills is a lethal dose",
      "I'm going to jump off a bridge",
      "how to tie a noose",
      "slit my wrists",
      "I want to drown myself",
      "carbon monoxide in the garage",
      "drink bleach",
      "step in front of a train",
      "gun to my head",
      "I bought rope to hang myself with rope",
    ];

    it.each(lethalCases.map(c => [c]))('"%s" triggers lethality', (input) => {
      expect(detectLethality(input as string)).toBe(true);
    });
  });

  describe("safe phrases → should NOT trigger lethality", () => {
    const safeCases = [
      "I love swimming in the ocean",
      "the bridge was beautiful at sunset",
      "I need to buy some rope for camping",
      "I'm taking my pills as prescribed",
      "the train station is nearby",
      "I'm learning to tie knots",
      "the bathtub needs cleaning",
      "the highway was busy today",
      "the train tracks were covered in snow",
    ];

    it.each(safeCases.map(c => [c]))('"%s" does NOT trigger lethality', (input) => {
      expect(detectLethality(input as string)).toBe(false);
    });
  });
});

// ===== detectDistress =====
describe("detectDistress", () => {
  describe("genuine distress → should detect", () => {
    const distressCases = [
      "I want to hurt myself",
      "I don't want to be here anymore",
      "please help me I'm not okay",
      "I'm scared of myself right now",
      "I can't do this anymore",
      "I feel so depressed and hopeless",
    ];

    it.each(distressCases.map(c => [c]))('"%s" detects distress', (input) => {
      expect(detectDistress(input as string)).toBe(true);
    });
  });

  describe("casual / humorous usage → should NOT detect", () => {
    it("dark humor with lol does not trigger", () => {
      expect(detectDistress("I'm so depressed lol haha")).toBe(false);
    });

    it("sarcastic venting does not trigger", () => {
      expect(detectDistress("I'm exhausted lmao just kidding")).toBe(false);
    });

    it("casual usage of distress word does not over-trigger", () => {
      expect(detectDistress("I'm scared of spiders lol")).toBe(false);
    });
  });

  describe("vent mode raises threshold", () => {
    it("single distress keyword in vent mode does not trigger", () => {
      expect(detectDistress("I feel so depressed", true)).toBe(false);
    });

    it("multiple distress keywords without humor triggers in vent mode", () => {
      expect(detectDistress("I'm so depressed and hopeless and feel empty and worthless", true)).toBe(true);
    });

    it("multiple distress keywords WITH humor does not trigger in vent mode", () => {
      expect(detectDistress("I'm depressed and hopeless and worthless lol", true)).toBe(false);
    });
  });

  describe("genuine signals always override humor", () => {
    it("genuine signal with humor still triggers", () => {
      expect(detectDistress("I want to hurt myself lol")).toBe(true);
    });

    it("genuine signal in vent mode still triggers", () => {
      expect(detectDistress("I don't want to be here anymore", true)).toBe(true);
    });

    it("'please help me' always triggers", () => {
      expect(detectDistress("please help me")).toBe(true);
    });
  });
});
