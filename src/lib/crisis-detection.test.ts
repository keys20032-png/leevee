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

    // LGBTQ identity terms should NOT trigger crisis when used casually
    it('"any LGBTQ news lately?" does NOT trigger crisis', () => {
      expect(detectCrisis("any LGBTQ news lately?")).toBeNull();
    });
    it('"tell me about gay rights" does NOT trigger crisis', () => {
      expect(detectCrisis("tell me about gay rights")).toBeNull();
    });
    it('"trans representation in media" does NOT trigger crisis', () => {
      expect(detectCrisis("trans representation in media")).toBeNull();
    });
    it('"queer history month" does NOT trigger crisis', () => {
      expect(detectCrisis("queer history month")).toBeNull();
    });
  });

  // --- Humor / slang should NOT trigger ---
  describe("humor and slang → should NOT redirect", () => {
    const humorCases = [
      "bruh I'm dying this is so funny",
      "lmao this test killed me 💀",
      "I'm so dead rn haha",
      "this homework is killing me bruh",
      "I want to die laughing",
      "the suspense is killing me ngl",
      "that joke killed me I died laughing",
      "this food is to die for",
      "I could kill for some pizza",
      "this movie is a total trainwreck",
      "you're killing the vibe",
      "that outfit is killer",
      "she slayed that performance",
      "I'm dead set on finishing this project",
      "he murdered that guitar solo",
      "I bombed the interview",
      "traffic was murder today",
    ];

    it.each(humorCases.map(c => [c]))('"%s" does NOT trigger crisis', (input) => {
      expect(detectCrisis(input as string)).toBeNull();
    });
  });

  // --- Genuine crisis MUST still trigger even with safe-phrase substrings ---
  describe("genuine crisis with safe-phrase substring → should still redirect", () => {
    it('"ending my life" alone triggers', () => {
      expect(detectCrisis("ending my life")).not.toBeNull();
    });
    it('"dead serious about ending my life" triggers', () => {
      expect(detectCrisis("I am dead serious about ending my life")).not.toBeNull();
    });
    it('"dead tired + kill myself" triggers', () => {
      expect(detectCrisis("I am dead tired of living and want to kill myself")).not.toBeNull();
    });
    it('"dying to + end it all" triggers', () => {
      expect(detectCrisis("I am dying to end it all")).not.toBeNull();
    });
    it('"dead serious + want to die" triggers', () => {
      expect(detectCrisis("I am dead serious I want to die")).not.toBeNull();
    });
  });

  // --- Genuine crisis with humor markers MUST still trigger ---
  describe("genuine crisis + humor markers → should still redirect", () => {
    const cases: [string, string][] = [
      ["I want to kill myself lol just kidding", "kill myself + lol"],
      ["kms lmao", "kms + lmao"],
      ["I want to end my life haha", "end my life + haha"],
      ["suicide is the answer lol", "suicide + lol"],
      ["gonna hang myself bruh", "hang myself + bruh"],
    ];

    it.each(cases)('"%s" triggers crisis (%s)', (input) => {
      expect(detectCrisis(input)).not.toBeNull();
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
      "I got the rope ready",
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
      "tell me about gun control laws",
      "what's the latest on gun violence legislation",
      "the noose was used in the magic trick",
      "top gun was a great movie",
      "she plays a heroine in the story",
      "this razor blade is for shaving",
    ];

    it.each(safeCases.map(c => [c]))('"%s" does NOT trigger lethality', (input) => {
      expect(detectLethality(input as string)).toBe(false);
    });
  });

  // --- False positive prevention: common queries that should NEVER trigger ---
  describe("educational/news queries → should NOT trigger lethality", () => {
    const educationalCases = [
      "what are the gun laws in Texas",
      "history of the noose in American justice",
      "buy me a box cutter from the store",
      "the sleeping pills help me rest",
      "antifreeze keeps the car running in winter",
    ];

    it.each(educationalCases.map(c => [c]))('"%s" does NOT trigger lethality', (input) => {
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
    const genuineWithHumor: [string, boolean][] = [
      ["I want to hurt myself lol", false],
      ["I want to hurt myself lol", true],
      ["I don't want to be here anymore haha", false],
      ["I don't want to be here anymore bruh", true],
      ["please help me lmao", false],
      ["I'm not okay lol just kidding", false],
      ["I'm scared of myself rn lol", false],
      ["I can't do this anymore bruh fr", false],
      ["I can't do this anymore ngl", true],
      ["please help me I need help 💀", false],
      ["I don't feel safe lmao", false],
    ];

    it.each(genuineWithHumor)(
      '"%s" (ventMode=%s) still detects distress',
      (input, ventMode) => {
        expect(detectDistress(input, ventMode)).toBe(true);
      }
    );
  });
});
