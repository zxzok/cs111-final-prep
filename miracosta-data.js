(() => {
  "use strict";

  const sources = [
    {
      id: "catalog",
      family: "Official course scope",
      title: "MiraCosta College Catalog — CS 111",
      url: "https://catalog.miracosta.edu/disciplines/computerscience/",
      confidence: "high",
      note: "Defines the official CS 111 scope: Java fundamentals, control structures, data, I/O, methods, classes, testing, and basic inheritance.",
    },
    {
      id: "org",
      family: "Official course organization",
      title: "MiraCosta College CS111 on GitHub",
      url: "https://github.com/MiraCosta-College-CS111",
      confidence: "high",
      note: "Instructor-managed public organization containing practice repositories, lab templates, tests, and unit deliverables.",
    },
    {
      id: "business-card",
      family: "Official practice",
      title: "BusinessCard — Topic 1 Practice",
      url: "https://github.com/MiraCosta-College-CS111/BusinessCard",
      confidence: "high",
      note: "Primitive data, variable declarations, println, and exact console output.",
    },
    {
      id: "topic-03",
      family: "Official practice",
      title: "Topic 03 Practice",
      url: "https://github.com/MiraCosta-College-CS111/Topic-03-Practice",
      confidence: "high",
      note: "Arithmetic, integer and floating-point division, limits, and modulus.",
    },
    {
      id: "topic-04",
      family: "Official practice",
      title: "Topic 04 Practice",
      url: "https://github.com/MiraCosta-College-CS111/Topic-04-Practice",
      confidence: "high",
      note: "printf, conversion characters, flags, width, precision, and numeric formatting.",
    },
    {
      id: "topic-05",
      family: "Official practice",
      title: "Topic 5 Practice",
      url: "https://github.com/MiraCosta-College-CS111/Topic-5-Practice",
      confidence: "high",
      note: "Static methods, static variables, local variables, and scope.",
    },
    {
      id: "branching",
      family: "Official practice",
      title: "Practice Branching",
      url: "https://github.com/MiraCosta-College-CS111/Practice-Branching",
      confidence: "high",
      note: "if, if-else, logical operators, nested decisions, else-if chains, and switch.",
    },
    {
      id: "labs-03-09",
      family: "Official lab",
      title: "MiraCosta Labs 03–09",
      url: "https://github.com/MiraCosta-College-CS111/L07-DACA-Parameters-and-Passing",
      confidence: "high",
      note: "Data manipulation, typecasting, formatted output, static methods, parameters, return values, documentation, and unit tests.",
    },
    {
      id: "labs-11-13",
      family: "Official lab",
      title: "MiraCosta Labs 11–13",
      url: "https://github.com/MiraCosta-College-CS111/L12-Quipu-Repetition-Looping",
      confidence: "high",
      note: "for and while loops, digit extraction, repeated simulation, validation, and bar-graph algorithms.",
    },
    {
      id: "labs-14-15",
      family: "Official lab",
      title: "MiraCosta Labs 14–15",
      url: "https://github.com/MiraCosta-College-CS111/L15-Selection-Sort-Array-Methods",
      confidence: "high",
      note: "Array declaration, indexed traversal, array methods, swap, reverse, minimum search, and selection sort.",
    },
    {
      id: "labs-16-19",
      family: "Official lab",
      title: "MiraCosta Labs 16–19",
      url: "https://github.com/MiraCosta-College-CS111/L17-DACA-Designing-Classes",
      confidence: "high",
      note: "Encapsulation, getters/setters, toString, equals, constructors, object arrays, Scanner, and input validation.",
    },
    {
      id: "spring-2026",
      family: "Current public template",
      title: "CS111-1258 Spring 2026 GitHub Classroom",
      url: "https://github.com/CS111-1258-Spring2026",
      confidence: "high",
      note: "Confirms that the official lab sequence was still in active public use in Spring 2026.",
    },
    {
      id: "historical-quiz",
      family: "Historical quiz style",
      title: "SP21 CS 111 Week 2 Quiz — Public Preview",
      url: "https://www.coursehero.com/file/91588084/combinepdfpdf/",
      confidence: "medium",
      note: "Public preview of a 2021 Canvas quiz covering Java files, output, escape sequences, comments, and program structure.",
    },
    {
      id: "historical-guides",
      family: "Historical review guide",
      title: "MiraCosta CS 111 Test-Prep Index",
      url: "https://www.coursehero.com/sitemap/schools/4327-MiraCosta-College/courses/11093865-CS111/",
      confidence: "medium",
      note: "Public previews of 2019 midterm and final review guides; used only for topic emphasis, not copied answers.",
    },
    {
      id: "historical-transcript",
      family: "Student-transcribed review",
      title: "CS111 Midterm Flashcards — 113 Terms",
      url: "https://quizlet.com/852835034/cs111-midterm-flash-cards/",
      confidence: "medium",
      note: "A user-created set that closely matches the public historical Week 2 quiz; all derived answers were independently checked.",
    },
  ];

  const questions = [];
  let nextId = 1001;

  function add(topicId, difficulty, sourceId, prompt, code, choices, answer, explanation) {
    const source = sources.find((item) => item.id === sourceId);
    const rotation = (nextId - 1001) % choices.length;
    const rotatedChoices = choices.slice(rotation).concat(choices.slice(0, rotation));
    const originalAnswerIndex = answer.charCodeAt(0) - 65;
    const rotatedAnswerIndex =
      (originalAnswerIndex - rotation + choices.length) % choices.length;
    questions.push({
      id: nextId,
      topicId,
      topic: `T${topicId} MiraCosta`,
      type: "mc",
      difficulty,
      sourceStyle: "miracosta-public",
      sourceFamily: source.family,
      sourceTitle: source.title,
      sourceUrl: source.url,
      sourceConfidence: source.confidence,
      prompt,
      code,
      choices: rotatedChoices,
      answer: String.fromCharCode(65 + rotatedAnswerIndex),
      explanation,
    });
    nextId += 1;
  }

  // Topic 1 — Introduction to CS
  add(1, "foundational", "historical-quiz",
    "Which file extension identifies Java source code?",
    null,
    [".java", ".class", ".jar", ".javac"],
    "A",
    "A programmer writes source code in a .java file. javac translates it into bytecode stored in one or more .class files.");
  add(1, "foundational", "historical-transcript",
    "What is the role of the main method in a basic Java application?",
    null,
    ["It is the program entry point", "It converts source code into bytecode", "It declares every class field", "It catches every runtime exception"],
    "A",
    "The JVM begins a standard console application by invoking public static void main(String[] args).");
  add(1, "standard", "historical-quiz",
    "A source file contains public class SpartanBanner. Which filename is required?",
    null,
    ["SpartanBanner.java", "spartanbanner.java", "SpartanBanner.class", "Main.java"],
    "A",
    "A public top-level class must be stored in a .java file whose base name exactly matches the case-sensitive class name.");
  add(1, "standard", "historical-transcript",
    "Which statement about Java comments is correct?",
    null,
    ["The compiler ignores comments when producing bytecode", "A // comment continues until the next semicolon", "Every /* comment must fit on one line", "Comments are printed automatically at runtime"],
    "A",
    "// begins a single-line comment and /* ... */ can span lines. Comments document source code but do not become executable instructions.");
  add(1, "challenge", "historical-guides",
    "A program compiles and runs, but it calculates tuition with subtraction instead of addition. What kind of defect is this?",
    null,
    ["Logic error", "Syntax error", "Linker error", "File-naming error"],
    "A",
    "The code is legal Java, so compilation succeeds. The algorithm produces the wrong result, which makes this a logic error.");
  add(1, "challenge", "historical-quiz",
    "Which declaration is a valid Java application entry point that the JVM can call directly?",
    null,
    ["public static void main(String[] args)", "public void main(String args)", "static int main(String[] args)", "private static void Main(String[] args)"],
    "A",
    "The conventional entry point must be public, static, named main with lowercase m, return void, and accept a String array.");

  // Topic 2 — Data and Basic Output
  add(2, "foundational", "business-card",
    "Which primitive type is best for storing whether a student is currently enrolled?",
    null,
    ["boolean", "String", "double", "char[]"],
    "A",
    "A boolean stores exactly the logical values true and false.");
  add(2, "foundational", "business-card",
    "Which statement prints text and then moves the cursor to the next line?",
    null,
    ["System.out.println(\"Ready\");", "System.out.printline(\"Ready\");", "System.println(\"Ready\");", "println.System.out(\"Ready\");"],
    "A",
    "System.out.println writes the value followed by the platform line separator.");
  add(2, "standard", "business-card",
    "What is printed?",
    `int section = 111;\nSystem.out.println("CS " + section + 1);`,
    ["CS 1111", "CS 112", "CS 111 1", "A compile-time error"],
    "A",
    "Evaluation proceeds left to right. Once the first + concatenates a String, the remaining operand is converted to text, producing CS 1111.");
  add(2, "standard", "business-card",
    "Which declaration stores exactly one Unicode character?",
    null,
    ["char grade = 'A';", "String grade = 'A';", "char grade = \"A\";", "character grade = 'A';"],
    "A",
    "char is a primitive type and its literal uses single quotes. String literals use double quotes.");
  add(2, "challenge", "labs-03-09",
    "Why does the literal in this declaration need the L suffix?",
    `long population = 4_500_000_000L;`,
    ["Without L, the integer literal is checked as an int and is out of range", "L converts the value to floating point", "Every long variable name must end in L", "Underscores require an L suffix"],
    "A",
    "An unsuffixed whole-number literal is treated as int when possible. This value exceeds int range, so the L marks it as a long literal.");
  add(2, "challenge", "historical-quiz",
    "What is the exact output?",
    `System.out.print("A\\nB");\nSystem.out.println("\\\\C");`,
    ["A then a new line containing B\\C", "A\\nB\\\\C on one line", "A then a new line containing BC", "A compile-time error"],
    "A",
    "\\n creates a line break. \\\\ creates one literal backslash, and println ends the second output line.");

  // Topic 3 — Data Manipulation and Typecasting
  add(3, "foundational", "topic-03",
    "What value is assigned to quotient?",
    `int quotient = 17 / 5;`,
    ["3", "3.4", "2", "4"],
    "A",
    "Both operands are int, so integer division discards the fractional part.");
  add(3, "foundational", "topic-03",
    "What value is assigned to remainder?",
    `int remainder = 17 % 5;`,
    ["2", "3", "3.4", "5"],
    "A",
    "The modulus operator returns the remainder after integer division: 17 = 3 × 5 + 2.");
  add(3, "standard", "labs-03-09",
    "Which expression calculates a non-truncated average when total and count are int variables?",
    null,
    ["(double) total / count", "(double) (total / count)", "total / count", "(int) total / count"],
    "A",
    "Casting total before division makes one operand double, so floating-point division occurs. Casting after total / count would preserve the earlier truncation.");
  add(3, "standard", "topic-03",
    "What is the value of result?",
    `int result = 8 + 12 / 3 * 2;`,
    ["16", "13", "24", "40"],
    "A",
    "Division and multiplication have equal precedence and evaluate left to right: 12 / 3 is 4, then 4 * 2 is 8, then 8 + 8 is 16.");
  add(3, "challenge", "labs-03-09",
    "What is assigned to roundedDown?",
    `double average = 85714.99;\nint roundedDown = (int) average;`,
    ["85714", "85715", "85714.99", "A runtime exception occurs"],
    "A",
    "Casting a positive double to int truncates the fractional part; it does not round to the nearest integer.");
  add(3, "challenge", "topic-03",
    "What is printed?",
    `int n = 352;\nSystem.out.println((n / 10) % 10);`,
    ["5", "3", "2", "35"],
    "A",
    "n / 10 is 35 by integer division. 35 % 10 isolates the ones digit of 35, which is the tens digit of 352.");

  // Topic 4 — Formatted Output
  add(4, "foundational", "topic-04",
    "Which printf conversion formats an integer in decimal notation?",
    null,
    ["%d", "%f", "%s", "%b"],
    "A",
    "%d formats a decimal integer. %f is for floating-point values and %s is for strings.");
  add(4, "foundational", "topic-04",
    "Which call displays 7 as 007?",
    null,
    ["System.out.printf(\"%03d\", 7);", "System.out.printf(\"%3d\", 7);", "System.out.printf(\"%.3d\", 7);", "System.out.printf(\"%d03\", 7);"],
    "A",
    "The 0 flag requests zero padding and width 3 reserves three character positions.");
  add(4, "standard", "topic-04",
    "What is printed between the brackets?",
    `System.out.printf("[%6.2f]", 3.5);`,
    ["[  3.50]", "[3.5000]", "[3.50  ]", "[   3.5]"],
    "A",
    "Precision .2 produces two digits after the decimal. Width 6 right-aligns the five-character result with one leading space.");
  add(4, "standard", "labs-03-09",
    "Which format string left-aligns a name in a field 10 characters wide?",
    null,
    ["%-10s", "%10s", "%.10s", "%-10d"],
    "A",
    "The minus flag left-aligns within the field, 10 sets the minimum width, and s formats a string.");
  add(4, "challenge", "topic-04",
    "What is the exact formatted result?",
    `String value = String.format("%,+08d", 1234);`,
    ["+001,234", "001,+234", " +1,234", "+1,23400"],
    "A",
    "The + flag shows the sign, the comma groups thousands, 0 pads with zeros, and width 8 counts every displayed character.");
  add(4, "challenge", "labs-03-09",
    "Why is %n generally preferable to \\n in portable printf format strings?",
    null,
    ["%n uses the platform-specific line separator", "%n prints a literal n", "%n flushes the output stream", "%n can only be used with integers"],
    "A",
    "%n asks Formatter for the platform line separator, while \\n is specifically the newline escape character.");

  // Topic 5 — Static Methods and Scope
  add(5, "foundational", "topic-05",
    "Which keyword allows main to call a method directly without first creating an object?",
    null,
    ["static", "final", "private", "void"],
    "A",
    "main is static, so it can directly call another static member of the same class.");
  add(5, "foundational", "labs-03-09",
    "In this method header, what is the return type?",
    `public static String banner()`,
    ["String", "banner", "static", "public"],
    "A",
    "The return type appears immediately before the method name. This method must return a String.");
  add(5, "standard", "topic-05",
    "Where can the variable count be used?",
    `public static void report() {\n    int count = 4;\n}\npublic static void main(String[] args) {\n    // use count here?\n}`,
    ["Only inside report after its declaration", "Anywhere in the class", "Only inside main", "In every static method"],
    "A",
    "count is a local variable. Its scope begins at the declaration and ends at the closing brace of report.");
  add(5, "standard", "labs-03-09",
    "Which statement correctly invokes this method?",
    `public static void displayQuote() {\n    System.out.println("Practice.");\n}`,
    ["displayQuote();", "void displayQuote();", "displayQuote;", "new displayQuote();"],
    "A",
    "A method call uses the identifier followed by parentheses and a semicolon.");
  add(5, "challenge", "topic-05",
    "What is printed?",
    `static int value = 2;\npublic static void change() {\n    int value = 7;\n    value++;\n}\npublic static void main(String[] args) {\n    change();\n    System.out.println(value);\n}`,
    ["2", "3", "7", "8"],
    "A",
    "The local value inside change shadows the class variable. Incrementing the local variable does not modify the static field.");
  add(5, "challenge", "labs-03-09",
    "Which change makes this method compile while preserving its declared return type?",
    `public static int twice(int n) {\n    int result = n * 2;\n}`,
    ["Add return result; before the closing brace", "Change result to static", "Print result instead of returning it", "Remove the parameter"],
    "A",
    "Every reachable path in a non-void method must return a value compatible with the declared return type.");

  // Topic 6 — Parameters and Passing
  add(6, "foundational", "labs-03-09",
    "In formatDate(7, 28, 2026), what are 7, 28, and 2026 called?",
    null,
    ["Arguments", "Return types", "Method identifiers", "Fields"],
    "A",
    "Values supplied at a call site are arguments. The names in the method declaration are parameters.");
  add(6, "foundational", "labs-03-09",
    "Which header matches a method that accepts month, day, and year and returns formatted text?",
    null,
    ["public static String formatDate(int month, int day, int year)", "public static void formatDate(String month, day, year)", "public String static formatDate(int month, int day, int year)", "public static int formatDate()"],
    "A",
    "The required return type is String, the three inputs are int parameters, and the modifiers precede the return type.");
  add(6, "standard", "labs-03-09",
    "What is printed?",
    `public static void addOne(int n) {\n    n++;\n}\npublic static void main(String[] args) {\n    int score = 9;\n    addOne(score);\n    System.out.println(score);\n}`,
    ["9", "10", "8", "A compile-time error"],
    "A",
    "Java passes the primitive value into a new parameter variable. Changing n does not change score.");
  add(6, "standard", "labs-03-09",
    "Which call has argument types compatible with this header?",
    `public static int calcNaturalGasEmissions(double consumption, double factor)`,
    ["calcNaturalGasEmissions(42, 5.3)", "calcNaturalGasEmissions(\"42\", 5.3)", "calcNaturalGasEmissions(42.0)", "calcNaturalGasEmissions(true, 5.3)"],
    "A",
    "An int argument can widen to double, so 42 and 5.3 are both compatible. The method requires exactly two numeric arguments.");
  add(6, "challenge", "labs-03-09",
    "What is printed?",
    `public static int transform(int x) {\n    x = x * 2;\n    return x - 1;\n}\npublic static void main(String[] args) {\n    int x = 4;\n    int y = transform(x);\n    System.out.println(x + "," + y);\n}`,
    ["4,7", "8,7", "4,8", "7,7"],
    "A",
    "The parameter receives a copy of 4. transform returns 7, while the caller's x remains 4.");
  add(6, "challenge", "labs-03-09",
    "Which design best removes duplicate date-formatting code from a larger formatCard method?",
    null,
    ["Create one formatDate method with parameters and call it for each date", "Create three identical local variables with different names", "Copy the printf statement into every branch", "Make every date a global mutable field"],
    "A",
    "A parameterized helper method centralizes one responsibility and can be reused for birthday, valid-from, and expiration dates.");

  // Topic 7 — Selection / Branching
  add(7, "foundational", "branching",
    "Which operator tests whether two int values are equal?",
    null,
    ["==", "=", "!=", "equals"],
    "A",
    "== compares primitive values. A single = performs assignment.");
  add(7, "foundational", "branching",
    "When does the else branch execute?",
    null,
    ["When the associated if condition is false", "After every if branch", "Only when the program has a syntax error", "Before the if condition is evaluated"],
    "A",
    "An if-else chooses exactly one branch: the if body for true, otherwise the else body.");
  add(7, "standard", "branching",
    "What is printed?",
    `int score = 82;\nif (score >= 90) System.out.print("A");\nelse if (score >= 80) System.out.print("B");\nelse if (score >= 70) System.out.print("C");\nelse System.out.print("D");`,
    ["B", "A", "C", "BC"],
    "A",
    "The first condition is false and the second is true. An else-if chain stops after the first selected branch.");
  add(7, "standard", "branching",
    "Which condition accepts values from 0 through 999, inclusive?",
    null,
    ["value >= 0 && value <= 999", "value >= 0 || value <= 999", "0 <= value <= 999", "value > 0 && value < 999"],
    "A",
    "Both bounds must be satisfied, so && is required. Java does not support chained relational comparisons such as 0 <= value <= 999.");
  add(7, "challenge", "branching",
    "What is printed?",
    `int option = 2;\nswitch (option) {\n  case 1: System.out.print("A");\n  case 2: System.out.print("B");\n  case 3: System.out.print("C"); break;\n  default: System.out.print("D");\n}`,
    ["BC", "B", "BCD", "ABC"],
    "A",
    "Execution begins at case 2 and falls through case 3 until break, so both B and C are printed.");
  add(7, "challenge", "branching",
    "For int x = 6, which expression is true?",
    null,
    ["(x % 2 == 0) && !(x > 10)", "(x < 0) || (x == 5)", "(x % 2 != 0) && (x < 10)", "!(x >= 6)"],
    "A",
    "6 is even and it is not greater than 10, so both sides of the && expression are true.");

  // Topic 8 — Repetition / Looping
  add(8, "foundational", "labs-11-13",
    "How many times does this loop body execute?",
    `for (int i = 0; i < 100; i++) {\n    roll();\n}`,
    ["100", "99", "101", "The loop is infinite"],
    "A",
    "i takes the values 0 through 99, which gives exactly 100 iterations.");
  add(8, "foundational", "labs-11-13",
    "Which loop is most natural when input must be requested repeatedly until it is valid?",
    null,
    ["while", "switch", "if", "try without a loop"],
    "A",
    "A while loop can repeat an unknown number of times while the input remains invalid.");
  add(8, "standard", "labs-11-13",
    "What is printed?",
    `int sum = 0;\nfor (int i = 1; i <= 4; i++) {\n    sum += i;\n}\nSystem.out.println(sum);`,
    ["10", "6", "11", "4"],
    "A",
    "The accumulator receives 1 + 2 + 3 + 4, which is 10.");
  add(8, "standard", "labs-11-13",
    "Which update guarantees progress toward ending this validation loop when value is too large?",
    `while (value > 999) {\n    // prompt and read again\n}`,
    ["Assign the newly read input back to value", "Declare a second variable also named value inside the loop", "Remove the condition", "Increment an unrelated counter only"],
    "A",
    "The variable used by the condition must be updated from new input; otherwise an initially invalid value can keep the loop running forever.");
  add(8, "challenge", "labs-11-13",
    "What is printed?",
    `int count = 0;\nfor (int i = 1; i <= 3; i++) {\n  for (int j = 0; j < i; j++) {\n    count++;\n  }\n}\nSystem.out.println(count);`,
    ["6", "3", "9", "4"],
    "A",
    "The inner loop runs 1, then 2, then 3 times. The total is 1 + 2 + 3 = 6.");
  add(8, "challenge", "labs-11-13",
    "A bar graph uses one full block for every 8 units. Which pair gives the number of full blocks and the remaining units for value?",
    null,
    ["value / 8 and value % 8", "value % 8 and value / 8", "value / 10 and value % 10", "(double) value / 8 and 8 % value"],
    "A",
    "Integer division counts complete groups of 8, while modulus gives the leftover amount.");

  // Topic 9 — Introduction to Arrays
  add(9, "foundational", "labs-14-15",
    "What is the last valid index of an array whose length is 20?",
    null,
    ["19", "20", "18", "21"],
    "A",
    "Java arrays use zero-based indexes, so valid indexes range from 0 through length - 1.");
  add(9, "foundational", "labs-14-15",
    "Which declaration creates an int array that can hold 20 values?",
    null,
    ["int[] years = new int[20];", "int years = new int(20);", "int[20] years;", "array<int> years = 20;"],
    "A",
    "new int[20] allocates an array of 20 int elements, each initially 0.");
  add(9, "standard", "labs-14-15",
    "Which loop safely visits every element of values?",
    null,
    ["for (int i = 0; i < values.length; i++)", "for (int i = 0; i <= values.length; i++)", "for (int i = 1; i < values.length; i++)", "for (int i = 0; i < values.length - 1; i += values.length)"],
    "A",
    "Starting at 0 and continuing while i is strictly less than length visits every valid index exactly once.");
  add(9, "standard", "labs-14-15",
    "After this code runs, what is years[2]?",
    `int[] years = new int[4];\nint year = 2001;\nfor (int i = 0; i < years.length; i++) {\n    years[i] = year++;\n}`,
    ["2003", "2002", "2001", "0"],
    "A",
    "The loop stores 2001, 2002, 2003, and 2004 at indexes 0 through 3.");
  add(9, "challenge", "labs-14-15",
    "What is printed?",
    `int[] a = {2, 4, 6};\nint[] b = a;\nb[1] = 9;\nSystem.out.println(a[1]);`,
    ["9", "4", "6", "A compile-time error"],
    "A",
    "The assignment copies the array reference, not the elements. a and b refer to the same array object.");
  add(9, "challenge", "labs-14-15",
    "A method receives double[] levels and int[] years and pairs elements by index. Which precondition prevents an unmatched access?",
    null,
    ["levels.length == years.length", "levels == years", "levels.length > 0 || years.length > 0", "levels[0] == years[0]"],
    "A",
    "Parallel arrays must have the same length when each index represents one paired record.");

  // Topic 10 — Advanced Looping and Arrays
  add(10, "foundational", "labs-14-15",
    "What should a swap method save before overwriting array[i]?",
    null,
    ["The original value of array[i] in a temporary variable", "The array length in a double", "A new array containing only array[j]", "The minimum value of the whole array"],
    "A",
    "Without a temporary variable, assigning array[j] into array[i] would destroy one of the two values before it can be moved.");
  add(10, "foundational", "labs-14-15",
    "What should indexOfMin(numbers, start) return?",
    null,
    ["The index of the smallest element from start through the end", "The smallest value itself", "The index of the largest element before start", "A sorted copy of the array"],
    "A",
    "The method supports selection sort by locating the position of the smallest remaining element.");
  add(10, "standard", "labs-14-15",
    "For numbers = {42, 16, 84, 12, 77, 26, 53}, what does indexOfMin(numbers, 4) return?",
    null,
    ["5", "3", "26", "4"],
    "A",
    "Starting at index 4 examines 77, 26, and 53. The minimum is 26 at index 5.");
  add(10, "standard", "labs-14-15",
    "After the first outer pass of ascending selection sort on {4, 2, 3, 1}, what is the array?",
    null,
    ["{1, 2, 3, 4}", "{2, 4, 3, 1}", "{4, 2, 1, 3}", "{1, 4, 2, 3}"],
    "A",
    "The first pass finds the minimum value 1 and swaps it with the element at index 0.");
  add(10, "challenge", "labs-14-15",
    "Which loop bound is sufficient for an in-place reverse that swaps i with length - 1 - i?",
    null,
    ["i < array.length / 2", "i < array.length", "i <= array.length", "i < array.length - 1"],
    "A",
    "Only the first half must be swapped with the second half. Continuing past the midpoint would swap every pair back.");
  add(10, "challenge", "labs-14-15",
    "Why does selection sort's outer loop usually stop at length - 1?",
    null,
    ["After placing the first length - 1 elements, the last element is already in position", "Index length - 1 is illegal", "The algorithm cannot compare the last element", "The final array element is always zero"],
    "A",
    "Once all earlier positions contain their correct minimum values, the only remaining element must occupy the final position.");

  // Topic 11 — Intro to Objects, Classes, and Strings
  add(11, "foundational", "labs-16-19",
    "What does a class definition primarily provide?",
    null,
    ["A blueprint for objects with data and behavior", "One immutable primitive value", "A loop that runs automatically", "A compiled operating system"],
    "A",
    "A class defines the fields and methods that its objects can have.");
  add(11, "foundational", "labs-16-19",
    "Which expression creates a new DACArecipient object using a no-argument constructor?",
    null,
    ["new DACArecipient()", "DACArecipient.new()", "new DACArecipient", "DACArecipient()"],
    "A",
    "The new operator invokes a constructor and returns a reference to the newly allocated object.");
  add(11, "standard", "labs-16-19",
    "Given String name = \"MiraCosta\";, what does name.length() return?",
    null,
    ["9", "10", "11", "A String object has no length method"],
    "A",
    "MiraCosta contains nine characters. String length is obtained by calling the length() method.");
  add(11, "standard", "labs-16-19",
    "Which statement calls a setter on the object student?",
    null,
    ["student.setName(\"Avery\");", "setName.student(\"Avery\");", "student.name(\"Avery\");", "Student.setName = \"Avery\";"],
    "A",
    "Instance methods are invoked through an object reference followed by dot notation.");
  add(11, "challenge", "labs-16-19",
    "What is printed?",
    `String a = new String("CS111");\nString b = new String("CS111");\nSystem.out.println(a == b);\nSystem.out.println(a.equals(b));`,
    ["false then true", "true then true", "false then false", "true then false"],
    "A",
    "a and b refer to distinct String objects, so == is false. equals compares their character sequences, so it is true.");
  add(11, "challenge", "labs-16-19",
    "An array is declared as DACArecipient[] people = new DACArecipient[2];. What does people[0] initially contain?",
    null,
    ["null", "A default DACArecipient object", "An empty String", "A compile-time error"],
    "A",
    "Allocating an object-reference array creates slots initialized to null; it does not construct the referenced objects.");

  // Topic 12 — Designing Objects and Classes
  add(12, "foundational", "labs-16-19",
    "Which access modifier best protects an instance variable from direct outside modification?",
    null,
    ["private", "public", "static", "final only"],
    "A",
    "Private fields support encapsulation by requiring outside code to use the class's methods.");
  add(12, "foundational", "labs-16-19",
    "What is the usual purpose of a getter method?",
    null,
    ["Return the current value of a field", "Construct a new class", "Delete an object", "Rename a parameter"],
    "A",
    "A getter provides controlled read access to encapsulated state.");
  add(12, "standard", "labs-16-19",
    "In a UML class diagram, what does a leading minus sign usually mean?",
    null,
    ["private visibility", "public visibility", "static membership", "an abstract method"],
    "A",
    "The common UML visibility markers are - for private and + for public.");
  add(12, "standard", "labs-16-19",
    "A value-based equals method for DACArecipient should return true when:",
    null,
    ["The relevant instance-variable values are equivalent", "Both references use different variable names", "Both objects were constructed on the same line", "The two references must be identical with =="],
    "A",
    "A properly designed equals method compares the state that defines logical equivalence, not merely reference identity.");
  add(12, "challenge", "labs-16-19",
    "Why should toString return a String instead of printing directly?",
    null,
    ["The caller can decide whether to print, log, concatenate, or test the text", "Java forbids output inside classes", "A returned String automatically changes every field", "Printing would make the method static"],
    "A",
    "Returning a representation is more reusable and matches the Object.toString contract.");
  add(12, "challenge", "labs-16-19",
    "Which setter best enforces a rating range from 0.0 through 5.0?",
    null,
    ["Assign only if rating >= 0.0 && rating <= 5.0", "Assign if rating >= 0.0 || rating <= 5.0", "Always assign, then print an error", "Cast rating to int before every comparison"],
    "A",
    "Both the lower and upper bounds must be satisfied. The setter can reject or otherwise handle values outside that valid range.");

  // Topic 13 — Overloading and Constructors
  add(13, "foundational", "labs-16-19",
    "What is special about a Java constructor's name?",
    null,
    ["It exactly matches the class name", "It must always be main", "It begins with get", "It must be all lowercase"],
    "A",
    "A constructor uses the class name and has no return type, not even void.");
  add(13, "foundational", "labs-16-19",
    "What does constructor overloading mean?",
    null,
    ["Providing multiple constructors with different parameter lists", "Calling the same constructor twice", "Giving one constructor two return values", "Defining a constructor in a subclass only"],
    "A",
    "Overloaded constructors share the class name but are distinguished by their parameter lists.");
  add(13, "standard", "labs-16-19",
    "Which is a valid constructor for class Student?",
    null,
    ["public Student(String name) { this.name = name; }", "public void Student(String name) { this.name = name; }", "public student(String name) { this.name = name; }", "static Student(String name) { this.name = name; }"],
    "A",
    "A constructor has the exact class name, no return type, and is normally used to initialize instance state.");
  add(13, "standard", "labs-16-19",
    "In this assignment, what does this.name refer to?",
    `public Student(String name) {\n    this.name = name;\n}`,
    ["The object's instance field", "The parameter on the right side", "A static local variable", "The class filename"],
    "A",
    "this refers to the current object, so this.name is the field; the unqualified name on the right is the parameter.");
  add(13, "challenge", "labs-16-19",
    "A class declares Student(String name) but no Student(). What happens at new Student()?",
    null,
    ["A compile-time error occurs because no no-argument constructor exists", "Java silently uses Student(String) with null", "The object is created without running a constructor", "A runtime error occurs after successful compilation"],
    "A",
    "Java supplies an implicit no-argument constructor only when the class declares no constructors at all.");
  add(13, "challenge", "labs-16-19",
    "Which first statement lets a no-argument constructor reuse a full constructor in the same class?",
    null,
    ["this(\"Unknown\", 0);", "super.this(\"Unknown\", 0);", "new this(\"Unknown\", 0);", "return Student(\"Unknown\", 0);"],
    "A",
    "A constructor can delegate to another constructor in the same class with this(...), and that call must be the first statement.");

  // Topic 14 — Console Input and Validation
  add(14, "foundational", "labs-16-19",
    "Which class is commonly used for console input in introductory Java programs?",
    null,
    ["Scanner", "System.out", "Formatter", "Math"],
    "A",
    "A Scanner can read tokens and lines from System.in.");
  add(14, "foundational", "labs-16-19",
    "Which condition keeps asking while a rating is outside the inclusive range 0.0 to 5.0?",
    null,
    ["rating < 0.0 || rating > 5.0", "rating >= 0.0 && rating <= 5.0", "rating < 0.0 && rating > 5.0", "rating == 0.0 || rating == 5.0"],
    "A",
    "A value is invalid if it violates either bound, so the invalid test uses ||.");
  add(14, "standard", "labs-16-19",
    "After nextInt(), why can an immediate nextLine() appear to return an empty string?",
    null,
    ["nextInt leaves the line separator in the input buffer", "nextLine cannot read String values", "nextInt automatically closes the Scanner", "nextLine always skips one complete line of user input"],
    "A",
    "Token-reading methods do not consume the end-of-line delimiter. A cleanup nextLine call is often needed before reading a full line.");
  add(14, "standard", "labs-16-19",
    "What should instantiateFromInput(Scanner keyboard) return in the MiraCosta-style object-input lab?",
    null,
    ["A fully constructed object populated with validated input", "The Scanner parameter itself", "Only the final star rating", "void because constructors cannot return values"],
    "A",
    "The method gathers and validates the fields, constructs the object, and returns its reference to the caller.");
  add(14, "challenge", "labs-16-19",
    "Which pattern safely handles a user typing text when a double is required?",
    null,
    ["Check hasNextDouble(); if false, consume the invalid token and prompt again", "Call nextDouble repeatedly without checking", "Cast nextLine directly to double", "Catch no exceptions and leave the invalid token unread"],
    "A",
    "The invalid token must be detected and consumed; otherwise the next loop iteration sees the same bad token again.");
  add(14, "challenge", "labs-16-19",
    "A genre is valid only when it equals \"drama\" or \"comedy\", ignoring case. Which condition correctly identifies invalid input?",
    null,
    ["!genre.equalsIgnoreCase(\"drama\") && !genre.equalsIgnoreCase(\"comedy\")", "!genre.equalsIgnoreCase(\"drama\") || !genre.equalsIgnoreCase(\"comedy\")", "genre != \"drama\" && genre != \"comedy\"", "genre.equalsIgnoreCase(\"drama\") && genre.equalsIgnoreCase(\"comedy\")"],
    "A",
    "Input is invalid only when it matches neither allowed value. Both negated comparisons must therefore be true.");

  // Topic 15 — Basic Inheritance, Overriding, and Polymorphism
  add(15, "foundational", "catalog",
    "Which keyword declares that class ElectricCar inherits from class Car?",
    null,
    ["extends", "implements", "inherits", "super"],
    "A",
    "A class uses extends to name its direct superclass.");
  add(15, "foundational", "historical-guides",
    "What does method overriding require?",
    null,
    ["A subclass method with the same signature and a compatible return type", "Two methods in one class with different parameter lists", "A private field with the same name", "A static method called through an object"],
    "A",
    "Overriding replaces inherited instance-method behavior in a subclass. Different parameter lists describe overloading instead.");
  add(15, "standard", "catalog",
    "Which assignment is a valid upcast?",
    null,
    ["Animal a = new Dog();", "Dog d = new Animal();", "Dog d = (String) new Animal();", "Animal a = Dog.class;"],
    "A",
    "A subclass object can be referenced by a variable of its superclass type.");
  add(15, "standard", "historical-guides",
    "What is printed?",
    `class Animal {\n  public String speak() { return "?"; }\n}\nclass Dog extends Animal {\n  @Override public String speak() { return "woof"; }\n}\nAnimal pet = new Dog();\nSystem.out.println(pet.speak());`,
    ["woof", "?", "Dog", "A compile-time error"],
    "A",
    "Dynamic dispatch selects the overridden instance method from the actual Dog object, even though the reference type is Animal.");
  add(15, "challenge", "historical-guides",
    "Which member is not directly accessible by a subclass solely because of inheritance?",
    null,
    ["A private superclass field", "A public superclass method", "A protected superclass method", "An inherited public constant"],
    "A",
    "Private members are accessible only within the declaring class. A subclass normally uses protected/public methods to work with that state.");
  add(15, "challenge", "catalog",
    "Given Animal a = new Dog();, which statement is safest before calling a Dog-only method fetch()?",
    null,
    ["if (a instanceof Dog) { ((Dog) a).fetch(); }", "((Animal) a).fetch();", "a.fetch(); because every Animal is a Dog", "Dog.fetch(a);"],
    "A",
    "The reference must be downcast to Dog to call a Dog-only method, and instanceof verifies that the runtime object supports that cast.");

  window.MIRACOSTA_BANK = {
    version: "2026-07-27",
    title: "MiraCosta CS 111 Public-Source Practice Bank",
    disclaimer: "Original multiple-choice practice based on public MiraCosta course scope, instructor-managed repositories, lab templates, and limited historical review previews. No current locked quiz or final content is included.",
    questions,
    sources,
  };
})();
