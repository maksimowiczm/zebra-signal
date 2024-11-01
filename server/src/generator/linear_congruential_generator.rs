use crate::generator::Generator;
use rand::Rng;

/// A linear congruential generator is a simple algorithm that generates a sequence of pseudo-random numbers.
/// https://en.wikipedia.org/wiki/Linear_congruential_generator
/// If it cycles, it will generate a new state using rand::thread_rng.
#[derive(Copy, Clone)]
pub struct NotRepeatableLinearCongruentialGenerator {
    state: u32,
    increment: u32,
    multiplier: u32,
    modulus: u32,
    counter: u32,
}

impl NotRepeatableLinearCongruentialGenerator {
    pub fn randomize(&mut self) {
        let mut rng = rand::thread_rng();
        self.state = rng.gen_range(0..u32::MAX);
        self.increment = rng.gen_range(0..u32::MAX);

        // Make sure the multiplier is different from the previous one
        let mut multiplier = rng.gen_range(0..u32::MAX);
        while self.multiplier == multiplier {
            multiplier = rng.gen_range(0..u32::MAX);
        }

        self.multiplier = multiplier;
        self.modulus = rng.gen_range(0..u32::MAX);
        self.counter = 0;
    }
}

impl Iterator for NotRepeatableLinearCongruentialGenerator {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        let output = self.state;

        self.counter += 1;

        // If the counter is equal to the modulus, create a new state
        if self.counter == self.modulus {
            self.randomize();
        }

        self.state = (self
            .multiplier
            .wrapping_mul(self.state)
            .wrapping_add(self.increment))
            % self.modulus;

        Some(output)
    }
}

impl Generator for NotRepeatableLinearCongruentialGenerator {
    fn new_random() -> Self {
        let mut generator = Self {
            state: 0,
            increment: 0,
            multiplier: 0,
            modulus: 0,
            counter: 0,
        };

        generator.randomize();

        generator
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_linear_congruential_generator() {
        let mut generator = NotRepeatableLinearCongruentialGenerator {
            state: 0,
            increment: 1,
            multiplier: 1,
            modulus: 3,
            counter: 0,
        };

        assert_eq!(generator.next(), Some(0));
        assert_eq!(generator.next(), Some(1));
        assert_eq!(generator.next(), Some(2));

        assert_ne!(generator.state, 0);
        assert_ne!(generator.increment, 1);
        assert_ne!(generator.multiplier, 1);
        assert_ne!(generator.modulus, 3);
        assert_eq!(generator.counter, 0);
    }
}
