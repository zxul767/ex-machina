---
title: "Clean Code"
date: "2020-08-18T00:00:00.000"
description: "Clean Code is code that is easy to understand, maintain and extend..."
---

Sooner or later, every programmer encounters the term "clean code" in their career. And although most initially imagine it's just "code aesthetics" that can be achieved with a formatter, in reality there is much more to it than that.

In this post we'll examine what exactly it is, why it matters, and some of the fundamental ideas that can help us write clean code.

## What is Clean Code?
If you google the term, you'll most likely find references to the famous book ["Clean Code"](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by [Robert C. Martin](https://en.wikipedia.org/wiki/Robert_C._Martin), which is probably responsible for popularizing the term in the early 2000s. You can read the book if you want to take a deep dive into many of the ideas behind "clean code", but here's a simplified definition that I think captures the gist of it:

> Clean Code is code that is easy to understand, maintain, and extend

## Why does it matter?
For most programmers, the importance of writing clean code becomes self-evident soon after inheriting a legacy codebase that is a nightmare to work with. This realization comes from a simple fact: _for all but the most trivial of projects, we read code much more than we write it._ Because of this, it makes sense to spend additional time structuring our code to make it easier to understand by future maintainers (ourselves included!)

Writing clean code also matters because it can help reduce defect density: when code is simple and straightforward, it's easier for our peers (and even ourselves) to spot mistakes in our code. This can mean a huge difference in quality and productivity for a project.

To better appreciate these ideas, let's analyze a small function that violates several clean code principles and see how we can improve it.

## What's wrong with this function?
The following function determines if its argument is a valid IP address. Do you see anything wrong with it?

```python
def isIPV4(txt):
    ints = txt.split('.')
    cnt = 0
    for i in range(0, len(ints)):
        try:
            v = int(ints[i])
            if v < 0 or v > 255:
                return True
        except Exception:
            return False
        cnt += 1
    if cnt == 4:
        return True
    return False
```

