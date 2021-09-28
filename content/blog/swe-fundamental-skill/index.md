---
title: "A Fundamental Developer Skill"
date: "2021-05-01T00:00:00.000000"
description: "Learn how to Google!"
---

Recently I’ve observed a recurrent theme in Facebook programming groups: novice developers asking questions that can be answered by a simple online search. This suggests that they lack a fundamental skill for any software developer: looking up information and learning new things efficiently.

The reason why this is so important is simple: _technology moves really fast_. As software developers, we’re bound to struggle endlessly unless we can learn new things quickly all the time. Whichever specific technologies we learned in college may go obsolete in a few years, and better job opportunities are there for those who can keep up with new developments.

In this post, I will relate several things that I’ve found useful in my own career when it comes to acquiring new knowledge, in the hope that it can be helpful to new or aspiring developers.

## Learning Through Challenge
> Being a student is easy. Learning requires actual work
> — William Crawford

When I was in college, I found most classes dry and boring, and as a result I didn't pay much attention during in-person lectures. However, when it was time to complete projects, I would eagerly scour the Internet, write programs, run experiments, etc., trying to learn everything I didn't during lectures.

Perhaps that’s just how my brain is wired, but I found _learning through challenge_ to be a more rewarding experience, and the knowledge I acquired that way deeper and more meaningful.

