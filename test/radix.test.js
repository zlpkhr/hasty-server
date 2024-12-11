const { RadixTree } = require("../lib/radix");

describe("RadixTree", () => {
  let radixTree;

  beforeEach(() => {
    radixTree = new RadixTree();
  });

  test("inserts and searches for a word", () => {
    radixTree.insert("test");
    expect(radixTree.search("test")).toBe(true);
  });

  test("returns false for non-existent word", () => {
    radixTree.insert("test");
    expect(radixTree.search("testing")).toBe(false);
  });

  test("inserts and searches for multiple words with common prefixes", () => {
    radixTree.insert("test");
    radixTree.insert("tester");
    radixTree.insert("testing");

    expect(radixTree.search("test")).toBe(true);
    expect(radixTree.search("tester")).toBe(true);
    expect(radixTree.search("testing")).toBe(true);
  });

  test("deletes a word and ensures it is not found", () => {
    radixTree.insert("test");
    radixTree.insert("tester");

    radixTree.delete("tester");

    expect(radixTree.search("test")).toBe(true);
    expect(radixTree.search("tester")).toBe(false);
  });

  test("deletes a word without affecting others with common prefix", () => {
    radixTree.insert("test");
    radixTree.insert("tester");

    radixTree.delete("test");

    expect(radixTree.search("test")).toBe(false);
    expect(radixTree.search("tester")).toBe(true);
  });

  test("handles edge case of deleting non-existent word", () => {
    radixTree.insert("test");

    radixTree.delete("testing");

    expect(radixTree.search("test")).toBe(true);
  });

  test("matches prefix correctly", () => {
    radixTree.insert("test");
    radixTree.insert("tester");
    radixTree.insert("testing");

    const prefixNode = radixTree.matchPrefix("test");
    expect(prefixNode).not.toBeNull();
    expect(prefixNode.isEndOfWord).toBe(true);
  });

  test("returns null for non-existent prefix", () => {
    radixTree.insert("test");

    const prefixNode = radixTree.matchPrefix("tesla");
    expect(prefixNode).toBeNull();
  });
});
