//! Sheaf Cohomology Computation

pub struct CohomologyResult {
    pub h0_dim: usize,
    pub h1_dim: usize,
    pub n_vertices: usize,
    pub n_edges: usize,
}

pub struct FastCohomology;

impl FastCohomology {
    pub fn compute(n_vertices: usize, n_edges: usize, n_components: usize) -> CohomologyResult {
        let h0_dim = n_components;

        let h1_dim = if n_edges >= n_vertices {
            n_edges - n_vertices + n_components
        } else {
            0
        };

        CohomologyResult {
            h0_dim,
            h1_dim,
            n_vertices,
            n_edges,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cohomology() {
        let result = FastCohomology::compute(10, 15, 1);
        assert_eq!(result.h0_dim, 1);
        assert_eq!(result.h1_dim, 6);
    }
}
