#[cfg(debug_assertions)]
pub mod counter;
pub mod linear_congruential_generator;

/// The Generator generates random numbers for the session manager
pub trait Generator: Iterator<Item = u32> {
    /// Create a new Generator with random values
    fn new_random() -> Self;
}
