---
title: "Test-Driven Development"
date: "2021-02-27T00:00:00.000000"
description: "Why TDD can make you a better programmer"
---

> I'm not a great programmer; I'm just a good programmer with great habits. _Kent Beck_

When I first encountered [Test-Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development), I found the basic premise to be pleasingly logical: "if you’re going to develop a program, it may be useful to start by precisely defining what is needed for that program to work". I think we all basically do this to some extent, thinking about inputs and expected outputs. TDD just makes this very explicit from the get-go.

I remember reading the first few chapters of ["Test Driven Development by Example"](https://www.goodreads.com/book/show/387190.Test_Driven_Development) by Kent Beck[^kent-beck], and finding the short chapters very useful to see TDD in action (i.e., "red, green, refactor" in short cycles of just a few minutes), but at the time I wasn’t able to appreciate the ramifications of such a seemingly simple routine.

I recently read his book again, and it finally dawned on me that behind the simple red-green-refactor recipe, there are several very important ideas that combined together create a fundamentally different way to produce code. These ideas include _problem articulation_, _separation of concerns_, and _incremental development_, all of which combine to produce a less stressful experience during development, leading to happier and more productive coding sessions.

In the rest of this post, I will explore to some extent these ideas.

### Problem Articulation

By forcing us to explicitly express inputs and expected outputs, TDD gives us a chance to define the problem we’re trying to solve more precisely, resolving ambiguities, and sparking ideas about the solution’s design, even before we write the first line of “implementation code”. I believe there is a psychological effect at play here that is quite similar to what happens in the debugging experience that has been dubbed "rubber duck debugging"[^rubber-duck].

Some people have argued that sometimes you simply don’t know precisely what your problem is, and coding is in such cases an exploration tool to help you define a problem more precisely. Their claim is that, in such situations, TDD gets in the way and can be counterproductive. I tend to disagree, as I’ve used TDD to perform such explorations successfully (particularly in non dynamic languages without a [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop)), but I am the first one to admit that it's not the only tool for the job, so I’m not dogmatic on using TDD all the time. Folks used to running things in a REPL (e.g., programmers of various flavors of Lisp, Python or Ruby) know that you can often explore and test things very quickly without any formal tests. For me, the key is to ensure that we can write (exploratory) tests with fluidity and minimal effort (e.g., in Python, [pytest](https://docs.pytest.org/en/stable/) makes writing tests an extremely simple and fluid task.)

### Separation of Concerns

There are several concerns that we try to address when we program, whether we think about it consciously or not. The most obvious one is to make the program do what it’s supposed to do. Defining clearly enough what we’re trying to do is usually another one. As we gain more experience and learn about best practices, the concern of writing “clean code” also gets added to the mix.

However, it is usually very mentally taxing to try and address these concerns all at once. Experienced writers know this, and so they separate their task into stages: first write down all the main ideas; then flesh them out with details; then review and edit from a reader’s perspective; then have someone else review it and make suggestions; etc.

As programmers, we are likely to become more productive by following a similar routine, as it reduces the stress associated with trying to accomplish too many things at the same time. TDD encourages this with its red-green-refactor recipe, by splitting apart the various concerns and focusing on one thing at a time in short feedback loops.

During the “red” phase--when we're not supposed to write any production code until we have a failing test--our focus is on trying to clearly describe what is the problem we're tackling at the moment and how we can model it. During the “green” phase, our focus is on implementing the code that will make our failing test pass as soon as possible, and we're not worried about efficiency, clean internal structure, or anything else. During the “refactor” phase, our focus shifts to thinking about internal structure and API design: removing duplication, making sure the design is clean and elegant, ensuring the API is clear, etc.

### Incremental Development

When I first learned to program, I used to type programs for long periods of time (30 minutes or more) without a single compilation or test (manual or automated) in between. The result, as you may imagine, was a disaster: a program that didn’t even compile and was riddled with errors which I then had to painfully fix one by one. Depending on the difficulty of the program in question, this could take me a few minutes or several hours. More often than not, it was the latter.

At first, I imagined this was just an inevitable part of the job, but eventually I learned that there is a much better way. Perhaps this was initially due to my feeling that testing the program incrementally, and taking short steps between tests, was a bit of a waste of time. Surely I was competent enough to write correct code in the short span of 20 or 30 minutes, right? Well, no, not really. My experience showed me, time and time again, that except for trivial programs, going too long without feedback was always a sure way to get myself confused and overwhelmed by the piling up of multiple errors which could have been easily prevented with a shorter feedback cycle routine.

When I finally saw the results of the incremental approach, I felt as if I had overcome a terrible burden, and I suddenly felt empowered to tackle problems I would have thought very hard to complete before. Every once in a while, I would fall into old habits and revert back to a non incremental approach, usually with bad results. By then, however, I knew what the solution was: start from scratch and develop incrementally, using TDD or perhaps more informal testing on a REPL. Invariably, that strategy was less painful and more effective than trying to debug my way out of the mess I had created.

The power of the incremental development approach lies in its prevention of the negative compounding of errors that lead to long debugging sessions. TDD takes this to its ultimate conclusion and attempts to avoid the issue altogether by working in extremely short feedback cycles.

## Criticisms

As anything that defies the established practices of a profession or field, TDD has not been without its detractors, who have gone so far as to consider it damage-inducing[^tdd-dead]. My personal take is that, like many other ideas (e.g., the agile methodology), it has been misunderstood, distorted over time, and conflated with other somewhat orthogonal issues in software development, so it's not too surprising to see negative reactions to it sometimes.

As most people discover soon after reading about it, learning TDD per se is very simple. The really difficult part lies in adopting it in our everyday development workflow. For some people, the difficulty arises simply out of inertia and the pain that comes with getting out of their comfort zone. For others, the sort of "addictive" effect that is associated with the red-green-refactor loop is not always something that jibes with them.

At any rate, I would encourage anyone who's not practiced TDD before to give it a genuine try for a couple of months after reading the theory. You may just end up pleasantly surprised at the results, or you might end up in a better position to explain others why you exactly you think it doesn't work for you and others.

## Conclusion

For many people, TDD can be a powerful development technique that implicitly recognizes the fact that software is developed by humans, and therefore requires techniques which are aligned with how our brains work.

This, among other things, means recognizing our limitations in tackling more than one problem at a time, our need to get feedback sooner rather than later, and the fact that we don’t always have all of our ideas neatly organized and ready to generate perfect systems the moment we sit in front of our computers.

## Further Reading

- [Test Driven Development by Example](https://www.goodreads.com/book/show/387190.Test_Driven_Development), is the original book written by Kent Beck to explain TDD. A highly recommended read to learn about and experience TDD from the man who invented it.

- [TCR](https://www.youtube.com/watch?v=FFzHOyFeovE) (Test && Commit || Revert) is one of Kent Beck's latest experimental techniques to develop code. If you have found TDD interesting, you might find TCR at least intriguing.

## Notes

[^kent-beck]: [Kent Beck](https://en.wikipedia.org/wiki/Kent_Beck) is generally considered the inventor of TDD, having published his first book about the topic in the early 2000s. However, as he himself admits, the basic premise behind TDD wasn't something new, but the specifics of his method and the analysis of the implications, as well as its popularization in our industry is something we do owe to him.
[^rubber-duck]: It has been anecdotally observed that the mere act of verbalizing a problem can often help people get unstuck by somehow providing a perspective that was not present in a inner dialogue reasoning. The term seems to have been first popularized in the book ["The Pragmatic Programmer"](https://www.goodreads.com/book/show/4099.The_Pragmatic_Programmer). You can read more about it [here](https://en.wikipedia.org/wiki/Rubber_duck_debugging).
[^tdd-dead]: [David Heinemeier](https://twitter.com/dhh), the creator of Ruby on Rails, once gave a talk entitled “TDD is dead. Long live testing” where he asserted that the technique was harmful to software design; afterwards, he wrote an extensive [post](https://dhh.dk/2014/tdd-is-dead-long-live-testing.html) detailing his views on it. Discussion in the community heated up, and soon after, Kent Beck, [Martin Fowler](https://martinfowler.com/) and him got together on a video call to debate the topic. The recordings can be found [here](https://www.youtube.com/watch?v=z9quxZsLcfo), and the points made by Kent Beck are quite illuminating about what TDD is, some of its limitations, the misunderstandings people have developed about it over time, and his agreements and disagreements with David’s views.
