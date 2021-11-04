---
title: "Syntactic Abstractions"
date: "2021-08-15T00:00:00.000000"
description: "Every language has a superpower. Common Lisp's is macros!"
---

Have you ever wished your language supported some feature to avoid writing so much boilerplate code? For example, maybe you use maps in Java a lot and have to write code like this often:

```java
Map<String, String> myMap = new HashMap<String, String>() {{
    put("a", "b");
    put("c", "d");
}};
```

Wouldn't it be great if the language allowed you to create simpler syntax for this common pattern? Maybe something like:

```java
Map<String, String> myMap = { ("a", "b"), ("c", "d") };
```

If you're using Java, Python, or any other mainstream language, you may have to request the feature, perhaps submit a proposal yourself if you want to expedite the process, and wait several months (or years!) before it gets reviewed and accepted by some committee. 

Don't you wish there was an easier way to get this feature? Well, it turns out there is an easier way and [Common Lisp](https://gigamonkeys.com/book/introduction-why-lisp.html) has the answer!

If you're curious to see how macros in Common Lisp can solve your problem in minutes or hours instead of months or years, keep reading! 

## Every Language has a Superpower
Every programming language is supposed to have a "superpower". For example, C can help you write "portable assembly", and C++ gives you a way to write efficient abstractions. Some others are initially created just to scratch their creator's itch, but eventually take off for unexpected reasons (e.g., Larry Wall developed Perl to solve a personal problem, but his creation caught on and eventually became "the duct tape of the Internet", well-known for its text-processing capabilities.)

If you've ever heard about Lisp--of which Common Lisp is a modern descendant--you may know that it's a language that was originally invented to support research in Artificial Intelligence back in the 1950s. Along with FORTRAN, it's one of the oldest languages still in use with a small but active community.

Lisp is also known for having pioneered many features we take for granted in modern languages (e.g., automatic storage management, dynamic typing, higher-order functions, etc.), but one of its lesser known but very powerful features is macros. In a nutshell, macros are code generators that run during the compilation process, allowing the creation of syntactic abstractions[^syntactic-abstractions] and Domain-Specific Languages (DSLs[^dsl].) 

> Macros are code generators that run during the compilation process, allowing the creation of syntactic abstractions and Domain-Specific Languages (DSLs)

Macros look very similar to regular functions--though they do have some important differences[^macros-vs-funcs]--but they are automatically called by the compiler and their results inserted into the surrounding code. Unlike text macros in C/C++ that perform plain and dumb text substitution, macros in Common Lisp are the real deal, giving you access to the internal representation of the program. 

With full access to the language's machinery, the transformations that they perform on source code can be as simple as interpolation, and as complex as full-blown programming language [transpilation](https://en.wikipedia.org/wiki/Source-to-source_compiler). What makes macros in Common Lisp so seamless is the fact that source code is represented as lists (the most pervasive data structure in the language), so its manipulation is quite natural.

To make this more concrete, let's take a look at an example where macros could provide a neat solution.

## A Language for Length Units
Imagine we've been tasked with writing a library to perform sums on length quantities (e.g., `1 meter`, `2 feet`, etc.), with optional conversion to a target unit (e.g., `5 feet and 5 inches in meters`). To accomplish this we have written a small Python library that can be used as follows:

```python
meters(meters(1) + feet(2))  # => meters(1.6096)
meters(feet(5) + inches(5))  # => meters(1.65)
```

Though this solution is not bad, it would be great if we could write the above more succinctly like this:

```bash
1m + 2ft in m
5ft + 5in in cm
```

Accomplishing this will require that we implement our own `parse` and  `eval` functions and use them like this:

```python
length = eval(parse("1m + 2ft in m"))
# Of course, one can always provide a shortcut:
# length = e("1m + 2ft in m")
```

This works, but it has the disadvantage that we'll need to maintain our own parser, and strings are not checked by the compiler for syntax errors, so we'll need some other way to compensate for this (e.g., more extensive unit tests.)

If our mini language were to grow (e.g., by adding more operators or syntax), we'd need to extend our `parse` and `eval` functions accordingly. And the more complex our language becomes, the more difficult it will be to maintain them. 

