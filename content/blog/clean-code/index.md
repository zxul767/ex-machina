---
title: "Clean Code"
date: "2020-08-18T22:10:44.085537"
description: "What is Clean Code?"
---

Look at the following function and tell me what's wrong with it:

```python {numberLines}
def isIPV4(txt):
    ints = txt.split('.')
    cnt = 0
    for i in range(0, len(ints)):
        try:
            v = int(ints[i])
            if v < 0 or v > 255:
                return False
        except Exception:
            return False
        cnt += 1
    if cnt == 4:
        return True
    return False
```

I'm sure you can see at least a couple of things that can be improved, but how far can you take those improvements? Are they worth the additional effort? If you're curious about this, this post is for you.

## What is Clean Code?
If you google the term, you'll most likely find references to the famous book ["Clean Code"](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by Robert C. Martin. It's a pretty good book that talks extensively about the ideas in this post, but here's a simple definition to get us started:

> Clean Code is code that is easy to read, maintain, and extend

Of course, I'm oversimplifying what the book has to say, but after spending a lot of time reading and thinking about this topic, I do think that's the gist of it.

Most experienced engineers I know tend to agree with the fundamental premise that writing maintainable code--a term I tend to use interchangeably with "clean code"--matters in the real world. If you're still not totally sold on that idea, I'll include some references at the end with hard data to back up this claim.

In the meantime, let's spend some time dissecting and analyzing this (admittedly contrived) example.

## Idiomatic Code
The first thing to catch our attention is that this function uses some code conventions that are not very [Pythonic](https://stackoverflow.com/questions/25011078/what-does-pythonic-mean#:~:text=Pythonic%20means%20code%20that%20doesn,is%20intended%20to%20be%20used.). For example, using camel case instead of snake case for naming the function, or looping through the `ints` list by using an explicit index is something that's pretty common in languages like C or Java but not in Python.

Another issue is the use of non-standard abbreviations (e.g., `cnt`, `txt`), which forces readers to do unnecessary mental gymnastics. Let's begin by fixing those details and see the resulting code:

```python {numberLines}
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

Perhaps not much of a difference yet, but bear with me, the secret behind improving code substantially in a reliable way (as Martin Fowler has described in his book [Refactoring](https://martinfowler.com/books/refactoring.html)) lies in making lots of small, almost trivial transformations.

## Separation of Concerns
One of the things that makes code unnecessarily harder to read is mixing multiple concerns in a single block of code. This is a common mistake for inexperienced programmers. 

In our example, we can see that happening inside the `for` loop: we're trying to parse each `part` into an integer, but we're also keeping track of how many of these parts passed the validation. If we separate these two concerns, perhaps we can make our code a little easier to read:

```python {numberLines}
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

We added some comments as an intermediate step to organize our thoughts, but we should be able to get rid of them by writing code that is completely self-explanatory. In most cases, comments should be reserved to explain _why_ we implemented things in a certain way, not _what_ or _how_ we did it.

## Expressive Code
Is it easy to tell at a glance what our function does? Sort of, but we can probably do better. After some careful examination, we can see that, conceptually speaking, _"we're splitting the incoming text into pieces, checking if there are four pieces, and checking if every piece is a valid octet."_

And this leads us straight into a key insight that can help us write cleaner code:

> Clean Code describes the core logic in a solution at a single level of abstraction by suppressing unnecessary detail

If we try to restructure our code to follow this principle, we get the following:

```python {numberLines}
def is_ipv4(text):
    parts = text.split('.')
    if len(parts) != 4:
        return False
    return all(is_octet(part) for part in parts)
```

This code tells a shorter story and minimizes the details so we can focus on the big picture. This definitely is easier to grasp at a glance.

We can even go one step further and simplify the code as follows:

```python {numberLines}
def is_ipv4(text):
    parts = text.split('.')
    return len(parts) == 4 and all(is_octet(part) for part in parts)
```

This version reads almost like English prose and is quite easy to eyeball for logical errors.

At this point, the implementation of `is_octet` should not really be that important (if we assume the implementation to be correct), but let's add it for the sake of completeness:

```python {numberLines}
def is_octet(text):
    return text.isdigit() and 0 <= int(text) <= 255

def is_ipv4(text):
    parts = text.split('.')
    return len(parts) == 4 and all(is_octet(part) for part in parts)
```

Notice how we avoided using a `try/except` block and used a more idiomatic way to test whether a value lies in a range, thus simplifying the definition of `is_octet` substantially.

## Conclusions
The resulting code is simpler and easier to read, but did we just make the code "prettier"? Is that all we gained by doing these refactorings? On the surface, it may seem so, but let me state a couple of points on why I think this effort goes beyond making things "prettier."

#### Readability improves programmer efficiency
In professional settings, we almost always read code way more than we write code. This is easy to see if you think about the times you've had to add a new feature to an existing codebase, and before you could do so you had to understand how the existing code worked.

The additional upfront cost we pay to make things simpler is dwarfed by the time we would otherwise have to spend making sense of tangled or poorly structured code.

#### Bugs are easier to spot in clean code
Whenever a piece of code is easy to grasp, it's easier to spot mistakes in its logic. It's also easier to see a mismatch between implementation and intent (e.g., when the function name says something but the implementation contradicts it.) In code that doesn't adhere to clean code principles, this is much harder to do.

#### Programmer frustration decreases with clean code
Our motivation and ability to remain productive in a project are strongly correlated with the amount of frustration we face on a daily basis with the codebase (which is often not intrinsically difficult, it just happens to have been poorly structured.) Clean code practices can reduce this daily frustration, thus increasing our productivity and our happiness in the job.

#### Did we miss something?
Yes, there is one thing we didn't mention throughout this exercise: as is explained in any good book on refactoring, having tests is a very important pre-condition to do refactorings with confidence.

In the example we considered, the transformations were more or less straightforward, but can we be sure that we didn't alter the (presumably correct) workings of the original code?

## Further Reading
At the beginning of this post, I assumed that you agreed with the premise that writing clear and maintainable code matters. If you're skeptical about this idea, the "Clean Code" book expands on it and provides references to studies done in the industry in this regard in its first chapter.

If you've been in this industry for a while, you may not need further convincing, having experienced first hand the pain that dealing with legacy codebases implies (typically code that doesn't adhere to clean code practices.)

If you found this post interesting or useful, I highly recommend that you explore the following materials which go into more nuanced detail about this topic.

+ [Clean Code Slides](https://docs.google.com/presentation/d/1sZe0yQkoeR1S8IvyQst94hoFKk_Kcu2Gxzf8rHL4ZWM/edit?usp=sharing). I put together this slide deck a couple of years ago while working at [Wizeline](https://www.wizeline.com/).

+ [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by [Robert C. Martin](https://twitter.com/unclebobmartin?lang=en). The must-read reference on clean code practices.

+ [The Art of Readable Code](https://www.amazon.com/dp/B0064CZ1XE/ref=dp-kindle-redirect?_encoding=UTF8&btkr=1) by [Dustin Boswell](https://twitter.com/dustinboswell?lang=en). Similar in spirit to "Clean Code", but worth reading for the additional insights and angles it presents.

+ [The Clean Code Talks](https://www.youtube.com/playlist?list=PLR5laMT-DcloGDcMKo07sEPZ7HvvD2Job). This is a series of talks by [Miško Hevery](https://twitter.com/mhevery), [Joshua Bloch](https://twitter.com/joshbloch) and other (former) Googlers on clean code practices. While it doesn't cover many topics found in the books recommended above, it explores some other topics in great detail, providing very interesting insights.
