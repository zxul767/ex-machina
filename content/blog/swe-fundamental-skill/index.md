---
title: "A Fundamental Developer Skill"
date: "2021-05-01T00:00:00.000000"
description: "The most important survival skills for developers"
---

Recently I’ve observed a recurrent theme in Facebook programming groups: aspiring developers asking questions that can be answered by running a simple online search. This seems to suggest that they lack a fundamental skill for any software developer: looking up information and learning new things efficiently. 

If you're an outsider to this industry, it may not be obvious why this is so important, but the reason is simple: _technology moves really fast_. 

As software developers, we’re bound to struggle endlessly unless we can learn new things fast all the time. Whatever specific technologies we learned in college or in a coding bootcamp may go obsolete within a few years, and better job opportunities tend to be more accessible to those who can adapt and learn new concepts and technologies quickly.

In this post, I will relate several things that I’ve found useful in my own career when it comes to acquiring new knowledge, in the hope that it can be helpful to new or aspiring developers.

## Research Skills
When I was in college, I found most classes dry and boring, and as a result I didn't pay much attention during in-person lectures. However, when it was time to prepare for exams, solve problem sets or complete projects, I would eagerly hit the books, scour the Internet, write programs, run experiments, etc., trying to learn everything I didn't during lectures. Perhaps that’s just how my brain is wired, but I found _learning through challenge_ to be a more rewarding experience, and the knowledge I acquired that way deeper and more meaningful.

