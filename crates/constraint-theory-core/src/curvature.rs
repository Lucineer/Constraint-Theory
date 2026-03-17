//! Ricci Flow and Curvature Computation

/// Ricci flow evolution state
#[derive(Clone)]
pub struct RicciFlow {
    alpha: f32,
    target_curvature: f32,
}

impl RicciFlow {
    pub fn new(alpha: f32, target_curvature: f32) -> Self {
        Self {
            alpha,
            target_curvature,
        }
    }

    pub fn default() -> Self {
        Self::new(0.1, 0.0)
    }

    pub fn evolve(&mut self, curvatures: &mut [f32], steps: usize) {
        for _ in 0..steps {
            for c in curvatures.iter_mut() {
                *c += self.alpha * (self.target_curvature - *c);
            }
        }
    }
}

pub fn ricci_flow_step(curvature: f32, alpha: f32, target: f32) -> f32 {
    curvature + alpha * (target - curvature)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ricci_flow() {
        let mut rf = RicciFlow::new(0.1, 0.0);
        let mut curvatures = [1.0, 0.5, -0.5];
        rf.evolve(&mut curvatures, 10);

        for &c in &curvatures {
            assert!(c.abs() < 1.0);
        }
    }

    #[test]
    fn test_ricci_flow_step() {
        let c = 1.0;
        let c_new = ricci_flow_step(c, 0.1, 0.0);
        assert_eq!(c_new, 0.9);
    }
}
