
class PrimeNumbers {
  constructor(cacheTo) {
    this.cache = []
    // populate cache with the first 1000
    if (cacheTo) {
      for (let i = 0; i <= cacheTo; i++) {
        this.isPrime(i)
      }
    }
  }

  isPrime(n) {
    if (n <= 1) {
      return false
    } else if (n <= 3) {
      return true
    } else if (n % 2 === 0 || n % 3 === 0 || n % 5 === 0) {
      return false
    }
    const cached = this.cache[n]
    if (typeof cached !== `undefined`) {
      return cached === true
    }
    return this.cache[n] = this.compute(n)
  }

  compute(n) {
    let i = 5
    while (i * i <= n) {
      if (n % i === 0 || n % (i + 2) === 0) {
        return false
      }
      i += 6
    }
    return true
  }
}

const primeNumbers = new PrimeNumbers(1000)

module.exports = {
  isPrime(n) {
    return primeNumbers.isPrime(n)
  }
}