I'm not the first one to consider this, of course. If you'd like to see the nitty-gritty details of what this would entail, you check out [this post](https://dbader.org/blog/writing-a-dsl-with-python).

### Macros to the rescue!
Macros in Common Lisp provide a neat solution for this problem by allowing the creation and embedding of mini languages (a.k.a. DSLs) into regular Common Lisp.

To give you a taste for what this would look like, here's the equivalent code for our Python examples above when evaluated in Common Lisp's [REPL](https://en.wikipedia.org/wiki/Read%E2%80%93eval%E2%80%93print_loop):

```
CL-USER> (u% (+ 5ft 5in) in cm)
(165.1 . :cm)

CL-USER> (u% (+ 1m 2ft) in m)
(1.6096 . :m)
```

`(165.1 . :cm)` is a tuple of two elements representing the amount and the unit that results from evaluating the expression.

The symbol `u%` is not a special keyword but rather just an arbitrary token we chose to name the macro that evaluates our DSL. Unlike most other languages, Common Lisp is much more permissive in what characters can be used to create identifiers. 

What the macro invocation `(u% (+ 5ft 5in) in cm)` receives are the _parsed but unevaluated_ expressions `(+ 1ft 5in)`, `in`, and `cm`. Notice that using a regular function wouldn't work here because the arguments would be evaluated first and the results then passed to the function. In this case, this would involve evaluating `1ft` which would raise an "unbound variable" error.

The macro's job is then to transform its arguments into an expression that can be compiled as pure Common Lisp (i.e., into the kind of expression we'd have to write if we didn't have macros), namely:

```lisp
(convert-to-unit (sum-lengths (meters 1) (feet 2)) :cm)
```

Notice that thanks to the optimizations implemented in our DSL (e.g., [constant folding](https://en.wikipedia.org/wiki/Constant_folding)), the above macro call would actually expand to the following:

```lisp
(convert-to-unit (meters 1.651) :cm)
```

***
#### 💭 What's up with all those parentheses?!
_If you're wondering what's up with all those parentheses, here's the short story: Common Lisp uses [prefix syntax](https://en.wikipedia.org/wiki/Polish_notation), so instead of `1 + 2 + 3`, we write `(+ 1 2 3)`. Moreover, operators and functions are treated uniformly, so instead of doing `eval(arg1, arg2)`, we do `(eval arg1 arg2)`. This results in more parentheses but also makes the language simpler by having less concepts and syntax to learn._

_To give you a taste for how this changes the way we write programs, consider the `fibonacci` function in both Python and Common Lisp:_

```python
def fibonacci(n):
   if n == 0 or n == 1:
      return n
   return fibonacci(n-1) + fibonacci(n-2)
```

```lisp
(defun fibonacci (n)
  (if (or (= n 0) (= n 1))
      n
      (+ (fibonacci (- n 1))
         (fibonacci (- n 2)))))
```

_You can see that despite the differences, once you get used to visually ignoring the parentheses, code in Common Lisp is just as readable._

***

### Implementing the Macro

Depending on how robust we want our macro to be, we could also ensure that it raises errors whenever something in the DSL is not as expected. For example, the expression: `(u% (+ 1m 1h))` should probably raise an error saying that `1h` is an invalid unit of length.

Notice also that, in this particular instance, the translation from our DSL to the implementation API is quite direct (`1m` maps to `(meters 1)`, `(+ 1m ...)` maps to `(sum-lengths (meters 1) ...)`), but within a macro we can manipulate the [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) that we are given in arbitrary ways (yes, what a macro receives is technically a bare-bones AST[^barebones-ast]), so we have quite a lot of freedom and power!

This is what the definition of the macro and a couple of its helper functions look like:

```lisp
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Entry Point
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defmacro u% (expression &optional (in :in) (target-unit :m))
  (unless (valid-unit-p target-unit)
    (error "~a is not a valid length unit." target-unit))
  (unless (member in '(in :in))
    (error "Expected `in` keyword after expression; got: ~a" in))
  (let ((result (parse-dsl expression))
        (target-unit (ensure-keyword target-unit)))
    (if (and (length-constant-p result) (eq target-unit :m))
        result
        `(convert-to-unit ,result ,target-unit))))
```

```lisp
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Parsing
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(defun parse-dsl (expression)
  (let ((result (rest (try-parse-dsl expression))))
    (fold-constants result)))

(defun try-parse-dsl (expression)
  (cond ((symbolp expression)
         (try-parse-constant expression))
        ;; a string, integer, float, ..., i.e., a primitive
        ((not (consp expression))
         (mark-as-untouched expression))
        ((symbolp (first expression))
         (try-parse-operation expression))
        ;; try and see if there are parseable symbols deeper in the tree
        (t (try-parse-list expression))))

(defun try-parse-list (expression)
  (let* ((parsed-items (mapcar #'try-parse-dsl expression))
         (raw-args (mapcar #'cdr parsed-items)))
    (if (every #'untouched-p parsed-items)
        (mark-as-untouched expression)
        (mark-as-parsed `,raw-args))))

(defun try-parse-constant (symbol)
  (dbind (amount . unit) (try-parse-unit (symbol-name symbol))
    (mark-as-parsed
     (case unit
       ((:m) `(meters ,amount))
       ((:cm) `(meters ,(convert-amount amount :cm :m)))
       ((:mm) `(meters ,(convert-amount amount :mm :m)))
       ((:ft) `(feet ,amount))
       ((:in) `(feet ,(convert-amount amount :in :ft)))
       (otherwise (mark-as-untouched symbol))))))

;; ...
```

I've omitted all other helper functions for brevity, but you can find the whole implementation in this [gist](https://gist.github.com/zxul767/85d79f7bdf993753f9e01c986ab13f2a) if you're curious. 

Notice that because macros have access to the whole machinery of the language, we are able to fold constants (i.e., to reduce expressions which only contain constant quantities) and do any other complex transformations as part of the macro expansion. Notice also that, just like regular functions, the main macro `u%` can delegate part of its work to other functions (and macros), to keep the code generator readable for humans.

This is a small but nontrivial example to give you a taste for what's possible with macros, but you can also implement quite sophisticated and powerful embedded languages, as you'll see in the next section.

## The LOOP macro 

If you know Python, you're probably at least familiar with [list comprehensions](https://realpython.com/list-comprehension-python/), and maybe it's even one of your favorite features. They're like a mini language for iteration, and can come in handy for many programs. For example, if you wanted to compute the following expression:

$$
S = \sum_{k=1}^{N}{k^2}
$$

You could do it in Python quite simply as:

```python
result = 0.0
for k in range(1, N+1):
   result += k**2
```

Or you could do it in a one-liner using a list comprehension:

```python
sum(k**2 for k in range(1, N+1))
```

Does Common Lisp have a similar feature? Not as part of the language itself, but with macros you can always design your own DSL and implement something similar. In fact, looping is such a common operation that Lisp hackers[^lisp-hackers] created the `loop` macro which can do everything list comprehensions can do and more. This is what the equivalent version looks like:

```lisp
(loop for k from 1 to 10 summing (expt k 2))
```

It is slightly more verbose, but arguably more readable. To convince you that this is a macro, and not just some special construct in the language, here's the code that it expands to[^macro-expansion]:

```lisp
(block nil
  (let ((k 1))
    (declare (ignorable k)
             (type (and real number) k))
    (sb-loop::with-sum-count #S(sb-loop::loop-collector
                                :name nil
                                :class sb-loop::sum
                                :history (sb-loop::sum)
                                :tempvars (#:loop-sum-641)
                                :specified-type nil
                                :dtype number
                                :data nil)
      (tagbody
       sb-loop::next-loop
        (when (> k '10) (go sb-loop::end-loop))
        (setq #:loop-sum-641 (+ #:loop-sum-641 (expt k 2)))
        (sb-loop::loop-desetq k (1+ k))
        (go sb-loop::next-loop)
       sb-loop::end-loop
        (return-from nil #:loop-sum-641)))))
```

`loop` is designed to generate fast code at the expense of human readability, hence the somewhat messy code above. This is usually not a problem since `loop` has been extensively tested and debugged, and its expansion is never directly seen in source code (remember that the compiler transparently performs macro expansion for you). The only time you may need to look at a macro's expansion after it's first written, is when you need to debug it.

The `loop` macro goes beyond list-comprehension behavior and implements a pretty sophisticated iteration language. Here are few additional examples to give you a taste for its power:

```lisp
(defun fibonacci (n)
  (loop for i below n
        and a = 0 then b
        and b = 1 then (+ b a)
        finally (return a)))
```

Notice how it seamlessly combines regular Common Lisp with `loop`'s specific syntax (e.g., `i = 0 then (+1 i)` is not valid syntax, but the `loop` macro will rewrite it into equivalent valid Common Lisp code.)

```lisp
;; https://en.wikipedia.org/wiki/Collatz_conjecture
(defun collatz (n)
  (loop
    for i = 0 then (1+ i)
    while (not (= 1 n))
    do
       (if (evenp n)
           (setf n (/ n 2))
           (setf n (1+ (* 3 n))))
    finally (return i)))
```

```lisp
(loop for x across "the quick brown fox jumps over the lazy dog"
      count (find x "aeiou"))
```

## Conclusion
Macros is the one feature that distinguishes Common Lisp (and other Lisp dialects, such as [Scheme](https://en.wikipedia.org/wiki/Scheme_(programming_language)) and [Clojure](https://clojure.org/)), from most other languages. It's a powerful feature that gives us a hook into the compilation process, allowing us to implement syntactic abstractions, which can be as simple as removing simple boilerplate code, and as powerful as writing full embedded DSLs (using the principles of Domain-Drive Design[^ddd]) or creating new control-flow constructs.

This post was meant to give you only a high-level view of what macros have to offer. I've purposefully limited the discussion to a glance of what macros look like and what they can do for you. However, if your curiosity has been sparked and you want to take a deeper dive, the **Further Reading** section will point you in the right direction.

### Do other languages have macros?
Yes! Just as many languages took inspiration from Lisp and implemented garbage collection and other features it pioneered, macros have been added--in ways which may not always match their Common Lisp counterparts--in quite a few languages, including [Scala](https://docs.scala-lang.org/overviews/macros/overview.html), [Haskell](https://downloads.haskell.org/~ghc/7.0.3/docs/html/users_guide/template-haskell.html), [Ruby](https://codeburst.io/ruby-macros-18bb67e051c7), and [several others](https://softwareengineering.stackexchange.com/questions/164665/programming-languages-with-a-lisp-like-syntax-extension-mechanism). 


## Further Reading
+ 🎥 [Common Lisp Tutorial](https://www.youtube.com/watch?v=ymSq4wHrqyU). A pretty comprehensive but quick tour of what the language has to offer. It does not explain macros in great detail, but it's a good foundation for more advanced material.

+ 📖 [Practical Common Lisp](https://gigamonkeys.com/book/). The first half is an introduction to the language, and the second half focuses on applying the concepts to a real-world project (a toy version of an mp3 streaming application). Particularly interesting are [the practical chapters](https://gigamonkeys.com/book/practical-parsing-binary-files.html) that build a library for parsing binary files using macros to great effect. Highly recommended!

+ 📖 [The Common Lisp Cookbook](https://lispcookbook.github.io/cl-cookbook/). This is an awesome reference to start hacking for real. It covers many practical topics (e.g., how to install third-party libraries, how to integrate unit testing libraries, etc.) that are not found in the rest of the books, it is updated with the latest information, and it is offered in various formats.

+ 📖 [On Lisp](http://www.paulgraham.com/onlisp.html). A comprehensive study of advanced Lisp techniques, with bottom-up programming as the unifying theme. It's starting to show its age (particularly in its code samples, which are not always as readable as they could be), but it's still worth reading for its treatment of macros and its applications. 

+ 📖 [Let Over Lambda](https://letoverlambda.com/). If you've fallen in love with the power of macros and want to take your knowledge of them to the next level, this will definitely be your next book. 

## Notes
[^syntactic-abstractions]: Syntactic abstractions are shortcuts to write more concise code, and control how evaluation is done (e.g., [normal, applicative, ...](https://sookocheff.com/post/fp/evaluating-lambda-expressions/)). Most languages come with a fixed predefined set of syntactic abstractions (e.g., the `for value in collection` construct in Python is one such abstraction), but very rarely do they let you create ones of your own, which is why Common Lisp (and other dialects of the Lisp family, like Scheme) is so special.

[^dsl]: [Domain-Specific Languages](https://en.wikipedia.org/wiki/Domain-specific_language) (DSLs) are programming languages created to serve one specific purpose. Common examples include HTML and CSS, but there are many more.

[^macros-vs-funcs]: Though their syntax is quite similar and they look very much like functions, macros are run automatically by the compiler prior to compilation proper. And, unlike functions, they are not fist-class citizens, so you cannot pass them around like any other value in the language.

[^barebones-ast]: A barebones AST refers here to just an [Abstract Syntax Tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree) without any annotations. For example, we'll be able to traverse the structure of the program, and determine that there are identifiers, numbers, strings, etc., but it will not contain information about which identifiers are variables, whether an identifier is a variable declaration or a variable reference, what is the scope of a variable, etc.

[^lisp-hackers]: No, I don't mean hackers as usually portrayed in the media. I mean hackers as in tinkerers, makers, curious people who enjoy discovering how things work. As this [article](https://en.wikipedia.org/wiki/Hacker_culture) puts it: "The hacker culture is a subculture of individuals who enjoy the intellectual challenge of creatively overcoming limitations of software systems to achieve novel and clever outcomes." 

[^macro-expansion]: It is outside the scope of this post, but Common Lisp does provide you with a built-in function `macroexpand-1` to expand macro calls and see what the resulting code would be like during compilation. You can learn more about it in some of the books listed in the **Further Reading** section.

[^ddd]: If you want to know more about this idea, the literature around [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design) (DDD) contains a lot of useful information. Beware that as any other abstraction, DDD has costs and it is not always the right design methodology.
