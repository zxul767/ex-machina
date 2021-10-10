---
title: "Generating Primes"
date: "2021-04-19T00:00:00.000"
description: "A lazy algorithm for primes generation"
---

In a [previous post](https://zxul767.dev/clean-code-critique), we saw a program that generates prime numbers[^primes] in what seemed to be a rather convoluted manner. In that post, I asserted that the program was hard to understand partly due to lack of documentation on the underlying algorithm. In this post, we will explore in detail that algorithm and how we can better model the underlying core concepts to yield a program that's easier to grasp with minimal documentation.

But first, let's explore a simple yet powerful algorithm that represents the foundation of pretty much all algorithms to generate primes.

## The Sieve of Eratosthenes

The [sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes) is an old algorithm (attributed to the Greek mathematician of the same name) which generates all primes up to $N$[^sieve]. Roughly speaking, it works as follows:

1. Mark $2$ as the first known prime.
2. Create a list of prime candidates, initialized with all positive numbers up to $N$.
3. Take the next known prime which hasn't yet been considered and "cross out" all of its multiples from the list of candidates.
4. Mark the next "uncrossed" number in the candidates list as a known prime.
5. Go to step 3 unless we've reached or gone beyond $N$.
6. Report all "uncrossed" numbers as primes.

If we had to summarize how the sieve works in a nutshell, this pithy phrase might capture its essence:

> $2$ is prime by definition. Assume all other numbers to be prime, until they are proven not to be prime by virtue of being a multiple of the known primes.

Visually, this is how the algorithm operates:

![](./images/sieve.gif)

Here is a very simple (i.e., unoptimized) implementation of this algorithm in Python:

```python
def generate_primes_upto(n):
    is_prime = [True] * (n + 1)
    for candidate in range(2, n + 1):
        if is_prime[candidate]:
            cross_out_multiples_of(candidate, is_prime)
    return collect_primes(is_prime)

def cross_out_multiples_of(prime, is_prime):
    n = len(is_prime)
    multiple = prime + prime
    while multiple < n:
        is_prime[multiple] = False
        multiple += prime

def collect_primes(is_prime):
    primes = []
    for number in range(2, len(is_prime)):
        if is_prime[number]:
            primes.append(number)
    return primes
```

A run of this algorithm with $N=31$ shows us that everything seems to be working as expected:[^test-properly]

```bash
$ generate_primes_upto(31)
>> [2, 3, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31]
```

In this program, the first step is implicitly implemented by initializing all elements in the `is_prime` array to `True`. The third step is then carried out by the `cross_out_multiples_of` function.

To derive the time complexity of this algorithm, notice that the outer loop in `generate_primes_upto` traverses each odd number $n_i \in \{3, 5, ...\}$, but the inner loop is only executed when $n_i$ is prime, crossing out $N/n_i$ multiples. The resulting runtime can be expressed as follows:

$$
\begin{aligned}
T(N) &= \sum_{p_i \le N} \frac{N}{p_i} \\
    &= N \sum_{p_i \le N} \frac{1}{p_i} \\
    &\approx N \ln \ln N
\end{aligned}
$$

This last result comes straight from Euler's proof that [the sum of the reciprocals of the primes](https://en.wikipedia.org/wiki/Divergence_of_the_sum_of_the_reciprocals_of_the_primes) diverges, so the overall running time is $O(N \ln \ln N)$, which is surprisingly fast! Unfortunately, this running time is achieved at the expense of using $O(N)$ space, which can get very costly for large enough $N$[^premature-optimization].

***
**Update**: _In a previous version of this post, we claimed that the algorithm described had time complexity_ $O(N \ln{\sqrt{N}} \cdot \ln \ln \sqrt{N})$ _but there was an error in the derivation. The error has since been corrected to show the correct complexity:_ $O(N \ln^2{N})$
***

Using the core ideas in this algorithm, it is possible to derive another one which only uses $O(\sqrt{N} / \ln\sqrt{N})$ space and generates primes incrementally, allowing us to produce a stream of primes on demand. However, as we'll see later in this post, the algorithm has $O(N \ln^2{N})$ time complexity, which is significantly slower than $O(N \ln \ln N)$ for the basic sieve of Eratosthenes.

Before we get to that, let's see some simple optimizations that we can apply to this algorithm which will also come in handy later on.

## Optimizations

There are at least two basic optimizations we can apply to speed up the simplest version of the sieve of Eratosthenes:

1. We can skip all even numbers since--apart from $2$--all primes are odd.
2. We can stop discarding multiples after reaching $\sqrt{N}$, since every multiple $m \ge \sqrt{N}$ of the form $m = \prod_{i}^{k} p_{s_{i}}$ (where $p_{s_i}$ are primes less than or equal to $\sqrt{N}$) will have already been crossed out by such smaller primes $p_{s_i}$ in earlier iterations.

Applying these optimizations results in updates to the `generate_primes_upto` and `collect_primes` functions:

```python
def generate_primes_upto(n):
    is_prime = [True] * (n + 1)
    limit = math.floor(math.sqrt(n)) # highlight-line
    for candidate in range(3, limit + 1, 2): # highlight-line
        if is_prime[candidate]:
            cross_out_multiples_of(candidate, is_prime)
    return collect_primes(primes)

def collect_primes(is_prime):
    primes = [2] # highlight-line
    for number in range(3, len(is_prime), 2): # highlight-line
        if is_prime[number]:
            primes.append(number)
    return primes
```

We can run a quick ["smoke" test](<https://en.wikipedia.org/wiki/Smoke_testing_(software)>) to ensure we didn't totally break the algorithm:

```bash
$ generate_primes_upto(31)
>> [2, 3, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31]
```

Notice that despite these optimizations, the time complexity hasn't improved dramatically and remains linear--as opposed to $O(\sqrt{N} \ln \ln \sqrt{N})$ as we might naively imagine--due to the final sweep we do in `collect_primes`, but we've removed a lot of redundant computation. This is not reflected in the asymptotic notation, but can be significant in the time taken to run in a real computer. In fact, if you run this modified version, you should notice a measurable performance gain of about 50%, which can be an important difference for many applications.

We can make a few more optimizations by carefully observing how the algorithm works, looking for further redundant computation. Let's work through an example to see this:

Assume $N = 30$, so that $L = \lfloor \sqrt{N} \rfloor = 5$ ($L$ here represents `limit` in the code.) The list of candidates to consider is initially:

```bash
[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]
```

The first prime is, by definition, $2$. By removing its multiples we get:

```bash
[3, _, 5, _, 7, _, 9, __, 11, __, 13, __, 15, __, 17, __, 19, __, 21, __, 23, __, 25]
```

The next prime (i.e., the next "uncrossed" number) is therefore $3$. If we discard its multiples, we get:

```bash
[_, _, 5, _, 7, _, _, __, 11, __, 13, __, __, __, 17, __, 19, __, __, __, 23, __, 25]
```

The next prime is $5$ (and the last number we'll test, as we've reached $L$). Notice that there is no point in trying to discard multiples of $5$ like $10$, $15$ or $20$, since they were already discarded in previous rounds by smaller primes (namely, $2$ and $3$), so only $25$ is left to be discarded:

```bash
[_, _, _, _, 7, _, _, __, 11, __, 13, __, __, __, 17, __, 19, __, __, __, 23, __, __]
```

In general, for a prime $p_i$ we can skip all of its multiples below $p_{i}^2$ as we know for sure that those will have been "crossed out" by smaller primes.

Notice also that when discarding multiples, we're wasting half of the time considering even numbers. For example, assuming $N$ was much bigger and we were to consider numbers above $25$, the list of multiples we'd be crossing out includes even numbers interleaved with odd numbers:

```bash
[*30*, 35, *40*, 45, *50*, 55, *60*, ...]
```

This sequence is an instance of the general sequence $ m = p_{i}^2 + kp_{i} $ (with $k=1,2,\ldots$) which includes both even and odd numbers.

To skip the even numbers, observe that:

$p_{i}^2$ is odd because

$$
\begin{aligned}
p_{i}^2 &= (2i + 1)^2 \\
    &= 2(2i^2 + 2i) + 1 \\
    &= 2q + 1
\end{aligned}
$$

$p_{i}^2 + 2kp_i$ is odd because

$$
\begin{aligned}
p_{i}^2 + 2kp_i &= (2q + 1) + 2k(2i + 1) \\
    &= 2(2ki + k + q) + 1 \\
    &= 2r + 1
\end{aligned}
$$

So the sequence needs to change slightly as follows:

$$
m = p_{i}^2 + 2kp_{i}
$$

This changes the `cross_out_multiples_of` function as follows:

```python
def cross_out_multiples_of(prime, is_prime):
    n = len(is_prime)
    multiple = prime**2 # highlight-line
    while multiple < n:
        is_prime[multiple] = False
        multiple += 2*prime # highlight-line
```

## Primes Ad Infinitum

What if we wanted to generate primes without bound? Can we use ideas from the sieve of Eratosthenes to produce a stream (i.e., an incremental list) of primes using much less space than $O(N)$?

In the sieve of Eratosthenes, we discard multiples of a newly discovered prime all at once, and then forget (for the purpose of crossing out multiples) about that prime forever. However, in an incremental, [lazy](https://en.wikipedia.org/wiki/Lazy_evaluation) algorithm where we do just the minimum amount of work necessary to produce the next prime, we need to keep around a "subset of prime divisors" to discard larger multiples when the next prime is requested.

The good news is that to "pull" prime $p_i$ we only need to keep around primes less than or equal to $\sqrt{p_i}$, since any primes above that would only serve to discard larger integers. And, according to the [prime counting function](https://primes.utm.edu/howmany.html), there are $O(\sqrt{p_i} / ln\sqrt{p_i})$ primes smaller than $\sqrt{p_i}$, so the storage requirement is quite reasonable.

Before sketching out a possible program for this incremental version, let’s review some of the core ideas we'll need:

### Prime Candidates

We need an infinite sequence $X (X_0, X_1, \ldots)$ of candidate primes (the list of all odd numbers is the simplest choice; future refinements might focus on shortlisting this set of candidates.)

### Implicit Primality Test

To generate the next prime, we need to test whether $X_i$ is divisible by smaller primes (as per considerations above, we only need to check prime divisors up to $\sqrt{X_i}$). Even though the sieve of Eratosthenes doesn't talk explicitly about a divisibility test, its crossing out of prime multiples is equivalent to that, and both arise from the fact that _"every integer (except for 0 and 1) is either composite (i.e., the product of smaller primes) or a prime itself."_

### Prime Divisors

The "subset of prime divisors" mentioned earlier would, in reality, be a set of streams of prime multiples. For example, if the current (conceptual) subset were $\{3, 5, 7\}$, the corresponding data structure would be the set of (infinite) streams:

$$
(3^2, 3^2 + 2 \cdot 3, \ldots) \\
(5^2, 5^2 + 2 \cdot 5, \ldots) \\
(7^2, 7^2 + 2 \cdot 7, \ldots)
$$

Testing whether $X_i$ is a prime amounts to verifying that none of the sequences contain $X_i$. Since we will always be testing increasingly larger numbers $X_i$, we don’t ever need to "rewind" in any of the streams. Also, since they are ordered sequences, the amount of numbers to check is always finite in each (i.e., there is no point in checking further elements once we find $M_j > X_i$ where $M$ represents one of the streams.)

To see how the "subset of prime divisors" $S$ grows, we need to remember that for a given number $X_i$, its potential prime divisors are always smaller or equal than $\lfloor \sqrt{X_i} \rfloor$. For example, for $X_i = 27$, all of its divisors greater than $5$ ($= \lfloor \sqrt{27} \rfloor$) contain smaller primes in their prime factorization (e.g., $9 = 3 \cdot 3$), so testing them would be redundant as we’d have figured out that $27$ is not prime when testing divisibility by $3$ earlier.

The above implies that we only need to include a new “prime divisor” in $S$ when we’ve reached a prime candidate $X_i$ such that $\sqrt{X_i}$ is prime (and we can find that out easily since we know all primes less than $X_i$ at that point.) Including it earlier would just lead to redundant tests as explained above, but not including it at that point would lead to false positives. For example, consider the initial subset $S=\{2, 3\}$. When we test $25 (= 5 \cdot 5)$ and don’t include $5$ in $S$, we then run the divisibility test and determine that no prime in $S$ divides $25$, therefore wrongly concluding that it is prime.

### Putting it all together

With a strong grasp of these ideas, we can finally present an implementation that is split into three parts:

- The overall algorithm that runs through the list of candidates and runs a primality test on each, implemented by `PrimeGenerator`.
- The "subset of prime divisors" at any given moment, implemented by `PrimeDivisors`.
- The stream of multiples for a given prime $p_i$ that supports the implicit divisibility test, implemented by `PrimeMultiples`.

```python
from itertools import count

class PrimeGenerator:
    def generate(self):
        self.primes = [2, 3]
        self.prime_divisors = PrimeDivisors(self.primes)

        yield from self.primes
        while True:
            self.primes.append(self._next_prime())
            yield self.primes[-1]

    def _next_prime(self):
        # step=2 to avoid redundant tests of even numbers
        for candidate in count(self.primes[-1] + 2, step=2):
            self._add_new_prime_divisor_if_needed(candidate)
            if not self.prime_divisors.has_divisor_for(candidate):
                return candidate

    def _add_new_prime_divisor_if_needed(self, candidate):
        m = len(self.prime_divisors) - 1
        prime = self.primes[m]
        if candidate == prime**2:
            self.prime_divisors.add(prime)
```

```python
class PrimeDivisors:
    def __init__(self, first_primes):
        # 2 => 4, 6, 8, 10, 12, 14, 16, ...
        # 3 => 9, 15, 21, 27, 33, ...
        # ...
        self.multiples_of_nth_prime = [
            PrimeMultiples(prime) for prime in first_primes
        ]

    def add(self, prime):
        self.multiples_of_nth_prime.append(PrimeMultiples(prime))

    def has_divisor_for(self, prime_candidate):
        return any(
            self.is_divisible_by_nth_prime(prime_candidate, n)
            for n in range(len(self.multiples_of_nth_prime))
        )

    def is_divisible_by_nth_prime(self, candidate, n):
        # candidate % n == 0 is equivalent to implicitly checking 
        # that remainder == 0 in prime + ... + remainder == candidate
        while self.multiples_of_nth_prime[n].head < candidate:
            next(self.multiples_of_nth_prime[n])
        return self.multiples_of_nth_prime[n].head == candidate

    def __len__(self):
        return len(self.multiples_of_nth_prime)
```

```python
class PrimeMultiples:
    def __init__(self, prime):
        self.prime = prime
        # NOTE(optimization): multiples below `prime^2` are covered 
        # by smaller primes
        self.head = self.prime**2

    def __iter__(self):
        return PrimeMultiples(self.prime)

    def __next__(self):
        result = self.head
        self.head += 2*self.prime
        return result
```

To test this implementation, we will need a couple of helper functions:

```python
def take_upto(limit, iterable):
    return list(takewhile(lambda x: x <= limit, iterable))

def generate_primes_upto_incremental(limit):
    return take_upto(limit, PrimeGenerator().generate())
```

We can then verify that it produces the same result as the original sieve:

```bash
$ generate_primes_upto_incremental(31)
>> [2, 3, 5, 7, 11, 13, 17, 19, 23, 25, 29, 31]
```

### Space Complexity

Since this algorithm produces primes one at a time, the only storage we need is that of the set of prime divisors. If we compute primes up to $N$, we need to keep around primes no larger than $\sqrt{N}$, of which there are approximately $\frac{\sqrt{N}}{\ln \sqrt{N}}$ according to the [prime counting function](https://primes.utm.edu/howmany.html).

Each prime divisor requires a constant amount of storage (because their underlying sequences are only virtual as you can see in the `PrimeMultiples` class.) Therefore, the overall space required is $O(\sqrt{N} / \ln \sqrt{N})$[^space-complexity]

### Time Complexity

Analyzing the time complexity is a bit more involved, and a general analysis can quickly get pretty hairy, so we'll try to focus on the worst case only.

Let's define $T(N)$ as the running time of the algorithm when we want to generate primes up to $N$. In `PrimeGenerator._next_prime` we can see that we're traversing the sequence $\{3, 5 \ldots \}$, and testing the primality of each candidate in turn. If we denote with $E(c_i)$ the running time of each of these tests, then we have:

$$
T(N) = \sum_{c_{i} \le N} E(c_i)
$$

$E(c)$ will depend on whether $c$ is prime or composite. When it's composite, the running time will be determined by its prime factorization. For example, if it has small prime factors, this will be detected early on in `PrimeDivisors.has_divisor_for`, short-circuiting the testing by other divisors, resulting in a constant amount of work. The worst case happens when `c` is prime, which forces a test by all prime divisors stored up to that point, resulting in the following runtime:

$$
E(c) = \sum_{p_i \le \sqrt{c}} D(c, p_i)
$$

The term $D(c, p_i)$ represents the time it takes to test divisibility of the candidate prime $c$ by each of the "support" primes $p_i$ stored up to that point (which, by construction, will always be $\le \sqrt{c}$).

Seeing as the computation is done incrementally, the value of $D(c, p_i)$ is really just the marginal work expressed in the following equation:

$$
D(c, p_i) = Q(c, p_i) - Q(c', p_i)
$$

Where $c'$ represents the last odd number (`candidate`) for which `PrimeDivisors.is_divisible_by_nth_prime` was invoked, and $Q(c, p_i)$ represents the time it would take to do the divisility test if the computation wasn't incremental. Due to the minor optimizations we described earlier, $Q(c, p_i)$ is:

$$
\begin{aligned}
Q(c, p_i) &= \frac{1}{2}(\frac{c}{p_i} - p_i) \\
\end{aligned}
$$

The term $\frac{c}{p_i}$ represents the number of items we'd have to cross out without optimizations; the term $p_i$ represents the savings we get when we start crossing out at $p_i^2$; and the division by $2$ accounts for all the even terms we skip in the streams of prime multiples.

Plugging this back into $D(c, p_i)$:

$$
\begin{aligned}
D(c, p_i) &= \frac{1}{2}(\frac{c}{p_i} - p_i) - \frac{1}{2}(\frac{c'}{p_i} - p_i) \\
   &= \frac{1}{2p_i}(c - c')
\end{aligned}
$$

The quantity $c - c'$ could be either $2$ when $c'$ is simply the next odd number after $c$, or it could be the distance between two consecutive primes (remember that the sequence associated with $p_i$ may have stayed at value $c$ after many candidate tests because of the short-circuiting behavior in `PrimeDivisors.has_divisor_for`.)

In the first case, $D(c, p_i)$ reduces to $\frac{1}{p_i}$. The second case is rather complicated because it represents a [prime gap](https://en.wikipedia.org/wiki/Prime_gap), for which there is no known absolute formula but only conjectures and certain bounds under various assumptions. If we use [Cramer's conjecture](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_conjecture), for example, then the gap is $O(\ln^2{c})$.

Plugging all of this back into the inequality for $E(c)$, we get:

$$
\begin{aligned}
E(c) &\le \sum_{p_i \le \sqrt{c}} \frac{\ln^2 c}{2p_i} \\
    &= \frac{1}{2} \ln^2{c} \sum_{p_i \le \sqrt{c}} \frac{1}{p_i} \\
\end{aligned}
$$

Once again, we run into the sum of the reciprocals of the primes which exhibits "ln-ln" growth, so we can reduce $E(c)$ as follows:

$$
E(c) \le \ln^2{c} \cdot \ln \ln \sqrt{c}
$$

We can use this information to derive an upper bound for $T(N)$:

$$
\begin{aligned}
T(N) &= \sum_{c_{i} \le N} E(c_i) \\
    &\le \sum_{c_{i} \le N} \ln^2{c_i} \cdot \ln \ln \sqrt{c_i} \\
    &\le N \ln^2{N} \cdot \ln \ln \sqrt{N}
\end{aligned}
$$

Notice this last bound is simply obtained by assuming that every $c_i = N$

Thus, we have found that the time complexity for this algorithm is $O(N \ln^2{N} \cdot \ln \ln \sqrt{N})$. Notice that given how slowly $\ln \ln \sqrt{N}$ grows, for most practical purposes, the effective complexity of the algorithm is $O(N \ln^2{N})$

Beware, however, that this analysis relies on a conjecture which applies only to the average size of the gap between consecutive primes, and that we have made several worst-case simplifying assumptions in various parts, so the resulting complexity is very likely to be a somewhat loose upper bound.

### Empirical Testing

As with any other algorithm, it is a good idea to run some empirical tests and see whether the results approximately match the predicted runtime.

Keep in mind that big-O notation says nothing about the hidden implementation constants that can make a practical difference between two algorithms in practice. We shouldn't be too surprised if we find an algorithm with $O(N^2)$ complexity running more slowly than one with $O(N)$ for small enough values of $N$. After all, the definition of the big-O notation does say that $f(N) = O(g(N))$ whenever $f(N) \le c g(N)$ for all $N \ge k$ (with integer constants $c$ and $k$).

Empirically testing for $N=10^5, 10^6, 10^7, 10^8$, we observe that the running times increase by a factor that tracks very closely the expected theoretical runtime ratios between successive order of magnitude increases ($T(N_i) / T(N_{i-1})$):

|$N_i$      | $T(N_i)$         | Theoretical Ratio  | Empirical Ratio |
|-----------|------------------|--------------------|-----------------|
|$10^5$     | $23,200,088$     | $18$               | $17$            |
|$10^6$     | $368,880,677$    | $16$               | $16$            |
|$10^7$     | $5,421,348,564$  | $15$               | $20$            |
|$10^8$     | $75,340,457,596$ | $14$               | $20$            |

## Conclusion

We discovered that the usual [space/time trade-off](https://en.wikipedia.org/wiki/Space%E2%80%93time_tradeoff) in computer science manifests very prominently in the generation of prime numbers. With enough memory available, even a very naive algorithm can easily outperform more sophisticated methods.

We also found that sometimes the runtime analysis of an algorithm (particularly one involving mathematical objects) can be quite difficult, and without powerful mathematical tools at our disposal, the best we can hope for is some loose upper bounds. Quite often, however, that's all we need to make a decision, as we're likely to also run empirical tests anyway.

Even though the resulting algorithm had much worse time complexity for generating $N$ primes, it did have the advantage of requiring significantly less memory, and of being suitable for applications where getting the next prime quickly is more important than the overall speed of getting $N$ primes. Under some strong assumptions related to prime gaps, we concluded that the time to get the next prime in this incremental algorithm was $O(\ln^2 p)$ with $p$ being the last prime generated.

## References

- [The sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes)
- [How many primes are there?](https://primes.utm.edu/howmany.html)
- [Divergence of the sums of the reciprocals of the primes](https://en.wikipedia.org/wiki/Divergence_of_the_sum_of_the_reciprocals_of_the_primes)
- [Cramer's Conjecture on Prime Gaps](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_conjecture)

## Notes

[^primes]: A [prime number](https://en.wikipedia.org/wiki/Prime_number) is an integer which has no divisors other than one and itself. They're the building blocks of all other integers, and have many interesting properties.
[^sieve]: Conceptually speaking, the algorithm is capable of producing primes _ad infinitum_, but a direct implementation is infeasible. In this post we'll see how to adapt it to accomplish just that.
[^test-properly]: In an actual implementation, we would have to add tests to cover corner cases, much larger intervals, as well as tests of the properties of the generated sequences. For the purposes of this post, though, some "smoke" tests will suffice.
[^premature-optimization]: In this post we explore an algorithm that decreases the amount of memory required as an intellectual exercise, but bear in mind that, given the increasingly cheaper costs of RAM, in practice the right trade-off might be to simply throw more memory at the problem, especially since the running time of the basic sieve is surprisingly hard to beat.
[^space-complexity]: This is not quite true in the implementation shown here, as we do keep all primes generated in the instance variable `PrimeGenerator.primes`. This amounts to $O(N / \ln N)$ space, which is slightly better than $O(N)$ but much worse than $O(\sqrt{N} / \ln \sqrt{N})$. If we don't know $N$ in advance (or if we truly need an "infinite" stream of primes), this is unavoidable. However, if we do know $N$ in advance, we can tweak the implementation to ensure that no more than $\sqrt{N}$ items are ever stored in `PrimeGenerator.primes`, as that's all we need to guarantee correct generation of all other primes up to $N$.