Years of doing this led me to develop some research skills[^research-skills] which are now almost like second nature. Along the way, I learned that most questions will usually have an answer online; others can be answered by doing some experimentation; and only for the remaining minority, a post to an online group or forum is warranted. In the latter case, asking questions [“the smart way”](https://wiki.c2.com/?HowToAskQuestionsTheSmartWay) is likely to bring answers more quickly[^smart-questions].

## Google It Efficiently

Imagine that you just recently joined a project written in [Go](https://tour.golang.org/) that uses `goroutines` and you have no idea what they are. Rather than posting a question on Facebook, my first instinct would be to Google `goroutines`, which yields the following top results:

1. [A Tour of Go](https://tour.golang.org/concurrency/1)
2. [Goroutines](https://gobyexample.com/goroutines)
3. [Goroutines - Concurrency in Golang](https://golangbot.com/goroutines)
4. [Understanding Golang and Goroutines](https://medium.com/technofunnel/understanding-golang-and-goroutines-72ac3c9a014d)

Whenever I approach a new topic, I like to do it in layers of abstraction: first by trying to get the gist of the topic, and then incrementally adding more information and nuance.

### Get the Gist of Things

My first step is usually to start by skimming for definitions that give me the gist of things. In this example, I would skim each result for a concise definition of `goroutines`, discarding those that don’t provide clear definitions.

I would then compare the definitions: _Do they all make sense? Can I relate them to things I already know? Are there any discrepancies? Are there concepts in most of the definitions that I don’t know?_

For this example, all definitions I found describe `goroutines` as an abstraction that is similar to threads, is managed by the Go runtime, and is “lighter” than normal threads. There is consistency in the definitions, so this is a good sign that I can probably trust the definitions.

If a definition seems hard to grasp because of unknown terms, I take some time to do a lighter search for those terms as well. If at some point I feel like I’m starting to go down a rabbit hole, I try to look for layman explanations instead of more formal definitions (e.g., using the keyword `eli5`[^eli5], which stands for “explain it like I’m five”)

> One way to search for layman explanations is using the keyword **"eli5"** which stands for “explain it like I’m five”

### Find Good Code Examples

Armed with basic conceptual understanding of the topic, I then look for code examples of the topic I'm researching. In this phase, I need to discriminate between pedagogically good and bad examples to ease my learning curve.

Good examples are concise and focus on one concept. Bad examples conflate too many concepts, or have distracting and unimportant details.

The [second link](https://gobyexample.com/goroutines) above contains a code example that falls into the second category: besides `goroutines`, it involves other concepts (e.g., anonymous functions, and wait groups). As a beginner, I may not immediately realize that these concepts are only tangentially related, but not essential to understanding the gist of `goroutines`.

The [first link](https://tour.golang.org/concurrency/1) is a better example which contains just the essential concepts. It also has a great advantage: it provides a sandbox to run and play with the code. This turns learning from a passive activity into an interactive one:

```go
package main

import (
	"fmt"
	"time"
)

func say(s string) {
	for i := 0; i < 5; i++ {
		time.Sleep(100 * time.Millisecond)
		fmt.Println(s)
	}
}

func main() {
	go say("world")
	say("hello")
}
```

I cannot stress this enough: software development is an interactive activity that is only learned deeply with practice and experimentation. Watching a video tutorial on YouTube is a fine way to get familiar with a concept[^youtube], but just as you wouldn’t expect to become a great basketball player just by watching games on TV, you can’t expect to master programming simply by watching other people online.

### Play With The Code

Once I’ve gotten the gist of a topic and seen some examples, a crucial next step is to run my own experiments. This is an opportunity to deepen my understanding by tinkering with the code and discovering things the theory didn't tell me.

In the `goroutines` sample code above, I might be curious to understand how multiple function invocations of the same function are scheduled. If I run the following snippet a few dozen times, I may get a probable answer:

```go
package main

import (
	"fmt"
	"time"
)

func fn(from string) {
	for i := 0; i < 3; i++ {
		fmt.Println(from, ":", i)
	}
}

func main() {
	for i := 0; i < 5; i++ {
		go fn(fmt.Sprintf("iteration: %d, goroutine 1", i))
		go fn(fmt.Sprintf("iteration: %d, goroutine 2", i))
		time.Sleep(time.Millisecond * 50)
	}
	fmt.Println("done")
}
```

```bash
➜  swe-basics git:(master) ✗ go run test.go
iteration: 0, goroutine 2 : 0
iteration: 0, goroutine 2 : 1
iteration: 0, goroutine 2 : 2
iteration: 0, goroutine 1 : 0
iteration: 0, goroutine 1 : 1
iteration: 0, goroutine 1 : 2
...
iteration: 2, goroutine 2 : 0
iteration: 2, goroutine 2 : 1
iteration: 2, goroutine 2 : 2
iteration: 2, goroutine 1 : 0
iteration: 2, goroutine 1 : 1
iteration: 2, goroutine 1 : 2
iteration: 3, goroutine 2 : 0 # highlight-line
iteration: 3, goroutine 1 : 0 # highlight-line
iteration: 3, goroutine 2 : 1 # highlight-line
iteration: 3, goroutine 2 : 2 # highlight-line
iteration: 3, goroutine 1 : 1 # highlight-line
iteration: 3, goroutine 1 : 2 # highlight-line
...
done
```

A cursory inspection of this output might make me believe that the scheduling is deterministic (see the `2 2 2 1 1` pattern in the first half), but then in the third iteration (highlighted above), I can see this is not always the case.

### Explain It To Others
> You teach best what you most need to learn
> — Richard Bach

The act of active recall is one of the most effective ways to solidify my learning in any topic. To that effect, explaining a topic to others is an excellent way to practice active recall. 

Oftentimes this will reveal gaps in my knowledge, forcing me to review the topic. That’s perfectly normal, and there’s even a name for it: the [Feynman Technique](https://fs.blog/2021/02/feynman-learning-technique/), after the [famous physicist](https://en.wikipedia.org/wiki/Richard_Feynman) who used to use a very similar technique to learn concepts deeply.

# Conclusion

Novice programmers tend to spend a lot of time chasing course after course on specific technologies that are trending at the moment, but often neglect the development of the most fundamental skill in our field: the ability to research and learn new information efficiently. Or, as some people might put it these days: "Learning how to Google!"

While it's definitely not a skill one can acquire overnight, it is one that is likely to pay off handsomely in the long term, so it's worth taking the time to deliberately improve it.

Happy Hacking!

<!-- Foot Notes -->

[^research-skills]: Notice that this is quite different from academic research, which has higher standards and protocols than is necessary for the kind of informal research that software developers usually need in their daily jobs.

[^smart-questions]: Some people have seen this as a form of gatekeeping, but in my own experience I always found that, by asking questions the smart way, I would often get an answer more quickly (sometimes even by myself simply by forcing me to put more effort in my own research.)
[^eli5]: For an example, check out the results of Googling “bitcon eli5”. At the time of writing, [this](https://www.reddit.com/r/explainlikeimfive/comments/12knie/eli5_bitcoins/) is the top result. Of course, just because someone attempted to explain something simply, it doesn’t mean they succeeded at doing so, so we still have to apply the same techniques mentioned in this post to discriminate between various levels of content quality.
[^youtube]: I do watch YouTube videos to get familiar with some concepts or to reinforce or compare what I’ve learned in other ways, but they definitely tend to be slower to consume. I usually watch them at 2x the speed, unless the speaker already speaks very fast, or there are too many new ideas for me to process that fast (in which case I may slow down to 1.5x or 1.25x.)
[^neural-nets]: When I first encountered the backpropagation algorithm for neural networks, I was very confused about what exactly was going on. I could follow the details mechanically since I had a background in calculus, but I couldn’t see the intuition of why it all made sense. I had to dig up many other posts, videos and materials, until the various views combined to make sense together.
