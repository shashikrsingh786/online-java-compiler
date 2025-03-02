// Java-specific hint provider for CodeMirror
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("codemirror"), require("codemirror/mode/clike/clike"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["codemirror", "codemirror/mode/clike/clike"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
  "use strict";

  const javaKeywords = [
    "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const",
    "continue", "default", "do", "double", "else", "enum", "extends", "final", "finally", "float",
    "for", "goto", "if", "implements", "import", "instanceof", "int", "interface", "long", "native",
    "new", "package", "private", "protected", "public", "return", "short", "static", "strictfp", "super",
    "switch", "synchronized", "this", "throw", "throws", "transient", "try", "void", "volatile", "while",
    "true", "false", "null"
  ];

  const javaBuiltins = [
    // Common Java classes
    "String", "System", "Scanner", "Math", "Integer", "Double", "Boolean", "Character", "Float", "Object",
    "Exception", "RuntimeException", "Throwable", "Error", "Class", "Runnable", "Thread", "Comparable",
    "Cloneable", "Iterable", "Collection", "List", "Set", "Map", "ArrayList", "LinkedList", "HashSet",
    "HashMap", "TreeMap", "StringBuilder", "StringBuffer"
  ];

  const javaMethods = {
    "System": ["out.print", "out.println", "out.printf", "in.read", "currentTimeMillis", "nanoTime", "exit"],
    "String": ["length", "charAt", "substring", "indexOf", "lastIndexOf", "startsWith", "endsWith", "trim", "toLowerCase", "toUpperCase", "equals", "equalsIgnoreCase", "compareTo", "concat", "replace", "matches", "split", "toCharArray", "format"],
    "Math": ["abs", "max", "min", "pow", "sqrt", "random", "round", "floor", "ceil", "sin", "cos", "tan", "asin", "acos", "atan", "log", "exp", "PI", "E"],
    "Integer": ["parseInt", "valueOf", "toString", "MAX_VALUE", "MIN_VALUE"],
    "ArrayList": ["add", "remove", "get", "set", "size", "clear", "isEmpty", "contains", "indexOf", "lastIndexOf", "sort", "addAll"]
  };

  const commonStatements = [
    "System.out.println();",
    "System.out.print();",
    "public static void main(String[] args) {\n    \n}",
    "for (int i = 0; i < ; i++) {\n    \n}",
    "while () {\n    \n}",
    "if () {\n    \n} else {\n    \n}",
    "try {\n    \n} catch (Exception e) {\n    \n}",
    "class  {\n    \n}",
    "Scanner scanner = new Scanner(System.in);",
    "int[] array = new int[]{};"
  ];

  const shorthandTriggers = {
    "sout": "System.out.println();",
    "souf": "System.out.printf();",
    "psvm": "public static void main(String[] args) {\n    \n}",
    "fori": "for (int i = 0; i < ; i++) {\n    \n}",
    "foreach": "for ( : ) {\n    \n}",
    "ifelse": "if () {\n    \n} else {\n    \n}"
  };

  function getCompletions(token, context, keywords, options) {
    const found = [];
    const start = token.string;
    
    function maybeAdd(str) {
      if (str.lastIndexOf(start, 0) == 0 && !found.includes(str)) found.push(str);
    }

    // Add shorthand triggers
    for (const trigger in shorthandTriggers) {
      maybeAdd(trigger);
    }

    // Add java keywords
    if (!token.type || token.type === "variable") {
      javaKeywords.forEach(maybeAdd);
      javaBuiltins.forEach(maybeAdd);
      
      // Add common statements for empty lines
      if (!start) {
        commonStatements.forEach(statement => found.push({
          text: statement, 
          displayText: statement.split('\n')[0] + '...'
        }));
      }
    }
    
    return found;
  }

  CodeMirror.registerHelper("hint", "java", function(editor, options) {
    const cur = editor.getCursor();
    const token = editor.getTokenAt(cur);
    
    // Define a simpler context object
    const context = { state: token.state };
    
    if (token.string.match(/^[\w$_]*$/) || token.string === "") {
      const completions = getCompletions(token, context, options && options.keywords, options);
      
      // Transform string completions to proper objects
      const processedCompletions = completions.map(item => {
        if (typeof item === 'string') {
          // Check if it's a shorthand trigger
          if (shorthandTriggers[item]) {
            return {
              text: shorthandTriggers[item],
              displayText: item + " → " + shorthandTriggers[item].split('\n')[0]
            };
          }
          return {text: item, displayText: item};
        }
        return item;
      });
      
      return {
        list: processedCompletions,
        from: CodeMirror.Pos(cur.line, token.start),
        to: CodeMirror.Pos(cur.line, token.end)
      };
    }
  });

  // Use a simpler implementation for mode definition
  CodeMirror.defineMIME("text/x-java", "clike");
}); 