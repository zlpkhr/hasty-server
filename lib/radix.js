/*
 * The radix tree will be used as the foundation for the future HTTP routing algorithm.
 * Its compact structure and efficient prefix-based lookups make it well-suited to handle
 * routing tables with minimal memory overhead, ensuring scalability and performance as
 * the system grows.
 *
 * For more details on radix trees, see:
 * https://en.wikipedia.org/wiki/Radix_tree
 */

class RadixTreeNode {
  constructor(value = "") {
    this.value = value;
    this.children = new Map();
    this.isEndOfWord = false;
  }
}

class RadixTree {
  constructor() {
    this.root = new RadixTreeNode();
  }

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

  _getCommonPrefix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.slice(0, i);
  }

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