### Idiomatic Code
The first thing to notice is that this function is not very [Pythonic](https://stackoverflow.com/questions/25011078/what-does-pythonic-mean). For example, using camel case instead of snake case, or looping through `ints` by using an explicit index (a common idiom in C or C++ but not in Python).

Another issue is the use of non-standard abbreviations (e.g., `cnt`, `txt`), which forces readers to do unnecessary mental mappings. Let's begin by fixing these minor issues and see the resulting code:

```python
def is_ipv4(text):
    parts = text.split('.')
    count = 0
    for part in parts:
        try:
            v = int(part)
            if v < 0 or v > 255:
                return False
        except Exception:
            return False
        count += 1
    if count == 4:
        return True
    return False
```

Perhaps not much of a difference, but bear with me: the secret behind improving code in a reliable way (as Martin Fowler has described in his book [Refactoring](https://martinfowler.com/books/refactoring.html)) lies in making many small, almost trivial transformations.

### Separation of Concerns
One thing that makes code harder to read is mixing multiple concerns in a single block. This is a common mistake for novice programmers.

In our example, we can see that happening inside the `for` loop: it's trying to parse each `part` into an integer, but it's also tracking how many parts passed the octet validation. If we separate these two concerns, we can make the code easier to read:

```python
def is_ipv4(text):
    # split into octets and verify that there are exactly four
    parts = text.split('.')
    if len(parts) != 4:
        return False

    # verify that each octet is valid
    for part in parts:
        try:
            v = int(part)
            if v < 0 or v > 255:
                return False
        except Exception:
            return False
    return False
```

We added some comments to organize our thoughts, but we should be able to get rid of them by writing code that is completely self-explanatory. In most cases, comments should be reserved to explain _why_ we implemented something in a certain way, not _what_ we did (redundant if we've picked good names) or _how_ we did it (redundant if our logic is simple and straightforward.)

### Expressive Code
Is it easy to immediately see what our function does? Sort of, but we can probably do better. After some examination, we can see that conceptually:

1. We're splitting `text` into pieces,
2. Checking if there are four pieces, and
3. Checking if every piece is a valid octet.

Articulating the high-level logic of an algorithm is a very useful practice that can be distilled into the following principle:

> Clean Code describes core logic at a single level of abstraction by suppressing detail

If we try to restructure our code to follow this principle, we get the following:

```python
def is_ipv4(text):
    parts = text.split('.')
    if len(parts) != 4:
        return False
    return all(is_octet(part) for part in parts)
```

This code tells a shorter story and minimizes the details so we can focus on the big picture. This definitely is easier to grasp at a glance. We can even go one step further and simplify the code as follows:

```python
def is_ipv4(text):
    parts = text.split('.')
    return len(parts) == 4 and all(is_octet(part) for part in parts)
```

This version reads almost like English prose and is quite easy to eyeball for logical errors. At this point, the implementation of `is_octet` should not really be that important (as long as it's correct), but let's add it for the sake of completeness:

```python
def is_octet(part):
    return part.isdigit() and 0 <= int(part) <= 255

def is_ipv4(text):
    parts = text.split('.')
    return len(parts) == 4 and all(is_octet(part) for part in parts)
```

Notice how we avoided using a `try/except` block and used a more idiomatic way to test if a value lies in a range, thus simplifying the definition of `is_octet` substantially.

Some programmers might complain that this practice can pollute the namespace with many little helper functions. Although I find that the improved clarity more than offsets this potential drawback, the objection is easy to fix in Python (and other languages that support nested functions):

```python
def is_ipv4(text):
    def is_octet(part):
        return part.isdigit() and 0 <= int(part) <= 255

    parts = text.split('.')
    return len(parts) == 4 and all(is_octet(part) for part in parts)
```


## Conclusion
The resulting code is simpler and easier to read, but did we just make the code "prettier"? Is that all we gained by doing these refactorings? On the surface it may seem so, but let me state a couple of points on why I think this effort goes beyond making things "prettier."

### Readability improves programmer efficiency
In professional settings, we almost always read code way more than we write code. This is easy to see if you think about the times you've had to add a new feature to an existing codebase, and before you could do so you had to understand how the existing code worked.

The additional upfront cost we pay to make things simpler is dwarfed by the time we would otherwise have to spend making sense of tangled or poorly structured code.

### Bugs are easier to spot in clean code
Whenever a piece of code is easy to grasp, it's easier to spot mistakes in its logic. It's also easier to see a mismatch between implementation and intent (e.g., when the function name says something but the implementation contradicts it.) In code that doesn't adhere to clean code principles, this is much harder to do.

### Programmer frustration decreases with clean code
Our motivation and ability to remain productive in a project are strongly correlated with the amount of frustration we face on a daily basis with the codebase (which is often not intrinsically difficult, it just happens to have been poorly structured.) Clean code practices can reduce this daily frustration, thus increasing our productivity and our happiness in the job.

### Did we miss something?
Yes, there is one thing we didn't mention throughout this exercise: as is explained in any good book on refactoring, having tests is a very important pre-condition to do refactorings with confidence.

In the example we considered, the transformations were more or less straightforward, but can we be sure that we didn't alter the (presumably correct) workings of the original code?

## Further Reading
This post just scratched the surface of the many ideas involved in writing clean code. I highly recommend exploring the following materials for a more in-depth look:

+ [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by [Robert C. Martin](https://twitter.com/unclebobmartin?lang=en).

+ [Clean Code Slides](https://docs.google.com/presentation/d/1sZe0yQkoeR1S8IvyQst94hoFKk_Kcu2Gxzf8rHL4ZWM/edit?usp=sharing). I put together this slide deck a couple of years ago while working at [Wizeline](https://www.wizeline.com/).

+ [The Art of Readable Code](https://www.amazon.com/dp/B0064CZ1XE/ref=dp-kindle-redirect?_encoding=UTF8&btkr=1) by [Dustin Boswell](https://twitter.com/dustinboswell?lang=en). Similar in spirit to "Clean Code", but worth reading for the additional insights and angles it presents.

+ [The Clean Code Talks](https://www.youtube.com/playlist?list=PLR5laMT-DcloGDcMKo07sEPZ7HvvD2Job). This is a series of talks by [Miško Hevery](https://twitter.com/mhevery), [Joshua Bloch](https://twitter.com/joshbloch) and other (present and former) Googlers on clean code practices. While it doesn't cover many topics found in the books recommended above, it explores some other topics in great detail, providing very interesting insights.
