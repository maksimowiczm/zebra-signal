use crate::generator::Generator;

#[derive(Clone)]
pub struct Counter {
    count: u32,
    modulus: u32,
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.count == self.modulus {
            return None;
        }

        let output = self.count;

        self.count += 1;

        Some(output)
    }
}

impl Generator for Counter {
    fn new_random() -> Self {
        Self {
            count: 0,
            modulus: 2,
        }
    }
}
