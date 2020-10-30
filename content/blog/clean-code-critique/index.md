---
title: "Clean Code Critique"
date: "2020-10-23T00:00:00.000"
description: "Is this really clean code?"
---

In a [previous post](https://zxul767.dev/clean-code), I recommended the popular book [_Clean Code_](https://www.goodreads.com/book/show/3735293-clean-code). Since then I've noticed that the book has been criticized quite often in recent years (e.g., [here](https://qntm.org/clean) is a rather long post bashing against it.) So I took the time to review it again--it's been many years since I last read it--and I found that I actually agree with several of the criticisms against it.

![Clean Code book cover.](./images/clean-code-cover.jpg)

Though I won't do a full review of the book in this post, I do want to point out a couple of things that I think are important as a warning for less experienced developers who can often take rules or advice in books like this as gospel. Two issues I noticed in the book that I'd like to cover in this post are the following:

+ Dogmatism
+ Bad Examples of _Clean Code_

## Dogmatism
One the things you will find when you read any book by Robert C. Martin is that he tends to be very prescriptive, sometimes almost dogmatic in the topics he exposes to his audience. You can see this in his books ([The Clean Coder](https://www.goodreads.com/search?q=the+clean+coder&qid=), [Clean Architecture](https://www.goodreads.com/book/show/18043011-clean-architecture?ac=1&from_search=true&qid=r8wktTZU6q&rank=1), etc.), but also in [his talks](https://www.youtube.com/watch?v=7EmboKQH8lM&t=5006s) and other expositions in social media (e.g., [_"Those who don't practice TDD cannot be considered professional programmers"_](https://www.youtube.com/watch?v=KtHQGs3zFAM&t=884s))

I think he's entitled to have strong opinions and to argue passionately for what he believes in. But as engineers with a growth mindset, we should be mindful to avoid becoming part of "engineering cults" after reading a book or two by someone who's regarded as an authority by some people. As [Alan J. Perlis](https://en.wikipedia.org/wiki/Alan_Perlis) once wrote: 

> Above all, I hope we don’t become missionaries. Don’t feel as if you’re Bible salesmen. The world has too many of those already. What you know about computing other people will learn. Don’t feel as if the key to successful computing is only in your hands. What’s in your hands, I think and hope, is intelligence: the ability to see the machine as more than when you were first led up to it, that you can make it more.

Over my career, I've learned that reading and listening to a diversity of developers can give you a much stronger foundation as an engineer. [Kent Beck](https://twitter.com/KentBeck)--known for popularizing the technique of [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)--is one of those people who taught me that software development is not about absolute rules, but almost always about trade-offs. This means that one must learn to see things in context and realize that "rules" are really "rules of thumb" and should be treated as such. _Those who follow rules blindly are bound to eventually crash and burn in some situation._

Speaking of rules, one that stuck with me when I first read _Clean Code_ was the idea of writing short functions that do one thing. I remember distinctly how the idea really resonated with me. And I took it quite literally in the beginning, always struggling to simplify my functions to be just a few lines of code even if, in retrospective, that sometimes hurt readability by creating too many levels of indirection. As I'll try to show in the next section, it is easy to take this idea too far, usually with negative consequences.

## Bad Examples of Clean Code
As an example of how taking software development rules quite literally can be disastrous sometimes, I'd like to reproduce an example from the book here, and then comment on the refactoring that is proposed there.

The code in question is a program to generate a list of prime numbers (by the way, perhaps I'm biased but this example seems a little contrived to me; I have never seen Java code that is so unidiomatic):

```java {numberLines}
public class PrintPrimes {
    public static void main(String[] args) {
        final int M = 1000; 
        final int RR = 50;
        final int CC = 4;
        final int WW = 10;
        final int ORDMAX = 30; 
        int P[] = new int[M + 1]; 
        int PAGENUMBER;
        int PAGEOFFSET; 
        int ROWOFFSET; 
        int C;
        int J;
        int K;
        boolean JPRIME;
        int ORD;
        int SQUARE;
        int N;
        int MULT[] = new int[ORDMAX + 1];
        J = 1;
        K = 1; P[1] = 2; ORD = 2; SQUARE = 9;
        while (K < M) {
            do {
                J = J + 2;
                if (J == SQUARE) {
                    ORD = ORD + 1;
                    SQUARE = P[ORD] * P[ORD]; MULT[ORD - 1] = J;
                }
                N = 2;
                JPRIME = true;
                while (N < ORD && JPRIME) {
                    while (MULT[N] < J) 
                        MULT[N] = MULT[N] + P[N] + P[N];
                    if (MULT[N] == J) 
                        JPRIME = false;
                    N = N + 1;
                }
            } while (!JPRIME); 
            K = K + 1;
            P[K] = J;
        }
        PAGENUMBER = 1;
        PAGEOFFSET = 1;
        while (PAGEOFFSET <= M) {
            System.out.println("The Prime Numbers --- Page " + PAGENUMBER);
            System.out.println("");
            for (ROWOFFSET = PAGEOFFSET; ROWOFFSET < PAGEOFFSET + RR; ROWOFFSET++){
                for (C = 0; C < CC;C++)
                    if (ROWOFFSET + C * RR <= M)
                        System.out.format("%10d", P[ROWOFFSET + C * RR]); System.out.println("");
            }
            System.out.println("\f"); 
            PAGENUMBER = PAGENUMBER + 1; 
            PAGEOFFSET = PAGEOFFSET + RR * CC;
        }
    }

```

I think we can easily agree that this program is far from being easy to understand, and might benefit from some refactoring to make its core logic more obvious.

Here's the proposed refactoring in the book:

```java {numberLines}
public class PrimePrinter {
    public static void main(String[] args) {
        final int NUMBER_OF_PRIMES = 1000;
        int[] primes = PrimeGenerator.generate(NUMBER_OF_PRIMES);

        final int ROWS_PER_PAGE = 50; 
        final int COLUMNS_PER_PAGE = 4;
        RowColumnPagePrinter tablePrinter =
            new RowColumnPagePrinter(ROWS_PER_PAGE, COLUMNS_PER_PAGE,
                                     "The First " + NUMBER_OF_PRIMES + " Prime Numbers");
        tablePrinter.print(primes); 
    }
}
```

So far so good: the responsibility of generating the list of primes (`js•PrimeGenerator`) has been clearly separated from that of displaying them on the screen (`js•RowColumnPagePrinter`.) 

Let's have a look at the second class:

```java {numberLines}
public class RowColumnPagePrinter {
    private int rowsPerPage;
    private int columnsPerPage;
    private int numbersPerPage;
    private String pageHeader;
    private PrintStream printStream;

    public RowColumnPagePrinter(int rowsPerPage, int columnsPerPage, String pageHeader) {
        this.rowsPerPage = rowsPerPage;
        this.columnsPerPage = columnsPerPage;
        this.pageHeader = pageHeader;
        this.numbersPerPage = rowsPerPage * columnsPerPage;
        this.printStream = System.out;
    }
    public void print(int data[]) {
        int pageNumber = 1;
        for (int firstIndexOnPage = 0; // highlight-line
             firstIndexOnPage < data.length; // highlight-line
             firstIndexOnPage += numbersPerPage) { // highlight-line
            int lastIndexOnPage = Math.min(firstIndexOnPage + numbersPerPage - 1, data.length - 1);
            printPageHeader(pageHeader, pageNumber);
            printPage(firstIndexOnPage, lastIndexOnPage, data);
            printStream.println("\f");
            pageNumber++;
        }
    }
    private void printPage(int firstIndexOnPage, int lastIndexOnPage, int[] data) {
        int firstIndexOfLastRowOnPage = firstIndexOnPage + rowsPerPage - 1;
        for (int firstIndexInRow = firstIndexOnPage; // highlight-line
             firstIndexInRow <= firstIndexOfLastRowOnPage; // highlight-line
             firstIndexInRow++) { // highlight-line
            printRow(firstIndexInRow, lastIndexOnPage, data);
            printStream.println("");
        }
    }
    private void printRow(int firstIndexInRow, int lastIndexOnPage, int[] data) {
        for (int column = 0; column < columnsPerPage; column++) {
            int index = firstIndexInRow + column * rowsPerPage;
            if (index <= lastIndexOnPage)
                printStream.format("%10d", data[index]); }
    }
    private void printPageHeader(String pageHeader, int pageNumber) {
        printStream.println(pageHeader + " --- Page " + pageNumber);
        printStream.println("");
    }
}
```

Overall, this class reads reasonably well to me. One objection I might have is whether we really such long names in some of the functions (e.g., `js•firstIndexInRow` in the `js•printPage` function), which in this case has apparently "forced" the author to unnaturally break the `js•for` statement into three lines, as highlighted above.

The book itself offers advice in this regard by stating that the length of a variable name should be proportional to its scope: in larger scopes we need more context, so longer names are useful; in shorter scopes, the surrounding context provides more information, so shorter names are enough (and using longer names in that case usually just adds unnecessary noise, which hurts readability.)

However, I will not fuss much about this particular issue here because I'd like to focus on what I think is truly more problematic in the following class. 

Go ahead and spend some minutes trying to understand the following class before reading on.

```java {numberLines}
public class PrimeGenerator {
    private static int[] primes;
    private static ArrayList<Integer> multiplesOfPrimeFactors;

    protected static int[] generate(int n) {
        primes = new int[n];
        multiplesOfPrimeFactors = new ArrayList<Integer>();
        set2AsFirstPrime();
        checkOddNumbersForSubsequentPrimes();
        return primes;
    }
    private static void set2AsFirstPrime() {
        primes[0] = 2;
        multiplesOfPrimeFactors.add(2);
    }
    private static void checkOddNumbersForSubsequentPrimes() {
        int primeIndex = 1;
        for (int candidate = 3; primeIndex < primes.length; candidate += 2) {
            if (isPrime(candidate))
                primes[primeIndex++] = candidate;
        }
    }
    private static boolean isPrime(int candidate) {
        if (isLeastRelevantMultipleOfNextLargerPrimeFactor(candidate)) {
            multiplesOfPrimeFactors.add(candidate);
            return false;
        }
        return isNotMultipleOfAnyPreviousPrimeFactor(candidate);
    }
    private static boolean isLeastRelevantMultipleOfNextLargerPrimeFactor(int candidate) {
        int nextLargerPrimeFactor = primes[multiplesOfPrimeFactors.size()];
        int leastRelevantMultiple = nextLargerPrimeFactor * nextLargerPrimeFactor;
        return candidate == leastRelevantMultiple;
    }
    private static boolean isNotMultipleOfAnyPreviousPrimeFactor(int candidate) {
        for (int n = 1; n < multiplesOfPrimeFactors.size(); n++) {
            if (isMultipleOfNthPrimeFactor(candidate, n)) 
                return false;
        }
        return true;
    }
    private static boolean isMultipleOfNthPrimeFactor(int candidate, int n) {
        return candidate == smallestOddNthMultipleNotLessThanCandidate(candidate, n);
    }
    private static int smallestOddNthMultipleNotLessThanCandidate(int candidate, int n) {
        int multiple = multiplesOfPrimeFactors.get(n);
        while (multiple < candidate)
            multiple += 2 * primes[n];
        multiplesOfPrimeFactors.set(n, multiple);
        return multiple;
    }
}
```

Did you understand clearly what it does and how it works? If you did without having prior context, you must be extremely good at untangling complex code, congratulations! For the rest of us, however, this class probably made us scratch our heads more than it should.

If we take the idea of "writing short functions that do one thing" quite literally, one could argue that _all_ of this code is good. But as we dig into it to truly grok what's going on, very soon we notice quite a few problems. 

Let's dissect it method by method to see this:

```java {numberLines}
public class PrimeGenerator {
    private static int[] primes;
    private static ArrayList<Integer> multiplesOfPrimeFactors;

    protected static int[] generate(int n) {
        primes = new int[n];
        multiplesOfPrimeFactors = new ArrayList<Integer>();
        set2AsFirstPrime();
        checkOddNumbersForSubsequentPrimes();
        return primes;
    }
    // ...
 }
```

The `js•generate` method describes well what it's doing, but the issue here is that there is no clue as to why it's doing this: it's missing important documentation to ease the reader into the complexities to come. 

At this point, some might argue that there is no need for this, as the code will be self-explanatory and reveal the underlying algorithm itself. Alas, this hope will be short-lived, as you will see in a moment. Let's continue:

```java {numberLines}
public class PrimeGenerator {
    // ...
    private static void set2AsFirstPrime() {
        primes[0] = 2;
        multiplesOfPrimeFactors.add(2);
    }
    private static void checkOddNumbersForSubsequentPrimes() {
        int primeIndex = 1;
        for (int candidate = 3; primeIndex < primes.length; candidate += 2) {
            if (isPrime(candidate))
                primes[primeIndex++] = candidate;
        }
    }
    // ...
}
```

Nothing much to object here (except maybe for the natural question: what's the role of `js•multiplesOfPrimeFactors`?), so let's see the next method:

```java {numberLines}
public class PrimeGenerator {
    // ...
    private static boolean isPrime(int candidate) {
        if (isLeastRelevantMultipleOfNextLargerPrimeFactor(candidate)) { // highlight-line
            multiplesOfPrimeFactors.add(candidate); // highlight-line
            return false; // highlight-line
        }
        return isNotMultipleOfAnyPreviousPrimeFactor(candidate);
    }
    // ...
}
```

And this is where the head-scratching begins. While the second part of the condition is easy to understand (`js•isNotMultipleOfAnyPreviousPrimeFactor`), the highlighted lines make us feel like we've just taken a leap of logic: 

+ What does "relevant multiple" mean and how does it relate to the "next larger prime factor"?
+ Why does this function have a side effect on `js•multiplesOfPrimeFactors` if its name suggests that it should be a pure function? 

To me, the lack of a high-level description of the underlying algorithm (which is nontrivial) is the root of this confusion. The author is hoping that the code will explain itself, but sometimes that's just not the case and you need some additional help in the form of documentation. 

If we had any hope that the definition of "relevant" would get some clarification in the next method, we'll be disappointed:

```java {numberLines}
public class PrimeGenerator {
    // ...
    private static boolean isLeastRelevantMultipleOfNextLargerPrimeFactor(int candidate) {
        int nextLargerPrimeFactor = primes[multiplesOfPrimeFactors.size()];
        int leastRelevantMultiple = nextLargerPrimeFactor * nextLargerPrimeFactor;
        return candidate == leastRelevantMultiple;
    }
    // ...
}
```

The implementation gives us some clues (e.g., a relevant multiple apparently has something to do with squares of primes), but the mere fact that we have to conjecture is already a strong "smell" in this code.

The next method is straightforward and follows the [principle of least astonishment](https://wiki.c2.com/?PrincipleOfLeastAstonishment) well (though it might be better if the author had avoided a negation in the method's name):

```java {numberLines}
public class PrimeGenerator {
    // ...
    private static boolean isNotMultipleOfAnyPreviousPrimeFactor(int candidate) {
        for (int n = 1; n < multiplesOfPrimeFactors.size(); n++) {
            if (isMultipleOfNthPrimeFactor(candidate, n)) 
                return false;
        }
        return true;
    }
    // ...
}
```

Unfortunately, the last two methods seem like they could have been just one, and the last one is just doing some very odd things that are not explained at all by the name `js•smallestOddNthMultipleNotLessThanCandidate`:

```java {numberLines}
public class PrimeGenerator {
    // ...
    private static boolean isMultipleOfNthPrimeFactor(int candidate, int n) {
        return candidate == smallestOddNthMultipleNotLessThanCandidate(candidate, n);
    }
    private static int smallestOddNthMultipleNotLessThanCandidate(int candidate, int n) {
        int multiple = multiplesOfPrimeFactors.get(n);
        while (multiple < candidate)
            multiple += 2 * primes[n];
        multiplesOfPrimeFactors.set(n, multiple);
        return multiple;
    }
    // ...
}
```

When I first read the criticism of this example in [this post](https://qntm.org/clean), I was curious to see if the author was perhaps over exaggerating. He was not: I literally spent more than 15 minutes trying to grok the code, until I gave up and decided to read the original source to see if I could derive a more understandable refactoring.

Surprisingly, even though reading the original source was no walk in the park, it was eventually more helpful in making me realize that the code was an optimized version of the well-known ["Sieve of Eratosthenes" algorithm](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes), and that the most confusing bits in the original code had to do with the optimizations implemented.

Despite following "the rules" for "clean code", this code has fallen victim to a common problem when writing short functions: _forcing a "narrative" that is unnatural and hard to follow (partly due to the excessive indirection) simply in the name of creating very short functions._

## The Underlying Issues
To recap, here are the problems I see with this example:

+ it fails to ease the reader into a nontrivial algorithm with some form of documentation;
+ it uses overly verbose method names in an attempt to compensate for the lack of documentation;
+ it fails to provide important explanations where very odd things are happening (i.e., the side effects in some methods);
+ it seems to assume that more small-sized functions always means better readability, but this is not true when the original logic is partitioned into too many parts or when the partioning is unnatural, forcing you to create convoluted function names.

In my opinion, the advice to write "short functions that do one thing" needs to be explained with more nuance. When followed at face value, it is easy to arrive at code that is more difficult to understand than its everything-in-a-single-function counterpart.

When we talk about the length of functions, we should be aware that there are really two ends of a spectrum, both of which can be equally terrible. On the one hand, we can write all our code in a single humongous function, mixing all sorts of high-level and low-level details, with temporary variables all over the place, and spaguetti code that completely obscures the core logic of the underlying algorithm.

On the other hand, we can partition the code into extremely small functions that are quick to read at the individual level, but which make it harder to mentally try and piece everything together (and [we all know](https://www.livescience.com/2493-mind-limit-4.html) that humans just aren't very good at keeping too many things at once in our heads.) When coupled with the intrinsic difficulty of partitioning code with straightforward, intuitive boundaries that have clear inputs, outputs and side effects, the result can easily become incomprehensible, defeating the purpose of the refactoring.

## A Proposed Refactoring
After studying the code and realizing the underlying algorithm and its optimizations, I decided to take a stab at a refactoring to address the concerns I mentioned above. I wrote this version in Python but I don't think the choice of language is really a major factor in its improved clarity, as I'll comment below:

```python {numberLines}
# TODO: review whether the optimizations are truly worth the additional complexity
class PrimeGenerator:
    """
    Generates a list of the first `n` primes using the "sieve of Eratosthenes" algorithm
    (https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes) with some optimizations:

    1. Instead of doing actual divisions to test integer divisibility, we use
       repeated sums, by keeping track of the last multiple of a prime that we tested
       in `self.prime_multiples`; hence `self.prime_multiples[i] == k * self.prime[i]` 
       always holds for some `k`

    2. We start testing divisilibility by `prime` at `prime * prime` because
       smaller multiples will have already been considered by tests with smaller
       primes; hence the phrase "relevant multiple" in the method
       `add_next_relevant_prime_multiple_if_needed`
    """
    def generate(self, n):
        self._initialize()
        prime = 1 # not a prime, but needed to search odd numbers only
        for _ in range(n): 
            prime = self._find_next_prime(prime)
            self.primes.append(prime)
        return self.primes

    def _find_next_prime(self, previous_prime):
        prime_candidate = previous_prime
        while True:
            prime_candidate += 2 # skip even numbers
            self._add_new_prime_multiple_if_needed(prime_candidate)
            if not self._has_any_prime_divisor(prime_candidate):
                return prime_candidate

    def _add_new_prime_multiple_if_needed(self, prime_candidate):
        # If we're testing primality of N, we only need to use primes up to
        # sqrt(N) (see documentation for details.)
        # This is the bookkeeping needed to implement that optimization.
        m = len(self.prime_multiples)
        prime = self.primes[m] if m < len(self.primes) else 0
        if prime_candidate == prime * prime:
            self.prime_multiples.append(prime_candidate)

    def _has_any_prime_divisor(self, odd_number):
        return any(
            self._is_divisible_by_nth_prime(odd_number, n)
            # self.prime_multiples[0] == 2, so we can safely skip it
            for n in range(1, len(self.prime_multiples))
        )

    def _is_divisible_by_nth_prime(self, odd_number, n):
        # In the simplest version of the algorithm we would check:
        #   `number % prime[n] == 0`
        # but division can be expensive, so we instead use sums of `prime[n]`
        # to implicitly perform the division and figure out if the remainder 
        # is zero. That is the role of `self.prime_multiples[n]`
        #
        # Notice also that we don't need to reset `self.prime_multiples[n]`
        # to `prime[n]` (or rather to `prime[n]*prime[n]`, since testing for
        # smaller multiples is redundant) because we only test increasingly
        # larger numbers. See the algorithm's documentation linked atop for 
        # full details.
        #
        while self.prime_multiples[n] < odd_number:
            # `self.prime_multiples[n] + self.prime[n]` is even, so we skip it
            self.prime_multiples[n] += self.primes[n] + self.primes[n]
        return self.prime_multiples[n] == odd_number

    def _initialize(self):
        self.primes = [2]
        self.prime_multiples = [2*2]

def compute_primes(n):
    return PrimeGenerator().generate(n)
```

While I don't claim this version is "perfect"--the `js•_is_divisible_by_nth_prime` method still has a side-effect, and the explanation of the optimizations is not detailed enough--I do hope that you can agree that this version is likely to take a future reader significantly less time to understand.

Using Python helps in making the code less verbose than its Java counterpart, but if you examine the code closely, you'll realize that the thing that makes this code better has little to do with the language. The improvement has more to do with the introductory documentation, the adequate partitioning that contains neither too little nor too much detail in each function, and the comments that explain what the code cannot explain alone (because of the intrisic complexity in the underlying algorithm and the optimizations.)

If this was part of an actual codebase, I would definitely write a detailed post to explain how the optimizations work. With that, we could probably remove all the explanation comments, replacing them with just links to the corresponding sections in the documentation.

## Conclusion
While I still think that _Clean Code_ is a useful book for many novice programmers (when read with a critical mind), I believe there are now several books and resources that can be just as useful (if not more) to get a stronger foundation in techniques to write more maintainable code.

Regardless of the books we read, though, the most important thing to keep in mind is that it's dangerous to follow "rules" blindly if we haven't fully internalized what is behind them, and the pitfalls we can fall into if we're not careful with the caveats.

## Further Reading
The following are very useful alternatives and complements to _Clean Code_:

+ [99 Bottles of OOP](https://www.goodreads.com/book/show/31183020-99-bottles-of-oop) by [Sandi Metz](https://twitter.com/sandimetz?lang=en) It explains the process of writing good code, and teaches you to achieve beautifully programmed ends by way of extremely practical means.

+ [Code Simplicity](https://www.goodreads.com/book/show/13234063-code-simplicity) by [Max Kanat-Alexander](https://twitter.com/mkanat?lang=en). This book is a compilation of many blog posts by the same author, where he exposes his theory of how complexity in software is the bane of all programmers, and encourages people to struggle to keep things simple.

+ [The Art of Readable Code](https://www.goodreads.com/book/show/8677004-the-art-of-readable-code) by [Dustin Boswell](https://twitter.com/dustinboswell?lang=en). Similar in spirit to the _Clean Code_ book, but worth reading for the additional insights and examples it presents.

+ [The Clean Code Talks](https://www.youtube.com/playlist?list=PLR5laMT-DcloGDcMKo07sEPZ7HvvD2Job). This is a series of talks by [Miško Hevery](https://twitter.com/mhevery), [Joshua Bloch](https://twitter.com/joshbloch) and other (former) Googlers on clean code practices. While it doesn't cover many topics found in the books recommended above, it explores some other topics in great detail, providing very interesting insights.
