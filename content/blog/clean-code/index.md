---
title: "Clean Code"
date: "2020-08-18T22:10:44.085537"
description: "What is Clean Code?"
---

Look at the following function and tell me what's wrong with it:

```python
def isIPV4(txt):
  parts = txt.split('.')
  count = 0
  for i in range(0, len(parts)):
     try:
       v = int(parts[i])
       if v < 0 or v > 255:
         return False
     except Exception:
       return False
     count += 1
  if count == 4:
    return True
  return False
```

Nothing, you say? If so, this post is for you, dear reader. Let's spend the next couple of minutes dissecting this, admittedly contrived, example to see what's wrong with it.

## What is Clean Code?
If you google the term, you'll most likely find references to the famous book ["Clean Code"](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by Robert C. Martin. It's a pretty good book, but I'll save you some money by telling you the gist of it:

> Clean Code is code that is easy to read and maintain.

Of course, I'm oversimplifying what the book has to say about the topic, but after spending a lot of time thinking about it, I can assure you that's the basic idea.

The issue with that definition is that it can be somewhat subjective, and depending on the size of the code in question, it can be easy to dismiss some of the points around it as nonimportant. But trust me on this one, writing maintainable code matters for all but the most trivial projects. Check out the references at the end of this post if you're skeptical about this.

In the meantime, let's analyze how we can simplify and make this code more readable. Perhaps by the end of the exercise I'll have convinced you that writing simpler and more readable code is a good habit to develop as a programmer.

## Idiomatic Code
The example uses some code conventions that are not very common in Python (or as Pythonistas would say, they're not very Pythonic). For example, using camel case instead of snake case for naming the function, or looping through the `parts` list by using an explicit index (something that's pretty common in languages like `C` or `Java`).

Another issue is the use of abbreviations (though this issue is not specific to Python). Let's beging by fixing that and see the resulting code:

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

Perhaps not much of a difference yet, huh? Bear with me, the secret behind improving code substantially in a reliable way (as Martin Fowler has described in his book [Refactoring](https://martinfowler.com/books/refactoring.html)) lies in making lots of small, almost trivial transformations.

## Expressive Code
Is it easy to tell at a glance what our function does? Not really. After spending some time carefully examining it, you might say: _"oh yeah, it splits the incoming text, checks if every resulting piece is an integer in a given range, and reports the result at the end"_.

And this leads us straight into a key insight that can help us write cleaner code:

> Write code that explains at a high-level what your core logic is

So how do we do this? Well, sometimes it helps to put aside the original code for a bit and imagine what it would look like if we were to focus just on the high-level logic, suppressing all other detail for a moment. How about the following?

```python
def is_ipv4(text):
  parts = text.split('.')
  if len(parts) != 4:
     return False
  return all(is_valid_octet(part) for part in parts)
```

This code tells a shorter story and minimizes the details so we can focus on the big picture. It's starting to look and read better already, right?

Notice we did a couple of interesting things as well: we simplified the code by handling negative cases first (the early return when the number of parts is different than four), and we suppressed detail by moving it into a separate function (`is_valid_octet`).

At this point, the implementation of `is_valid_octet` should not really be that important, but let's add it for the sake of completeness:

```python
def is_valid_octet(text):
   return text.isdigit() and 0 <= int(text) <= 255
   
def is_ipv4(text):
  parts = text.split('.')
  if len(parts) != 4:
     return False
  return all(is_valid_octet(part) for part in parts)
```

Notice how we avoided using a `try/except` block and used a more idiomatic way to test whether a value lies in a range, thus simplifying the definition of `is_valid_octet` substantially.

## Summary

The resulting code is simpler and easier to read, but is that it? We made it prettier? No, not quite. Let me state a couple of (perhaps) non-obvious points that justify our efforts.

#### Readability improves programmer efficiency
We read code way more than we write code. That's a fact for the vast majority of programmers. It makes sense to optimize our reading time by structuring our code in ways that make it easy to understand and modify it in the future.

#### Bugs are easier to spot in clean code
Whenever a piece of code is easy to grasp, it's easier to spot mistakes in logic. It's also easier to see a mismatch between implementation and intention (e.g., when the function name says something but the implementation contradicts that). In complex code, this is much harder to do.

#### Programmer frustration decreases with clean code
This may at first seem odd, but our motivation and our ability to remain productive in a project is definitely correlated with the amount of frustration we face on a daily basis with code (which, sadly, turns out to be inherently simple once it's been untangled). Clean code can reduce this daily frustration, thus increasing our productivity.

Besides, who doesn't want to be happy in their job?

## Further Reading
If you found this post interesting or useful, I'm sure you'll find the following materials interesting as well.

+ [Clean Code Slides](https://www.google.com). I put together this slide deck a couple of years ago while working at [Wizeline](https://www.wizeline.com/)
+ [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) by Robert C. Martin. The must-read reference on "Clean Code"
+ [The Art of Readable Code](https://www.amazon.com/dp/B0064CZ1XE/ref=dp-kindle-redirect?_encoding=UTF8&btkr=1) by Dustin Boswell. Similar in spirit to "Clean Code", but worth reading for the additional insights and angles it presents