Years of doing this--plus some natural curiosity--led me to develop some research skills[^research-skills] which are now almost like second nature. Along the way, I learned two things: about 75% of questions will usually have an answer online (in some blog post, StackOverflow answer, official documentation, etc.) so it’s just a matter of searching efficiently; about 20% are things that can be answered by doing some experimentation (perhaps combined with some additional online research); and the remaining 5% may warrant posting to a group or forum. In the latter case, asking questions [“the smart way”](https://wiki.c2.com/?HowToAskQuestionsTheSmartWay) is likely to bring answers more quickly[^smart-questions].

> About 75% of questions will usually have an answer online (in some blog post, StackOverflow answer, official documentation, etc.) so it’s just a matter of searching efficiently.

## Searching Efficiently
Let’s imagine, for example, that you just recently joined a project written in [Go](https://tour.golang.org/) that uses “goroutines” and you have no idea what they are. Rather than going to a Facebook group to ask for a tutorial recommendation, my first instinct would be to run an online search with the keyword “goroutines”, which at the time of writing yields the following results in the first page:

1. [A Tour of Go](https://tour.golang.org/concurrency/1)
2. [Goroutines](https://gobyexample.com/goroutines)
3. [Goroutines - Concurrency in Golang](https://golangbot.com/goroutines)
4. [Understanding Golang and Goroutines](https://medium.com/technofunnel/understanding-golang-and-goroutines-72ac3c9a014d)

If you’re not used to searching information on a daily basis, you might be tempted to read each link in its entirety, and perhaps jump to the next link as soon as you feel like you’re not making sense of the information. However, whenever I approach a new topic, I like to do it in layers: first by trying to get the gist of the topic, and then incrementally adding more information and nuance.

> Whenever I approach a topic, I like to do it in layers: first by getting the gist of the topic, and then incrementally adding more information and nuance.

### Getting the Gist of Things
My first step is usually to start by skimming for definitions that give me the gist of things. In this example, I would skim each article for a concise definition of “goroutines”, discarding (for this step only) those that don’t provide clear definitions. I would then compare the definitions: _Do they all make sense? Can I relate them to things I already know? Are there any discrepancies? Are there concepts in most of the definitions that I don’t know?_

For this “goroutines” example, these are the definitions I found after quickly skimming the articles:

+ _“Goroutines are functions or methods that run **concurrently** with other functions or methods. Goroutines can be thought of as **lightweight threads**. The cost of creating a Goroutine is tiny when compared to a thread.”_

+ _“A goroutine is a **lightweight thread** managed by the **Go runtime**.”_

+ _“Goroutines are a Golang **wrapper on top of threads** and managed by **Go runtime** rather than the operating system.”_

These three definitions describe “goroutines” as an abstraction that is similar to threads, which is managed by the Go runtime, and which is “lighter” than normal threads. There is consistency in the definitions, so this is a good sign that I can probably trust the definitions.

If one or more definitions seem hard to grasp because there are gaps in my knowledge about various terms that appear in them, that's a hint that I’d better spend some time doing some research on those concepts too (by following these same steps on whatever terms I’m unfamiliar with.)

If at some point I feel like I’m starting to go down a rabbit hole that never ends, I will try to look for layman explanations instead of more formal definitions (e.g., one way to search for layman explanations is using the keyword “eli5”[^eli5], which stands for “explain it like I’m five”)

> One way to search for layman explanations is using the keyword **"eli5"** which stands for “explain it like I’m five”

### Show Me The Code
Armed with basic conceptual understanding of the topic at hand, I then look for code samples (which for programming topics is applicable most of the time). 

In this phase, I need to discriminate between good and bad examples to avoid complicating my learning unnecessarily. Good examples tend to focus on the concept they’re trying to demonstrate, they’re short and to the point, avoiding clutter and other distractions. The [second link](https://gobyexample.com/goroutines) we found above contains a code sample, but it has a drawback: it mentions a couple of other concepts (e.g., anonymous functions, and wait groups). As a beginner, I may not immediately realize that these concepts are only tangentially related, but not essential to understanding the gist of “goroutines”.

If we look at the [first link](https://tour.golang.org/concurrency/1), we’ll see a better example which contains just the essential concepts. It also has a great advantage: it provides us with a code sandbox that we can use to tinker with the code. This turns our learning from a passive activity into an interactive one:

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

I cannot stress this enough: software development is an interactive activity that is only learned deeply with practice, experimentation and making mistakes along the way. Getting used to learning programming topics this way will pay off handsomely in the long term.

Watching a video tutorial on YouTube may be a fine way to get familiar with a concept[^youtube], but just as you wouldn’t expect to become a great basketball player (or whatever is the national sport in your country) just by watching games on TV, you can’t expect to master programming concepts or technologies simply by watching other people online.

### Experiment
Once I’ve grown comfortable with a new topic both conceptually and by running some sample code, there comes a big step which is crucial to move on to the next level of understanding: running my own experiments.

Rather than just being content to see the output of the sample code, this is an opportunity to deepen my understanding by tinkering with the code, making hypotheses and testing them by running the modified code. The value of doing this comes from being able to confirm assumptions (or realize there are gaps in our understanding). 

In the "goroutines" sample code above, I might be curious to understand how multiple function invocations of the same function are scheduled. If I run the following snippet a few dozen times, I might get a probable answer:

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

Depending on how much time I have available, I may even try to see if I can incorporate some of this new knowledge in existing projects as experimental features.

### Explain It To Others
The act of active recall is probably one of the most effective ways to solidify my learning in any topic. To that effect, explaining a topic to others (in an informal conversation, in written form as a blog post, etc.) is an excellent way to practice active recall. Oftentimes this will reveal gaps in my knowledge, forcing me to review the source material to deepen my understanding. That’s perfectly normal, and there’s even a name for it: the [Feynman Technique](https://fs.blog/2021/02/feynman-learning-technique/), after the [famous physicist](https://en.wikipedia.org/wiki/Richard_Feynman) who used to use a very similar technique to learn concepts deeply. 

Personally, I find that writing is what works best for me. There’s not been a single time that I wrote a blog post and didn’t find gaps in my knowledge about the topic at hand.

I started this blog precisely because I wanted to know whether writing down ideas really made them stick more in my head. Not only did I find that to be the case, I also found that writing things down invariably led me to explore topics much more deeply.

## Learning Efficiently
Searching for little pieces of information to get a task done or gain some cursory understanding about a topic is a great skill, but what happens when we need to learn a larger set of related topics (e.g., we want to learn what is all the fuss about machine learning)?

Well, in the extreme, we could just apply what I’ve described above and search bits and pieces of information that we’ll surely run into as we start exploring a topic. However, unless you prefer discovering things in an unstructured, exploratory manner by yourself, perhaps taking a course, reading a book, or even taking a specialization (e.g., a [nanodegree](https://www.udacity.com/nanodegree) in Udacity), could be a better path to get a more structured introduction to a complex topic.

If you choose that route, you’re likely to have to commit a considerable amount of hours to reading materials, watching lectures, doing exercises, etc., and the question of how to most effectively learn becomes very relevant.

### No Single Source of Truth
There is no universal recipe for anyone to learn more efficiently. This is simply because we are very diverse in how we process information (although more recent [research](https://nesslabs.com/learning-how-to-learn) has contested the long-held idea that people fall into one of various learning styles.)

Personally, something that has worked very well for me is to always explore various resources and types of media (books, blog posts, videos, podcasts, etc.), trying to see a topic from various angles, looking for common points, contradictions, and nuanced takes.

The purpose of my learning is also crucial to choose the strategy I use. If I’m just trying to get familiar with something out of curiosity, I may use a less active approach than what I described in the previous section, and instead opt to just watch a few short videos just to “dip my toes in the water.” On the other hand, if I’m trying to understand something more deeply, I will definitely use a more active approach, combining material from various sources. 

For complex topics (e.g., [how neural networks learn](https://zxul767.dev/backpropagation))[^neural-nets], even the best explanations sometimes leave gaps that we can only cover by watching, reading, experimenting, etc., with multiple perspectives by various authors. It’s like that old story of [the blind men and the elephant](https://en.wikipedia.org/wiki/Blind_men_and_an_elephant): the only way to get a strong grasp of something is if we integrate multiple perspectives.

### Side Projects
This bears repeating: the most significant learning in software development comes with practice. 

The best possible scenario is when I have a chance to practice at work what I’ve just recently learned. However, this is not always the case. And even when it is, the specific circumstances surrounding my current project might make it infeasible to experiment as freely as I might want to. If that’s the case, the solution is simple: I create my own side projects to experiment with. 

These side projects might range from simple toy projects to test my knowledge and understanding of something, to perhaps something more ambitious where I can put into practice many more things, and also feel more motivated to push things through to completion.

In today’s computing world, many projects that just a decade ago were infeasible or very hard to do with a modest budget, have become feasible thanks to cloud computing offerings from various vendors, going from virtual machines, to managed databases, to CI/CD pipelines, all the way to free GPU access (e.g., see [Google Colab](https://colab.research.google.com/github/tensorflow/examples/blob/master/courses/udacity_intro_to_tensorflow_for_deep_learning/l01c01_introduction_to_colab_and_python.ipynb) or [Paperspace](https://gradient.paperspace.com/notebooks)) to train machine learning models.

### Learning How To Learn
Even though we spend almost all of our careers learning new things, we don’t often stop to think whether we can significantly improve how we learn. We go through life perhaps thinking that the ability to learn is innate in each person and somewhat fixed, so we don’t even bother to try and improve it. For instance, it’s “common knowledge” that unless we learned a foreign language as kids, we will have a much harder time learning one as adults. However, there’s reason to believe this is not really always the case.

If you're interested in this topic, [Coursera](https://www.coursera.org) has a course entitled [“Learning How To Learn”](https://www.coursera.org/learn/learning-how-to-learn) where you can learn about techniques to boost your learning skills, all based on principles of how the brain works. 

As I mentioned earlier, while I don’t think there’s a universal recipe for learning due to our individuality, it is nonetheless undeniable that all humans share common traits when it comes to how our brains work, so it is worth trying some of the techniques presented in that course.

Two techniques I have found particularly useful to retain information long-term are _Priming_, _Thinking Deeply_ and _Summarizing_.

#### Priming
Simply put, priming is “warming up” your brain to the context of the new skill or topic you’re trying to learn. For example, it has been observed that students who are about to learn a new language and are exposed early on to auditory input (e.g., radio programs in the new language) even when they don’t understand a thing initially, are more likely to learn faster once a formal course begins. 

This may seem a bit like magic, but it’s really just our brain at work--in particular our neocortex--which is constantly looking to make sense of patterns (visual, tactile, auditory, etc.), finding structure which will be mapped to existing knowledge later on.

In the context of programming, priming can take many forms. If I’m about to take a course on functional programming, listening to a podcast episode on it during my daily commute, reading a [comic strip](https://xkcd.com/1312/) on it, skimming over what people are [tweeting](https://twitter.com/search?q=functional%20programming&src=typed_query) about it, etc., are all forms of starting to immerse my brain in the ideas surrounding functional programming. This will prove useful later on, even if at first I find myself not understanding everything I hear or read.

#### Thinking Deeply
Thinking deeply about what we just read or watched in a video is for some reason one of the most neglected aspects of learning. Perhaps that's because it is taken for granted, but when we set out to explicitly do it, the results are often quite surprising.

Whenever I approach a new topic, I try to explicitly think about the things I already know or the things I can imagine or conjecture about it. For example, if I'm about to take a course on how compilers work, I begin by thinking about how I would build a compiler myself if I had no other recourse but my own existing knowledge and nothing else:

> I imagine that I will need a way to open the file with the source code, read the program and turn it into some intermediate representation, which I can then use to generate low-level machine code. 

> I also imagine that I may need some way to detect syntax errors and keep information about the locations of the errors in the original file so that I can show useful error messages to the user.

I may not be able to actually build a compiler by just thinking about it, but this "simple" act puts my mind in a more receptive state. It will also deepen my understanding as I take the course and realize that some of my assumptions and conjectured solutions were either wrong, correct or generally on the right track.

#### Summarizing
Oftentimes a topic can be difficult because of all the intricate details it entails. However, if I manage to get a hold of the fundamental ideas, I can often forget about the details and simply look them up when needed. This is what summarizing is all about: identifying key ideas and their relationships, and suppressing unnecessary detail. 

> This is what summarizing is all about: identifying key ideas and their relationships, and suppressing unnecessary detail. 

This is one of my favorite techniques when I'm trying to learn deeply a topic, as I know it guarantees long-term retention and the ability to see connections to other ideas and topics. It is obviously more time-consuming, but its long-term benefits make it completely worth it. 

## Conclusion
Novice programmers tend to spend a lot of time chasing course after course on specific technologies that are trending at the moment, but often neglect the development of the most fundamental skill in our field: the ability to research and learn new information efficiently. Or, as some people might put it these days: "Learn how to Google!"

While it's definitely not a skill one can acquire overnight, it is one that is likely to pay off handsomely in the long term, so it's worth taking the time to deliberately start making it part of our daily routines.

Happy Learning!

<!-- Foot Notes -->
[^research-skills]: Beware that I am not claiming to be an academic professional researcher. Academic research has higher standards and protocols which are not usually necessary for the kind of more informal research that software developers need to do.

[^smart-questions]: Some people have seen this as a form of gatekeeping, but in my own experience I always found that, by asking questions the smart way, I would often get an answer more quickly (sometimes even by myself simply by forcing me to put more effort in my own research.)

[^eli5]: For an example, check out the results of Googling “bitcon eli5”. At the time of writing, [this](https://www.reddit.com/r/explainlikeimfive/comments/12knie/eli5_bitcoins/) is the top result. Of course, just because someone attempted to explain something simply, it doesn’t mean they succeeded at doing so, so we still have to apply the same techniques mentioned in this post to discriminate between various levels of content quality.

[^youtube]: I do watch YouTube videos to get familiar with some concepts or to reinforce or compare what I’ve learned in other ways, but they definitely tend to be slower to consume. I usually watch them at 2x the speed, unless the speaker already speaks very fast, or there are too many new ideas for me to process that fast (in which case I may slow down to 1.5x or 1.25x.)

[^neural-nets]: When I first encountered the backpropagation algorithm for neural networks, I was very confused about what exactly was going on. I could follow the details mechanically since I had a background in calculus, but I couldn’t see the intuition of why it all made sense. I had to dig up many other posts, videos and materials, until the various views combined to make sense together.
