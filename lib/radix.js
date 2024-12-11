/**
 * Represents a single node in a radix tree.
 */
class RadixTreeNode {
  /**
   * Constructs a new RadixTreeNode.
   * @param {string} [value=""] - The value associated with this node.
   */
  constructor(value = "") {
    this.value = value; // The string value of this node.
    this.children = new Map(); // Map of child nodes (key: string, value: RadixTreeNode).
    this.isEndOfWord = false; // Indicates whether this node marks the end of a word.
  }
}

/**
 * Implements a radix tree for efficient prefix-based string storage and lookup.
 */
class RadixTree {
  /**
   * Constructs a new RadixTree.
   */
  constructor() {
    this.root = new RadixTreeNode(); // The root node of the radix tree.
  }

  /**
   * Inserts a word into the radix tree.
   * @param {string} word - The word to insert into the tree.
   */
  insert(word) {
    let currentNode = this.root;
    while (word.length > 0) {
      let foundChild = false;

      for (let [key, child] of currentNode.children) {
        let commonPrefix = this._getCommonPrefix(word, key);

        if (commonPrefix.length > 0) {
          foundChild = true;

          if (commonPrefix === key) {
            currentNode = child;
            word = word.slice(commonPrefix.length);
          } else {
            // Split the node
            let remainingKey = key.slice(commonPrefix.length);
            let remainingWord = word.slice(commonPrefix.length);

            const newChild = new RadixTreeNode(remainingKey);
            newChild.children = child.children;
            newChild.isEndOfWord = child.isEndOfWord;

            currentNode.children.delete(key);
            currentNode.children.set(
              commonPrefix,
              new RadixTreeNode(commonPrefix),
            );

            const prefixNode = currentNode.children.get(commonPrefix);
            prefixNode.children.set(remainingKey, newChild);
            prefixNode.children.set(
              remainingWord,
              new RadixTreeNode(remainingWord),
            );
            prefixNode.children.get(remainingWord).isEndOfWord = true;

            return;
          }
          break;
        }
      }

      if (!foundChild) {
        currentNode.children.set(word, new RadixTreeNode(word));
        currentNode.children.get(word).isEndOfWord = true;
        return;
      }
    }
    currentNode.isEndOfWord = true;
  }

  /**
   * Searches for a word in the radix tree.
   * @param {string} word - The word to search for.
   * @returns {boolean} True if the word exists in the tree, false otherwise.
   */
  search(word) {
    let currentNode = this.root;
    while (word.length > 0) {
      let foundChild = false;

      for (let [key, child] of currentNode.children) {
        if (word.startsWith(key)) {
          word = word.slice(key.length);
          currentNode = child;
          foundChild = true;
          break;
        }
      }

      if (!foundChild) return false;
    }
    return currentNode.isEndOfWord;
  }

  /**
   * Deletes a word from the radix tree.
   * @param {string} word - The word to delete.
   */
  delete(word) {
    const deleteRecursively = (node, word) => {
      if (word.length === 0) {
        if (!node.isEndOfWord) return false;
        node.isEndOfWord = false;
        return node.children.size === 0;
      }

      for (let [key, child] of node.children) {
        if (word.startsWith(key)) {
          const shouldDeleteChild = deleteRecursively(
            child,
            word.slice(key.length),
          );

          if (shouldDeleteChild) {
            node.children.delete(key);
            return node.children.size === 0 && !node.isEndOfWord;
          }

          return false;
        }
      }

      return false;
    };

    deleteRecursively(this.root, word);
  }

  /**
   * Finds the common prefix between two strings.
   * @private
   * @param {string} str1 - The first string.
   * @param {string} str2 - The second string.
   * @returns {string} The common prefix between the two strings.
   */
  _getCommonPrefix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.slice(0, i);
  }

  /**
   * Matches a prefix in the radix tree and returns the corresponding node.
   * @param {string} prefix - The prefix to match.
   * @returns {RadixTreeNode|null} The node corresponding to the prefix, or null if not found.
   */
  matchPrefix(prefix) {
    let currentNode = this.root;
    while (prefix.length > 0) {
      let foundChild = false;

      for (let [key, child] of currentNode.children) {
        if (prefix.startsWith(key)) {
          prefix = prefix.slice(key.length);
          currentNode = child;
          foundChild = true;
          break;
        }
      }

      if (!foundChild) return null;
    }
    return currentNode;
  }
}

module.exports = {
  RadixTreeNode,
  RadixTree,
};
