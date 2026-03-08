import { describe, it, expect } from "vitest";
import { detectCrisis, detectLethality, detectDistress, CRISIS_KEYWORDS, CRISIS_ROOTS, CRISIS_CATEGORIES } from "./crisis-detection";

// ===== DEBUG: Find what matches false positive inputs =====
describe("DEBUG: false positive diagnostics", () => {
  const debugInputs = [
    "the method of cooking is important",
    "I need to cut the rope for the project",
    "the highway was busy today",
    "the train tracks were covered in snow",
    "the methodology was sound",
  ];

  it.each(debugInputs.map(c => [c]))('what matches "%s"', (input) => {
    const lower = (input as string).toLowerCase().replace(/[^\w\s']/g, "");
    
    const matchingKeywords = CRISIS_KEYWORDS.filter((kw: string) => 
      kw.length <= 3 ? new RegExp(`\\b${kw}\\b`).test(lower) : lower.includes(kw)
    );
    
    const matchingRoots = CRISIS_ROOTS.filter((root: string) => 
      new RegExp(`\\b${root}`).test(lower)
    );
    
    const matchingCategories: string[] = [];
    for (const cat of CRISIS_CATEGORIES) {
      const matches = cat.keywords.filter((kw: string) => lower.includes(kw));
      if (matches.length > 0) {
        matchingCategories.push(`${cat.label}: ${matches.join(", ")}`);
      }
    }
    
    console.log(`\n=== "${input}" ===`);
    console.log("Keywords:", matchingKeywords);
    console.log("Roots:", matchingRoots);
    console.log("Categories:", matchingCategories);
    
    // This test is for debugging — expect nothing to match
    expect({ keywords: matchingKeywords, roots: matchingRoots, categories: matchingCategories }).toEqual({
      keywords: [], roots: [], categories: []
    });
  });
});
