---
title: "Dynamic Programming"
date: "2020-08-29T22:10:44.085537"
description: "Dynamic Programming distilled"
---

Dynamic Programming is one of those topics that tend to be considered complicated by a lot of people, but which turn out to be quite simple once it is properly deconstructed.

This [post](https://blog.usejournal.com/top-50-dynamic-programming-practice-problems-4208fed71aa3) gives a very nice definition:

> Dynamic Programming is a method for solving a complex problem by breaking it down into a collection of simpler subproblems, solving each of those subproblems just once, and storing their solutions using a memory-based data structure.

If you're familiar with recursion, you'll immediately recognize that definition as extremely familiar. There is no surprise in that, since recursion is also all about solving a problem by solving smaller instances of the same problem. That allows us to formulate an alternative and concise "definition":

> Dynamic Programming = Recursion + Memoization

One nuance to these definitions, however, is that when we use dynamic programming we are often looking for optimal solutions, so the tricky part becomes how to prove that the optimal solution to a problem can be constructed by using solutions (optimal or not) to smaller subproblems of the same kind. Once we've figured that out, the implementation is usually pretty straightforward.

To see these concepts more concretely, let's work through an example problem and see how each of these concepts apply.

## Word Break Problem
> Given a string and a dictionary of words, determine if the string can be segmented into a space-separated sequence of one or more dictionary words.

Translating the above to code, this is what we're being asked to write:

```python {numberLines}
def can_segment(text: str, words: Set[str]) -> bool:
    ...
```

Is there a recursive solution to this problem? Think what happens if we take one word from the set and are able to match it against a prefix of the `text` string. Then the problem reduces to finding whether we can segment the rest of the string, which is just a smaller instance of the original problem. That is clearly a case for a recursive solution!

```python {numberLines}
def can_segment(string, words):
    def _find_prefix_word_matches(text):
        ...
    def _can_segment(suffix):
        if len(suffix) == 0:
            return True
        for match in _find_prefix_word_matches(suffix):
            if _can_segment(suffix[len(match):]):
                return True
        return False
```

One problem with this solution is that it can end up calling `_can_segment` multiple times for the same argument. Let's see a concrete example to visualize how this could happen:

```python {numberLines}
words = {
    "the", "ban", "banana", "ana", "gave", "us", "is", "right"
}
can_segment("thebananagaveusisfair", words)
# one possible sequence of calls could be:
#
# _can_segment("thebananagaveusisfair")
#   _can_segment("bananagaveusisfair") ["the"]
# ==> _can_segment("gaveusisfair")       ["banana"]
#       _can_segment("usisfair")           ["gave"]
#         _can_segment("isfair")             ["us"]
#           _can_segment("fair")               ["is"]
#     _can_segment("anagaveusisfair")    ["ban"]
# ====> _can_segment("gaveusisfair")       ["ana"]
#         _can_segment("usisfair")           ["gave"]
#           _can_segment("isfair")             ["us"]
#             _can_segment("fair")               ["is"]
# ...
```

As you can see, the call to `_can_segment("gaveusisfair")` happens twice, with the cost associated to all its recursive calls. For bigger strings the amount of duplicated computation can lead to exponential runtime. This is similar to what happens in a [naive implementation](https://benalexkeen.com/fibonacci-implementation-in-python/) of the recursive definition of the [Fibonacci numbers](https://en.wikipedia.org/wiki/Fibonacci_number).

One way to fix this problem is to [memoize](https://en.wikipedia.org/wiki/Memoization#:~:text=In%20computing%2C%20memoization%20or%20memoisation,the%20same%20inputs%20occur%20again.) the problematic function in order to avoid recomputation. In Python, we can easily achieve this using the `lru_cache` function from the `functools` module. 

```python {numberLines}
from functools import lru_cache

def can_segment(string, words):
    def _find_prefix_word_matches(text):
        ...
    @lru_cache(maxsize=len(string))
    def _can_segment(suffix):
        if len(suffix) == 0:
            return True
        for match in _find_prefix_word_matches(suffix):
            if _can_segment(suffix[len(match):]):
                return True
        return False
    return _can_segment(string)
````

Memoization works very well for [pure functions](https://en.wikipedia.org/wiki/Pure_function), but in our case the function is not completely pure because it depends on the dictionary of words. Despite that, we are able to make it work because --for the purposes of an individual call to the outer function `can_segment`-- `words` is immutable, so `_can_segment` can still be memoized properly, as long as the function is nested.

## Is this really Dynamic Programming?
If you've seen solutions to dynamic programming problems before, you may be wondering why this implementation doesn't resemble the code in those solutions (e.g., there is no table to store intermediate results and no loops that compute solutions incrementally from previously computed solutions.)

While the solution presented so far is indeed very different, I would argue that this difference is only superficial, and that the same fundamental computation is being performed in both cases. The major difference is that such solutions "unfold" the recursion, creating a bottom-up, iterative implementation.

For some problems, the bottom-up, iterative solution is the best option (both in terms of comprehensibility and performance.) But for some other problems the recursive solution provides a more straightforward implementation while remaining sufficiently performant (as long as the maximum recursion depth is not too large.)

For those problems where maximum efficiency is required, it is always possible to rewrite the recursive implementation into a bottom-up, iterative style. For our problem, we may need to restructure our current solution a bit before we can see how to transform it into an iterative one.

First, we can avoid passing a string to the `_can_segment` function simply by passing an offset instead (which implicitly defines the suffix we used to pass):

```python {numberLines}
def can_segment(string, words):
    def _find_prefix_word_matches(offset):
        for word in words:
            if string.startswith(word, offset):
                yield word

    @lru_cache(maxsize=len(string))
    def _can_segment(offset):
        if offset == len(string) - 1:
            return True
        for match in _find_prefix_word_matches(offset):
            if _can_segment(offset + len(match)):
                return True
        return False
    return _can_segment(0)
```

Now that the function takes a single integer as input, it's easier to see a transformation to an iterative solution that indexes a table of intermediate results. This transformation will require an array of booleans that tells us, for each possible `offset`, whether there is a way to segment the corresponding suffix into words:

```python {numberLines}
def can_segment_iterative(string, words):
    n = len(string)
    _can_segment = [False for _ in range(n + 1)]
    _can_segment[n] = True
    for offset in reversed(range(n)):
        for word in words:
            if not string.startswith(word, offset):
                continue
            _can_segment[offset] = _can_segment[offset + len(word)]
            if _can_segment[offset]:
                break
    return _can_segment[0]
```

Notice how the fundamental computations are the same, but we had to restructure a few things to fit into the iterative style. One interesting thing to notice--which was harder to see in the recursive implementation--is that this procedure has time complexity `O(NW)` where `N` is the size of the string and `O` is the number of words in the dictionary (assuming, of course, that most words are much smaller than the string we're trying to segment.)

Another important thing to notice is that depending on the input, it is possible that many elements `_can_segment[i]` in the array will never be mutated (e.g., if we always pass through the `continue` statement), or that some elements will never be used (because `offset + len(word)` may not touch all possible integers `i=0,...,n`.)

Finally, notice how both solutions implement base or initial conditions (`if offset == len(string) - 1` in the recursive case, and `_can_segment[n] = True` in the iterative case.) In all dynamic programming problems (and all recursive solutions, for that matter), it is crucial to define these base conditions to avoid stack overflows or incorrect results.

## Why is it called Dynamic Programming?
Though its name invokes some of air of sophistication, as it is explained in its Wikipedia [page](https://en.wikipedia.org/wiki/Dynamic_programming#:~:text=The%20word%20dynamic%20was%20chosen,schedule%20for%20training%20or%20logistics.), "dynamic programming" was actually a bit of a marketing gimmick in a time where mathematical research was suffering from lack of government support:

> The word "dynamic" was chosen by Bellman to capture the time-varying aspect of the problems, and because it sounded impressive. The word programming referred to the use of the method to find an optimal program, in the sense of a military schedule for training or logistics.

## Conclusions
Despite its reputation for being a difficult technique, dynamic programming can be easily understood if you have a good grasp on recursion.

The recursive implementation of a dynamic programming solution tends to be easier to visualize and implement, but sometimes it can be inefficient, so an iterative solution can be preferred.

One advantage of iterative solutions is that their time and space complexity are pretty obvious. With a recursive solution, that information may be harder to glean.

For problems where the number of subproblems that are required to compute the solution is much smaller than the total number of potential subproblems, the recursive solution may be more efficient both in space and time since it only does computations that are strictly necessary.

## Further Reading
If you found this post useful to understand dynamic programming better, you may now want to practice with some of the classical problems associated with this technique.

+ [Top 50 Dynamic Programming Practice Problems](https://blog.usejournal.com/top-50-dynamic-programming-practice-problems-4208fed71aa3)
