---
title: "Recursion in the Wild"
date: "2020-09-21T00:00:00.000000"
description: "How is recursion used in the real world?"
---

Courses introducing the topic of "recursion" for the first time have fallen into the habit of using rather silly examples, most typically involving the calculation of the factorial or the Fibonacci functions:

```python
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n-1)

def fibonacci(n):
    if n == 0 or n == 1:
        return n
    return fibonacci(n-1) * fibonacci(n-2)
```

The reason why these are silly examples is that they are totally impractical to be used in the real world, as both of them are unnecessarily inefficient (exponentially inefficient in the case of `fibonacci`!), while their iterative versions are easier to grasp and much more efficient:

```python
def factorial(n):
    product = 1
    for i in range(1, n+1):
        product *= i
    return product

def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

Though I know this is done for pedagogical reasons (i.e., to avoid cognitive overload), I believe that students often leave such courses feeling like recursion is just another one of those confusing and complicated techniques that they'll never use in the real world, which is a sad thing because recursion can be a very powerful programming technique when it's properly explained and contextualized.

## A more realistic example
A few weeks ago, I started reading a book I wish I had read when I was at college, as it is a superb introduction to many core topics in computer science and software engineering: [Structure and Interpretation of Computer Programs](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book.html). In one of the sections dealing with data abstraction, I found an example of a real use of recursion that I think might be more interesting for students to see and implement when learning recursion for the first time: _symbolic differentiation._

If you remember differential calculus from high-school or college, you may know that there are various rules to differentiate expressions of various types. For example:

The derivative of a constant is zero:
$$
\frac{\partial c}{\partial x} = 0
$$

The derivative of $y$ with respect to $x$ is zero:
$$
\frac{\partial y}{\partial x} = 0
$$

The derivative of $x$ with respect to $x$ is one:
$$
\frac{\partial x}{\partial x} = 1
$$

What's interesting, however, is that for more complex expressions, the rules for differentiation make natural use of recursion! For example, the rule to differentiate a sum of two expressions can be expressed recursively as:

$$
\frac{\partial f(x) + g(x)}{\partial x} = \frac{\partial f(x)}{\partial x} + \frac{\partial g(x)}{\partial x}
$$

Similarly, the rule to differentiate a product of two expressions can be expressed as:

$$
\frac{\partial f(x)g(x)}{\partial x} = f(x)\frac{\partial g(x)}{\partial x} + g(x)\frac{\partial f(x)}{\partial x}
$$

And so, if we assume some representation for simple algebraic expressions, we can write a very elegant function that performs symbolic differentiation for the cases mentioned above:

```python
def differentiate(expression, variable):
    e = expression # highlight-line
    if e.is_number: # highlight-line
        return Number(0) # highlight-line

    if e.is_variable: # highlight-line
        if e == variable: # highlight-line
            return Number(1) # highlight-line
        return Number(0) # highlight-line

    if e.is_sum:
        return (
            differentiate(e.augend, variable)
            + differentiate(e.addend, variable)
        )

    if e.is_product:
        return (
            differentiate(e.multiplicand, var) * e.multiplier
            + differentiate(e.multiplier, var) * e.multiplicand
        )
    raise ValueError(f"{e} is not a supported expression!")
```

As long as the input expression `expression` is built out of simpler expressions (eventually reaching constants or single variables), the above function will behave correctly since the base cases are handled properly in the highlighted lines, and the recursive cases always solve a smaller instance of the original problem.

Think about how you might implement this function without recursion and you'll see that, even if there's a solution (and there is one, because [every recursive program can be turned into an iterative one](https://stackoverflow.com/questions/11708903/can-every-recursion-be-changed-to-iteration)!), it will not be as elegant or readable as the recursive version.

## A toy implementation
The fact that `differentiate` looks as though it were operating on primitive types is only possible because Python supports overloading of operators for custom types.

For the above code to work, it is necessary to define some classes that implement a hierarchy of expressions (i.e., constants, variables, sums, products), and the corresponding ["dunder"](https://dbader.org/blog/python-dunder-methods) methods to overload mathematical operators:

```python
class Expression:
    @property
    def is_number(self):
        return False

    @property
    def is_variable(self):
        return False
    ...

class Number(Expression):
    def __init__(self, value):
        self.value = value

    @property
    def is_number(self):
        return True

    def __eq__(self, rhs):
        rhs = implicit_cast(rhs)
        if not rhs.is_number:
            return False
        return self.value == rhs.value

    def __add__(self, rhs):
        if self.value == 0:
            return rhs
        rhs = implicit_cast(rhs)
        if rhs.is_number:
            return Number(self.value + rhs.value)
        return Sum(self, rhs)
    ...
```

If you're interested in seeing this in action and studying the whole code in detail, you can clone [this repository](https://github.com/zxul767/pyexpr/) and play with the implementation (e.g., check out and run the code in `tests`).

As the following test demonstrates, the implementation doesn't handle full simplification of the resulting expressions, but you can verify that it otherwise works as expected:

```python
import pytest
from src.expression import Variable

@pytest.fixture
def x():
    return Variable("x")

def test__can_differentiate_sums_and_products_recursively(x):
    result = differentiate((2 * x * x) + x * (x + 1), x)

    # TODO: implement simplification of expressions
    assert result == (2 * x + 2 * x) + (1 + x + x)
```

## Conclusion
Recursion is a powerful technique that should be in the arsenal of any programmer. It is a shame that most introductory courses tend to present only unrealistic examples of where it might be used, because there are several places where its use is completely natural, and could motivate the topic a lot more for students.

We saw one such example in this post, but there are several others, such as the processing of naturally recursive data structures (e.g., syntactic trees of programs, JSON documents, etc.), in computational geometry algorithms, in sorting algorithms (e.g., `quicksort` and `mergesort`), the traversal of hierarchical structures (e.g., routines to "walk" the file system), etc.

## Further Reading
For more examples of natural uses of recursion, check out:
+ [Real-world examples of recursion](https://stackoverflow.com/questions/105838/real-world-examples-of-recursion)
+ [Good examples that actually motivate the study of recursion](https://cseducators.stackexchange.com/questions/4143/what-are-good-examples-that-actually-motivate-the-study-of-recursion)
